# Figma instance、變體與覆寫踩坑

0.4.0 由 `figma-gotchas.md` 拆出。讀取來源、隱藏節點、綁色、SVG、腳本寫法、版面見 `figma-gotchas.md`。未標版本的是 0.1.0 實測。

## 結構性操作會重設東西

原則：resize、clone、swap、切變體、resetOverrides、改 auto-layout 之前讀回 sizing／綁定／名稱／位置／文字屬性，做完再讀回比對（實測 0.3.0 APP 案；0.4.0 Web 案再確認）。

| 操作 | 被重設的東西 | 對策 | 證據 |
|---|---|---|---|
| 母版或 instance `resize()` | 已放進 auto-layout 的 instance 寬度不跟（停在舊寬、FIXED）；FILL／HUG 變 FIXED；鎖比例框寬高都變 FIXED（integer-rules §6） | 母版尺寸先定案再大量建 instance；改後逐一設回 sizing，比例框立刻 `layoutSizingVertical='HUG'` 讓比例帶出高度 | APP 案色票母版 21 個 instance；Web 案 Figure／Card 比例框。0.3.0／0.4.0 |
| 先設 `primaryAxisSizingMode='AUTO'` 再 `resize()` | 變回 FIXED | 一律先 resize，再設 AUTO／HUG | APP 案 7 類母版；0.3.0 |
| frame 由 FIXED 改 AUTO（hug） | 高度變成內容高，可能和原高不同 | 改前先量內容高；長頁用 AUTO＋minHeight。HUG 文字設 maxWidth 後長字在上限內換行、短字寬不變 | APP 案長頁 hug 後變 799；0.3.0 |
| 改 `layoutMode`（變體由橫改直、改 WRAP） | 遺留 `primaryAxisAlignItems:SPACE_BETWEEN` 與 FIXED 高 → 間距變 0、內容壓扁；改 WRAP 後高度可能塌成 FIXED 小值 | 改完重設主軸對齊，`layoutSizingVertical='HUG'`，讀回高度 | Web 案 Footer 手機變體 904→1888；0.4.0 |
| `figma.createAutoLayout()` 建新 frame | 預設 `clipsContent=true`、預設白色實心 fill 未綁變數 | 版面容器建完設 `clipsContent=false`、`fills=[]` | APP 案浮動關閉鈕、頁面容器；0.3.0 |
| 元件組內 clone 變體 | 子層的 component property 綁定（TEXT、BOOLEAN）全部遺失，`setProperties` 有值但畫面不變；`combineAsVariants` 產生的不會掉。clone 後子樹字型未載入，同段寫任何 TEXT 屬性報 unloaded font、整批回滾 | 依圖層路徑對照來源變體補回綁定並讀回；補 characters 綁定可能把文字樣式打回來源樣式 → 補完讀回樣式與高度；動文字前整個子樹 `loadFontAsync` | APP 案 Text field 等新變體；Web 案 13 個 set 補回 70 筆、List Row 92→95→92。0.3.0／0.4.0 |
| 複製獨立母版／轉進變體組 | 複製獨立母版時屬性 key `#` 後綴保留；轉進變體組（含 COMPONENT 改 COMPONENT_SET）後綴才會變 | 需要 BOOLEAN 做不到的差異時另建獨立母版保住 key；改成 set 後更新 registry、確認既有覆寫還在 | APP 案 Dialog Alert；0.3.0 |
| 切變體（`setProperties` 換 variant） | 巢狀子層 id 後綴換成新變體的；同一次呼叫裡設的 TEXT 值被重設；巢狀圖示可能殘留和預設同值的覆寫（母版改色時不跟） | 分兩次：先換 variant、再設文字；舊 id 用 `findOne` 依名稱重取；殘留覆寫用 `figma_audit.js` 的 `staleOverrides` 找 | APP 案變體組修改；Web 案 Filter Bar 籤文字全變預設、Carousel Nav 圖示 strokes。0.3.0／0.4.0 |
| `resetOverrides()` | 連 instance 名稱、尺寸、layoutPositioning、FILL、巢狀 exposed 屬性、子層圖片 fill（含 CROP）一起重設 | 照下方「換成乾淨 instance」先讀後貼回 | APP 案 Drawer；Web 案 38 個 instance。0.3.0／0.4.0 |
| INSTANCE_SWAP 換 icon | 圖層名變成母版名（`name === 'icon'` 找不到） | 用 `getMainComponentAsync()` 或「第一個可見、非 trailing 的 INSTANCE」找 | APP 案按鈕 icon；0.3.0 |
| 帶負偏移 absolute 子層的變體改成 auto-layout | 子層被推回 0，舊稿整排位移 | 變體維持非 auto-layout，另包一層 auto-layout 內層 | APP 案訊息操作列；0.3.0 |
| 動已綁 TEXT 屬性的文字 | TEXT 屬性整個 set 共用：直接改 `characters` 改掉的是預設值；多個變體綁同一屬性時，改一個變體的文字樣式會回寫到其他變體 | 頁面改字用 `setProperties`，誤改用 `editComponentProperty` 還原；手機變體要不同樣式時改完回讀桌機變體樣式與高度，擋不住就讓該變體圖層不綁此屬性，description 註明直接改圖層文字 | APP 案對話元件；Web 案 List Row 桌機 102→99。0.3.0／0.4.0 |

### 換成乾淨 instance（實測 0.4.0，Web 案 38 個 instance）

暫代覆寫要換回母版時：① 讀出 TEXT／BOOLEAN 屬性、要保留的圖片 fill（含 `imageTransform`）、巢狀 exposed 屬性、absolute 位置與 sizing → ② 換變體 → `resetOverrides()` → ③ 重設屬性（先變體後文字，再巢狀 exposed）→ ④ 貼回 fill、位置、sizing → ⑤ 讀回並截圖。

## instance 能改和不能改的

| 想做 | 結果 | 做法 |
|---|---|---|
| instance 內子圖層 `resize()`／`resizeWithoutConstraints()`／`minWidth`／`minHeight` | resize 兩種靜默不生效；min size 報 `cannot be overridden in an instance` | 做成變體（例：Ratio=3:2／4:3／16:9）或改母版；只要對齊高度時設 instance **根層** `minHeight`，差異寫進母版 description（Web 案 Nav Drawer，0.4.0） |
| instance 內子圖層改 `layoutSizingHorizontal='FILL'` | 可以（auto-width 文字放進 FILL 欄不換行時用） | 根治：S3 母版內文預設 FILL（Web 案 KV 導言 714→354，0.4.0） |
| instance 覆寫 maxWidth／maxHeight | 報錯，max size 不可覆寫 | 設在母版 |
| instance 內圖片圖層位置（relative transform） | 不能改 | 改 image fill 的 imageTransform（CROP） |
| 巢狀 instance 的文字綁外層元件屬性 | 報錯 `Cannot set component property references on instance sublayer` | 巢狀 instance 設 `isExposedInstance`，頁面用 `instance.exposedInstances` 找到再 `setProperties`（css-to-figma「元件組合」；APP 案、Web 案麵包屑，0.3.0／0.4.0）。單頁要切內層狀態時，未公開的巢狀 instance 也能直接 `setProperties` 切變體 |
| 母版寬度綁變數的元件放進較窄欄位 | instance 設 FILL 無效，右側被裁 | 可重複使用的列、卡片不要把寬度綁變數 |
| 數量不定的部件做死 3 個 | 要 5 個只能疊本地圖層 | 做到最大數量＋BOOLEAN（Show item 4／5） |

- BOOLEAN 屬性綁到多個變體時，Figma 會把各變體的顯示狀態統一成屬性預設值 → 只綁在需要的變體。
- INSTANCE_SWAP（例：Icon）要在**每一個**變體都綁到內層 instance；漏綁的變體 setProperties 沒反應。
- description 寫「已設 maxLines」不代表真的有設 → 驗證讀屬性值，不讀說明。
- **覆寫會停在舊值，像素對得上也要掃**（0.3.0 規則，0.4.0 Web 案實證）：對齊被寫成 MIN（「查看更多」貼在標題旁）、clone／resize 過的 instance 停在 FIXED（母版 HUG／FILL，內容變長才出錯）、切變體後殘留同值覆寫。`figma_audit.js` 的 `overrideDrift`、`rootSizingDrift`、`staleOverrides` 各抓一類（S7 R3）。
- 母版補上頁面原本用覆寫暫代的效果（spacer、內距）後，兩者會疊加（Web 案 KV 430→470）→ 改完母版立刻清頁面覆寫再量頁高（`core/parallel.md` §5）。
