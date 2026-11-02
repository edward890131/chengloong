# S1 盤點：全站樣式 → design token（2026-11-02）

範圍：`site/css/base.css`＋`site/css/sections/01–10`（共 3,592 條宣告），以及 index／terms 在 1440、768、375 三個寬度的渲染結果。
量測原始資料：`_design-loop/measure/s1/*.json`（extract_computed.js）。

目前狀態：只有 11 個變數（`--cl-green-400…700`、`--cl-ink-900/800`＋3 個透明度、`--cl-white`、兩個字型），其餘都是寫死值。

---

## 1. 顏色

### 1-1 現況（出現次數，含 var 引用）

| 角色 | 值 | 次數 | 現在怎麼寫 |
|---|---|---|---|
| 品牌綠 300 | `#85f0b7` | 1 | 寫死（05 綠點標點） |
| 品牌綠 400 | `#1fc36c` | 8＋3 | `--cl-green-400`；04-process 有 3 處寫死 |
| 品牌綠 500 | `#14a558` | 17 | `--cl-green-500`（主按鈕、強調） |
| 品牌綠 600 | `#138248` | 5 | `--cl-green-600`（CTA、數據區） |
| 品牌綠 700 | `#15663c` | 17 | `--cl-green-700` |
| 綠色淡底 | `#e0ffe2`、`#e7feec`、漸層 `#deffdf→#e8feee→#e4ffeb` | 5 | 寫死（05 綠點卡） |
| 黑 | `#111`（ink-900） | 22＋1 | 變數；02-about 有 1 處寫死 |
| 主文字 | `#1f1f1f`（ink-800） | 16＋1 | 變數；02-about 有 1 處寫死 |
| 純黑 | `#000` | 3 | 寫死（04 圖片遮罩、09 footer） |
| 深灰 | `#444`、`#454545` | 2 | 寫死；兩個幾乎同色 |
| 中灰 | `#5c5c5c` | 1 | 寫死（04 卡片底） |
| 次要文字灰 | `#989898` | 5 | 寫死（02、04、05、07） |
| 淺灰底 | `#f6f6f6` | 13 | 寫死（全站卡片、膠囊底） |
| 更淺灰底 | `#f9f9f9` | 1 | 寫死（04 手機） |
| 骨架屏 | `#e6e9e7`、`#e9ebea`、`#f8faf9` | 7 | 寫死（base 載入骨架） |
| 插畫底 | `#e3dbd5` | 1 | 寫死（04 筆電插圖） |
| 白 | `#fff` | 53 | `--cl-white` |

透明度（疊在圖上或底色上）：

| 底色 | 透明度 | 次數 |
|---|---|---|
| ink-800 `rgb(31,31,31)` | .8／.6／.2／.1／.08 | 變數 3 種＋寫死 6 處 |
| ink-900 `rgb(17,17,17)` | .2／.32／.4／.72 | 寫死 5 處 |
| 黑 `rgb(0,0,0)` | .08／.12／.14／.24／.36／.48／.56 | 寫死 11 處 |
| 白 | .2／.24／.32／.4／.6／.8 | 寫死 12 處 |

### 1-2 問題

| # | 現況 | 出處 | 問題 | 建議 | 嚴重度 |
|---|---|---|---|---|---|
| C1 | 已有變數的顏色又寫死 | 02-about.css:509, 537, 551, 554；03-paper:197；04-process:204, 316, 524, 890；base:287 | 同一顏色兩種寫法，改色會漏 | 全部改成 token | 高 |
| C2 | 深色遮罩用三種黑：`#000`、`#111`、`#1f1f1f`，透明度 11 種 | 01、04、05、08 | 進 Figma 會變成十幾個近似色 | 遮罩統一用一個基底（建議 `#111`），透明度收成 4 階 | 高（需拍板） |
| C3 | 白色透明度 6 種 | 01、04、05、base | 同上 | 收成 3–4 階（.2／.4／.6／.8） | 中（需拍板） |
| C4 | `#444` 與 `#454545` | 05-green:303、base:129 | 幾乎同色 | 合併為一個 | 低 |
| C5 | 骨架屏三個灰、插畫底 `#e3dbd5` | base:232、04:127 | 不是 UI 角色 | 列為「插圖／效果專用」，不進正式色票 | 低 |
| C6 | 次要文字灰 `#989898` 與 ink-800-60 並存 | 02、04、05、07 | 兩種「次要文字」 | 需拍板：保留 `#989898` 當 disabled／placeholder，或併入 ink-800-60 | 中（需拍板） |

### 1-3 提案（三層）

- **ref**（原始色）：`green-50/300/400/500/600/700`、`neutral-0（白）/50 #f9f9f9/100 #f6f6f6/400 #989898/600 #5c5c5c/700 #444/800 #1f1f1f/900 #111`、`black #000`。
- **sys**（角色，開發只用這層）：
  - text：`text-primary`（ink-800）、`text-strong`（ink-900）、`text-secondary`（ink-800 .6）、`text-tertiary`（ink-800 .8 或 #989898，看 C6）、`text-on-dark`（白）、`text-on-dark-secondary`（白 .8）、`text-accent`（green-500）
  - surface：`surface`（白）、`surface-muted`（#f6f6f6）、`surface-inverse`（#111）、`surface-brand`（green-600）、`surface-brand-subtle`（綠淡底）
  - border：`border`（ink-800 .1）
  - accent：`accent`（green-500）、`accent-hover`（green-700）、`accent-light`（green-400）
  - overlay：`scrim-1…4`（看 C2）、`glass-light`（白 .2）
- **comp**：只在元件需要時加（例 `btn-black-hover`）。

---

## 2. 文字（typography）

### 2-1 現況

字型：Noto Sans TC（內文）、Montserrat（數字、英文 eyebrow）。字重 4 種：700×42、400×18、600×12、500×5。

字級 21 種：12、13、13.474、14、15、16、18、20、22、24、28、30、32、36、40、48、64、75、86、96 px，另有 hero 的流動字級（`calc(n × --cl-hero-hp)`）與循環圖的 `cqw`。

同一個角色出現多種寫法（D＝桌機，T＝平板，M＝手機）：

| 角色 | 現況寫法（字級／行高／字距） | 出處 | 建議標準 |
|---|---|---|---|
| 區塊標題 H2 | 32/45/1px（about ×4）、32/1.4（=44.8）/1px（faq）、32/45/.5px（green-name） | 02、05、07 | **32/45/1px**；T 28/39；M 24/34 |
| 頁面標題 H1 | 40/56/1px | 10-terms | 40/56；M 28/40 |
| 卡片大標 H3 | 24/34/.6px；M 20/28/1px | 03-paper | 24/34/.6；M 20/28（字距跟桌機一致） |
| 條款小標 H4 | 22/32/.6；M 18/28 | 10-terms | 保留 |
| 小標 Title-S | 18/25/.6（about card）、18/25/.5（process step）、18/26/.36（process tab）、18/22/.36（faq tab） | 02、04、07 | **需拍板**：建議 18/25/.5，頁籤另立 `tab` 樣式 |
| 內文 Lead | 16/22/.3（about、paper）、16/1.4（faq 問題）、16/23/.32（footer label） | 02、03、07、09 | 16/22/.3 |
| 長文內文 | 16/28/.3；M 15/26 | 10-terms | 保留（閱讀型，獨立樣式） |
| 內文 Body | 14/20/.3（多數）、14/20/.56（tooltip）、14/1.4/.32（footer）、14/1.4（faq 答案） | 01、02、03、04、07、09 | **14/20/.3** |
| 說明 Caption | 13/20/.4（手機 tooltip）、13/18/.4（滑動提示） | 01、02 | 13/18/.4（只給非閱讀文字） |
| Eyebrow（英文） | 12/15/1px Montserrat 600；12/normal | 02、05 | 12/15/1px |
| Overline | 16/20/1.6px Montserrat | 10-terms | 與 Eyebrow 合併成兩個尺寸 |
| 數字大字 | 64/77、48/58、40、24/29、20/1.2（皆 Montserrat） | 03、04、05、07 | 收成 `num-xl/l/m/s` 四階 |
| 按鈕 | 18 600；sm 14/21 | base | 保留 |
| Footer 標語 | 86；M 75；中間流動 | 09 | 保留（display，流動） |

### 2-2 問題

| # | 問題 | 出處 | 嚴重度 |
|---|---|---|---|
| T1 | 同角色多種行高、字距（見上表），進 Figma 會長出 20 多個近似文字樣式 | 多處 | 高 |
| T2 | 字距寫 px，而且 .3／.32／.36／.4／.5／.56／.6 混用 | 多處 | 中：建議改成 em（例 .02em），字級變了字距自動跟著算 |
| T3 | 閱讀型文字小於 14px：hero 說明最小 12px（`max(12px, …)`）、手機 tooltip 13px | 01-hero:199, 249, 873 | 高（違反 RWD 字級標準） |
| T4 | 13.474px 等小數字級 | 01-hero:610 | 中（Figma 會有小數） |
| T5 | hero 標題用 `--cl-hero-hp` 依視窗高度縮放，另有 5 個額外斷點 | 01-hero | 中：Figma 只能做 3 個 mode，這段標成「流動例外」，Figma 用 1440×900 的值 |

---

## 3. 間距（spacing）

現況：padding 37 種、margin 29 種、gap 17 種。

- 落在 4 的倍數、常用的：4、8、12、16、20、24、32、40、48、56、64、80、120。
- 不在階梯上：6、10、13、14、18、21、22、26、28、36、52、60、62、72、96、108、140、150、160、280、300。
- 小數（Figma 換算殘留）：.842、8.5、10.947、13.474、28.36、40.64、66.4、128.5、140.64。

| # | 問題 | 出處 | 建議 | 嚴重度 |
|---|---|---|---|---|
| S1 | 小數間距 9 種 | base:100、01-hero:575, 602–610, 738、02-about:13, 261, 305 | 取整；按鈕 8.5 是「40 高扣 1px 框線」，改成 `min-height: 40px`＋整數 padding | 高 |
| S2 | 階梯外的值 20 多種 | 多處 | 提案階梯：`space-1…12` ＝ 4／8／12／16／20／24／32／40／48／64／80／120；區塊間距另立 `section-y`（桌機 120、平板 80、手機 64，待量） | 中 |
| S3 | 一次性值（如 280、300、-799.5） | 01、04 | 這些是圖片定位，不是間距，不進 token | 低 |

---

## 4. 圓角（radius）

現況：1、4、8、12、14、16、20、32、100、999 px。

| # | 問題 | 建議 | 嚴重度 |
|---|---|---|---|
| R1 | 膠囊形用 100px 和 999px 兩種 | 統一 `radius-full: 999px` | 中 |
| R2 | 14px 只用一次 | 併入 12 或 16 | 低 |
| R3 | 提案階梯 | `radius-xs 4`、`sm 8`、`md 12`、`lg 16`、`xl 20`、`2xl 32`、`full 999`；1px 是線條細節，不列入 | — |

---

## 5. 陰影與模糊（elevation）

- 陰影只有一種：`0 2.2 11 rgba(0,0,0,.14)`（價值循環圖的白圈與牌卡，數值來自 Figma）；另有焦點框 `inset 0 0 0 3px 白`。
- 毛玻璃（backdrop blur）四種：12、32、42、52 px。

| # | 問題 | 建議 | 嚴重度 |
|---|---|---|---|
| E1 | 陰影帶小數（2.2） | `shadow-1: 0 2px 12px rgba(0,0,0,.14)`；Figma 同值 | 中 |
| E2 | 毛玻璃 4 種 | 收成 `blur-sm 12`、`blur-md 32`、`blur-lg 52`（42 併入 52 或 32） | 低（需拍板） |
| E3 | 焦點框只在 04 卡片有 | 列為全站 `focus-ring` token，其他互動元件一併套用 | 中 |

---

## 6. 斷點

manifest 只有 3 個 mode（桌機／平板 ≤1100／手機 ≤640），CSS 實際用了 16 種 media query（1441+、1101+、1439、1366、1240、1200、1199、900、760、700…），多數在 hero 和 footer 標語的流動調整。

| # | 建議 | 嚴重度 |
|---|---|---|
| B1 | token 只做 3 個 mode；額外斷點列為「流動例外」寫在手冊，不進 Figma Variables | 中 |

---

## 7. 等使用者拍板

1. **C2 深色遮罩**：統一用 `#111` 為基底，透明度收成 .2／.4／.56／.72 四階？
2. **C6 次要文字**：`#989898` 保留成獨立的「tertiary／disabled」，還是併入 ink-800-60？
3. **Title-S 18px**：統一 18/25/.5，頁籤另立 `tab` 樣式？
4. **T3**：hero 說明與手機 tooltip 拉到 14px（會影響版面），或登記為例外？
5. **T2**：字距改成 em？
6. **S2／R／E**：間距、圓角、陰影、毛玻璃階梯照上面的提案？

拍板後的下一步：建 `tokens.json`＋`tokens.css`（ref → sys → comp），把 CSS 寫死值換成 token（S2，掃描歸零），再進 Figma 建 Variables 與文字樣式（S3）。

---

## 8. 決策紀錄（2026-11-02，使用者：照建議做一版，第 4 點先用 14px）

分支：`claude/design-tokens`（不動 main）。預覽：https://claude.ai/artifact/LwhvPwA9G6juqwPo8y7wBx

| # | 決策 |
|---|---|
| C2 | 深色遮罩基底 `#111`，`scrim-10/20/40/56/72`（原 .08／.12→10、.24→20、.32／.36→40、.48→56） |
| C3 | 白色疊加 `veil-20/40/60/80`（.24→20、.32→40） |
| C4 | `#454545` 併入 `#444`（ref neutral-700） |
| C5 | 骨架屏、筆電插圖、綠點卡漸層與色塊放 comp 層（`--cl-c-*`），不進 sys 色票 |
| C6 | `#989898` 保留為 `text-tertiary`／`surface-neutral-soft` |
| T1 | 文字收成 25 個角色（tokens.json `sys.type`），每個角色桌機／平板／手機三組值；字級與行高寫 px（Figma 取整），字距寫 em |
| T3 | hero 說明、hero 特色文字最小 14px；手機 tooltip 13→14px（使用者：太大再改回 12） |
| Title-S | 18/25 字距 .03em；頁籤另立 `tab`（18/26，手機 16/23），FAQ 頁籤因此高 4px |
| S1 | 小數間距全部取整：按鈕 8.5 → `min-height: 40px`＋padding 8；140.64→140、40.64→40、28.36→28、66.4→64、128.5→128；Logo 字樣 13.474→13 |
| S2 | 間距 token：2–120 共 22 階（`--cl-space-N`，N＝px）；21→20、13→12、26→24 |
| R1 | 圓角 xs 4／sm 8／md 12（14 併入）／lg 16／xl 20／2xl 32／full 999（100 併入） |
| E1 | `shadow-1: 0 2px 12px` 14% 黑；`focus-ring`；毛玻璃 sm 12（原 8 併入）／md 32／lg 52（原 42 併入） |

## 9. 登記例外（不進 token）

| 類別 | 位置 | 理由 |
|---|---|---|
| hero 流動字級 | `01-hero.css` `.cl-hero__title`、`__metric-*`、`__feature-text`、`__desc`、`__cta`（`--cl-hero-hp` 與 641–1240 間的額外斷點） | 依視窗高度縮放；Figma 以 1440×900 的值呈現 |
| 價值循環圖 | `02-about.css` `.cl-cycle-h*`（cqw） | 整張圖依寬度等比縮放，數值是 Figma 1200 座標換算 |
| Footer 標語 | `.cl-footer__slogan` 平板（5.972vw、clamp） | 流動字級 |
| 載入畫面數字 | `.cl-loader__num`、`__unit`（clamp） | 流動字級 |
| Logo 字樣 | `.cl-hero__brand-service` | 隨 Logo 縮放 |
| 版面定位值 | 區塊上下內距 ≥140（140／150／160／280）、`-799.5px`、`calc(108px + 80vw)`、header 下拉位置 60／62 | 版面幾何，不是元件間距 |
| 1px | 細線、框線補償 | hairline |
| 綠點英文大字 1101–1199 | `.cl-green__en` clamp | 流動字級 |

## 10. 整理後差異（同一份 ?static 截圖比對）

- 頁高：桌機 9898→9901、平板 10560→10551、手機 9565→9562；條款頁三個寬度不變。
- 主要來源：FAQ 頁籤 +4px；綠點卡名稱在平板 32→28px（套區塊標題的平板值）；footer 標籤行高 23→22；行高 1.4 的文字取整為 px（±1）。

## 11. 文字命名改版（2026-11-02，比照前案 Pikki「文字樣式總表」）

使用者決定：1. 命名改成「類別／尺寸／字重」；2. 英文小標另開 `Overline`；3. 字距維持各 style 自己的值，不歸 0。

- 類別 7 種：Display（Montserrat 數字）、Title、Paragraph、Label、Button、Overline（Montserrat 英文小標）；Subtitle 本案沒有對應角色，不建。
- 尺寸 XXL～XXS；字級、行高、字距按「類別／尺寸」設 token（CSS `--cl-{類別}-{尺寸}-fs／-lh／-ls`，tokens.json `sys.type.{類別}.{尺寸}`）。
- 字重寫進 text style 名稱：tokens.json `sys.textStyle.{類別}.{尺寸}.{字重}`（typography 複合型，description 寫用途與 CSS class），共 31 個。
- 舊角色 → 新名稱：h1→Title/XXL、h2→Title/XL、h3→Title/L、h4→Title/M、title-l→Title/S、title→Title/XS；display→Display/XXL、num-xl→Display/XL、num-l→Display/L、num-m→Display/M、num-label→Display/S、num-s→Display/XS、num-xs→Display/XXS；body-long→Paragraph/L、body-l→Paragraph/M、body→Paragraph/S；tab→Label/L、tab-s 與 nav→Label/M（nav 行高 24→23）、caption→Label/S、micro→Label/XS；btn→Button/L、btn-sm→Button/S；overline→Overline/M、eyebrow→Overline/S。
- 補字距：原本沒寫字距、但用角色字級的 7 條規則補上該尺寸字距（nav、hero tag、準備流程名稱與方式、綠點資訊標題與膠囊、footer 副標與版權），Figma style 才對得起來。
