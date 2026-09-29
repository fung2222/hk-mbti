# UI TODO — 自訂 app 彈窗 / 互動統一

> 最後更新：2026-09-29（Roy 要求整理）｜狀態：**主體完成 ✓**（A/B/C 之外仲有 4 個網頁感問題＋13 項風格）

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
| 15 | **4 個「網頁感」問題**：① sw.js offline fallback（新檔 `offline.html`，純內嵌 CSS 唔靠 CDN）② record/stats/tee app 感（tap-highlight 透明、`user-select:none`、`overscroll-behavior-y:contain`）③ 全 app 攔 `contextmenu` ④ index/privacy 移除 `target="_blank"`。**第二輪 Roy 決定**：全 app 一致鎖選字（連主頁／私隱頁）＋ **圖開例外**（長按圖仍可儲存／分享），輸入框照樣可以選字貼上。**2026-09-29 Roy 確認**：內頁（record/stats/tee/離線）**下拉鎖住係啱嘅** —— 保持，唔好解鎖 | `f39043a` `4e656c0` |
| 16 | **黑夜模式**：6 頁各加 `<style id="dark-layer">`，**只改顏色**；16 型 16 色／分享卡 canvas／場景 icon 設計色一律不變；字色對比全部 ≥4.5:1（WCAG AA）；金底按鈕字轉深色 | `39e30a3` |
| 17 | **主題掣（日頭／黑夜手動切換）**：Roy「要有得揀」→ 主頁右上（**選單隔離**）加線條 SVG 太陽／月亮掣；**未撳過 = 跟系統**，撳過記入 `localStorage hkmbti_theme`（之後唔再跟系統）；dark layer 改由 **`html.dk` 主導**（6 頁）＋ `head` 最早期加防閃 script；順手同步 `meta theme-color`。另修 2 個桌面測試嘅脆弱 script regex（唔可以跨越 `</script>`） | `2a6ae00` |
| 18 | **黑夜模式補漏 v3**（Roy：仲有白色位）：`.card`（版本選擇大面板）、`.option`（答題選項）、`.glass` / `.hub-type-go` / `html.dt .scene-cell`（白玻璃）、`tee .tee-card` / `.filter-bar` 全部轉深；hover 暗金 `#8B6F3D` → `#D8C69E`；`.mth-l` / `.hub-type-hint` / `.stat-pill .count` 深灰字轉淺；金底白字（`option-letter`）轉深字。**新增守門：每頁淺底 selector 一定要有 dark 覆蓋**（`dark_mode_test` 43 → 60 項）。**2026-09-29 Roy 完全閂 app 再開後確認：睇到 OK** ✅ | `2744add` |

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
- ✅ 改完必跑：`preflight.py`(21)、`desktop_layout_test.js`(37)、`desktop_gate_test.js`(34)、`deeplink_test.js`、`record_view_test.js`、`voice_test.js`(10)、`sh tools/ui/run.sh`

## 測試（已永久保存入 repo）
`sh tools/ui/run.sh` → 7 個 jsdom 回歸測試：wizard 14、版本卡 13、維度卡 13、垃圾桶 14、彈窗 28、返回鍵 24
（首次需要：`npm i --prefix tools/ui jsdom`）＋ `tools/ui/start_flow_probe.js`（人手睇全流程）＋ `tools/ui/button_audit.js`（逐粒掣真撳捉 runtime 錯）
