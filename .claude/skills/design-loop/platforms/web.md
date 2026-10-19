# 平台：Web（stable）

實證來源：品牌官網案（多頁、含 CMS 列表／內容頁、捲動動態），2026-09 走完 S0–S5；手機設計稿與 S7 復盤於 0.4.0 寫入（同一案 2026-09-15～17 實測）。

## manifest 預設（init 會填）

- `viewports`：Desktop 1440×900、Tablet 768×1024、Mobile 390×844。
- `modes.Responsive`：Desktop＝`:root`、Tablet＝`@media (max-width:1100px)`、Mobile＝`@media (max-width:640px)`。斷點以網站 CSS 為準，不同就改 manifest。
- `options.dark` 預設 false。

## S0–S2

- 動態頁一定要有 static 模式（`?static`）：擷取、量測、截圖都靠它。
- 流動容器（左右 margin 固定、不設最大寬）在 Figma 用 viewport 寬的 frame 呈現；閱讀型內頁的限寬做成 layout token（例：`container-article`）。
- 手冊對標：Ant Design × Material 3。

## S3

- Responsive collection 三個 mode 對三個斷點；字級、margin、section 間距、nav 高度這類隨斷點變的值放這組。
- `@media (pointer:coarse)`、`prefers-reduced-motion` 不是 viewport 覆寫，不做 mode，寫規格說明。

### 手機母版（0.4.0）

- **結構會變的 organism**（Header、Footer、KV、篩選列、文章、上下篇這類）加 `Device=Desktop｜Mobile` 變體；Mobile 變體本身 `setExplicitVariableModeForCollection(Responsive, Mobile)`，綁 Responsive 的字級、margin、section 間距自動切值。只有值不在 Responsive、或結構改變（直排、隱藏索引、比例改 4:3）才另外改。其餘元件 FILL＋頁面 mode 就好，不加變體。**建議做法，待驗**（Web 案一案，16 個 set）；第二個 Web 案照做沒問題才改實測。
- **加 Device 變體前先量同元件在其他頁的手機值**：網站只有一頁用 class 覆寫（例：某頁按鈕 padding）不代表元件有手機尺寸 → 留在頁面層覆寫。實測 0.4.0。
- **手機值用觸控環境量**：Playwright `isMobile`＋`hasTouch`（pointer:coarse 會加 padding／min-height，例：連結 46.5、社群鈕 44）。實測 0.4.0。
- **元件內文字挑 Responsive 樣式要三項齊比**：每個 mode 解析出的字級、行高、字距都要和網站一致；只對字級就套，會把字距悄悄帶進設計稿（頁高、audit 驗不出來）。會隨斷點變成別的角色的樣式（例：nav 字級在手機是抽屜選單 22）不要借給元件。對不上就新增固定值 `{FP}/Comp/*`。實測 0.4.0。
- 橫排改直排的 Mobile 變體、clone 變體掉綁定、同一 TEXT 屬性跨變體回寫樣式：見 `references/figma-instance-gotchas.md`。em 段距各 mode 分算：見 css-to-figma。

## S4

- 設計稿先做 Desktop。
- **Mobile 設計稿（建議做法，待驗；Web 案一案 9 頁，第二個 Web 案照做沒問題才改實測）**：每頁一個 390 frame 放在桌機 frame 右側，frame 上切 Responsive＝Mobile。從桌機稿 clone 本地子框最快（樣式、變數綁定保留，Mobile mode 自動換值），再把 organism 切 `Device=Mobile`、補手機才有的結構。
- **Mobile 對位**：網站用 390 視窗＋`isMobile`＋`hasTouch` 量 DOM；截圖用固定 viewport 分段拼接（capture-gotchas「長頁不用 fullPage」）。驗收逐段比 y，不只比頁高：比例卡取整差會累積、還會被別處的差抵銷（integer-rules §4）。
- Tablet 設計稿：**尚未實測**。要做時照 Mobile 做法（一個 viewport 一個 frame、切 Responsive mode），結果寫進 LESSONS。
- 捲動釘住、曲面輪播、WebGL：畫第一個狀態；透視彎曲在 Figma 用平面旋轉近似並註明。
- Header 疊在 KV 上：Header instance absolute、放最後一個子層（或父層 `itemReverseZIndex = true`）。

## 部署

- 靜態主機部署後，驗「這次部署的專屬網址」與 content-type，不只看正式網址（可能是快取）。
