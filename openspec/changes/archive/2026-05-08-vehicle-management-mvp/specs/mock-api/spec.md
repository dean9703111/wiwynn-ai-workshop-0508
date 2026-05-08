## ADDED Requirements

### Requirement: MSW Service Worker 啟動

應用 SHALL 在 `import.meta.env.DEV === true` 或 `VITE_ENABLE_MSW=true` 時啟動 MSW，於 `main.tsx` 入口透過 `worker.start({ onUnhandledRequest: 'bypass' })` 註冊；正式編譯 (`npm run build`) 時 SHALL 不打包 MSW handler。

#### Scenario: 開發模式啟動

- **WHEN** 開發者執行 `npm run dev`
- **THEN** 主控台顯示 `[MSW] Mocking enabled.` 訊息，所有 `/api/*` 請求被 MSW 攔截

#### Scenario: 生產環境略過

- **WHEN** 執行 `npm run build` 並提供至實機
- **THEN** 應用未啟動 MSW，`fetch('/api/...')` 走真實網路請求

### Requirement: REST API 端點

MSW SHALL 提供下列端點，回應結構與 HTTP 狀態碼遵循下列契約：

- **Auth**
  - `POST /api/auth/login` — body: `{ username, password }`；200 回 `{ token, user }`，401 回 `{ message }`
  - `POST /api/auth/logout` — 200 回 `{ ok: true }`
- **Dashboard**
  - `GET /api/dashboard/summary` — 200 回 `{ totalVehicles, availableVehicles, totalEmployees, newVehiclesThisMonth }`
  - `GET /api/dashboard/status-distribution` — 200 回 `Array<{ status, count }>`
  - `GET /api/dashboard/type-distribution` — 200 回 `Array<{ type, count }>`
- **Vehicles**
  - `GET /api/vehicles` — 支援 query `?q=&status=`；200 回 `Vehicle[]`
  - `POST /api/vehicles` — 201 回新建 vehicle；403 (非 admin)；409 (車牌重複)
  - `PUT /api/vehicles/:id` — 200 回更新後 vehicle；404 / 409 / 403
  - `DELETE /api/vehicles/:id` — 204；404 / 403
- **Employees**
  - `GET /api/employees` — 支援 `?q=`；200 回 `Employee[]`；403 (非 admin)
  - `POST /api/employees` — 201；403 / 409
  - `PUT /api/employees/:id` — 200；404 / 409 / 403
  - `DELETE /api/employees/:id` — 204；404 / 400 (刪自己) / 403

#### Scenario: 完整登入流程

- **WHEN** 前端呼叫 `POST /api/auth/login` with `admin/admin123`
- **THEN** 回傳 200 與包含 `role: 'admin'` 的 user

#### Scenario: 非管理者建立員工

- **WHEN** 帶有 `role=user` token 的請求送至 `POST /api/employees`
- **THEN** MSW 回傳 403 與 `{ message: 'forbidden' }`

### Requirement: 內存資料庫與持久化

MSW SHALL 在記憶體中以 `Map<id, Entity>` 形式維護 `vehicles` / `employees` / `users` 三個 collection，並 SHALL 透過 `localStorage`（key 前綴 `mock-db:`) 持久化資料，使重新整理後資料保留。SHALL 提供 `resetDb()` 以還原種子資料。

#### Scenario: 持久化資料

- **WHEN** admin 新增一筆車輛後重新整理頁面
- **THEN** 清單仍包含該筆車輛

#### Scenario: 重設資料

- **WHEN** 開發者於主控台執行 `window.__resetMockDb()`
- **THEN** 內存資料與 localStorage 皆還原為原始種子資料

### Requirement: 授權標頭模擬

MSW SHALL 讀取請求 `Authorization: Bearer <token>` 標頭並比對內存的 user role；缺少 token 視為未登入回 401，role 不符回 403。token 內含 user id（格式 `fake-jwt.<userId>`）。

#### Scenario: 缺少 token

- **WHEN** 請求 `GET /api/employees` 未附 Authorization header
- **THEN** 回傳 401 與 `{ message: 'unauthorized' }`
