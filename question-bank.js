/* ============================================================
   🗂️ EDUVA 1 LAKH+ QUESTION BANK — class → subject → topic → sets
   AI on-demand generation (unlimited fresh questions + solutions)
   ============================================================ */
(function () {
    'use strict';
    var KEY = 'eduva_qbank_v1';
    function $(id) { return document.getElementById(id); }
    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    function getS() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } }
    function setS(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
    var cls = '10', subj = 'Mathematics', topic = null, level = 'moderate', setNo = 0, busy = false;

    var LEVELS = { easy: 'EASY — basic concepts', moderate: 'MODERATE — board level', hard: 'HARD — Olympiad/JEE-NEET level' };

    function totalExplored() {
        var s = getS(); var t = 0;
        Object.keys(s.chapters || {}).forEach(function (k) { t += s.chapters[k].n || 0; });
        return t;
    }
    function chapterKey() { return cls + '|' + subj + '|' + topic; }

    function renderBank() {
        var host = $('qb-host'); if (!host) return;
        var topics = (window.PG_TOPICS_BI && window.PG_TOPICS_BI[cls] && window.PG_TOPICS_BI[cls][subj]) || [['Full syllabus', 'Full syllabus']];
        var s = getS();
        host.innerHTML =
            '<div class="card-clean p-4 sm:p-5 rounded-3xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 space-y-3">'
            + '<p class="text-[10px] font-black text-amber-600 uppercase tracking-widest">🗂️ 1 Lakh+ Question Bank — har chapter, unlimited fresh sets</p>'
            + '<p class="text-sm font-black text-slate-900">Tumne ab tak <span class="text-amber-600">' + totalExplored().toLocaleString('en-IN') + '</span> questions explore kiye • Har "Set lao" = 10 naye questions + solutions</p>'
            + '<div class="grid grid-cols-4 sm:grid-cols-7 gap-1.5">'
            + [6, 7, 8, 9, 10, 11, 12].map(function (c) {
                return '<button onclick="window.__qbClass(' + c + ')" class="py-2 rounded-xl text-xs font-black cursor-pointer transition ' + (String(c) === cls ? 'ink-navy text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-amber-400') + '">' + c + '</button>';
            }).join('') + '</div>'
            + '<select id="qb-subj" onchange="window.__qbSubj(this.value)" class="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none">'
            + Object.keys(window.PG_TOPICS_BI[cls]).map(function (sj) {
                return '<option ' + (sj === subj ? 'selected' : '') + '>' + sj + '</option>';
            }).join('') + '</select>'
            + '<div class="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto hide-scrollbar py-1">'
            + topics.map(function (t) {
                var nm = t[1] || t[0];
                var done = s.chapters && s.chapters[cls + '|' + subj + '|' + nm] ? s.chapters[cls + '|' + subj + '|' + nm].n : 0;
                return '<button onclick="window.__qbTopic(\'' + String(nm).replace(/'/g, '') + '\')" class="px-2.5 py-1.5 rounded-full text-[10px] font-black border-2 transition cursor-pointer ' + (topic === nm ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-slate-600 border-slate-200 hover:border-amber-400') + '">' + nm + (done ? ' <span class="opacity-70">•' + done + '</span>' : '') + '</button>';
            }).join('') + '</div>'
            + '<div class="grid grid-cols-3 gap-2">'
            + Object.keys(LEVELS).map(function (l) {
                return '<button onclick="window.__qbLevel(\'' + l + '\')" class="py-2 rounded-xl text-[11px] font-black cursor-pointer border-2 ' + (level === l ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-slate-600 border-slate-200') + '">' + l.toUpperCase() + '</button>';
            }).join('') + '</div>'
            + '<button onclick="window.__qbLoad()" id="qb-load" class="w-full py-3.5 rounded-2xl font-black text-sm text-white cursor-pointer transition ' + (topic ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600' : 'bg-slate-300 cursor-not-allowed') + '">'
            + (topic ? '🎯 Set ' + (setNo + 1) + ' lao — 10 Questions + Solutions' : '👆 Pehle ek topic select karo') + '</button>'
            + '<p id="qb-status" class="text-xs font-bold text-center min-h-[16px]"></p>'
            + '<div id="qb-result" class="space-y-2"></div>'
            + '</div>';
    }
    window.__qbClass = function (c) { cls = String(c); subj = Object.keys(window.PG_TOPICS_BI[cls])[0]; topic = null; setNo = 0; clearRes(); renderBank(); };
    window.__qbSubj = function (s2) { subj = s2; topic = null; setNo = 0; clearRes(); renderBank(); };
    window.__qbTopic = function (t) { topic = t; setNo = 0; clearRes(); renderBank(); };
    window.__qbLevel = function (l) { level = l; clearRes(); renderBank(); };
    function clearRes() { var r = $('qb-result'), st = $('qb-status'); if (r) r.innerHTML = ''; if (st) st.textContent = ''; }

    window.__qbLoad = async function () {
        if (!topic || busy) return;
        busy = true;
        var btn = $('qb-load'), st = $('qb-status');
        btn.textContent = '⏳ ' + topic + ' ke 10 naye questions ban rahe hain... 20-40 sec';
        st.textContent = '';
        try {
            var prompt = 'Class ' + cls + ' • ' + subj + ' • Topic: ' + topic + ' • Difficulty: ' + LEVELS[level] + '.\n'
                + '10 PRACTICE QUESTIONS banao is topic par — MIX of MCQ (4 options) aur short-answer. Har question ORIGINAL ho (kisi book se copy nahi).\n'
                + 'Format (Hindi में):\nQ1. <sawal>\n(a)... (b)... (c)... (d)...\n...\nQ10. ...\n'
                + 'फिर अंत में:\n--- SOLUTIONS ---\nQ1. <answer + 1-2 line explanation>\n...Q10...\n'
                + 'नियम: हर सवाल 100% सही हो। Answer key section में सिर्फ छोटे answers। Set #' + (setNo + 1) + ' (पिछले sets से अलग questions)';
            var res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: prompt }) });
            if (!res.ok) throw new Error('API ' + res.status);
            var d = await res.json();
            var reply = (d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content) || '';
            if (!reply) throw new Error('खाली');
            setNo++;
            var s = getS(); s.chapters = s.chapters || {}; s.chapters[chapterKey()] = s.chapters[chapterKey()] || { n: 0 };
            s.chapters[chapterKey()].n += 10; setS(s);
            if (typeof window.__nzdDone === 'function') { try { window.__nzdDone('qbank'); } catch (e) {} }
            var r = $('qb-result');
            if (r) r.innerHTML = '<div class="p-4 bg-white border border-slate-200 rounded-2xl text-sm text-slate-800 whitespace-pre-wrap leading-relaxed max-h-[55vh] overflow-y-auto hide-scrollbar">' + esc(reply) + '</div>'
                + '<button onclick="window.__qbLoad()" class="w-full mt-2 py-3 rounded-2xl bg-slate-900 text-white font-black text-xs cursor-pointer">🔄 Agle 10 questions (Set ' + (setNo + 1) + ') — roz naye!</button>';
            st.textContent = '✅ Set ' + setNo + ' ready! Total explored: ' + totalExplored().toLocaleString('en-IN');
            renderBank();
            var st2 = $('qb-status'); if (st2) st2.textContent = '✅ Set ' + setNo + ' ready!';
        } catch (e) {
            st.textContent = '⚠️ ' + e.message + ' — दोबारा दबाओ।';
        }
        busy = false;
        var b2 = $('qb-load'); if (b2) b2.textContent = topic ? '🎯 Set ' + (setNo + 1) + ' lao — 10 Questions + Solutions' : '👆 Pehle ek topic select karo';
    };

    function inject() {
        // host: Question Bank view ke top pe
        var vq = document.getElementById('view-qbank');
        if (vq && !document.getElementById('qb-host')) {
            var host = document.createElement('div');
            host.id = 'qb-host';
            vq.insertBefore(host, vq.children[1] || null);
        }
        // home pe banner
        var slot = document.getElementById('revision-card-slot');
        if (slot && !document.getElementById('qb-home-btn')) {
            var b = document.createElement('button');
            b.id = 'qb-home-btn';
            b.className = 'w-full p-4 rounded-2xl flex items-center gap-3 text-left cursor-pointer transition hover:scale-[1.01] border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50';
            b.innerHTML = '<div class="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center text-xl shrink-0">🗂️</div>'
                + '<div class="flex-1"><p class="text-sm font-black text-slate-900">1 Lakh+ Question Bank kholo</p>'
                + '<p class="text-[11px] font-bold text-slate-500">Class → Subject → Topic → har tap pe 10 naye questions + solutions 🔥</p></div><span class="text-amber-500 text-lg">›</span>';
            b.onclick = function () { try { switchTab('qbank'); } catch (e) {} setTimeout(renderBank, 300); };
            slot.insertAdjacentElement('afterend', b);
        }
        // qbank view mein render
        renderBank();
    }
    function init() { try { inject(); } catch (e) {} setTimeout(inject, 2000); setTimeout(inject, 5000); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
    console.log('🗂️ EDUVA Question Bank loaded');
})();
