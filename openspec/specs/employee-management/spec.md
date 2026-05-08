# employee-management Specification

## Purpose

提供僅限管理者使用的員工管理能力，涵蓋員工資料模型、權限控制、CRUD 操作與清單檢視 / 搜尋。

## Requirements

### Requirement: 員工資料模型

系統 SHALL 為員工定義以下欄位：`id` (string, uuid)、`employeeNo` (員工編號, string, 唯一)、`name` (姓名)、`email` (e-mail, 唯一)、`department` (部門)、`role` (`admin` | `user`)、`createdAt` (ISO string)。

#### Scenario: 種子資料載入

- **WHEN** 應用啟動且 mock DB 尚未初始化
- **THEN** 系統植入至少 5 筆員工資料，其中至少 1 名 admin 與多名 user

### Requirement: 員工管理頁僅限管理者

`/employees` SHALL 僅允許 `role=admin` 進入；非管理者進入時 SHALL 被路由守衛攔截導回 `/dashboard`。

#### Scenario: 一般使用者被擋下

- **WHEN** `role=user` 使用者開啟 `/employees`
- **THEN** 系統導回 `/dashboard` 並顯示權限不足 toast

#### Scenario: 管理者進入

- **WHEN** `role=admin` 使用者開啟 `/employees`
- **THEN** 員工清單頁正常呈現

### Requirement: 員工 CRUD

管理者 SHALL 能對員工資料執行新增、編輯、刪除：

- 新增：`POST /api/employees`，必填欄位驗證、`employeeNo` 與 `email` 不可重複。
- 編輯：`PUT /api/employees/:id`，預填現有資料。
- 刪除：`DELETE /api/employees/:id`，需 confirm dialog。

#### Scenario: 新增員工

- **WHEN** admin 填妥員工編號、姓名、e-mail、部門、角色並送出
- **THEN** API 回傳 201，清單頂部出現該員工

#### Scenario: e-mail 重複

- **WHEN** admin 嘗試新增使用已存在 e-mail 的員工
- **THEN** API 回傳 409，表單於 e-mail 欄位顯示「電子郵件已存在」

#### Scenario: 編輯角色

- **WHEN** admin 將某員工角色由 `user` 改為 `admin` 並儲存
- **THEN** 清單該列角色標籤更新為「管理者」

#### Scenario: 刪除員工

- **WHEN** admin 點擊刪除並確認
- **THEN** API 回傳 204，清單移除該列

#### Scenario: 刪除自己（防呆）

- **WHEN** admin 嘗試刪除目前登入帳號對應的員工
- **THEN** API 回傳 400，前端 toast 顯示「無法刪除目前登入的帳號」

### Requirement: 員工清單檢視

員工管理頁 SHALL 以 shadcn `Table` 呈現所有員工：員工編號、姓名、e-mail、部門、角色、建立時間、操作；提供姓名 / 員工編號 / e-mail 關鍵字搜尋。

#### Scenario: 搜尋員工

- **WHEN** admin 在搜尋欄輸入「林」
- **THEN** 清單僅顯示姓名包含「林」的員工

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
