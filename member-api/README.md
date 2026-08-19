# 馨香守護 LINE 會員後台

這個 Worker 是公開 GitHub Pages 網站的私密會員後台。LINE Channel Secret、登入工作階段、會員姓名、內部分類與判定備註都只存在後台，不會打包進公開網站。

## 已實作的流程

1. 會員按「LINE 會員登入」。
2. Worker 以 OAuth 2.0 Authorization Code、OpenID Connect、`state`、`nonce` 與 PKCE 向 LINE 驗證身分。
3. 第一次登入請會員填寫名單上的真實姓名。
4. 系統只建立「待核對」申請，不會因同名而自動開通。
5. 管理員以指定的 LINE 帳號登入，在會員中心核對 LINE 顯示名稱與名單姓名。
6. 一般會員只會看到「已開通、姓名核對中、等待付款確認、尚未開通」等狀態，不會收到內部分類或判定原因。

## 1. 建立 LINE Login Channel

在 LINE Developers Console 建立 Provider，再建立類型為 Web app 的 LINE Login Channel。

- Scopes：`openid profile`（不需要要求電子郵件）
- Callback URL：`https://你的-worker網址/auth/line/callback`
- 測試完成後將 Channel 發布，否則只有管理員與測試者可登入
- Channel ID 之後存成 Worker secret
- Channel Secret 只存成 Worker secret，請勿貼在聊天、試算表或 GitHub

管理員的 LINE User ID 可在 LINE Developers Console 的「Your user ID」找到，填入 `ADMIN_LINE_USER_IDS`。多人時用逗號分隔。

## 2. 建立 Cloudflare Worker 與 D1

需要 Node.js 與 Cloudflare 帳號。在本資料夾執行：

```bash
npm install
npx wrangler login
npx wrangler d1 create aroma-guardian-members
```

把指令回傳的 `database_id` 填入 `wrangler.jsonc`，再執行：

```bash
npm run db:migrate:remote
npx wrangler secret put LINE_CHANNEL_ID
npx wrangler secret put LINE_CHANNEL_SECRET
npx wrangler secret put SESSION_PEPPER
npx wrangler secret put ADMIN_LINE_USER_IDS
npm run deploy
```

`SESSION_PEPPER` 請使用至少 32 bytes 的隨機字串。所有 secret 都在終端機提示時輸入，不要寫進檔案。

## 3. 連接公開網站

部署完成後，修改網站根目錄的 `member-config.js`：

```js
window.AROMA_MEMBER_CONFIG = Object.freeze({
  apiBaseUrl: "https://你的-worker網址",
  enabled: true
});
```

公開設定中只有 Worker 網址，沒有任何機密或會員資料。

## 4. 匯入會員候選名單

後台匯入端點是 `POST /api/admin/members/import`，一次最多 100 筆。每筆使用穩定且不重複的 `sourceKey`，重複匯入時才會更新原資料而不是新增重複姓名。

```json
{
  "rows": [
    { "sourceKey": "sheet-a-002", "formalName": "範例姓名", "tierCode": "A" },
    { "sourceKey": "sheet-c-018", "formalName": "另一位範例", "tierCode": "C", "note": "待確認付款" }
  ]
}
```

請勿把真正名單存成 JSON、CSV 或 JavaScript 後提交到 GitHub。應由已登入的管理員透過後台 API 匯入，或直接在 Cloudflare D1 的私密環境處理。

## 5. 本機檢查

```bash
npm test
npm run db:migrate:local
npm run dev
```

本機 LINE Callback URL 與正式網址不同；完整 LINE 登入測試時，需要把實際測試用 Callback URL 也加入 LINE Developers Console。

## 安全設計摘要

- `state`、登入交換碼、工作階段權杖存入 D1 前都會加上 pepper 後雜湊。
- LINE 回呼會核對 `state`、PKCE 與 ID token 的 `nonce`。
- 登入交換碼兩分鐘失效且只能使用一次；工作階段預設 30 天。
- API 只允許 `https://jou-chun.github.io` 的跨來源請求。
- 管理端每次操作都會在伺服器再次檢查管理員 LINE User ID，不能只靠隱藏按鈕。
- 姓名核對、付款確認與會員資料異動會保留稽核紀錄。
