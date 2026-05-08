# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案性質

這是一個 **AI 課程範例專案**，同時扮演兩個角色：

1. **Agent Skills 練習場**：`.agents/skills/`、`.claude/skills/`、`.cursor/skills/`、`.codex/skills/` 各自存放同一組 Skill 的提示詞腳本（git-smart-commit、git-pr-description、git-branch-name、gen-test-cases、openspec-* 等）。修改 Skill 時通常需要同步多個目錄。
2. **車輛管理系統 MVP**：以 React + Vite + shadcn/ui + MSW 實作的前端應用，作為 [openspec/](openspec/) 流程的示範產物。

兩者透過 [openspec/](openspec/) 的 spec-driven workflow 串起來——MVP 的提案、設計、specs 與 tasks 都保留在 [openspec/changes/archive/2026-05-08-vehicle-management-mvp/](openspec/changes/archive/2026-05-08-vehicle-management-mvp/)。

## 常用指令

```bash
npm run dev         # Vite dev server (port 5173)，自動載入 MSW
npm run build       # tsc --noEmit && vite build
npm run preview     # 預覽 production bundle
npm run lint        # ESLint flat config (eslint.config.js)
npm run lint:fix
npm test            # Jest with --experimental-vm-modules (ESM)
npm run test:watch
npm run msw:init    # 重新產生 public/mockServiceWorker.js
```

跑單一測試：`npm test -- src/skills/__tests__/echo.test.js` 或 `npm test -- -t "test name"`。

Husky pre-commit ([.husky/pre-commit](.husky/pre-commit)) 會**並行**跑 `npm run lint` 與 `npm test`，把兩邊輸出分區塊呈現後再決定是否阻擋 commit。任一失敗即整體 fail。

## 架構重點

### Path alias

`@/*` → `src/*`，同時設定在 [vite.config.ts](vite.config.ts) 與 [tsconfig.json](tsconfig.json)。新增 import 路徑優先用 `@/`。

### TypeScript 範圍

[tsconfig.json](tsconfig.json) `include` 只涵蓋 `src` 與 `vite.config.ts`，且 **`exclude` 排除 `src/skills/__tests__`**。`src/skills/` 與 `src/lib/__tests__/token.test.js` 是純 JS（ESM）測試素材，不參與 type check。`npm run build` 的 `tsc --noEmit` 因此不會碰它們。

### MSW Mock 後端

前端**沒有真實後端**，所有 `/api/*` 都由 [src/mocks/](src/mocks/) 攔截：

- [src/mocks/browser.ts](src/mocks/browser.ts) 註冊 worker，由 [src/main.tsx](src/main.tsx) 在 DEV 或 `VITE_ENABLE_MSW=true` 時啟動
- [src/mocks/db.ts](src/mocks/db.ts) 是 in-memory DB，**會持久化到 `localStorage` (key: `mock-db:v1`)**
- [src/mocks/handlers/](src/mocks/handlers/) 依資源切檔（auth / vehicles / employees / dashboard）
- [src/mocks/seed.ts](src/mocks/seed.ts) 是初始種子資料
- 在 browser console 執行 `window.__resetMockDb()` 後刷新即可還原資料

新增 API endpoint 時：handler 寫在 `src/mocks/handlers/`，前端透過 [src/lib/api.ts](src/lib/api.ts) 的 `api.get/post/put/delete` 呼叫——它會自動帶 `Authorization: Bearer <token>`，並在 401 時呼叫 `useAuthStore.getState().logout()`。錯誤統一拋 `ApiError`。

### 狀態與資料層

- [src/stores/auth.ts](src/stores/auth.ts)：Zustand + persist middleware，localStorage key `vms-auth`，存 `user` 與 `token`
- [src/lib/queryClient.ts](src/lib/queryClient.ts)：TanStack Query client；features 內的 `api.ts` 封裝對應 hooks
- 表單統一用 react-hook-form + zod resolver

### Routing 與權限

[src/routes/AppRouter.tsx](src/routes/AppRouter.tsx) 用兩層 `ProtectedRoute`：外層擋未登入；`/employees` 多包一層 `requiredRole="admin"`。`AppLayout` 提供登入後的 shell。

Demo 帳號（在 [src/mocks/seed.ts](src/mocks/seed.ts)）：
- `admin` / `admin123`：完整權限（含員工管理）
- `user` / `user123`：唯讀

### 功能組織

頁面薄、邏輯放 features：
- [src/pages/](src/pages/) — 路由頁面（Login / Dashboard / Vehicles / Employees）
- [src/features/{vehicles,employees,dashboard}/](src/features/) — 各自的 `api.ts`（query/mutation hooks）+ Form Dialog / Charts 元件
- [src/components/ui/](src/components/ui/) — shadcn/ui
- [src/components/magicui/](src/components/magicui/) — Magic UI 動效

新增 CRUD 功能時遵循 vehicles/employees 的 pattern：handler → types → features/<domain>/api.ts (hooks) → page + form dialog。

## OpenSpec workflow

[openspec/](openspec/) 採 spec-driven workflow，現有 specs：`auth`、`vehicle-management`、`employee-management`、`dashboard`、`mock-api`。流程透過 `openspec-*` Skills 與 `/opsx*` slash commands 操作（new → propose → ff/continue → apply → verify → archive/sync）。歷史變更歸檔在 [openspec/changes/archive/](openspec/changes/archive/)。

修改既有功能時，先翻 [openspec/specs/<domain>/spec.md](openspec/specs/) 對齊行為，再決定要不要走一輪 OpenSpec change。
