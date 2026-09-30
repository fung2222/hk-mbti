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
ENFP: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="8.2" r="5.8"/><polygon points="10.9,13.6 13.1,13.6 12,16.4"/><path d="M12 16.4c0 2.6 1.8 2.6 1.8 5.2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
// 守護者（實務）
ISTJ: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 6.4A2.4 2.4 0 0 1 5.4 4h3.4l2.2 2.4h7.6A2.4 2.4 0 0 1 21 8.8v8.8A2.4 2.4 0 0 1 18.6 20H5.4A2.4 2.4 0 0 1 3 17.6V6.4z"/></svg>',
ISFJ: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.4c4.6 0 8.4 3.4 8.8 7.9H3.2C3.6 5.8 7.4 2.4 12 2.4z"/><rect x="11" y="10.2" width="2" height="7.2" rx="1"/><path d="M13 17.4a2.6 2.6 0 0 1-5.2 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
ESTJ: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="2.6" y="7.4" width="18.8" height="12.6" rx="2.6"/><path d="M8.6 7.4V6a2.4 2.4 0 0 1 2.4-2.4h2a2.4 2.4 0 0 1 2.4 2.4v1.4h-2V6a.4.4 0 0 0-.4-.4h-2a.4.4 0 0 0-.4.4v1.4h-2z"/></svg>',
ESFJ: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3.4c5 0 9 2.5 9 5.6v.6c0 .7-.6 1.3-1.3 1.3H4.3C3.6 10.9 3 10.3 3 9.6v-.6c0-3.1 4-5.6 9-5.6z"/><rect x="3.4" y="12.6" width="17.2" height="3" rx="1.5"/><rect x="3.4" y="17" width="17.2" height="3" rx="1.5"/></svg>',
// 探索者（行動）
ISTP: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M15.4 2.2a5.6 5.6 0 0 0-4.9 8.3L2.6 18.4a2.1 2.1 0 0 0 3 3l7.9-7.9a5.6 5.6 0 0 0 7-7.2l-3.3 3.3-3.1-3.1 3.3-3.3a5.6 5.6 0 0 0-2-.9z"/></svg>',
ISFP: '<svg viewBox="0 0 24 24" fill="currentColor" fill-rule="evenodd" aria-hidden="true"><path d="M8.6 5h6.8l1.4 1.8H20a2 2 0 0 1 2 2v9.2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.8a2 2 0 0 1 2-2h3.2L8.6 5zm3.4 4.6a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2z"/></svg>',
ESTP: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="13.6,2 5.2,13.4 11,13.4 9.6,22 18.4,10.2 12.6,10.2"/></svg>',
ESFP: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5.6 11.2a6.4 6.4 0 0 0 12.8 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><rect x="11" y="17.6" width="2" height="3.4" rx="1"/><rect x="7.6" y="20.6" width="8.8" height="1.8" rx=".9"/></svg>'
};

// 攞 icon（字串）
window.getTypeIcon = function(code){
const m = window.TYPE_ICONS || {};
return m[code] || "";
};
// 型別大字 + icon（icon 喺字上面）
window.typeIcoHtml = function(code){
const ic = window.getTypeIcon(code);
return (ic ? '<span class="type-ico">' + ic + '</span>' : "") + '<span class="type-code-txt">' + code + '</span>';
};
