# 港式 MBTI · Google Play 上架前置準備 Changelog

> **項目**：fung2222/hk-mbti v1.7.0
> **日期範圍**：2026-07-30 → 2026-07-31
> **HEAD commit**：`939f65b`
> **目的**：將 PWA 升級至 Google Play Store 上架標準
> **狀態**：✅ 所有前置準備完成（7 個 Step 全部通過）

---

## 🎯 一句話總結

呢個 phase 將 `港式 MBTI` 由 GitHub Pages PWA 升級至符合 Google Play Store 上架標準嘅狀態：建立獨立私隱頁、強化 App 內文案、製作 Feature Graphic + 5 張真實手機截圖、準備 PWABuilder 上載 zip、整理 Data Safety 文檔。

---

## 📋 Step 1 · App 內容加固（4 個 sub-step）

### Step 1a · Store 上架文案草稿（`3deac39`）

**新增**：`/store-listing/` 8 個檔案

| 檔案 | 字數 | 內容 |
|------|------|------|
| `README.md` | — | 上架索引 |
| `app-name.txt` | 14 字 | **「港式 MBTI · 廣東話性格測試」** ✅ Roy 揀 A |
| `short-desc.txt` | 32 字 | **「多種情景 60 題廣東話 MBTI 測試，5 分鐘知你喺邊種香港人」** ✅ Roy 揀 A · 「多種情景」預留擴展空間 |
| `full-desc.md` | ~3 KB | 完整描述：點解揀 / 三版本比較 / 測完拎到咩 / 同普通版分別 / 免責 / v1.7 新功能 / 私隱 |
| `content-rating.md` | ~2.5 KB | Content rating 問卷答案（揀 Personality assessment）|
| `data-safety.md` | ~4 KB | Data safety form 答案（已對齊 Step 1b-C + 2a 進度） |
| `changelog.md` | ~1 KB | v1.7.0 release notes |
| `keywords.txt` | — | ASO 關鍵詞（自用參考） |

### Step 1b · App 內文案 + 免責 + 私隱頁（3 個 commit）

#### Step 1b-A · 結果頁加深內容入口（`411e325`）

- **改動**：`index.html` line 916-924
- **新增**：結果頁「看完整分析 →」下面加 2 個 inline link
  - 🤝 **點同人相處** → `openSocial()`
  - 💕 **點同人拍拖** → `openRomance()`
- **驗證**：5 段 inline scripts syntax OK，`openSocial` / `openRomance` 已存在
- **目的**：呼應 xAI 8.4/10 評估嘅「結果頁視覺引導可更強」+ Play 評審期待

#### Step 1b-B · 統一免責 snippet（`43c1cb3`）

- **改動**：`index.html` 兩處
- **位置 1**：line 846-849（主頁底部 · 統計 card 之後）
- **位置 2**：line 947-950（結果頁底部 · 返回主頁之後）
- **文案**：`⚠️ 本測試只係自我探索工具，唔係醫學診斷或專業心理評估。唔適合作僱傭、配對婚姻或貼標籤批評人嘅依據。`
- **驗證**：5 段 inline scripts syntax OK，disclaimer 出現 2 次
- **目的**：與 `store-listing/full-desc.md` 同源，Play 描述 + App 內一致

#### Step 1b-C · 私隱頁（Play Store 強制 · `d1d7d0b`）

- **新增**：
  - `<section id="privacy">` line 476-545
  - `window.openPrivacy` line 2575-2577（IIFE 頂層）
  - 探索更多風琴加第 6 項 `🔒 私隱聲明` line 899-909
- **關鍵**：v1.7 教訓 — `show()` whitelist 加 `"privacy"` 防 silent fail
- **內容 5 段**：
  1. 我哋收集咗咩
  2. 我哋點儲存
  3. 我哋點分享
  4. 你嘅權利
  5. 聯絡
- **驗證**：5 個 invariant 全中（privacy section / openPrivacy fn / show whitelist / home-acc privacy / onclick）

### Step 1c · `<head>` title 縮短（`dd8f7ba`）

- **改動**：`index.html` line 6
- **前**：`港式 MBTI ｜ 你是哪種港人？廣東話性格測試` (21 字)
- **後**：`港式 MBTI · 你是哪種港人？` (13 字)
- **同 og:title 一致**（已係 13 字版本）
- **驗證**：14/14 head safety checks pass + 14 段 meta 全保留（viewport / theme-color / og / manifest）
- **目的**：PWA launcher label 唔再 truncate + OG card preview 一致

---

## 📋 Step 2 · Play Store 素材準備（5 個 sub-step）

### Step 2a · Privacy URL 獨立頁（`ffb1c40`）

- **新增**：`privacy.html` (5500 bytes)
- **URL**：`https://fung2222.github.io/hk-mbti/privacy.html`
- **設計選擇**：獨立 HTML（非 hash anchor），Play Console 強制 full URL
- **內容**：與主頁 `#privacy` section 一致，5 段 + 返回主頁 CTA
- **驗證**：10/10 head safety checks pass，8/8 live verify

### Step 2b · Feature Graphic（`a61f6ce`）

- **新增**：
  - `feature-graphic.png` (1024×500 PNG, 143,652 bytes)
  - `feature-graphic.svg` (source)
- **設計**：
  - 深藍底 (#1E2A3B) + 金色 (#D4A95F) 漸層
  - 左：v1.7 `icon-512.png`（金書法「港」）
  - 右：`港式 MBTI` (金) + `你是哪種港人？` (米白) + 3 條 features（60 題廣東話 / 3 種香港場景 / 5 分鐘出結果）
  - 底部 strip：`v1.7.0 Cantonese Personality Test` + `fung2222.github.io/hk-mbti`
- **字型技術**：PIL + `wqy-zenhei.ttc`（cairosvg 唔識中文字，已轉 PIL）

### Step 2c · Screenshots 5 張（真實 Honor Magic 7 Pro）

#### Phase 1 · Mockup 版本（`9f53c56`）

- 5 張 1080×1920 PNG · PIL 砌出
- **狀態**：❌ 後來被真實截圖取代（mockup 字型生硬 / emoji 方塊化 / 廣東味不足）

#### Phase 2 · 真實截圖 swap（`939f65b`）

- 來源：Honor Magic 7 Pro · 1170×2560 原始
- **自動 crop**：top=140 (status bar) + bottom=120 (gesture bar)
- **最終尺寸**：1170×2300 PNG
- **5 張內容**：

| # | 內容 | Roy 截圖重點 |
|---|------|----------|
| 1 | 主頁 hero + 揀版本 | 「你是哪種香港人？」+ 3 粒掣（金 / 藍 / 粉紫）+ 廣東話改版 badge |
| 2 | 測試中 | E/I · 問路題（喺港島唔識路）+ 4 個選項（問途人 / Google Map / Call 朋友 / 自己行錯）+ 進度條 10/60 |
| 3 | 結果頁 | ISTP · 鑑賞家 · 「裝機拆機無人能敵」+ 60 題 / 1 分鐘 + 企硬力9 / 社交力4 / 食力6 + 3 粒分享掣 |
| 4 | 場景配對 | 8 個場景格仔 + 「腦內黑客松」（INTP 思維遊樂場）「最似你」金框著燈 |
| 5 | 場景 + 探索更多 | 60 題涵蓋 3 個港式場景（茶餐廳 / 港鐵 / 7-11）+ 6 個風琴項目（關於 / 光譜 / 百科 / 相處 / 拍拖 / **私隱**）|

### Step 2d · Data Safety 文檔更新（`7e6fae6`）

- **改動**：`store-listing/data-safety.md`
- **內容**：
  - 對齊 Step 1b-C + 2a 進度（站內 `#privacy` + 獨立 `privacy.html`）
  - 5 個 Play Console 填表 step（直接 copy）
  - 6 個常見陷阱（Health data / Device ID / App interactions）
  - 3 個審核 follow-up 預備答案

### Step 2e · PWABuilder source zip（✅ 不入 git）

- **檔案**：`/opt/data/hk-mbti-pwa-source-v1.7.0.zip` (648,692 bytes)
- **內容**：12 個 PWA 必要檔案（manifest / icons / sw / index / data / social / privacy / VERSION）
- **用法**：用戶上載去 https://www.pwabuilder.com/ → 自動生成 .apk + .aab
- **.aab 上載去 Play Console**

---

## 📊 統計

```text
Commits added (Play 上架 phase):    10
  Step 1a-1c:                        5
  Step 2a-2d:                        5
  (Step 2e 不入 git — 純本地 zip)

Files added:                          14
  /store-listing/:                    8 + 6 screenshots + 1 strategy md = 15
  
Code changes:
  index.html:                         +106 / -3 (5 commits)
  privacy.html:                       新增 (133 lines)
  store-listing/data-safety.md:       +121 / -56

HEAD:                                 939f65b
Branch:                               main
Working tree:                         clean (只有 icons-draft/ untracked，無視)
```

---

## ⚠️ 重要決定記錄

| 決定 | Roy 揀 | 原因 |
|------|--------|------|
| App name | A 「港式 MBTI · 廣東話性格測試」| 同 PWA short_name 對齊 |
| Short desc | A 「多種情景 60 題⋯」 | 「多種情景」預留擴展空間 |
| Privacy URL | 獨立 `privacy.html` | Play Console 唔接受 hash anchor |
| Screenshots | 真實 Honor 截圖 | xAI 8.4 + Roy：「唔要 mockup」 · 廣東味更強 |
| Tabs | 唔加「關於」做主 tab | 放「探索更多」風琴第 1 項 |
| APK | PWABuilder | Roy 係新手 · 5 分鐘搞掂 |
| Chat 配對 | **不做** | 監管成本高 + 護城河失 + 廣東話池太細 |

---

## 🎯 未做嘅 Play Console 手動動作（用戶 checklist）

```text
□ 註冊 Google Play Console ($25 USD · 24–48h delay)
□ 開 PWABuilder → 上載 zip → 生成 .aab
□ Play Console 建立 app
□ 填寫 store listing（用 store-listing/ 入面嘅文案）
□ 上載 feature-graphic.png
□ 上載 5 張 screenshots
□ 填 data safety form（照 data-safety.md 「四、Play Console 填表指引」）
□ 填 content rating（照 content-rating.md）
□ Privacy URL: https://fung2222.github.io/hk-mbti/privacy.html
□ Internal Testing → Closed Testing → Production
```

---

## 🔗 重要 URL（全部已 live verify）

```text
PWA:           https://fung2222.github.io/hk-mbti/
Privacy:       https://fung2222.github.io/hk-mbti/privacy.html
GitHub:        https://github.com/fung2222/hk-mbti
PWABuilder:    https://www.pwabuilder.com/
Play Console:  https://play.google.com/console  (Roy 仍未註冊)

本地 zip (不入 git):  /opt/data/hk-mbti-pwa-source-v1.7.0.zip
```