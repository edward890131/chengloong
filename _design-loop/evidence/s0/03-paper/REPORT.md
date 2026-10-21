# S0 · 03 從機密文件到日常用紙 · 負責人 B

（subagent 寫檔被擋，由主控依回報落檔）

電腦版 1695:20245、手機版 1695:19747。手機版內容超出會被裁切，段落在手機用 `overflow: clip`。

動畫：只有 curve_pattern 的 path-trim，與 base 相同。

## 驗收

| 寬 | 高 | 像素差 | 位置最大差 | 斷行 |
|---|---|---|---|---|
| 1440 | 1730／1730 | 2.08% | ≤3px | 一致 |
| 375 | 1203／1203 | 0.75% | ≤2px | 一致 |

- 電腦版每個文字與圖片格的 DOM 位置都和 metadata 完全一致。
- 剩餘差異來源：照片重新取樣（Figma 原圖只有 1024 寬）；段落在頁面的 top 有小數（前面段落累積 y=…0.97），截圖用取整的 clip。
- 641–1100：照片填滿格子，Step 3 說明卡改直排，無溢出。

## 素材（8）

- `step1-pulper.png`、`step2-workers.png`、`step3-tissue.png`：照母版裁切百分比定位。paper_change_img/3 底層「3」被不透明圖 1478 完全蓋住，未下載。
- `ecolabel-1/2/3.svg`：從母版 827:12776／12779／12778 匯出，移除上層背景，底色改成 instance 覆寫的 #14A558。
- `ecolabel-4.png`：FSC logo 原圖。
- `arrow.svg`：只一檔，左箭頭是同一 icon 轉 180°，disabled 時 opacity .2。

## class（42，另用 `.cl-curve`）

cl-paper、__curve、__head、__heading、__eyebrow、__title、__lead、__slider、__nav、__arrow、__arrow--prev、__arrow--next、__grid、__step、__step--1、__step--2、__step--3、__text、__no、__no-label、__no-num、__body、__step-title、__hash、__desc、__cr、__em、__media、__photo、__img、__img--pulper、__img--workers、__img--tissue、__note、__note-row、__note-text、__logos、__logo、__logo--s、__logo--fsc、__dots、__dot

## audit-source

- Step 01 內文（1695:20263／19770）：「纖維，」與「紙張」之間的 `\r` 顯示成空格，電腦約 1em、手機約 4px；導言結尾的 `\r` 同樣（電腦 1em、手機 4px）。都用 `.cl-paper__cr` 佔位。
- Step 03 環保標章：電腦用 1、2、4（FSC）；手機主 frame 1695:19808 用 1、2、3；替代 frame 1695:19970 用 1、2、4 且衛生紙照片裁切不同。照主 frame 1695:19747 做。
- 標章 instance 把母版底色 #138248 覆寫成 #14A558。
- 隱藏圖層未做：Completeness 文字、Step 03 標題裡的 logo 組、「蒲公英衛生紙優勢」標籤與 Line 22。
- Step 標籤字級：電腦 32/64、手機 24/36。標題字距電腦 0.6、手機 1px。
- 行高取整同 02。

## 互動

已做：手機版輪播（箭頭、頁碼點、scroll-snap）。實測：按下一張 0→335→670，頁碼點與箭頭 disabled 狀態同步；點頁碼點可跳回。電腦版為靜態格線。

## 給主控／LESSONS

見 02-about/REPORT.md（同一負責人，內容相同）。
