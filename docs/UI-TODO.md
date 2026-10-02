# UI TODO — 自訂 app 彈窗 / 互動統一

> 最後更新：**2026-10-02**（新增第 19–22 項）｜狀態：**主體完成 ✓**（A/B/C 之外仲有 4 個網頁感問題＋13 項風格）

## 背景（原本嘅問題）
app 用瀏覽器**原生** `confirm()` / `alert()` ✗ → Android WebView 自動加標題「**fung2222.github.io 顯示**」✗
→ ① 露網站網址 ✗ ② 完全唔似 app ✗。原生標題**冇任何方法隱藏** ✗ → 唯一解法＝自訂 HTML 彈窗 ✓

## ✅ 已完成（全部已上 live）
| # | 項目 | commit |
|---|------|--------|
| 1 | 自訂彈窗元件 `#appDialog` + `appDialog()`（Promise）／`appNotice()` | `c121d74` |
| 2 | 「離開測試」確認改用自訂彈窗（唔再露網址） | `c121d74` |
| 3 | Android 返回鍵防誤觸：`popstate` → 彈窗 + **`pushState`**（唔可以 replaceState，否則第二次撳直接退出） | `1372e38` `9f05b31` |
| 4 | A 組 5 個確認框 + B 組 15 個提示框 → 自訂彈窗（系統訊息用**書面語**，題目／性格內容保持廣東話） | `dc74bbc` |
| 5 | 垃圾桶（單筆刪除）：取消「再撳一次」兩段式 + 修 `event.target` bug（撳到 icon 冇反應） | `b796ed3` |
| 6 | 維度字母卡 E/S/T/J 撳落去冇反應 → `LETTERS` 缺 `career` 導致 throw → 加保護 | `94ad4de` |
| 7 | 「清除全部紀錄」：撳一次即彈確認（同垃圾桶一致） | `94ad4de` |
| 8 | 全 app 33 個 `<button>` 補 `type="button"` | `37e3312` |
| 9 | wizard 三處漏掉 `if(...)` + `return`（`dc74bbc` 回歸）→ 修正 + 14 項回歸測試 | `eca6d84` |
| 10 | 版本卡／紀錄卡曾改「單撳即入」→ Roy 要求還原 → 已還原（區塊與改前逐字節相同） | `8ddd669` |
| 11 | 維度頁「適合嘅工作」永遠空白（`事業` vs `career` 欄位名唔一致，之前仲會 throw 令成版開唔到） | `8ba75e1` |
| 12 | 維度入口 4 張卡寫「E vs I」但只開到**第一個**字母 → 改成兩個字母各自獨立撳得（`.dim-pick`） | `fecc582` |
| 13 | 性格百科 16 型格曾被改（圓角/格距/比例）→ **Roy：直角係好嘅** → 已**逐字節還原**（`git diff` 證明一樣）＋加守門測試禁止再改 | `560c77e` → `5914890` |
| 14 | **「4 個維度 8 個字母」卡美化**：字母 chip → 21px 粗黑體大字、每個字母用返自己嘅顏色、`vs` 基線對齊、無框（兩個字母照樣各自撳得） | `5914890` |
| 15 | **4 個「網頁感」問題**：① sw.js offline fallback（新檔 `offline.html`，純內嵌 CSS 唔靠 CDN）② record/stats/tee app 感（tap-highlight 透明、`user-select:none`、`overscroll-behavior-y:contain`）③ 全 app 攔 `contextmenu` ④ index/privacy 移除 `target="_blank"`。**第二輪 Roy 決定**：全 app 一致鎖選字（連主頁／私隱頁）＋ **圖開例外**（長按圖仍可儲存／分享），輸入框照樣可以選字貼上。**2026-09-29 Roy 確認**：內頁下拉鎖住係啱嘅 → ⚠️ **2026-10-02 Roy 推翻**：改為**全站開放**，只鎖測試期間（見第 22 項） | `f39043a` `4e656c0` |
| 16 | **黑夜模式**：6 頁各加 `<style id="dark-layer">`，**只改顏色**；16 型 16 色／分享卡 canvas／場景 icon 設計色一律不變；字色對比全部 ≥4.5:1（WCAG AA）；金底按鈕字轉深色 | `39e30a3` |
| 17 | **主題掣（日頭／黑夜手動切換）**：Roy「要有得揀」→ 主頁右上（**選單隔離**）加線條 SVG 太陽／月亮掣；**未撳過 = 跟系統**，撳過記入 `localStorage hkmbti_theme`（之後唔再跟系統）；dark layer 改由 **`html.dk` 主導**（6 頁）＋ `head` 最早期加防閃 script；順手同步 `meta theme-color`。另修 2 個桌面測試嘅脆弱 script regex（唔可以跨越 `</script>`） | `2a6ae00` |
| 18 | **黑夜模式補漏 v3**（Roy：仲有白色位）：`.card`（版本選擇大面板）、`.option`（答題選項）、`.glass` / `.hub-type-go` / `html.dt .scene-cell`（白玻璃）、`tee .tee-card` / `.filter-bar` 全部轉深；hover 暗金 `#8B6F3D` → `#D8C69E`；`.mth-l` / `.hub-type-hint` / `.stat-pill .count` 深灰字轉淺；金底白字（`option-letter`）轉深字。**新增守門：每頁淺底 selector 一定要有 dark 覆蓋**（`dark_mode_test` 43 → 60 項）。**2026-09-29 Roy 完全閂 app 再開後確認：睇到 OK** ✅ | `2744add` |

| 19 | **拆走三個已淘汰分頁**（Roy「整靚啲潔淨啲」）：`#spectrum`／`#social`／`#romance` section ＋ 7 個函數 ＋ hash 路由 ＋ `NAV` ＋ `restoreNav` case ＋ 專屬 CSS ＋ 桌面 dead selector。`index.html` **317KB → 261KB**。`#socialArticle`／`#romanceArticle` **保留**（場景模式撳「進入」會用） | `3c149dc` |
| 20 | **修 2 個原有 bug**：① `window.isUnlocked` **從來冇定義過** → 已解鎖用戶撳「人格深入分析」永遠被彈去升級頁 → 加 `window.isUnlocked = function(){ return window.getTier() === "full"; }`（單一來源 = `hkmbti_tier`）② `show()` 開頭 section 清單仍列已刪嘅 `spectrum`/`social`/`romance` → `null.classList` throw → **成個 render 鏈中途爆**（＝用戶見空白） | `3c149dc` |
| 21 | **頁底大白真兇**（Roy 報「我的紀錄」冇改善）：`record.html`／`tee.html` 各自有 `body{padding-bottom:80px}`，**獨立頁唔共用 index.html CSS** → 改 `calc(16px + env(safe-area-inset-bottom))`；「資料 100% 喺你部機（localStorage）／跨裝置唔同步」整句移入「匯出／全部刪除」卡片做標題（`.85rem`/700/`#6b6560`，另加 dark 覆蓋），底部 `footer-note` 刪走 | `3c149dc` `c72ecc1` `03b7572` `ee0fe2e` `0ad23e5` |
| 22 | **下拉重新整理政策反轉**（Roy 2026-10-02）：**全站開放**，**只喺 `#test` 測驗進行中先鎖**。解除 `offline.html`／`record.html`／`stats.html`／`tee.html` 各自嘅 `html,body{overscroll-behavior-y:contain}`；`index.html` 嘅 `body.in-test` ＋ `documentElement.style.overscrollBehaviorY` 保留（只測驗中生效） | `3c149dc` |
| 23 | 百科「由場景睇」場景詳情：16 型卡 grid 同下面測試入口卡太貼（Roy 圖報）→ `#hubSceneDetail .hub-type-grid{margin-bottom:20px}`、`.hub-type-hint{margin-bottom:10px}`（**scope 住**，唔影響百科／深入分析嗰兩個 `.hub-type-grid`） | `3c149dc` |
| 24 | **性格解說頁（`#type`）重排：4 個分頁 tab**（Roy 2026-10-02 方案 B：性格／關係／場景／深入）。根因：`TYPES` 有 8 個欄位，人格頁只用 4 個（`desc`／`tags`／`score`／`compat` **0 次**），但結果頁全部有 → 所以「結果頁生動、性格頁死板」。改：分頁掣沿用百科 `.hub-mode-switch`；性格 tab 用返嗰 4 個欄位 + 性格刻度 bars + 強弱 2 欄；關係 tab 4 張卡 + 相容性；場景 tab 10 張卡直接開文章；深入 tab 9 章目錄。**拆走** `#typeScenes` 獨立分頁（`openTypeScenes` 保留做兼容入口）＋ `#typeMore` 入口卡 ＋ 死 CSS `.type-more-*`／`.persona-sect`。相容 % 改穩定值（原本 `Math.random`）。守門：`tools/ui/type_tabs_test.js`（**64** 項） | `6bce43a` |
| 26 | **人格頁 4 項微調**（Roy 第二輪）：①tab「深入」→「深入分析」＋星星 SVG icon（金色，唔用 ★ 字元）②**左上角返回掣一律「返上一頁」** —— 查出 `#method` 嘅 `backFromMethod()` 硬跳指定頁（由 `#hub`／`#type` 入嚟會跳錯）→ 改 `goBack()`、清死變數 `_methodBackTo`；其餘 13 個 `#index` 掣＋4 個 sub-page 本來就係上一頁語意 ③強項／弱項每項加語意 icon（99 詞 → 10 家族，強金弱灰）取代裸「＋／－」④深入分析目錄底「返全部 16 型」旁水平加「立即測試」「16型統計」 | `8a8f15e` |
| 27 | **人格頁排版兩問題**（Roy 圖報）：①「深入分析」tab 斷成兩行（`.hub-mode-btn{flex:1 1 0}` 平均分，360px 每粒 69.5px 但「深入分析」要 ~74px）→ 長字掣 `flex:0 0 auto`＋`nowrap` 自己攞 88px，其餘 3 粒分剩位（390/360/320px → 73/63/50px 全部單行）②強／弱項 icon 高過文字 6px（`.pros-item` 行高 27px、icon 15px 又冇 `align-items`；`margin-top:3px` 只補一半）→ 拆 margin 改 `.pros-box .pros-item{align-items:center}`。守門：`type_tabs_test` 加「斷行算術」（由 CSS 抽參數即場計）＋「水平對齊」斷言（67 項） | `8ec1fb0` |
| 28 | **全站返回鍵審計＋修正**（Roy 圖報章節頁問題）：① 14 個 `.page-back` 一律 `goBack()`（`#deepChapter` 左上角曾硬跳目錄、`#method` 曾硬跳指定畫面）②真根因 1：`openDeepChapterFromType` 先經 `openDeepType` → `show("deep")`，人格頁→章節中間夾 2 層 phantom history → 改成只設狀態 ③真根因 2：`show()` 先捲返頂才寫 history → `sy` 永遠 0 → 改喺捲返頂前捕捉 `_leftSnap` ④真根因 3：新增導覽堆疊（persist `hkmbti_nav_stack`）令下拉重整後仍然返得上一頁 ⑤真根因 4：`openDeepType` 自己 push history 但冇同步堆疊 → popstate 走位（`premium_test` 4 層鏈捉到）⑥真根因 5：popstate 改用「離開嗰刻」快照（popped）優先，順手還原百科場景詳情子視圖。下拉重新整理審計：只有 `body.in-test` 鎖，5 個 sub-page 零 overscroll 規則 ✓。守門：新 `tools/ui/back_nav_test.js`（29 項，含 9 個真跑情境） | `4809518` |
| 25 | 16 型深入分析 **144 章全部寫齊**（16 型 × 9 章、約 18,600 中文字；每章 106–160 字、固定標題／收尾）—— 4 批 commit：`f765162`／`dfb8ba7`／`d8c683e`／`c66ccad` | 4 個 commit |
| 29 | **結果頁七項微調 ＋ 修 16 型卡殘留變淡 bug ＋ 百科 band 間距**（Roy 2026-10-02 三報）：① 結果頁：刪性格百科入口、「人格＋完成時間」文字移到分享卡上面、三粒掣改三層次配色（`btn-gold`/`btn-line`/`btn-quiet`）、強弱項換型別 icon（同人格頁一致，`.pros-mark` 已刪）、配對行英文前加該型 icon、底部掣「再測一次」→「立即開始」；**強弱項 icon 重新分配**（99 詞／12 語意家族，回溯搜尋：同一型同一欄 5 個唔准重複、分佈 3–18→5–14）。② 修 bug：入過 16 型卡再遊走返百科 → 全部卡 60% 透明（`.hub-type-grid.is-picking` 只有主頁跑馬燈會清；`#hubTypeGrid` 只開機 render 一次）→ 新增 `clearTypePick()`，`openType()`＋`show()` 都叫。③ 百科 16 型卡 band `margin-bottom` 26px→16px（26px 係場景文章頁例外值，leak 咗；同一 band 嘅 `result-bleed`/`scenes-bleed` 都係 16px）。新測試：`result_page_test.js`(22)、`type_pick_test.js`(15)；更新 3 條舊斷言 | `8cf69af` |
| 30 | **第二輪六項**（Roy 2026-10-02）：①**修 BUG：人格頁「場景」tab 10 個場景掣全部撳唔到** —— 根因＝`openSocialArticle(key,type)` 要 2 個參數，但 `renderTypeTabs()` 嘅 `mk()` 生成 onclick 時只傳 key → `articles[undefined]` → 靜靜 `return`（silent fail；拼接式 onclick 靜態 grep 睇唔到）。⚠️ 同時揭發**假守門**：舊斷言只驗 onclick 字串有冇函數名 → 掣死咗照綠 → 已改「驗參數數目＋真撳＋驗內容 render」。② 結果頁三粒掣由「三層次配色」改**統一柔和 `.share-btn`**（Roy 話原本怪）③ 百科 `.hub-bleed` 再緊：margin 16→**12px**、padding-bottom 20→**16px**④ 關係 tab「同邊種人最夾？」每行加型別 icon（`.cmp-ico`，用該型色卡主色）⑤ 全部 8 個「想確認自己 MBTI 人格？」CTA 上面加**發光燈泡**（`.cta-bulb`：`var(--gold)`＋雙層 drop-shadow 光暈＋置中，SVG 自畫 8 path，唔用 emoji）｜測試：hub_consolidation 74/74、result_page 33/33、premium 168/168；修 3 條舊斷言＋2 條脆弱字數窗口斷言 | `e568076` |
| 31 | **第三批五項**（Roy 2026-10-02）：①分享卡右上角**日期取消**（刪 `dateLabel`；原本係「畫卡嗰刻」嘅日期，唔係完成日）②分享卡「版本＋題目」字 `bold 20px` → **28px**、alpha .68→.9、`y = headerMidY+2`（冇咗日期行，對正 icon 中線）③日期遷去結果頁**「完成時間」欄**（`<span id="resultDate">` ＋ 新 `window.shareDateLabel(ts)` 出 `YYYY.MM`；新測完用今日／開舊記錄用 `rec.timestamp`）④「看完整分析」紅色**純文字 link** → **實體按鈕** `.result-more-btn`（淡紅底＋紅邊＋`var(--accent)`，dark 入 `#dark-layer`）⑤場景主題 icon 30 → **36px** ＋ `.scene-go-ico{align-self:center}` 明確垂直置中（兩處列表；詳情頁頭 icon 維持 30）⑥**刪**相處／拍拖文章頁底「立即睇睇其他攻略」整張卡 ＋ 死 CSS（`.softbox-tight`／`.article-more-list`／`margin-top:9px` 規則）；`openTypeScenes` 函數保留供 `#typeScenes` 深層連結｜測試：result_page 49/49（＋16 條新）、hub_consolidation 75/75、type_tabs 67/67（3 條引用已刪卡嘅斷言反轉）；全套 19 檔綠 ＋ deeplink ＋ desktop 38/34 ＋ preflight 32 | `536058e` |

## ⏳ 未做
1. **C 組 3 個 HK$18 示範解鎖彈窗**（`index.html` L2056 / `record.html` L597 / `tee.html` L309）→ 留上架前連 Play Billing 一次過改（soft pitch「看完整分析」）
2. ~~`LETTERS` 欄位名唔一致~~ ✅ **2026-09-29 已修**（commit `8ba75e1`）
   根因：`data.js` 用**中文**欄位 `事業`（8 個字母全部有內容），程式讀**英文** `career` ✗ → 永遠空白；未加保護前仲會 throw 令成版開唔到（＝Roy 報「撳落去冇反應」）
   修法：`$("letterCareer").innerText = ((L.事業 || L.career) || []).join("、")` ✓
   測試：`tools/ui/letter_career_test.js`（9 項，逐個字母核對內容）
3. ~~4 個「網頁感」問題~~ ✅ **2026-09-29 已做**（見下表第 15 項；`f39043a` `4e656c0`）
4. **黑夜模式／主題掣**：已出（下表第 16、17 項）。等 Roy 睇 live 執色。
5. **13 項視覺風格微調**（Roy 2026-09-29 提出「一項一項做」）→ ⏸️ **2026-09-29 Roy：暫時唔改，維持現狀**（清單保留喺度，第日想改再開）
   清單（一次改一項，每次等 Roy 睇 live 確認）：
   1. 底色　2. 邊框　3. 圓角　4. 陰影　5. 遮罩（彈窗後面嗰層）　6. 標題字　7. 內文字
   8. 主掣（金色）　9. 次掣（透明金邊）　10. 尺寸（卡片／彈窗大細）　11. 間距　12. 動畫（彈入彈出）　13. 對齊
   ⚠️ 對象係**自訂彈窗**（`#appDialog` / `.ad-card`）嘅外觀；改嘅時候手機排版唔可以變。

## 鐵律
- ❌ 唔可以改手機排版；desktop 規則只可放 `min-width` + `html.dt`
- ❌ 新元素預設 `hidden`（.hidden），唔郁現有元素
- ❌ 全站冇 emoji（preflight 會捉）；❌ 唔用「買／付費／移除廣告」字眼
- ❌ **版本卡／紀錄卡唔可以改成「單撳即入」**（Roy 明確要求保留「著燈展開 → 撳立即進行」）
- ❌ 改 `alert`／`confirm` → 自訂彈窗時，**必須保留原本 `if(...)` 條件同 `return`**（血淚教訓）
- ❌ **下拉重新整理：全站開放，只喺 `#test` 測驗進行中先鎖**（2026-10-02 Roy 定案，推翻 09-29 嘅「內頁鎖住」）→ sub-page 唔准再出現 `overscroll-behavior-y:contain`
- ❌ **拆走一個 `section` 要一次過改 7 處**（本體／`show()` 清單／`window.openXxx`／hash `MAP`／`NAV`／`restoreNav` case／專屬 CSS＋dark＋test）；漏 `show()` 清單 → `null.classList` throw → **成個 render 鏈中途爆 = 用戶見空白**
- ❌ **刪 `window.X = function` 區塊之前，一定要對比刪前刪後嘅函數清單**（`grep -o 'window\.[A-Za-z]\+ = function' | sort`）—— 共用 helper 會坐喺兩個頁面函數中間（`formatGuideHtml`／`formatTypeFullHtml` 就係咁被誤刪過）
- ❌ **sub-page 唔共用 index.html 嘅 CSS** → 改全站性規則（頁底留白／overscroll／字型／間距）要 `grep -rn '<property>' *.html` 逐個檔改
- ✅ 改完必跑：`sh tools/ui/run.sh`（15 檔 jsdom）、`python3 tools/preflight.py`(**32**)、`tools/desktop_layout_test.js`(**38**)、`tools/desktop_gate_test.js`(**34**)、`tools/deeplink_test.js`

## 測試（已永久保存入 repo）
`sh tools/ui/run.sh` → **16 個** jsdom 回歸測試（app_feel 46、**backkey 30**、**back_nav 29**、boot_reload 25、dark_mode 60、dialogs_ab 30、hub_consolidation 69、hub_tiles 18、letter_card 13、letter_career 9、letter_dim 5、oneshot_delete 14、premium 168、reel 27、**type_tabs 67**、**back_nav 29**、version_card 13、wizard 14）
（首次需要：`npm i --prefix tools/ui jsdom`）＋ `tools/ui/start_flow_probe.js`（人手睇全流程）＋ `tools/ui/button_audit.js`（逐粒掣真撳捉 runtime 錯）
