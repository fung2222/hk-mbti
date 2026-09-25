# HK MBTI Closed Testing Playbook · 2026-08-17

> 為 fung2222/hk-mbti (com.fung2222.hkmbti) 而寫，個人 developer account · post-Nov-2023 · v1.7.12 internal 已上 internal track，下一步上 closed track。

**短答**：12 個真實人、連續 opt-in 14 日、全部用真實 Android 機（唔可以 emulator）、要 buffer 14–16 人因為有人會 drop。[1][2]

---

## 1. 你嘅情況定位

你係 post-Nov-2023 嘅 personal developer account → Google 強制要 closed testing 先可以申請 production access。Internal testing 同 Open testing 唔可以代替。[1]

## 2. Tester 要乜條件（Google 真會 check）

- 真實 Google account（唔可以自製）[3][4]
- 真實 Android device（emulator / virtual machine / device farm 都會被 Play Integrity API 抓到）[3][4]
- 同你唔同人、唔同 IP、唔同 network（自製多 account 唔計）[4]
- 透過 Play Store 嘅 opt-in link 按「Become a tester」（淨 email 收到唔算）[2]
- 14 日連續 opt-in 中途 opt-out 然後 opt-in 返 → 14 日要由頭計過[1]
- Tester install 後要打開 + 用過 app（淨 install 唔算）[3]

## 3. 你而家得 3 個人 — 仲欠 11 個

**你嘅選項**（cost vs risk vs time）：

| 途徑 | 成本 | 時間 | Dropout 風險 | 備註 |
|---|---|---|---|---|
| 屋企 + 親友 | $0 | 日~週 | 高 | 社交網絡細、易 drop、低 engagement[2] |
| 朋友圈 WhatsApp / IG 招募 | $0 | 幾日~2 週 | 中 | 識得嘅人，較易 follow-up |
| Reddit / Discord / Telegram beta 群 | $0-低 | 不可控 | 中 | 唔同來源 user 有 IP / device 多樣性 |
| **Managed service** (TesterBee / TestMyApps / FastTesters) | $15 USD/app | ~1 小時後 15 testers | 低（buffer） | 「14 testers、16-day window、$15 one-time」[4] |

**策略建議**（你剩 11 人）：
1. 即刻 invite 屋企 3 人（已 opt-in）→ 剩 9 人
2. WhatsApp / IG 朋友圈 broadcast「幫手做 MBTI app 測試 14 日」 → target 5–8 人（你個人朋友圈正常）
3. 開個 Beta Google Group + opt-in link broadcast
4. **同步 register 一個 managed service 兜底**（FastTesters $15/app） — 萬一 friendship 群 drop 多過 1–2 人，buffer testers 會補返

呢個 combination 將 launch date 風險降到最低：$15 換嘅係 14 日 streak 唔 reset。

## 4. 14 日流程（你 day 0 開始）

| Day | 任務 |
|---|---|
| 0 | Closed track 上傳 build → 確認 release approved、Play Console 顯示「available」 |
| 1–2 | 12+ testers 用 Play Store opt-in link 按「Become a tester」、install、whitelist 國家 |
| 3–10 | Tester 開始用 app、submit bug。要 **push 至少 1 個 update**（Google production-access questionnaire 會問你 iterate 咗咩） |
| 8–13 | 持續 engagement，確認 12+ 都仲 opted-in、冇人 uninstall |
| 14 | Play Console Dashboard → "Apply for production access" → 填 6 條問題（tester recruitment difficulty / engagement / feedback summary） |
| 14+ | Google review 3–7 個工作日 |

## 5. 答 production-access questionnaire 嘅關鍵

- **Be specific**：引用真實 tester feedback（comment / bug 截圖），唔可以講「testers liked it」[2][3]
- 講你 fix 咗咩 bug、改咗咩 UI、tester 用過咩 feature[3]
- 解釋點 recruit 12 個 tester（咩渠道、咩 app 目標 audience）[2]

## 6. 必避嘅 5 個錯誤

1. **混淆 internal vs closed track**：internal testing 唔計入 production access（最常見 waste 14 日嘅原因）[1][2]
2. **Invite 同 opt-in 混淆**：加 email 入 tester list 唔等於 opted-in。要 tester 自己開 link 按「Become a tester」先計[2]
3. **12 個零 buffer**：有人 uninstall / opt-out 少過 12 → clock reset，要由頭計[1][2]
4. **Mid-window 換 tester**：換人唔 track 連續日數會靜靜 reset streak[2][4]
5. **用 sideloaded APK / 假 installs**：會被 Play Integrity API 抓到、production access 拒批、嚴重可 suspend account[3][4]

## 7. 你而家嘅 Next Steps（即刻做）

1. Play Console → Testing → Closed testing → Create track
2. Build opt-in link 或建 Google Group
3. WhatsApp + IG broadcast（準備定稿文案）
4. **同步 submit 至 FastTesters（$15 USD / app）做 buffer**
5. Day 0 release 推出 → 確認 12+ 人都喺 Play Console 顯示 opted-in
6. 設鬧鐘 day 3 / day 7 / day 10 跟 opt-in count

---

## Sources

[1] https://support.google.com/googleplay/android-developer/answer/14151465 — App testing requirements for new personal developer accounts (Google Play Console Help)
    > "Developers with personal accounts created after November 13, 2023, must run a closed test for their app with a minimum of 12 testers who have been opted in continuously for at least 14 days."
    > "At least 12 testers must be opted in to your closed test continuously for the preceding 14 days when you apply for production access."
    > "Testers who opt in, test for fewer than 14 days, and then opt out do not count toward the requirement. If a tester opts out and opts back in later, the 14 days must be consecutive to count toward the minimum requirement of 12 continuous opted-in testers."
[2] https://testmyapps.app/blog/google-play-closed-testing-complete-playbook-2026 — Google Play Closed Testing Complete Playbook 2026 (TestMyApps)
    > "Friends and family can work if they use genuine Google accounts and follow instructions, but social graphs often produce dropouts, wrong accounts, and low engagement."
    > "Recruit fourteen to sixteen testers before publishing the closed release."
[3] https://testerbee.com/google-play-closed-testing — Google Play Closed Testing Complete Guide 2026 (TesterBee)
    > "Google detects and rejects emulators, virtual machines, and duplicate accounts."
    > "Google Play Integrity API can distinguish between real devices and emulated environments. Accounts caught attempting to fake testing have been suspended."
[4] https://fasttesters.com/blog/google-play-closed-testing-requirements-2026 — Google Play Closed Testing Requirements 2026 (FastTesters)
    > "Relying on self-created accounts as testers."
    > "Friends & family ... Days-weeks ... $0 ... High dropout risk. Managed closed testing (e.g. Fast Testers) ... ~1 hour after valid link ... $15 one-time / app ... Low (buffer of 15)."