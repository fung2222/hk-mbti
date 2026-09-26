# HK MBTI — freeze log

每個 freeze 追加一段（10 行內）。目的：一個月後返嚟一分鐘睇晒發生咩事、要 rollback 知邊個 tag 對邊個 backup、寫 Play 商店更新說明有現成材料。

**呢份 log 取代舊制嘅 `PROJECT-REPORT-vX.md`**（2026-09-26 Roy 決定：唔再寫 2–4 頁大報告）。舊報告留低做歷史：v1.5、v1.6、v1.7。技術細節（題庫規則、QA 流程、字體、踩過嘅坑）睇 skill `hk-mbti-webapp`。

格式：`日期 ｜ tag（commit）｜ backup ｜ 版本 surface ｜ 改咗咩 ｜ 未做／注意`

---

## v2.0.0 · 2026-09-26（正式推出）
- **tag**：`v2.0.0`（`31b7166`，annotated，已 push）｜**backup**：`/opt/data/backups/hk-mbti-v2.0.0-freeze-20260926-135002.tar.gz`（16MB、594 項）+ `.meta.txt`
- **版本**：`VERSION` 2.0.0｜`manifest.json` 2.0.0｜`sw.js` CACHE `hk-mbti-v2.0.0`｜UI badge「版本 v2.0」（＋privacy／tee footer v2.0）
- **改咗**（v1.9.0 → v2.0.0）：
  - 題庫最後執漏：六項審計全綠；111×2 條變體逐條讀，修好「變體問朋友 post 旅行、但選項問有冇安全感」類錯配（規矩：變體＝同主問同一件事，唔可換情境／對象／動作）
  - 結果頁每軸**真實百分比**（5 行、由 50% 中線向贏邊延伸、長度＝兩邊差距一半、加埋一定 100%）＋「計分方法同限制」入口
  - 新頁「計分方法同限制」：5 條軸、點計分、點出題、做過嘅檢查、限制、私隱（7 段，實測 685 字）
  - 分享卡：T/A chip、字體同 app 統一（HK 字 stack、去假斜體）、spacing 重排（你是↔大字 55px、名字↔你是 94px）
  - 底部 CTA：8 個「探索更多」分頁統一 softbox；7 個掣改 `goPickVersion()`（一撳捲到版本卡 y=862）
  - 全站字體統一：字級 30→9 級、字重 6→4、行高 11→5（四個大字 Archivo Black 冇動）
  - GoatCounter 私人訪客統計（5 頁）＋私隱聲明新增第 5 節「瀏覽統計」；移除 `font-test.html`
- **未做／注意**：Play 正式版未申請（12 testers × 14 日未完）｜Play Console 資料安全表要加「App 活動：頁面瀏覽」｜舊定義「v2.0＝題目逐條核對」未做（六項審計已全綠，要做留 v2.1）

## v1.9.0 · 2026-09-26
- **tag**：`v1.9.0`（`d599b20`，annotated，已 push）
- **backup**：`/opt/data/backups/hk-mbti-v1.9.0-freeze-20260926-103718.tar.gz`（7.1MB、97 項）+ `.meta.txt`
- **版本**：`VERSION` 1.9.0｜`manifest.json` 1.9.0｜`sw.js` CACHE `hk-mbti-v1.9.0`｜UI badge「版本 v1.9」
- **改咗**：
  - 題庫準確度：112 題全部 2:2 選項、選項分數上限 2 分、逐軸平衡抽題（`drawBalanced`）、tie 次序 分數→頻密度→亂數
  - 字眼三批：15 個「寫得似唔好」嘅選項中性化（社會讚許偏差 I 10→0、P 9→3、N 4→2）、16 個書面英文字換自然廣東話、11 條超長選項收短（最長 30→24 字）
  - T/A 第 5 軸開始顯示：結果頁 badge（`#taBadge` + `#taNote`）、性格光譜頁第 5 段解說
  - 「上次未完成」續做卡返主頁即時顯示（唔使 reload）
  - 承接 v1.7.14 之後嘅 UI：16 型色卡同主頁 MBTI wordmark → Archivo Black；「立即睇睇其他攻略」改一行 3 粒掣、方塊 271→118px
- **未做**：`font-test.html` 未刪（等 Roy 話事）｜Play 商店正式版未申請（等 12 testers 連續 14 日）

## v1.7.14 · 2026-09-17（homepage polish freeze）
- **tag**：`v1.7.14`（`afd56c6`）
- **backup**：`/opt/data/backups/hk-mbti-v1.7.14-freeze-20260917-005106.tar.gz`（7.1MB）+ `.meta.txt`
- **版本**：`VERSION` 1.7.14（UI badge 一直係「版本 v1.7」）
- **改咗**：首頁 UI 打磨；record／tee 頁 footer 更新到 v1.7
- **注意**：Play 商店 listing 唔屬呢個 freeze

## （v1.7.14 → v1.9.0 之間冇 freeze）
呢段時間（9 月 17–26 日）做咗好多 UI／字眼改動（icons 585→85KB、分享卡字體、Archivo Black、攻略方塊收窄…）但**冇打 tag、冇寫 log** —— 如果將來覺得需要中間點，補 tag 只可以指返當時嘅 commit。

## v1.7.12 · 2026-08-09
- **tag**：`v1.7.12`（`9d999bf`）
- **改咗**：Play Internal Testing 上線（pkg `com.fung2222.hkmbti`），實機安裝 + Play Protect 乾淨驗證

## v1.7.11 · 2026-08-07
- **tag**：`v1.7.11`（`e15da05`）
- **改咗**：`VERSION`／`manifest`／`sw` CACHE 全線對齊；ad／IAP cycle；HTML network-first SW；iOS button fix

## v1.7.9 · 2026-08-05
- **tag**：`v1.7.9`（`a427b9c`）
- **backup**：`/opt/data/backups/hk-mbti-v1.7.9-freeze-20260805-150427`（+ `.tar.gz`）
- **改咗**：三個頁（index／record／tee）+ 9 個 ad slots + 跨頁 IAP + 16 款 T 恤 mockup

## v1.7.0 · 2026-07-30
- **tag**：`v1.7.0`（`4a5a47c`）
- **改咗**：新 icon + 正名「港式 MBTI」

## 更早
- `v1.6.0`（`709df3d`，2026-07-29）、`v1.5.0`（`44540d3`，2026-07-29）—— 詳情睇 `docs/PROJECT-REPORT-v1.5.md`／`v1.6.md`；v1.7 睇 `docs/PROJECT-REPORT-v1.7.md`
- 舊 backup：`/opt/data/backups/hk-mbti-v1.7.8-20260805-125956`
