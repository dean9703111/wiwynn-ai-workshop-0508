## ADDED Requirements

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
