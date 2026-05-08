## Context

本 repo 目前是一個 AI workshop 練習專案，僅有 `src/skills/echo.js` 一支簡單的範例與其單元測試，尚未建立前端框架。本次變更要在同一個 repo 中加入一個獨立的車輛管理系統前端 (MVP)，作為後續演進的起點。

關鍵限制：

- **無真實後端**：必須以 MSW 模擬 REST API；資料存活週期僅限瀏覽器 session（可選擇 `localStorage` 持久化以利展示）。
- **角色僅二種**：`admin` 與 `user`，不引入更複雜的權限矩陣。
- **MVP 為先**：拒絕「為將來而設計」的過度抽象；先確保四個頁面的關鍵流程可運作。
- **UI 一致性**：採用 shadcn/ui (含 Magic UI 動效元件) 取代自製樣式，避免設計系統雜亂。

利害關係人：開發者（要快速看到可運作的 demo）、未來接手者（要能直接以此為基底擴充真實後端）。

## Goals / Non-Goals

**Goals:**

- 在單一 React 應用中提供登入、儀表板、車輛管理、員工管理四個頁面。
- 以 MSW 模擬完整 CRUD API，前端程式碼可在未來無痛切換到真實後端（只需移除 MSW 啟動，不改 API 呼叫程式）。
- 角色控制：UI 層隱藏不可見功能 + 路由層守衛，雙保險。
- 提供至少 8 筆假車輛、5 筆假員工的種子資料，讓 dashboard 圖表 / 列表都有內容可看。

**Non-Goals:**

- 真實後端、資料庫、JWT 簽章與驗證 — 僅模擬登入流程。
- 密碼加密、忘記密碼、註冊流程。
- i18n、無障礙審查、行動裝置最佳化（採基本 responsive 但不深調）。
- E2E 測試與 CI 整合 — 本變更僅交付主要單元測試。
- 角色細分（如部門管理員、唯讀員工）。

## Decisions

### Decision 1：採 Vite + React + TypeScript

- **選擇**：Vite + React 18 + TypeScript。
- **替代**：Next.js（過重，需 SSR / 路由系統，對 MVP 多餘）；CRA（已停止維護）。
- **理由**：Vite dev server 啟動快、HMR 穩定，與 MSW 整合文件齊全；TS 在表單與 API 型別上能顯著降低錯誤。

### Decision 2：路由用 React Router v6 + 自製 RouteGuard

- **選擇**：`react-router-dom` 的 `<Outlet />` + 包一層 `<ProtectedRoute role="admin">` 元件。
- **替代**：TanStack Router（學習成本高）；自寫 hash router（過於陽春）。
- **理由**：React Router 是業界默認，社群範例多，配合角色守衛只需 ~30 行。

### Decision 3：資料抓取用 TanStack Query，狀態管理用 Zustand

- **選擇**：`@tanstack/react-query` 處理伺服端資料 (車輛 / 員工 / dashboard)，`zustand` 存放當前登入使用者 (`auth` slice)。
- **替代**：Redux Toolkit（樣板過多）；React Context（重渲染問題）。
- **理由**：TanStack Query 原生支援快取、loading / error 狀態、樂觀更新；Zustand 體積小、API 直觀，僅用來存 auth 即可。

### Decision 4：Mock 後端用 MSW + 內存資料庫

- **選擇**：MSW v2 + 自寫的 `db.ts` 物件作為內存儲存（`Map` 結構），可選擇序列化到 `localStorage`。
- **替代**：`json-server`（要起獨立 process）；`axios-mock-adapter`（綁定 axios）。
- **理由**：MSW 在 service worker 層攔截，前端 fetch 程式完全不必改；切換到真實後端僅需停掉 MSW 啟動。

### Decision 5：UI 元件以 shadcn/ui 為主，搭配少量 Magic UI 動效

- **選擇**：用 shadcn CLI 加入 `button`, `input`, `card`, `table`, `dialog`, `form`, `select`, `toast`, `dropdown-menu`, `avatar`；Magic UI 用於 `NumberTicker`（卡片數字動畫）與 `AnimatedList`（圖表登場動畫）等錦上添花元件。
- **替代**：MUI / Ant Design（樣式不易客製，bundle 大）；自寫元件（耗時）。
- **理由**：shadcn copy-paste 模式讓元件完全在 repo 內可控；Magic UI 補強 dashboard 的視覺亮點。

### Decision 6：圖表用 Recharts

- **選擇**：`recharts`（PieChart 顯示車輛狀態分佈、BarChart 顯示車輛類型）。
- **替代**：`chart.js` (canvas-based, 樣式不易跟 Tailwind 整合)；ECharts（過重）。
- **理由**：Recharts 用 React 元件描述圖表、與 Tailwind 容器搭配良好、shadcn 也有官方 chart wrapper 範例。

### Decision 7：表單用 React Hook Form + Zod

- **選擇**：`react-hook-form` + `zod` + `@hookform/resolvers`。
- **理由**：型別安全的 schema、低重渲染、shadcn `Form` 元件已封裝好整合。

### Decision 8：登入採「假 JWT + Zustand persist」

- 登入時 MSW 回傳 `{ token: 'fake-jwt-...', user: {...} }`，前端用 `zustand/middleware/persist` 將 `user` 寫入 `localStorage`。
- 路由守衛只看 `user.role`；token 僅作為「是否登入」的旗標，不解析。
- **預設帳號**：
  - 管理者：`admin / admin123`
  - 一般使用者：`user / user123`

## Risks / Trade-offs

- **[假後端與真後端介面落差]** → MSW handler 嚴格依 `OpenAPI 風格` 命名與回應結構，未來切換真後端只需提供同形 API；前端僅透過 `lib/api.ts` 一個 thin client 呼叫，避免散落 fetch 邏輯。
- **[角色控制只在前端]** → MVP 沒有真實授權層；明確標示為展示用途，未來要在真實後端再加。
- **[MSW Service Worker 在某些瀏覽器 (incognito、Safari) 行為不一致]** → 文件中載明使用 Chrome / Edge / Firefox 桌面版進行 demo；提供 `npm run dev` 啟動腳本與 `public/mockServiceWorker.js`。
- **[shadcn 元件大量 copy 進 repo]** → 接受此 trade-off：換取完全可客製化；CLI 自動生成不會手動維護。
- **[Magic UI 部分元件需要 framer-motion]** → 增加 ~50KB bundle；MVP 可接受。

## Migration Plan

由於是新專案、無既有功能，無真正的 migration。但進入 demo 的步驟為：

1. 安裝相依：`npm install`
2. 啟動 dev server：`npm run dev`（自動啟動 MSW）
3. 用預設帳號登入測試 admin / user 雙角色路徑。

回滾策略：直接刪除 `src/pages/`, `src/features/`, `src/mocks/` 等新增目錄即可，原 `src/skills/` 不受影響。

## Open Questions

- 是否需要將 mock 資料持久化到 `localStorage`？預設**啟用**，但可在 `src/mocks/db.ts` 設 flag 關閉。
- 員工資料是否需要關聯車輛（指派駕駛）？MVP **不做**；列為後續變更候選。
- Dashboard 是否需要時間區間篩選？MVP **不做**；只顯示「全部」彙總。
