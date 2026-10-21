# S0 · 01 首屏（含 header）· 負責人 A

（subagent 寫檔被擋，由主控依回報落檔）

電腦版 1695:20083（1440×800）、手機版 1695:19588（375×756），同一份 HTML，手機樣式在 `@media (max-width: 640px)`。

## 驗收

| 寬 | 位置 | 位置最大差 | 像素差異（灰階差 >40） | 斷行 | 缺圖缺字 |
|---|---|---|---|---|---|
| 1440 | 33/33 通過 | 1.8px | 3.94% | 一致 | 無 |
| 375 | 35/35 通過（data-figma-s 對手機 metadata） | 2.4px | 6.29% | 一致 | 無 |

- 像素差異來源：文字反鋸齒、cover 圖由 4096 原圖縮成 2400 寬的重新取樣、弧線邊緣。比對圖與局部放大（header、白卡、數據區、特色膠囊）已目視，顏色、位置、字重一致。
- header 按鈕：企業登入 98×40、免費預約 126×40，和 Figma 一致。
- 641–1439（暫定，Figma 無稿）：768、1024、1180、1280 無水平捲軸、無重疊。≤1240 數據區縮字級與留白；≤1180 隱藏中間導覽列；≤960、≤760 標題再縮。
- 1920：內容最寬 1440 置中，header 與弧線滿版。

證據：`1440_*`、`375_*`（figma／html／compare／pos／rects）、`meta_1440.xml`、`meta_375.xml`、tooltip 開啟 `1440_tooltip1/2.png`、`375_tooltip1/2.png`、其他寬度 `fluid_768/1024/1280/1920.png`、截圖腳本 `shoot.cjs`（http://localhost:8101）。

## 素材（14 個，無 Figma 暫時網址）

- cover-1〜4.jpg：`download_assets`（node 675:14948）取原圖，sha1 與 imageHash 一致；縮成最寬 2400、JPG 品質 82；cover-1 原為無透明 PNG，轉 JPG。
- logo-mark／logo-zh／logo-en.svg（logo 三個 Group，百分比定位，兩版共用）。
- icon-safe／icon-leaf／icon-recycle.svg、icon-info、tooltip-arrow、icon-menu、feature-divider.svg（分隔線用 CSS 畫，此檔備用）。
- 共用：assets/common 的 icon-arrow-w.svg、icon-arrow-w-20.svg、curve-pattern.svg 的 path。

## class（60 個，前綴 cl-hero）

cl-hero、__actions、__book、__book-arrow、__book-l、__book-s、__brand、__brand-service、__card、__cover、__cover-noise、__cta、__cta-arrow-l、__cta-arrow-s、__curve、__curve-clip、__desc、__feature、__feature-divider、__feature-icon、__feature-item、__feature-list、__feature-text、__feature-window、__header、__inner、__login、__logo、__logo-en、__logo-mark、__logo-zh、__main、__menu、__metric、__metric-label、__metric-label--park、__metric-label--tip、__metric-num、__metric-unit、__metric-unit--bold、__metric-unit--co2、__metric-value、__nav、__nav-link、__nobr、__num、__slide、__slide--1〜4、__tag、__tags、__tip、__tip--end、__tip-arrow、__tip-body、__tip-btn、__tip-pop、__title。另用 base 的 .cl-btn（--green／--black／--sm）、.cl-curve。

## audit-source

| # | 節點 | 稿上的值 | 疑似應該是 |
|---|---|---|---|
| 1 | 1695:38651「年碳吸附量約當」 | 文字框高 23（同層 label 19），該列數字 y=35（其他 31／32） | 19 |
| 2 | 1695:20103「公噸 CO2e」 | 文字框高 23、y=28（其他單位 19、y=30） | 中英混排所致，應為 19 |
| 3 | 1695:20113／手機 1695:38689「座大安森林公園」 | Bold 700，其他單位 Medium 500 | 確認是否刻意強調 |
| 4 | 數據區兩列 | 第一列 89、第二列 93 | 統一 label 列高 |
| 5 | 標題 1695:20089 vs 手機 1695:19638 | 40px 字距 2px vs 24px 字距 1.4px | 統一用 em 字距 |
| 6 | 手機 header 1695:19596 | 13.474px、行高 13.137、框線 0.842、間距 13.474／10.947（電腦版 ×0.842） | 取整 13／13／1／13／11 |
| 7 | 說明 1695:20091 | 全形標點在瀏覽器被擠壓，第 2 行多吃「共」；用 `.cl-hero__nobr` 綁「共榮。」維持斷行 | S1 決定是否設 max-width |
| 8 | 弧線 1695:25448 | 手機為電腦版 ×0.8，線寬 48→38.4 | 線寬是否固定 |
| 9 | tooltip L／S | 電腦寬 320、手機固定 200；手機右欄置中會超出 375（Figma 只畫左欄開啟） | 確認右欄對齊；目前右緣距畫面 8px，箭頭對準 icon |

## 給主控

1. `.cl-btn--sm` 高度 42 → 40（padding 8.5px 20px）。主控已改 base；段落內暫時覆寫可移除。
2. 主按鈕需依斷點換尺寸（電腦 18px、手機 14px）。手機版暫把 --sm 值抄到 `.cl-hero__cta`，箭頭兩張切換。
3. header 在 01 段落內（absolute、不 sticky）；若要 sticky 或全站共用需移到 `_head.html`。
4. skill 的 `s0_shoot.cjs` 走 file://，契約要求 http，另寫 `shoot.cjs`。

## 替代版本／互動（預設＝主畫面）

已做：
- cover 輪播（1750:34753/34759/34770/34781、手機 34793〜34796）：Figma 設定 10 秒自動、點擊換張、1→2→3→4→1、0.6s ease-out。HTML 淡入淡出，預設停第 2 張（主畫面），點圖換下一張；各張位置照兩版 variant。
- 特色膠囊垂直輪播（2159:23763/23787/23834）：4 秒換一條、上移 36px、0.6s ease-out，第 3 條後捲回第 1 條。手機為三顆固定標籤。
- 數據 tooltip（文字取自 1750:33895／1750:34068）：hover／focus 顯示，點擊開關，點外面或 Esc 關閉。
- `?static` 與 reduced motion：不自動輪播，停主畫面。

Playwright 已測：點擊 cover 2→3、膠囊 4 秒後位移、tooltip 截圖在 evidence。

待使用者補：
- cover 4→1 時，Figma 第 1 個 variant 多一層 40% 黑色疊色，轉場是否要暗場不明，未做。
- 特色膠囊 3→1 現為往回捲，是否改無縫往下循環。
- 手機 header 漢堡選單（1695:19600）無展開稿，只有按鈕。
- 平板導覽列暫時隱藏，等 768 定案。
- tooltip 出現／消失 Figma 無動畫設定，暫用 0.2s 淡入淡出。

## LESSONS（待升級）

- 疊放輪播圖中 opacity-0 的幾張，`get_design_context` 給的素材網址是空白圖（三節點 md5 相同）→ 改用 `download_assets`（node 選 variant 的 main component）從 rawImages 取原圖；raw 檔 sha1＝imageHash。
- `download_assets` 大圖偶爾只下載一部分（10MB 只拿到 36KB）→ 驗 sha1 或用 PIL 開，壞了重下。
- `get_screenshot` 截子圖層會被父層裁切；`use_figma` 回傳上限約 48KB，無法用 base64 傳回圖片。
- Figma 框線不占版面時，CSS 要從 padding 扣掉框線寬；base `.cl-btn--sm` 即此問題。
- Playwright 測 cover 點擊要點在沒被白卡、數據區、特色膠囊蓋住的區域。
