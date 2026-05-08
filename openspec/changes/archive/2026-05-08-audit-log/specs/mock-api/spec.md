## ADDED Requirements

### Requirement: 稽核紀錄 REST 端點

MSW SHALL 提供 `GET /api/audit-logs`，行為依 `audit-log` capability 規範：
- query 參數：`resource`、`action`、`page`、`pageSize`
- 200 回 `{ items: AuditLog[], total: number, page: number, pageSize: number }`
- 401（未附 token）、403（非 admin）

MSW SHALL **不**提供修改或刪除單筆稽核紀錄的端點。

#### Scenario: admin 取得稽核紀錄列表

- **WHEN** admin 帶有效 token 呼叫 `GET /api/audit-logs`
- **THEN** 回 200，body 為 `{ items, total, page, pageSize }`

#### Scenario: 一般使用者被拒

- **WHEN** `role=user` 使用者呼叫 `GET /api/audit-logs`
- **THEN** 回 403 與 `{ message: 'forbidden' }`

#### Scenario: 不提供修改 / 刪除端點

- **WHEN** 任何 client 呼叫 `PUT /api/audit-logs/:id` 或 `DELETE /api/audit-logs/:id`
- **THEN** MSW 未註冊該路由，請求被視為未處理（或對應到 `onUnhandledRequest`）

### Requirement: 稽核紀錄種子資料

`src/mocks/seed.ts` SHALL 在初始化時為 `auditLogs` 集合植入至少 5 筆涵蓋 `vehicle` / `employee` 兩種資源、`create` / `update` / `delete` 三種動作的歷史紀錄，且 `actorId` 對應到 seed 中已存在的 admin user，使首次進入 `/audit-logs` 頁面即可看到內容。

#### Scenario: 首次載入即有資料

- **WHEN** 使用者第一次啟動應用且 mock DB 尚未持久化
- **THEN** `auditLogs` 集合至少有 5 筆紀錄，且 `total >= 5` 出現在 `/audit-logs` 頁

## MODIFIED Requirements

### Requirement: 內存資料庫與持久化

MSW SHALL 在記憶體中以 `Map<id, Entity>` 形式維護 `vehicles` / `employees` / `users` 三個 collection，並以 `Array<AuditLog>` 形式維護 `auditLogs` collection；全部 SHALL 透過 `localStorage`（key 前綴 `mock-db:`) 持久化資料，使重新整理後資料保留。SHALL 提供 `resetDb()` 以還原種子資料；`auditLogs` 在重設時亦同步清空並回填種子。

讀取既有 `mock-db:v1` 持久化資料時若缺少 `auditLogs` 欄位 SHALL 自動補 `[]`，不要求版本升級。`auditLogs` 累積筆數超過 1000 時 SHALL 以 FIFO 方式丟棄最舊紀錄，避免 `localStorage` 體積超限。

#### Scenario: 持久化資料

- **WHEN** admin 新增一筆車輛後重新整理頁面
- **THEN** 清單仍包含該筆車輛，且該筆車輛對應的稽核紀錄仍可在 `/audit-logs` 看到

#### Scenario: 重設資料

- **WHEN** 開發者於主控台執行 `window.__resetMockDb()`
- **THEN** 內存資料與 localStorage 皆還原為原始種子資料（含 seed 的稽核紀錄）

#### Scenario: 舊版 localStorage 相容

- **WHEN** 應用啟動時 `mock-db:v1` 已存在但無 `auditLogs` 欄位（升級前的資料）
- **THEN** 系統自動補 `auditLogs = []`，現有 vehicles / employees / users 資料保留不動

#### Scenario: 上限丟棄

- **WHEN** `auditLogs` 已累積 1000 筆，admin 再寫入第 1001 筆
- **THEN** 最舊的一筆被丟棄，最新一筆被保留，`auditLogs.length === 1000`
