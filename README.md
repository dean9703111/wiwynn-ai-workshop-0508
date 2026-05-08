# Build with AI — 課程範例專案

課程講義：[deanlin.net/course/wiwynn](https://deanlin.net/course/wiwynn)

## 專案簡介

本 repo 是 AI 課程的範例專案，同時扮演兩個角色：

1. **Agent Skills 練習場** — 內建一組可在 Claude Code、Cursor、Codex CLI 等 AI Agent 上使用的 Skills，方便學員體驗、修改與擴充。Skills 提示詞放在 [.agents/skills/](./.agents/skills/)，並透過 symlink 同步到 [.claude/skills/](./.claude/skills/)、[.cursor/skills/](./.cursor/skills/)、[.codex/skills/](./.codex/skills/)。
2. **車輛管理系統 (VMS) MVP** — 以 React 18 + Vite + TypeScript + shadcn/ui + MSW 打造的純前端示範應用，**沒有真實後端**，所有 `/api/*` 由 [MSW](https://mswjs.io/) 攔截。本應用同時作為 [OpenSpec](./openspec/) spec-driven workflow 的示範實作，相關提案 / 設計 / specs / tasks 保留在 [openspec/](./openspec/)。

### 內建 Skills

| Skill | 說明 |
| --- | --- |
| `git-smart-commit` | 將雜亂的 git 變更依功能邏輯自動拆分成多個有意義的 conventional commit |
| `git-pr-description` | 根據 branch 差異自動產生 Pull Request 的 Title 與 Description |
| `git-branch-name` | 根據變更內容，設計符合 kebab-case 命名規則的 feature branch 名稱 |
| `gen-test-cases` | 根據選取的程式碼或功能範圍，自動產生測試案例與對應測試程式 |
| `openspec-*` | OpenSpec 流程相關（explore / propose / apply / verify / archive / sync 等） |

## 啟動方式

### 環境需求

- Node.js ≥ 20（專案使用 ESM）
- npm（或同步 lockfile 後改用 pnpm / yarn）
- 任一支援 Skills 的 AI Agent（推薦 [Claude Code](https://claude.ai/code)）

### 安裝與啟動 dev server

```bash
npm install        # 安裝相依套件（已執行過則略過）
npm run dev        # 啟動 Vite dev server，預設 http://localhost:5173
```

dev server 啟動時會自動載入 MSW Service Worker（[public/mockServiceWorker.js](./public/mockServiceWorker.js)），所有 `/api/*` 請求皆由 [src/mocks/](./src/mocks/) 攔截處理。

### 其他常用指令

```bash
npm run build      # tsc --noEmit && 產生 production bundle 至 dist/
npm run preview    # 預覽 production build
npm run lint       # ESLint flat config
npm run lint:fix
npm test           # Jest（--experimental-vm-modules）
npm run test:watch
```

> Husky pre-commit 會並行執行 `npm run lint` 與 `npm test`，任一失敗即阻擋 commit。

### Demo 帳號

| 角色 | 帳號 | 密碼 | 可存取頁面 |
| --- | --- | --- | --- |
| 管理者 | admin | admin123 | 儀表板、車輛管理（含寫入）、員工管理 |
| 一般使用者 | user | user123 | 儀表板、車輛管理（僅檢視） |

### 使用 Skills

1. 在專案目錄下啟動 AI Agent（如 `claude`）
2. 輸入 `/` 即可看到可用的 Skills 清單
3. 選擇對應 Skill 後依提示操作

### 重設 Mock 資料

Mock 資料會持久化到瀏覽器 `localStorage`（key: `mock-db:v1`）。若要還原為原始種子資料，可在瀏覽器 DevTools console 執行：

```js
window.__resetMockDb()
```

之後重新整理頁面即可。

## 自訂 Skills

每個 Skill 的核心是 `SKILL.md`，描述該 Skill 的運作流程與規則。你可以：

- 直接修改現有 Skill 的行為
- 新增自己的 Skill 目錄與 `SKILL.md`
- 將 Skill 邏輯移植到其他 AI Agent 平台

## 目錄結構

- [src/pages/](./src/pages/) — 路由頁面（Login / Dashboard / Vehicles / Employees）
- [src/features/](./src/features/) — 各 domain 的 hooks、表單與圖表元件
- [src/components/ui/](./src/components/ui/) — shadcn/ui 元件
- [src/components/magicui/](./src/components/magicui/) — Magic UI 動效元件
- [src/mocks/](./src/mocks/) — MSW handlers、內存 DB 與種子資料
- [src/lib/](./src/lib/) — `api.ts`（fetch 封裝）、`queryClient.ts`、共用 utils
- [src/stores/](./src/stores/) — Zustand 狀態（auth store + persist）
- [openspec/](./openspec/) — OpenSpec specs、changes 與 config
- [.agents/skills/](./.agents/skills/) — Agent Skills 提示詞（`.claude/`、`.cursor/`、`.codex/` 透過 symlink 共用）
