## 1. 專案 Bootstrap

- [x] 1.1 在現有 repo 上以 Vite 建立 React + TypeScript 應用骨架（`index.html`、`vite.config.ts`、`tsconfig.json`、`src/main.tsx`、`src/App.tsx`），不破壞既有的 `src/skills/`。
- [x] 1.2 安裝核心相依：`react`, `react-dom`, `react-router-dom`, `@tanstack/react-query`, `zustand`, `react-hook-form`, `@hookform/resolvers`, `zod`, `recharts`, `msw`, `framer-motion`, `lucide-react`, `clsx`, `tailwind-merge`。
- [x] 1.3 安裝並設定 Tailwind CSS（`tailwind.config.ts`、`postcss.config.js`、`src/index.css` 含 `@tailwind` 指令與 shadcn 預設 CSS variables）。
- [x] 1.4 初始化 shadcn：`npx shadcn@latest init`，並加入元件 `button`, `input`, `label`, `card`, `table`, `dialog`, `form`, `select`, `toast`, `dropdown-menu`, `avatar`, `badge`, `skeleton`, `alert-dialog`, `sonner`。
- [x] 1.5 加入 Magic UI 元件：`number-ticker`、`animated-list`（複製到 `src/components/magicui/`）。
- [x] 1.6 在 `package.json` 加入 scripts：`"dev"`, `"build"`, `"preview"`, `"lint"`, `"test"`, `"msw:init"`。

## 2. Mock API (capability: mock-api)

- [x] 2.1 執行 `npx msw init public/ --save`，在 `public/` 產生 `mockServiceWorker.js`。
- [x] 2.2 在 `src/mocks/db.ts` 實作內存 DB：`vehicles`, `employees`, `users` 三個 collection、`localStorage` 持久化、`resetDb()`、`window.__resetMockDb`。
- [x] 2.3 在 `src/mocks/seed.ts` 撰寫種子資料（≥ 8 vehicles 涵蓋 4 type × 3 status，≥ 5 employees 含 1 admin、users 至少 `admin/admin123` 與 `user/user123`）。
- [x] 2.4 在 `src/mocks/handlers/auth.ts` 實作 `POST /api/auth/login`、`POST /api/auth/logout`，token 格式 `fake-jwt.<userId>`。
- [x] 2.5 在 `src/mocks/handlers/dashboard.ts` 實作 `GET /api/dashboard/summary`、`/status-distribution`、`/type-distribution`。
- [x] 2.6 在 `src/mocks/handlers/vehicles.ts` 實作五支 vehicles API，含車牌唯一性與 admin 權限檢查。
- [x] 2.7 在 `src/mocks/handlers/employees.ts` 實作五支 employees API，含 employeeNo / email 唯一性、admin 權限、防止刪除自己。
- [x] 2.8 在 `src/mocks/auth.ts` 實作從請求 `Authorization` header 解析 `userId` 並對照 `users` 取得 role 的工具，供所有 handler 使用。
- [x] 2.9 在 `src/mocks/browser.ts` 集合所有 handlers 並 `setupWorker(...)`，並於 `src/main.tsx` 在 dev 模式 `await worker.start({ onUnhandledRequest: 'bypass' })`。

## 3. 應用基礎設施

- [x] 3.1 在 `src/lib/api.ts` 實作 `apiClient`（fetch 封裝），自動帶上 `Authorization: Bearer <token>`，統一處理 401/403/409/404 並丟出可讀錯誤。
- [x] 3.2 在 `src/lib/queryClient.ts` 設置 TanStack Query `QueryClient`，`<QueryClientProvider>` 包在 `App` 外層；加入 `<Toaster />` (sonner)。
- [x] 3.3 在 `src/stores/auth.ts` 以 zustand + persist 實作 auth store：`user`, `token`, `login()`, `logout()`。
- [x] 3.4 在 `src/types/` 定義 `Vehicle`, `Employee`, `User` 介面與相關 enum，作為前後端共用型別。

## 4. 路由與 Layout

- [x] 4.1 在 `src/routes/AppRouter.tsx` 設定路由：`/login` 公開、`/dashboard`、`/vehicles` 需登入、`/employees` 需 admin；未匹配導向 `/dashboard` 或 `/login`。
- [x] 4.2 在 `src/components/ProtectedRoute.tsx` 實作 `<ProtectedRoute requiredRole?>` 邏輯（未登入導 `/login`、權限不足導 `/dashboard` + toast）。
- [x] 4.3 在 `src/components/AppLayout.tsx` 設計左側導覽（dashboard / vehicles / employees）+ 右上角使用者選單（顯示姓名與登出），並依角色隱藏「員工管理」項目。

## 5. 登入頁 (capability: auth)

- [x] 5.1 建立 `src/pages/LoginPage.tsx`：置中卡片、品牌標題、帳號 / 密碼欄位、登入按鈕。
- [x] 5.2 以 React Hook Form + zod (`{ username: z.string().min(1), password: z.string().min(1) }`) 驗證並送出 `POST /api/auth/login`。
- [x] 5.3 登入成功時呼叫 `authStore.login(data)` 並 `navigate('/dashboard')`；失敗時顯示 sonner toast。
- [x] 5.4 在登入頁註明預設帳號（`admin/admin123`、`user/user123`）作為 demo 提示。

## 6. 儀表板 (capability: dashboard)

- [x] 6.1 建立 `src/pages/DashboardPage.tsx`，內含 `<KpiCards />` 與 `<DashboardCharts />`。
- [x] 6.2 實作 `<KpiCards />`：以 useQuery 抓 `/api/dashboard/summary`，每張卡用 shadcn `Card` + Magic UI `NumberTicker`；loading 顯示 `Skeleton`。
- [x] 6.3 實作 `<VehicleStatusPie />`（PieChart, recharts）抓 `/api/dashboard/status-distribution`。
- [x] 6.4 實作 `<VehicleTypeBar />`（BarChart, recharts）抓 `/api/dashboard/type-distribution`。
- [x] 6.5 設定響應式 grid：桌機 4 欄卡片 + 2 欄圖表、平板 2 欄、手機 1 欄。

## 7. 車輛管理頁 (capability: vehicle-management)

- [x] 7.1 在 `src/features/vehicles/api.ts` 實作 `useVehicles`, `useCreateVehicle`, `useUpdateVehicle`, `useDeleteVehicle` hooks。
- [x] 7.2 建立 `src/pages/VehiclesPage.tsx`：搜尋框、狀態篩選、shadcn `Table` 顯示資料，使用 `useVehicles({ q, status })`。
- [x] 7.3 admin 顯示「新增車輛」按鈕，點擊開啟 `<VehicleFormDialog />`（共用新增與編輯）。
- [x] 7.4 表單 schema (zod) 含 plateNumber, brand, model, type, status, year；送出時依 mode 呼叫 create / update。
- [x] 7.5 admin 在每列右側加上「編輯」、「刪除」按鈕；刪除前以 shadcn `AlertDialog` 確認。
- [x] 7.6 處理 409 (車牌重複) → 在表單 plateNumber 欄位 setError；處理 404 → toast 並 invalidate query。
- [x] 7.7 角色檢查：`role=user` 時隱藏新增 / 編輯 / 刪除 UI（雙保險：API 回 403 也能優雅處理）。

## 8. 員工管理頁 (capability: employee-management)

- [x] 8.1 在 `src/features/employees/api.ts` 實作 `useEmployees`, `useCreateEmployee`, `useUpdateEmployee`, `useDeleteEmployee` hooks。
- [x] 8.2 建立 `src/pages/EmployeesPage.tsx`：以 `<ProtectedRoute requiredRole="admin">` 包裹；表格欄位包含員工編號、姓名、e-mail、部門、角色、建立時間、操作。
- [x] 8.3 提供搜尋（姓名 / 員工編號 / e-mail）。
- [x] 8.4 `<EmployeeFormDialog />`：zod schema 含 employeeNo、name、email (`z.string().email()`)、department、role；新增 / 編輯共用。
- [x] 8.5 處理 409 (employeeNo 或 email 重複) 在對應欄位 setError；處理 400 (刪除自己) 顯示 toast。
- [x] 8.6 列表角色欄位以 shadcn `Badge` 區別 admin / user。

## 9. 收尾

- [x] 9.1 撰寫 README 段落：如何啟動、預設帳號、MSW 重設指令 (`window.__resetMockDb()`)。
- [x] 9.2 在 `src/skills/__tests__/` 之外的位置加入至少一支 utility 單元測試（例：mock DB 唯一性檢查 / `apiClient` 錯誤對應）以證明 lint+test 流暢。
- [x] 9.3 跑 `npm run lint` 與 `npm run build` 確認無錯誤；以 `npm run dev` 手動走過 admin 與 user 的關鍵流程（登入 → dashboard → 車輛 CRUD → 員工頁存取行為）。
