/* ============================================================
   🎯 EDUVA JEE/NEET ZONE — JEE Main • Advanced • NEET ka apna ghar
   Weightage + rank tables + AI 30-day plan + practice link
   ============================================================ */
(function () {
    'use strict';
    function $(id) { return document.getElementById(id); }
    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    var exam = 'jeemain';

    var DATA = {
        jeemain: {
            name: 'JEE Main', icon: '🎯', color: '#1e3a8a',
            date: '2027-01-20', dateLabel: 'Session 1: January 2027 (expected)',
            pattern: 'Paper: Phy 25 + Chem 25 + Maths 25 • +4/−1 • 3 hours • CBT • 2 sessions (Jan + Apr)',
            weight: {
                'Physics': [['Mechanics', 30], ['Electrodynamics', 28], ['Modern Physics', 12], ['Heat & Thermodynamics', 12], ['Optics', 10], ['SHM & Waves', 8]],
                'Chemistry': [['Physical', 35], ['Organic', 32], ['Inorganic', 33]],
                'Maths': [['Calculus', 35], ['Algebra', 30], ['Coordinate Geometry', 15], ['Vectors & 3D', 12], ['Trigonometry', 8]]
            },
            ranks: [['250+', 'Top 500'], ['200-250', '500 - 5,000'], ['150-200', '5k - 50k'], ['100-150', '50k - 1.5L'], ['<100', '1.5L+']]
        },
        jeeadv: {
            name: 'JEE Advanced', icon: '🚀', color: '#4c1d95',
            date: '2027-06-07', dateLabel: 'June 2027 (expected — Main ke baad)',
            pattern: '2 papers (Phy+Chem+Maths each) • Partial marking • Multi-concept numericals • Only top 2.5L of Main',
            weight: {
                'Maths': [['Calculus & Analysis', 40], ['Algebra', 25], ['Geometry', 20], ['Combinatorics', 15]],
                'Physics': [['Mechanics', 35], ['E&M', 25], ['Modern', 15], ['Optics+Waves', 15], ['Thermal', 10]],
                'Chemistry': [['Organic (mechanisms)', 38], ['Physical', 32], ['Inorganic', 30]]
            },
            ranks: [['Top 2.5k', 'IIT call'], ['2.5k-10k', 'Good branch possible'], ['10k-25k', 'Border zone']]
        },
        neet: {
            name: 'NEET UG', icon: '🩺', color: '#065f46',
            date: '2027-05-02', dateLabel: 'May 2027 (expected — NTA notification)',
            pattern: '180 MCQ: Phy 45 + Chem 45 + Bio 90 • +4/−1 • 720 marks • 3h 20m • Pen-paper OMR',
            weight: {
                'Biology (90 Q!)': [['Human Physiology', 20], ['Genetics & Evolution', 18], ['Ecology', 12], ['Cell & Biomolecules', 12], ['Reproduction', 12], ['Diversity & Plants', 12], ['Biotech + others', 14]],
                'Chemistry': [['Organic', 34], ['Physical', 32], ['Inorganic', 34]],
                'Physics': [['Mechanics', 30], ['E&M', 25], ['Modern', 15], ['Optics', 10], ['Heat', 10], ['SHM & Waves', 10]]
            },
            ranks: [['650+', 'Top 1,000 (AIIMS zone)'], ['600-650', '1k - 10k (Govt MBBS)'], ['550-600', '10k - 50k'], ['500-550', '50k - 1L'], ['<500', '1L+']]
        }
    };

    function daysLeft(d) { var t = new Date(d + 'T00:00:00') - new Date(); return Math.max(0, Math.ceil(t / 86400000)); }

    function buildView() {
        if ($('view-jeeneet')) return;
        var main = document.querySelector('main');
        if (!main) return;
        var sec = document.createElement('section');
        sec.id = 'view-jeeneet';
        sec.className = 'hidden space-y-6 max-w-4xl mx-auto animate-fadeIn py-2';
        sec.innerHTML = '<div class="mb-2"><button type="button" class="eduva-back-btn" onclick="goBack()">←</button></div><div id="jn-host"></div>';
        main.appendChild(sec);
        render();
    }

    function render() {
        var host = $('jn-host'); if (!host) return;
        var d = DATA[exam];
        var tabs = Object.keys(DATA).map(function (k) {
            return '<button onclick="window.__jnExam(\'' + k + '\')" class="flex-1 py-3 rounded-xl text-xs font-black cursor-pointer transition ' + (k === exam ? 'text-white' : 'bg-slate-100 text-slate-600') + '" style="' + (k === exam ? 'background:' + DATA[k].color : '') + '">' + DATA[k].icon + ' ' + DATA[k].name + '</button>';
        }).join('');

        var weightHtml = Object.keys(d.weight).map(function (sub) {
            return '<div class="p-3 bg-slate-50 rounded-xl border border-slate-100">'
                + '<p class="text-xs font-black text-slate-700 mb-2">📚 ' + sub + '</p>'
                + d.weight[sub].map(function (w) {
                    return '<div class="flex items-center gap-2 mb-1.5"><span class="text-[11px] font-bold text-slate-600 w-36 shrink-0">' + esc(w[0]) + '</span>'
                        + '<div class="flex-1 bg-slate-200 h-2.5 rounded-full overflow-hidden"><div style="width:' + w[1] + '%;background:' + d.color + '" class="h-full rounded-full"></div></div>'
                        + '<span class="text-[10px] font-black text-slate-500 w-8 text-right">' + w[1] + '%</span></div>';
                }).join('') + '</div>';
        }).join('');

        var rankRows = d.ranks.map(function (r) {
            return '<div class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-100"><span class="text-xs font-black text-slate-800 mono-font">' + r[0] + '</span><span class="text-[11px] font-bold text-slate-500">' + esc(r[1]) + '</span></div>';
        }).join('');

        host.innerHTML =
            '<div class="card-clean p-5 sm:p-6 rounded-3xl text-white space-y-3" style="background:linear-gradient(135deg,' + d.color + ',#0f172a)">'
            + '<p class="text-[10px] font-black uppercase tracking-widest opacity-80">' + d.icon + ' EDUVA ' + d.name.toUpperCase() + ' ZONE</p>'
            + '<div class="flex items-end justify-between flex-wrap gap-2">'
            + '<p class="text-3xl font-black">' + daysLeft(d.date) + ' <span class="text-base font-bold opacity-80">din bache</span></p>'
            + '<p class="text-[11px] font-bold opacity-85">' + d.dateLabel + '</p></div>'
            + '<p class="text-xs font-semibold opacity-90">' + d.pattern + '</p>'
            + '<div class="flex gap-2 pt-1"><button onclick="window.__jnPlan()" class="px-4 py-2.5 bg-white text-slate-900 rounded-xl font-black text-xs cursor-pointer">🤖 Mera 30-Day Plan banao</button>'
            + '<button onclick="window.__jnPractice()" class="px-4 py-2.5 rounded-xl font-black text-xs cursor-pointer" style="background:rgba(255,255,255,.18);color:#fff;border:1px solid rgba(255,255,255,.4)">⚡ Weightage-wise Practice</button></div>'
            + '<p id="jn-status" class="text-[11px] font-bold min-h-[14px]"></p></div>'
            + '<div class="grid sm:grid-cols-2 gap-4">'
            + '<div class="card-clean p-4 rounded-2xl space-y-2"><p class="text-sm font-black text-slate-900">📊 Chapter Weightage (trend)</p>' + weightHtml + '</div>'
            + '<div class="space-y-4"><div class="card-clean p-4 rounded-2xl space-y-2"><p class="text-sm font-black text-slate-900">🏅 Marks vs Rank (trend)</p><div class="space-y-1.5">' + rankRows + '</div>'
            + '<p class="text-[10px] text-slate-400 font-semibold">*Har saal thoda badalta hai — official cutoff dekhte raho</p></div>'
            + '<div class="card-clean p-4 rounded-2xl space-y-2"><p class="text-sm font-black text-slate-900">🔗 Quick Links</p>'
            + '<div class="flex flex-wrap gap-2">'
            + '<a href="/jee-main-2027-free-mock.html" class="px-3 py-2 bg-blue-50 text-blue-700 rounded-xl text-[11px] font-black">🎯 JEE Free Practice Page</a>'
            + '<a href="/neet-ug-2027-free-mock.html" class="px-3 py-2 bg-teal-50 text-teal-700 rounded-xl text-[11px] font-black">🩺 NEET Free Practice Page</a>'
            + '<button onclick="switchTab(\'mocktest\')" class="px-3 py-2 bg-rose-50 text-rose-700 rounded-xl text-[11px] font-black cursor-pointer">⏱️ Mock Test दो</button>'
            + '<button onclick="switchTab(\'qbank\')" class="px-3 py-2 bg-amber-50 text-amber-700 rounded-xl text-[11px] font-black cursor-pointer">🗂️ 1 Lakh+ Questions</button>'
            + '<a href="/all-olympiads-guide-2026.html" class="px-3 py-2 bg-orange-50 text-orange-700 rounded-xl text-[11px] font-black">🏆 Olympiads</a>'
            + '</div></div></div></div>';
    }
    window.__jnExam = function (k) { exam = k; render(); };

    window.__jnPractice = function () {
        try {
            switchTab('qbank');
            setTimeout(function () {
                try { window.__qbLevel('hard'); } catch (e) {}
            }, 400);
            try { if (typeof eduvaToast !== 'undefined') eduvaToast('⚡ Hard mode on — JEE/NEET level questions!'); } catch (e) {}
        } catch (e) {}
    };

    window.__jnPlan = async function () {
        var st = $('jn-status'); if (!st) return;
        var weak = prompt('Kaunsa subject sabse weak hai? (jaise: Physics / Organic / Biology — ya "sab")', 'Physics') || 'all';
        st.textContent = '⏳ Edu Sir tumhara 30-day ' + DATA[exam].name + ' plan bana rahe hain... 30 sec';
        try {
            var res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'Mera exam: ' + DATA[exam].name + '. Weak area: ' + weak + '. Mere liye ek practical 30-DAY STUDY PLAN banao: roz kitne ghante, kaunse chapters/week, roz ka schedule (morning/evening), weekly test plan, aur motivation tips. Hindi mein, short bullet points.' }) });
            if (!res.ok) throw new Error('API ' + res.status);
            var d = await res.json();
            var reply = (d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content) || '';
            var ov = document.createElement('div');
            ov.style.cssText = 'position:fixed;inset:0;background:rgba(10,15,35,.8);z-index:97;display:flex;align-items:center;justify-content:center;padding:16px;';
            ov.innerHTML = '<div style="background:#f4f6fb;width:100%;max-width:560px;max-height:84vh;border-radius:20px;overflow:hidden;display:flex;flex-direction:column;">'
                + '<div style="background:' + DATA[exam].color + ';color:#fff;padding:14px 16px;display:flex;align-items:center;gap:10px;"><strong style="flex:1;font-size:16px;">🤖 Tera 30-Day ' + DATA[exam].name + ' Plan</strong>'
                + '<button onclick="this.closest(\'div[style*=fixed]\')&&this.closest(\'div\').parentElement.remove()" style="background:rgba(255,255,255,.2);border:none;color:#fff;border-radius:10px;width:32px;height:32px;font-size:17px;cursor:pointer;">X</button></div>'
                + '<div style="overflow-y:auto;padding:16px;font-size:14px;line-height:1.7;color:#1c2333;white-space:pre-wrap;">' + esc(reply) + '</div></div>';
            document.body.appendChild(ov);
            st.textContent = '✅ Plan ready!';
        } catch (e) {
            st.textContent = '⚠️ ' + e.message + ' — दोबारा try करो।';
        }
    };

    function injectEntry() {
        var slot = document.getElementById('revision-card-slot');
        if (slot && !document.getElementById('jn-home-btn')) {
            var b = document.createElement('button');
            b.id = 'jn-home-btn';
            b.className = 'w-full p-4 rounded-2xl flex items-center gap-3 text-left cursor-pointer transition hover:scale-[1.01] border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50';
            b.innerHTML = '<div class="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-xl shrink-0">🎯</div>'
                + '<div class="flex-1"><p class="text-sm font-black text-slate-900">JEE/NEET Zone — ye app tumhare liye hai!</p>'
                + '<p class="text-[11px] font-bold text-slate-500">Countdown • Chapter weightage • Marks vs Rank • 30-day AI plan</p></div><span class="text-blue-500 text-lg">›</span>';
            b.onclick = function () { try { switchTab('jeeneet'); } catch (e) {} };
            slot.insertAdjacentElement('afterend', b);
        }
        buildView();
    }
    function init() { try { injectEntry(); } catch (e) {} setTimeout(injectEntry, 2000); setTimeout(injectEntry, 5000); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
    console.log('🎯 EDUVA JEE/NEET Zone loaded');
})();
