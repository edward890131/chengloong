# 05 綠點存摺與憑證（負責人 D）

電腦版 `1695:20313`（1440×1440）／手機版 `1695:19826`（375×1707.88）
檔案：`site/src/sections/05-green.html`、`site/css/sections/05-green.css`、`site/js/sections/05-green.js`、`site/assets/05-green/`

## 驗收（`?static`，deviceScaleFactor 1）

| 寬 | 段落高 HTML／Figma | 主要元素位置最大差 | 像素差異（>40，最佳 dy） | 斷行 | 結果 |
|---|---|---|---|---|---|
| 1440 | 1440／1440 | ≤1px（標題字形 1px；pill 高 34.4 vs 34） | 1.10%（dy -1，頁面 y 小數造成） | 全部一致 | 通過 |
| 375 | 1707.88／1707.88 | ≤1px | 0.60% | 全部一致 | 通過 |

- 比對圖：`1440_compare.png`、`375_compare.png`（Figma｜HTML｜差異紅點）；來源 `figma_*.png`、HTML `html_*.png`。
- 剩餘差異：圖片重採樣邊緣、文字反鋸齒；證明文件為點陣圖（見下）。
- 641–1439：1000／800／641 無水平捲軸；641–1199 另加流動規則（英文大標縮字、資訊框左右 12、ESG 手圖不小於 492 寬）。
- 互動測試（非 static）：圖卡點擊切到第 2 張、點點同步；手機「下一張」捲到第 2 張卡，prev 啟用、next 停用、頁碼點同步；console 無錯。

## 素材（11 檔，`site/assets/05-green/`）

greenpts-coins.png、paper-dandelion.png、esg-hand.png、certificate-pdf@3x.png、icon-cart.svg、icon-hand-heart.svg、icon-badge-check.svg、m-icon-cart.svg、m-icon-hand-heart.svg、m-icon-badge-check.svg、m-arrow-next.svg（手機 32px icon 另一份 SVG 用 `<picture>` 切換，不改 SVG root 尺寸）
- 弧線不另存，用 base `.cl-curve`（path d 與 common/curve-pattern.svg 相同，已比對 md5），本段覆寫 stroke 白、opacity .1／.06。
- `certificate-pdf@3x.png`：certificate_img 裡的 pdf（`1600:16469`）是 Figma 內用 4–16px 字排的 UI 示意稿，用 `download_assets` scale 3 匯出（匯出結果被元件 360×456 裁切，正好等於電腦版可視範圍 296×396.67，含灰底圓角）。手機版用同一張縮 0.9083（311.56／343）；手機版 pdf 文字重排後高度略不同，可視範圍內差 ≤1px。
- 未輸出（被上層完全蓋住、兩個斷點都看不到）：esg_img 的 Image 圖層 `1600:16791`（收據照片）。
- Line 22（白 20% 髮絲線）用 CSS 1px 背景畫，未用 SVG 檔。
- 手機上一張箭頭：原 SVG 內建 opacity .2；改用同一個箭頭 SVG＋rotate(180)＋`:disabled` opacity .2，才能隨捲動切換可用狀態。

## class（61 個，前綴 cl-green）

cl-green、__head、__heading、__eyebrow、__eyebrow-dot、__title、__lead、__body、__nav、__arrow、__arrow--prev、__arrow--next、__cards、__card、__card--points、__card--cert、__curve、__curve--points、__curve--cert、__intro、__names、__en、__name、__desc、__slider、__slide、__slide--coins、__slide--paper、__coins、__paper、__patch、__patch--bottom、__patch--top、__info、__info-head、__info-dot、__info-title、__info-rule、__info-body、__dots、__dot、__doc、__doc-img、__side、__tile、__tile--ink、__tile--green、__tile--gray、__tile-icon、__tile-text、__pill、__pill--light、__pill--dark、__pill-dot、__tile-desc、__tile-desc--white、__esg、__esg-inner、__esg-hand、__pager、__pager-dot
狀態 class：`is-active`（輪播圖、點點、頁碼點）。

## audit-source（設計稿不一致，照稿做）

| frame | 節點 | 值 | 疑似應該是 |
|---|---|---|---|
| 1695:20313 | 卡片內三種小卡底色 1695:20339／20347／20366 | #1f1f1f、#138248、#444 | #444 不在 base 色票，確認是否要收斂 |
| 1695:20313 | pill 底 2139:29092／1695:20350／2139:29095 | rgba(255,255,255,.24)、rgba(0,0,0,.24)、rgba(0,0,0,.36) | 三種透明度，可收斂成兩種 |
| 1695:20313 | 說明文字色 1695:20346／20354 vs 1695:20373 | rgba(255,255,255,.8) vs #fff | 同層級說明，應同色 |
| 1695:20313 | 大字英文 GREEN POINTS 1695:20326 字距 | 2px（手機 2139:30377 為 1px） | 字級不同所以字距不同，可接受；確認 |
| 1695:20313 | 圖卡圓角 2139:30034 16、info 框 12；手機 2139:30381 12、info 8 | — | 手機縮一階，OK，記錄 |
| 1695:20313／19826 | 漸層角度 -23.25° vs 手機 -24.81° | 元件跟著比例變 | 可統一 |
| 1695:20313 | eyebrow 圓點與文字色 1695:20317 | #15663c（＝--cl-green-700） | — |
| 1695:20313 | backdrop-blur 52px 用在不透明底小卡 1695:20339 等 | 無視覺效果 | 可刪（HTML 未寫） |
| 1695:19826 | 手機 pdf 2139:30414 | 不是電腦版等比縮放（字級 9.48 vs 10.44，高 496 vs 490） | 同一元件兩份尺寸，S1 確認 |
| 隱藏 | Vector 4003（1600:16413、1600:16459）有 path-trim 動畫但 visible=false | get_motion_context 仍回傳 | 已不做 |

## 給主控（共用元件／base）

- 共用 `.cl-curve` 可直接用；本段只覆寫 stroke 色與 opacity（白 .1／.06），尺寸與 transform 寫在本段。建議 base 加 `--cl-curve-stroke`／`--cl-curve-opacity` 變數讓各段不必覆寫 path。
- 本段新色：#444、#85f0b7（pill 點）、#989898（證明底）、#e0ffe2／#e7feec（補色塊）、rgba(21,102,60,.6)（info 框）。S1 收斂時參考。
- 全站建議：`text-spacing-trim: space-all` 放到 body（見 LESSONS 2），否則各段中文斷行都會和 Figma 不同。

## 替代版本／互動

- 已做：card_greebpt（元件 2139:30028）兩張圖輪播（綠點硬幣／蒲公英紙），點擊或每 6 秒切換，0.3s ease-out 淡入（Figma Smart animate）；`?static` 不自動切換、停在第 1 張。
- 已做：手機版卡片橫向捲動（Figma cards overflow HORIZONTAL），左右箭頭、頁碼點跟著捲動更新，scroll-snap。
- 弧線描線動畫：照 base `cl-curve-trim` 12s；static 時整條顯示（＝設計稿）。
- 待使用者補：電腦版是否也要卡片切換（目前兩卡上下排）；硬幣圖 Smart animate 是否要位移而非淡入。

## LESSONS

1. **Figma 百分比行高實際排版會四捨五入成整數 px**（16px×140%＝22、14px×140%＝20、32→45、48×120%→58、24/28→34）。照 1.4 寫，7 行段落累積差 3–4px；寫整數 px 後行位置與 Figma 截圖逐行一致。證據：本段 metadata 文字框高 132／154／220／242 都是 22 的倍數。
2. **Chrome 預設 `text-spacing-trim` 會擠壓相鄰全形標點**（「下，「」、「）。」），Figma 不會 → 中文斷行提早差一兩個字。加 `text-spacing-trim: space-all` 後斷行全對。
3. 貼齊寬度的文字（175 寬放「工業用紙產線： 1KG=1綠點」）：瀏覽器把最後一字的 letter-spacing 算進寬度（175.3），多斷一行；文字框 `margin-right: -.3px` 補回。
4. `download_assets` 對元件內的節點會被元件框裁切（不是整個節點）：可直接當「可視範圍」圖用，但要先確認尺寸。
5. element screenshot 在段落 y 有小數時整張差 1px，比對工具改成試 dy -2..2 取最小。
