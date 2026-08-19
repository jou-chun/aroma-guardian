const LINE_AUTHORIZE_URL = "https://access.line.me/oauth2/v2.1/authorize";
const LINE_TOKEN_URL = "https://api.line.me/oauth2/v2.1/token";
const LINE_VERIFY_URL = "https://api.line.me/oauth2/v2.1/verify";
const OAUTH_TTL_SECONDS = 10 * 60;
const EXCHANGE_TTL_SECONDS = 2 * 60;
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;
const TIER_DEFAULTS = Object.freeze({
  A: { supportAmount: 100, accessStatus: "active", paymentStatus: "not_required" },
  B: { supportAmount: 200, accessStatus: "active", paymentStatus: "not_required" },
  C: { supportAmount: 500, accessStatus: "payment_required", paymentStatus: "pending" }
});

export default {
  async fetch(request, env) {
    try {
      return await route(request, env);
    } catch (error) {
      console.error("member-api", error instanceof Error ? error.message : error);
      return json({ error: "服務暫時無法使用，請稍後再試。" }, 500, request, env);
    }
  }
};

async function route(request, env) {
  const url = new URL(request.url);

  if (request.method === "OPTIONS" && url.pathname.startsWith("/api/")) {
    if (!isAllowedOrigin(request, env)) return json({ error: "不允許的網站來源。" }, 403, request, env);
    return new Response(null, { status: 204, headers: corsHeaders(request, env) });
  }

  if (request.method === "GET" && url.pathname === "/health") {
    return json({ ok: true, service: "aroma-guardian-member-api" }, 200, request, env);
  }

  if (request.method === "GET" && url.pathname === "/auth/line/start") {
    return startLineLogin(request, env);
  }

  if (request.method === "GET" && url.pathname === "/auth/line/callback") {
    return finishLineLogin(request, env);
  }

  if (url.pathname.startsWith("/api/")) {
    if (!isAllowedOrigin(request, env)) return json({ error: "不允許的網站來源。" }, 403, request, env);
    return routeApi(request, env, url);
  }

  return json({ error: "找不到此功能。" }, 404, request, env);
}

async function routeApi(request, env, url) {
  if (request.method === "POST" && url.pathname === "/api/session/exchange") {
    return exchangeLoginCode(request, env);
  }

  const auth = await authenticate(request, env);
  if (!auth) return json({ error: "登入已失效，請重新使用 LINE 登入。" }, 401, request, env);

  if (request.method === "GET" && url.pathname === "/api/me") {
    return getCurrentUser(request, env, auth);
  }
  if (request.method === "POST" && url.pathname === "/api/logout") {
    return logout(request, env, auth);
  }
  if (request.method === "POST" && url.pathname === "/api/member/link") {
    return requestMemberLink(request, env, auth);
  }

  if (url.pathname.startsWith("/api/admin/")) {
    if (!isAdmin(auth.lineUserId, env)) return json({ error: "沒有管理權限。" }, 403, request, env);
    return routeAdmin(request, env, url, auth);
  }

  return json({ error: "找不到此功能。" }, 404, request, env);
}

async function startLineLogin(request, env) {
  requireLoginConfig(env);
  const now = unixNow();
  const state = randomToken(32);
  const nonce = randomToken(32);
  const verifier = randomToken(64);
  const challenge = await sha256Base64Url(verifier);
  const callbackUrl = new URL("/auth/line/callback", request.url).toString();

  await env.DB.batch([
    env.DB.prepare("DELETE FROM oauth_states WHERE expires_at <= ?").bind(now),
    env.DB.prepare(
      "INSERT INTO oauth_states (state_hash, code_verifier, nonce, expires_at) VALUES (?, ?, ?, ?)"
    ).bind(await secretHash(state, env), verifier, nonce, now + OAUTH_TTL_SECONDS)
  ]);

  const authorizeUrl = new URL(LINE_AUTHORIZE_URL);
  authorizeUrl.search = new URLSearchParams({
    response_type: "code",
    client_id: env.LINE_CHANNEL_ID,
    redirect_uri: callbackUrl,
    state,
    scope: "openid profile",
    nonce,
    code_challenge: challenge,
    code_challenge_method: "S256"
  }).toString();

  return redirect(authorizeUrl.toString());
}

async function finishLineLogin(request, env) {
  requireLoginConfig(env);
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const lineError = url.searchParams.get("error");

  if (lineError) return frontendRedirect(env, { login_error: "cancelled" });
  if (!code || !state) return frontendRedirect(env, { login_error: "invalid_callback" });

  const now = unixNow();
  const stateHash = await secretHash(state, env);
  const saved = await env.DB.prepare(
    "SELECT code_verifier, nonce FROM oauth_states WHERE state_hash = ? AND consumed_at IS NULL AND expires_at > ?"
  ).bind(stateHash, now).first();
  if (!saved) return frontendRedirect(env, { login_error: "expired" });

  const consumed = await env.DB.prepare(
    "UPDATE oauth_states SET consumed_at = ? WHERE state_hash = ? AND consumed_at IS NULL"
  ).bind(now, stateHash).run();
  if (Number(consumed.meta?.changes || 0) !== 1) {
    return frontendRedirect(env, { login_error: "expired" });
  }

  const callbackUrl = new URL("/auth/line/callback", request.url).toString();
  const tokenResponse = await fetch(LINE_TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: callbackUrl,
      client_id: env.LINE_CHANNEL_ID,
      client_secret: env.LINE_CHANNEL_SECRET,
      code_verifier: saved.code_verifier
    })
  });
  const tokenData = await tokenResponse.json().catch(() => ({}));
  if (!tokenResponse.ok || !tokenData.id_token) {
    console.error("LINE token exchange failed", {
      status: tokenResponse.status,
      error: tokenData.error || "unknown_error",
      description: tokenData.error_description || "No description",
      requestId: tokenResponse.headers.get("x-line-request-id") || ""
    });
    return frontendRedirect(env, { login_error: "line_exchange_failed" });
  }

  const verifyResponse = await fetch(LINE_VERIFY_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ id_token: tokenData.id_token, client_id: env.LINE_CHANNEL_ID })
  });
  const identity = await verifyResponse.json().catch(() => ({}));
  if (!verifyResponse.ok || !identity.sub || identity.nonce !== saved.nonce) {
    console.error("LINE ID token verification failed", verifyResponse.status);
    return frontendRedirect(env, { login_error: "identity_failed" });
  }

  const displayName = cleanDisplayName(identity.name);
  await env.DB.prepare(
    `INSERT INTO line_users (line_user_id, display_name, picture_url, created_at, updated_at, last_login_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(line_user_id) DO UPDATE SET
       display_name = excluded.display_name,
       picture_url = excluded.picture_url,
       updated_at = excluded.updated_at,
       last_login_at = excluded.last_login_at`
  ).bind(identity.sub, displayName, safePictureUrl(identity.picture), now, now, now).run();

  const exchangeCode = randomToken(32);
  await env.DB.batch([
    env.DB.prepare("DELETE FROM login_exchange_codes WHERE expires_at <= ? OR consumed_at IS NOT NULL").bind(now),
    env.DB.prepare(
      "INSERT INTO login_exchange_codes (code_hash, line_user_id, expires_at) VALUES (?, ?, ?)"
    ).bind(await secretHash(exchangeCode, env), identity.sub, now + EXCHANGE_TTL_SECONDS)
  ]);

  return frontendRedirect(env, { member_login: "success", code: exchangeCode });
}

async function exchangeLoginCode(request, env) {
  const body = await readJson(request);
  const code = typeof body.code === "string" ? body.code : "";
  if (code.length < 20 || code.length > 200) return json({ error: "登入代碼無效。" }, 400, request, env);

  const now = unixNow();
  const codeHash = await secretHash(code, env);
  const saved = await env.DB.prepare(
    "SELECT line_user_id FROM login_exchange_codes WHERE code_hash = ? AND consumed_at IS NULL AND expires_at > ?"
  ).bind(codeHash, now).first();
  if (!saved) return json({ error: "登入代碼已失效，請重新登入。" }, 401, request, env);

  const consumed = await env.DB.prepare(
    "UPDATE login_exchange_codes SET consumed_at = ? WHERE code_hash = ? AND consumed_at IS NULL"
  ).bind(now, codeHash).run();
  if (Number(consumed.meta?.changes || 0) !== 1) {
    return json({ error: "登入代碼已使用，請重新登入。" }, 401, request, env);
  }

  const sessionToken = randomToken(48);
  await env.DB.batch([
    env.DB.prepare("DELETE FROM sessions WHERE expires_at <= ? OR revoked_at IS NOT NULL").bind(now),
    env.DB.prepare(
      "INSERT INTO sessions (token_hash, line_user_id, created_at, expires_at) VALUES (?, ?, ?, ?)"
    ).bind(await secretHash(sessionToken, env), saved.line_user_id, now, now + SESSION_TTL_SECONDS)
  ]);

  return json({ token: sessionToken, expiresIn: SESSION_TTL_SECONDS }, 200, request, env);
}

async function authenticate(request, env) {
  const authorization = request.headers.get("authorization") || "";
  const match = authorization.match(/^Bearer\s+([A-Za-z0-9_-]{20,200})$/);
  if (!match) return null;
  const now = unixNow();
  const tokenHash = await secretHash(match[1], env);
  const row = await env.DB.prepare(
    `SELECT s.token_hash, s.line_user_id, u.display_name, u.picture_url
     FROM sessions s JOIN line_users u ON u.line_user_id = s.line_user_id
     WHERE s.token_hash = ? AND s.revoked_at IS NULL AND s.expires_at > ?`
  ).bind(tokenHash, now).first();
  if (!row) return null;
  return {
    tokenHash,
    lineUserId: row.line_user_id,
    displayName: row.display_name,
    pictureUrl: row.picture_url
  };
}

async function getCurrentUser(request, env, auth) {
  const member = await env.DB.prepare(
    `SELECT formal_name, support_amount, access_status, payment_status
     FROM members WHERE line_user_id = ? LIMIT 1`
  ).bind(auth.lineUserId).first();
  const pending = member ? null : await env.DB.prepare(
    "SELECT formal_name FROM link_requests WHERE line_user_id = ? AND status = 'pending' LIMIT 1"
  ).bind(auth.lineUserId).first();

  return json({
    profile: {
      displayName: auth.displayName,
      pictureUrl: auth.pictureUrl || null
    },
    membership: publicMembership(member, pending),
    isAdmin: isAdmin(auth.lineUserId, env)
  }, 200, request, env);
}

async function logout(request, env, auth) {
  await env.DB.prepare("UPDATE sessions SET revoked_at = ? WHERE token_hash = ?")
    .bind(unixNow(), auth.tokenHash).run();
  return json({ ok: true }, 200, request, env);
}

async function requestMemberLink(request, env, auth) {
  const body = await readJson(request);
  const formalName = normalizeFormalName(body.formalName);
  if (!formalName) {
    return json({ error: "請輸入 2～40 個字的真實姓名。" }, 400, request, env);
  }

  const linked = await env.DB.prepare("SELECT id FROM members WHERE line_user_id = ? LIMIT 1")
    .bind(auth.lineUserId).first();
  if (linked) return json({ ok: true, state: "already_linked" }, 200, request, env);

  const now = unixNow();
  const pending = await env.DB.prepare(
    "SELECT id FROM link_requests WHERE line_user_id = ? AND status = 'pending' LIMIT 1"
  ).bind(auth.lineUserId).first();
  if (pending) {
    await env.DB.prepare("UPDATE link_requests SET formal_name = ?, created_at = ? WHERE id = ?")
      .bind(formalName, now, pending.id).run();
  } else {
    await env.DB.prepare(
      "INSERT INTO link_requests (line_user_id, formal_name, status, created_at) VALUES (?, ?, 'pending', ?)"
    ).bind(auth.lineUserId, formalName, now).run();
  }

  return json({ ok: true, state: "pending_review" }, 202, request, env);
}

async function routeAdmin(request, env, url, auth) {
  if (request.method === "GET" && url.pathname === "/api/admin/dashboard") {
    const [requests, members] = await Promise.all([
      env.DB.prepare(
        `SELECT r.id, r.formal_name, r.created_at, u.display_name
         FROM link_requests r JOIN line_users u ON u.line_user_id = r.line_user_id
         WHERE r.status = 'pending' ORDER BY r.created_at ASC`
      ).all(),
      env.DB.prepare(
        `SELECT id, source_key, formal_name, tier_code, support_amount, access_status,
                payment_status, line_user_id IS NOT NULL AS is_linked, updated_at
         FROM members ORDER BY formal_name COLLATE NOCASE, id`
      ).all()
    ]);
    return json({
      pendingRequests: requests.results.map(toAdminRequest),
      members: members.results.map(toAdminMember)
    }, 200, request, env);
  }

  if (request.method === "POST" && url.pathname === "/api/admin/members/import") {
    return importMembers(request, env, auth);
  }

  const approvalMatch = url.pathname.match(/^\/api\/admin\/link-requests\/(\d+)\/(approve|reject)$/);
  if (request.method === "POST" && approvalMatch) {
    return reviewLinkRequest(request, env, auth, Number(approvalMatch[1]), approvalMatch[2]);
  }

  const memberMatch = url.pathname.match(/^\/api\/admin\/members\/(\d+)$/);
  if (request.method === "PATCH" && memberMatch) {
    return updateMember(request, env, auth, Number(memberMatch[1]));
  }

  return json({ error: "找不到此管理功能。" }, 404, request, env);
}

async function importMembers(request, env, auth) {
  const body = await readJson(request);
  if (!Array.isArray(body.rows) || body.rows.length < 1 || body.rows.length > 100) {
    return json({ error: "請提供 1～100 筆會員資料。" }, 400, request, env);
  }

  const now = unixNow();
  const statements = [];
  for (let index = 0; index < body.rows.length; index += 1) {
    const row = body.rows[index] || {};
    const formalName = normalizeFormalName(row.formalName);
    const tierCode = normalizeTier(row.tierCode);
    const sourceKey = cleanSourceKey(row.sourceKey || `manual-${now}-${index + 1}`);
    if (!formalName || !tierCode || !sourceKey) {
      return json({ error: `第 ${index + 1} 筆資料格式不正確。` }, 400, request, env);
    }
    const defaults = tierDefaults(tierCode);
    statements.push(env.DB.prepare(
      `INSERT INTO members
        (source_key, formal_name, tier_code, support_amount, access_status, payment_status, note, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(source_key) DO UPDATE SET
         formal_name = excluded.formal_name,
         tier_code = excluded.tier_code,
         support_amount = excluded.support_amount,
         access_status = CASE WHEN members.line_user_id IS NULL THEN excluded.access_status ELSE members.access_status END,
         payment_status = CASE WHEN members.line_user_id IS NULL THEN excluded.payment_status ELSE members.payment_status END,
         note = excluded.note,
         updated_at = excluded.updated_at`
    ).bind(
      sourceKey,
      formalName,
      tierCode,
      defaults.supportAmount,
      defaults.accessStatus,
      defaults.paymentStatus,
      cleanNote(row.note),
      now,
      now
    ));
  }

  await env.DB.batch(statements);
  await audit(env, auth.lineUserId, "members.import", "members", null, { count: statements.length });
  return json({ ok: true, imported: statements.length }, 200, request, env);
}

async function reviewLinkRequest(request, env, auth, requestId, action) {
  const linkRequest = await env.DB.prepare(
    "SELECT id, line_user_id, formal_name FROM link_requests WHERE id = ? AND status = 'pending'"
  ).bind(requestId).first();
  if (!linkRequest) return json({ error: "這筆申請不存在或已處理。" }, 404, request, env);
  const now = unixNow();

  if (action === "reject") {
    await env.DB.prepare(
      "UPDATE link_requests SET status = 'rejected', reviewed_by = ?, reviewed_at = ? WHERE id = ? AND status = 'pending'"
    ).bind(auth.lineUserId, now, requestId).run();
    await audit(env, auth.lineUserId, "link.reject", "link_request", requestId, null);
    return json({ ok: true }, 200, request, env);
  }

  const body = await readJson(request);
  const memberId = Number(body.memberId);
  if (!Number.isInteger(memberId) || memberId < 1) {
    return json({ error: "請選擇要綁定的會員。" }, 400, request, env);
  }
  const member = await env.DB.prepare("SELECT id, line_user_id FROM members WHERE id = ?")
    .bind(memberId).first();
  if (!member) return json({ error: "找不到這位會員。" }, 404, request, env);
  if (member.line_user_id && member.line_user_id !== linkRequest.line_user_id) {
    return json({ error: "這位會員已綁定其他 LINE 帳號。" }, 409, request, env);
  }
  const otherLink = await env.DB.prepare("SELECT id FROM members WHERE line_user_id = ? AND id <> ?")
    .bind(linkRequest.line_user_id, memberId).first();
  if (otherLink) return json({ error: "這個 LINE 帳號已綁定其他會員。" }, 409, request, env);

  await env.DB.batch([
    env.DB.prepare("UPDATE members SET line_user_id = ?, updated_at = ? WHERE id = ?")
      .bind(linkRequest.line_user_id, now, memberId),
    env.DB.prepare(
      `UPDATE link_requests SET status = 'approved', matched_member_id = ?, reviewed_by = ?, reviewed_at = ?
       WHERE id = ? AND status = 'pending'`
    ).bind(memberId, auth.lineUserId, now, requestId),
    env.DB.prepare(
      `UPDATE link_requests SET status = 'rejected', reviewed_by = ?, reviewed_at = ?
       WHERE line_user_id = ? AND id <> ? AND status = 'pending'`
    ).bind(auth.lineUserId, now, linkRequest.line_user_id, requestId)
  ]);
  await audit(env, auth.lineUserId, "link.approve", "member", memberId, { requestId });
  return json({ ok: true }, 200, request, env);
}

async function updateMember(request, env, auth, memberId) {
  const existing = await env.DB.prepare(
    "SELECT tier_code, access_status, payment_status FROM members WHERE id = ?"
  ).bind(memberId).first();
  if (!existing) return json({ error: "找不到這位會員。" }, 404, request, env);

  const body = await readJson(request);
  const tierCode = body.tierCode === undefined ? existing.tier_code : normalizeTier(body.tierCode);
  if (!tierCode) return json({ error: "會員分類不正確。" }, 400, request, env);
  const defaults = tierDefaults(tierCode);
  const tierChanged = tierCode !== existing.tier_code;
  let paymentStatus = body.paymentStatus === undefined
    ? (tierChanged ? defaults.paymentStatus : existing.payment_status)
    : body.paymentStatus;
  let accessStatus = body.accessStatus === undefined
    ? (tierChanged ? defaults.accessStatus : existing.access_status)
    : body.accessStatus;

  if (tierCode === "A" || tierCode === "B") {
    paymentStatus = "not_required";
    if (accessStatus === "payment_required") accessStatus = "active";
  } else {
    if (!new Set(["pending", "paid"]).has(paymentStatus)) {
      return json({ error: "付款狀態不正確。" }, 400, request, env);
    }
    if (paymentStatus === "paid" && accessStatus === "payment_required") accessStatus = "active";
    if (paymentStatus === "pending" && accessStatus === "active") accessStatus = "payment_required";
  }
  if (!new Set(["active", "payment_required", "disabled"]).has(accessStatus)) {
    return json({ error: "開通狀態不正確。" }, 400, request, env);
  }

  await env.DB.prepare(
    `UPDATE members SET tier_code = ?, support_amount = ?, access_status = ?, payment_status = ?, updated_at = ?
     WHERE id = ?`
  ).bind(tierCode, defaults.supportAmount, accessStatus, paymentStatus, unixNow(), memberId).run();
  await audit(env, auth.lineUserId, "member.update", "member", memberId, {
    tierCode,
    accessStatus,
    paymentStatus
  });
  return json({ ok: true }, 200, request, env);
}

async function audit(env, actor, action, targetType, targetId, detail) {
  await env.DB.prepare(
    `INSERT INTO audit_log (actor_line_user_id, action, target_type, target_id, detail_json, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(actor, action, targetType, targetId === null ? null : String(targetId), detail ? JSON.stringify(detail) : null, unixNow()).run();
}

function publicMembership(member, pending) {
  if (!member) {
    return pending
      ? { state: "pending_review", submittedName: pending.formal_name }
      : { state: "link_required" };
  }
  if (member.access_status === "active") {
    return { state: "active", formalName: member.formal_name };
  }
  if (member.access_status === "payment_required") {
    return { state: "payment_required", formalName: member.formal_name, supportAmount: member.support_amount };
  }
  return { state: "disabled", formalName: member.formal_name };
}

function toAdminRequest(row) {
  return {
    id: row.id,
    formalName: row.formal_name,
    lineDisplayName: row.display_name,
    createdAt: row.created_at
  };
}

function toAdminMember(row) {
  return {
    id: row.id,
    sourceKey: row.source_key,
    formalName: row.formal_name,
    tierCode: row.tier_code,
    supportAmount: row.support_amount,
    accessStatus: row.access_status,
    paymentStatus: row.payment_status,
    isLinked: Boolean(row.is_linked),
    updatedAt: row.updated_at
  };
}

function tierDefaults(tierCode) {
  return TIER_DEFAULTS[tierCode] || null;
}

function normalizeTier(value) {
  const tier = String(value || "").trim().toUpperCase();
  return Object.hasOwn(TIER_DEFAULTS, tier) ? tier : null;
}

function normalizeFormalName(value) {
  if (typeof value !== "string") return null;
  const name = value.normalize("NFKC").replace(/\s+/g, " ").trim();
  if (name.length < 2 || name.length > 40 || /[<>\u0000-\u001F\u007F]/u.test(name)) return null;
  return name;
}

function cleanDisplayName(value) {
  if (typeof value !== "string") return "LINE 使用者";
  const name = value.normalize("NFKC").replace(/[\u0000-\u001F\u007F]/gu, "").trim();
  return name.slice(0, 80) || "LINE 使用者";
}

function cleanSourceKey(value) {
  if (typeof value !== "string") return null;
  const key = value.trim();
  return /^[A-Za-z0-9._:-]{1,100}$/.test(key) ? key : null;
}

function cleanNote(value) {
  if (typeof value !== "string") return null;
  const note = value.replace(/[\u0000-\u001F\u007F]/gu, " ").trim();
  return note ? note.slice(0, 500) : null;
}

function safePictureUrl(value) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString().slice(0, 1000) : null;
  } catch {
    return null;
  }
}

function isAdmin(lineUserId, env) {
  return String(env.ADMIN_LINE_USER_IDS || "")
    .split(",")
    .map(value => value.trim())
    .filter(Boolean)
    .includes(lineUserId);
}

function requireLoginConfig(env) {
  for (const name of ["LINE_CHANNEL_ID", "LINE_CHANNEL_SECRET", "SESSION_PEPPER"]) {
    if (!env[name]) throw new Error(`Missing required secret: ${name}`);
  }
}

function frontendRedirect(env, values) {
  const frontend = new URL(env.FRONTEND_PATH || "/", normalizedOrigin(env));
  const params = new URLSearchParams(values);
  frontend.hash = `member-login&${params.toString()}`;
  return redirect(frontend.toString());
}

function redirect(location) {
  return new Response(null, {
    status: 302,
    headers: {
      location,
      "cache-control": "no-store",
      "referrer-policy": "no-referrer",
      "x-content-type-options": "nosniff"
    }
  });
}

function isAllowedOrigin(request, env) {
  const origin = request.headers.get("origin");
  return Boolean(origin && origin === normalizedOrigin(env));
}

function normalizedOrigin(env) {
  return String(env.FRONTEND_ORIGIN || "").replace(/\/$/, "");
}

function corsHeaders(request, env) {
  const headers = new Headers({
    "access-control-allow-methods": "GET,POST,PATCH,OPTIONS",
    "access-control-allow-headers": "authorization,content-type",
    "access-control-max-age": "86400",
    "cache-control": "no-store",
    "content-type": "application/json; charset=utf-8",
    "referrer-policy": "no-referrer",
    "x-content-type-options": "nosniff"
  });
  if (isAllowedOrigin(request, env)) {
    headers.set("access-control-allow-origin", normalizedOrigin(env));
    headers.set("vary", "Origin");
  }
  return headers;
}

function json(value, status, request, env) {
  return new Response(JSON.stringify(value), { status, headers: corsHeaders(request, env) });
}

async function readJson(request) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().startsWith("application/json")) return {};
  return request.json().catch(() => ({}));
}

function unixNow() {
  return Math.floor(Date.now() / 1000);
}

function randomToken(byteLength) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return base64Url(bytes);
}

async function secretHash(value, env) {
  if (!env.SESSION_PEPPER) throw new Error("Missing required secret: SESSION_PEPPER");
  return sha256Base64Url(`${value}.${env.SESSION_PEPPER}`);
}

async function sha256Base64Url(value) {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : value;
  return base64Url(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)));
}

function base64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export const __test = {
  normalizeFormalName,
  normalizeTier,
  publicMembership,
  tierDefaults,
  toAdminMember
};
