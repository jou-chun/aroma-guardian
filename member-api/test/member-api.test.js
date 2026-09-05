import test from "node:test";
import assert from "node:assert/strict";
import { __test } from "../src/index.js";

test("會員分類預設金額與開通邏輯正確", () => {
  assert.deepEqual(__test.tierDefaults("LEMON"), {
    supportAmount: 300,
    accessStatus: "payment_required",
    paymentStatus: "pending"
  });
  assert.deepEqual(__test.tierDefaults("FRANKINCENSE"), {
    supportAmount: 100,
    accessStatus: "payment_required",
    paymentStatus: "pending"
  });
});

test("一般會員取得的資料不包含後台分類或分類理由", () => {
  const result = __test.publicMembership({
    formal_name: "王小明",
    support_amount: 100,
    access_status: "active",
    payment_status: "not_required",
    tier_code: "A",
    note: "持續購買"
  }, null);

  assert.deepEqual(result, {
    state: "active",
    formalName: "王小明"
  });
  assert.equal("tierCode" in result, false);
  assert.equal("tier_code" in result, false);
  assert.equal("note" in result, false);
});

test("尚未綁定與待審核狀態只回傳必要資訊", () => {
  assert.deepEqual(__test.publicMembership(null, null), { state: "link_required" });
  assert.deepEqual(__test.publicMembership(null, { formal_name: "林小香" }), {
    state: "pending_review",
    submittedName: "林小香"
  });
});

test("姓名輸入會正規化並拒絕危險或異常內容", () => {
  assert.equal(__test.normalizeFormalName("  陳  柔君 "), "陳 柔君");
  assert.equal(__test.normalizeFormalName("<script>"), null);
  assert.equal(__test.normalizeFormalName("陳"), null);
  assert.equal(__test.normalizeFormalName("a".repeat(41)), null);
});

test("只有有效的後台分類代碼會被接受", () => {
  assert.equal(__test.normalizeTier("lemon"), "LEMON");
  assert.equal(__test.normalizeTier("檸檬會員"), "LEMON");
  assert.equal(__test.normalizeTier("乳香會員"), "FRANKINCENSE");
  assert.equal(__test.normalizeTier("B"), "FRANKINCENSE");
  assert.equal(__test.normalizeTier("VIP"), null);
});

test("只有唯一且尚未綁定的 LINE 名稱可以自動綁定", () => {
  assert.equal(__test.canAutoLinkCandidates([{ id: 1, line_user_id: null }]), true);
  assert.equal(__test.canAutoLinkCandidates([{ id: 1, line_user_id: "U123" }]), false);
  assert.equal(__test.canAutoLinkCandidates([
    { id: 1, line_user_id: null },
    { id: 2, line_user_id: null }
  ]), false);
  assert.equal(__test.canAutoLinkCandidates([]), false);
});

test("LINE 顯示名稱正規化後仍採完整名稱比對", () => {
  assert.equal(__test.normalizeLineDisplayName("  小香🌿  "), "小香🌿");
  assert.equal(__test.normalizeLineDisplayName("ＡＢＣ"), "ABC");
  assert.equal(__test.normalizeLineDisplayName(""), null);
});

test("公開網站程式不含後台分類欄位或分類理由", async () => {
  const { readFile } = await import("node:fs/promises");
  const publicScript = await readFile(new URL("../../member.js", import.meta.url), "utf8");
  for (const privateTerm of ["tierCode", "tier_code", "持續購買", "加入後沒有購買", "群組觀看"]) {
    assert.equal(publicScript.includes(privateTerm), false, `公開程式不應包含：${privateTerm}`);
  }
});
