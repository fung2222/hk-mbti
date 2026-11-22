# 改動紀錄 · 2026-11（桌面版大修：hero、版本卡、衛星頁、百科 2×2）

> 範圍：2026-11-11 至 2026-11-22，共 13 個 commit（`08899f6` → `af4bd02`）。
> 全部係桌面版（≥1024）同平板（768–1023）工作；**手機版（<768）零改動**，每次出貨都過 `mobile_zero_impact.py` 像素對比。
> 做法同坑嘅權威文件：`docs/DESKTOP-HANDOFF.md`（2026-11-22 v3.1）。

## 2026-11-11 · 版本卡小修（`08899f6`）

- 版本卡副標題、「立即測試」改深色；主推標籤橫向排列；「續做」按鈕統一風格。

## 2026-11-22 · 桌面 hero 重做（`8846954`）

- 首頁 hero 重新執位：MBTI 大字＋**16 型轉盤放大做主角**（卡 168–220px 分級放大、9/16 直角、自動轉、32 張無縫、箭咀 hover 先現身）。
- 組別標籤散開排；新增 ≥1680 闊度斷點。

## 2026-11-22 · 版本卡長開＋探索更多段距（`5f71037`）

- 版本卡詳情**長期顯示**（之前撳開先見，展開時會推鬱下面內容搞到畫面喐）。
- `#versionList` 改 grid stretch 等高；舊規矩「一定要 align-items:start」廢除。
- 「探索更多」上下間距 80/48px，唔再黐邊。
- 紀錄頁／統計頁頂 bar 首次對齊主站（品牌、選單同序、當前頁金線、金 CTA）。

## 2026-11-22 · 香港分佈重疊修正（`cfec840`、`c4cfab5`）

- 平板「香港分佈」Top3 卡改單欄，修真字重疊。
- 桌面「香港分佈」改全闊 3 卡，1024–1920 全部置中；平板維持單欄。
- 出貨閘工具 Windows 兼容（node shell 呼叫、symlink 複製後備）；加 `.gitattributes` 鎖 LF。

## 2026-11-22 · 私隱頁＋寬度分級拉齊（`7209ecc`）

- 私隱頁頂 bar 同紀錄／統計同款；頂 bar 守門加埋私隱頁。
- 三個衛星頁寬度分級拉齊主站（1360@1440、新增 ≥1680）。

## 2026-11-22 · 百科頁 16 型格 2×2（`5fa0619`）

- 百科頁桌面 16 型格放大：`#hubTypeGrid` 改 2×2 組合佈局（每組 4 卡撐滿半闊，唔再淨係佔左半），卡字級跟大。
- 新增 `tools/audit_inner.py` 內頁截圖審計。

## 2026-11-22 · 衛星頁頂 bar 三部曲（`6354905`、`4695a8c`、`b4003a6`）

- **對齊主站**（Roy 修正）：選單貼品牌偏左（flex-start＋CTA margin-left:auto）、頁面 h1/hero-title 全部收埋（唔再同金線重複又唔再褪位）、stats/record 內容拉闊至 `--dt-w`。
- **褪位修正**：逐項對齊主站 `#dtNav` 幾何（gap 16、CTA 10px 18px＋align-self:center、連結 stretch、金下線 bottom:0）；Playwright 量度四頁 1024–1920 完全一致；768–1279 record 收埋分隔線＋清除掣。
- **免費版＋主題掣**：三個衛星頁複製主站 `.dt-tools`（`.dt-tier-btn`/`.dt-theme-btn`）；popover 必須 `flex:1 1 auto` 先推得齊；主題／tier 同主站 localStorage（`hkmbti_theme`／`hkmbti_tier`）互通；撳「免費版」= 返主站；平板兩行式。

## 2026-11-22 · 文件整理（`9b96716`、`0876232`、`af4bd02` ＋ 本次）

- `AGENTS.md`／`docs/DESKTOP-HANDOFF.md` 對齊現況（權威交接文件）；截圖腳本搬入 `tools/audit_shots.py`；新增 `tools/audit_inner.py`。
- `README.md` 接手指針對齊（權威 = AGENTS.md＋DESKTOP-HANDOFF；舊 handoff 降格歷史；刪已唔存在嘅 `demo/`）。
- 本檔 `CHANGELOG-2026-11.md` 新增。

## 備註

- 版本仍 2.1.0（未 bump、未 tag）。
- Repo 歷史喺 2026-11 曾經重整（現存 13 個 commit）；2026-10 或更早紀錄入面嘅 commit hash 只供參考，唔可以 `git show`。
