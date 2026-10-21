# CHANGELOG

專案 `manifest.loop_version` 與 `VERSION` 不同時，開場會讀這裡兩版之間的條目。每版固定四段：一句摘要、**專案要不要跟著改**、改動、已知未定。

## 版本一覽

| 版本 | 日期 | 來源 | 專案要跟著改 | commit | tag |
|---|---|---|---|---|---|
| 0.6.0 | 2026-10-06 | 使用者定案：0.5.0 後續（腳本與防呆） | 覆蓋 `scripts/`；紀錄改寫「代碼＋名稱」 | `e7def3f` | `v0.6.0`（合併後自動打） |
| 0.5.0 | 2026-10-06 | 使用者定案：Figma page 結構與調整區 | 不強制；舊格式照舊運作，要拆功能 page 時照 `core/figma-pages.md` §6 | `02683cf`（合併 `0a4c345`） | `v0.5.0` |
| 0.4.0 | 2026-09-29 | Web 案 LESSONS 回流 57 條 | 覆蓋 `scripts/`；派工必讀加 `figma-instance-gotchas.md`；下次 S1／S7 照 RWD 字級標準檢查 | `f8dd6f8` | `v0.4.0` |
| 0.3.1 | 2026-09-29 | APP 案使用者回饋 1 項 | 不用改檔 | `f8dd6f8`（與 0.3.0、0.4.0 同一次推送） | 無 |
| 0.3.0 | 2026-09-29 | APP 案 LESSONS 回流 88 條 | 覆蓋 `scripts/`；可清 `token_diff_ignore` 的複合型例外 | `f8dd6f8`（與 0.3.1、0.4.0 同一次推送） | 無 |
| 0.2.0 | 2026-09-29 | APP 案同步 hook 漏記 | 覆蓋 `sync_pending.py`；改 hook matcher | `aff1f07` | `v0.2.0` |
| 0.1.0 | 2026-09-15 | Web 案首版萃取 | 首版 | `3ad60b1`（`docs/workflow.html` 於 `fd48a89` 補上） | `v0.1.0` |

tag 由 GitHub Actions 在 `VERSION` 改動的 commit 自動打（README「版本」）；0.3.0、0.3.1 沒有單獨的 commit，所以沒有 tag，要取這兩版的內容以 `v0.4.0` 為準並對照下方條目。每次回流的條目數與分流結果另見 `docs/backflow/LOG.md`。

## 排定（未發布）

- 0.7.0（原排 0.5.0，兩次順延）：字寬校準腳本——S3 開工前用同一組測試字串在瀏覽器與 Figma 各量一次寬度，算出每個字型、字級的寬度比寫進 manifest；S7 R2 斷行不一致時據此判斷是字寬造成還是重建錯誤。起因：Web 案與 APP 案字寬方向相反（0.4.0「字寬：方向依字型」），使用者 2026-09-29 同意。
- 手機版設計稿 frame 的 node id：registry 每畫面只有一個 `design_node`，Mobile 等其他 viewport 的 frame 目前靠名稱（`A-01 登入 · Mobile`）找。實際找錯 frame 時再改成 `design_nodes: {viewport: id}`（使用者 2026-10-06 同意降為低優先）。
- 待觀察 19 條（Web 案）：等第二個 Web 案遇到再進，其中建議程式化 3 條見 `docs/backflow/triage-0.4.0.md`。

## 0.6.0 - 2026-10-06

0.5.0 的後續：調整區比對與 page 結構改用腳本、正式稿被直接修改時的防呆、畫面代碼以 wireframe 為準。來源是使用者定案；兩支新腳本只在模擬節點樹上測過，尚未在真實 Figma 檔跑。

**專案要不要跟著改**：
- 所有專案：覆蓋 `scripts/`（新增 `figma_pages.js`、`adjust_diff.js`，其他腳本沒改）。
- 紀錄（SYNC_LOG、REVIEW_LOG、LESSONS、DS_GAPS）之後一律寫「代碼＋名稱」；舊紀錄不用改。
- 已經用功能 page 的專案：跑一次 `figma_pages.js`（check），照結果補 page 或歸位。舊格式專案不用。

改動：
- 新增 `scripts/figma_pages.js`（use_figma）：`apply` 補建缺的 page、分隔線、`HTML 擷取`／`Wireframe` 功能 Section 與調整區 `已套用` Section，照結構排順序；已有同名 page 沿用，不刪、不改名、不搬 frame；回傳 page id 寫回 manifest。`check`（唯讀）列缺漏、順序、正式稿上沒登記或放錯功能 page 的 frame、沒歸位的已套用副本、自由 page。支援舊格式。
- 新增 `scripts/adjust_diff.js`（use_figma，唯讀）：調整區副本 ↔ 正式稿依圖層名稱路徑配對，列出文字、文字樣式、元件與變體、被 detach 的 instance、綁定變成寫死的顏色（附 hex）、版面、顯示隱藏、增刪的圖層。
- `core/figma-pages.md`：
  - §1 加 `figma_pages.js` 的用法與時機；§7 驗收加 check `ok: true`。
  - §2 代碼**以 wireframe 為準**，一個畫面＝代碼＋名稱：wireframe 改版時逐筆對照（代碼名稱都同＝內容異動；代碼同名稱不同＝換了畫面，舊的標 `removed`、新的沿用代碼；只是改名的列給使用者確認）；同一代碼只能有一筆不是 `removed`；紀錄一律寫代碼＋名稱；設計師補的畫面和 wireframe 撞號時照 wireframe、設計師的改號前確認。
  - §5 AI 比對改用 `adjust_diff.js`；新增「設計師直接改了正式稿（防呆）」：AI 寫入任何正式稿前先跑 R2 文字比對，S7 R2／R3 與使用者要求時也查；查到先和設計師確認，刻意改的當 Figma 端異動同步回 HTML，不是的才改回。
- `core/s5-sync.md`：觸發條件加直接修改的處理；寫入正式稿前先比對。
- `core/s7-review.md`：HTML 與 Figma 對不上時先判斷哪邊是新的意圖，不直接把 Figma 改回 HTML。
- `SKILL.md`：腳本表加兩支；常見錯誤表加兩列（復盤時把 Figma 改回 HTML、紀錄只寫代碼）。
- templates：`registry.json` 註明 pages 的 `status`（active／removed）；`SYNC_LOG.md` 加「畫面：代碼＋名稱、來源」；`REVIEW_LOG.md` 範圍改寫代碼＋名稱。
- 排定：手機版 frame 的 `design_nodes` 降為低優先，列進「排定」；字寬校準腳本再順延到 0.7.0。
- 已知未定：`figma_pages.js`、`adjust_diff.js` 尚未在真實 Figma 檔實測（`loadAsync`、Section 建立、跨 page 讀取的實際行為）；`adjust_diff.js` 依圖層名稱配對，圖層改名會顯示成一刪一增，圖片替換不會列出。

## 0.5.0 - 2026-10-06

Figma page 結構定案：正式稿依功能分 page、Wireframe 獨立、新增調整區與畫面代碼。來源是使用者定案（非專案回流）；調整區「複製 → 改 → 下指令 → AI 寫回並同步」是使用者多個專案的實測，page 分區與代碼是建議做法，待驗。

**專案要不要跟著改**：
- 不強制。`manifest.figma.pages.design` 是字串的舊專案照舊運作（單一 `設計稿` page、frame 命名 `NN <頁名>`）。
- 想用調整區：在 `manifest.figma.pages` 補 `adjust`（調整區 page id），之後設計師照 §5 下指令即可；不需要先拆 page。
- 想拆成功能 page：使用者同意後照 `core/figma-pages.md` §6 搬遷（提案代碼 → 建 page 搬 frame → 重讀 node id → manifest 改物件格式 → audit 與頁高回歸）。
- 新開案：照新範本，S0 就決定畫面代碼。

改動：
- 新檔 `core/figma-pages.md`：
  - page 結構與權限：`Guideline`／`--- 參考 ---`（`Wireframe` 選配、`HTML 擷取`）／`--- 正式稿 ---`（一個功能一個 page）／`--- 工作區 ---`（`調整區`、自由 page）。AI 用 manifest 的 page id 找 page；不在 manifest 的 page 一律當自由 page，不讀不寫不掃。
  - 畫面代碼：功能代碼（`A`）＋畫面代碼（`A-01`），wireframe、HTML 擷取、正式稿、registry 共用；wireframe 有編號就沿用，沒有由 AI 提案、使用者確認。
  - Wireframe：一律獨立 page；網址只記連結、別的 Figma 檔只記 key＋node，不搬進來。
  - 開 page 與新增畫面：設計師自己開的 page 預設忽略；指定加進正式區時當成沒有 wireframe 的 S6 新頁跑完整流程（HTML → 擷取 → instance 重建），原稿只當參考。
  - 調整區：設計師複製正式稿改、只認設計師指令觸發；AI 依代碼找回原畫面、比對差異並和意圖對照、衝突先問、照 S5 寫回並同步三邊，套回 instance 與變數結構；完成後副本移到「已套用」Section。
  - 舊格式相容與搬遷步驟、本結構的驗收項目。
- core：s0 過站要有畫面代碼；s2 page 準備改照 figma-pages、擷取稿放功能 Section 並帶代碼；s4 正式稿放功能 page、命名 `<畫面代碼> <頁名>`、audit 逐一掃功能 page；s5 觸發條件加調整區指令、影響分析改查功能 page；s6 新畫面給代碼與 `wireframe_ref`、設計師補畫面的流程；parallel P3 權限改成功能 page，`Wireframe`、`調整區` 唯讀。
- platforms：`app.md` S4 改成每個功能 page 內依 user flow 排。
- templates：
  - `manifest.json`：`figma.pages` 加 `wireframe`、`adjust`，`design` 改成物件（代碼 → `{name, id}`），加 `pages_note`。
  - `registry.json`：`pages[]` 加 `code`、`feature`、`wireframe_ref`、`origin`。
  - `FIGMA_DS_SPEC.md` 加功能 page 對照表；`REBUILD_PLAN.md` 加代碼欄；`CLAUDE.snippet.md` 加給設計師的一句規則。
- `SKILL.md`：觸發語加「調整好了，套回去」；動 Figma 前必讀加 `core/figma-pages.md`；常見錯誤表加兩列（副本整個搬回正式稿、自由 page 一起同步）。
- 文件：README 目錄說明、`docs/workflow.html` 版本與檔案地圖、`docs/backflow/LOG.md` 記一列；原排 0.5.0 的字寬校準腳本順延到 0.6.0。
- 已知未定：帶文字的分隔線 page 在 Figma 側欄的顯示待驗；page 分區、代碼、調整區 Section 與衝突檢查尚無專案照完整結構跑過；`init_project.py` 不需改（範本已含新欄位），但沒有自動建 page 結構的腳本。

## 0.4.0 - 2026-09-29

第二個專案回流：Web 案（品牌官網）57 條 LESSONS 經分流（進 38／待觀察 19／留專案 0／作廢 0，見 `docs/backflow/triage-0.4.0.md`）。30 條和 0.3.0（APP 案）同一件事，補第二案證據；Web 手機設計稿由「尚未實測」改為實測做法；推翻或修改 3 條既有規則。

- 回流規則：入口閘門改成依根本原因分類（機制型一案可進；原則型要使用者確認；慣例型寫成「建議做法，待驗」；決策型留專案），取代「一律要第二案」。0.3.0、0.4.0 分流表補「類型」欄。見 `docs/backflow/README.md`。
- 使用者規範（非專案回流）：`core/s1-guideline.md` 新增「RWD 字級標準」——標題手機 ≤ 桌機；閱讀型文字手機至少 14px、內文建議 16px；12–13px 只給非閱讀文字。Guideline 04 章範本與 S7 R4 同步加檢查。專案要跟著改：下次 S1 或 S7 時照這條檢查現有 token，衝突列進 audit.md 由使用者決策。

**專案要不要跟著改**：
- 所有專案：覆蓋 `scripts/`（`figma_audit.js` 多兩類輸出，舊的 CONFIG 可沿用；新增 4 支腳本）。已在 S7 的專案，下一輪 R3 看 `rootSizingDrift`、`staleOverrides`，R5 影像上的文字對比照新做法重量一次。
- 引用 `references/figma-gotchas.md` 的專案文件（例：派工摘要 `refs/*.md`）：結構性操作與 instance 段已移到 `figma-instance-gotchas.md`，派工必讀清單要加上。
- Web 專案要做手機設計稿：照 `platforms/web.md` 新段落；已做完的不用重做。
- APP 專案：不用改檔；新開案可用 `init_project.py --unified-platform`（下述）。

改動：
- **推翻或修改**：
  - `capture-gotchas`「中文字寬：瀏覽器比 Figma 寬」→「字寬：方向依字型」。Web 案品牌字型是 Figma 較寬；對策加「母版文字框不貼齊內容寬」。
  - `core/s7-review.md` R5：影像上的文字對比不再用底色中位數，改成有字／無字兩張截圖相減、底色取 95 百分位（最壞）；中位數只在拍不到無字那張時退回並註明會高估。
  - `figma_audit.js`：0.3.0 刻意不比 instance 根層 sizing；0.4.0 另列 `rootSizingDrift`（instance FIXED、母版 HUG／FILL）。
- references：
  - `figma-gotchas.md` 已達 60 行上限，拆成兩份：`figma-gotchas.md`（讀取來源、四條原則、版面）與新檔 `figma-instance-gotchas.md`（結構性操作表、換成乾淨 instance、instance 能改和不能改、覆寫停在舊值）。SKILL.md、s3、s4、css-to-figma、README、backflow README 的指向已更新。
  - 結構性操作表新增「改 layoutMode」「切變體」兩列；clone、resetOverrides、TEXT 屬性、resize 各列補 Web 案證據與對策；instance 表補「子層可改 FILL」「根層 minHeight」「exposedInstances」。
  - `figma-gotchas`：隱藏節點原則補 BOOLEAN 關掉的巢狀 instance、clone 保留隱藏層 FIXED；腳本屬性順序補「truncation 會重設 maxLines、textAutoResize 會清 truncation」、`combineAsVariants` 先切 page。
  - `css-to-figma`：新增 `flex-wrap`＋`space-between`＋`column-gap`、`calc(var(--lh) * 1em)` 兩列；inset 分隔線、em 各 mode、pointer:coarse 手機例外。
  - `capture-gotchas`：長頁不用 fullPage 補 Web 手機分段截圖做法；1x 補 Web 證據。
  - `integer-rules`：§4 單欄比例卡取整差累積 → 逐段比 y；§6 instance 比例框 resize 後設回 HUG。
- platforms／core：
  - `platforms/web.md`：S3 新增「手機母版」（Device 變體＋變體上切 Mobile mode、加變體前先量他頁、觸控環境量測、Responsive 樣式三項齊比）；S4 Mobile 設計稿與 Mobile 對位改為實測做法。Tablet 設計稿維持待驗。
  - `core/s3-figma-ds.md` §4：內文與會換行的標題預設 FILL。
  - `core/s4-rebuild.md`：流程 3 連到「換成乾淨 instance」並先清頁面覆寫；驗收加「逐區段比 y，不只比頁高」。
  - `core/s7-review.md`：R2 改成先跑全頁文字自動比對；R3 加兩類掃描；R4 發現附選擇器；R5 點擊區聯集。
  - `core/parallel.md` §5：補 Web 案證據（單一 agent 改母版也會和頁面覆寫疊加）。
- scripts：
  - 新增 `r2_texts_web.cjs`（Playwright 量網站文字區塊行框頂，`--mobile`＝isMobile＋hasTouch）、`r2_texts_figma.js`（use_figma 取設計稿文字框）、`r2_text_match.py`（前 12 字配對，列 dy＞4 與行數不同）。
  - 新增 `contrast_on_image.py`：有字／無字兩張截圖相減量影像上的文字對比。
  - `figma_audit.js`：新增 `rootSizingDrift`、`staleOverrides`（和母版同值的非內容覆寫）。
- 開案（主控完成，同版記錄）：
  - `scripts/init_project.py` 新增 `--unified-platform`（APP：iOS／Android 不差異化）：不建 `modes.Platform`、viewports 只留 Phone（＋可選 Tablet）、預填 `platform_policy`、寫入 `options.unified_platform`。
  - `templates/project/manifest.json` 的 figma 區塊新增 `same_file_note`。
  - `platforms/app.md` 開案分支改用 `--unified-platform`；SKILL.md 開場指令補上此選項。
  - 0.3.0「已知未定」的「`init_project.py` 還沒有不差異化選項」：**已解決**。
- 文件：
  - `docs/workflow.html` 更新到 0.4.0：新增「S0–S7 各代表什麼」一節（每站階段、白話說明、主要產出物）；APP 標示改 stable；頁尾來源改為 Web、APP 兩案實測並指向 `core/parallel.md`；修正手機寬度下的版面溢出。
  - `README.md`：平台狀態表更新（web 補手機設計稿與 S7 實測、平板待驗；app 升 stable）；回流流程改指向 `docs/backflow/README.md` 四關並在 `LOG.md` 記一列；目錄說明補 `parallel.md`、`figma-instance-gotchas`。
  - `SKILL.md`：腳本表補 0.3.0、0.4.0 新增的 7 支腳本與 `token_diff`、`figma_audit` 新功能；動 Figma 前必讀清單加 `figma-instance-gotchas.md`；開場指令補 `--unified-platform` 與差異化提問；鐵律 9 指向回流流程；並行例外指向 `core/parallel.md`。
- 已知未定：`r2_texts_figma.js`、`figma_audit.js` 新增的兩類掃描只在模擬節點樹上跑過，尚未在真實 Figma 檔實測；`overrideDrift` 同樣仍未在真實檔跑過（Web 案是手動找到同類問題）。待觀察 19 條等第二個 Web 案確認，其中建議程式化 3 條（cover 裁切 transform、registry class 覆蓋率、變數 → 文字樣式 → 母版影響清單）。

## 0.3.1 - 2026-09-29

S6 新增「wireframe 更新」規則。使用者回饋：APP 案 A／B 更新 wireframe 被當成重新設計，長出 Drawer v2、置中問候、Compact 商品卡等和既有元件重複的變體。

**專案要不要跟著改**：不用改檔，之後的 S6 拆解照新規則。

改動：
- `core/s6-extend.md` §1：新增「wireframe 更新（已有設計的頁面改版）」：wireframe 是參考架構，主要 UI 依據是 Guideline 既有元件與 key page；只有既有元件做不到的結構異動才新增；拆解表加「沿用的既有元件」「只改什麼」兩欄。
- `SKILL.md` 常見錯誤表加一列：「業主給了新 wireframe，照 wireframe 重畫」。

## 0.3.0 - 2026-09-29

APP 平台升為 stable：第一個 APP 案走完 S0–S7，88 條 LESSONS 經分流（進 81／留專案 6／作廢 1，見 `docs/backflow/triage-0.3.0.md`）寫回方法本體。

**專案要不要跟著改**：
- 所有專案：覆蓋 `scripts/`。
- 已有的 `manifest.token_diff_ignore` 裡因「DTCG 複合型讀不到」而列的變數可以移除（新版 token_diff 會比對）。
- 專案 `_design-loop/LESSONS.md`：狀態欄改用新的五種狀態（見下方 templates），舊條目不用改寫。

改動：
- 回流機制：
  - 新檔 `docs/backflow/`：回流流程（`README.md`，四關與判定定義的唯一出處）、回流紀錄（`LOG.md`）、各版分流表。0.2.0 的 `docs/upgrade-triage-0.3.0.md` 移到 `docs/backflow/triage-0.3.0.md`。
  - LESSONS 狀態新增「待觀察」「作廢」；`templates/project/LESSONS.md` 狀態欄改為「待升級（建議去向）／已升級 vX.Y／待觀察／只適用本案／作廢（原因）」，發現照「症狀 → 原因 → 對策」寫。
- 新檔 `core/parallel.md`：多 agent 並行的分層、契約檔、檔案所有權、派工前置、母版異動通報。
- `platforms/app.md`：experimental → stable；新增 iOS／Android「不差異化」開案分支、來源與 DS 同檔的唯讀守則、實測過的 APP 擷取流程。沒走過的段落（兩平台差異化、Dark、平板、工程交接）標「待驗」。
- references：`figma-gotchas` 新增「讀取來源」與「結構性操作會重設東西」兩張表，隱藏節點、綁色與渲染、SVG、腳本寫法各併成一條原則；`capture-gotchas` 改成流程／不支援清單／量測／中文字寬四段；`css-to-figma` 新增 6 列；`integer-rules` 補置中 .5 情境與 icon 小方點例外。
- core：
  - s0：讀取陷阱（`get_metadata` 只回第一個 page、Group 座標、旋轉節點、隱藏 effect、section 內 `download_assets` 帶底色）；來源與設計系統同檔時以 page 為界唯讀；1x 比對（推翻原本「maxDimension 取 2 倍」）；整組文字上下偏移先查 `line-height: normal`；`?static` 停動畫規則要放在一定會載入的 base CSS。
  - s1 手冊撰寫規範；s2 static 規則檢查、多頁可同時擷取；s3 開工前確認 MCP 讀得到字型；s4 新規則 8（畫面 chrome、疊層、長頁 AUTO）；s7 各輪判定細則。
- scripts：
  - 新增 `s0_shoot.cjs`、`s0_compare.py`：S0 自動位置比對（HTML 節點加 `data-figma`），Group 座標改用結構判斷
  - 新增 `tokens_build.py`：tokens.json（含 `comp-*.json` 碎片）→ tokens.css，碎片撞名報錯不寫檔
  - `token_diff.py`：支援 DTCG 複合型（fontFamily、shadow、cubicBezier），無法比的列「略過（複合型）」
  - `figma_audit.js`：新增 `overrideDrift`（instance 版面欄位覆寫≠母版）；icon 內小方點列為小數例外
- 已知未定：`overrideDrift` 尚未在真實 Figma 檔實測；`init_project.py` 還沒有「不差異化」選項，暫時照 app.md 手動拿掉 `modes.Platform`（0.4.0 已解決）。

## 0.2.0 - 2026-09-29

同步 hook 改成看檔案 mtime，不再只認 Edit/Write 的參數。起因：hook 原本只認 Edit／Write／MultiEdit 的 `file_path`，Bash heredoc、sed、python 腳本與 subagent 寫的檔全部漏記（APP 案實測：228 個受監看檔異動只記到 30 筆）。

**專案要不要跟著改**：
- 覆蓋 `scripts/sync_pending.py`。
- 把 `.claude/settings.json` 的 hook matcher 改成 `Edit|Write|MultiEdit|NotebookEdit|Bash`。
- 第一次觸發只會建 `_design-loop/.sync_state.json` 索引、不記錄，屬正常。

改動：
- `sync_pending.py`：改用 `_design-loop/.sync_state.json` 索引監看檔案 mtime，任何工具（Bash heredoc、sed、python 腳本、subagent）寫的檔都記得到。首次建索引或剛進 S5 時只建索引不記錄；一次超過 12 個檔記一行摘要。實測掃 2,860 個檔約 3 ms。
- `init_project.py`：`--install-hook` 的 matcher 加上 NotebookEdit、Bash。
- 文件同步：SKILL.md 腳本表與開場第 4 點、`core/s5-sync.md` 觸發條件、README 安裝說明、`templates/project/SYNC_PENDING.md`。
- 新檔 `docs/upgrade-triage-0.3.0.md`：APP 案 LESSONS 的回流分流表初稿（當時 85 條，0.3.0 定稿為 88 條），以及知識沉澱的四關流程與寫入原則。0.3.0 移到 `docs/backflow/`。
- 0.1.0 發布後補上（未升版）：新檔 `docs/workflow.html`——工作流說明頁（為什麼要這套、三邊與中樞、站別與輸入輸出、開案、三邊同步、延伸與復盤、agent 關係、方法怎麼長大、檔案地圖、鐵律，含流程圖）；README 開頭加連結。

## 0.1.0 - 2026-09-15

首版。從品牌官網案（多頁、CMS 列表／內容頁、捲動動態）走完 S0–S5 的紀錄萃取並泛化，並用 baseline／GREEN／兩輪重測的 subagent 情境測試修正文件。

**專案要不要跟著改**：首版，新案照 SKILL.md 開場跑 `init_project.py`。

改動：
- 站別 S0–S7、鐵律（HTML 是工作媒介、驗收過站、狀態寫硬碟、整數從母版守、改動走 S5、延伸先沿用、五視角復盤）
- 專案資料：`_design-loop/` 的 manifest（含 `token_map`、`token_diff_ignore`、`integer_policy`、`figma.source_file_key`）、registry（區塊層 class ↔ 手冊章節 ↔ Figma 母版 ↔ 設計稿）、DS_GAPS／SYNC_LOG／SYNC_PENDING／REVIEW_LOG／LESSONS
- 平台：web（stable）、app（experimental：四個 collection、iOS 預設寫 `:root`、`?platform=android`、未畫平台在 S1 對差異表驗收、Dark／平板確定才建 mode）
- references：CSS → Figma 換算、整數規則、Figma MCP 踩坑（含回傳 20KB 截斷、instance 改名）、擷取與 Playwright 踩坑
- scripts：
  - `init_project.py`：開案，web／app 預設，`--install-hook`
  - `sync_pending.py`：只在 `stage=S5` 時記錄異動
  - `extract_computed.js`、`capture_prep.js`：Playwright 量測與擷取前整理
  - `figma_export_variables.js`：精簡格式分批匯出
  - `token_diff.py`：codeSyntax 或 token_map 對應、斷點疊加、tokens.json 多 mode、例外清單
  - `figma_audit.js`：例外看母版名稱、線寬不算小數
  - `ratio_widths.py`、`build_guideline.py`
- templates：`guideline-outline.md`（Guideline 00–16 章大綱）；`project/` 下 manifest、registry、CLAUDE.snippet、DS_GAPS、FIGMA_DS_SPEC、LESSONS、REBUILD_PLAN、REVIEW_LOG、SYNC_LOG、SYNC_PENDING 範本
- 已知未定：網格餘數做法（integer-rules §5）、Web 平板／手機設計稿、APP 擷取流程
