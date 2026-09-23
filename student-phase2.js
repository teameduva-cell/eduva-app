/* ============================================================
   🚀 EDUVA STUDENT PHASE-2 — 3 retention features
   (1) 🎭 Golu-Bolu Mode — har AI answer ke neeche "Golu-Bolu से समझाओ"
   (2) ⚠️ Forgetting Radar — purane concepts jo bhool sakte ho
   (3) 🔗 Mock-test galat answers → rev queue (index.html mein 1-line hook)
   Self-contained — bas script tag lagao. Needs patched /api/chat (system field)
   ============================================================ */
(function () {
    'use strict';
    function $(id) { return document.getElementById(id); }
    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    function md(t) { return (window.marked && !window.DOMPurify) ? marked.parse(t) : ((window.marked && window.DOMPurify) ? DOMPurify.sanitize(marked.parse(t)) : esc(t)); }

    async function eduvaAsk(message, system) {
        var body = { message: message };
        if (system) body.system = system;
        var res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (!res.ok) throw new Error('API ' + res.status);
        var d = await res.json();
        var r = (d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content) || '';
        if (!r) throw new Error('खाली जवाब');
        return r.trim();
    }

    function getUQ() {
        try { if (typeof lastUserQuestion !== 'undefined' && lastUserQuestion) return String(lastUserQuestion); } catch (e) {}
        try { var el = document.getElementById('chat-input'); if (el && el.value) return el.value; } catch (e) {}
        return '';
    }

    /* ================= (1) GOLU-BOLU MODE ================= */
    var GB_SYSTEM = [
        'तुम Golu और Bolu हो — EDUVA के mascot दोस्त (Class 6-12 के बच्चों के दोस्त जैसे)।',
        'काम: नीचे दिए गए concept/sवाल को बच्चे को Golu-Bolu के मज़ेदार dialogue से समझाना।',
        '',
        'FORMAT (ठीक इस तरह, 3 rounds):',
        '🟤 Golu: (एक मज़ेदार गलतफहमी या उल्टा सवाल — जैसे बच्चे सच में सोचते हैं, 1-2 lines) 😂',
        '🟣 Bolu: (Golu की गलतफहमी को प्यार से तोड़ते हुए SAHI + आसान जवाब, छोटा रोज़मर्रा example, 2-3 lines) 💡',
        '',
        'नियम:',
        '- हिंदी में, दोस्तों जैसी बातचीत — पर पढ़ाई 100% सही होनी चाहिए।',
        '- कोईheading/formatting नहीं — सिर्फ Golu और Bolu के lines।',
        '- अंत में एक छोटी सी line: "✏️ अब तुम बताओ:" + एक छोटा practice सवाल।'
    ].join('\n');

    function gbButton() {
        var b = document.createElement('button');
        b.className = 'gb-btn mt-1.5 px-3 py-1.5 rounded-full text-[11px] font-black bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm hover:scale-105 transition cursor-pointer inline-flex items-center gap-1';
        b.innerHTML = '🎭 Golu-Bolu से समझाओ';
        b.onclick = function () { runGoluBolu(b); };
        return b;
    }

    async function runGoluBolu(btn) {
        var q = getUQ().trim();
        if (!q) { alert('पहले कोई सवाल पूछो, फिर Golu-Bolu समझाएंगे! 😄'); return; }
        btn.disabled = true; btn.innerHTML = '⏳ Golu-Bolu आ रहे हैं...';
        try {
            var reply = await eduvaAsk('Concept समझाना है: ' + q.slice(0, 400), GB_SYSTEM);
            var box = $('chat-messages');
            if (box) {
                var div = document.createElement('div');
                div.className = 'flex items-start space-x-3 max-w-2xl animate-fadeIn';
                div.innerHTML = '<div class="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-black text-[10px] shrink-0">G·B</div>' +
                    '<div class="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 p-4 rounded-2xl rounded-tl-md text-sm sm:text-base text-slate-800 leading-relaxed chat-bubble" style="min-width:0">' + md(reply) + '</div>';
                box.appendChild(div);
                box.scrollTop = box.scrollHeight;
            }
        } catch (e) {
            alert('⚠️ Golu-Bolu नहीं आ पाए (' + e.message + ') — दोबारा try करो।');
        }
        btn.disabled = false; btn.innerHTML = '🎭 Golu-Bolu से समझाओ';
    }

    // Har naye AI bubble ke neeche button lagao
    function attachGB() {
        var box = $('chat-messages');
        if (!box) return;
        var kids = box.children;
        if (!kids.length) return;
        var uq = getUQ().slice(0, 25);
        for (var i = kids.length - 1; i >= 0 && i >= kids.length - 2; i--) {
            var last = kids[i];
            if (!last.querySelector) continue;
            if (last.querySelector('.gb-btn')) continue;
            var txt = (last.textContent || '').trim();
            if (txt.length > 80 && !(uq && txt.indexOf(uq) !== -1)) {
                var target = last.querySelector('.chat-bubble') || last;
                if (target.querySelector('.gb-btn')) continue;
                try { target.appendChild(gbButton()); } catch (e) {}
            }
        }
    }
    var gbObs = null;
    function startGBObserver() {
        var box = $('chat-messages');
        if (!box || gbObs) { attachGB(); return; }
        gbObs = new MutationObserver(function () { setTimeout(attachGB, 300); });
        gbObs.observe(box, { childList: true });
    }

    /* ================= (2) FORGETTING RADAR ================= */
    var REVIEWED_KEY = 'eduva_forget_reviewed_v1';
    function getReviewed() { try { return JSON.parse(localStorage.getItem(REVIEWED_KEY) || '[]'); } catch (e) { return []; } }
    function markReviewed(concept) {
        var r = getReviewed(); r.unshift({ c: concept, t: Date.now() });
        try { localStorage.setItem(REVIEWED_KEY, JSON.stringify(r.slice(0, 100))); } catch (e) {}
    }

    function staleConcepts() {
        var out = [];
        var now = Date.now();
        var WEEK = 7 * 86400000;
        var reviewed = getReviewed();
        var revQ = [];
        try { revQ = JSON.parse(localStorage.getItem('eduva_rev_q') || '[]'); } catch (e) {}
        // 1) Purane doubt diary entries (jo rev queue mein NAHI hain)
        try {
            var diary = JSON.parse(localStorage.getItem('eduva_doubt_diary_v1') || '[]');
            diary.forEach(function (x) {
                if (!x.t || now - x.t < WEEK) return;
                var concept = String(x.q || '').slice(0, 60);
                if (!concept) return;
                if (revQ.some(function (r) { return r.q && concept.indexOf(r.q.slice(0, 25)) !== -1; })) return;
                if (reviewed.some(function (r) { return r.c === concept && now - r.t < 3 * 86400000; })) return;
                if (out.some(function (o) { return o.c === concept; })) return;
                out.push({ c: concept, src: 'Doubt Diary' });
            });
        } catch (e) {}
        return out.slice(0, 3);
    }

    function modal(html) {
        closeModal();
        var o = document.createElement('div');
        o.id = 'eduva-p2-overlay';
        o.style.cssText = 'position:fixed;inset:0;background:rgba(10,15,35,.75);z-index:96;display:flex;align-items:center;justify-content:center;padding:16px;';
        o.innerHTML = '<div style="background:#f4f6fb;width:100%;max-width:560px;max-height:82vh;border-radius:18px;overflow:hidden;display:flex;flex-direction:column;">' + html + '</div>';
        o.addEventListener('click', function (e) { if (e.target === o) closeModal(); });
        document.body.appendChild(o);
    }
    window.closeModal = function () {
        ['eduva-p2-overlay', 'eduva-modal-overlay'].forEach(function (id) { var o = $(id); if (o) o.remove(); });
    };

    function radarRevise(concept) {
        modal('<div style="background:linear-gradient(135deg,#7c2d12,#c2410c);color:#fff;padding:14px 16px;display:flex;align-items:center;gap:10px;">' +
            '<strong style="font-size:16px;flex:1;">⏱️ 5-Minute Revise</strong>' +
            '<button onclick="closeModal()" style="background:rgba(255,255,255,.2);border:none;color:#fff;border-radius:10px;width:34px;height:34px;font-size:18px;cursor:pointer;">X</button></div>' +
            '<div id="p2-rev-body" style="overflow-y:auto;padding:14px;"><p style="text-align:center;color:#64748b;font-weight:700;">⏳ Edu Sir recap बना रहे हैं...</p></div>');
        eduvaAsk(
            'बच्चे ने ये concept पहले पूछा था पर 7+ दिन से revise नहीं किया: "' + concept + '"।\n' +
            'एक छोटा 5-minute revision बनाओ:\n1) 📌 Concept recap (3 bullet points, आसान भाषा)\n2) 🧠 3 quick MCQ (options के साथ, answers आखिर में)\n3) 💡 1 याद रखने वाली trick\nहिंदी में, छोटा और crisp।',
            null
        ).then(function (reply) {
            var b = $('p2-rev-body');
            if (b) b.innerHTML = '<div class="chat-bubble text-sm text-slate-800 leading-relaxed whitespace-pre-line">' + md(reply) +
                '</div><button onclick="window.__p2done && window.__p2done()" style="margin-top:12px;width:100%;padding:12px;background:#c2410c;color:#fff;border:none;border-radius:12px;font-weight:800;font-size:14px;cursor:pointer;">✅ हो गया — हटाओ इसे list से</button>';
        }).catch(function (e) {
            var b = $('p2-rev-body');
            if (b) b.innerHTML = '<p style="text-align:center;color:#dc2626;font-weight:700;">⚠️ नहीं बन पाया — दोबारा try करो।</p>';
        });
        window.__p2concept = concept;
        window.__p2done = function () { markReviewed(concept); closeModal(); renderRadar(true); };
    }

    function renderRadar(force) {
        var slot = $('revision-card-slot');
        if (!slot) return;
        var old = $('forget-radar-card');
        if (old) old.remove();
        var stale = staleConcepts();
        if (!stale.length && !force) return;
        var card = document.createElement('div');
        card.id = 'forget-radar-card';
        card.className = 'card-clean p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-50 to-orange-50 border-2 border-rose-200 space-y-2.5 animate-fadeIn';
        var rows = stale.length ? stale.map(function (s, i) {
            return '<div class="flex items-center gap-2.5 bg-white rounded-xl border border-rose-100 p-3">' +
                '<span class="text-lg">⚠️</span>' +
                '<span class="flex-1 text-xs sm:text-sm font-bold text-slate-800 truncate">' + esc(s.c) + '</span>' +
                '<button onclick=\'window.__radarRevise(' + JSON.stringify(s.c).replace(/'/g, "&#39;") + ')\' class="px-3 py-1.5 bg-rose-600 text-white text-[10px] font-black rounded-lg cursor-pointer shrink-0 hover:bg-rose-700 transition">Revise करो</button></div>';
        }).join('') : '<p class="text-xs font-bold text-emerald-700 text-center py-2">🎉 सब fresh है — कुछ भूलने वाला नहीं!</p>';
        card.innerHTML = '<p class="text-[10px] font-black text-rose-500 uppercase tracking-wider">🧠 EDUVA को पता है — तुम क्या भूल सकते हो</p>' + rows;
        slot.insertAdjacentElement('afterend', card);
    }
    window.__radarRevise = radarRevise;

    /* ================= INIT ================= */
    function init() {
        startGBObserver();
        renderRadar(false);
        // rev queue badalne pe radar refresh
        var _s = Object.getOwnPropertyDescriptor(Storage.prototype, 'localStorage');
        setInterval(function () { renderRadar(false); }, 60000);
        setInterval(attachGB, 2500);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

    console.log('🚀 EDUVA Phase-2 loaded (Golu-Bolu + Forgetting Radar)');
})();
