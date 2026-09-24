/* ============================================================
   📅 MERA PADHAI CALENDAR — GitHub-style year heatmap
   Har active din ek green square. Streak ka visual map.
   ============================================================ */
(function () {
    'use strict';
    var KEY = 'eduva_nzd_v1';
    function $(id) { return document.getElementById(id); }
    function getDays() {
        try { var s = JSON.parse(localStorage.getItem(KEY) || '{}'); return (s && s.days) || {}; } catch (e) { return {}; }
    }
    function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

    function renderCal() {
        var host = document.querySelector('#view-profile .grid.grid-cols-2.sm\\:grid-cols-4');
        if (!host || $('padhai-cal-card')) return;
        var days = getDays();
        var today = new Date(); today.setHours(0, 0, 0, 0);
        var WEEKS = 18, total = WEEKS * 7;
        var start = new Date(today); start.setDate(start.getDate() - (total - 1));
        // week-aligned start (Monday)
        while (start.getDay() !== 1) start.setDate(start.getDate() - 1);

        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        var html = '<div class="card-clean p-4 sm:p-5 rounded-3xl space-y-3 animate-fadeIn" id="padhai-cal-card">'
            + '<div class="flex items-center justify-between"><p class="text-sm font-black text-slate-900">📅 Mera Padhai Calendar</p>'
            + '<button onclick="window.__shareCal()" class="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black rounded-xl cursor-pointer">📤 Share</button></div>'
            + '<div style="overflow-x:auto;" class="hide-scrollbar"><div style="display:grid;grid-template-columns:repeat(' + WEEKS + ',12px);grid-auto-rows:12px;gap:3px;width:max-content;">';

        var d = new Date(start), active = 0;
        for (var i = 0; i < total; i++) {
            var key = d.toDateString();
            var done = !!days[key];
            if (done) active++;
            var isToday = key === today.toDateString();
            var bg = done ? (isToday ? '#059669' : '#34d399') : (d > today ? 'transparent' : '#e2e8f0');
            html += '<div title="' + esc(key) + (done ? ' — padhai hui ✅' : '') + '" style="width:12px;height:12px;border-radius:3px;background:' + bg + ';'
                + (isToday ? 'outline:2px solid #059669;outline-offset:1px;' : '') + '"></div>';
            d.setDate(d.getDate() + 1);
        }
        html += '</div></div>'
            + '<div class="flex items-center gap-3 text-[10px] font-bold text-slate-500">'
            + '<span>Kam</span><span style="width:10px;height:10px;border-radius:2px;background:#e2e8f0;display:inline-block;"></span>'
            + '<span style="width:10px;height:10px;border-radius:2px;background:#34d399;display:inline-block;"></span>'
            + '<span style="width:10px;height:10px;border-radius:2px;background:#059669;display:inline-block;"></span><span>Zyada</span>'
            + '<span class="ml-auto text-emerald-600">' + active + ' din active 🔥</span></div>'
            + '<p class="text-[10px] font-semibold text-slate-400">Har green square = us din padahi hui. Roz aao — poora calendar hara bhar do! 🌱</p></div>';
        host.insertAdjacentHTML('afterend', html);
    }
    window.__shareCal = function () {
        try {
            var s = JSON.parse(localStorage.getItem(KEY) || '{}');
            var streak = (s && s.streak) || 0;
            var txt = '📅 Mera EDUVA Padhai Calendar 🔥\nStreak: ' + streak + ' din — roz padhai, bina chhutti ke! 💪\nTum bhi try karo — FREE hai:\nhttps://eduva-app.vercel.app';
            window.open('https://wa.me/?text=' + encodeURIComponent(txt), '_blank');
        } catch (e) {}
    };
    function init() { try { renderCal(); } catch (e) {} setTimeout(function () { try { renderCal(); } catch (e) {} }, 2000); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
    console.log('📅 EDUVA Padhai Calendar loaded');
})();
