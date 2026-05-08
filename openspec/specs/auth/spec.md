# auth Specification

## Purpose

提供使用者帳號密碼登入、Session 持久化與路由守衛 / 角色控制等驗證授權能力，作為車輛管理 MVP 各受保護頁面的基礎。

## Requirements

### Requirement: 帳號密碼登入

系統 SHALL 提供登入頁，讓使用者輸入帳號與密碼後送出至 `/api/auth/login`。MSW 端 SHALL 比對預先植入的帳號清單（至少 `admin/admin123` 與 `user/user123` 兩組），驗證成功時回傳 `{ token, user: { id, username, name, role } }`，失敗時回傳 401 與錯誤訊息。

#### Scenario: 管理者帳號登入成功

- **WHEN** 使用者輸入 `admin / admin123` 並送出表單
- **THEN** 系統回傳 200，前端將 user 寫入 auth store，並導向 `/dashboard`

#### Scenario: 一般使用者登入成功

- **WHEN** 使用者輸入 `user / user123` 並送出表單
- **THEN** 系統回傳 200，user.role 為 `user`，前端導向 `/dashboard`

#### Scenario: 錯誤帳號密碼

- **WHEN** 使用者輸入不存在的帳號或錯誤密碼
- **THEN** 系統回傳 401，登入頁顯示「帳號或密碼錯誤」並停留在登入頁

#### Scenario: 必填欄位驗證

- **WHEN** 使用者未輸入帳號或密碼即送出
- **THEN** 表單以 zod schema 阻擋送出，並在欄位下方顯示錯誤訊息

### Requirement: Session 持久化

系統 SHALL 使用 `zustand` 配合 `persist` middleware，把登入後的 `user` 物件保存於 `localStorage`，使重新整理頁面後仍維持登入狀態。

#### Scenario: 重新整理保留登入

- **WHEN** 使用者已登入並重新整理瀏覽器
- **THEN** 應用啟動時自 `localStorage` 還原 user，仍位於原本頁面或 `/dashboard`

#### Scenario: 登出清除 session

- **WHEN** 使用者點選「登出」
- **THEN** auth store 清空、`localStorage` 對應 key 移除，並導回 `/login`

### Requirement: 路由守衛 (Route Guard) 與角色控制

系統 SHALL 實作 `<ProtectedRoute requiredRole?>` 元件包裹受保護頁面：未登入者導向 `/login`；登入但角色不足者導向 `/dashboard` 並顯示 toast 提示「您沒有權限存取此頁面」。

#### Scenario: 未登入存取受保護頁

- **WHEN** 未登入使用者輸入網址 `/vehicles`
- **THEN** 系統導向 `/login`

#### Scenario: 一般使用者存取員工管理

- **WHEN** `role=user` 使用者輸入網址 `/employees`
- **THEN** 系統導回 `/dashboard` 並顯示權限不足的 toast

#### Scenario: 管理者存取所有頁面

- **WHEN** `role=admin` 使用者依序存取 `/dashboard`、`/vehicles`、`/employees`
- **THEN** 三個頁面皆可正常顯示
