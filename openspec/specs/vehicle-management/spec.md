# vehicle-management Specification

## Purpose

提供車輛資料模型、清單檢視 / 搜尋 / 篩選，以及僅限管理者的新增 / 編輯 / 刪除功能，作為車輛管理 MVP 的核心業務能力。

## Requirements

### Requirement: 車輛資料模型

系統 SHALL 為車輛定義以下欄位：`id` (string, uuid)、`plateNumber` (車牌, string, 必填且唯一)、`brand` (品牌, string)、`model` (型號, string)、`type` (`sedan` | `suv` | `truck` | `van`)、`status` (`available` | `in-use` | `maintenance`)、`year` (number, 1900–當年)、`createdAt` (ISO string)。

#### Scenario: 種子資料載入

- **WHEN** 應用啟動且 mock DB 尚未初始化
- **THEN** 系統植入至少 8 筆涵蓋四種類型、三種狀態的種子車輛資料

### Requirement: 車輛清單檢視

`/vehicles` 頁 SHALL 以 shadcn `Table` 顯示車輛清單，欄位包含車牌、品牌型號、類型、狀態、年份、操作。所有登入者（admin / user）皆可檢視。SHALL 提供以車牌或品牌的關鍵字搜尋與依狀態篩選功能。

#### Scenario: 一般使用者檢視清單

- **WHEN** `role=user` 使用者進入 `/vehicles`
- **THEN** 表格顯示所有車輛，但「新增 / 編輯 / 刪除」按鈕不顯示

#### Scenario: 管理者檢視清單

- **WHEN** `role=admin` 使用者進入 `/vehicles`
- **THEN** 表格右上角顯示「新增車輛」按鈕，每列右側顯示「編輯 / 刪除」操作按鈕

#### Scenario: 關鍵字搜尋

- **WHEN** 使用者在搜尋框輸入車牌片段（如 `ABC`)
- **THEN** 表格僅顯示車牌或品牌包含 `ABC` 的車輛

#### Scenario: 狀態篩選

- **WHEN** 使用者於狀態下拉選單選擇 `maintenance`
- **THEN** 表格僅顯示狀態為維修中的車輛

### Requirement: 新增車輛 (admin only)

管理者 SHALL 能透過 dialog 表單新增車輛。表單以 React Hook Form + zod 驗證；送出後呼叫 `POST /api/vehicles`，成功後關閉 dialog、刷新清單、顯示 toast。車牌重複時顯示欄位錯誤。

#### Scenario: 成功新增

- **WHEN** admin 填寫合法資料並送出
- **THEN** API 回傳 201，清單頂部出現新車輛，toast 顯示「新增成功」

#### Scenario: 欄位驗證失敗

- **WHEN** admin 留空車牌或年份不在合法範圍
- **THEN** 表單阻擋送出並在欄位下方顯示錯誤

#### Scenario: 車牌重複

- **WHEN** admin 送出已存在的車牌
- **THEN** API 回傳 409，表單在車牌欄位顯示「車牌已存在」

#### Scenario: 一般使用者無法觸發

- **WHEN** `role=user` 使用者直接呼叫 `POST /api/vehicles`
- **THEN** API 回傳 403

### Requirement: 編輯車輛 (admin only)

管理者 SHALL 能於清單列點選「編輯」開啟與新增同形之 dialog，預填現有資料；送出呼叫 `PUT /api/vehicles/:id`。

#### Scenario: 成功更新

- **WHEN** admin 修改型號並儲存
- **THEN** 清單對應列即時更新，toast 顯示「更新成功」

#### Scenario: 對應車輛不存在

- **WHEN** admin 嘗試編輯已被他人刪除的車輛
- **THEN** API 回傳 404，前端 toast 顯示錯誤並關閉 dialog、重新整理清單

### Requirement: 刪除車輛 (admin only)

管理者 SHALL 能點選「刪除」按鈕並於 confirm dialog 確認後呼叫 `DELETE /api/vehicles/:id`。刪除後清單該列消失。

#### Scenario: 確認刪除

- **WHEN** admin 點擊刪除並於確認框點選「確認」
- **THEN** API 回傳 204，清單移除該列，toast 顯示「刪除成功」

#### Scenario: 取消刪除

- **WHEN** admin 點擊刪除但於確認框點選「取消」
- **THEN** confirm dialog 關閉，未發出 API 請求

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
