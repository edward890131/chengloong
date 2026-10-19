# iron-design-loop

AI coding ↔ design 閉環方法：讓 **HTML 頁面、HTML Guideline、Figma 設計系統與設計稿** 三邊對應並持續同步，Web 與 APP 共用。Claude Code skill 格式。

工作流說明（站別、agent 分工、各站輸入輸出、流程圖）：[`docs/workflow.html`](docs/workflow.html)

## 安裝

```bash
git clone https://github.com/ironman82510-sys/iron-design-loop.git <放方法的資料夾>/design-loop
ln -s <放方法的資料夾>/design-loop ~/.claude/skills/design-loop
```

只有一份方法本體，所有專案都讀它，不要複製進專案。

## 在專案裡用

| 你說 | 會做什麼 |
|---|---|
| 「用 design-loop 開新案，平台 web」／「平台 app」 | 建 `_design-loop/`，問 manifest 欄位，進 S0 |
| 「design-loop 目前進度」 | 讀 manifest 站別、DS_GAPS、SYNC_PENDING，說下一步 |
| 「改完網站了，同步三邊」 | 跑 S5：影響分析、三邊修改、腳本驗證、寫 SYNC_LOG |
| 「依 Guideline 延伸 <頁面>」 | 跑 S6，接 S2→S3→S4→S7 |
| 「這個坑記下來」 | 寫專案 LESSONS.md，標「待升級」 |

開案指令（skill 也會自動跑）：

```bash
python3 ~/.claude/skills/design-loop/scripts/init_project.py <專案根目錄> \
  --platform web --prefix xx --name "專案名" --install-hook
# APP：--platform app [--dark] [--tablet] [--framework flutter]
```

`--install-hook` 會在專案 `.claude/settings.json` 加一個 PostToolUse hook：專案進入 S5（三邊都建好）之後，改到監看的 HTML／CSS／tokens 會自動記進 `_design-loop/SYNC_PENDING.md`，下次開場先同步。判斷依檔案 mtime，Edit／Write、Bash heredoc、sed、python 腳本、subagent 寫的都抓得到；Figma 端的改動抓不到，照使用者描述補。S0–S4 首次建置期間不記。

既有專案補建（已經有網站、手冊或 Figma DS）：一樣先跑 init，再照 SKILL.md 鐵律 3 逐站跑驗收，manifest 的 `stage` 填到驗收通過的那一站。Figma 變數沒設 codeSyntax 時，先在 manifest 寫 `token_map` 命名規則讓 token_diff 能比。

## 方法和專案資料分開

| | 放哪 | 會不會複製 |
|---|---|---|
| 方法（`core/`、`platforms/`、`references/`、`scripts/`） | 本 repo | 不複製，專案永遠讀這裡 |
| 範本（`templates/project/`） | 本 repo，開案時複製 | 只在開案複製一次 |
| 專案資料（manifest、registry、各種紀錄） | 專案 `_design-loop/` | 只屬於該專案 |

**客戶資料不進本 repo**：fileKey、截圖、文案、node id 只留在專案資料夾。範例一律去識別化。

## 版本

- **最新版本**：看 GitHub 的 Releases，標 Latest 的就是；也等於 `main` 上的 `VERSION`。
- **每次改版都有紀錄**（GitHub Actions 自動守）：
  - `version-check`：PR 或直接推 `main` 時，只要動到方法本體（SKILL.md、core、platforms、references、scripts、templates），`VERSION` 沒升版或 CHANGELOG 沒有該版條目就亮紅燈。只改 README、docs、CHANGELOG 不用升版。
  - `release`：`main` 上 `VERSION` 一改，自動在那個 commit 打 `vX.Y.Z` tag、建 GitHub Release（內文取 CHANGELOG 該版條目）。過去漏打的 tag 也會補。
- 改版做法：一個版本一個 PR（或一個 commit），同一次改動裡一起改 `VERSION`、`CHANGELOG.md`，回流的話加 `docs/backflow/LOG.md` 一列。不要把兩個版本擠在同一次推送。
- 專案 manifest 記 `loop_version`；skill 升版後，開場會列出兩版之間的 CHANGELOG，由你決定專案要不要跟。
- 舊專案要停在舊版：`git worktree add ../design-loop-v0.1.0 v0.1.0`，該專案改讀那個路徑。
- 給學生：指定 tag，不要給 `main`。

## 心得回流

專案 `_design-loop/LESSONS.md` 標「待升級」→ 照 `docs/backflow/README.md` 的四關分流（入口閘門 → 分流 → 去重泛化 → 標記回收）→ 寫進 core／platforms／references／scripts → CHANGELOG → `VERSION` 升版 → `docs/backflow/LOG.md` 記一列 → 合併到 `main`（tag 自動打）。

## 平台狀態

| 平台 | 狀態 | 依據 |
|---|---|---|
| web | stable | 品牌官網案走完 S0–S5（2026-09）；同案手機設計稿與 S7 復盤實測（0.4.0 寫入）；平板設計稿待驗 |
| app | stable | APP 案走完 S0–S7（2026-09）；兩平台差異化、Dark mode、平板設計稿分支待驗 |

## 目錄

```
SKILL.md            入口：開場、站別路由、鐵律
core/               S0–S7 各站做法與驗收、Figma page 結構（figma-pages.md）、多 agent 並行分工（parallel.md）
platforms/          web.md、app.md
references/         css-to-figma、integer-rules、figma-gotchas、figma-instance-gotchas、capture-gotchas
scripts/            開案、hook、量測、擷取、Figma 匯出與掃描、比對、計算、手冊組裝
templates/          專案資料範本、Guideline 章節骨架
```
