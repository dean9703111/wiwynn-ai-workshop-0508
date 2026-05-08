## ADDED Requirements

### Requirement: CRUD 寫入動作產生稽核紀錄

`/api/vehicles` 的 `POST`、`PUT /:id`、`DELETE /:id` 在 **成功回應後** SHALL 寫入一筆 `audit-log` 紀錄，欄位 `resource = 'vehicle'`、`resourceId` 為該 vehicle 的 `id`、`actorId` / `actorUsername` / `actorName` 取自當前 token 對應的 user。失敗 (4xx/5xx) SHALL **不**寫入紀錄。

`summary` 欄位的內容規則：
- `create`：`新增車輛 ${plateNumber} (${brand} ${model})`
- `update`：列出本次變更的最多 3 個欄位，格式 `${欄位中文} = ${before} → ${after}`，多個欄位以 `；` 分隔；超過 3 個尾端附 `…等 N 項`。若實際無欄位變動則紀錄 `summary = '無欄位變動'`。
- `delete`：`刪除車輛 ${plateNumber} (${brand} ${model})`，其中 plateNumber / brand / model 取自刪除前的資料。

#### Scenario: 新增車輛產生紀錄

- **WHEN** admin 成功 `POST /api/vehicles` 建立一筆車牌為 `ABC-123` 的 Toyota Camry
- **THEN** 系統產生一筆稽核紀錄，`resource = 'vehicle'`、`action = 'create'`、`summary = '新增車輛 ABC-123 (Toyota Camry)'`

#### Scenario: 編輯車輛產生紀錄

- **WHEN** admin 將 `ABC-123` 的 status 從 `available` 改為 `maintenance` 並成功儲存
- **THEN** 系統產生一筆稽核紀錄，`action = 'update'`、`summary` 包含 `狀態 = available → maintenance`

#### Scenario: 刪除車輛產生紀錄

- **WHEN** admin 成功 `DELETE /api/vehicles/:id` 刪除 `ABC-123`
- **THEN** 系統產生一筆稽核紀錄，`action = 'delete'`、`summary = '刪除車輛 ABC-123 (Toyota Camry)'`

#### Scenario: 失敗請求不寫紀錄

- **WHEN** admin `POST /api/vehicles` 因車牌重複收到 409
- **THEN** 系統不產生稽核紀錄

#### Scenario: 一般使用者觸發 403

- **WHEN** `role=user` 使用者呼叫 `POST /api/vehicles` 收到 403
- **THEN** 系統不產生稽核紀錄
