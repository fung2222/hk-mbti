// 16 型港物件 icon（實心 · 現代 · 24×24 · currentColor 自動跟色卡顏色）
// 2026-10-01 第一版：先做 9 個試風格（分析家 4 + 外交家 3 + 守護者 1 + 探索者 1）
// 用最簡單幾何（rect / circle / polygon / 簡單 path）—— 保證縮到 22px 都清楚
window.TYPE_ICONS = {
// 分析家（紫藍青橙）
INTJ: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="3" y="3" width="8.2" height="8.2" rx="1.6"/><rect x="12.8" y="3" width="8.2" height="8.2" rx="1.6"/><rect x="3" y="12.8" width="8.2" height="8.2" rx="1.6"/></svg>',
INTP: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 7h11v8.5A4.5 4.5 0 0 1 10.5 20h-2A4.5 4.5 0 0 1 4 15.5V7z"/><path d="M16.5 9.5H18a3 3 0 0 1 0 6h-1.5v-2H18a1 1 0 0 0 0-2h-1.5v-2z"/><rect x="3" y="21" width="13" height="1.8" rx=".9"/></svg>',
ENTJ: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="5" y="2" width="2.2" height="20" rx="1.1"/><path d="M8.6 3.6h11.2l-3.1 4.2 3.1 4.2H8.6V3.6z"/></svg>',
ENTP: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="3.2"/><polygon points="8,15.4 8,21 13.4,15.4"/></svg>',
// 外交家（紫紅紅金）
INFJ: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.4 14.6A8.8 8.8 0 1 1 9.6 3.7a7 7 0 0 0 10.8 10.9z"/></svg>',
INFP: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M4.6 6.8h11.6v8.7a4.5 4.5 0 0 1-4.5 4.5h-2.6a4.5 4.5 0 0 1-4.5-4.5V6.8zm5.8 1.9a2.7 2.7 0 1 0 0 5.4 2.7 2.7 0 0 0 0-5.4z"/><path d="M17.4 9.4h1.4a2.9 2.9 0 0 1 0 5.8h-1.4v-2h1.4a.9.9 0 0 0 0-1.8h-1.4v-2z"/><rect x="3.4" y="20.6" width="12.6" height="1.8" rx=".9"/></svg>',
ENFJ: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21.2S2.8 15.4 2.8 9.9A4.9 4.9 0 0 1 12 7.1a4.9 4.9 0 0 1 9.2 2.8c0 5.5-9.2 11.3-9.2 11.3z"/></svg>',
// 守護者（實務）
ISTJ: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 6.4A2.4 2.4 0 0 1 5.4 4h3.4l2.2 2.4h7.6A2.4 2.4 0 0 1 21 8.8v8.8A2.4 2.4 0 0 1 18.6 20H5.4A2.4 2.4 0 0 1 3 17.6V6.4z"/></svg>',
// 探索者（行動）
ESFP: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5.6 11.2a6.4 6.4 0 0 0 12.8 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><rect x="11" y="17.6" width="2" height="3.4" rx="1"/><rect x="7.6" y="20.6" width="8.8" height="1.8" rx=".9"/></svg>'
};

// 攞 icon（冇做嘅型回傳空字串 → 卡面照舊，方便對比）
window.getTypeIcon = function(code){
const m = window.TYPE_ICONS || {};
return m[code] || "";
};
