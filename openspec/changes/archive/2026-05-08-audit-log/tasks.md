## 1. 型別與 Mock DB 基礎設施

- [x] 1.1 在 `src/types/auditLog.ts` 定義 `AuditLog`、`AuditResource`、`AuditAction`、`AuditLogListResponse` 等共用型別
- [x] 1.2 在 [src/mocks/db.ts](src/mocks/db.ts) 新增 `auditLogs: AuditLog[]` 集合與對應 getter / writer
- [x] 1.3 載入 `mock-db:v1` 時，若缺少 `auditLogs` 欄位自動補 `[]`（backward-compat，不 bump version）
- [x] 1.4 寫入 `auditLogs` 時若超過 1000 筆，FIFO 丟棄最舊紀錄
- [x] 1.5 `__resetMockDb()` / `resetDb()` 一併重置 `auditLogs` 並回填種子

## 2. Mock API：稽核寫入 helper 與 endpoint

- [x] 2.1 新增 `src/mocks/auditLogger.ts`，輸出 `appendAuditLog({ actorId, actorUsername, actorName, resource, resourceId, action, summary, details? })`，內部處理 uuid、ISO 時間戳、寫入 db 與 FIFO；try/catch swallow 失敗（console.warn）
- [x] 2.2 新增 [src/mocks/handlers/auditLogs.ts](src/mocks/handlers/auditLogs.ts)，實作 `GET /api/audit-logs`：401（未附 token）、403（非 admin）、200 含 `items` / `total` / `page` / `pageSize`，依 `createdAt` desc 排序
- [x] 2.3 query 解析：`resource`、`action` 過濾；`page` 預設 1、`pageSize` 預設 20、上限 100（超過自動截斷）
- [x] 2.4 在 [src/mocks/browser.ts](src/mocks/browser.ts) 註冊新 handler（本專案無 `handlers/index.ts`，handlers 由 browser.ts 直接匯入）
- [x] 2.5 在 [src/mocks/seed.ts](src/mocks/seed.ts) 補至少 5 筆涵蓋 vehicle / employee 與 create / update / delete 的種子稽核紀錄，actor 對應 admin

## 3. Mock API：vehicles / employees handler 整合稽核

- [x] 3.1 在 vehicles handler 的 `POST` 成功路徑（201 之前）呼叫 `appendAuditLog`，summary = `新增車輛 ${plateNumber} (${brand} ${model})`
- [x] 3.2 在 vehicles handler 的 `PUT /:id` 成功路徑寫入 update 紀錄，summary 列最多 3 個變更欄位、超過附「…等 N 項」、無變更寫「無欄位變動」
- [x] 3.3 在 vehicles handler 的 `DELETE /:id` 成功路徑（204 之前）寫入 delete 紀錄，summary 用刪除前快照
- [x] 3.4 在 employees handler 套用相同三條規則（create / update / delete）；確認「刪除自己」回 400 的分支不會走到稽核寫入
- [x] 3.5 確認失敗分支（401 / 403 / 404 / 409 / 400）皆**不**呼叫 `appendAuditLog`

## 4. 前端資料層

- [x] 4.1 新增 `src/features/audit-logs/api.ts`：`useAuditLogs({ resource, action, page, pageSize })` query hook，key 為 `['audit-logs', filters]`
- [x] 4.2 透過 [src/lib/api.ts](src/lib/api.ts) 的 `api.get` 呼叫 `/api/audit-logs`，依規範自動帶 token；401 觸發既有 logout flow
- [x] 4.3 為 `resource` / `action` / `page` / `pageSize` 在 hook 內組成 query string

## 5. 前端 UI：頁面與側邊欄入口

- [x] 5.1 新增 `src/features/audit-logs/AuditLogTable.tsx`：shadcn `Table`，欄位「時間 / 操作者 / 資源類型 / 資源 ID / 動作 / 變更摘要」；操作者顯示 `actorName (actorUsername)`
- [x] 5.2 新增 `src/features/audit-logs/AuditLogFilters.tsx`：shadcn `Select` × 2（資源類型、動作），切換時回到第 1 頁
- [x] 5.3 新增 [src/pages/AuditLogsPage.tsx](src/pages/AuditLogsPage.tsx)：組合 filter + table + 分頁按鈕，總筆數顯示「總共 N 筆」；URL query 同步 `page`（檔名沿用既有 `*Page.tsx` pattern）
- [x] 5.4 在 [src/routes/AppRouter.tsx](src/routes/AppRouter.tsx) 註冊 `/audit-logs` 路由，外層 `ProtectedRoute`、內層 `requiredRole="admin"`
- [x] 5.5 在 [src/components/AppLayout.tsx](src/components/AppLayout.tsx) 側邊欄為 admin 增加「操作紀錄」項目（icon 用 `lucide-react` 的 `ScrollText`）

## 6. 收尾：lint、build、手動驗收

- [x] 6.1 跑 `npm run lint`，零警告通過
- [x] 6.2 跑 `npm run build`（會走 `tsc --noEmit && vite build`），確保型別與打包通過
- [ ] 6.3 `npm run dev`：以 `admin/admin123` 登入，新增 / 編輯 / 刪除一筆 vehicle 與 employee，到 `/audit-logs` 確認 3 種動作各產生一筆紀錄、`summary` 文案符合規格、分頁與篩選正常（待使用者手動驗收）
- [ ] 6.4 `npm run dev`：以 `user/user123` 登入，確認側邊欄無「操作紀錄」、直接造訪 `/audit-logs` 被導向 `/dashboard`、`GET /api/audit-logs` 回 403（待使用者手動驗收）
- [ ] 6.5 重新整理頁面確認紀錄保留；於 console 跑 `window.__resetMockDb()` 確認還原回 seed 紀錄（待使用者手動驗收）
