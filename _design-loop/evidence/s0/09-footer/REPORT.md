# 09 footer：REPORT（負責人 E）

來源：電腦版 1695:29473（footer/l，1440×490）、手機版 1695:29472（footer/s，375×705）。檔案：`site/src/sections/09-footer.html`、`site/css/sections/09-footer.css`、`site/js/sections/09-footer.js`、`site/assets/09-footer/`。

## 驗收
| 寬 | 段落尺寸 HTML／Figma | 位置最大差 | 像素差異（>40） | 斷行 |
|---|---|---|---|---|
| 1440 | 1440×490／1440×490 | ≤1px | 0.77% | 一致 |
| 375 | 375×705／375×705 | ≤1px（回頂部 489.4／489） | 2.00% | 一致 |

- 比對圖 `1440_compare.png`、`375_compare.png` 已目視確認（logo、三欄、標語、灰色弧線皆疊合）。
- 641–1439：inner 改為正常流、欄位可換行，標語字級 clamp，無水平捲軸（768 已截圖確認不重疊）。

## 素材（4）
`logo-mark.svg`、`logo-zh.svg`、`logo-en.svg`（logo/b 三個 Group，位置照 Figma 百分比）、`line-top.svg`（Line 14，白 20%）。弧線用 common path（色改 #F6F6F6）；按鈕用 common。

## class（27）
cl-footer、__only-l、__only-s、__curve、__inner、__logo、__logo-part、__logo-part--mark／--zh／--en、__row、__tagline、__brand、__sub、__copy、__info、__item、__item--tel／--addr／--hours、__label、__value、__value--num、__top、__line、__slogan、__slogan-hl。

## audit-source
| frame | 節點 | 值 | 疑似應該是 |
|---|---|---|---|
| footer/l vs footer/s | 1695:29208／29186 品牌行 | 電腦「正隆｜機密文件水銷服務」、手機「竹北廠 · 免費機密文件水銷服務」 | 應同一文案（照稿用 `__only-l／__only-s` 各顯示一份） |
| footer/l vs footer/s | 1695:29209／29187 副標 | 電腦「數位化水銷追溯與綠點存摺」、手機「2013 年至今，全程可追溯銷毀與綠點回饋」 | 同上 |
| 兩版 | 1695:29210 copyright 圖層名 | 名稱含「All Rights Reserved.」，文字沒有 | 確認是否要加 |
| 兩版 | 字距 | 品牌 .16、欄標 .32、電話／時段 .5、地址 .32（繼承 li） | 收斂成一兩種 |
| 兩版 | 1695:29220 服務時段 | 中文也套 Zalando Sans Expanded（Figma fallback 到中文字型） | 中文段應是 Noto Sans TC（瀏覽器結果相同） |
| 兩版 | 文字框高 | 地址 40、時段 80／120（n×19.6 進位） | 手機照稿補 min-height 讓回頂部按鈕對位 |
| footer/l | Line 14 白 20% 在白底 | 看不見 | 原本給深色底用？照做 |
| 兩版 | 標語 left calc(50% - 727px)／-194.5px，超出邊緣被裁切 | 照稿 | 設計意圖（確認） |

## 共用元件／base 需求（給主控）
1. **字型**：電話與服務時段用 `Zalando Sans Expanded` 400，`_head.html` 沒載入。暫時在本段 partial 開頭放 `<link>`（Google Fonts），請移到 `_head.html`（可併進現有 css2 網址：`&family=Zalando+Sans+Expanded:wght@400`）後刪掉 partial 裡那行。
2. `.cl-btn--sm` 總高 42／寬 86 vs Figma 40／84、圓 top 39 vs 40（同 08 REPORT 第 1、2 點）。本段 `.cl-footer__top` 暫覆寫。
3. `.cl-curve` 顏色固定綠；footer 弧線是 #F6F6F6。本段用 `.cl-footer__curve .cl-curve path { stroke }` 覆寫，建議 base 加 `--gray` modifier 或用 CSS 變數 `--cl-curve-color`。

## 互動與動畫
- 做了：弧線描線 12s（base；`?static` 停在完整弧線）；回頂部（smooth scroll，static／reduced-motion 時直接跳）；按鈕 hover（base）；電話 `tel:` 連結。
- 待使用者補：logo 連結目的地；標語是否有跑馬燈／進場動畫（稿上 motion 只有弧線）。

## LESSONS
- footer 的弧線在 instance 內（footer/l → curve_ani_footer → curve_pattern → VECTOR），和 cta 一樣直接讀 absoluteTransform 換 matrix，一次對齊。
