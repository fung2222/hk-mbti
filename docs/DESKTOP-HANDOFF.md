# 桌面版首頁 — 交接文件（Handoff for incoming AI/dev）

> 寫於 2026-09-28 · HEAD `84b4d4e` · VERSION `2.0.0` · branch `main`
> 目的：接手嘅人可以喺 GitHub 睇完呢份文件，就明白**要做咩、唔可以碰咩、點驗證**。

---

## 0 · 一句話現況

桌面版（Windows ~1920px）主頁**改過 5–6 輪都未滿意**，用戶（Roy）回報「**排版錯位、排序錯亂、唔靚**」。
本文件作者嘅環境**冇瀏覽器／冇 headless browser** ✗ → 全部改動只可以靠靜態分析 + 測試 + 用戶回報，**從來冇親眼睇過 render** ← 呢個就係做唔好嘅最大原因。
**接手嘅如果可以用瀏覽器開 live 睇（1920 / 1440 / 1024 / 768 / 390px 五個寬度），會比之前所有人有優勢。**

Live：<https://fung2222.github.io/hk-mbti/>

---

## 1 · 目標同美學標準（Roy）

- **「app 感」，唔係「文件感／功課紙」** ← 佢嘅原話係「似小學生／中學生功課」
- 對標：16Personalities、Persolabs 等國際 app 嘅 minimalist 風
- 具體：**少卡框、少金標、大字、留空、視覺主角**
- **唔准加 emoji** ✗（全站 2026-09 已清；只保留 `▼ ▲ → ✓ ✗` 呢類符號）
- 字型：iPhone PingFang HK／Android Noto Sans HK；分享卡 canvas 字唔跟 webfont
- 唔准將 app 名改成淨「16型人格測試」

---

## 2 · 鐵律（犯咗就整壞手機版，唔可以犯）

1. **手機版任何情況都唔可以受影響** ✗
   所有桌面規則必須**同時**符合：① 包喺 `@media (min-width:…)` ② selector 帶 `html.dt`。
   `html.dt` 由 `<head>` 一段 gate script 加（按實體螢幕 + 視窗闊度判斷；真電腦／平板才有）。
   **唯一例外**（可喺 media query 以外）：`#dtNav,#dtHeroCta{display:none}` —— 因為呢兩個係新增元素，預設隱藏，手機完全唔會見到。
2. **永久禁止：無條件 zoom / `.dm` 補償** ✗
   曾經加過「手機 Chrome 開『桌面版網站』時 zoom 還原」，結果手機排版回歸（16 型卡滑輪貼住大標題、底部多空間）→ 緊急拆走（commit `9e3f562`）。
   現時 `.dm` 只在**極窄條件**（實體螢幕細 **且** 虛擬視窗遠闊過實體）下還原 3 條 viewport 單位，改動前必須保留窄條件。
3. **永久禁止：用 `calc(50% - 50vw)` 做全闊色帶** ✗
   有 scrollbar 時會偏 ~8px（呢個就係之前「錯位」嘅根因之一）。
   正做法：`margin-inline: calc(50% - 50vw + var(--sbw,0px)/2)`，`--sbw` 由 gate script 寫入（`innerWidth - documentElement.clientWidth`）。
4. **改之前先 audit 舊 commit**：呢個 app 有好多「commit 之後 silent fail」紀錄（例如 `show()` whitelist 漏加就靜靜哋兩個分頁疊埋）。
5. **唔准 send file / screenshot / 開 local server** ✗（用戶禁令）；亦唔可以叫人自己開 dev server。
6. **未得 Roy confirm 唔准 tag／唔准做 backup**。
7. 改完必須跑齊測試（見 §6）＋ push 前做 §6 嘅「手機零影響」diff 驗證。

---

## 3 · 現況：檔案同位置

| 位置 | 內容 |
|---|---|
| `index.html`（5,624 行）| 主 SPA。桌面排版全部集中喺一段獨立 CSS |
| `index.html` line **549** | `<style id="desktop-layer">…</style>` ← **桌面排版全部喺呢度**（~100 行）|
| `index.html` line **648** | `<head>` gate script（加 `html.dt`／手機「桌面版網站」還原 `.dm`／寫入 `--sbw`）|
| `index.html` line **707** | `<nav id="dtNav">` 桌面專用頂部導覽（預設 `display:none`）|
| `index.html` line **1567** | `<div id="dtHeroCta">` hero 兩粒 CTA（預設 `display:none`）|
| `record.html` / `stats.html` / `tee.html` / `privacy.html` | **只有同一段 gate script**，冇桌面層 |
| `tools/desktop_layout_test.js` | 桌面層結構測試（41 項）|
| `tools/desktop_gate_test.js` | gate 開關測試（34 項，14 情境）|
| `tools/preflight.py` | 上線前檢查（20 項）|
| `demo/desktop-v2.html` | 3 個設計方向**對照頁** |
| `demo/desktop-v2-1/2/3.html` | 三個方向嘅 mock（真資料、`noindex`、唔影響真站）|
| `demo/desktop-full.html` | **真身示範**：由 `index.html` 生成（已停 SW、去掉分析 script、加 `<base>`），開佢＝睇真桌面版 |
| `docs/v2.0-release-pack.md` | v2.0.0 對外資訊 SSOT |

---

## 4 · 桌面層而家做緊咩（現行實作 = 「① 大站導覽型」）

只喺 `html.dt` + `≥1024px`（768–1023px 係平板版）生效：

1. **頂部 sticky 導覽** `#dtNav`：品牌 + 16型人格／性格光譜／相處攻略／香港統計／我的紀錄 + 金色「開始測試」
2. **Hero 兩欄**：左＝大字 MBTI（`clamp(60px,7vw,112px)`）+ 文案 + 兩粒 CTA；右＝**16 型 4×4 正方色格**
   - 做法：`#home{display:grid}` + `.home-hero{display:contents}` → hero 子女直接變 grid item；隱藏原本 logo 列（導覽代替）
3. **版本卡**：≥1024px 兩欄、≥1280px 四欄（實際有 4 張：生活版／進階版／BB 版／我的記錄）
4. **場景帶**：全闊 `var(--soft)` 底色、4 欄白卡（用 §2.3 嘅 `--sbw` 修 scrollbar 偏差）
5. **探索更多**：2 欄、**唔摺疊**（8 格全開）、冇髮線、標題唔可撳（手機保留風琴，JS 未改）
6. **非主頁各版**：保持 640px 窄欄

### 用戶回報嘅問題（未修）
- 桌面（Windows ~1920px）**排序錯亂、排版錯位、唔靚** ✗
- 未有具體描述／截圖；接手者請**先開 live + `demo/desktop-full.html` 用 1920×1080 睇**，再對比 1440／1024 睇邊個斷點出事

---

## 5 · 做過咩（版本史，全部已 push 到 main）

| Commit | 做咗咩 | 結果 |
|---|---|---|
| `70313a0` | 主頁電腦／平板排版：外框放寬 + 多欄 | 第 1 版 |
| `58a996c` `e1092d6` | 修「手機開『桌面版網站』被誤判」 | 引入補償機制 |
| `27b3317` `4e688a2` `0f88b04` | 桌面／平板示範頁 + 對照台 | 工具 |
| `a7a3191` | 桌面改「砌積木 B 方案」+ 上限 1440px | 第 2 版 |
| `aa1f90a` `41b67ed` | 美化 + 修「探索更多展開時其他欄跳位」→ 改 app 風 2 欄 | 第 3 版 |
| `9e3f562` | **緊急修復**：拆走手機桌面模式補償（改壞咗手機排版）| — |
| `55eaae8` | 手機「桌面版網站」精準還原（`.dm` 窄條件）| — |
| `b5eae42` | `.dm` 高度改用 `visualViewport` 換算 + 夾層 | — |
| `a0f8dbc` | 出 3 個全新方向 mock（① 大站導覽／② 雜誌／③ Bento）| 用戶揀 ① |
| `a9369c2` | 桌面首頁改 **① 大站導覽型**（現行）| 用戶回報仍未滿意 |
| `84b4d4e` | 整理註解 + 重建示範頁 | 現況 |

### 踩過嘅坑（唔好再踩）
- **風琴展開時其他欄一齊郁**：3–4 欄 CSS grid 每行共用行高 + JS 只准開一個 → 桌面索性**唔摺疊、8 格全開**
- **「探索更多」似文件表格** ✗：密集小字 + 髮線 → 改 2 欄、刪髮線、加大行距
- **全闊色帶偏 8px**：`calc(50% - 50vw)` + scrollbar → 改 `--sbw` 修正
- **手機排版回歸**：無條件 zoom + `.dm` → 已拆；重加時條件要極窄（見 §2.2）
- **`--dm-vh` 誤差 ~110px**：曾用 `screen.height`（含瀏覽器工具列），應該用 `visualViewport.height ÷ zoom`

---

## 6 · 點驗證（冇瀏覽器都可以做）

```bash
cd <repo>
export NODE_PATH=<jsdom node_modules 路徑>   # 原環境：/opt/data/profiles/apps/cache/scratch/harness/node_modules

node tools/desktop_layout_test.js   # 41 項：桌面層結構 + DOM 假設 + 開關
node tools/desktop_gate_test.js     # 34 項：14 個情境（真電腦／平板／手機／手機桌面模式）
python3 tools/preflight.py          # 20 項：上線前檢查
node tools/deeplink_test.js         # 深層連結
node tools/record_view_test.js      # 紀錄頁
node tools/voice_test.js            # 語音（10 項）
```

**「手機零影響」證明法**（每次改完必做）：
1. 由 `index.html` 剝走 `<style id="desktop-layer">`、gate script、`<nav id="dtNav">`、`<div id="dtHeroCta">`
2. 同 `git show v2.0.0:index.html` 做 diff
3. 預期：**除咗空白行同我自己嘅 HTML 註解，零實質差異** ✓

**如果有瀏覽器（強烈建議）**：開 live + `demo/desktop-full.html`，用 **1920 / 1440 / 1024 / 768 / 390px** 五個寬度截圖對比，先寫低「邊個 breakpoint 邊個元素錯位」，再改。

---

## 7 · 結構假設（改 DOM 就會壞，測試有守）

- `#home > .home-hero`，而且 `.home-hero` **第一個子女係 logo 列**（桌面隱藏，因為導覽代替）
- `#homeTypeReelWrap` 喺 `.home-hero` **內**（桌面要放右欄）
- `#home > #homeBelow`（版本卡）、`#home > .scenes-bleed`（場景帶）、`#home > div.mb-4 > #homeAccordion`（探索更多）、`#home > .home-more-up-wrap`
- 16 型跑馬燈有 **32 張卡**（前 16 真、後 16 重複）；桌面靠 `:nth-child(n+17){display:none}` 只顯示 16 張
- 手機摺疊 JS `toggleHomeAcc` **必須保留**（測試有守）

---

## 8 · 唔准做嘅事（Roy 已決定）

- ❌ 唔好再郁**手機版**任何排版
- ❌ 唔好加 emoji、唔好返「白卡堆疊 + 金標」功課紙風
- ❌ 唔好改 app 名做淨「16型人格測試」
- ❌ 唔好加返廣告（廣告決定：先上架、後加；詳見 `hk-mbti-play-store-launch` skill）
- ❌ 唔好 send 檔案／截圖畀用戶做交付
- ❌ 未經 confirm 唔好 tag／backup

---

## 9 · 設計方向（如需重做）

`demo/desktop-v2.html` 係對照頁，三個方向：
1. **大站導覽型**（現行）：頂部導覽 + 大字 hero + 16 型 4×4 + 版本卡 + 全闊場景帶 + 探索 2 欄
2. **雜誌式左重右輕**：冇導覽，超大字（最大 150px）+ 右邊迷你 4×4，下面雙欄
3. **Bento 儀表板**：磚塊式（hero 磚 + 16 型磚 + 版本磚 + 場景磚 + CTA 磚）

用戶當初揀 ①。如果 ① 做唔靚，可以考慮 ②／③ 或重新設計（用戶講過「拋開固有思維」）。

---

## 10 · 流程（同 Roy 合作方式）

- 佢喺 **live** 睇（Windows，~1920px），睇完口頭／截圖回報
- **一次改一版**，唔好一次過大執（未講清範圍就唔好郁）
- 佢好重視「唔好亂改」：**commit 之後 silent fail 係最大風險**，改任何嘢之前先 audit 舊 commit 為何 work
- 回報格式：改咗咩檔、commit、live 有冇更新、仲要佢 confirm 咩
