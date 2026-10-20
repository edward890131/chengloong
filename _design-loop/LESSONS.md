# 專案心得（LESSONS）

design-loop 沒寫、這個專案實測發現的坑或規則。標「待升級」的會在維護 design-loop 時照 `docs/backflow/README.md` 評估併入方法。發現照「症狀 → 原因 → 對策」寫。

| 日期 | 站 | 發現 | 證據 | 狀態（待升級（建議去向）／已升級 vX.Y／待觀察／只適用本案／作廢（原因）） |
|---|---|---|---|---|
| 2026-10-20 | S0 | Figma 百分比行高在文字框內取整成整數 px（14×1.4→20、16→22、18→25、24→34、32→45、48×1.2→58）→ 照 1.4 寫多行段落累積差 3–7px → S0 一律寫整數 px | B、C、D 三人各自實測，手機服務流程整段 0 差 | 待升級（references/css-to-figma.md） |
| 2026-10-20 | S0 | Chrome 預設 `text-spacing-trim` 擠壓相鄰全形標點（「）。」「下，「」），Figma 不擠 → 斷行提早一兩字、置中偏移 → base body 加 `text-spacing-trim: space-all` | B、D、E 三人各自實測，加上後斷行全部對齊 | 待升級（references/css-to-figma.md） |
| 2026-10-20 | S0 | Figma stroke 不占版面（INSIDE）時，CSS border 會撐大元件 → padding 要扣掉框線寬 | 小按鈕 42→40，A、E 實測 | 待升級（references/css-to-figma.md） |
| 2026-10-20 | S0 | Figma 文字裡的 `\r` 渲染成有寬度的空格並計入置中寬度，瀏覽器會吃掉 → 用佔位 span 補寬 | 02、03 導言與內文 | 待升級（references/css-to-figma.md） |
| 2026-10-20 | S0 | 疊放輪播圖中 opacity-0 的變體，`get_design_context` 給的素材是空白圖 → 改用 `download_assets`（node 選 variant main component）取 rawImages，sha1＝imageHash；大圖偶爾只下載一部分，要驗 sha1 或用 PIL 開 | 01 cover 四張 | 待升級（references/figma-gotchas.md「讀取來源」） |
| 2026-10-20 | S0 | `download_assets` 匯出 section 內節點會帶入所有上層背景 rect／path，也會被元件框裁切 → 匯出後剝除上層背景 | 02 循環圖、03 標章 | 待升級（references/figma-gotchas.md） |
| 2026-10-20 | S0 | `get_design_context` 對 instance 內 absolute contents 群組的 left/top 錯 20–90px；縮放過的 instance 回未縮放子層座標 → 用唯讀 `use_figma` 讀 absoluteBoundingBox 減父框 | 04 動線圖、手機弧線 | 待升級（references/figma-gotchas.md） |
| 2026-10-20 | S0 | 用唯讀 `use_figma` 讀變體 `reactions` 與各變體子層座標，可把 Smart animate 輪播準確還原成 CSS keyframes | 01 cover、06 串場、08 CTA 背景 | 待升級（core/s0-source-to-html.md） |
| 2026-10-20 | S0 | 段落並行時 subagent 寫 REPORT.md 會被工具擋（.md 報告檔），由主控落檔；scratchpad 同名腳本互相覆寫 → 暫存檔放 `scratchpad/<負責人>/` | A、B、C 三人 | 待升級（core/parallel.md §4） |
| 2026-10-20 | S0 | Web 單頁拆段落並行還原：每段一份 partial（html／css／js／assets），`site/build.py` 串接；每段自驗後主控再做整頁驗收（各段 top 與總高、整頁像素差） | 9 段 5 人約 20 分鐘，整頁差 1.20%／1.82% | 待升級（core/parallel.md） |
