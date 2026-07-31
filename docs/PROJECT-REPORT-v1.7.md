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