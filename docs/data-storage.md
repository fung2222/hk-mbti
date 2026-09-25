# 資料儲存記錄（localStorage / sessionStorage）

_最後整理：2026-09-26（v1.9.0）_

全部資料 100% 留喺用戶部機，冇後端、冇 analytics。index.html / record.html / stats.html 共用同一個 origin，所以共用同一份 storage。

## localStorage（長期）

| Key | 內容 | 寫入者 | 讀取者 | 大細（實測） | 上限／清理 |
|---|---|---|---|---|---|
| `hkmbti_history` | 最近測試紀錄 array（新→舊） | `saveResult()`、`persistCardThumb()`、`deleteHistoryItem()`、`clearAllRecords()` | `getHistoryList()`、`loadHistory()`（record.html）、`viewHistoryResult()` | 1 條 ≈ 42–45KB | 最多 **5 條**（unshift + slice） |
| `hkmbti_last_result` | 最新一筆紀錄（兼容舊版／migration） | `saveResult()` | `getHistoryList()`（只有 history 空時先用）、record.html 舊資料相容 | ~130 bytes | 永遠同 `history[0]` 同步 |
| `hkmbti_type_counts` | `{MBTI: 次數}` 已探索類型 | `recordTypeStat()` | stats 分頁、紀錄頁 | 10–60 bytes | 清紀錄時一齊刪 |
| `hkmbti_profile` | `{name, nickname, gender}` | 測前 wizard | 下次開 app 預填 | ~80 bytes | 用戶改就覆蓋 |
| `hkmbti_test_progress` | `{idx, answers[], deck, startedAt}` 未完成測試 | `saveProgress()` | `loadProgress()`（續做） | 5–10KB（60 題陣列） | 測完 `clearProgress()` |
| `hkmbti_visits` | 開啟次數（PWA 安裝 banner 第 2 次先彈） | `beforeinstallprompt` handler | 同上 | 1–2 bytes | 冇 |
| `hkmbti_installed` | `"1"` = 已安裝 PWA | install 流程 | install banner 判斷 | 1 byte | 冇 |
| `hkmbti_install_dismissed` | `"1"` = 用戶關過 banner | `installDismiss` | install banner 判斷 | 1 byte | 冇 |

### 每筆紀錄（`hkmbti_history[i]`）嘅欄位

`id`（`Date.now()-random`）、`mbti`（例 `INFP-A`）、`timestamp`、`completed`、`name`、`nickname`、`version`（life/advanced/bb）、`card`（480×854 JPEG dataURL，~25–35KB）

## sessionStorage（一次性，關 tab 就冇）

| Key | 用途 |
|---|---|
| `hkmbti_last_nav` / `hkmbti_last_section` | 記住導覽位置，back／forward 還原 |
| `hkmbti_last_record_idx` | 由紀錄頁跳去結果頁時記住係第幾筆 |

## 讀取時自動清理（防止舊版垃圾累積）

1. **去重**：同 `mbti + name + nickname + version`，而 `timestamp` 相差 ≤ 3 分鐘 → 只留最早嗰條（舊版分享掣會重複寫入）。
2. **刪 `cardShare`**：舊版每條會多存一張 720×1280 JPEG（~67KB）—— 而家一條只留一張 480×854（~30KB），要高清分享卡就返結果頁重新生成。讀取時發現舊欄位即刪，順手寫返 storage。
3. 清理只會喺 `getHistoryList()`（index）／`loadHistory()`（record.html）嘅同一個 pass 做，唔會另外排程。

## 容量預算

- 最壞情況（5 條紀錄 + 續做進度）：**≈ 240KB**（整理前 ≈ 400KB）
- iOS Safari 同 origin 上限約 5MB → 用 5% 左右，安全
- 冇任何 key 會無限增長：紀錄封頂 5、progress 測完即清

## 相關決定

- 分享卡縮圖曾經係 180×320（列表用）＋ 720×1280（分享舊紀錄用）兩張；因為 720 版本佔 87% 空間，改為兩者共用一張 480×854。
- `hkmbti_visits` 睇落似死 key 但其實係 install banner 嘅「第 2 次先彈」判斷，所以保留。
