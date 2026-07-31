# Google Play · Data Safety Form 答案（v1.7.0）

> 進入 Play Console → 應用內容 → Data safety

---

## Data collected（資料收集）

### 是否收集或分享用戶資料？

**答案：是 — 但僅儲存喺用戶裝置本地**

---

## 詳細答案

| 問題 | 答案 | 說明 |
|------|------|------|
| App 是否收集或分享用戶資料？ | **是** | localStorage 收集測試紀錄 |
| 收集嘅資料會加密傳輸？ | **不適用** | 唔傳輸，只本地儲存 |
| 用戶可否要求刪除資料？ | **是** | App 內「歷史紀錄」可逐筆或全部刪除 |
| 是否收集「個人資料」類別？ | **是** | 姓名 / 稱呼（用戶自願輸入） |
| 是否收集「財務資料」？ | **否** | |
| 是否收集「健康資料」？ | **否** | 性格測試唔屬於醫療健康 |
| 是否收集「位置」？ | **否** | |
| 是否收集「訊息」？ | **否** | 聊天內容無；姓名 / 稱呼屬「個人資料」 |
| 是否收集「媒體檔案」？ | **否** | |
| 是否收集「檔案 / 文件」？ | **否** | |
| 是否收集「行事曆」？ | **否** | |
| 是否收集「聯絡人」？ | **否** | |
| 是否收集「App 活動」（如測試紀錄）？ | **是** | localStorage 儲存測試結果、版本、稱呼 |
| 是否收集「Web 瀏覽」？ | **否** | |
| 是否收集「App 資訊 / 效能」？ | **否** | |
| 是否收集「裝置 ID」？ | **否** | |
| 資料分享對象？ | **無** | 完全本地，唔上傳 |
| 資料用途？ | **App 功能** | 歷史紀錄、預填姓名稱呼 |

---

## Data handling（資料處理）

- **收集**：是（localStorage）
- **分享**：否
- **加密傳輸**：不適用（本地）
- **可由用戶刪除**：是（App 內）

---

## ⚠️ Play Console 填寫建議

填寫表單時用以下文案（精簡版）：

```
Data collected: Yes
Data shared: No
Data is encrypted in transit: Not applicable (local storage only)
Data is encrypted at rest: Yes (browser-managed localStorage)
Users can request data deletion: Yes (in-app history management)

Categories of data collected:
- Personal info: User-provided nickname / display name (optional)
- App activity: Test results, version, timestamp (local only)

Purpose: App functionality (history recall, prefill on next visit)
```

---

## 重要：去 Play Console 之前要將呢段填到 App 內

加一個 **「私隱聲明」** section（例如喺探索更多風琴內加新一項）：

```
本 App 收集嘅資料：
- 你輸入嘅姓名同稱呼（可選，不輸入亦可用）
- 你嘅測試結果、版本、時間

呢啲資料：
- 只儲存喺你部機嘅瀏覽器（localStorage）
- 開發者無法存取
- 唔會上傳到任何伺服器
- 你可以喺「歷史紀錄」內逐筆或全部刪除
```