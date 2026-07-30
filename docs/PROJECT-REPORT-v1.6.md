# 香港 MBTI（港MBTI）專案結構報告 · v1.6

> **凍結版本：** v1.6.0  
> **報告日期：** 2026-07-29  
> **用途：** 日後編輯 / 續做 / 上架 Play 時嘅單一真相來源（SSOT）  
> **Live URL：** https://fung2222.github.io/hk-mbti  
> **Repo：** https://github.com/fung2222/hk-mbti（public · branch `main`）  
> **工作目錄：** `/opt/data/repos/hk-mbti/`  
> **備份：** `/opt/data/backups/hk-mbti-v1.6-20260729/`  
> **Git tag：** `v1.6.0`  
> **前一凍結：** v1.5.0（備份仍保留於 `hk-mbti-v1.5-20260729`）

---

## 1. 產品定位

| 項目 | 內容 |
|------|------|
| 中文名 | 香港 MBTI / 港MBTI |
| 一句話 | 60 題廣東話版港式性格測試 |
| 副標（定稿） | 5 分鐘知道你是茶餐廳、港鐵、7-11 三種情景裡面，邊一種人 |
| 語言 | **繁中 + 廣東話為主**；類型名「英文代碼 + 中文名」（如 INTJ + 建築師） |
| 差異化 | 港式情境題 + 社交/戀愛場景攻略 + 稱呼玩味 + 本機 5 次紀錄 |
| 定位聲明 | **娛樂性測試**，非臨床/學術診斷 |
| 商標注意 | 對外避免寫成 Myers-Briggs 官方；可用「16 型性格參考 / 港式性格測試」 |

---

## 2. 版本時間線

| 版本 | 重點 |
|------|------|
| v1.0–1.1 | 60 題 prototype、Pages 上線、script/startTest fix |
| v1.2 | 廣東話副標、社交+戀愛、PWA「港」icon |
| v1.3–1.4 | 真 PNG 分享卡、結果 bug、data.js 繁中、3 版本長度 |
| v1.5 | 雙擊版本、字體加大、分層 shuffle+變體、16 型統計、Share 圖+網址 |
| **v1.6（而家）** | 百科中文名、場景著燈 fix、測前姓名+30 稱呼、最近 5 次紀錄、分享卡印名 |

---

## 3. 檔案結構

```
/opt/data/repos/hk-mbti/
├── index.html          # UI + 題庫 + app 邏輯（主檔）
├── data.js             # LETTERS + TYPES_FULL
├── social.js           # SOCIAL + ROMANCE
├── manifest.json       # PWA · version 1.6.0
├── sw.js               # cache hk-mbti-v1.6
├── VERSION             # 1.6.0
├── docs/
│   ├── PROJECT-REPORT-v1.5.md
│   └── PROJECT-REPORT-v1.6.md   ← 本報告 repo 副本
├── icon-*.png / favicon / apple-touch-icon
└── .git/
```

**報告主檔：** `/opt/data/reports/hk-mbti-project-report-v1.6.md`  
**舊報告：** `...-v1.5.md`、`hk-mbti-market-analysis.md`、`strategy.md`

---

## 4. 功能地圖（v1.6）

### 4.1 測試流程（完整）
1. 主頁揀版本（**雙擊**：一按著燈 → 再按）  
2. **Profile 頁**：輸入姓名（最多 12 字）+ 揀港式稱呼，或「匿名港人」  
3. 出題（生活 60 / 進階 30 / BB 10）  
4. 結果卡 + 下載 / Share（PNG + 網址）  
5. 自動寫入 **最近 5 次** 紀錄  

### 4.2 出題 / 計分
- `buildDeck()`：5 軸 EI/SN/TF/JP/TA 分層抽樣 → shuffle 題序 + 選項序 + `Q_ALTS` 題幹變體  
- `calcScore()`：跟答案向量 key，唔靠題序  
- 輸出：4 字母 + `-T`/`-A`

### 4.3 結果頁
- Canvas PNG 分享卡（可長按）；左上 logo icon  
- 卡上顯示 **姓名 · 稱呼**（若有）  
- 卡片右上日期下方顯示 **測試版本 + 題數**（生活版 60題 / 進階版 30題 / BB版 10題）
- Share：`files: [PNG]` + `text: 網址`  
- 「你是邊種港人」：**字母重疊計分**；最高分金邊 +「✦ 最似你」（修 ENTJ 全暗 bug）  
- 場景含 Boardroom 開波 / 腦內黑客松 等  

### 4.4 性格百科
- 16 型 grid：**emoji + 英文代碼 + 中文名**（建築師、調解員…）  
- 維度頁、比較工具、TYPES_FULL 詳情（friend/conflict fallback love）  

### 4.5 社交 / 戀愛
- `social.js` 多場景 × 16；`show()` 必須列齊 section；唔好洗 container  

### 4.6 港式稱呼（30）
宅男、港女、渣男、銀髮族、拜金女、社畜、廢青、靚仔、靚女、打工皇帝、  
師奶、大叔、港爸、港媽、大學生、斜槓青年、夜青、港漂、富二代、月光族、  
佛系青年、卷王、打工人、兄弟、閨密、煲劇廢、健身狂、茶記常客、港鐵戰士、OL  

### 4.7 本機儲存

| Key | 用途 |
|-----|------|
| `hkmbti_history` | **最近最多 5 次**完整紀錄（mbti/name/nickname/version/timestamp/id） |
| `hkmbti_last_result` | 最新一次（兼容舊版；寫入時同步） |
| `hkmbti_profile` | 上次用過嘅姓名+稱呼（預填） |
| `hkmbti_type_counts` | 本機各型 +1（統計） |
| `hkmbti_visits` / `hkmbti_install_dismissed` | PWA install banner |

舊單次 `hkmbti_last_result` 會 **migrate** 入 `hkmbti_history`。

### 4.8 統計 / PWA
- 16 型 bar：基線×143021 + 本機；約香港人口（750 萬×佔比）  
- PWA manifest / SW `hk-mbti-v1.6` / install banner  

---

## 5. 技術鐵律

1. 靜態站 · Pages `main` `/` · vanilla JS + Tailwind CDN  
2. 資料 `window.*`  
3. `show(id)` 列表含：`home, profile, test, result, hub, letter, type, social, socialArticle, romance, romanceArticle`  
4. 結果卡 = `<img id="shareCardImg">`，唔好依賴已刪 DOM  
5. 計分用向量；場景著燈用計分唔用「全中」  
6. 改版同步 bump：`VERSION` + badge + `sw.js` CACHE + `manifest.version`  
7. Git：`fung2222` / `fung2222@users.noreply.github.com`  
8. 用戶：「唔好亂改」→ 先 audit；hard reload 常要  

---

## 6. 已修重要 Bug（含 v1.6）

| 症狀 | 修法 |
|------|------|
| 最後一題無反應 | 移除對已刪 DOM 嘅 render |
| 看完整分析無反應 | friend/conflict fallback |
| Share 只有 link | File PNG + 網址 |
| ENTJ「邊種港人」全暗 | 重疊計分 + 金邊「最似你」 |
| 題序死板 | 分層 shuffle + 選項 shuffle |

---

## 7. 文案定稿

- 副標：三種情景「裡面，邊一種人」  
- 主場景宣傳：茶餐廳 · 港鐵 · 7-11  
- 百科：英文下中文名  
- Share：圖 + 網址  

---

## 8. 未做 / 限制

- 無後端真實全站即時排行  
- Premium 支付未接  
- Play / App Store 未上架  
- 題庫每軸仍約 12 題（有變體）  
- PAT 勿寫入 repo  

---

## 9. 未來方向（傾過）

- 更多場景題 / 雙人互測  
- TWA/Capacitor 上架（先私隱政策+定名）  
- 後端統計（若要「全港」）  
- 拆分 `index.html`  

---

## 10. 部署 / 備份 / 還原

```bash
cd /opt/data/repos/hk-mbti
git add -A && git commit -m "..." && git push origin main
# tag
git checkout v1.6.0   # 還原此版
```

| 項目 | 路徑 |
|------|------|
| 本報告 | `/opt/data/reports/hk-mbti-project-report-v1.6.md` |
| Repo 副本 | `docs/PROJECT-REPORT-v1.6.md` |
| 備份夾 | `/opt/data/backups/hk-mbti-v1.6-20260729/` |
| tar | `/opt/data/backups/hk-mbti-v1.6-20260729.tar.gz` |
| v1.5 備份 | `/opt/data/backups/hk-mbti-v1.5-20260729/` |

---

## 11. 編輯速查

| 想改 | 去邊 |
|------|------|
| 題目 | `index.html` → `QUESTIONS` / `Q_ALTS` |
| 16 型短文 | `TYPES` in index.html |
| 16 型長文 | `data.js` → `TYPES_FULL` |
| 稱呼列表 | `NICKNAMES` in index.html |
| 社交戀愛 | `social.js` |
| 版本號 | VERSION + badge + sw + manifest 一齊 |
| 紀錄條數 | `saveResult` 內 `.slice(0, 5)` |

**新對話續做一句：**  
「繼續港 MBTI，讀 PROJECT-REPORT-v1.6 / tag v1.6.0」

---

## 12. 一頁總結

港MBTI **v1.6** = 廣東話港式性格 PWA：3 長度測試、測前姓名+稱呼、5 次本機紀錄、真圖分享、百科中英並列、場景著燈、本機統計示意。部署 GitHub Pages。下步若上架或加後端，先睇 §8–9。

---

*End of report · v1.6.0*
