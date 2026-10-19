# CSS → Figma 換算表

標 **實測** 的是專案驗證過的（未標版本＝0.1.0）；標 **待驗** 的第一次用時要量過，結果寫 LESSONS。

| CSS | Figma | 狀態 | 備註 |
|---|---|---|---|
| `backdrop-filter: blur(Npx)` | BACKGROUND_BLUR radius **2N** | 實測 | 用 `get_design_context` 讀 radius 20 的圖層，輸出 `backdrop-blur-[10px]`。直接填 CSS 數字只有一半強度 |
| `filter: blur(Npx)` | LAYER_BLUR radius 2N | 待驗 | |
| `font-weight: 600` | 字型在 Figma 有 SemiBold 就用 SemiBold；沒有才降 Medium | 實測 | 先 `listAvailableFontsAsync` 確認。例：Noto Sans TC 沒有 SemiBold → Medium；Lexend Exa 有 → SemiBold。結果寫 `manifest.font_weight_map` |
| `letter-spacing: -0.02em` | 文字樣式 `{unit:'PERCENT', value:-2}`，不綁變數 | 實測 | 綁變數只能 px，會和字級脫鉤 |
| `line-height: 1.3`（比例） | px＝字級×比例，四捨五入到整數；綁變數 | 實測 | 網頁維持比例，差 ≤0.5px；四捨五入後造成置中 .5 時可再調 ±1（integer-rules §1），調整寫進樣式 description |
| `line-height: 32px` | 同值 px | 實測 | |
| Figma 行高 `normal`（S0 反向還原） | CSS 寫死 px，值取 metadata 文字框高度；不要照 `get_design_context` 寫 `leading-[normal]` | 實測 0.3.0 | 中英混排節點在瀏覽器 fallback 到系統中文字型後行高變 20（Figma 17），整組位移 3px。APP 案登入頁 |
| `box-sizing: border-box` 含 border 的輸入框 | 框高＝**渲染高度**（例：padding 12×2＋行高 24＋框 1×2＝50），stroke INSIDE（線畫在框內，不另加高度） | 實測 | token 寫 min-height 48 時會和 Figma 50 對不上 → S5「先定真相」 |
| Figma stroke INSIDE（S0 反向還原） | CSS `box-sizing: border-box`，padding 各扣框線寬；S1 元件統一寫 border-box | 實測 0.3.0 | CSS border 預設往外加寬度。APP 案 chip |
| border-box＋子層貼邊的元件 | 母版 `strokesIncludedInLayout = false`；輸入框這類 CSS padding 已扣框線的維持 true 並核對 | 實測 0.3.0／0.4.0 | 預設 true 會讓框線吃進版面（子層被推 1px、總高 +2）。APP 案色票 137→135；Web 案錨點列 57→58；兩個 FILL 兄弟不等寬見 integer-rules §3 |
| `opacity: 0.4` | 圖層 opacity 寫 0.4、description 註明對應 token；不綁變數 | 實測 0.3.0 | Figma opacity 綁變數是 0–100 刻度，0.4 會變 0.4%。真要綁就另建 0–100 的變數並列 `token_diff_ignore`。APP 案 Icon button Disabled |
| `box-shadow: inset 0 0 0 1px`；`inset 0 1px 0` 分隔線 | stroke 1、INSIDE（分隔線只開那一邊）；`strokesIncludedInLayout = false`（inset 陰影不占版面） | 實測／0.4.0 | 擷取稿常遺失這種陰影，以 CSS 為準；沒關會 HUG 多 1px（Web 案清單上緣） |
| 多層 `box-shadow` | effect style 同樣層數與參數 | 實測 | |
| `rgba()` | 變數色含 alpha | 實測 | 疊在不同底上的色差用混色後的值比 |
| `linear-gradient`／`radial-gradient` 遮罩 | paint style `{FP}/Scrim/*`（可多層） | 實測 | radial 中心與範圍依**元件盒高**換算，不是 frame 高 |
| `aspect-ratio`、固定比例圖框 | 鎖比例 frame | 實測 | instance 內高度由寬度決定，見 integer-rules §4 |
| `object-fit: cover`＋`object-position` | image fill CROP＋`imageTransform` | 實測 | instance 內圖層位置不能改，只能改 imageTransform |
| `-webkit-line-clamp: 2` | 母版文字 `maxLines = 2`＋`textTruncation = 'ENDING'` | 實測 | 要真的設在母版，只寫在 description 不算 |
| 文字 `max-width` | 母版設 maxWidth | 實測 | instance 無法覆寫 max size |
| `clamp()`、隨視窗縮放的字級 | 另建 `{FP}/Comp/<名>`，取設計稿 viewport 下的值 | 實測 | |
| 中英混排 font stack（英文 Lexend Exa、中文 Noto Sans TC） | 英文段、中文段分段套樣式 | 實測 | Figma 不做逐字 fallback；instance 改文字後要重新分段 |
| CSS grid 同列等高＋`margin-top:auto` 貼底 | 沒有對應；列高手動設為該列最高卡 | 實測 | 內容變了要重量 |
| `flex-wrap`＋`justify-content: space-between`＋`column-gap` | 容器 WRAP＋SPACE_BETWEEN、itemSpacing 0，column-gap 做成前一個子層的右內距 | 實測 0.4.0 | Figma 換行判斷不計 itemSpacing（figma-gotchas 版面）。這樣放得下時靠右、放不下換行，一個母版涵蓋兩種內容。Web 案標題列（APP 案同屬 SPACE_BETWEEN 間距問題） |
| `vector-effect: non-scaling-stroke` 1.5px | 圖示 resize 後線寬設 1.5 | 實測 | |
| `stroke-linecap` | 同值 strokeCap；icon 從 round 改直角時用 SQUARE | 實測 0.3.0 | round 換 square 視覺長度不變，換 butt 兩端各縮半個線寬；原本就是 butt／NONE 的保留。APP 案 icon 直角化 |
| 元件組合（`.x-card` 內放 `.x-btn`） | 巢狀 instance 設 `isExposedInstance = true`，外層 instance 直接改內層屬性 | 實測 0.3.0 | 外層 TEXT 屬性不能綁巢狀文字（figma-instance-gotchas instance 表）。APP 案對話元件 |
| hover 的 `scale`／`transform` | 另做 `State=Hover` 變體 | 實測 | |
| `@media (pointer:coarse)`、`prefers-reduced-motion` | 不做 mode，寫規格說明 | 實測／0.4.0 | 例外：Web 手機母版的觸控尺寸（coarse 加的 padding、min-height）直接取 isMobile＋hasTouch 量到的值（platforms/web.md） |
| `em` 間距（例：段落間距 1.7em＝29） | 算成 px；沒有對應 token 時寫死並記 DS_GAPS；字級隨斷點變時每個 mode 各算各寫（2.4em：17px→41、16px→38） | 實測／0.4.0 | 不要硬綁最接近的 token，會每段累積誤差 |
| `calc(var(--lh-*) * 1em)` 段距 | 本質是「一個行高」→ 綁 `type/*/line-height` 變數，隨 mode 切值 | 實測 0.4.0 | Web 案段距、圖文間距 |
