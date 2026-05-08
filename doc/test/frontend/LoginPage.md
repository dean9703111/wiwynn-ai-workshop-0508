---
description: LoginPage 測試案例
---

> 狀態：初始為 [ ]、完成為 [x]
> 對應原始碼：[src/pages/LoginPage.tsx](../../../src/pages/LoginPage.tsx)
> 測試類型：前端元素、表單驗證、Mock API、權限/狀態、導頁與 Toast

---

## [x] 【前端元素】渲染標題、帳密欄位、登入按鈕與 Demo 帳號提示
**範例輸入**：初次掛載 `<LoginPage />`
**期待輸出**：
- 顯示標題「車輛管理系統」與描述「請輸入您的帳號密碼以登入」
- 出現帳號 Input（label 為「帳號」）、密碼 Input（label 為「密碼」、type=password）
- 顯示「登入」按鈕，初始為 enabled
- 顯示 Demo 帳號提示（admin / admin123、user / user123）

---

## [x] 【表單驗證】帳號為空時提交顯示「請輸入帳號」
**範例輸入**：帳號欄留白，密碼填 `admin123`，按下「登入」
**期待輸出**：
- 畫面顯示錯誤訊息「請輸入帳號」
- 不會發出登入 API 請求

---

## [x] 【表單驗證】密碼為空時提交顯示「請輸入密碼」
**範例輸入**：帳號填 `admin`，密碼欄留白，按下「登入」
**期待輸出**：
- 畫面顯示錯誤訊息「請輸入密碼」
- 不會發出登入 API 請求

---

## [x] 【Mock API】登入成功會呼叫 POST /api/auth/login 並帶上正確 payload
**範例輸入**：帳號 `admin`、密碼 `admin123`，按下「登入」
**期待輸出**：
- `api.post` 以 path `/api/auth/login`、body `{ username: "admin", password: "admin123" }` 被呼叫一次

---

## [x] 【權限/狀態】登入成功會將 user 與 token 寫入 useAuthStore
**範例輸入**：API 回傳 `{ token: "tok-1", user: { id: "u1", name: "Admin", username: "admin", role: "admin" } }`
**期待輸出**：
- `useAuthStore.getState().user` 為回傳的使用者物件
- `useAuthStore.getState().token` 為 `tok-1`

---

## [x] 【導頁與 Toast】登入成功會跳轉到 /dashboard 並顯示歡迎 toast
**範例輸入**：API 成功回傳，使用者顯示名稱為 `Admin`
**期待輸出**：
- `useNavigate` 以 `("/dashboard", { replace: true })` 被呼叫
- `toast.success` 以 `歡迎回來，Admin` 被呼叫

---

## [x] 【Mock API】API 拋出 ApiError 時以錯誤訊息呼叫 toast.error
**範例輸入**：`api.post` reject 為 `new ApiError(401, "帳號或密碼錯誤")`
**期待輸出**：
- `toast.error` 以 `帳號或密碼錯誤` 被呼叫
- 不會 navigate、不會寫入 auth store

---

## [x] 【Mock API】API 拋出非 ApiError 例外時顯示「登入失敗，請稍後再試」
**範例輸入**：`api.post` reject 為 `new Error("network down")`
**期待輸出**：
- `toast.error` 以 `登入失敗，請稍後再試` 被呼叫
- 不會 navigate

---

## [x] 【前端元素】送出期間「登入」按鈕被 disable 並顯示 loading icon
**範例輸入**：填入合法帳密後送出，API 尚未 resolve
**期待輸出**：
- 「登入」按鈕為 disabled
- 按鈕內出現 loading 圖示（class 含 `animate-spin`）

---

## [x] 【前端元素】API 結束（成功或失敗）後按鈕恢復 enabled
**範例輸入**：API resolve 或 reject 完成後
**期待輸出**：
- 「登入」按鈕為 enabled
- 不再顯示 loading 圖示
