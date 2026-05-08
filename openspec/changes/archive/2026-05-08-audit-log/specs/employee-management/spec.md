## ADDED Requirements

### Requirement: CRUD 寫入動作產生稽核紀錄

`/api/employees` 的 `POST`、`PUT /:id`、`DELETE /:id` 在 **成功回應後** SHALL 寫入一筆 `audit-log` 紀錄，欄位 `resource = 'employee'`、`resourceId` 為該 employee 的 `id`、`actorId` / `actorUsername` / `actorName` 取自當前 token 對應的 user。失敗 (4xx/5xx) SHALL **不**寫入紀錄；包含「刪除自己」回 400 的情境。

`summary` 欄位的內容規則：
- `create`：`新增員工 ${employeeNo} (${name})`
- `update`：列出本次變更的最多 3 個欄位，格式 `${欄位中文} = ${before} → ${after}`，多個欄位以 `；` 分隔；超過 3 個尾端附 `…等 N 項`。若實際無欄位變動則紀錄 `summary = '無欄位變動'`。
- `delete`：`刪除員工 ${employeeNo} (${name})`，其中 employeeNo / name 取自刪除前的資料。

#### Scenario: 新增員工產生紀錄

- **WHEN** admin 成功 `POST /api/employees` 建立 employeeNo 為 `E001` 的「王小明」
- **THEN** 系統產生一筆稽核紀錄，`resource = 'employee'`、`action = 'create'`、`summary = '新增員工 E001 (王小明)'`

#### Scenario: 編輯員工產生紀錄

- **WHEN** admin 將 `E001` 的 `email` 從 `a@x.com` 改為 `b@x.com` 並成功儲存
- **THEN** 系統產生一筆稽核紀錄，`action = 'update'`、`summary` 包含 `Email = a@x.com → b@x.com`

#### Scenario: 刪除員工產生紀錄

- **WHEN** admin 成功 `DELETE /api/employees/:id` 刪除 `E001`
- **THEN** 系統產生一筆稽核紀錄，`action = 'delete'`、`summary = '刪除員工 E001 (王小明)'`

#### Scenario: 嘗試刪除自己不寫紀錄

- **WHEN** admin 嘗試 `DELETE /api/employees/:id` 刪除自己對應的員工帳號，收到 400
- **THEN** 系統不產生稽核紀錄

#### Scenario: 一般使用者觸發 403

- **WHEN** `role=user` 使用者呼叫 `POST /api/employees` 收到 403
- **THEN** 系統不產生稽核紀錄
