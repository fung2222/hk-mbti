# 手機版深度除錯：交接簡報（Roy 2026-10-04）

## 0. 今次要做嘅嘢 ＝ **出一份報告**（唔係即刻改 code）
目標：對整個 app 做**全面除錯審計**，找出**真 bug**，交一份**有證據、按嚴重度排序**嘅報告。
報告寫入 `docs/MOBILE-DEBUG-REPORT.md`（可以本地 commit，**唔准 push**）。
**先報告、後修**：母代理（Roy 嘅 Apps 主管）會審你份報告，再決定邊幾項要改。
所以：**唔准改 `index.html` 或其他 app code**（唯一例外 ＝ 寫 `docs/MOBILE-DEBUG-REPORT.md`）。

## 1. 環境（實情；自己驗，唔好靠估）
- Repo：`/opt/data/repos/hk-mbti`（branch `main`，HEAD 已 tag `desktop-v3-2026-10-04`）。Live：https://fung2222.github.io/hk-mbti
- 單檔 SPA `index.html`（巨大 inline `<style>` L~31 ＋ 巨型 inline `<script>`；另有 `<style id="desktop-layer">`／`#desktop-mode-fix`／`#dark-layer`）
- 子頁：`record.html` `stats.html` `tee.html` `privacy.html` `offline.html`
- 資料：`data.js`（`window.TYPES_FULL`／`PALETTE`）`premium-data.js`（`window.PREMIUM`，16 型 × 9 章）`social.js`（相處 7／拍拖 3 文章）`type-icons.js`
- 測試：`tools/ui/*_test.js`（20 檔，jsdom）、`tools/desktop_layout_test.js`（**56**）、`tools/desktop_gate_test.js`（34）、`tools/deeplink_test.js`、`tools/record_view_test.js`、`tools/voice_test.js`、`tools/preflight.py`（32）
- 跑法：`export NODE_PATH=/opt/data/profiles/apps/cache/scratch/harness/node_modules`；`sh tools/ui/run.sh`
- **jsdom 冇 layout 引擎、冇真瀏覽器** → 排版要用「由 CSS 抽數值計」或量 flex/grid 規則；**冇得開 local server／截圖**（禁止）

## 2. 審計範圍（手機 <768px 為主，但所有尺寸都要掃）
1. **功能壞／silent fail**：撳制冇反應、`onclick` 字串拼接錯、`window.X = function` 同名定義兩次（後者靜靜蓋前者 — 曾有前科）、render 後 event／狀態冇 reset、`_histWrite` 堆疊唔同步
2. **排版溢出**：320／360／390／430px 爆版、字被截、元素出界、水平滾動、格數對唔上（用算術，唔准肉眼猜）
3. **狀態遺留**：測試中途離開再入、返回鍵錯誤（鐵律：所有返回鍵＝`goBack()`／history.back 返上一頁 ＋ 還原滾動位置；例外只有底部標明「目錄」／「全部場景」嘅導覽掣）、reload 後狀態、`sessionStorage`／`localStorage` 讀寫
4. **黑夜模式漏洞**：深底深字／淺底淺字、新元件冇 dark 規則（規則一律入 `#dark-layer`；只准改顏色）
5. **內容一致性**：emoji 殘留（全站禁用；`tools/preflight.py` 硬失敗）、同一句 CTA 兩種寫法、字色違反 4 token／字重違反 400-600-700-900
6. **資料層**：`data.js`／`premium-data.js`／`social.js` 內文（空段、`**` 殘留、清單冇對齊、令排版怪嘅結構）
7. **頁區覆蓋**：主頁（16 型滑輪＋探索更多＋版本卡＋記錄 CTA）、測試流程（生活／進階／BB 版、中途離開再入）、結果頁（三粒分享掣、看完整分析、再測一次、情景 match、兼容度）、`#type` 四頁籤、`#hub` 百科（16 格／場景列表／場景詳情）、`#deep` ＋ 9 章 `#deepChapter`（含解鎖攔截）、相處 7＋拍拖 3 文章頁＋牌匾左右三角、`#letter` 字母卡、`record.html`／`stats.html`／`tee.html`／`privacy.html`／`offline.html`

## 3. 證據規則（硬性）
- 每項 bug 要有：**檔案＋行號**、**重現步驟**、**期望 vs 實際**、**你用咩驗到**（真實指令／jsdom 探針／計算過程）
- **事實**（有工具輸出）同**推測**要分開標明；唔准把推測寫成事實
- 唔准寫「應該冇問題」；驗唔到就寫「需真機驗」＋已驗到幾多
- 即棄探針只准寫喺 `/opt/data/profiles/apps/cache/scratch/`

## 4. 報告格式
```
# 手機版除錯報告（日期）
## 執行摘要（3–6 句：整體健康度、最嚴重嘅幾樣）
## 測試實跑輸出（逐檔幾多條／失敗）
## P0 壞（用唔到）
## P1 一眼見到／錯位
## P2 打磨
（每項：位置｜證據｜期望 vs 實際｜建議最小修法｜影響邊啲 selector／函數）
## 需真機驗
## 如果只修 3 樣，修邊 3 樣（附理由）
```

## 5. 唔准做
- 唔准改 app code（只准寫 `docs/MOBILE-DEBUG-REPORT.md`）；唔准 push／tag；唔准改版本號（v2.0.0）
- 唔准開 local server／截圖／send file；唔准改 `/opt/data/pwa-source/`
- 唔准為咗「美觀」而改任何已定案設計（16 型卡 9/16 直角、色 token、emoji 禁令）
