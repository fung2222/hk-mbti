// 4 個維度 + 8 個字母解釋（每個 600-800 字）
window.LETTERS = {
  E: {
    letter:"E", title:"外向 Extraverted", color:"#E89A6B", light:"#FFF0E5",
    short:"由外在世界獲得能量",
    desc:`E 人（外向型）嘅能量來源係「外面嘅人」。佢哋透過同其他人互動、傾偈、表達自己嚟充電。獨處時間耐咗會覺得悶、冇電、想搵人傾偈。

港式 E 人日常：
- 放工 / 放學一定要約人飲嘢，唔飲嘢會覺得成日冇做過咩
- 開會 / 上堂坐前排，最鍾意舉手答問題
- WhatsApp 已讀即覆，最怕 missed call
- 行入 lift 會主動同鄰居講早晨
- 唱 K 霸住 Mic，party 完走最後

E 人嘅盲點：
- 成日靠外在刺激充電，忽略內在反思
- 講多過諗，可能會講錯嘢
- 唔識享受獨處時間

E 人香港名人參考：
- 蕭若元（蕭生）— 電台節目可以講 4 個鐘
- YouTube 嗰啲 KOL 大多 E 型
- 補習天王全部 E`,
    strength:["容易識朋友","表達能力強","充滿活力","帶動氣氛"],
    weakness:["講嘢太快可能得罪人","需要外在肯定","有時忽視自己感受","好難獨處"],
    career:["Sales","Marketing","老師","公關","主持"],
    friends:["I 人嘅好朋友","E 人之間可以做玩伴"]
  },
  I: {
    letter:"I", title:"內向 Introverted", color:"#7A6CA0", light:"#F0EDF7",
    short:"由內在世界獲得能量",
    desc:`I 人（內向型）嘅能量來源係「自己入面」。佢哋透過獨處、反思、深度思考嚟充電。人群聚集時間耐咗會覺得累，想返屋企自己 chill。

港式 I 人日常：
- 放工 / 放學想返屋企煲劇打機，唔想 social
- WhatsApp 已讀但過幾個鐘先覆，或者 set 靜音
- 開會坐後排，永遠唔舉手
- 唱 K 坐角，或者唔去
- 搭港鐵戴住耳機，扮聽唔到周圍傾偈

I 人嘅盲點：
- 太內向可能錯失 networking 機會
- 有嘢唔講出嚟，人哋唔知你點諗
- 太少曝光可能影響 career 升遷

I 人香港名人參考：
- 林夕 — 寫詞為主
- 王家衛 — 慢工出細貨
- 黃子華棟篤笑有 E 也有 I，但私下 I`,
    strength:["深度思考","專注","自我覺察強","獨立"],
    weakness:["難以主動 social","容易被誤會高冷","network 機會少","壓力無處宣洩"],
    career:["研究","寫作","Programmer","設計師","會計"],
    friends:["E 人嘅好朋友","I 人之間可以深度交流"]
  },
  S: {
    letter:"S", title:"實感 Observant", color:"#7A8F5A", light:"#F0F5E5",
    short:"重視具體事實與當下",
    desc:`S 人（實感型）注重「實際」與「具體」。佢哋相信眼見為實，喜歡實際經驗多過抽象理論。務實、實事求是、做嘢有步驟。

港式 S 人日常：
- 揀餐廳先睇食評分數，唔會試太新
- 旅行做晒 Excel，行程精確到分鐘
- 買嘢前做足 research
- 溫習用 past paper 重複操
- 寫文先列大綱

S 人嘅盲點：
- 太著重現實，可能忽略可能性
- 抗拒改變，要安穩感
- 創意可能受限制

S 人香港名人參考：
- 李嘉誠（傳統實業派）
- 大多數紀律部隊`,
    strength:["務實","可靠","細節強","執行力強"],
    weakness:["抗拒改變","過於保守","創意有限","容易忽略長遠"],
    career:["會計","工程","醫療","法律","公務員"],
    friends:["N 人可以帶你探索新可能"]
  },
  N: {
    letter:"N", title:"直覺 Intuitive", color:"#A86B7C", light:"#F7EDF1",
    short:"重視模式與可能性",
    desc:`N 人（直覺型）注重「可能性」與「未來」。佢哋成日諗將來、睇到別人睇唔到嘅 pattern。抽象思維強，但有時會被覺得「離地」。

港式 N 人日常：
- 旅行只 book 機票酒店，去到再算
- 成日有新 idea，但好少實行
- 讀書睇 concept 多過操 past paper
- 寫 essay 風格抽象，老師可能會問「你寫咩」
- 睇科幻 / 魔幻電影多過寫實

N 人嘅盲點：
- 唔落地，眼高手低
- 忽略細節
- 好 idea 難以實行

N 人香港名人參考：
- 林夕（抽象詩詞）
- 倪匡（科幻小說）`,
    strength:["創意強","全局觀","有遠見","善於比喻"],
    weakness:["離地","唔理細節","難執行","易放棄"],
    career:["創意","策略","研究","藝術","Startup"],
    friends:["S 人可以幫你落地"]
  },
  T: {
    letter:"T", title:"思考 Thinking", color:"#3A4F6B", light:"#EBEFF5",
    short:"以邏輯與原則作決策",
    desc:`T 人（思考型）做決定用「邏輯」同「原則」。佢哋客觀分析利弊，唔會因為感情用事。朋友覺得佢哋「冷靜」、「理性」，但有時會被話「無情」。

港式 T 人日常：
- 朋友失戀先問「佢做錯咩」
- 揀工用 ROI 分析
- 同朋友拗撬講道理，唔講感情
- 扮睇唔到女朋友喊，等佢自己冷靜
- 揀餐廳用「性價比」分析

T 人嘅盲點：
- 傷害人哋而不自知
- 過於冷冰
- 唔識表達感情

T 人香港名人參考：
- 梁特首（技術官僚）`,
    strength:["邏輯強","客觀","分析力強","公平"],
    weakness:["傷感情","冷漠","過度批判","難表達感受"],
    career:["工程","法律","醫生","分析師","管理"],
    friends:["F 人教你感受世界"]
  },
  F: {
    letter:"F", title:"情感 Feeling", color:"#C8786B", light:"#F7EBE8",
    short:"以價值觀與情感作決策",
    desc:`F 人（情感型）做決定用「感覺」同「價值觀」。佢哋重視人際和諧，會考慮對方感受。朋友覺得佢哋「暖」、「貼心」，但有時會被話「唔理性」。

港式 F 人日常：
- 朋友失戀第一時間陪佢
- 揀工睇下同事夾唔夾
- 同朋友拗撬會體諒對方
- 朋友著件衫好核突都話 OK
- 睇戲會喊（不論劇情幾爛）

F 人嘅盲點：
- 過於在意別人評價
- 委屈自己
- 難以做艱難決定

F 人香港名人參考：
- 香港女性大多 F（+15.1%）`,
    strength:["同理心","體貼","重視和諧","善於聆聽"],
    weakness:["過度敏感","難做艱難決定","太在意別人","委屈自己"],
    career:["輔導","教育","社工","HR","藝術"],
    friends:["T 人教你分析"]
  },
  J: {
    letter:"J", title:"判斷 Judging", color:"#6B5A8A", light:"#EFEBF5",
    short:"喜歡有計劃有結構",
    desc:`J 人（判斷型）喜歡「有計劃」、「有結構」。佢哋做嘢有系統、deadline 前一定做完。房間企理、行程確定。朋友覺得佢哋「可靠」、「穩陣」。

港式 J 人日常：
- 旅行 Excel 排晒
- To-do list 長過 30 條
- Deadline 前 3 日已經做完
- 房間企理，嘢都擺好
- 銀行儲蓄 App 記賬

J 人嘅盲點：
- 太僵硬
- 抗拒 spontaneity
- Plan 太多反應唔到變化

J 人香港名人參考：
- 紀律部隊
- 校長、老師`,
    strength:["計劃強","可靠","有條理","自律"],
    weakness:["僵硬","抗拒改變","完美主義","容易焦慮"],
    career:["管理","律師","會計","公務員","Project Manager"],
    friends:["P 人教你 chill"]
  },
  P: {
    letter:"P", title:"感知 Prospecting", color:"#A86B5A", light:"#F7EDE5",
    short:"喜歡彈性與即興",
    desc:`P 人（感知型）喜歡「彈性」、「即興」。佢哋做嘢靈活，最後一秒先衝刺。房間可能亂，但「自己先至唔亂」。朋友覺得佢哋「chill」、「free」。

港式 P 人日常：
- 旅行 last minute book
- To-do list 唔存在
- Deadline 最後 1 小時衝刺
- 房間「有自己嘅秩序」
- 錢有就儲冇就算

P 人嘅盲點：
- 拖延
- 容易錯失 deadline
- 缺乏長期規劃
- 容易散漫

P 人香港名人參考：
- 自由工作者
- 藝術家`,
    strength:["靈活","即興","適應力強","開心"],
    weakness:["拖延","散漫","難以做長線","容易錯 deadline"],
    career:["創意","自由業","Sales","Startup","設計"],
    friends:["J 人教你 plan"]
  }
};

// 16 種性格完整百科
window.TYPES_FULL = {
  "INTJ": {
    full:`INTJ（建築師 / Architect）係 16 種人格中最稀有嘅之一，佔全球人口約 2%。佢哋結合內省、直覺、思考同判斷，係天生的策略家同系統設計師。

**核心特質**
- 腦入面成日有 long-term 計劃（5 年 / 10 年）
- 獨立思考，唔受主流影響
- 高標準，對自己同人都要求高
- 重視知識同能力多過 social status

**強項**
- 戰略思維
- 獨立完成 complex project
- 識睇到大局
- 高效決策

**弱項**
- 被覺得 arrogant
- 社交場合笨拙
- 完美主義
- 唔識表達感情

**戀愛**
- 慢熱，但一旦投入就 long-term
- 揀對手要 intelligent + independent
- 最佳配對：ENFP、ENTP（互補型）

**工作**
- 適合：Strategy、Architecture、Engineering、Investment、Law、Scientist
- 避免：Routine、Customer Service、純社交
- 工作風格：Quiet but productive，自己一個完成 complex task

**友情**
- 朋友唔多但 deep
- 鍾意 deep conversation 多過 chit chat
- 同 NP 配最夾

**衝突處理**
- 直接講解決方法
- 不耐煩 emotional drama
- 有時太冷`,
    strength:["戰略思維","獨立","高標準","系統思考","long-term 規劃"],
    weakness:["arrogant","社交笨拙","完美主義","冷漠","情緒表達弱"],
    love:["慢熱","deep connection","要 intelligent partner","需要 personal space"],
    work:["Strategy","Architecture","Engineering","Investment","Law","Scientist"],
    conflict:["直接講","不耐煩 drama","太冷","要 space 反思"]
  },
  "INTP": {
    full:`INTP（邏輯學家 / Logician）佔全球人口約 3-5%，係 16 種中最「腦入面」嘅人。佢哋成日思考抽象概念、理論、可能性。

**核心特質**
- 內向思考，腦入面有 100 個 idea 同時
- 對理論、概念、邏輯有強烈興趣
- 唔鍾意 routine
- 對人唔敏感但對 system 敏感

**強項**
- 抽象思考
- 創意
- 分析力
- 原創 idea

**弱項**
- 拖延
- 難以 execute
- 社交差
- 對細節冇耐性

**戀愛**
- 揀對手要 intellectual
- 唔會主動表達愛意
- 最佳配對：ENTJ、ENFJ

**工作**
- 適合：Research、Programming、Philosophy、Writing、Academic
- 避免：Sales、Management
- 工作風格：獨立 deep work，討厭 meeting

**友情**
- 少數 deep friend
- 鍾意 discuss idea
- 同 NP 配最夾

**衝突處理**
- 會 retreat
- 唔想 conflict
- 內化情緒`,
    strength:["抽象思維","創意","獨立","分析力強","logic"],
    weakness:["拖延","難 execute","社交差","過度分析","routine 抗拒"],
    love:["intellectual connection","不主動","需要 space","慢熱"],
    work:["Research","Programming","Philosophy","Writing","Academic"],
    conflict:["retreat","內化","避免 confront","需要時間"]
  },
  "ENTJ": {
    full:`ENTJ（指揮官 / Commander）佔全球人口約 2-3%，係天生嘅領袖。佢哋外向、思考、果斷、有系統，係 16 種中最愛指揮嘅人。

**核心特質**
- 領導者
- 講嘢直接
- 重視效率
- 對人要求高

**強項**
- 決策力
- 組織能力
- 策略思考
- 帶動團隊

**弱項**
- arrogant
- 不耐煩
- 太 dominant
- 忽略感情

**戀愛**
- 主動出擊
- 揀對手要 smart
- 最佳配對：INFP、INTP

**工作**
- 適合：CEO、Management、Law、Consulting、Investment
- 避免：Routine、Support
- 工作風格：Decisive，愛做決策

**友情**
- 一班追隨者但 deep friend 唔多
- 鍾意 lead project
- 同 NP 配最夾

**衝突處理**
- 直接 confront
- 要贏
- 不妥協`,
    strength:["決策力","領導","策略","自信","efficient"],
    weakness:["arrogant","不耐煩","dominant","impatient","冷漠"],
    love:["主動","要求 partner strong","長遠關係","supportive"],
    work:["CEO","Management","Law","Consulting","Investment"],
    conflict:["直接 confront","要贏","不妥協","aggressive"]
  },
  "ENTP": {
    full:`ENTP（辯論家 / Debater）佔全球人口約 3%，係 16 種中最愛辯論嘅人。佢哋外向、直覺、思考、感知，成日 challenge status quo。

**核心特質**
- 講嘢叻，反應快
- 創意多
- 唔鍾意 routine
- 愛 challenge 別人

**強項**
- 辯論
- 創意
- Quick thinking
- Networking

**弱項**
- 不專注
- 容易挑釁
- 難以 finish project
- routine 抗拒

**戀愛**
- 風趣幽默
- 揀對手要 smart 同 open-minded
- 最佳配對：INFJ、INTJ

**工作**
- 適合：Startup、Marketing、Law、Consulting、Sales
- 避免：Routine、Detail work
- 工作風格：Big picture，愛 brainstorm

**友情**
- 多朋友
- 鍾意 discuss idea
- 同 NJ 配最夾

**衝突處理**
- 當辯論
- 不讓步
- 用 logic 攻`,
    strength:["辯論","創意","quick thinking","charismatic","network"],
    weakness:["不專注","挑釁","難 finish","arrogant","routine 抗拒"],
    love:["humor","intellectual","open-minded","需要 mental stimulation"],
    work:["Startup","Marketing","Law","Consulting","Sales","創意"],
    conflict:["辯論","不讓步","用 logic 攻","喜歡"]
  },
  "INFJ": {
    full:`INFJ（提倡者 / Advocate）佔全球人口約 1-2%，係 16 種中最罕見嘅。佢哋內向、直覺、情感、判斷，係天生的理想主義者。

**核心特質**
- 重視意義同價值
- 同理心強
- 內外反差大
- 完美主義

**強項**
- 同理心
- Insight
- 創意
- 深度思考

**弱項**
- 太 sensitive
- 自我懷疑
- Burnout
- 過度付出

**戀愛**
- 慢熱 deep connection
- 揀對手要 deep + meaningful
- 最佳配對：ENFP、ENTP

**工作**
- 適合：Counseling、Writing、HR、Art、Non-profit
- 避免：Routine、純 Logic
- 工作風格：Quiet deep work

**友情**
- 少數 deep friend
- 聆聽者
- 同 NP 配最夾

**衝突處理**
- 內化
- Avoid conflict
- 寫日記反思`,
    strength:["同理心","insight","創意","deep thinking","vision"],
    weakness:["sensitive","self-doubt","burnout","過度付出","完美主義"],
    love:["deep connection","meaningful","慢熱","devoted"],
    work:["Counseling","Writing","HR","Art","Non-profit"],
    conflict:["內化","avoid","寫日記","需要時間"]
  },
  "INFP": {
    full:`INFP（調解員 / Mediator）佔全球人口約 4-5%，係香港最多人嘅類型（11.0%）。佢哋內向、直覺、情感、感知，係天生的理想主義者 + 情感型。

**核心特質**
- 重視內在價值
- 創意 + 感性
- 表面 chill 內心澎湃
- 完美主義

**強項**
- 同理心
- 創意
- 寫作
- 深度思考

**弱項**
- 太 sensitive
- Procrastination
- 自我懷疑
- 過度理想化

**戀愛**
- 浪漫派
- 揀對手要 deep + authentic
- 最佳配對：ENFJ、ENTJ

**工作**
- 適合：Writing、Art、Counseling、HR、Non-profit
- 避免：Routine、Pure Logic
- 工作風格：獨立 deep work

**友情**
- 少數 deep friend
- 聆聽者
- 同 NJ 配最夾

**衝突處理**
- Avoid
- 內化
- 寫日記`,
    strength:["同理心","創意","寫作","depth","idealism"],
    weakness:["sensitive","procrastination","self-doubt","過度理想化","practical 差"],
    love:["romantic","deep","authentic","devoted"],
    work:["Writing","Art","Counseling","HR","Non-profit"],
    conflict:["avoid","內化","寫日記","retreat"]
  },
  "ENFJ": {
    full:`ENFJ（主人公 / Protagonist）佔全球人口約 2-3%，係天生嘅 mentor。佢哋外向、直覺、情感、判斷，識得照顧身邊所有人。

**核心特質**
- 暖
- 重視和諧
- 識照顧人
- 領袖魅力

**強項**
- 同理心
- 領導
- 溝通
- 激勵人

**弱項**
- 過度付出
- 太在意別人
- Burnout
- Self-neglect

**戀愛**
- Devoted
- 揀對手要 appreciative
- 最佳配對：INFP、INTP

**工作**
- 適合：Teaching、HR、PR、Counseling、Management
- 避免：Pure Logic、Isolated
- 工作風格：People-oriented

**友情**
- 多朋友
- 聆聽者
- 同 NP 配最夾

**衝突處理**
- Mediator
- 化解
- Self-sacrifice`,
    strength:["同理心","領導","溝通","激勵","warm"],
    weakness:["過度付出","太在意別人","burnout","self-neglect","sensitive"],
    love:["devoted","supportive","romantic","long-term"],
    work:["Teaching","HR","PR","Counseling","Management"],
    conflict:["mediator","化解","self-sacrifice","avoid own feeling"]
  },
  "ENFP": {
    full:`ENFP（競選者 / Campaigner）佔全球人口約 6-8%，係 16 種中最外向 + 創意。佢哋外向、直覺、情感、感知，成日有新 idea + 識人。

**核心特質**
- Energy 高
- 創意
- 識人
- 唔鍾意 routine

**強項**
- 溝通
- 創意
- Empathy
- Networking

**弱項**
- 不專注
- Procrastination
- 過度樂觀
- Routine 差

**戀愛**
- 熱情
- 揀對手要 fun + open
- 最佳配對：INFJ、INTJ

**工作**
- 適合：Marketing、Sales、PR、Creative、Startup
- 避免：Routine、Detail
- 工作風格：People + 創意

**友情**
- 多朋友
- 識所有人
- 同 NJ 配最夾

**衝突處理**
- 直接
- 化解
- 不記仇`,
    strength:["溝通","創意","empathy","network","energy"],
    weakness:["不專注","procrastination","過度樂觀","routine 差","scatter"],
    love:["熱情","fun","open","romantic","需要 mental stimulation"],
    work:["Marketing","Sales","PR","Creative","Startup","Teaching"],
    conflict:["直接","化解","不記仇","用 charm"]
  },
  "ISTJ": {
    full:`ISTJ（物流師 / Logistician）佔全球人口約 11-14%，係 16 種中最穩陣。佢哋內向、實感、思考、判斷，重視責任、傳統、實際。

**核心特質**
- 可靠
- 細節強
- 重視責任
- 傳統

**強項**
- 可靠
- 細節
- 紀律
- 耐心

**弱項**
- 僵硬
- 抗拒改變
- 過度 serious
- 唔識變通

**戀愛**
- Devoted
- 揀對手要 stable
- 最佳配對：ESFP、ESTP

**工作**
- 適合：Accounting、Law、Government、Military、Engineering
- 避免：Creative、Spontaneous
- 工作風格：Routine 強

**友情**
- Deep friend 唔多
- 守信用
- 同 EP 配最夾

**衝突處理**
- 講事實
- 守原則
- 不妥協`,
    strength:["可靠","細節","紀律","耐心","忠誠"],
    weakness:["僵硬","抗拒改變","過度 serious","唔識變通","judgmental"],
    love:["devoted","stable","long-term","loyal"],
    work:["Accounting","Law","Government","Military","Engineering"],
    conflict:["講事實","守原則","不妥協","logical"]
  },
  "ISFJ": {
    full:`ISFJ（守衛者 / Defender）佔全球人口約 9-14%，係 16 種中最 caring。佢哋內向、實感、情感、判斷，重視和諧、責任、傳統。

**核心特質**
- 暖
- Caring
- 細心
- 重視和諧

**強項**
- 同理心
- 細心
- 可靠
- Loyal

**弱項**
- Over-giving
- Self-neglect
- 過度敏感
- 抗拒改變

**戀愛**
- Devoted
- 揀對手要 appreciative
- 最佳配對：ESFP、ESTP

**工作**
- 適合：HR、Nursing、Teaching、Social Work、Admin
- 避免：Pure Logic、Conflict
- 工作風格：People-oriented

**友情**
- Deep friend 唔多
- Caring
- 同 EP 配最夾

**衝突處理**
- Avoid
- 內化
- 照顧對方`,
    strength:["同理心","細心","可靠","loyal","caring"],
    weakness:["over-giving","self-neglect","sensitive","抗拒改變","過度 humble"],
    love:["devoted","caring","loyal","long-term"],
    work:["HR","Nursing","Teaching","Social Work","Admin"],
    conflict:["avoid","內化","照顧對方","self-sacrifice"]
  },
  "ESTJ": {
    full:`ESTJ（總經理 / Executive）佔全球人口約 8-12%，係天生嘅 manager。佢哋外向、實感、思考、判斷，重視秩序、傳統、效率。

**核心特質**
- Manager
- 直接
- 重視效率
- 傳統

**強項**
- 領導
- 組織
- 紀律
- 執行力

**弱項**
- 僵硬
- Judgmental
- Arrogant
- 唔識變通

**戀愛**
- Devoted
- 揀對手要 appreciative
- 最佳配對：ISFP、INFP

**工作**
- 適合：Management、Law、Military、Government、Business
- 避免：Creative、Spontaneous
- 工作風格：Decisive

**友情**
- 多朋友（追隨者）
- 可靠
- 同 FP 配最夾

**衝突處理**
- 直接
- 講道理
- 守規則`,
    strength:["領導","組織","紀律","執行力","loyal"],
    weakness:["僵硬","judgmental","arrogant","唔識變通","stubborn"],
    love:["devoted","stable","loyal","traditional"],
    work:["Management","Law","Military","Government","Business"],
    conflict:["直接","講道理","守規則","decisive"]
  },
  "ESFJ": {
    full:`ESFJ（執事 / Consul）佔全球人口約 9-13%，係天生嘅 host。佢哋外向、實感、情感、判斷，重視和諧、傳統、social connection。

**核心特質**
- 暖
- 重視和諧
- 愛 social
- Caring

**強項**
- 社交
- Empathy
- 組織
- Loyal

**弱項**
- 過度在意別人
- 敏感
- Conflict 抗拒
- Self-neglect

**戀愛**
- Devoted
- 揀對手要 appreciative
- 最佳配對：ISFP、ISTP

**工作**
- 適合：HR、PR、Sales、Teaching、Healthcare
- 避免：Isolated、Conflict
- 工作風格：People-oriented

**友情**
- 多朋友
- Caring
- 同 FP 配最夾

**衝突處理**
- Mediator
- Avoid own feeling
- 和解`,
    strength:["社交","empathy","組織","loyal","caring"],
    weakness:["過度在意別人","sensitive","conflict 抗拒","self-neglect","gossip"],
    love:["devoted","caring","social","loyal"],
    work:["HR","PR","Sales","Teaching","Healthcare","Event"],
    conflict:["mediator","avoid own feeling","和解","sacrifice"]
  },
  "ISTP": {
    full:`ISTP（鑒賞家 / Virtuoso）佔全球人口約 5-6%，係天生嘅 problem solver。佢哋內向、實感、思考、感知，重視邏輯、效率、practical。

**核心特質**
- Cool
- 實幹
- 獨立
- Problem solver

**強項**
- 分析
- 實幹
- Calm under pressure
- 獨立

**弱項**
- 冷漠
- Risk-taker
- 唔識表達
- Routine 抗拒

**戀愛**
- 慢熱
- 揀對手要 independent
- 最佳配對：ESFJ、ENFJ

**工作**
- 適合：Engineering、Programming、Mechanic、Forensic、Military
- 避免：Pure Social、Long meeting
- 工作風格：Hands-on

**友情**
- 少數 deep friend
- Cool
- 同 EP 配最夾

**衝突處理**
- Withdraw
- Logic
- Avoid emotional`,
    strength:["分析","實幹","calm","獨立","practical"],
    weakness:["冷漠","risk-taker","唔識表達","routine 抗拒","blunt"],
    love:["慢熱","independent","practical","需要 space"],
    work:["Engineering","Programming","Mechanic","Forensic","Military"],
    conflict:["withdraw","logic","avoid emotional","independent"]
  },
  "ISFP": {
    full:`ISFP（探險家 / Adventurer）佔全球人口約 8-9%，係天生嘅 artist。佢哋內向、實感、情感、感知，重視美感、價值、present。

**核心特質**
- 內斂
- 藝術
- Caring
- Live in present

**強項**
- 藝術
- 同理心
- 靈活
- Loyal

**弱項**
- 過度 sensitive
- 唔識 plan
- Conflict 抗拒
- Self-doubt

**戀愛**
- Devoted
- 揀對手要 appreciative
- 最佳配對：ESFJ、ESTJ

**工作**
- 適合：Art、Music、Design、Healthcare、Nature
- 避免：Routine、Conflict
- 工作風格：Hands-on creative

**友情**
- Deep friend 唔多
- Caring
- 同 EJ 配最夾

**衝突處理**
- Withdraw
- Avoid
- 內化`,
    strength:["藝術","empathy","靈活","loyal","aesthetic"],
    weakness:["sensitive","唔識 plan","conflict 抗拒","self-doubt","too quiet"],
    love:["devoted","caring","romantic","loyal"],
    work:["Art","Music","Design","Healthcare","Nature"],
    conflict:["withdraw","avoid","內化","quiet"]
  },
  "ESTP": {
    full:`ESTP（企業家 / Entrepreneur）佔全球人口約 4-6%，係天生嘅 doer。佢哋外向、實感、思考、感知，重視 action、present、practical。

**核心特質**
- 行動派
- Risk-taker
- 識做
- Fun

**強項**
- 行動
- Persuasion
- Realistic
- Adaptable

**弱項**
- Impatient
- Risk-taker
- 唔諗長遠
- 過度 direct

**戀愛**
- 主動
- 揀對手要 fun + open
- 最佳配對：ISFJ、ISTJ

**工作**
- 適合：Sales、Marketing、Entrepreneur、Police、Real Estate
- 避免：Routine、Isolated
- 工作風格：Action

**友情**
- 多朋友
- Fun
- 同 IJ 配最夾

**衝突處理**
- 直接 confront
- 不讓步
- 行動解決`,
    strength:["行動","persuasion","realistic","adaptable","energetic"],
    weakness:["impatient","risk-taker","唔諗長遠","過度 direct","bored easily"],
    love:["主動","fun","open","spontaneous"],
    work:["Sales","Marketing","Entrepreneur","Police","Real Estate"],
    conflict:["直接 confront","不讓步","行動解決","quick"]
  },
  "ESFP": {
    full:`ESFP（表演者 / Entertainer）佔全球人口約 6-9%，係天生嘅 performer。佢哋外向、實感、情感、感知，重視 fun、present、social。

**核心特質**
- Fun
- 愛 social
- Spontaneous
- Live in present

**強項**
- 表演
- Empathy
- 社交
- Adaptable

**弱項**
- 不專注
- 過度樂觀
- 不喜 plan
- Sensitive

**戀愛**
- 熱情
- 揀對手要 fun
- 最佳配對：ISFJ、ISTJ

**工作**
- 適合：Sales、PR、Event、Performing、Teaching
- 避免：Routine、Isolated
- 工作風格：People-oriented

**友情**
- 多朋友
- Fun
- 同 IJ 配最夾

**衝突處理**
- 直接
- 化解
- 不記仇`,
    strength:["表演","empathy","社交","adaptable","energetic"],
    weakness:["不專注","過度樂觀","不喜 plan","sensitive","scatter"],
    love:["熱情","fun","social","romantic"],
    work:["Sales","PR","Event","Performing","Teaching"],
    conflict:["直接","化解","不記仇","optimistic"]
  }
};
