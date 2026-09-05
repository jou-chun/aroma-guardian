(() => {
  "use strict";

  const config = window.AROMA_MEMBER_CONFIG || {};
  const apiBaseUrl = String(config.apiBaseUrl || "").replace(/\/$/, "");
  const storageKey = "aromaGuardianMemberSession";
  const button = document.querySelector("#memberButton");
  const overlay = document.querySelector("#memberOverlay");
  let token = sessionStorage.getItem(storageKey) || localStorage.getItem(storageKey) || "";
  let loginError = "";

  if (!button || !overlay) return;

  button.addEventListener("click", () => openMember());
  overlay.addEventListener("click", event => {
    if (event.target.matches("[data-member-close]")) closeMember();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !overlay.classList.contains("hidden")) closeMember();
  });

  const fragment = new URLSearchParams(location.hash.replace(/^#/, "").replace(/^member-login&?/, ""));
  const exchangeCode = fragment.get("code");
  loginError = fragment.get("login_error") || "";
  if (exchangeCode || loginError || location.hash.startsWith("#member-login")) {
    history.replaceState(null, "", `${location.pathname}${location.search}#member`);
    openMember(exchangeCode);
  }

  async function openMember(code = "") {
    code = typeof code === "string" ? code : "";
    overlay.classList.remove("hidden");
    overlay.setAttribute("aria-hidden", "false");
    renderLoading();

    if (!config.enabled || !apiBaseUrl) {
      renderSetupPending();
      return;
    }

    try {
      if (code) await exchange(code);
      if (!token) {
        renderSignedOut();
        return;
      }
      const me = await api("/api/me");
      renderMember(me);
    } catch (error) {
      if (error.status === 401) {
        clearToken();
        renderSignedOut("登入已失效，請重新登入。");
      } else {
        renderSignedOut(error.message || "目前無法連線，請稍後再試。");
      }
    }
  }

  function closeMember() {
    overlay.classList.add("hidden");
    overlay.setAttribute("aria-hidden", "true");
    overlay.replaceChildren();
  }

  function renderShell() {
    overlay.replaceChildren();
    const shade = element("div", "member-shade");
    shade.dataset.memberClose = "";
    const modal = element("section", "member-modal");
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "LINE 會員中心");
    const close = element("button", "member-close", "×");
    close.type = "button";
    close.setAttribute("aria-label", "關閉");
    close.dataset.memberClose = "";
    const content = element("div", "member-content");
    modal.append(close, content);
    overlay.append(shade, modal);
    return content;
  }

  function renderLoading() {
    const content = renderShell();
    content.append(element("div", "member-spinner"));
  }

  function renderSetupPending() {
    const content = renderShell();
    content.append(
      element("div", "member-kicker", "MEMBER ACCESS"),
      element("h2", "", "會員中心準備中"),
      element("p", "member-intro", "LINE 登入介面已完成，目前正在連接安全的會員資料庫。完成後就能從這裡登入與查看開通狀態。"),
      note("會員姓名、付款與分類資料不會存放在這個公開網站。")
    );
  }

  function renderSignedOut(message = "") {
    const content = renderShell();
    content.append(
      element("div", "member-kicker", "MEMBER ACCESS"),
      element("h2", "", "LINE 會員登入"),
      element("p", "member-intro", "用 LINE 確認身分後，即可查看自己的開通狀態。第一次登入會自動比對會員名單中的 LINE 顯示名稱；名稱不同或重複時，才交由管理員核對。")
    );
    if (message || loginError) {
      content.append(element("div", "member-error", message || loginErrorMessage(loginError)));
      loginError = "";
    }
    const actions = element("div", "member-actions");
    const login = element("button", "member-primary", "使用 LINE 登入");
    login.type = "button";
    login.addEventListener("click", () => {
      location.href = `${apiBaseUrl}/auth/line/start`;
    });
    actions.append(login);
    content.append(actions, note("本站只取得 LINE 的基本個人檔案與識別碼，不要求電子郵件。"));
  }

  function renderMember(me) {
    const content = renderShell();
    content.append(element("div", "member-kicker", "MEMBER ACCESS"), element("h2", "", "會員中心"));

    const profile = element("div", "member-profile");
    if (me.profile.pictureUrl) {
      const image = document.createElement("img");
      image.src = me.profile.pictureUrl;
      image.alt = "";
      image.referrerPolicy = "no-referrer";
      profile.append(image);
    }
    const profileText = element("div");
    profileText.append(element("b", "", me.profile.displayName), element("span", "", "已使用 LINE 安全登入"));
    profile.append(profileText);
    content.append(profile);

    const membership = me.membership || { state: "link_required" };
    const status = element("div", "member-status");
    status.dataset.state = membership.state;

    if (membership.state === "active") {
      status.append(
        element("b", "", "會員內容已開通"),
        element("p", "", `${membership.formalName || "會員"}，歡迎回來。你的會員學習內容目前可正常使用。`)
      );
    } else if (membership.state === "payment_required") {
      status.append(
        element("b", "", "等待付款確認"),
        element("p", "", `本次支持費為 NT$${Number(membership.supportAmount || 0).toLocaleString("zh-TW")}。管理員確認後會為你開通。`)
      );
    } else if (membership.state === "pending_review") {
      status.append(
        element("b", "", "LINE 名稱核對中"),
        element("p", "", `系統未能唯一比對「${membership.submittedName || "你的 LINE 顯示名稱"}」，已自動送交管理員核對。`)
      );
    } else if (membership.state === "disabled") {
      status.append(
        element("b", "", "目前尚未開通"),
        element("p", "", "請聯絡管理員確認會員狀態。畫面不會公開顯示你的後台分類原因。")
      );
    } else {
      status.append(
        element("b", "", "正在比對 LINE 名稱"),
        element("p", "", "系統會自動以你的 LINE 顯示名稱比對會員名單；若名稱不同或有同名者，將由管理員協助核對。")
      );
    }
    content.append(status);

    const actions = element("div", "member-actions");
    if (me.isAdmin) {
      const admin = element("button", "member-primary", "管理會員核對");
      admin.type = "button";
      admin.addEventListener("click", openAdmin);
      actions.append(admin);
    }
    const logout = element("button", "member-secondary", "登出會員中心");
    logout.type = "button";
    logout.addEventListener("click", async () => {
      try {
        await api("/api/logout", { method: "POST", body: {} });
      } catch {
        // Local logout still completes if the network is unavailable.
      }
      clearToken();
      renderSignedOut("已安全登出。");
    });
    actions.append(logout);
    content.append(actions, note("畫面只顯示你的開通進度；內部分類與判定原因僅限管理員查看。"));
  }

  async function openAdmin() {
    renderLoading();
    try {
      const dashboard = await api("/api/admin/dashboard");
      renderAdmin(dashboard);
    } catch (error) {
      const content = renderShell();
      content.append(
        element("h2", "", "會員核對暫時無法開啟"),
        element("div", "member-error", error.message || "請稍後再試。")
      );
      const actions = element("div", "member-actions");
      const back = element("button", "member-secondary", "返回會員中心");
      back.type = "button";
      back.addEventListener("click", () => openMember());
      actions.append(back);
      content.append(actions);
    }
  }

  function renderAdmin(dashboard) {
    const content = renderShell();
    content.append(
      element("div", "member-kicker", "ADMIN REVIEW"),
      element("h2", "", "會員核對"),
      element("p", "member-intro", "LINE 顯示名稱完全吻合且名單中只有一人時會自動綁定；這裡只處理名稱不同或重複的例外。")
    );

    const requests = Array.isArray(dashboard.pendingRequests) ? dashboard.pendingRequests : [];
    const members = Array.isArray(dashboard.members) ? dashboard.members : [];
    const summary = element("div", "member-admin-summary");
    summary.append(
      summaryItem(requests.length, "待核對"),
      summaryItem(members.filter(member => member.isLinked).length, "已綁定"),
      summaryItem(members.filter(member => member.accessStatus === "payment_required").length, "待付款")
    );
    content.append(summary);

    const admin = element("div", "member-admin");
    if (!requests.length) {
      admin.append(note("目前沒有等待核對的姓名申請。"));
    } else {
      const availableMembers = members.filter(member => !member.isLinked);
      requests.forEach(request => admin.append(buildReviewCard(request, availableMembers)));
    }

    const waitingPayment = members.filter(member => member.accessStatus === "payment_required");
    if (waitingPayment.length) {
      admin.append(element("h3", "", "等待付款確認"));
      const list = element("div", "member-list");
      waitingPayment.forEach(member => {
        const row = element("div", "member-list-row");
        const text = element("div");
        text.append(
          element("b", "", member.formalName),
          element("span", "", `支持費 NT$${Number(member.supportAmount).toLocaleString("zh-TW")} · ${member.isLinked ? "已綁定 LINE" : "尚未綁定"}`)
        );
        const paid = element("button", "member-mini", "確認已付款");
        paid.type = "button";
        paid.addEventListener("click", () => updatePayment(member.id, paid));
        row.append(text, paid);
        list.append(row);
      });
      admin.append(list);
    }

    content.append(admin);
    const actions = element("div", "member-actions");
    const back = element("button", "member-secondary", "返回會員中心");
    back.type = "button";
    back.addEventListener("click", () => openMember());
    actions.append(back);
    content.append(actions);
  }

  function buildReviewCard(request, members) {
    const card = element("article", "member-admin-card");
    card.append(
      element("h3", "", request.lineDisplayName),
      element("p", "", "系統未找到唯一且尚未綁定的同名會員，請從名單中選擇。")
    );
    const select = document.createElement("select");
    select.setAttribute("aria-label", `選擇 ${request.formalName} 對應的會員`);
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "選擇名單中的對應會員";
    select.append(placeholder);
    members.forEach(member => {
      const option = document.createElement("option");
      option.value = String(member.id);
      option.textContent = `${member.formalName}｜NT$${Number(member.supportAmount).toLocaleString("zh-TW")}`;
      select.append(option);
    });
    card.append(select);
    const actions = element("div", "member-actions");
    const approve = element("button", "member-primary", "核對並綁定");
    approve.type = "button";
    approve.addEventListener("click", () => reviewLink(request.id, "approve", Number(select.value), approve));
    const reject = element("button", "member-secondary", "退回申請");
    reject.type = "button";
    reject.addEventListener("click", () => reviewLink(request.id, "reject", null, reject));
    actions.append(approve, reject);
    card.append(actions);
    return card;
  }

  async function reviewLink(requestId, action, memberId, buttonNode) {
    if (action === "approve" && (!Number.isInteger(memberId) || memberId < 1)) {
      window.alert("請先選擇名單中的對應會員。");
      return;
    }
    buttonNode.disabled = true;
    try {
      await api(`/api/admin/link-requests/${requestId}/${action}`, {
        method: "POST",
        body: action === "approve" ? { memberId } : {}
      });
      await openAdmin();
    } catch (error) {
      window.alert(error.message || "處理失敗，請稍後再試。");
      buttonNode.disabled = false;
    }
  }

  async function updatePayment(memberId, buttonNode) {
    buttonNode.disabled = true;
    try {
      await api(`/api/admin/members/${memberId}`, {
        method: "PATCH",
        body: { paymentStatus: "paid", accessStatus: "active" }
      });
      await openAdmin();
    } catch (error) {
      window.alert(error.message || "處理失敗，請稍後再試。");
      buttonNode.disabled = false;
    }
  }

  function summaryItem(value, label) {
    const item = element("div");
    item.append(element("b", "", String(value)), element("span", "", label));
    return item;
  }

  async function exchange(code) {
    const response = await api("/api/session/exchange", {
      method: "POST",
      body: { code },
      authenticated: false
    });
    token = response.token;
    sessionStorage.setItem(storageKey, token);
  }

  async function api(path, options = {}) {
    const headers = { "content-type": "application/json" };
    if (options.authenticated !== false && token) headers.authorization = `Bearer ${token}`;
    const response = await fetch(`${apiBaseUrl}${path}`, {
      method: options.method || "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: "no-store"
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.error || "目前無法連線，請稍後再試。");
      error.status = response.status;
      throw error;
    }
    return data;
  }

  function clearToken() {
    token = "";
    sessionStorage.removeItem(storageKey);
    localStorage.removeItem(storageKey);
  }

  function element(tagName, className = "", text = "") {
    const node = document.createElement(tagName);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function note(text) {
    return element("div", "member-note", text);
  }

  function loginErrorMessage(code) {
    const messages = {
      cancelled: "你已取消 LINE 登入。",
      expired: "登入時間已超過，請重新登入。",
      invalid_callback: "登入資料不完整，請重新登入。",
      line_exchange_failed: "LINE 登入暫時失敗，請稍後再試。",
      identity_failed: "無法確認 LINE 身分，請重新登入。"
    };
    return messages[code] || "登入未完成，請重新試一次。";
  }
})();
