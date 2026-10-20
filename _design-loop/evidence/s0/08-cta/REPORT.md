# 08 cta：REPORT（負責人 E）

來源：電腦版 1695:20404（1440×720）、手機版 1695:19927（375×664）。檔案：`site/src/sections/08-cta.html`、`site/css/sections/08-cta.css`、`site/assets/08-cta/`（無 js）。

## 驗收
| 寬 | 段落尺寸 HTML／Figma | 位置最大差 | 像素差異（>40） | 斷行 |
|---|---|---|---|---|
| 1440 | 1440×720／1440×720 | ≤1px（內容 176.4／176） | 1.13% | 一致 |
| 375 | 375×664／375×664 | ≤1px（內容 150.1 高 300／149 高 302；Figma 文字框進位） | 3.81% | 一致 |

- 比對圖 `1440_compare.png`、`375_compare.png` 已目視確認：弧線位置、粗細、裁切與 Figma 疊合（差異圖只剩邊緣 1px 反鋸齒線），照片、疊層顏色一致。
- 641–1439：卡片隨寬縮，背景固定 1280×600 置中，弧線容器左右錨定，無水平捲軸。

## 做法重點
- 弧線：用 `use_figma` 唯讀讀 `curve_pattern` VECTOR 對卡片的 absoluteTransform，加上 stroke 外擴 24（手機元件縮 0.8，連 stroke 38.4 一起縮）換成 CSS `matrix()`，svg 用 common 的 path（`pathLength="1"`）原尺寸放容器左上。容器照 curve_ani_cta-left／right 的大小與 overflow clip（手機 1600×480 會裁到弧線，必要）。圖層順序：弧線在文字之上，照稿。
- 背景：`ctabg_img/l`（1600:16009）照片有 Figma 濾鏡（exposure/contrast/temperature/highlights/shadows）＋opacity .48＋NOISE effect，CSS 做不出來 → 用 get_screenshot 取該節點 1x 合成圖 `bg-composite.jpg`（1280×600），黑色 .48 疊層用 CSS。MCP 給的原照片只有 683×1024 且已烤 alpha，未採用。

## 素材（1）
`bg-composite.jpg`。按鈕圓、箭頭用 common。

## class（14）
cl-cta、__card、__bg、__bg-img、__bg-img--zoom、__bg-black、__content、__text、__title、__desc、__actions、__curve、__curve--left、__curve--right。

## audit-source
| frame | 節點 | 值 | 疑似應該是 |
|---|---|---|---|
| 兩版 | 1695:20407～20412（照片、Vector 3998、Giving paper new life.、引號、Ellipse） | hidden | 舊版殘留，未做 |
| 兩版 | 1695:20420 curve_ani_cta | hidden | 舊版單條弧線，未做 |
| 手機 | 1695:19936 內容 | top calc(50%+0.12px)、弧線容器 0.12 偏移 | 0（小數殘差） |
| 背景 | cta_bg time=1 | `ctabg_img/l` aspect 1280/600 跟寬度走，但手機用固定 1280×600 | 一律固定 1280×600 置中（已這樣做） |

## 共用元件／base 需求（給主控）
1. `.cl-btn--sm` 總高 42、寬多 2：base 用 `padding: 9.5px 21px` 再加 `border: 1px`，Figma stroke 是 INSIDE（總高 40）。建議 base 改 `padding: 8.5px 20px`。本段手機按鈕暫在段落內覆寫。
2. `.cl-btn--sm .cl-btn__circle { top: 39px }` 在 40 高的按鈕會露 1px 圓弧；Figma 圓在 y=40（805:5658）。建議改 40。段落內暫覆寫。
3. 同一份 HTML 手機要 sm、電腦要 18px：base 沒有「隨斷點變 sm」的寫法，本段在 `@media (max-width:640px)` 內照 --sm 值覆寫。建議 base 提供 `.cl-btn--sm@s`（或 `--sm-mobile`）modifier。
4. common 沒有深色 20px 箭頭（`icon-arrow-dark-20`）；24 版等比縮成 20 形狀相同，本段直接把 `icon-arrow-dark.svg` 設 20×20。

## 互動與動畫
- 做了：
  - 弧線描線 12s（base `.cl-curve`；`?static` 停在完整弧線＝設計稿）。
  - 背景 Ken Burns：cta_bg 變體 time=1 →（AFTER_TIMEOUT 0.001s，SMART_ANIMATE linear 10s）→ time=2（照片＋noise 放大到 1536×720，scale 1.2 置中）→（AFTER_TIMEOUT 2s，DISSOLVE ease-in-out 0.3s）→ time=1。CSS 12.3s 循環，dissolve 用上下兩張圖、上層淡出實作。`?static`／reduced-motion 停在 scale 1（＝主畫面）。
  - 替代版 2159:24233／2159:25573＝主畫面同一稿（time=1）；2159:24271／2159:25610＝time=2 放大狀態。判定為上述背景動畫的兩個影格，不是另一種版型。
  - 按鈕 hover（base 圓放大，Figma ON_HOVER→805:5699／805:5676 等 hover 變體）。
- 待使用者補：按鈕連結目的地（查詢狀態／立即預約）。

## LESSONS
- 實例裡的弧線位置用 get_design_context 推不準（巢狀 rotate＋scale-y＋實例覆寫），直接讀 VECTOR 的 absoluteTransform 換 matrix 最穩，一次就和稿疊合。
- 有 Figma 圖片濾鏡＋NOISE 的照片：get_screenshot 該層（元件內 plain id）取合成圖，最貼稿；instance 子層 id（I…;…）不能給 get_screenshot，要用主元件裡的對應節點。
