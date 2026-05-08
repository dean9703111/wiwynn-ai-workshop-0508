## Context

VMS 既有的 vehicles / employees handler 各自獨立完成 CRUD，沒有任何共用的 hook 點可記錄變更。目前 mock DB 以 `Map<id, Entity>` 結構維護三個 collection，並透過 `mock-db:v1` localStorage key 持久化。新增稽核能力需要：

1. 一個跨資源的紀錄寫入點（vehicles / employees handler 都要呼叫）。
2. 一個獨立的查詢端點與 admin-only 頁面。
3. 不破壞現有 storage migration 與 `__resetMockDb()` 行為。

## Goals / Non-Goals

**Goals:**
- 所有 vehicle / employee 的 create / update / delete **成功後**都會產生一筆稽核紀錄；失敗（4xx/5xx）不寫入。
- admin 在 `/audit-logs` 可以分頁、依資源類型 / 動作篩選查看歷史紀錄。
- 紀錄本身在 mock DB 是 immutable，UI 不提供刪改入口。
- 既有資料不會因為 schema 升級而消失（缺欄位時自動補空陣列）。

**Non-Goals:**
- 不做匯出 (CSV/JSON)、全文搜尋、跨欄位 diff 視覺化（這些後續可再開 change）。
- 不做即時推播或長輪詢；admin 重新整理或切頁面才更新。
- 不為 auth (login/logout) 寫稽核紀錄——本次僅涵蓋業務資源。
- 不調整既有 vehicles / employees 的 API 回應結構。

## Decisions

### 1. 寫入位置：handler 內部直接呼叫 `appendAuditLog()`，不用 middleware

選擇在 vehicles / employees 各自的 handler 成功路徑末尾（return response 前）呼叫共用的 `appendAuditLog()` helper。

- **替代 A — MSW middleware / 全域 hook**：MSW 沒有正式的「success-only middleware」概念；要靠 wrap response 介入會把每個 handler 都改成另一種寫法，反而比直接呼叫 helper 還重。
- **替代 B — 在 `db.ts` 的 mutation method 裡寫**：mock DB 不知道 actor（誰在操作），actor 來自 token，是 handler 才能拿到。把這層責任下推會讓 db 變得依賴 request context。
- **採行**：handler 拿到 actor 後直接呼叫 `appendAuditLog({ actorId, actorUsername, resource, resourceId, action, summary })`。helper 內部封裝 id 生成 / 時間戳 / 寫入 db。

### 2. 變更摘要 (`summary`) 格式：human-readable 字串而非結構化 diff

`summary` 設計成「品牌型號 = Toyota Camry → Toyota Corolla」這種半結構化字串，create/delete 則只記錄一個關鍵識別欄位（車牌、employeeNo）。

- **替代 — 結構化 `changes: Array<{ field, before, after }>`**：UI 視覺化 diff 比較好，但本次目標只是讓 admin 看得到「誰做了什麼」，列表頁要塞太多欄位反而難讀；mock DB 也沒有實際比對 before/after 的需求驅動。
- **採行**：handler 在 update 時自己組字串（最多列 3 個變更欄位，多的以「…等 N 項」省略），列表頁直接顯示。後續若要升級可加 `details` JSON 欄位向後相容。

### 3. 資料儲存：複用現有 `mock-db:v1` 的同一個 storage entry，新增 `auditLogs` 集合

`db.ts` 內現有結構大致是 `{ vehicles, employees, users }`；新增 `auditLogs: AuditLog[]`。載入時若舊資料缺此欄位，自動補 `[]`，不 bump version。

- **替代 — 用獨立 `mock-db:audit:v1` key**：可以隔離但會讓 `__resetMockDb()` 要清兩個 key，且大小寫不一致；本次資料量小（mock 環境），不必拆。
- **採行**：同 key、同 version，靠 `??= []` 做 backward-compat。

### 4. 查詢分頁：query string `page` + `pageSize`，server side 切片

`GET /api/audit-logs?resource=&action=&page=1&pageSize=20`，回 `{ items, total, page, pageSize }`。

- **替代 — 全部回前端再切**：紀錄會無上限累積（mock 持久化在 localStorage，重設前一直疊加），讓前端切會在 demo 期間越來越慢。
- **採行**：handler 端做 filter + slice，回 total 給前端組分頁元件。預設 `pageSize=20`、上限 100。

### 5. 路由與 UI 入口：複用既有 `ProtectedRoute requiredRole="admin"` 與 `AppLayout` 側邊欄

不為稽核頁設計新的 layout。側邊欄項目根據 `useAuthStore.user.role === 'admin'` 條件顯示，與現有 `/employees` 入口同模式。

## Risks / Trade-offs

- **[Risk] 稽核紀錄與業務寫入非原子**：若 `appendAuditLog()` 拋錯，可能業務資料已寫入但稽核漏記。Mitigation：helper 內部包 try/catch 並 swallow 寫入錯誤（只 console.warn），確保不影響業務回應；mock 情境風險可接受。
- **[Risk] localStorage 體積上限**：紀錄沒有 retention，長期 demo 可能撐爆 localStorage（~5MB）。Mitigation：`appendAuditLog()` 內保留最新 1000 筆，超過自動 FIFO 丟棄；於 `__resetMockDb()` 時一併清空。
- **[Trade-off] `summary` 字串失去結構**：未來想做欄位級 diff 視覺化要回頭改 schema。Mitigation：保留 `details?: Record<string, unknown>` 預留欄位（先不填）。
- **[Trade-off] 不為 auth 寫稽核**：login/logout 對管理者也是有用的訊號，但牽涉 token 模型且非本次目標。後續可在 `auth` capability 開另一個 change。

## Migration Plan

不適用——純加法。第一次載入舊 `mock-db:v1` 時 `auditLogs` 補 `[]`；之後每次寫入正常累積。Rollback 只需把 audit handler 從 `handlers/index.ts` 取消註冊、刪除 `auditLogs` collection 引用，舊資料殘留不影響其他功能。

## Open Questions

- **時間排序**：預設 `createdAt desc` 是否需提供切換？目前先固定 desc，等使用反饋。
- **Actor 顯示**：要顯示 `username` 還是 `name`（admin 帳號的 `name` 是「系統管理員」）？傾向同時存 `actorUsername` 與 `actorName`，UI 顯示 `name (username)`，到 spec 階段再 lock。
