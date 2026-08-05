# 港式 MBTI · v1.7 里程碑 Freeze Report（待填）

> **狀態**：⚠️ **待寫** — v1.7 嘅完整 freeze 報告仲未完成
> **填寫時機**：當 Roy 講「v1.7 收尾」/「更新 v1.7」時，先填呢個 report
> **參考範本**：[PROJECT-REPORT-v1.6.md](./PROJECT-REPORT-v1.6.md)
> **HEAD commit（填寫時）**：請填入 commit SHA

---

## 🚧 填寫 checklist

填寫呢個 report 嘅時候，要確保以下項目齊全：

### 1. v1.7 主要改動摘要

```text
對比 v1.6 → v1.7，主要新增：
  - [ ] 港式 MBTI 正名統一（title / icon / 分享卡 header）
  - [ ] 金書法「港」字新 icon（深藍底）
  - [ ] 歷史紀錄風琴式管理（最近 5 次）
  - [ ] 分享卡 header 自動帶版本標記
  - [ ] 三版本三色預設（生活金 / 進階藍 / BB 粉紫）
  - [ ] 結果頁加 🤝 相處 / 💕 拍拖 CTA
  - [ ] 全站統一免責 snippet
  - [ ] 私隱頁（站內 + 獨立 privacy.html）
  - [ ] <head> title 縮短
  - [ ] Google Play 上架素材（feature-graphic + 5 張 screenshots）
  - [ ] 其他（由你決定）
```

### 2. 已知重要 Bug Fixes

```text
  - [ ] <head> viewport meta 整跌咗嘅問題（f33c438）
  - [ ] 分享卡 header 上下唔齊嘅問題
  - [ ] history 風琴「再撳永遠合唔上」嘅 bug
  - [ ] 結果頁「長按圖片可儲存」誤導文字刪走
  - [ ] 其他（由你決定）
```

### 3. v1.7 嘅 Commit Manifest（10 commits）

從 `git log v1.6..HEAD` 抽出嚟（建議用 `git log --pretty=format:"%h %s" v1.6..HEAD`）

### 4. v1.7 嘅 Backup 位置

```text
  - [ ] /opt/data/backups/hk-mbti-v1.7-20260730/（舊備份 · 喺 freeze 前）
  - [ ] /opt/data/backups/hk-mbti-play-prep-20260731-220000/（Play 上架 phase 備份）
  - [ ] 其他（如果之後仲有 freeze）
```

### 5. PWA / Store 上架狀態

```text
  PWA live:    https://fung2222.github.io/hk-mbti/
  Privacy:     https://fung2222.github.io/hk-mbti/privacy.html
  
  Google Play Console 狀態：
  - [ ] 帳號已申請（$25）
  - [ ] App 已建立
  - [ ] APK / AAB 已上載
  - [ ] Internal Testing
  - [ ] Closed Testing
  - [ ] Production / 公開
```

### 6. Lesson learned（從 Play 上架 phase 學到嘅）

```text
  - v1.7 head-patch safety SOP（whole-block replace，避免中間兩行 patch 整跌 meta）
  - 統一 📂 探索更多風琴為「關於網站」入口（avoid 加做主 tab）
  - PWABuilder vs Bubblewrap（新手用前者）
  - Feature Graphic 用 PIL + wqy-zenhei.ttc（cairosvg svg2svg 唔識中文字）
  - Screenshots 真實手機截圖遠好過 mockup（Honor Magic 7 Pro 真機感）
  - Privacy URL 必須係獨立 URL（Play 唔接受 hash anchor）
  - Chat 配對唔做（監管 / 變現 / 用戶池太細）
```

### 7. v1.8 規劃（待 Roy 決定）

```text
  - [ ] IAP 深度報告付費牆？
  - [ ] 朋友圈 QR 比較？
  - [ ] 每日 1 題（push 留人）？
  - [ ] App icon rebrand（v1.7 book-calligraphy 港字 已完成）
  - [ ] 其他
```

---

## 📌 v1.6 freeze 嘅參考結構

`PROJECT-REPORT-v1.6.md` 包含：

1. 摘要
2. 主要改動
3. 重要 bug fixes
4. v1.7 規劃嘅下一階段
5. 數據（commits / loc / size）
6. 已知 issues
7. Lessons learned
8. 測試情況

---

## ⚠️ 重要提醒

填寫 v1.7 report 嘅時候：

- ✅ **凍結** v1.7 commit SHA（用 `git rev-parse HEAD`）
- ✅ **寫定** 我哋做過嘅所有 freeze-level 改動
- ✅ **驗證** live URL（不只 HTTP 200，要 grep 內容）
- ✅ **更新** README.md / PHASE-LOG.md 嘅 cross-reference
- ❌ **唔好** include 啲未 commit 嘅 working tree changes
- ❌ **唔好** 喺 v1.7 freeze 之後先改 v1.7 嘅 source code（會混淆 lock）

---

## 🔗 完整資源

- **Repo**：https://github.com/fung2222/hk-mbti
- **PWA**：https://fung2222.github.io/hk-mbti/
- **Privacy**：https://fung2222.github.io/hk-mbti/privacy.html
- **Play Console**：https://play.google.com/console
- **PWABuilder**：https://www.pwabuilder.com/

---

## 🎯 而家狀態

```text
v1.7 development:        ✓ 完成 + 已 push
Play 上架前置:           ✓ 7 個 Step 全部齊
v1.7 freeze report:      ⚠️ 待寫（呢個 file）
Play Console 申請:       ⚠️ Roy 仍未申請（$25 · 24-48h delay）
PWABuilder .aab 生成:    ⚠️ Roy 仍未做
Play Console 上架:       ⚠️ Roy 仍未做
```
---

# 🔒 v1.7.8 Addendum — Share Card 16-Type Palette + T卹 Preview Page

> **狀態**：✅ 完成 + 已 push + 已 verify  
> **報告日期**：2026-08-05  
> **HEAD commit**：`72d0feb`（share-card palette patch）→ `bump` VERSION 1.7.0 → 1.7.8（freeze step）

## v1.7.8 主要改動

| # | 改動 | File | Detail |
|---|---|---|---|
| 1 | 16 型 personality palette + 2 vibe labels | `data.js` | `window.PALETTE` 新增，16 keys × `{c1, c2, accent, vibes[]}` |
| 2 | Canvas 用 dynamic palette | `index.html` | `generateCardImage()` 改用 `getPalette(code).c1/c2` background + `accent` top border |
| 3 | Logo / icon 大細加強 | `index.html` | `iconSize: 64 → 96`；品牌字 `34px → 42px` |
| 4 | 名字 display 字大 | `index.html` | `30px → 40px` |
| 5 | Hashtag 加 2 個 vibe | `index.html` | `#港式MBTI #XXXX #vibe1 #vibe2` (4 個) |
| 6 | T卹 hook footer | `index.html` | 細字「印你嘅性格 T 恤？👉 hk-mbti/tee.html（真實 preview）」 |
| 7 | T卹 preview page | `tee.html` | 16 type 真實 mockup + filter by group（analyst/diplomat/sentinel/explorer） |
| 8 | 16 個 mockup PNG | `tee-preview/*.jpg` | xAI `grok-imagine-image` 真實生成 |
| 9 | Freeze | VERSION + manifest.json + sw.js | 1.7.0 → 1.7.8 |

## 16 Type Palette（v1.7.8 參考）

| Type | 中文 | 漸層 base | Accent | Vibe labels |
|---|---|---|---|---|
| INTJ | 建築師 | 深紫 → 深暗紫 | #9B7EBD | 深宵腦爆 / 獨立思考者 |
| INTP | 邏輯學家 | 深藍紫 → 暗紫 | #7A8AC9 | 深夜哲學家 / 理論宅 |
| ENTJ | 指揮官 | 紫紅 → 暗紅 | #D4A95F (gold) | 天生領袖 / 效率控 |
| ENTP | 辯論家 | 橙紅 → 暗橙 | #FFD700 (gold) | 點子王 / 唱反調 |
| INFJ | 提倡者 | 深靛 → 暗紫 | #C779A6 | 深度共鳴 / 心靈導師 |
| INFP | 調解員 | 薰衣草 → 深紫 | #FFD9F5 | 文藝青年 / 共情雷達 |
| ENFJ | 主人公 | 珊瑚 → 暗珊瑚 | #FFD9B5 | 天生的老師 / 社群核心 |
| ENFP | 競選者 | 黃橙 → 深橙 | #FFFFFF | 正能量炸彈 / 深夜傾偈王 |
| ISTJ | 物流師 | 深藍 → 暗藍 | #5B8FD9 | 守時怪 / 細節控 |
| ISFJ | 守衛者 | 霧綠 → 深綠 | #A8D5BA | 照顧者 / 默默付出 |
| ESTJ | 總經理 | 深紅 → 暗紅 | #D4A95F (gold) | 傳統硬頸 / 家庭責任王 |
| ESFJ | 執事 | 橙黃 → 深橙 | #FFFFFF | 派對暖男 / 飯局核心 |
| ISTP | 鑒賞家 | 鋼藍 → 暗藍 | #8AC9D9 | 動手派 / 獨立解決王 |
| ISFP | 探險家 | 粉紫 → 深粉 | #FFD9E5 | 美感雷達 / 獨立創作 |
| ESTP | 企業家 | 螢光綠 → 深綠 | #0A0A1A (黑) | 行動派 / 臨場爆seed |
| ESFP | 表演者 | 桃紅 → 深紅 | #FFD9E5 | 氣氛王 / 聚會靈魂 |

## Verify chain

- ✅ inline scripts 10/10 syntax OK
- ✅ `<head>` viewport / theme-color / og:title 完整
- ✅ PALETTE 16 keys 完整 + getPalette fallback
- ✅ QUESTIONS audit 112 題 · 軸分佈冇變動（EI 20 · SN 20 · TF 20 · JP 32 · TA 20）
- ✅ Live CDN size 169910 bytes / MD5 0730478253f9644489d1f26d9f09fe18
- ✅ Grep anchor: `iconSize = 96` ×1 · `pal.accent` ×1 · `tagPal.vibes` ×2 · `hk-mbti/tee.html` ×1

## T卹 preview page（tee.html）

- 獨立 standalone page · 不撞 index.html
- Tailwind CDN + brand-gold CSS tokens
- 4 filter chips：全部 / 分析家 / 外交家 / 守衛者 / 探險家
- 16 個真實 mockup 由 xAI `grok-imagine-image` 生成
- 暫未有實際 purchase flow（launch 後再加）

## Roy 而家就可以做嘅嘢

1. hard-reload 主頁 `https://fung2222.github.io/hk-mbti/`  
2. 做測試 → 結果頁睇新嘅 share card（加大 icon + 16 型 gradient + 4 vibe tag）
3. 點 share card 底部 T卹 hook → 開 `tee.html` 揀 type 預覽


---

# 🔒 v1.7.9 Freeze Status — 完整 Site Launch Ready

> **狀態**：✅ **FROZEN · 收皮等 Play 上架**
> **報告日期**：2026-08-05 15:04
> **HEAD commit**：`130dd80` ("feat(ads): record.html + tee.html 各加 3 個 ad slot + IAP unlock button")
> **VERSION 同步**：VERSION=1.7.9 · manifest.json=1.7.9 · sw.js CACHE=hk-mbti-v1.7.9 ✓

## 3 個獨立 page（v1.7.9 全部 freeze）

| Page | URL | Size | Ad slots | IAP |
|---|---|---|---|---|
| 主頁 | `/` | 170596 bytes | 3 | ✓ |
| 記錄 | `/record.html` | 19911 bytes | 3 | ✓ |
| T 恤 | `/tee.html` | 12026 bytes | 3 | ✓ |
| 私隱 | `/privacy.html` | 5500 bytes | — | — |

## 完整 v1.7.7 → v1.7.9 cycle 改動摘要

### A. Share Card 升級（v1.7.8 · 72d0feb）

- 16 型 personality palette + accent 邊線 (`data.js → window.PALETTE`)
- Icon 64→96 × Brand 34→42 × Name 30→40（更強 branding）
- 4 個 hashtag 加入 2 個 vibe tags (`#XXX #vibe1 #vibe2`)
- T 卹 hook footer 細字「印你嘅性格 T 卹？👉 hk-mbti/tee.html（真實 preview）」

### B. T 卹 Preview Page（v1.7.8 · 2be5aa1）

- 獨立 `tee.html` 16 個真實 mockup（xAI `grok-imagine-image` 生成）
- 4 個 filter chip（analyst / diplomat / sentinel / explorer）
- 24MB mockup 跟主頁 brand-gold 色 align

### C. 記錄 Page（v1.7.9 · cdcff83 + 多個後續 patch）

- 獨立 `record.html`：總覽 + 5 條 history + 16 型訪問統計 + export JSON + 全部清除
- Big 金色 #1-#5 badge（取代原 plan 嘅 version pill — Roy 唔想 emoji 重疊）
- Top nav「[🏛] 港式 MBTI ←」pill 返回主頁
- 標題純「我的測錄記錄」（v1.7.9 emoji 移除 · 更簡潔）
- `#view=N` hash bridge — fix record → 主頁 replay history result

### D. 廣告 + IAP 跨 page 部署（130dd80）

- CSS: `.ad-slot` / `.ad-footer-sticky` / `.ad-unlock` / `.ad-close` 同主頁 `f8b7244` 規格
- JS unlock: `window.purchaseNoAd` IIFE · localStorage `hkmbti_no_ad` 跨 3 page 同步
- 3+3+3 = 9 個 slot · 全部 placeholder `ca-pub-PLACEHOLDER` 等拎 publisher ID 即時 fill
- Close (✕) button / frequency cap manual fallback
- Unlock 跨 page：record 買咗 → 主頁 + tee 都即時 hide ad（reload 之後）

## Final Audit ✓

```
[1] Working tree:        clean
[2] 12 commits:          HEAD = 130dd80 ✓
[3] VERSION sync:        1.7.9 / 1.7.9 / hk-mbti-v1.7.9 ✓
[4] index.html scripts:  10 blocks, 0 syntax error ✓
[5] record.html scripts: 4 blocks, 0 syntax error ✓
[6] tee.html scripts:    4 blocks, 0 syntax error ✓
[7] All onclick handlers have window.X defined ✓
[8] CDN size match local: 170596 / 19911 / 12026 / 5500 ✓
[9] CDN MD5 match local: 43b2266d70ca009fc4f981a2525c4fd0 ✓
[10] 16 tee-preview mockup: all HTTP 200 ✓
[11] Local HEAD == remote HEAD: 130dd80 ✓
```

## 已知 frozen limitations

1. **AdSense `ca-pub-PLACEHOLDER`** 仲未拎 publisher ID — 之後拎到即 replace 唔需要改 structure
2. **T 卹** 暫只係 mockup preview page，**未 launch 真正 purchase flow**（Printful integration + print-ready SVG 留待 launch 之後）
3. **`tee-preview` 16 個 xAI mockup** 唔可以 reprint（xAI policy）— 真正 launch 需 designer 出 production vector
4. **跨 device localStorage 唔同步** — record.html 同主頁 share 同一個 device，但新 device 就係新嘅 record
5. **Privacy/Terms 條文仲係 basic** — 等 Play Console 真正 review 時再深化

## 同時備份

- Backup: `/opt/data/backups/hk-mbti-v1.7.9-freeze-2026-08-05 15:04/`
- tar.gz: `/opt/data/backups/hk-mbti-v1.7.9-freeze-2026-08-05 15:04.tar.gz`
- Meta: `FREEZE-META.txt` (21 entries, 7.4 MB compressed)

## Play Store 上架前置 status

| Step | Status |
|---|---|
| 1. `store-listing/` doc | ✓ prep |
| 2. `privacy.html` | ✓ live |
| 3. APK (PWABuilder) | ⚠ Roy build |
| 4. Screenshots | ✓ Honor Magic 7 Pro 真實 5 張 |
| 5. Feature graphic | ⚠ 待 PIL mockup |
| 6. Play Console 申請 | ⚠ Roy ($25 已付 · 等電話 verify 解鎖) |
| 7. Upload .aab | ⚠ Roy |

> **結論**：web stack 完全 launch ready；Play Store 上架需要 Roy 親自做 steps 3-7。
