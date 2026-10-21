---
name: design-loop
description: Use when 一個 Web 或 APP 專案要讓 HTML 頁面、HTML Guideline、Figma 設計系統（Variables／Component）與 Figma 設計稿彼此對應並持續同步。觸發語：「design-loop」「調整好了，套回去」「用閉環開新案」「把網頁整理成 Ant Design 式 Guideline」「Figma key page 先轉 HTML」「在 Figma 建 Variables 和 Component」「HTML 還原成套元件的設計稿」「三邊同步」「改完網站了」「依 Guideline 延伸新頁」「設計稿復盤五輪」「設計稿有小數點」「design-loop 進度」。不要用在：還沒有畫面或設計方向（先用 design-pitch-discovery／beta-directions）、只改單一頁面樣式且不需要同步 Figma（design-html）、只想從外部網站抽 token（design-extract）。
---

# design-loop · 產線 P7 · 設計系統閉環

HTML 是工作媒介，Guideline 是規範，Figma 是設計交付。三邊靠 `registry.json` 對得起來，靠腳本驗得出來。

方法（本 skill）和專案資料（專案內 `_design-loop/`）分開：skill 只放通用做法；專案的 fileKey、前綴、例外、紀錄一律寫在專案資料夾。

## 每個 session 開場

0. 前提：方法本體已 symlink 到 `~/.claude/skills/design-loop`（README「安裝」）。
1. 從工作目錄往上找 `_design-loop/manifest.json`。找不到＝新案：先問使用者專案根目錄、CSS 前綴、專案名；APP 另問 iOS／Android 要不要差異化、Dark mode／平板是否**確定**要做、交接框架。然後跑：
   `python3 ~/.claude/skills/design-loop/scripts/init_project.py <專案根目錄> --platform web|app --prefix <前綴> --name <專案名> [--unified-platform] [--dark] [--tablet] [--framework flutter] --install-hook`
   跑完把 `_design-loop/CLAUDE.snippet.md` 加進專案 CLAUDE.md（沒有就建立）。
2. `manifest.loop_version` 與本 skill `VERSION` 不同 → 讀 `CHANGELOG.md` 兩版之間的條目，列給使用者決定專案要不要跟上；決定前照專案原版本做。
3. 依 `manifest.platform` 讀 `platforms/web.md` 或 `platforms/app.md`。
4. `manifest.stage` 是 `S5` 且 `_design-loop/SYNC_PENDING.md` 有未勾選項目 → 先跑 S5，清空後才做別的（S0–S4 首次建置期間 hook 不記錄；hook 依 mtime 判斷，Bash 或腳本寫的檔也算）。
5. 依 `manifest.stage` 只讀當站文件（下表）。過站時更新 `manifest.stage`。

## 站別

| 站 | 做什麼 | 讀 | 過站前一定要有 |
|---|---|---|---|
| S0 | 來源統一成 HTML（既有網站／Figma key page／既有 APP） | `core/s0-source-to-html.md` | 每頁每個 viewport 對來源截圖驗收 |
| S1 | 萃取 Ant Design 式 Guideline 與 tokens | `core/s1-guideline.md` | audit.md 高嚴重度全部有決策、使用者過目 |
| S2 | 頁面對齊 Guideline、擷取對位稿進 Figma | `core/s2-align.md` | 寫死值掃描 0（登記例外除外） |
| S3 | Figma Variables／樣式／元件母版（Guideline Frame board） | `core/s3-figma-ds.md` | `figma_audit` 0、`token_diff` 0、registry 完整 |
| S4 | 用 instance 重建設計稿 | `core/s4-rebuild.md` | 逐區段對擷取稿、DS_GAPS 清空或經同意延後 |
| S5 | 異動三邊同步（常駐） | `core/s5-sync.md` | 驗證全過、SYNC_LOG 一筆、SYNC_PENDING 清空 |
| S6 | 依 Guideline 延伸新頁 | `core/s6-extend.md` | 新增 token／元件／變體數量已回報 |
| S7 | 五視角復盤 | `core/s7-review.md` | REVIEW_LOG 五輪都有證據 |

S4 完成後 `manifest.stage` 固定為 `S5`。S6、S7 是每一批新頁的循環，紀錄在 REVIEW_LOG，不改 stage。

動 Figma 前一定要讀 `core/figma-pages.md`（page 結構、代碼、哪些 page 能寫、調整區）、`references/css-to-figma.md`、`references/integer-rules.md`、`references/figma-gotchas.md`、`references/figma-instance-gotchas.md`。擷取或瀏覽器量測前讀 `references/capture-gotchas.md`。

## 鐵律

1. **HTML 是工作媒介，Web 和 APP 都一樣。** 最後用 Flutter 或原生實作也先做 HTML：AI 量得到 computed style、截得到每個 viewport、擷取得進 Figma、延伸新畫面最快。APP 的 HTML 是原型不是交付程式碼，交付的是 tokens.json 與設計稿。
2. **來源是 Figma key page 時，HTML 對 Figma 驗收。** 設計稿本身的不一致記進 `audit-source.md` 等 S1 決策，不在 HTML 裡偷偷修掉。
3. **不跳站，但可以驗收過站。** 沒過關的 Guideline 不建元件；母版掃描不是 0 不組設計稿。專案已經有某站的產物（既有手冊、tokens、Figma DS），直接跑那一站的驗收：過了就記進 manifest 往下，沒過才回頭補。不做驗收就從中間開始＝違規。
4. **狀態寫硬碟，不寫進 Figma。** node id、component key、屬性完整 key（含 `#` 後綴）、CSS class 對應寫 `registry.json`。Figma 上只寫 component `description`（一句定義＋對應 CSS class，必要時加 Figma 取整差）。不用 pluginData 系列。
5. **整數從建母版就守。** 寫入前 `Math.round` 擋不住鎖比例 instance 高度、網格餘數、奇偶置中的 .5，照 `references/integer-rules.md`。
6. **改動一律走 S5。** HTML、CSS、token、元件母版任何變更，三邊改完、腳本驗過、SYNC_LOG 記下才叫完成。只改一邊或兩邊就回報完成＝違規。
7. **延伸先沿用。** 新需求走 S6 收斂判斷樹：可以自主新增，但要登記理由並回報數量。動到內容欄位（CMS）、資訊架構、全站 token 值、整數政策（`integer_policy.grid_remainder`）時才停下來問。
8. **復盤是五個視角各一輪，不是同一件事看五次。** R4 視覺視角交給沒參與製作的 agent。
9. 專案中發現 skill 沒寫的坑 → 寫專案 `_design-loop/LESSONS.md` 標「待升級」；不直接改 skill 本體（使用者正在維護 skill 時除外）。回流流程見 `docs/backflow/README.md`。
10. 不使用 emoji。繁體中文，技術詞保留英文。

## 搭配的 skill

- 呼叫 `use_figma` 前 **REQUIRED**：figma-use（沒有本地 skill 就讀 MCP resource `skill://figma/figma-use/SKILL.md`）。
- 建立或修改元件母版與 Variables（S3、S5 的 T／C／V 類、S6）**REQUIRED**：figma-generate-library（MCP resource `skill://figma/figma-generate-library/SKILL.md`）。
- API 規則以它們為準。唯一例外：多 agent 各自負責不同 frame 時可以並行寫入（實測可行，見 S3 §5）。多 agent 分工的分層、契約、檔案所有權、派工前置讀 `core/parallel.md`。
- S0 只有 wireframe／PRD、沒有畫面：先用 beta-directions 產出第一版 HTML，選定後回來。

## 腳本（`scripts/`，用法看檔頭）

| 腳本 | 站 | 做什麼 |
|---|---|---|
| `init_project.py` | 開案 | 建 `_design-loop/`、填平台預設、可裝同步 hook |
| `sync_pending.py` | hook | 監看檔案 mtime 有變就記進 SYNC_PENDING（Edit／Write／Bash 一視同仁） |
| `extract_computed.js` | S0 S1 S7 | 讀渲染後樣式，統計顏色／字級／間距／圓角出現次數 |
| `s0_shoot.cjs` | S0 | HTML 截圖＋每個 `data-figma` 節點相對畫面原點的位置 |
| `s0_compare.py` | S0 | 對 Figma metadata 算位置差（Group 座標不雙算）、產並排差異圖 |
| `tokens_build.py` | S1 S5 | tokens.json＋並行碎片 → tokens.css；碎片撞名報錯不寫檔 |
| `capture_prep.js` | S2 S4 | 擷取前捲到底、圖片改 eager、關掉會跑版的 CSS |
| `figma_export_variables.js` | S3 S5 | 在 use_figma 分批匯出 Variables（codeSyntax、各 mode 解析值） |
| `token_diff.py` | S3 S5 | tokens.css ↔ Figma Variables ↔ tokens.json 比對；DTCG 複合型能比就比，不能比列「略過（複合型）」 |
| `figma_audit.js` | S3 S4 S5 S7 | 小數（icon 內向量與方點除外）、未綁變數的純色、未套樣式的字、instance 外的散字、instance 版面覆寫≠母版、instance 根層 FIXED 而母版 HUG／FILL、和母版同值的殘留覆寫 |
| `r2_texts_web.cjs`＋`r2_texts_figma.js` → `r2_text_match.py` | S4 S7 | 網站與設計稿全頁文字位置配對，列出 dy＞4、行數不同 |
| `contrast_on_image.py` | S7 | 影像上的文字對比：有字／無字兩張截圖相減，底色取最壞分位 |
| `figma_pages.js` | 開案 S4 S7 | Figma page 結構：apply 補建 page／分隔線／Section 並排序，check 列缺漏、沒登記或放錯 page 的 frame |
| `adjust_diff.js` | S5 | 調整區副本 ↔ 正式稿逐節點比對：文字、元件變體、detach、綁定變寫死、版面、增刪 |
| `ratio_widths.py` | S3 S4 S6 | 網格欄寬餘數、鎖比例寬度的合法值 |
| `build_guideline.py` | S1 S5 | parts/*.html 組成手冊 |

## 常見錯誤

| 想法 | 實際 | 改成 |
|---|---|---|
| 「Flutter／原生用不到 HTML，直接從 Figma 抽 token 就好」 | 失去量測、擷取、快速延伸的管道；Guideline 沒有可驗證的實作 | 鐵律 1 |
| 「已經有手冊了，直接從 S3 開始」 | 手冊和網站可能早就不一致，母版照錯的建 | 鐵律 3：先跑 S1、S2 驗收 |
| 「寫入數值前 Math.round 就不會有小數」 | 鎖比例圖框高度跟著 instance 寬度算；1360 分 3 欄＝453.33 照樣冒出來 | integer-rules |
| 「對應關係用 setSharedPluginData 存在元件上」 | use_figma 不支援；下個 session 也讀不回來 | registry.json |
| 「母版改好，instance 會自動更新」 | 覆寫過的屬性不跟；resize 讓 FILL 變 FIXED；改成 variant set 後屬性後綴變了；頁面會塌 | S5 影響分析＋頁高回歸 |
| 「新元件都先問使用者」 | 延伸做不下去；反過來完全不問又長出一堆近似樣式 | S6 判斷樹＋數量回報 |
| 「業主給了新 wireframe，照 wireframe 重畫」 | wireframe 更新只是結構參考；照畫會長出和既有元件重複的變體，推翻 key page 已確認的樣式 | S6 §1「wireframe 更新」：既有元件與 key page 優先，只套結構異動 |
| 「第五輪把前四輪重跑一次」 | 長標題、空狀態、其他 viewport 沒人看過 | S7 R5 邊界視角 |
| 「設計師說調好了，把調整區的副本整個搬回正式稿」 | 副本裡的寫死值、detach 的結構會蓋掉 instance 與變數綁定；其他兩邊也沒同步 | figma-pages §5：比對差異，套回 instance 結構，照 S5 同步三邊 |
| 「設計師自己開的 page 也一起同步、一起掃」 | 自由 page 是設計師的草稿區，掃進來會誤報，改到會蓋掉設計師的東西 | figma-pages §1：不在 manifest 的 page 一律不讀不寫；設計師指定才走 §4 |
| 「復盤時 Figma 和 HTML 對不上，把 Figma 改回 HTML」 | 可能是設計師直接在正式稿改的文案或樣式，改回去就把他的修改蓋掉了 | 先確認哪邊是新的意圖（figma-pages §5「設計師直接改了正式稿」） |
| 「A-03 在紀錄裡只寫代碼就夠了」 | wireframe 改版後同一個代碼可能換成別的畫面，舊紀錄會指錯 | 紀錄一律寫代碼＋名稱（figma-pages §2） |
| 「直接改組好的 guideline/index.html」 | 下次 build 被覆蓋，三邊又漂移 | 改 parts 再 build |
