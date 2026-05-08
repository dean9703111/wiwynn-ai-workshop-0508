## Why

組織內部目前缺乏統一的車輛資產管理工具，車輛、駕駛員工資料散落於 Excel 與紙本中，導致檢視、稽核、權限控管困難。本變更導入一個最小可行性 (MVP) 的網頁版車輛管理系統，讓管理者能集中維護車輛與員工資料、一般使用者能查詢車輛現況，作為後續擴充（如保養排程、用車申請）的基礎。

## What Changes

- 新增 React 前端應用作為車輛管理系統的入口（Vite + shadcn/ui + Magic UI）。
- 新增登入頁，支援帳號 / 密碼驗證，並依據角色 (`admin` / `user`) 切換可存取頁面。
- 新增儀表板首頁：上方顯示關鍵數據卡片（總車輛數、可用車輛、員工數、本月新增），下方顯示資料圖表（車輛狀態分佈、車輛類型分佈）。
- 新增車輛管理頁：所有登入者皆可檢視車輛清單；管理者可新增 / 編輯 / 刪除車輛。
- 新增員工管理頁：僅管理者可進入並執行 CRUD 操作；一般使用者進入時導回首頁。
- 引入 MSW (Mock Service Worker) 作為前端開發階段的假後端，提供 `/auth`、`/vehicles`、`/employees`、`/dashboard` 等 REST API。
- **BREAKING**: 不適用（全新專案，無既有行為被破壞）。

## Capabilities

### New Capabilities
- `auth`: 登入 / 登出、Session 持久化、角色 (admin/user) 判斷與路由守衛 (route guard)。
- `dashboard`: 首頁儀表板的關鍵數據卡片與資料圖表呈現。
- `vehicle-management`: 車輛資料的列表、檢視、新增、編輯、刪除（依角色管控寫入權限）。
- `employee-management`: 員工資料的列表、檢視、新增、編輯、刪除（僅 admin 可存取）。
- `mock-api`: 以 MSW 模擬後端 REST API 與內存資料庫，提供穩定可重現的開發資料。

### Modified Capabilities
<!-- 無既有 capability 被修改 -->

## Impact

- **新建程式碼**：`src/` 目錄下新增 `pages/`、`components/`、`features/`、`mocks/`、`lib/`、`routes/` 等模組。
- **相依套件**：新增 `react`, `react-dom`, `react-router-dom`, `@tanstack/react-query`, `zod`, `react-hook-form`, `recharts`, `msw`, `tailwindcss`, `shadcn/ui` 元件、Magic UI 元件、`zustand`（輕量狀態管理）。
- **建置工具**：採用 Vite 作為開發伺服器與 bundler；MSW 透過 service worker 在 dev 模式啟動。
- **既有檔案**：影響 `package.json`、`vite.config.ts`、`tsconfig.json`、`tailwind.config.ts`、`index.html`；不影響現有 `src/skills/echo.js` 等內容。
- **無需後端**：MVP 階段所有資料保存在 MSW 內存中，重新整理頁面後資料保留於 `localStorage`（可選）。
