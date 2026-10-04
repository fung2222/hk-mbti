# 平板＋桌面版全面重做 — 交接簡報（Roy 2026-10-04 授權）

## 0. 一句話
把 **平板（768–1023）＋桌面（≥1024）** 兩個排版層**重新設計**（可以大改）。**唯一硬性保留**：
主頁要**保留 16 型卡牌滑輪**（橫向可滑／可左右切換嘅 16 型卡列；做出「類似」效果都可以）。
其他排位細節由你（實作者）決定。**手機版（<768px）一個 pixel 都唔准郁。**

## 1. 環境（實情，唔好靠估）
- Repo：`/opt/data/repos/hk-mbti`（branch `main`）。Live：https://fung2222.github.io/hk-mbti
- 單檔 SPA：`index.html` 內含**巨大 inline `<style>`**（≈L1–1022）＋**巨大 inline `<script>`**（≈L2860 之後）。
- 測試：`tools/ui/*_test.js`（jsdom）、`tools/desktop_layout_test.js`（38 條）、`tools/desktop_gate_test.js`（34 條）、`tools/preflight.py`（32 條）。
- 跑測試要先：`export NODE_PATH=/opt/data/profiles/apps/cache/scratch/harness/node_modules`
- 全部跑法：`for f in tools/ui/*_test.js; do node "$f"; done` ＋ `node tools/desktop_layout_test.js` ＋ `node tools/desktop_gate_test.js` ＋ `python3 tools/preflight.py` ＋ `sh tools/ui/run.sh`

## 2. 現有桌面／平板層（要改嘅嘢）
- **Gate**：`index.html` L886–905 嘅 `<head>` inline script。條件 `dt = (innerWidth >= 768) && !small`，`small = screen.width < 680 || screen.height < 600`。
  加 `html.dt` class。→ **平板同桌面共用 `.dt`**，再靠 media query 分層：
  - `@media (min-width:1024px)`、`@media (min-width:1280px)`、`@media (min-width:1440px)`、`@media (min-width:768px) and (max-width:1023.98px)`
- **桌面 CSS 塊**：≈`L704–1020`，全部係 `html.dt ...` 選擇器（共 122 處 `html.dt`）。
- **桌面頂部導覽**：`#dtNav` L1026–1037（`.dt-nav-in` / `.dt-nav-brand` / `.dt-nav-links` / `.dt-nav-cta`）。
  而家只有 4 個 link：性格百科、關於港式 MBTI、香港16型統計、我的紀錄。
- **桌面頁尾**：`#dtFoot` L2301。
- **主頁 16 型滑輪**：`#homeTypeReel` L1980 ＋ `.home-type-reel-wrap`（`html.dt` 已有相關 CSS）。
- 桌面主頁另有 hero：`.home-hero` / `.home-hero-copy` / `.home-hero-mbti` / `#dtHeroCta` / `.dt-cta-gold` / `.dt-cta-ghost`。

### 已知要修嘅問題（文件已記）
1. 主頁「探索更多」**5 格放 4 欄 grid → 第 2 行剩一格空位**。
2. 頁底約 **72px 死白**。
3. `#dtNav` **缺「計分方法同限制」（`openMethod()`）同「私隱聲明」（`openPrivacy()`）**。
4. 最近兩日內容大改，桌面層未追上：**性格解說頁 `#type` 4 個分頁**（性格／關係／場景／深入分析）、
   **深入分析 9 章**（`#deep` / `#deepChapter` / `#deepTypeToc`）、**性格百科 `#hub`**、
   三塊文章色卡（相處／拍拖／章節）、字母卡 `#letter`、結果頁 `#result`、紀錄頁。

## 3. 硬性規則（Roy 嘅鐵律，違反＝退貨）
- **全站冇 emoji**（連代碼註解都唔准；`tools/preflight.py` 會硬失敗）。
- **唔准改手機版（<768px）任何渲染**；新規則一律寫入 `html.dt` 或 ≥768px 嘅 media query。
- **字色 token 只有 4 個**（主要 `var(--ink)`／次要 `#6b6560`（dark `#A79E92`）／金棕 `#A08A5C`（dark `#C0A87A`）／另有 1 個見 `#hub` 用色），**唔准自己開新 hex**；字重只准 **400/600/700/900**。
- **黑夜模式**：`html.dark` 之下只准改顏色，**唔准改 display／尺寸／位置／動畫**；新 dark 規則一律放入 `#dark-layer` 區塊。
- **唔准**改 `VERSION` / `manifest.json` / `sw.js` CACHE / 畫面版本字（現時 v2.0.0）／唔准 tag／唔准 git push（由母 agent 做）。
- **改 `index.html` 大型 inline CSS 安全做法**：**唔准用貪婪／半貪婪 regex 刪 CSS 規則**（曾一次過誤刪 307 行）；要用**括號配對**逐條刪。
  改完**一定要**抽 inline script 出嚟 `node --check`（曾因引號寫錯令 app 全黑）。
- 顏色主要用 Tailwind class ＋既有 CSS 變數；唔好引入新 CDN／新依賴。
- 唔准用 `!important` 濫炸；唔好改 JS 邏輯（除咗為桌面需要新增少量 DOM／render 分支）。

## 4. 交付要求（Acceptance）
1. **平板 768–1023** 同 **桌面 ≥1024（含 1280／1440）** 兩個層都重新設計過，睇落係「app 感」唔係「放大的手機」：
   邊距／欄寬／字級／留白要跟螢幕大細 **有節奏地放大**（例如內容最大寬度分級、唔好一味置中一條 448px 窄柱）。
2. **主頁保留 16 型卡牌滑輪**：橫向列出 16 型卡（可滑／可用左右箭嘴或鍵盤切換），唔可以變成純 grid 或者消失。
3. 上面「已知要修嘅問題」1–4 全部處理。
4. **測試**：`tools/ui/*` 20 檔全綠、`desktop_layout_test.js`（38）、`desktop_gate_test.js`（34）、`preflight.py`（32）全綠。
   可以（應該）**新增**斷言守住你新做嘅桌面行為（例如：滑輪存在、無 72px 死白、dtNav 有 7 個項目、5 格 grid 用 5 欄或 3+2）。
   測試用 jsdom，**冇 layout 引擎** → 驗排版要用「抽 CSS 數值計數」或者量 flex/grid 規則，唔可以靠肉眼。
5. 最後回報要**貼真實測試輸出**（邊個檔幾多條通過），唔准寫「應該冇問題」。

## 5. 唔准做
- 唔准 `git push`、唔准 tag、唔准改版本號、唔准改其他 repo（`/opt/data/pwa-source/` 係禁區）。
- 唔准 send file／screenshot／開 local server／zip。
- 唔准自己發明新色／新 icon 風格（線條 icon、`fill:none;stroke:currentColor`）。
