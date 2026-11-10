# 港式 MBTI v2.1.0 · 學生／在職情境分流及 AI 交接文件

日期：2026-11-10
適用對象：下一位接手開發嘅 AI／開發者
狀態：**已於 2026-11-10 部署。程式 commit 為 `98b052731346f5db2f544381f679e6e48303820a`；live 版本、內容雜湊、身份步驟 DOM、學生版題目及新音檔已核實，詳見下方部署後驗收。**

## 部署後驗收記錄

- GitHub `main` 已核實為 `98b052731346f5db2f544381f679e6e48303820a`（push：`2170475..98b0527`）。
- 推送前重跑出貨閘 11/11 全綠（`SHIP_DRY=1 sh tools/ship.sh x`）。
- GitHub Pages 已生效：live `index.html` 同 commit blob **逐 byte 一致**（415,729 bytes，cmp IDENTICAL）。
- live `VERSION` = `2.1.0`；`manifest.json` version = `2.1.0`；`sw.js` cache = `hk-mbti-v2.1.0`。
- 390×844 live DOM 實測：wizard 第 4 步顯示「第 4 步 · 共 5 步」，身份掣齊 4 個（student／worker／both／skip）；揀 student 後 `buildDeck` 出學生版題（實測「報學會／比賽要交個人介紹，你會點整理經歷？」）。
- live 新音檔 `audio/q/5f3487c52a1c.mp3` HTTP 200。
- 上述 live 檢查冇 JavaScript page error，冇橫向溢出。
- 注意：驗證期間 sandbox→GitHub Pages 網絡不穩（curl 間中截斷／超時），以上結果已係重試後確認；如見類似情況重試即可。
- Android App 實機重開、舊進度、離線及分享卡仍應由 owner 再確認；唔將瀏覽器驗收當成實機驗收。
- Play Console 未更新；今次冇提交新 AAB（TWA 內容更新）。

## 0. 今次用戶問題同設計決定

Roy 回饋：題目對學生唔太友好——不少情境預設咗「在職」身份（開會、OT、出差、同老細加價），學生難代入。v2.0.x 嘅記錄已將「學生／在職分流」列為未完成項，今次實作。

採用嘅處理：

- **測試前（wizard 第 4 步，共 5 步）新增可選身份**：學生／在職／兩者都係／略過。唔揀（略過／兩者）＝完全用預設題目，同 v2.0.2 一字不差。
- **只改文字，唔改計分**：`Q_CONTEXT` 每個情境只提供 `t`（題目字）同 `o`（選項字 by 原始 label），分數向量繼承原題。計分 sig 用 deck 文字，學生版 run 嘅 tie-break 可能同預設版唔同，但只影響極端平手，可接受（冇改 sig 算法，保持歷史紀錄一致）。
- **變體喺 `buildDeck` 時解析**，之後整套流程（顯示、朗讀、進度、結果）只認 deck 文字。deck 快照本來就存落 `hkmbti_test_progress`，所以：
  - **舊進度零遷移**：v2.0.2 進度照樣讀到，格式一個欄位都冇加（有測試守）。
  - 續做一定用返當初抽好嘅變體文字，唔會中途變情境。
- **身份揀選會存入 `hkmbti_profile`**（同 name/nickname/gender 一齊），下次入 wizard 自動還原。
- **14 條題目有學生版**（開會→分組討論、新同事→插班生、投 CV→報學會個人介紹、AI 工具→學校推、揀工→揀 elective、打工→通宵趕 project、開會揀方案→分組 project、同事踩你→同學講你唔好、出差→出外地比賽／交流、表現→老師讚、朋友成功→公開試成績、談判加價→同老師爭取延期，另加港鐵／早起兩條返學版）；**2 條（港鐵／早起）另有在職版**「返工」字樣。其餘 95 條本來就雙兼容或中性，唔使改。
- 語音：26 條新文字全部經 `tools/gen_voice.py`（edge-tts `zh-HK-HiuGaaiNeural` `+15%`）生成並入 `voice-data.js`，缺檔會 fallback `speechSynthesis`（有測試守次序同 fallback）。

## 1. 修改位置

| 檔案 | 修改 |
|---|---|
| `index.html` | 新增 `window.Q_CONTEXT`（頂層，Q_ALTS 之後；**唔可以放喺 buildDeck 入面**，否則首次 buildDeck 前拎唔到）；`buildDeck` 喺 Q_ALTS 之後、選項打亂之前按 `state.qContext` 套情境文字；wizard 加第 4 步（`wizStep4` 身份情境，舊第 4 步變第 5 步 `wizStep5`）；`wizGo` loop 1–5；`pickContext`／`renderContext`；`openProfile` 還原 `qContext`；`wizStart` 寫入 profile；`.ctx-btn` 樣式（淺色＋`html.dk` dark layer 覆蓋，字重只准 700/400）；版本 chrome → v2.1。 |
| `VERSION` | `2.1.0`。 |
| `manifest.json`、`sw.js` | 經 `bash tools/sync-version.sh` 同步；SW cache `hk-mbti-v2.1.0`。 |
| `voice-data.js`、`audio/q/*`、`audio/o/*` | 新增 26 條文字對應（20 個新 mp3，6 條同既有音檔 dedupe）。 |
| `tools/extract_bank.js` | 額外抽出 `Q_CONTEXT`。 |
| `tools/gen_voice.py` | `collect_items` 收錄情境變體文字（題目＋選項）。 |
| `tools/voice_test.js` | 覆蓋率檢查加 Q_CONTEXT（題目＋選項）。 |
| `tools/question_audit.js` | 新增 Q_CONTEXT 審計：key 必須對應真題目、情境名只准 student/worker、題目字要有「？」＋唔准同正題/alt 一字不差＋長度 8–34、選項 label 只准 A–D＋唔准同原選項撞字、跨情境文字唔准重複。 |
| `tools/ui/context_flow_test.js` | 新增 20 項回歸（buildDeck 實路徑：student/worker/both/skip/未揀、向量不變、進度 roundtrip、舊格式相容、profile 還原同寫入）。 |
| `tools/ui/wizard_test.js` | 更新做 5 步（原寫死 4 步）；新增身份步驟斷言（4 掣、著燈、aria-pressed、min-height≥44px、唔揀唔彈提示直跳）。 |
| `tools/ui/premium_test.js`、`tools/ui/tailwind_static_test.js` | 版本 pin 更新至 2.1.0。 |
| `README.md`、`docs/DESKTOP-HANDOFF.md` | 版本同接手文件指向 v2.1.0。 |
| `store-listing/*` | changelog／whats-new／full-desc 建議稿推進至 v2.1.0；**未提交 Play Console**。 |

## 2. 驗證記錄（本機，推送前）

- `SHIP_DRY=1 sh tools/ship.sh x`：**11/11 綠**（快閘 7 項＋慢閘 4 項，含真 Chromium 幾何 `desktop_render_test`）。註：`run.sh` 喺並行負載下間中跌（`back_nav_test` 嘅計時敏感斷言），獨立跑 3 次全綠屬已知環境噪音，同今次修改無關；v2.0.2 都有同樣記錄。
- UI 全套 29 檔 1134 斷言全綠（含新 `context_flow_test.js` 20 項、`wizard_test.js` 22 項）。
- `node tools/voice_test.js`：12 項全過（793 音檔齊、含 26 條情境文字）。
- `node tools/question_audit.js`：109 題結構／計分／文法零硬錯；Q_CONTEXT 14 keys 16 題目字無孤兒無撞字。
- Playwright 真 Chromium 390×844 截圖核實：身份步驟（淺色／深色＋已揀學生）、學生版「揀 elective」題目版面正常、無 page error（file:// 下預載音檔 fetch 失敗屬預期，同 live 無關）。

## 3. 點樣繼續（最常見任務）

- **加新情境題**：改 `window.Q_CONTEXT`（key 用 `q.k || q.d`）→ `node tools/extract_bank.js > /dev/null` 無喇叭報錯 → `python3 tools/gen_voice.py --voice zh-HK-HiuGaaiNeural --rate +15%`（要 network + edge-tts）→ 跑 `node tools/voice_test.js` 同 `node tools/question_audit.js`。
- **改身份步驟 UX**：wizard 步驟 HTML 喺 `index.html`（搜 `wizStep4`）；步數寫死喺 `wizGo`（1–5）、`profileStep` 文案、dots（5 粒）、`wizSkip` 跳去 `wizGo(5)`——四處要一齊改。
- **版本 bump**：改 `VERSION` 跑 `bash tools/sync-version.sh`，再改 `tools/ui/premium_test.js` 同 `tools/ui/tailwind_static_test.js` 嘅版本 pin。
- **出貨**：`SHIP_DRY=1 sh tools/ship.sh x` 先乾跑，全綠先好 commit。

## 4. 未完成／下一步建議

- **推送＋部署後驗收**（最高優先）：push 後等 GitHub Pages 生效，核實 live `VERSION`=2.1.0、`sw.js` cache 名、live DOM（wizard 第 4 步 4 掣、身份揀學生後出學生版題目）。跟 v2.0.2 做法喺本文件補「部署後驗收記錄」一節。
- Android 實機重開、舊進度續做、離線、分享卡，由 Roy 實機確認；瀏覽器驗收唔當實機驗收。
- Play Console：store-listing v2.1.0 建議稿等 Roy 核對；內容更新唔使出新 AAB（TWA 包網頁內容）。
- 心理測量驗證（cronbach alpha、重測信度）仍然未做；分流後可按身份分群睇信度。
- TalkBack／字體／鍵盤實機驗收、截圖＋Data safety 更新，照舊喺 backlog。

## 5. 同舊版嘅相容性承諾

- 進度／紀錄／entitlement 全部本地格式不變；v2.0.2 進度照讀（有測試）。
- 唔揀身份（略過／兩者／舊玩家）見到嘅文字同 v2.0.2 完全一致（有測試逐條 Q_CONTEXT 題目驗證）。
- 計分向量、題數、結果頁格式不變；`calcScore` sig 算法冇郁。

前版文件：`docs/AI-HANDOFF-v2.0.2.md`（首頁標題修正＋部署驗收）、`docs/AI-HANDOFF-v2.0.1.md`。
