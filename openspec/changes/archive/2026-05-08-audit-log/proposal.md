## Why

目前 VMS 對車輛、員工的 CRUD 操作沒有任何留痕，管理者無法回溯誰在什麼時候改動了哪筆資料，事後追責、稽核與還原都難以進行。為了讓 admin 在示範與課程情境下能展示完整的稽核能力，需要一條集中、可查詢的操作紀錄。

## What Changes

- 新增 `/audit-logs` 頁面（僅 admin 可見），以表格形式呈現操作者、時間、資源類型、資源 ID、動作、變更摘要，支援基本篩選（資源類型、動作）與分頁。
- MSW 新增 `GET /api/audit-logs`（admin-only，回 401/403）與 in-memory 紀錄儲存；`/api/vehicles`、`/api/employees` 的 create / update / delete handler 在成功後同步寫入一筆稽核紀錄。
- 在 `AppLayout` 側邊欄為 admin 增加「操作紀錄」入口；`AppRouter` 以 `ProtectedRoute requiredRole="admin"` 守衛新路由。
- 種子資料補一批歷史稽核紀錄，方便首次進入頁面就看得到內容。
- **BREAKING**: 不適用——僅新增能力，既有 API 與行為不變。

## Capabilities

### New Capabilities
- `audit-log`：操作稽核日誌的資料模型、查詢 API、admin 專用查看頁面與 UI 行為。

### Modified Capabilities
- `vehicle-management`：CRUD 寫入動作完成後須產生稽核紀錄（不影響既有回應與權限規則）。
- `employee-management`：CRUD 寫入動作完成後須產生稽核紀錄（不影響既有回應與權限規則）。
- `mock-api`：擴增稽核紀錄的 in-memory 儲存、種子資料與 `localStorage` 持久化 schema。

## Impact

- **新增程式碼**：[src/pages/AuditLogs.tsx](src/pages/AuditLogs.tsx)、[src/features/audit-logs/](src/features/audit-logs/)（`api.ts` + 表格元件）、[src/mocks/handlers/auditLogs.ts](src/mocks/handlers/auditLogs.ts)、`src/types/auditLog.ts`。
- **既有檔案異動**：[src/routes/AppRouter.tsx](src/routes/AppRouter.tsx)（新增路由）、[src/components/layout/AppLayout.tsx](src/components/layout/AppLayout.tsx)（admin 側邊欄項目）、[src/mocks/handlers/vehicles.ts](src/mocks/handlers/vehicles.ts)、[src/mocks/handlers/employees.ts](src/mocks/handlers/employees.ts)（CRUD 後寫入稽核）、[src/mocks/db.ts](src/mocks/db.ts)（新增 `auditLogs` 集合與 storage migration）、[src/mocks/seed.ts](src/mocks/seed.ts)（種子紀錄）、[src/mocks/handlers/index.ts](src/mocks/handlers/index.ts)（註冊 handler）。
- **相依套件**：無新增；使用既有的 TanStack Query、shadcn `Table` / `Select` / `Pagination` 元件即可。
- **建置工具**：無變更。
- **後端**：無真實後端，全部由 MSW mock。`mock-db:v1` localStorage 結構新增欄位需在載入時做 backward-compatible 補齊。
