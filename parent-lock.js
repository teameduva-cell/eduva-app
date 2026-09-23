/* ============================================================
   👨‍👩‍👧 EDUVA PARENT LOCK — Parent Trust Combo (4 features)
   1. Parent Mode: PIN-locked live dashboard
   2. Controls: Night Lock (Full / Padhai-Only / Exam auto-relax)
      + Community ON/OFF + Games-after-Homework
   3. Daily 8 PM alert (device-local v1)
   4. "इस हफ्ते कितना बचाया" Value Card
   ============================================================ */
(function () {
    'use strict';
    function $(id) { return document.getElementById(id); }
    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    var CFG_KEY = 'eduva_parent_cfg_v1';
    var HW_KEY = 'eduva_hw_done_date';
    var GAMES = ['spin', 'battle', 'story', 'hunt', 'tree', 'league', 'wrapped'];
    var STUDY_OK = ['home', 'chat', 'learning', 'study-material', 'ncert-olympiad', 'pyq', 'flashcards', 'vault', 'homework', 'mocktest', 'ait', 'results', 'memory', 'timetable', 'pomodoro', 'courses', 'help', 'faq', 'feedback', 'parent-report', 'teacher'];

    function getCfg() {
        try { return JSON.parse(localStorage.getItem(CFG_KEY) || '{}'); } catch (e) { return {}; }
    }
    function setCfg(c) { try { localStorage.setItem(CFG_KEY, JSON.stringify(c)); } catch (e) {} }
    function hashPin(p) {
        var s = 'eduva:' + p, h = 5381;
        for (var i = 0; i < s.length; i++) { h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; }
        return 'h' + h.toString(36);
    }
    function toast(msg) {
        var t = document.createElement('div');
        t.style.cssText = 'position:fixed;left:50%;bottom:96px;transform:translateX(-50%);background:#0f172a;color:#fff;padding:12px 18px;border-radius:14px;font-size:13px;font-weight:800;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,.35);max-width:86vw;text-align:center;';
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(function () { t.remove(); }, 2600);
    }
    function todayStr() { return new Date().toDateString(); }

    /* ---------- NIGHT LOCK CORE ---------- */
    function examWithinDays(n) {
        var d = null;
        try { d = localStorage.getItem('eduva_exam_date') || localStorage.getItem('eduva_exam_countdown'); } catch (e) {}
        var inp = $('exam-date-input'); if (!d && inp && inp.value) d = inp.value;
        if (!d) return false;
        var diff = (new Date(d + 'T00:00:00') - new Date()) / 86400000;
        return diff >= -1 && diff <= n;
    }
    function inLockHours(cfg) {
        var nl = cfg.nightLock || {}; if (!nl.on) return false;
        if (nl.examRelax !== false && examWithinDays(3)) return false; // exam week auto-relax
        var now = new Date(), from = nl.from || '22:00', to = nl.to || '06:00';
        var cur = now.getHours() * 60 + now.getMinutes();
        var f = parseInt(from.split(':')[0], 10) * 60 + parseInt(from.split(':')[1] || 0, 10);
        var t = parseInt(to.split(':')[0], 10) * 60 + parseInt(to.split(':')[1] || 0, 10);
        return f > t ? (cur >= f || cur < t) : (cur >= f && cur < t);
    }
    function hwDoneToday() { try { return localStorage.getItem(HW_KEY) === todayStr(); } catch (e) { return false; } }

    function enforceTab(tab) {
        var cfg = getCfg();
        if (cfg.communityOff && tab === 'community') { toast('👥 Community parent ने OFF की है'); return false; }
        if (inLockHours(cfg)) {
            var nl = cfg.nightLock || {};
            if (nl.mode === 'study') { // Padhai-Only
                if (GAMES.indexOf(tab) !== -1) { toast('😴 रात का समय! पहले पढ़ाई — कल सुबह खेलना 🌅'); return false; }
            }
        }
        if (cfg.gamesAfterHw && GAMES.indexOf(tab) !== -1 && !hwDoneToday()) {
            toast('🏠 पहले आज का Homework submit करो — फिर games खुलेंगे! 💪');
            return false;
        }
        return true;
    }

    // switchTab wrap (baad mein define — dono IIFEs classic scripts hain)
    function wrapSwitchTab() {
        if (window.__plWrapped || typeof window.switchTab !== 'function') return;
        window.__plWrapped = true;
        var orig = window.switchTab;
        window.switchTab = function (tab) {
            if (!enforceTab(tab)) return;
            return orig.apply(this, arguments);
        };
    }

    // Full lock overlay
    function fullLockOverlay(cfg) {
        if ($('pl-full-lock')) return;
        var o = document.createElement('div');
        o.id = 'pl-full-lock';
        o.style.cssText = 'position:fixed;inset:0;background:linear-gradient(135deg,#0f172a,#1e293b);z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center;color:#fff;';
        o.innerHTML = '<div style="font-size:64px">😴</div>'
            + '<h2 style="font-size:22px;font-weight:900;margin:14px 0 6px">अब सोने का समय है, चैंपियन!</h2>'
            + '<p style="color:#cbd5e1;font-size:14px;max-width:320px;line-height:1.6">⏰ EDUVA रात ' + esc((cfg.nightLock && cfg.nightLock.from) || '22:00') + ' से सुबह ' + esc((cfg.nightLock && cfg.nightLock.to) || '06:00') + ' तक locked है।<br>कल ताज़ा दिमाग से पढ़ाई होगी तेज़! 🌅</p>'
            + '<p style="color:#64748b;font-size:12px;margin-top:10px">(Exam week में lock अपने आप relax हो जाता है 📝)</p>'
            + '<button id="pl-unlock" style="margin-top:22px;padding:12px 22px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);color:#fff;border-radius:14px;font-weight:800;font-size:13px;cursor:pointer">🔓 Parent PIN से खोलो</button>';
        document.body.appendChild(o);
        $('pl-unlock').onclick = function () { askPin(function () { var x = $('pl-full-lock'); if (x) x.remove(); toast('🔓 Parent ने unlock किया'); }); };
    }
    function checkFullLock() {
        var cfg = getCfg();
        var x = $('pl-full-lock');
        if (inLockHours(cfg) && (cfg.nightLock || {}).mode === 'full') fullLockOverlay(cfg);
        else if (x) x.remove();
    }

    /* ---------- PIN ---------- */
    function askPin(cb) {
        var o = document.createElement('div');
        o.id = 'pl-pin-ov';
        o.style.cssText = 'position:fixed;inset:0;background:rgba(10,15,35,.8);z-index:100000;display:flex;align-items:center;justify-content:center;padding:20px;';
        o.innerHTML = '<div style="background:#fff;border-radius:22px;padding:24px;width:100%;max-width:320px;text-align:center;">'
            + '<div style="font-size:36px">🔐</div>'
            + '<h3 style="font-weight:900;font-size:17px;margin:8px 0 2px;color:#0f172a">Parent PIN डालो</h3>'
            + '<input id="pl-pin-in" type="password" inputmode="numeric" maxlength="4" placeholder="••••" style="width:100%;padding:14px;font-size:22px;letter-spacing:14px;text-align:center;border:2px solid #e2e8f0;border-radius:14px;margin:12px 0;outline:none;">'
            + '<p id="pl-pin-err" style="color:#dc2626;font-size:12px;font-weight:700;min-height:16px"></p>'
            + '<button id="pl-pin-go" style="width:100%;padding:13px;background:#0f172a;color:#fff;border:none;border-radius:14px;font-weight:900;font-size:14px;cursor:pointer;">खोलो →</button>'
            + '<button id="pl-pin-x" style="margin-top:8px;background:none;border:none;color:#64748b;font-size:12px;font-weight:700;cursor:pointer;">बंद करो</button></div>';
        document.body.appendChild(o);
        var inp = $('pl-pin-in'); inp.focus();
        function tryOk() {
            var cfg = getCfg();
            if (hashPin(inp.value) === cfg.pinHash) { o.remove(); cb(); }
            else { $('pl-pin-err').textContent = '❌ गलत PIN — दोबारा try करो'; inp.value = ''; }
        }
        $('pl-pin-go').onclick = tryOk;
        inp.onkeydown = function (e) { if (e.key === 'Enter') tryOk(); };
        $('pl-pin-x').onclick = function () { o.remove(); };
    }

    /* ---------- STATS ---------- */
    function getStats() {
        var diary = 0, weekDoubts = 0, revDue = 0, streak = 0, examDays = null;
        try { var d = JSON.parse(localStorage.getItem('eduva_doubt_diary_v1') || '[]'); diary = d.length; var w = Date.now() - 7 * 86400000; weekDoubts = d.filter(function (x) { return x.t > w; }).length; } catch (e) {}
        try { var q = JSON.parse(localStorage.getItem('eduva_rev_q') || '[]'); revDue = q.filter(function (x) { return !x.due || x.due <= Date.now(); }).length; } catch (e) {}
        try { var se = $('header-streak-display'); if (se) streak = parseInt(se.textContent) || 0; } catch (e) {}
        try {
            var dd = localStorage.getItem('eduva_exam_date') || localStorage.getItem('eduva_exam_countdown');
            var inp2 = $('exam-date-input'); if (!dd && inp2 && inp2.value) dd = inp2.value;
            if (dd) examDays = Math.max(0, Math.ceil((new Date(dd + 'T00:00:00') - new Date()) / 86400000));
        } catch (e) {}
        return { diary: diary, weekDoubts: weekDoubts, revDue: revDue, streak: streak, examDays: examDays };
    }
    function weeklySavings(s) {
        return s.weekDoubts * 15 + Math.min(s.diary, 10) * 20 + 150; // doubts + notes + tests estimate
    }

    /* ---------- PARENT MODE UI ---------- */
    function openParentMode() {
        var cfg = getCfg();
        if (!cfg.pinHash) { setupPin(); return; }
        askPin(renderDashboard);
    }
    function setupPin() {
        var o = document.createElement('div');
        o.id = 'pl-setup-ov';
        o.style.cssText = 'position:fixed;inset:0;background:rgba(10,15,35,.8);z-index:100000;display:flex;align-items:center;justify-content:center;padding:20px;';
        o.innerHTML = '<div style="background:#fff;border-radius:22px;padding:24px;width:100%;max-width:320px;text-align:center;">'
            + '<div style="font-size:36px">👨‍👩‍👧</div>'
            + '<h3 style="font-weight:900;font-size:17px;margin:8px 0 2px;color:#0f172a">Parent Mode शुरू करो</h3>'
            + '<p style="color:#64748b;font-size:12px;font-weight:600;margin:6px 0">4-digit PIN बनाओ — <b>बच्चे को मत बताना!</b> इससे dashboard और controls lock होंगे।</p>'
            + '<input id="pl-sp1" type="password" inputmode="numeric" maxlength="4" placeholder="नया PIN" style="width:100%;padding:13px;font-size:18px;text-align:center;border:2px solid #e2e8f0;border-radius:14px;margin:8px 0;outline:none;">'
            + '<input id="pl-sp2" type="password" inputmode="numeric" maxlength="4" placeholder="PIN दोबारा लिखो" style="width:100%;padding:13px;font-size:18px;text-align:center;border:2px solid #e2e8f0;border-radius:14px;outline:none;">'
            + '<p id="pl-sp-err" style="color:#dc2626;font-size:12px;font-weight:700;min-height:16px"></p>'
            + '<button id="pl-sp-go" style="width:100%;padding:13px;background:#0f172a;color:#fff;border:none;border-radius:14px;font-weight:900;font-size:14px;cursor:pointer;">PIN बनाओ 🔐</button></div>';
        document.body.appendChild(o);
        $('pl-sp-go').onclick = function () {
            var p1 = $('pl-sp1').value, p2 = $('pl-sp2').value;
            if (!/^\d{4}$/.test(p1)) { $('pl-sp-err').textContent = '❌ PIN 4 digits का होना चाहिए'; return; }
            if (p1 !== p2) { $('pl-sp-err').textContent = '❌ दोनों PIN मिल नहीं रहे'; return; }
            var cfg = getCfg(); cfg.pinHash = hashPin(p1);
            cfg.nightLock = { on: false, mode: 'study', from: '22:00', to: '06:00', examRelax: true };
            cfg.communityOff = false; cfg.gamesAfterHw = false; cfg.dailyAlert = false;
            setCfg(cfg);
            o.remove(); toast('🔐 Parent Mode चालू!'); renderDashboard();
        };
    }

    function renderDashboard() {
        var cfg = getCfg(); var s = getStats();
        var save = weeklySavings(s);
        function toggleRow(key, label, sub, on) {
            return '<label class="flex items-start gap-2.5 p-3 bg-slate-50 border ' + (on ? 'border-emerald-300' : 'border-slate-200') + ' rounded-xl cursor-pointer">'
                + '<input type="checkbox" ' + (on ? 'checked' : '') + ' onchange="window.__plSet(\'' + key + '\', this.checked)" class="mt-0.5 w-4 h-4 accent-emerald-600">'
                + '<span class="text-left"><b style="font-size:13px;color:#0f172a">' + label + '</b><br><span style="font-size:11px;color:#64748b">' + sub + '</span></span></label>';
        }
        var nl = cfg.nightLock || {};
        var html = '<div style="background:linear-gradient(135deg,#065f46,#0d9488);color:#fff;padding:14px 16px;display:flex;align-items:center;gap:10px;">'
            + '<strong style="font-size:16px;flex:1;">👨‍👩‍👧 Parent Mode</strong>'
            + '<button onclick="window.__plClose()" style="background:rgba(255,255,255,.2);border:none;color:#fff;border-radius:10px;width:34px;height:34px;font-size:18px;cursor:pointer;">X</button></div>'
            + '<div style="overflow-y:auto;padding:14px;flex:1;" class="space-y-3">'
            // Value card
            + '<div style="background:linear-gradient(135deg,#fef3c7,#fffbeb);border:2px solid #f59e0b;border-radius:16px;padding:14px;text-align:center;">'
            + '<p style="font-size:11px;font-weight:900;color:#92400e;letter-spacing:.5px">💰 इस हफ्ते EDUVA ने बचाए</p>'
            + '<p style="font-size:28px;font-weight:900;color:#b45309">₹' + save + '</p>'
            + '<p style="font-size:11px;color:#92400e;font-weight:700">(doubts + notes + tests के हिसाब से, coaching fees से compare में)</p></div>'
            // Stats
            + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">'
            + '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:10px;text-align:center;"><b style="font-size:18px;color:#0f172a">' + s.weekDoubts + '</b><br><span style="font-size:10px;color:#64748b;font-weight:700">इस हफ्ते Doubts</span></div>'
            + '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:10px;text-align:center;"><b style="font-size:18px;color:#dc2626">' + s.revDue + '</b><br><span style="font-size:10px;color:#64748b;font-weight:700">Revision बाकी</span></div>'
            + '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:10px;text-align:center;"><b style="font-size:18px;color:#ea580c">' + s.streak + ' 🔥</b><br><span style="font-size:10px;color:#64748b;font-weight:700">Day Streak</span></div>'
            + '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:10px;text-align:center;"><b style="font-size:18px;color:#7c3aed">' + (s.examDays === null ? '—' : s.examDays + ' दिन') + '</b><br><span style="font-size:10px;color:#64748b;font-weight:700">Exam Countdown</span></div></div>'
            // Controls
            + '<p style="font-size:11px;font-weight:900;color:#64748b;letter-spacing:.5px;padding-top:4px">🛡️ PARENT CONTROLS</p>'
            + toggleRow('communityOff', '👥 Community Doubt Pool', 'बच्चा strangers से doubt discussion न करे', !!cfg.communityOff)
            + toggleRow('gamesAfterHw', '🎮 Games: Homework के बाद', 'Spin/Battle/Story तभी खुलेंगे जब आज का Homework submit हो', !!cfg.gamesAfterHw)
            + toggleRow('dailyAlert', '🔔 Daily 8 PM Report', 'रोज़ शाम को report की याद दिलाओ (app खुली हो तो)', !!cfg.dailyAlert)
            // Night lock
            + '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:12px;" class="space-y-2">'
            + '<label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" ' + (nl.on ? 'checked' : '') + ' onchange="window.__plSet(\'nightLock.on\', this.checked)" class="w-4 h-4 accent-indigo-600"><b style="font-size:13px;color:#0f172a">⏰ Night Lock</b></label>'
            + '<div style="display:flex;gap:6px;">'
            + '<button onclick="window.__plSet(\'nightLock.mode\',\'full\')" style="flex:1;padding:8px;border-radius:10px;font-size:11px;font-weight:800;cursor:pointer;border:2px solid ' + (nl.mode === 'full' ? '#4f46e5' : '#e2e8f0') + ';background:' + (nl.mode === 'full' ? '#eef2ff' : '#fff') + ';color:#0f172a">😴 Full Lock</button>'
            + '<button onclick="window.__plSet(\'nightLock.mode\',\'study\')" style="flex:1;padding:8px;border-radius:10px;font-size:11px;font-weight:800;cursor:pointer;border:2px solid ' + (nl.mode !== 'full' ? '#4f46e5' : '#e2e8f0') + ';background:' + (nl.mode !== 'full' ? '#eef2ff' : '#fff') + ';color:#0f172a">📚 Padhai-Only</button></div>'
            + '<p style="font-size:10px;color:#64748b;font-weight:700">📚 Padhai-Only = रात में games बंद, पढ़ाई चालू | Exam week में auto-relax: <b>' + (nl.examRelax !== false ? 'ON ✅' : 'OFF') + '</b> <a href="#" onclick="window.__plSet(\'nightLock.examRelax\', ' + (nl.examRelax !== false ? 'false' : 'true') + ');return false;" style="color:#4f46e5">(बदलो)</a></p>'
            + '<div style="display:flex;gap:6px;align-items:center;font-size:11px;font-weight:800;color:#334155;">समय: <input type="time" value="' + esc(nl.from || '22:00') + '" onchange="window.__plSet(\'nightLock.from\', this.value)" style="flex:1;padding:6px;border:1px solid #e2e8f0;border-radius:8px;"> से <input type="time" value="' + esc(nl.to || '06:00') + '" onchange="window.__plSet(\'nightLock.to\', this.value)" style="flex:1;padding:6px;border:1px solid #e2e8f0;border-radius:8px;"></div>'
            + '</div>'
            + '<p style="font-size:10px;color:#94a3b8;text-align:center;font-weight:700;padding-top:4px">🔒 PIN बदलने के लिए: PIN डालकर खोलो → browser data clear करके नया PIN सेट करो</p>'
            + '</div>';
        showOv(html);
    }

    function showOv(inner) {
        closeOv();
        var o = document.createElement('div');
        o.id = 'pl-ov';
        o.style.cssText = 'position:fixed;inset:0;background:rgba(10,15,35,.75);z-index:99998;display:flex;align-items:center;justify-content:center;padding:16px;';
        o.innerHTML = '<div style="background:#f4f6fb;width:100%;max-width:420px;max-height:86vh;border-radius:20px;overflow:hidden;display:flex;flex-direction:column;">' + inner + '</div>';
        o.addEventListener('click', function (e) { if (e.target === o) closeOv(); });
        document.body.appendChild(o);
    }
    function closeOv() { var o = $('pl-ov'); if (o) o.remove(); }

    /* ---------- __plSet (controls) ---------- */
    window.__plSet = function (key, val) {
        var cfg = getCfg();
        var parts = key.split('.');
        if (parts.length === 2) { cfg[parts[0]] = cfg[parts[0]] || {}; cfg[parts[0]][parts[1]] = val; }
        else cfg[key] = val;
        setCfg(cfg);
        applySideEffects();
        renderDashboard();
    };
    window.__plClose = closeOv;
    window.openParentMode = openParentMode;

    function applySideEffects() {
        var cfg = getCfg();
        var commBtn = $('tab-community');
        if (commBtn) commBtn.style.display = cfg.communityOff ? 'none' : '';
        checkFullLock();
    }

    /* ---------- Daily 8 PM alert (device-local v1) ---------- */
    function dailyAlertCheck() {
        var cfg = getCfg();
        if (!cfg.dailyAlert) return;
        var now = new Date();
        if (now.getHours() !== 20) return;
        var key = 'eduva_alert_sent_' + now.toDateString();
        if (localStorage.getItem(key)) return;
        try { localStorage.setItem(key, '1'); } catch (e) {}
        var s = getStats();
        var body = '⏱️ पढ़ाई active | 🧠 ' + s.weekDoubts + ' doubts इस हफ्ते | 🔥 Streak: ' + s.streak + ' | Parent Mode में पूरी report देखो';
        if ('serviceWorker' in navigator && Notification.permission === 'granted') {
            navigator.serviceWorker.ready.then(function (r) {
                r.showNotification('📋 EDUVA Daily Report', { body: body, icon: '/icon-192.png' });
            }).catch(function () {});
        } else {
            toast('📋 ' + body);
        }
    }

    /* ---------- Inject Parent Mode button in mobile menu ---------- */
    function injectBtn() {
        var menu = $('header-more-menu');
        if (!menu || $('pl-menu-btn')) return;
        var anchor = null;
        var btns = menu.querySelectorAll('button');
        for (var i = 0; i < btns.length; i++) {
            if ((btns[i].getAttribute('onclick') || '').indexOf("switchTab('olympiad')") !== -1) { anchor = btns[i]; break; }
        }
        if (!anchor) {
            for (var j = 0; j < btns.length; j++) {
                if ((btns[j].getAttribute('onclick') || '').indexOf("switchTab('mocktest')") !== -1) { anchor = btns[j]; break; }
            }
        }
        var b = document.createElement('button');
        b.id = 'pl-menu-btn';
        b.className = 'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-black text-left cursor-pointer bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200';
        b.innerHTML = '<span class="text-base leading-none">👨‍👩‍👧</span> Parent Mode';
        b.onclick = function () { if (window.toggleHeaderMoreMenu) toggleHeaderMoreMenu(); openParentMode(); };
        if (anchor) anchor.insertAdjacentElement('afterend', b);
        else menu.appendChild(b);
    }

    // Homework submit → games unlock (delegation)
    document.addEventListener('click', function (e) {
        var t = e.target.closest ? e.target.closest('#hw-submit-btn') : null;
        if (t) setTimeout(function () { try { localStorage.setItem(HW_KEY, todayStr()); } catch (x) {} }, 4000);
    }, true);

    function init() {
        wrapSwitchTab();
        injectBtn();
        applySideEffects();
        checkFullLock();
        setInterval(checkFullLock, 30000);
        setInterval(dailyAlertCheck, 60000);
        setTimeout(injectBtn, 1500);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
    console.log('👨‍👩‍👧 EDUVA Parent Lock loaded');
})();
