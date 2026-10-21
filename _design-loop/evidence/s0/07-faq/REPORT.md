# 07 faq：REPORT（負責人 E）

來源：電腦版 1695:20379（1440×974）、手機版 1695:19900（375×828）。檔案：`site/src/sections/07-faq.html`、`site/css/sections/07-faq.css`、`site/js/sections/07-faq.js`、`site/assets/07-faq/`。

## 驗收
| 寬 | 段落尺寸 HTML／Figma | 位置最大差 | 像素差異（>40） | 斷行 |
|---|---|---|---|---|
| 1440 | 1440×973／1440×974 | ≤1px（Q1 卡高 155.2／156） | 0.80% | 一致 |
| 375 | 375×828／375×828 | ≤2px（Q1 卡高 202.8／204，下方各卡上移 1–2px） | 3.41% | 一致 |

- 比對圖：`1440_compare.png`、`375_compare.png`（Figma｜HTML｜差異），已目視確認。差異只剩文字反鋸齒與 1–2px 位移（Figma 文字框高把 n×行高 進位）。
- 擷取時把其他段落設 `display:none` 再截（其他段落同時在寫，element screenshot 會被別人的版面干擾）。
- 641–1439：左右 padding 用 clamp 縮小、頁籤可換行，768／1024／1280 無水平捲軸。

## 素材（4）
`icon-minus-32.svg`、`icon-add-32.svg`（電腦）、`icon-minus-24.svg`、`icon-add-24.svg`（手機；24 版線寬不是 32 版等比縮小，用 `<picture>` 依斷點切換）。

## class（20）
cl-faq、__head、__eyebrow、__eyebrow-dot、__title、__body、__tabs、__tab、__tab--tall、__tab-dot、__list、__item、__q、__num、__question、__icon、__icon-minus、__icon-add、__a、__answer。狀態：`.is-active`（頁籤）、`.is-open`（題目）。

## audit-source
| frame | 節點 | 值 | 疑似應該是 |
|---|---|---|---|
| 手機 faq | 1695:19913 頁籤「準備與分類」 | 文字框高 23、頁籤高 39（y=0） | 同另兩顆 19／35（y=2），已用 `--tall` 照稿做 |
| 手機 faq | 1695:19907 說明文字 | hidden，內容是 02 段落的文案 | 誤留圖層，未做 |
| 兩版 | list 內 Line 21–24 | hidden，寬 780 | 舊分隔線，未做 |
| 兩版 | list_faq_card 預設答案（元件內）與實例覆寫不同 | 用實例覆寫文字 | — |

## 共用元件／base 需求
- 無。頁籤色 `#f6f6f6`、`#989898` 未進 base 變數（S1 收斂時注意：卡片底也是 #f6f6f6，footer 弧線也是 #f6f6f6）。

## 互動
- 做了：分類頁籤切換（click＋左右鍵）、手風琴各題獨立展開收合（+／− 切換、aria-expanded）。預設＝主畫面（第一個頁籤、Q1 展開）。
- 待使用者補：「準備與分類」「水銷證明與綠點回饋」稿上沒有題目，目前 js 複製第一組題目（全收合）只保留切換結構，panel 上有 `data-todo`。展開動畫（高度過場）稿上沒有，未做。手機頁籤列超出畫面，現在做成可橫向捲動，切換時是否要自動捲到可見待確認。

## LESSONS
- Chrome 預設 `text-spacing-trim` 會把相鄰全形標點（「）。」）壓成半形寬，Figma 不壓 → 1440 答案斷行差一字。段落根加 `text-spacing-trim: space-all` 後一致。建議寫進 css-to-figma／base。
