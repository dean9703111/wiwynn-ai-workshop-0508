## ADDED Requirements

### Requirement: 關鍵數據卡片

儀表板首頁上方 SHALL 顯示四張關鍵數據卡片：總車輛數、可用車輛數 (`status=available`)、員工總數、本月新增車輛數。資料來源為 `GET /api/dashboard/summary`。卡片數值 SHALL 以 Magic UI `NumberTicker` 動畫展示。

#### Scenario: 卡片正確呈現

- **WHEN** 使用者進入 `/dashboard`
- **THEN** 頁面上方並排顯示四張卡片，數字符合 mock 後端回傳的 summary 內容

#### Scenario: 一般使用者亦可看見卡片

- **WHEN** `role=user` 使用者進入 `/dashboard`
- **THEN** 四張卡片照常顯示（dashboard 不分角色）

#### Scenario: 載入狀態

- **WHEN** API 尚未回應
- **THEN** 每張卡片以 shadcn `Skeleton` 元件顯示骨架載入畫面

### Requirement: 資料圖表

儀表板下半部 SHALL 包含兩張圖表：

1. 車輛狀態分佈 (PieChart) — 來源 `GET /api/dashboard/status-distribution`
2. 車輛類型分佈 (BarChart) — 來源 `GET /api/dashboard/type-distribution`

兩張圖表 SHALL 使用 Recharts 並包在 shadcn `Card` 中，圖表色票對應狀態 / 類型一致。

#### Scenario: 圖表顯示資料

- **WHEN** API 回傳資料
- **THEN** PieChart 顯示 `available` / `in-use` / `maintenance` 三種狀態的佔比；BarChart 顯示各類型 (sedan / suv / truck / van) 的車輛數

#### Scenario: 無資料時的空狀態

- **WHEN** 後端回傳空陣列
- **THEN** 圖表區塊顯示「目前沒有可顯示的資料」訊息，而非崩潰

### Requirement: 響應式佈局

儀表板 SHALL 在桌機 (>= 1024px) 以四欄卡片 + 兩欄圖表呈現；在平板 (>= 640px) 以二欄卡片 + 一欄圖表；在手機 (< 640px) 以單欄堆疊。

#### Scenario: 桌機檢視

- **WHEN** 視窗寬度 >= 1024px
- **THEN** 四張卡片在同一橫列，圖表並排為兩欄

#### Scenario: 手機檢視

- **WHEN** 視窗寬度 < 640px
- **THEN** 卡片與圖表皆單欄垂直堆疊
