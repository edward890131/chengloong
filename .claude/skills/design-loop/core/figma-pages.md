# Figma page 結構與權限

跨站規則：S2 建 page、S4／S6 產出正式稿、S5 同步、S7 掃描都照這份。動 Figma 前先確認要寫的 page 是哪一區、AI 有沒有權限。

適用 `manifest.figma.file_key` 的設計檔。設計系統獨立發佈成 Library 時（S3 §0），`Guideline` page 在 Library 檔，其他 page 在設計檔。

來源分級（0.5.0）：調整區「設計師複製 → 改 → 下指令 → AI 寫回並同步」是**實測**（使用者多個專案）；page 分區、代碼、調整區 Section、衝突檢查是**建議做法，待驗**（使用者定案，尚無專案照完整結構跑過）。0.6.0 的兩支腳本（`figma_pages.js`、`adjust_diff.js`）只在模擬節點樹上測過，第一次在真實 Figma 檔跑時把結果寫 LESSONS。

## 1. 結構

```
Guideline                  ← S3：手冊＋元件母版
--- 參考 ---
Wireframe                  ← 選配；Section 依功能代碼
HTML 擷取                  ← S2：對位底稿；Section 依功能代碼
--- 正式稿 ---
A 登入註冊                 ← S4／S6：一個功能一個 page
B 首頁
C 商品購物
…
--- 工作區 ---
調整區                     ← 設計師複製正式稿來改
（自由 page…）
```

| page | 誰寫 | AI 權限 | manifest | 建立時機 |
|---|---|---|---|---|
| `Guideline` | AI | 讀寫（S3 規則） | `figma.pages.guideline` | S2 擷取前 |
| `Wireframe` | 設計師／業主 | **唯讀** | `figma.pages.wireframe` | 只有 wireframe 是本檔 Figma frame 時才建 |
| `HTML 擷取` | AI | 讀寫 | `figma.pages.captures` | S2 擷取前 |
| 功能 page（`A 登入註冊`…） | AI | 讀寫；設計師不直接改 | `figma.pages.design`（代碼 → page） | 該功能第一張正式稿要產出時 |
| `調整區` | 設計師 | 讀；寫回完成後只移動副本（§5） | `figma.pages.adjust` | 第一次有設計師要調整時 |
| 分隔線 `--- … ---` | — | 一律跳過 | 不記 | 開案建結構時 |
| 自由 page | 設計師 | 不讀、不寫、不掃，除非設計師指名 | 不記 | 設計師自己開 |

- **AI 用 manifest 記的 page id 找 page，不靠名稱。** 設計師改了 page 名稱，id 不變就照常運作，順手把 manifest 裡的名稱更新。
- **不在 manifest 裡的 page 一律當自由 page**，不管它叫什麼、放在哪一區。
- 分隔線：名稱以 `---` 開頭的 page，AI 不讀不寫，也不放內容。帶文字的分隔線在 Figma 側欄怎麼顯示**待驗**，第一次開案時確認並寫 LESSONS。
- 正式稿 page 上只放 registry 登記過的畫面 frame；擷取稿、草稿、參考圖不放這裡。
- **建立與檢查用 `scripts/figma_pages.js`**（0.6.0）：`mode: 'apply'` 補建缺的 page、分隔線、`HTML 擷取`／`Wireframe` 的功能 Section、調整區的 `已套用` Section，照上面的順序排；已有同名 page 就沿用，不刪、不改名、不搬任何 frame。回傳的 page id 寫回 `manifest.figma.pages`。`mode: 'check'`（唯讀）列出缺的 page、順序、正式稿上沒登記或放錯功能 page 的 frame、沒歸位的已套用副本。開案建結構、S4 新增功能 page、S7 復盤前各跑一次。

## 2. 代碼

畫面代碼是 wireframe、HTML、`HTML 擷取`、正式稿、registry 之間的唯一鍵。

- **功能代碼**：大寫英文字母（`A`、`B`…，超過 26 個接 `AA`、`AB`）。功能 page 命名 `<代碼> <功能名>`（例：`A 登入註冊`）。
- **畫面代碼**：`<功能代碼>-<兩位數>`（例：`A-01`）。正式稿 frame 命名 `<畫面代碼> <畫面名>`（例：`A-01 登入`）；同一畫面的其他 viewport 加 ` · <viewport 名>`（例：`A-01 登入 · Mobile`）。
- **代碼從哪來**：
  - **以 wireframe 為準**：wireframe 有自己的分組與編號 → 照 wireframe，畫面名稱也照 wireframe 的敘述。
  - wireframe 沒有編號，或沒有 wireframe → AI 依功能分組提案代碼，使用者確認後寫進 registry。
  - 首次建置在 S0 建 `registry.pages[]` 時就決定；S6 新頁在拆解時決定。
  - 設計師補的畫面（§4）沒有 wireframe 代碼：AI 在該功能裡取下一個沒用過的號碼。之後 wireframe 改版用了同一個號碼給別的畫面 → 照 wireframe，設計師補的那張改號，改號前列給使用者確認。
- **一個畫面＝代碼＋名稱**。wireframe 整理後同一個代碼可能換成別的畫面（例：`A-03 忘記密碼` 拿掉，`A-03` 改給 `簡訊驗證`）。wireframe 改版時，AI 逐筆對照 wireframe 與 registry：

  | wireframe | registry | 判斷 | 做法 |
  |---|---|---|---|
  | 代碼、名稱都相同 | 有 | 同一個畫面的內容異動 | S6「wireframe 更新」改該畫面 |
  | 代碼相同、名稱不同 | 有 | 換了一個畫面 | 舊畫面標 `removed`（§2 下方），新畫面沿用代碼、當新頁走 S6。名稱不同但結構看起來一樣（可能只是改名）→ 列給使用者確認 |
  | 新代碼 | 沒有 | 新畫面 | S6 新頁 |
  | 沒有 | 有 | 畫面拿掉 | 列給使用者確認後標 `removed` |

  - 舊畫面標 `removed`：registry 那筆保留（`status: removed`、`removed_on` 日期、原名稱），正式稿 frame 與 HTML 頁刪除前列給使用者確認。同一個代碼在 registry 裡只能有一筆不是 `removed`。
  - **紀錄一律寫「代碼＋名稱」**（SYNC_LOG、REVIEW_LOG、LESSONS、DS_GAPS、回報）：例 `A-03 簡訊驗證`，不只寫 `A-03`。代碼重用後，舊紀錄靠名稱分得出是哪一個畫面。
- `HTML 擷取` 與 `Wireframe` page 用 Section 分功能，Section 名稱＝功能 page 名稱；frame 名稱開頭帶畫面代碼。

registry 每個畫面一筆（`registry.pages[]`）：

| 欄位 | 內容 |
|---|---|
| `code` | 畫面代碼，例 `A-01` |
| `feature` | 功能代碼，例 `A` |
| `wireframe_ref` | wireframe 位置：網址、本檔 node id，或 `<file_key>:<node id>`（別的 Figma 檔）；沒有留空 |
| `origin` | `wireframe`（照 wireframe 產出）／`designer`（設計師補的畫面，§4）／`source`（S0 來源 key page） |
| `capture_node`、`design_node` | 既有欄位，不變 |

## 3. Wireframe

- **一律獨立 page，不和正式稿放同一 page。** wireframe 是輸入（唯讀），正式稿是輸出；放在一起 `figma_audit` 會把灰框、未綁色、小數全部報出來，wireframe 改版也會和正式稿的生命週期攪在一起。
- 來源是網址 → **只記連結**在 `registry.pages[].wireframe_ref`，不截圖進 Figma。
- 來源是別的 Figma 檔 → 只記 `<file_key>:<node id>`，不複製進本檔。
- 來源是本檔的 Figma frame → 放 `Wireframe` page，依功能分 Section。
- 沒有任何 wireframe 是本檔 frame 的專案不建這個 page，`figma.pages.wireframe` 留空。
- wireframe 的用法照 `core/s6-extend.md` §1：是結構依據，不是視覺指示。

## 4. 開 page 與新增畫面

- **照 wireframe**：S6 拆解時依代碼歸到功能；該功能還沒有 page 就建一個，id 寫進 `figma.pages.design`。新增功能（新代碼、新 page）屬於資訊架構，wireframe 沒寫的照 S6「一定要停下來問」。
- **設計師自己開的 page**：預設當自由 page 忽略。
- **設計師指定「把這些畫面加進正式區」**：當成沒有 wireframe 的 S6 新頁，照正式流程跑：
  1. AI 依所屬功能給畫面代碼（新功能先和使用者確認代碼與 page 名），寫 registry：`origin: designer`、`wireframe_ref` 留空並在 `notes` 註明「設計師補，參考 <page>／<frame>」。
  2. 設計師的畫面只當參考，地位和 wireframe 相同：結構照它，樣式走 Guideline 既有元件與 S6 判斷樹。
  3. 做 HTML（S6 §3）→ S2 擷取 → S3 補母版（需要時）→ S4 用 instance 重建進功能 page → S7 復盤。
  4. 不把設計師的原稿直接搬進正式區（寫死值、detach 的結構會一起帶進去）。原稿留在原 page 不動。

## 5. 調整區

設計師不直接改正式稿：正式稿裡有元件 instance、變數與樣式綁定，直接改容易打斷綁定，三邊也不會同步。

**設計師**
1. 把要調的正式稿 frame 複製到 `調整區` 再改。名稱保留畫面代碼（例：`A-01 登入`，可加後綴 ` · 調整`），AI 靠代碼找回原畫面。
2. 多位設計師時，每人一個 Section（Section 名＝設計師名）。
3. 改完下指令，例：「A-01 調整好了，套回去」。**只認指令**：AI 不主動掃調整區，也不自動套用。
4. 要改的是元件本身（母版樣式、新變體）→ 直接跟 AI 說，走 S5 C／V 類；不在調整區改母版。

**AI（收到指令後）**
1. 依代碼從 registry 找到正式稿 frame；找不到代碼或對到多筆 → 問設計師是哪一張。
2. 跑 `scripts/adjust_diff.js`（副本 id、正式稿 id）比對：文字、文字樣式、元件與變體、被 detach 的 instance、綁定變成寫死的顏色、版面（位置、尺寸、間距、對齊）、顯示隱藏、增刪的圖層（0.6.0）。腳本列不到的（例：圖片換了）再看截圖補。整理成差異清單，和設計師說明的意圖合併；兩者對不上（例：說只改標題，比對出按鈕顏色也變了）→ 列出來問，不自己猜。
3. **衝突檢查**：副本建立之後正式稿如果又被改過（SYNC_LOG 在這之後有動到這個 frame 的紀錄），列出兩邊各改了什麼，問設計師以哪邊為準。
4. **寫回照 S5 處理**：分類（T／C／V／P／G）、影響分析、修改、驗證、紀錄，順序照 `core/s5-sync.md`。寫回正式稿時套回元件 instance 與變數結構，不把副本的圖層原樣搬回去。副本裡寫死的數值先對既有 token；對不到的走 S6 判斷樹（⑤ 新增 token 要寫理由並回報）。
5. 完成＝三邊都改了且 S5 驗證全過、SYNC_LOG 記一筆（註明來源：調整區 frame 名稱與 node id）。只改好 Figma 正式稿不算完成。
6. 副本移到調整區的 `已套用` Section，名稱後加套用日期（例：`A-01 登入 · 調整 · 已套用 2026-10-06`）。不刪除，由設計師自行清理。

### 設計師直接改了正式稿（防呆）

正常做法是走調整區；但有人直接在正式稿改了（例：只改一句文案），也要抓得到、同步得了，而且不能被 AI 蓋掉。

- **什麼時候查**：
  1. **AI 要寫入某張正式稿之前**（S5、S6、調整區寫回）：先對這張畫面跑 R2 文字比對（`r2_texts_web.cjs`＋`r2_texts_figma.js` → `r2_text_match.py`），文字不一致、而且 SYNC_LOG 解釋不了的，就是有人改過。這一步避免 AI 寫入時把別人的修改蓋掉。
  2. S7 R2／R3 復盤時。
  3. 使用者說「檢查正式稿有沒有被改」：對指定範圍跑 R2 文字比對＋`figma_audit.js`。
- **查到之後**：不管是文案、顏色還是版面，**先確認，不自己修**。列給設計師：「`A-01 登入` 的標題，Figma 是『會員登入』、HTML 是『登入』，哪個是對的？」
  - 設計師確認是刻意改的 → 當成 S5 的 Figma 端異動（使用者親手改的就是新的意圖），同步回 HTML 與 Guideline；改動用到寫死值或被 detach 的，順手套回 token 與 instance。
  - 確認不是 → 照 HTML 把 Figma 改回來。
  - 結果記 SYNC_LOG，並提醒設計師下次走調整區。

## 6. 舊格式相容（0.4.0 以前開的案子）

- `manifest.figma.pages.design` 是字串（單一 `設計稿` page）＝舊格式，**照舊運作**：正式稿都在那一個 page，frame 命名沿用 `NN <頁名>`。不強制搬遷。
- `Wireframe`、`調整區` 兩個 page 和代碼規則可以單獨加進舊專案：在 `figma.pages` 補 `wireframe`、`adjust`，調整區用頁名對 registry 找原畫面。
- 要拆成功能 page 時（使用者同意後）：
  1. 依功能分組提案代碼，使用者確認後寫 `registry.pages[].code`、`feature`。
  2. 建功能 page，把 frame 搬過去並改名成 `<代碼> <畫面名>`；搬完重讀 node id 更新 `design_node`（不假設搬移後 id 不變）。
  3. `figma.pages.design` 改成物件格式（代碼 → `{name, id}`），舊的 `設計稿` page 清空後由使用者決定刪除或保留。
  4. 搬完跑 `figma_audit.js` 與頁高回歸，結果記 SYNC_LOG。

## 7. 驗收

- `figma_pages.js`（check）`ok: true`；`renamed` 列出的已更新 manifest 名稱。
- `manifest.figma.pages` 每個 id 都讀得到；名稱和 Figma 不一致時已更新 manifest。
- 每筆 `registry.pages[]` 有 `code`、`feature`；`design_node` 在對應的功能 page 上。
- 正式稿 page 上沒有 registry 以外的 frame（有就列出：搬去調整區或自由 page，或補登記）。
- 調整區沒有已套用卻還留在設計師 Section 的副本。
