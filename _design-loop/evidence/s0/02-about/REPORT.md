# S0 · 02 什麼是水銷？· 負責人 B

（subagent 寫檔被擋，由主控依回報落檔）

電腦版 1695:20117、手機版 1695:19642。

動畫：`get_motion_context`（recursive）只有兩條 curve_pattern 的 path-trim（12s linear infinite），沿用 base `.cl-curve`。

## 驗收

| 寬 | 高 HTML／Figma | 像素差 | 位置最大差 | 斷行 |
|---|---|---|---|---|
| 1440 | 1452.97／1453 | 0.66% | ≤2px | 一致 |
| 375 | 1348／1348 | 1.00% | ≤2px | 一致 |

- Figma 截圖含弧線溢出（1686／1578 高），比對前裁到段落範圍。
- 手機四卡展開成一列，與替代 frame 2159:24425 一致。
- 641–1439：`scrollWidth` 等於視窗寬（641、768、1024、1280 實測）；641–1100 卡片改 2 欄，循環圖等比縮小。

## 素材（10）

- `value-cycle-l.svg`／`value-cycle-s.svg`：母版 1615:20998／1656:23465 整張匯出（文字已外框化），移除匯出帶入的 6 個上層背景元素，其餘 path 未改。
- 卡片插圖 8 檔：SVG＋2 張虛線圓 PNG。
- 弧線用 common 的 path。

## class（34，另用 base `.cl-curve`）

cl-about、__curve、__curve--whatis、__curve--cycle、__head、__heading、__eyebrow、__title、__lead、__cr、__panel、__cards、__card、__illus、__art、__art--flow、__art--witness、__art--renew、__art--trace、__witness-a、__witness-b、__witness-dot、__renew-dot、__renew-inner、__renew-outer、__card-text、__card-title、__card-desc、__only-l、__only-s、__cycle、__cycle-head、__pill、__cycle-sub、__cycle-img

## audit-source（照稿做）

- 卡 4 標題：電腦「永續數據追溯」（1695:20237）、手機「ESG 數據追溯」（2133:24449），用 `__only-l`／`__only-s` 切換。
- 卡 4 內文（1695:20238／2133:24450）：「或提供有 永續揭露」中間有半形空格。
- 導言（1695:20127／19651）結尾有 `\r`，Figma 把它算進置中寬度（約 4px），用 `.cl-about__cr` 補 4px 佔位。
- 每張卡都有隱藏的舊標籤圖層、隱藏 Line 19、隱藏卡 1695:20129，未做。
- 卡片 padding 與間距兩版不同：電腦 40/32/32、gap 16；手機 24、gap 12。
- 140% 行高 Figma 取整（16→22、14→20、18→25、32→45、24→34），寫成 px。
- 卡 3 插圖：手機版被裁切（2133:24412），電腦版沒有。
- 循環圖中心在白底上用 backdrop-blur，看不出效果。

## 互動

手機四卡 CSS 橫向滑動（scroll-snap、隱藏捲軸）。稿上沒有指示器。待使用者決定：是否加滑動提示、hover 狀態。

## 給主控

1. `text-spacing-trim: space-all` 移到 base `body`（主控已做）。
2. 循環圖是整張 SVG（文字外框化），S3 可直接對到母版 1615:20998／1656:23465；文字要可選取或翻譯就要改成 HTML 節點，座標已有。
3. 02 的 `curve_ani_cycle` 在電腦版往下超出段落 163px、疊到 03 上方，與稿一致；之後段落加底色時要整頁檢查疊放順序。

## LESSONS（待升級）

- `download_assets` 匯出 section 內節點會帶入所有上層的背景 rect 與 path（page 白底、section 框、容器），要逐一剝除，大約在前 16 行。
- Figma 百分比行高會取整成整數 px。
- Figma 文字裡的 `\r` 會渲染成有寬度的空格，瀏覽器會吃掉。
- img 帶 `width`／`height` 屬性時要寫 `height: auto`，否則 `aspect-ratio` 不生效。
- scratchpad 多個 subagent 共用，同名腳本會互相覆寫；改放 `scratchpad/<負責人>/`。
