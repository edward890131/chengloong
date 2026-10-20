# 06 串場（負責人 D）

電腦版 `1695:20376`（1440×582）／手機版 `1695:19897`（375×300）
檔案：`site/src/sections/06-strip.html`、`site/css/sections/06-strip.css`、`site/assets/06-strip/`（無 JS，純 CSS 動畫）

## 驗收（`?static`，deviceScaleFactor 1）

| 寬 | 段落高 | 主要元素位置最大差 | 像素差異（>40，最佳 dy） | 結果 |
|---|---|---|---|---|
| 1440 | 582／582 | ≤1px | 0.11%（dy -1） | 通過 |
| 375 | 300／300 | ≤1px | 0.27%（dy -1） | 通過 |

- 比對圖 `1440_compare.png`、`375_compare.png`。Figma 電腦版截圖含溢出範圍（1440×800，`figma_1440_full.png`），比對時裁掉上方 109px。
- 641–1439 無水平捲軸；段落 `overflow: hidden`（弧線可見部分都在段落內，Figma 電腦版 frame 雖不裁切但弧線沒有超出）。
- 非 static：照片帶有在動（2 秒內 translateX -104 → -223）。

## 素材（6 個 PNG）

photo-forklift、photo-windmill、photo-seedling、photo-lab、photo-pulp-stack、photo-paper-roll。
- 每個 flow_img 元件裡疊了 1–4 張圖，只輸出最上層看得到的那張（下層被 100% 蓋住，例：flow_img/2 的 DSC03735 1、image；flow_img/5 的 DSC01039、DSC00672）。
- 位置用照片框百分比寫，手機版正好是電腦版 0.4 倍，同一組值兩個斷點共用。
- 弧線用 base `.cl-curve`（同 path），transform `rotate(163.58deg) scaleY(-1) rotate(2.71deg)`，手機 0.8 倍。

## class（15 個，前綴 cl-strip）

cl-strip、__curve、__viewport、__track、__item、__item--up、__item--down、__photo、__img、__img--forklift、__img--windmill、__img--seedling、__img--lab、__img--pulp、__img--roll

## 替代版本／互動（已判斷並實作）

section 1695:19584 的 1750:33339、1750:33414（電腦）與 2159:25378／25419／25496（手機）是元件 713:17828 自動播放的不同時間點。原型設定：
`Property 1=1 →(AFTER_TIMEOUT 0.001s, Smart animate linear 10s)→ 2 →(0.8s, linear 10s)→ 3 →(0.8s, 瞬間)→ 1`
照片列 x：電腦 0 → -580 → -1160；手機 0 → -332 → -665。
已做成 CSS keyframes（21.6s linear infinite，`cl-strip-marquee-l／-s`）；`?static` 與 prefers-reduced-motion 停在 x=0（＝主畫面）。弧線描線 12s 照 base。

待使用者補：最後一步 Figma 是「瞬間跳回起點」，網頁上會看到明顯跳動；是否改成無縫循環（複製一組照片接在後面）請使用者決定。

## audit-source

| frame | 節點 | 值 | 疑似應該是 |
|---|---|---|---|
| 713:17828 | flow_img/2、/4 疊了 2–4 張重複圖（DSC03735 1／2、image 兩份） | 下層全被蓋住 | 清掉多餘圖層 |
| 713:17828 | 手機最後一步 -665（電腦 -1160＝2600-1440 剛好貼右） | 1040-375＝665 | 一致，OK |
| 1000:20132 | 手機元件內有 Vector 4003 | 隱藏，未做 | 可刪 |

## 給主控

- 無 base 需求。弧線與 05 一樣，建議 base 提供 stroke／opacity 變數。

## LESSONS

1. 「串場」替代版本＝Smart animate 輪播時間點：用 `use_figma` 唯讀讀變體的 `reactions`（AFTER_TIMEOUT＋destination＋duration）與各變體子層 x，就能精確還原成 keyframes，不用猜。
2. 同一元件 L／S 若剛好等比（這裡 0.4），圖片裁切寫成百分比可共用一組 CSS。
