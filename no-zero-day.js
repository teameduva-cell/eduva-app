/* ============================================================
   🔥 EDUVA "CHHUTTI NAHI" SYSTEM — No Zero Day
   1. NZD Card: roz ka chhota kaam → din green ✅
   2. Streak Shield: har 7 din = 1 shield (missed day pe auto-use)
   3. Recovery Mission: 2+ din miss → 2× XP comeback
   4. Sunday = Light Day (heavy nahi, halka din)
   5. Raat 9 PM reminder (app khuli ho toh)
   ============================================================ */
(function () {
    'use strict';
    var KEY = 'eduva_nzd_v1';
    function $(id) { return document.getElementById(id); }
    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    function today() { return new Date().toDateString(); }
    function yesterday() { var d = new Date(); d.setDate(d.getDate() - 1); return d.toDateString(); }
    function dayDiff(a, b) { return Math.round((new Date(b) - new Date(a)) / 86400000); }

    function getState() {
        try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; }
    }
    function setState(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
    function blank() { return { days: {}, streak: 0, shields: 0, best: 0, lastMiss: null, xp: 0 }; }

    /* ---------- streak engine ---------- */
    function processStreak() {
        var s = getState(); if (!s.days) s = blank();
        var t = today(), y = yesterday();
        var tDone = !!s.days[t], yDone = !!s.days[y];
        var msgs = [];
        if (!tDone && !yDone && s.streak > 0) {
            var missedDays = 0, d = new Date(); d.setDate(d.getDate() - 1);
            while (!s.days[d.toDateString()] && missedDays < 30) { missedDays++; d.setDate(d.getDate() - 1); }
            if (missedDays >= 1) {
                if (s.shields > 0 && missedDays === 1) {
                    s.shields--;
                    msgs.push('🛡️ Streak Shield use hui! Streak bach gayi (' + s.streak + ' 🔥)');
                } else {
                    s.lastMiss = { days: missedDays, at: Date.now() };
                    if (missedDays >= 2) msgs.push('🎁 Recovery Mission ready! 2× XP se wapasi karo');
                    s.streak = 0;
                }
            }
        }
        // shield earn: 7 din poora
        if (tDone && s.streak > 0 && s.streak % 7 === 0 && !s.days['shield_' + t]) {
            if (s.shields < 2) { s.shields++; msgs.push('🛡️ NAYA STREAK SHIELD mila! 7 din complete 🎉'); }
            s.days['shield_' + t] = 1;
        }
        if (s.streak > (s.best || 0)) s.best = s.streak;
        setState(s);
        return msgs;
    }

    function markDone(source) {
        var s = getState(); if (!s.days) s = blank();
        var t = today();
        if (s.days[t]) return; // already done
        s.days[t] = 1;
        s.streak = (s.streak || 0) + 1;
        s.lastMiss = null;
        setState(s);
        // his streak bhi +1 (header display update)
        try {
            if (typeof userStreakCount !== 'undefined') {
                userStreakCount += 1;
                var he = $('header-streak-display');
                if (he) he.innerText = userStreakCount + ' STREAK';
            }
        } catch (e) {}
        try { if (typeof eduvaToast !== 'undefined') eduvaToast('✅ Zero-Day bacha! Streak: ' + s.streak + ' 🔥'); } catch (e) {}
        processStreak();
        renderCard();
    }
    window.__nzdDone = markDone;

    /* ---------- quick 3-sawal quiz ---------- */
    function quickQuiz() {
        var ov = document.createElement('div');
        ov.id = 'nzd-ov';
        ov.style.cssText = 'position:fixed;inset:0;background:rgba(10,15,35,.8);z-index:97;display:flex;align-items:center;justify-content:center;padding:16px;';
        ov.innerHTML = '<div style="background:#f4f6fb;width:100%;max-width:480px;max-height:84vh;border-radius:20px;overflow:hidden;display:flex;flex-direction:column;">'
            + '<div style="background:linear-gradient(135deg,#b45309,#f59e0b);color:#fff;padding:14px 16px;display:flex;align-items:center;gap:10px;">'
            + '<strong style="flex:1;font-size:16px;">⚡ Zero-Day Quiz — 3 सवाल</strong>'
            + '<button onclick="document.getElementById(\'nzd-ov\').remove()" style="background:rgba(255,255,255,.2);border:none;color:#fff;border-radius:10px;width:34px;height:34px;font-size:18px;cursor:pointer;">X</button></div>'
            + '<div id="nzd-body" style="overflow-y:auto;padding:16px;"><p style="text-align:center;color:#64748b;font-weight:700;">⏳ तीन तेज़ सवाल बन रहे हैं...</p></div></div>';
        document.body.appendChild(ov);
        var prompt = 'Class 9-10 के student के लिए 3 बहुत छोटे MCQ बनाओ (mixed Maths/Science/GA) — हर एक 2 lines: सवाल + 4 options। फिर आखिरी line: Answers: 1-x, 2-y, 3-z। हिंदी में।';
        fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: prompt }) })
            .then(function (r) { return r.json(); })
            .then(function (d) {
                var reply = (d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content) || '';
                var b = $('nzd-body');
                if (b) b.innerHTML = '<pre style="white-space:pre-wrap;font-family:inherit;font-size:14px;line-height:1.7;color:#1c2333;">' + esc(reply) + '</pre>'
                    + '<button onclick="window.__nzdDone(\'quiz\')" style="width:100%;margin-top:14px;padding:13px;background:linear-gradient(135deg,#f59e0b,#ea580c);color:#fff;border:none;border-radius:14px;font-weight:900;font-size:14px;cursor:pointer;">✅ हो गया — Din green करो!</button>';
            })
            .catch(function () {
                var b = $('nzd-body');
                if (b) b.innerHTML = '<p style="text-align:center;color:#dc2626;font-weight:700;">⚠️ नहीं बन पाया — दोबारा try करो।</p>';
            });
    }

    /* ---------- recovery mission ---------- */
    function recoveryMission(missedDays) {
        var ov = document.createElement('div');
        ov.id = 'nzd-ov';
        ov.style.cssText = 'position:fixed;inset:0;background:rgba(10,15,35,.8);z-index:97;display:flex;align-items:center;justify-content:center;padding:16px;';
        ov.innerHTML = '<div style="background:#f4f6fb;width:100%;max-width:480px;max-height:84vh;border-radius:20px;overflow:hidden;display:flex;flex-direction:column;">'
            + '<div style="background:linear-gradient(135deg,#065f46,#10b981);color:#fff;padding:14px 16px;display:flex;align-items:center;gap:10px;">'
            + '<strong style="flex:1;font-size:16px;">🎁 Recovery Mission — 2× XP!</strong>'
            + '<button onclick="document.getElementById(\'nzd-ov\').remove()" style="background:rgba(255,255,255,.2);border:none;color:#fff;border-radius:10px;width:34px;height:34px;font-size:18px;cursor:pointer;">X</button></div>'
            + '<div style="padding:16px;overflow-y:auto;">'
            + '<p style="font-size:13px;color:#334155;font-weight:700;">' + missedDays + ' din ki chhutti ho gayi thi — koi baat nahi! Aaj 3 sawal solve karo aur <b>double XP</b> jeeto:</p>'
            + '<button onclick="window.__nzdRecovery()" style="width:100%;margin-top:12px;padding:14px;background:#065f46;color:#fff;border:none;border-radius:14px;font-weight:900;font-size:14px;cursor:pointer;">⚡ शुरू करो — 3 Sawal (2× XP)</button></div></div>';
        document.body.appendChild(ov);
    }
    window.__nzdRecovery = function () {
        document.getElementById('nzd-ov').remove();
        quickQuiz();
        var old = window.__nzdDone;
        window.__nzdDone = function (src) {
            old(src);
            var s = getState(); s.xp = (s.xp || 0) + 20; setState(s);
            try { if (typeof eduvaToast !== 'undefined') eduvaToast('🎁 +20 XP (2× Recovery Bonus)!'); } catch (e) {}
        };
    };

    /* ---------- NZD card ---------- */
    function renderCard() {
        try {
            var slot = $('revision-card-slot') || $('mission-list');
            if (!slot) return;
            var old = $('nzd-card');
            if (old) old.remove();
            var s = getState(); if (!s.days) s = blank();
            var t = today();
            var done = !!s.days[t];
            var isSunday = new Date().getDay() === 0;
            var miss = s.lastMiss;

            var card = document.createElement('div');
            card.id = 'nzd-card';
            card.className = 'card-clean p-4 sm:p-5 rounded-2xl animate-fadeIn';
            card.style.cssText = done ? 'background:linear-gradient(135deg,#ecfdf5,#f0fdf4);border:2px solid #34d399;'
                                      : 'background:linear-gradient(135deg,#fff7ed,#fffbeb);border:2px solid #fbbf24;';

            var head = '<p style="font-size:10px;font-weight:900;letter-spacing:.5px;color:' + (done ? '#059669' : '#b45309') + ';">'
                + (isSunday && !done ? '🌤️ SUNDAY LIGHT DAY' : done ? '✅ ZERO-DAY BACH GAYA' : '🔥 CHHUTTI NAHI — NO ZERO DAY') + '</p>'
                + '<p style="font-size:15px;font-weight:900;color:#0f172a;margin:4px 0 2px;">'
                + (isSunday && !done ? 'Aaj heavy nahi — bas 10 min fun revision!' : done ? 'Aaj ka din green! Kal phir milते हैं 💪' : 'Sirf 5 minute — din green करो!') + '</p>'
                + '<p style="font-size:12px;font-weight:700;color:#64748b;">Streak: <b style="color:#ea580c;">' + (s.streak || 0) + ' 🔥</b> &nbsp;|&nbsp; Shields: <b style="color:#2563eb;">🛡️ ' + (s.shields || 0) + '</b> &nbsp;|&nbsp; Best: <b>' + (s.best || 0) + '</b></p>';

            var actions = '';
            if (!done) {
                actions = '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:12px;">'
                    + '<button onclick="window.__nzdQuiz()" style="padding:11px 6px;background:linear-gradient(135deg,#f59e0b,#ea580c);color:#fff;border:none;border-radius:12px;font-weight:900;font-size:11px;cursor:pointer;">⚡ 3 सवाल</button>'
                    + '<button onclick="window.__nzdDoubt()" style="padding:11px 6px;background:#0f172a;color:#fff;border:none;border-radius:12px;font-weight:900;font-size:11px;cursor:pointer;">📷 Doubt</button>'
                    + '<button onclick="window.__nzdRev()" style="padding:11px 6px;background:#065f46;color:#fff;border:none;border-radius:12px;font-weight:900;font-size:11px;cursor:pointer;">🧠 Revision</button></div>';
            }
            if (miss && !done && (miss.days || 0) >= 2) {
                actions += '<button onclick="window.__nzdRecoveryOpen()" style="width:100%;margin-top:10px;padding:12px;background:linear-gradient(135deg,#065f46,#10b981);color:#fff;border:none;border-radius:12px;font-weight:900;font-size:12px;cursor:pointer;">🎁 ' + miss.days + ' din miss hue — Recovery Mission (2× XP) se wapasi करो!</button>';
            }
            card.innerHTML = head + actions;
            slot.insertAdjacentElement('afterend', card);
        } catch (e) {}
    }
    window.__nzdQuiz = quickQuiz;
    window.__nzdDoubt = function () { try { switchTab('chat'); } catch (e) {} setTimeout(function () { markDone('doubt'); }, 30000); };
    window.__nzdRev = function () { try { if (typeof openRevision === 'function') { openRevision(); markDone('rev'); } } catch (e) {} };
    window.__nzdRecoveryOpen = function () { var s = getState(); recoveryMission((s.lastMiss && s.lastMiss.days) || 2); };

    /* ---------- activity listeners (unhi kaamo se din green) ---------- */
    document.addEventListener('click', function (e) {
        try {
            var t = e.target.closest || null;
            if (!t) return;
            if (t.closest && t.closest('#hw-submit-btn')) setTimeout(function () { markDone('hw'); }, 4000);
            if (t.closest && t.closest('[onclick*="sendDoubt"]')) setTimeout(function () { markDone('doubt'); }, 5000);
        } catch (err) {}
    }, true);

    /* ---------- 9 PM reminder ---------- */
    function reminder() {
        try {
            var s = getState(); if (!s.days) s = blank();
            if (s.days[today()]) return;
            var now = new Date();
            if (now.getHours() !== 21) return;
            var k = 'nzd_rem_' + today();
            if (localStorage.getItem(k)) return;
            localStorage.setItem(k, '1');
            var body = '🔥 Streak bachane ke ' + (60 - now.getMinutes()) + ' min bache — aaj ka 5-min kaam kar lo!';
            if ('serviceWorker' in navigator && Notification.permission === 'granted') {
                navigator.serviceWorker.ready.then(function (r) { r.showNotification('🔥 EDUVA — Chhutti Nahi!', { body: body, icon: '/icon-192.png' }); }).catch(function () {});
            }
            try { if (typeof eduvaToast !== 'undefined') eduvaToast(body); } catch (e) {}
        } catch (e) {}
    }

    function init() {
        try {
            var msgs = processStreak();
            msgs.forEach(function (m) { try { if (typeof eduvaToast !== 'undefined') eduvaToast(m); } catch (e) {} });
            renderCard();
            setInterval(function () { try { reminder(); } catch (e) {} }, 60000);
            setInterval(function () { try { renderCard(); } catch (e) {} }, 120000);
        } catch (e) {}
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
    console.log('🔥 EDUVA Chhutti-Nahi (No Zero Day) loaded');
})();
