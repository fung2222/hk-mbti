# A6 流程審計（DeepSeek v4 Pro）— 2026-10-07

> 唯讀審計。審計員：DeepSeek（provider `deepseek`，`-m deepseek-v4-pro`），經 `/opt/hermes/bin/hermes -p apps chat --oneshot` 派出。
> 任務：同上（獨立完成，唔係分工 —— Roy 要求「各自檢查一次」）。
> 以下為**原文照錄**（未經修改）。

---

# 審計報告：apps 代理工作流程（2026-10-06）

審計員：apps profile 主模型（deepseek-flash）｜範圍：唯讀，冇改 repo 任何檔、冇 commit／push／tag
方法：親手讀 `SOUL.md`、`tools/ship.sh`、11 套閘原碼、今日 4 個 commit、`roy-standing-record.md`、`docs/`。每條標 [事實]/[推論]/[猜測]。

---

## 0. 一句判斷

[事實] 今日 4 次出貨（`8af9710`、`1e4c802`、`0278e9e`、`bf2c9a1`）全部冇壞嘢上 live，3 次撞板全部喺出貨前被現有守門捉到。即係話：**「防護網」本身有效，問題出喺「改動手法」同「冇用自己嘅眼睛」**，唔係閘唔夠多。

Roy 要嘅係「一擊即中」，唔係「閘更多」。方向應該係：**改之前查清、改嗰刻用眼、改完加守門**，三件事喺「改」嘅階段一次做對，而唔係靠出貨前 200 秒慢慢兜。

---

## 1. 流程逐步拆解（邊步多餘／合併／自動化）

[事實] 現行 8 步：①讀 skill ②睇現況 ③改 index.html ④抽 inline script 跑 node --check ⑤真 Chrome 探針量度 ⑥ship.sh（11 閘 ~200s）⑦驗 live poll md5 ⑧報告五行。

逐步評：

- **①讀 skill（124,877 字）**：唔係多餘，但「讀邊份」要揀。[事實] SKILL.md 本體 124,877 字、roy-standing-record 41,448 字，全部讀一次係浪費。[推論] 改 CSS 就讀 typography + roy-standing-record 嘅「美學」段；改題目就讀 question-bank-audit；唔使由頭讀到尾。

- **②睇現況（git log/status/read_file）**：不可省，係「唔靠記憶改」嘅前提。保留。

- **③改 index.html**：核心。問題唔喺呢步本身，喺「改嗰刻夠唔夠小心」（見第 4 節）。

- **④抽 inline script 跑 node --check**：[事實] 呢步同 `ship.sh` 內 `preflight` 第 1 項（自動抽 inline script 跑 node --check）**重複**。但佢嘅價值係「快 feedback」——改完即刻知語法錯，唔使等 200 秒。**結論：保留功能、去手動。** 改成現成命令 `sh tools/syntax_check.sh`（一條 command 做完「抽 + node --check」，今日撞板 3 就係靠佢捉到）。

- **⑤真 Chrome 探針量度**：[事實] 同 `ship.sh` 內 `desktop_render_test` 重疊。今日已經做啱咗一半：每次改視覺 bug 都**加斷言入 desktop_render_test**（4 個 commit 每個都加）。[推論] 可以合併成一步：**改 → 加一條量度該位嘅真 Chrome 斷言 → 直接 ship.sh**，唔使先手動探針、再加斷言、再 ship 分兩段。

- **⑥ship.sh（11 閘）**：不可省。見第 2 節點壓。

- **⑦驗 live poll md5**：[事實] roy-standing-record 明寫 GitHub Pages build 有時要 5–10 分鐘，今日實測第 2–3 次（25–50s）對上。[推論] 呢步可以**寫入 ship.sh 尾**（ship 完自動 poll live md5 對本機 md5），變成 `ship.sh` 出貨後自動確認，唔使另行手動。

- **⑧報告五行**：不可省，係「等 Roy confirm」嘅界面。見第 7 節改良。

**總結：[事實] 冇一步係「做咗唔會改變結果」嘅純多餘；但有 3 個手動步驟（④⑤⑦）可以併入 ship.sh，令流程由「8 步手動」壓成「改 → 加守門 → 一條 ship.sh 全包」3 步。**

---

## 2. 壓縮空間（11 套閘）

[事實] 11 套閘分兩類：靜態毫秒級（gate_refs／gate_design／preflight／question_audit）、要跑嘅（run.sh jsdom、desktop_layout、desktop_gate、deeplink、record_view、voice、desktop_render 真 Chrome）。[事實] A5 審計（10-05）實測 run.sh ≈ 50.8 秒、desktop_render ≈ 26–30 秒，兩個加埋 ≈ 80 秒係主要成本。簡報講 200 秒，[猜測] 差距可能喺真 Chrome 多寬度 render 同無縫滑輪 32 張卡，我冇親手完整計時（gate_times.txt 只有頭 4 個 = 0.0s）。

邊個可壓：

- **合併**：gate_refs + gate_design 都係毫秒級靜態，可合成一個 `gate_static.py`，慳嘅係 shell 開銷（好少，[猜測] <1 秒）。
- **相關才跑**：[事實] `question_audit`（題庫 109 條）只喺改 data.js／題目時需要；改排版跑佢係浪費。`voice_test`、`record_view_test` 同理。**做法＝按 `git diff --name-only` 判斷有冇掂相關檔，掂咗先跑。**
- **真 Chrome desktop_render（~30s）**：只喺改 index.html 排版／桌面層時需要。改純文字（pair-data.js）理論上唔需要。

**但——保證唔降低保護力，呢點要講清：**

[事實] 呢個 repo 已經實證過「可選腳本 = 永遠冇人跑」（A5 審計：desktop_render／mobile_zero 兩支喺 2026-09-28 之後從未更新，閘綠同時兩支紅，直到 10-05 審計先發現）。所以「分層觸發」一定要 fail-closed：

1. 靜態閘 + jsdom run.sh + 真 Chrome 幾何，**呢三類任何情況都跑**（唔分層）。
2. 「相關才跑」只套用喺 `question_audit`／`voice`／`record_view`（佢哋快，且「skip 錯」最多係漏捉一題題庫問題，唔會令 app 版面壞）。
3. 慢閘（mobile_zero_impact 像素）保持手動，但加「上次綠時間戳 + 超 14 日拒出貨」（Grok A5 第 5.3 節已提議）。

**結論：[推論] 實際可壓空間 ≈ 20–40 秒（把 question_audit/voice/record_view 改成相關才跑），主要 80 秒（jsdom + 真 Chrome）唔可以壓，否則就係拆保護。**「一擊即中」慳嘅時間唔喺閘，喺「改嗰刻做對，唔使返工」。

---

## 3. 最小工具清單（不可省）

[事實] 逐個工具 → 防止邊種錯：

| 工具 | 防邊種錯 | 唔用會點 |
|---|---|---|
| **terminal（git）** | 靠記憶改、改錯 commit | 唔知現況，亂改 |
| **search_files（grep）** | 同名定義兩次靜靜覆蓋（紀律 6） | 今日撞板 1、2 嘅根因 |
| **ship.sh（出貨閘）** | 壞嘢上 live | 無保護直接 push |
| **真 Chrome + vision_analyze（睇圖）** | 「數字啱但視覺錯」 | 今日黑夜弱項欄、金標對比兩個 bug 就係數字睇唔出 |
| **node --check／preflight** | 剪爛 inline script、emoji 殘留 | 語法錯直接上 live |
| **clarify（問 Roy）** | 改錯位返工 | 一擊不中嘅主因 |

[事實] 可以省嘅：web_search／web_extract（做 app 幾乎唔用）、delegate_task（僅審計／大任務）、cronjob、process_manage（輔助）。呢啲唔會影響「做 app 啱唔啱」。

**最重要一句：[事實] 今日 Roy 親自捉到嘅最大缺失係「有 vision 工具、skill 都寫明做法，但代理唔用，仲同 Roy 講『我冇眼』」。所以最小清單一定要有 vision_analyze，而且要寫入鐵律（見第 6 節）。**

---

## 4. 「一擊即中」嘅障礙（3 個撞板共通根因）

[事實] 3 個撞板：
1. mb-4 無效（Tailwind `space-y-3` 特異度 (0,3,0) 覆蓋 `.mb-4` (0,1,0)）
2. font-weight:800 撞全站禁令（只准 400/600/700/900）
3. 由 175,730 字 inline script 中間 slice 一段搬位，剪爛

[事實] 共通根因：**三個都係「改嗰刻冇查清，就落手」。** 撞板 1 同 2 嘅教訓**已經寫咗喺 roy-standing-record**（「加 CSS 覆蓋前先 grep 同名 selector」「改間距前先睇父元素有冇 space-y/gap」「font-weight 全站禁令」），但改嗰刻冇拎返相關嗰段執行。撞板 3 係大檔手術手法粗糙（無備份、無 diff --stat 檢查）。

[推論] 更深層：**SKILL 124k 字 + 單一 index.html 367KB**，令「讀得齊」同「改得準」兩件事都變難。教訓散落喺巨量文字，改嗰刻揀讀範圍揀唔中。

開工前可執行嘅預防（要具體，唔係口號）：

1. **改任何 CSS 屬性前，先跑一條 grep**：`search_files "<要改嘅 selector 名>|space-y|font-weight:800" index.html`，睇晒所有定義位置＋父元素 class。5 秒，直接擋撞板 1、2。
2. **改視覺 = 改完即刻 vision_analyze 睇 screenshot**，加斷言前先肉眼確認「真係變咗、變啱方向」。擋「數字啱視覺錯」。
3. **搬 slice 大檔前，先 `cp index.html index.html.bak`（或 git stash）**，改完 `git diff --stat`，刪咗 >50 行就停手查（撞板 3 係刪咗成段）。
4. **每次改動加一條會 fail 嘅守門斷言**（今日已做，保持——4 個 commit 每個都加咗真 Chrome 斷言，呢個係對嘅方向）。
5. 開工頭 1 分鐘，**只讀同今次改動相關嗰段 skill**（唔係全份），改 CSS 就讀「美學 + typography」，改題就讀「question-bank-audit」。

---

## 5. 邊啲位「先問 Roy 再郁」（界線）

[事實] Roy 已多次明示（roy-standing-record + USER.md）：「未講清範圍就動手佢會問你知唔知自己執緊咩」「改互動前要講清楚會失去咩視覺狀態」「報 UI 只傳截圖 → 當係圖中嗰個位，用像素量度，唔好反問係邊度」。

界線一句話：**客觀對錯（bug／錯字／守門）直接做；主觀取捨（靚唔靚／結構／紅線）先問。**

- **唔使問，直接做**：修 bug（有截圖或明確描述，像素量度定位後直接修）、純文字修正、加守門測試、佢已拍板過嘅嘢。
- **要問，先郁**：
  - 美學判斷（靚唔靚／順唔順眼）→ 佢明講「唔好自己判斷」，列 2–3 個方案。
  - 資訊架構（增刪入口／分頁／導航結構）→ 列「刪咗之後路徑仲喺唔喺度＋會唔會失去某種用法」。
  - 免費／收費紅線、CTA、brand 字眼。
  - 「大執」類指令、範圍模糊 → 先列結構等佢一項一項。

[事實] 具體例子：
- **問**：「相處／拍拖牌匾要唔要跟章節卡一樣改成圓角卡？」（主觀，會失去滿版風格）
- **唔問**：「黑夜模式弱項欄冇底色」（客觀 bug，真 Chrome 量度差 0.0003，直接修）

「一擊即中」正正係：**該問嘅唔問 = 改錯返工；唔該問嘅問咗 = 慢。** 界線喺「客觀 vs 主觀」。

---

## 6. 8 條紀律評審（逐條）

| 條 | 評 | 建議 |
|---|---|---|
| 1 先重現後修 | 核心，冇冗餘 | 保留。補一句：視覺 bug 嘅 RED = 加一條量度該位嘅真 Chrome 斷言，先見佢 fail |
| 2 出貨閘全綠先 push | 已寫入程式碼，冇冗餘 | 保留（同 8 分工：2 係「閘」、8 係「犯錯後加新閘」） |
| 3 唔硬編碼會變清單 | 同 4 高度重疊 | **同 4 合併**：「一切會變嘅值由資料動態計，唔准寫死；寫死就加守門令佢變時即刻紅」 |
| 4 先驗證自己假設 | 同 3 重疊 | 併入 3 |
| 5 排除法一次過 | 同「思維框架第 3 步·分化」重複 | **刪紀律 5**（框架已覆蓋「分辨性實驗」） |
| 6 改嘢前先 grep | 核心（撞板 1、2 根因） | 保留 + **強化**：明確「改 CSS 前 grep 父元素 + 同名 selector + 屬性禁令」 |
| 7 一次一項可回滾 | 獨立，好 | 保留 |
| 8 自己錯過嘅即刻變守門 | 最重要（防復發） | 保留 |

**缺失（最重要）：冇一條講「用眼睇」。**[事實] 今日 Roy 親自捉到嘅最大問題就係代理唔用 vision_analyze、同佢講「我冇眼」。應該加第 9 條：

> **紀律 9 — 改視覺必須親眼睇（vision_analyze 睇真 Chrome screenshot），唔准只睇數字。數字啱唔等於視覺啱。**

**結論：[推論] 8 條壓成 6 條（3+4 合併、5 刪）＋ 加 1 條（用眼睇）= 7 條。** 冇一條係「錯」，但 3/4、5 係冗餘，而真正缺嘅「用眼睇」反而冇。

---

## 7. 報告格式（五行夠唔夠）

[事實] 現行五行：①改咗咩 ②commit ③live ④測試 ⑤等 confirm。

**問題：冇「我親眼睇咗咩」**——而呢個正係 Roy 要嘅（佢要你睇圖，唔係淨數字）。

建議改 6 行（更聚焦，唔係更長）：

1. 改咗咩（一句）
2. 我親眼睇咗／量度咗咩（附 1 個關鍵數字，或一句「已睇圖確認」）
3. commit `hash`
4. live 同步咗未（md5 一致）
5. 測試 N 套閘全綠
6. 請你 confirm 咩（可選：閂 app 再開）

[推論] 「快速穩定」同「畀足憑證」平衡點：**憑證要「短而硬」（一個 md5、一個對比數字、一句「已睇圖」），唔係「多」。** 長 = 慢，但硬 = 穩。五行個骨架啱，只差「用眼」一行。

---

## 8. 風險警告（邊步絕對唔可以為快刪）

[事實] 壓縮會引入嘅新風險＋邊步死都唔可以刪：

**絕對唔可以刪（刪咗 = 壞嘢上 live 或假陽性）：**
1. **ship.sh 全套閘**，尤其 preflight emoji 禁令（曾連走漏 4 次先改硬失敗）、run.sh jsdom、真 Chrome 幾何。
2. **live md5 poll**：[事實] roy-standing-record 明寫 GitHub Pages build 有時 5–10 分鐘，縮短 poll = 假陰性（live 仲係舊版但當同步）。
3. **vision 睇圖**：數字睇唔出嘅 bug（今日 2 個）冇眼就漏。
4. **守門測試**：每改動加斷言，係「防復發」嘅唯一機制。
5. **先問後郁**：主觀／紅線／結構改動唔問 = 返工。

**可以壓（風險低）：**
- 讀 skill 揀讀範圍（唔讀全 124k）。
- 手動語法檢查 → 併入 ship.sh（功能保留、去手動）。
- 手動真 Chrome 探針 → 併入「加斷言 + ship.sh」一步。
- question_audit／voice／record_view → 相關才跑（但 skip 邏輯要 fail-closed）。

**新風險（壓縮引入）：**「相關才跑」嘅判斷邏輯若錯，應跑嘅閘被 skip → 漏捉。解法：skip 唔確定就當要跑（fail-closed），且只套用喺快閘，唔套用喺 jsdom／真 Chrome。

---

## 9. 畀 Roy 嘅一句總結

[事實] 你唔使等 200 秒閘慢慢兜先「一擊即中」——你嘅問題唔係閘唔夠，係**改嗰刻冇查清就落手、改完冇用眼睇**。三件事：改之前 grep 清楚、改嗰刻用 vision 睇圖、改完加一條守門。呢三件喺「改」嘅階段做啱，就唔使「做錯再自己救自己」。
