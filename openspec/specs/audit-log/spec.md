# audit-log Specification

## Purpose

提供管理者可檢視的稽核紀錄能力：對 vehicle 與 employee 的 CRUD 寫入動作（create / update / delete）成功後，系統 SHALL 寫入一筆不可變稽核紀錄，admin 可透過專屬頁面與後端端點以資源類型 / 動作篩選並分頁查詢。一般使用者無權限存取。

## Requirements

### Requirement: 稽核紀錄資料模型

系統 SHALL 為每筆稽核紀錄定義以下欄位：`id` (string, uuid)、`createdAt` (ISO string)、`actorId` (string, 對應 user id)、`actorUsername` (string)、`actorName` (string)、`resource` (`vehicle` | `employee`)、`resourceId` (string)、`action` (`create` | `update` | `delete`)、`summary` (string，最長 200 字)、`details` (`Record<string, unknown>` 或 undefined，預留未來欄位級 diff 用)。紀錄一旦寫入 SHALL 為不可變 (immutable)，系統不提供修改與刪除單筆紀錄的 API。

#### Scenario: 紀錄欄位完整性

- **WHEN** 後端寫入一筆 vehicle create 稽核紀錄
- **THEN** 紀錄包含合法 uuid、ISO 時間戳、actor 三欄、resource = `vehicle`、action = `create`、非空 `summary`

#### Scenario: 紀錄不可變

- **WHEN** 任何 client 嘗試呼叫 `PUT /api/audit-logs/:id` 或 `DELETE /api/audit-logs/:id`
- **THEN** 系統不提供該端點，回 404

### Requirement: 稽核紀錄查詢端點 (admin only)

系統 SHALL 提供 `GET /api/audit-logs`，僅 `role=admin` 可呼叫。支援 query：
- `resource` (optional, `vehicle` | `employee`)
- `action` (optional, `create` | `update` | `delete`)
- `page` (optional, integer ≥ 1, default 1)
- `pageSize` (optional, integer 1–100, default 20)

回應 200 `{ items: AuditLog[], total: number, page: number, pageSize: number }`，`items` 依 `createdAt` 由新到舊排序。非 admin 回 403；未登入回 401。

#### Scenario: admin 查詢預設第一頁

- **WHEN** admin 呼叫 `GET /api/audit-logs`
- **THEN** 回 200，`items.length ≤ 20`、`page = 1`、`pageSize = 20`、`total` 為紀錄總數，且 `items[0].createdAt >= items[1].createdAt`

#### Scenario: 依資源類型篩選

- **WHEN** admin 呼叫 `GET /api/audit-logs?resource=vehicle`
- **THEN** 回 200，`items` 內所有紀錄 `resource === 'vehicle'`

#### Scenario: 依動作篩選並分頁

- **WHEN** admin 呼叫 `GET /api/audit-logs?action=delete&page=2&pageSize=10`
- **THEN** 回 200，`page = 2`、`pageSize = 10`、`items.length ≤ 10`，所有紀錄 `action === 'delete'`

#### Scenario: pageSize 超過上限

- **WHEN** admin 呼叫 `GET /api/audit-logs?pageSize=500`
- **THEN** 系統將 `pageSize` 截斷為 100 並回 200

#### Scenario: 一般使用者查詢

- **WHEN** `role=user` 使用者呼叫 `GET /api/audit-logs`
- **THEN** 回 403 與 `{ message: 'forbidden' }`

#### Scenario: 未登入查詢

- **WHEN** 未附 `Authorization` header 呼叫 `GET /api/audit-logs`
- **THEN** 回 401 與 `{ message: 'unauthorized' }`

### Requirement: 稽核紀錄頁面 (admin only)

`/audit-logs` 頁 SHALL 僅 admin 可進入，未登入導向 `/login`、登入但非 admin 導向 `/dashboard`（沿用既有 `ProtectedRoute requiredRole="admin"`）。頁面 SHALL 以 shadcn `Table` 顯示稽核紀錄，欄位包含「時間」、「操作者（顯示為 `actorName (actorUsername)`）」、「資源類型」、「資源 ID」、「動作」、「變更摘要」。SHALL 在頁面頂部提供「資源類型」與「動作」兩個下拉篩選器，與 shadcn `Pagination` 元件，每頁固定 20 筆。

#### Scenario: admin 進入頁面

- **WHEN** admin 直接造訪 `/audit-logs`
- **THEN** 顯示稽核紀錄表格、預設第一頁、依時間 desc 排序，並顯示「總共 N 筆」字樣

#### Scenario: 一般使用者試圖造訪

- **WHEN** `role=user` 使用者輸入網址 `/audit-logs`
- **THEN** 路由守衛將其導向 `/dashboard`

#### Scenario: 切換動作篩選

- **WHEN** admin 在「動作」下拉選擇 `delete`
- **THEN** 表格僅顯示 delete 紀錄，分頁元件依新的 `total` 重算頁數，且當前頁回到 1

#### Scenario: 換頁

- **WHEN** admin 在分頁元件點選「下一頁」
- **THEN** 表格更新為下一頁紀錄，URL query 同步更新為 `?page=2`

### Requirement: 側邊欄入口 (admin only)

`AppLayout` 側邊欄 SHALL 在登入者為 admin 時顯示「操作紀錄」項目，連結至 `/audit-logs`，使用 `lucide-react` 圖示（如 `ScrollText`）。非 admin 不顯示此項目。

#### Scenario: admin 登入後

- **WHEN** admin 登入並進入任何登入後頁面
- **THEN** 側邊欄包含「操作紀錄」項目，點擊後路由切換到 `/audit-logs`

#### Scenario: 一般使用者登入後

- **WHEN** `role=user` 使用者登入
- **THEN** 側邊欄不顯示「操作紀錄」項目
