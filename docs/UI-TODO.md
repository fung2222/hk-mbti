# UI TODO — 原生對話框 → 自訂 app 彈窗

> 建立：2026-09-29（Roy 要求）｜狀態：**未開始**（等 Roy 逐項確認）

## 問題
app 用咗瀏覽器**原生** `confirm()` / `alert()` ✗
→ Android WebView 會自動喺彈窗加標題列「**`fung2222.github.io` 顯示**」✗
→ ① 露咗網站網址 ✗ ② 完全唔似 app ✗（違反「app 感、唔係文件感」美學）
→ **原生對話框嘅標題冇任何方法隱藏** ✗（唔係 CSS／JS 控制得到）→ 唯一解法＝唔用原生對話框 ✓

## 目標
全部換成**自訂彈窗**（HTML + CSS + JS）✓
- 風格：深藍底、金掣、大字、留白、**冇 emoji** ✓
- 唔會顯示任何網址 ✓
- 做法參考現有元件：`index.html` `#countdownOverlay`（L1894）＋ CSS `.cd-overlay`（L170）
- 新元件 `#appConfirm` **預設 `hidden`** → 手機排版零影響 ✓

## 待改清單（一次做一項；每項改完等 Roy 睇 live 確認，才做下一項）

### 1. 離開測試確認 ← 最高優先（Roy 2026-09-29 提出）
- 觸發：`index.html` L1906 `<button onclick="confirmExit()">`（畫面按鈕 ✓）
- 現況：`window.confirmExit`（L3893）
  ```js
  if(confirm("離開測試？\n\n下次入 app，主頁會出『上次未完成』卡，撳「開始」就續做。"))
  ```
- 改成：自訂彈窗，兩粒掣「**繼續測試**」／「**離開**」✓
- ✅ 技術上冇阻礙：呼叫點係畫面按鈕，**唔係** `beforeunload`／`popstate` → 可以用非同步 Promise 寫法 ✓

### 2. 其他確認框（同類，一齊換）
- `index.html` L5029（確定要刪除呢個紀錄？）
- `index.html` L5113（確定要清除全部測試記錄？）
- `index.html` L5157（放棄上次進度？）
- `record.html` L500（確定要刪除呢個紀錄？）
- `record.html` L565（確定要清除所有紀錄？）

### 3. 表單提示（8 個 alert）
- `index.html` L3511 / L3514 / L3517 / L3589 / L3590（請輸入姓名、請揀稱呼、請揀男或女…）
- 建議改成**畫面內 inline 提示**（更 app 感）；改動較大，要另議 ✓

### 4. 錯誤提示
- `index.html` L4177（生成圖片失敗，請再試一次）
- `index.html` L4525（冇結果可以下載）
- `index.html` L4533（生成圖片失敗）

### 5. HK$18 示範解鎖框（暫時唔動 ✗）
- `index.html` L2031 ／ `record.html` L597 ／ `tee.html` L309
- 留返上架前改 Google Play Billing（soft pitch「看完整分析」）時一次過搞 ✓

## 鐵律（改嘅時候必須遵守）
- ❌ **唔可以改手機排版**：新元素預設 `hidden`；overlay 用 `position:fixed` 全屏 → 唔佔 layout ✓
- ❌ **唔郁桌面層**（`html.dt`／`#dtNav`／`#dtHeroCta`／`#dtTypeRows`／`#dtFoot`／`--dt-w`）
- ✅ 改完一定要跑：`desktop_layout_test`（37）／`desktop_gate_test`（34）／`preflight.py`（20）／`deeplink_test`／`record_view_test`／`voice_test`
- ❌ 唔加 emoji；❌ 唔用「買／付費／移除廣告」字眼
