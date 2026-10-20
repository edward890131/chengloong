# S0 · 04 服務流程 · 負責人 C

（subagent 寫檔被擋，由主控依回報落檔）

電腦版 1695:20303（1610 高）、手機版 1695:19816（2114 高）。

## 驗收

| 寬 | 段落高 Figma／HTML | 位置最大差 | 像素差異（>40） |
|---|---|---|---|
| 1440 | 1610／1610.5 | 截圖整段 +1px（本段從 y=3982.94 起算，截圖取整）；DOM 量測段內各元素 0 差 | 2.5% |
| 375 | 2114／2114 | 各區塊 dx/dy ≤1 | 1.3% |

- 殘餘差異：照片重採樣邊緣、字體反鋸齒。
- 641／768／1024／1280 無水平捲軸；768 時預約圖改用欄高撐滿。
- 卡片四個展開狀態、三個頁籤都和稿比對過（`1440_states_cards.png`、`375_states_cards.png`、`*_tab2_compare.png`、`*_tab3_compare.png`）。
- 地圖 1–6 徽章字型 Zalando Sans Expanded 700：主控已在 `_head.html` 載入。
- 手機「當天進場流程」照 2159:25259 做（1128 寬可左右滑動，地圖 x=30，「可左右滑動查看」固定左下）。主稿 1695:19969 地圖在 x=-112.1、文字列在 24，同一捲動容器無法同時做到，預設畫面只差地圖起始位置。

## 素材（23 個，約 17MB）

- 照片 PNG 9：card1-typing、card2-truck、card3-pulper、card4-laptop、card4-screen、booking-mockup2、prepare-1/2/3。
- SVG 14：card4-screen-mask、icon-files／truck／drop／recycle／info、map-ground、map-b1〜b7。
- 未輸出（被上層完全蓋住）：process_img/1 的 img04、shutterstock_2487597363；process_img/4 的 DSC03761；booking_img 的 weighyard、image 1469、Vector 3993、Mockup 1。
- 1px 半透明分隔線用 CSS 畫。
- booking-mockup2.png 3000×2250 約 6.3MB、prepare-*.png 各約 2MB：上線前要壓縮或轉 webp。

## class（99 個，cl-process 前綴）

- 骨架：cl-process、__curve-clip、__curve、__head、__eyebrow、__title、__body
- 四格卡：__cards、__card、__card--1〜4、__media、__photo、__photo--1〜3、__laptop、__laptop-photo、__laptop-screen、__card-body、__card-icon、__card-title、__card-line、__card-desc、__card-curve
- 頁籤：__detail、__tabs、__tab、__panel
- 線上預約步驟：__booking、__steps、__step、__step-no、__step-label、__step-num、__step-text、__step-title、__step-title--info、__info、__step-desc、__step-list、__booking-img、__booking-frame
- 送廠前的準備：__prepare、__prep-card、__prep-title、__prep-line、__prep-group、__prep-item、__prep-sub、__prep-desc、__prep-line-name、__prep-way、__prep-note、__prep-pair、__prep-img、__prep-img--1〜3
- 當天進場流程：__route、__route-scroll、__route-inner、__map-wrap、__map、__map-part、__map-part--ground／b1〜b7、__map-label、__map-label--1〜9、__map-label--green、__pin、__pin--1〜6、__pin-pill、__pin-badge、__route-steps、__route-num、__route-desc、__route-hint
- 狀態：`.is-active`（卡片、頁籤）、`.is-scrolled`（手機動線圖滑動後）
- id：cl-process-tab-1〜3、cl-process-panel-1〜3；keyframes cl-process-rise

## audit-source

| 位置 | 稿上的值 | 疑似應該是 |
|---|---|---|
| 服務流程B 分隔線 | 第 1 格 1567:44010 白 60%，其他格（1567:44036 等）白 40% | 統一 |
| 展開卡弧線（L） | 框位移 +280.38／−39.63／−360.63／−689.63，卡 4 與前三格間距差 10px | 卡 4 用 −679.62 |
| 展開卡弧線（S） | 1678:31122、1681:31163／31170／31177 top −700／−892／−1087／−1277，間距 192／195／190 | 間距 181（卡高 180＋1） |
| 未展開卡漸層 | 起點 42.75%（L）、36.944%（S） | 可能刻意，待確認 |
| 手機卡 4 截圖遮罩 I1567:46510;1750:26965 | 420×335 遮罩套在 241×192 框上沒跟著縮 | 按比例縮（HTML 已按比例） |
| 動線圖 L／S | 框縮 0.99、標籤與徽章座標縮 0.98 | 同一比例 |
| 手機動線圖 1695:19969 vs 2159:25259 | 地圖 x −112.1 vs 30；19969 無滑動提示 | 以 25259 為準（HTML 採用） |
| STEP 數字欄寬 | 01／02／03／04 為 45／53／53／57，04 文字右移 2px | 固定欄寬 |
| 送廠前的準備 1586:48536 | 『…產線。 』句號後多一個半形空格 | 移除 |
| 送廠前的準備 1586:48540 | 「瓦愣紙」，同段 1586:48536 用「瓦楞紙」 | 「瓦楞紙」 |
| STEP 數字（L）713:18667 | 字級 40、行高 1.2，框高固定 40 | 行高 1 |

## 給主控

1. Zalando Sans Expanded 700：已加。
2. 大圖壓縮：見素材。
3. 卡片展開時的白色 20% 弧線寫在本段 CSS；其他段也有白色弧線時，base 可加 `.cl-curve--white20`（base 已有 `--cl-curve-color`、`--cl-curve-opacity`）。

## 互動

已做：
- 四格卡：hover、點擊、focus／Enter 展開該格，同時只開一格，預設第 1 格（主畫面）。展開格綠底 #1fc36c＋icon＋標題＋分隔線＋說明＋白色 20% 弧線（12s 描線）；未展開格照片＋黑色漸層＋標題；卡寬不變。自加：展開內容 .45s 上浮淡入。`?static` 關動畫、弧線整條顯示。
- 頁籤：三個，預設「線上預約步驟」；role=tab，方向鍵／Home／End 切換；手機頁籤列可橫捲，切換時把選中頁籤捲進畫面。
- 當天進場流程：電腦照 1695:19586 靜態；手機照 2159:25259 可左右滑動，自加滑動後「可左右滑動查看」淡出。

待使用者補：
- 「挑選到廠日期與時段」旁 info 圖示（預約 tooltip 1695:33037）稿上沒有內容與觸發方式，未做。
- 手機卡片要不要自動輪播？滑鼠離開後要不要回到第 1 格？目前停在最後選的那格。
- 電腦版地圖標註要不要 hover 效果。

## LESSONS（待升級）

1. `get_design_context` 對 instance 內「absolute contents」群組（地圖建物名、流程標註 1–6）的 left/top 錯 20–90px；用百分比 inset 的 Group 是對的。改用 `use_figma` 唯讀讀 `absoluteBoundingBox` 減父框座標。
2. Figma 百分比行高在文字框內取整（14×1.4→20、18×1.4→25、24×1.4→34、32×1.4→45、24×1.2→29）；照 1.4 寫手機整段短 7px，寫死整數 px 後 0 差。
3. Figma list-disc 圓點約 2.5px、距文字 12px，比 Chrome disc 小，用偽元素畫。
4. 縮放過的 instance（手機 curve_ani_process 1600×640）`get_design_context` 回未縮放子層座標，SVG 素材卻是縮放後的寬（4503）；先從素材寬判斷縮放倍率（0.8）再換算中心點。
5. 疊層照片常有被上層完全蓋住的底圖，先比對覆蓋範圍再決定要不要輸出（本段少 6 張，其中一張 6MB）。
