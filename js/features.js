(function () {
        window.openTestCampaign = function () {
            var el = document.getElementById('test-campaign');
            if (!el) return;
            el.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            if (typeof eduvaTrack === 'function') eduvaTrack('cta_click', { label: 'TestCampaign Open' });
        };
        window.closeTestCampaign = function () {
            var el = document.getElementById('test-campaign');
            if (!el) return;
            el.classList.add('hidden');
            document.body.style.overflow = '';
            try { localStorage.setItem('tc_seen', '1'); } catch (e) {}
        };
        window.shareTestCampaign = function () {
            var txt = '🏆 ALL INDIA EDUVA TEST 2027 🇮🇳\n\n25 MCQ • 50 मिनट • Class-wise All India Rank • Certificate सबको FREE!\n🥇 TOP 5 → 3 साल FREE\n🥈 TOP 100 → 1 साल FREE\n\n3 जनवरी 2027 • 100% FREE\nRegister करो: ' + location.origin + '?test=1\n\n— EDUVA';
            window.open('https://wa.me/?text=' + encodeURIComponent(txt), '_blank');
        };
        var target = new Date('2027-01-03T08:00:00+05:30').getTime();
        function tcTick() {
            var elD = document.getElementById('tc-d'), elH = document.getElementById('tc-h'),
                elM = document.getElementById('tc-m'), elS = document.getElementById('tc-s');
            if (!elD) return;
            var diff = Math.max(0, target - Date.now());
            elD.textContent = Math.floor(diff / 86400000);
            elH.textContent = Math.floor(diff / 3600000) % 24;
            elM.textContent = Math.floor(diff / 60000) % 60;
            elS.textContent = Math.floor(diff / 1000) % 60;
        }
        setInterval(tcTick, 1000); tcTick();
        if (/[?#&]test=1/.test(location.href) && !localStorage.getItem('tc_seen')) {
            window.addEventListener('load', function () { setTimeout(window.openTestCampaign, 800); });
        }
    })();

/* ---- consolidated block ---- */

// ============================================================
//  EDUVA — GROWTH ANALYTICS (Phase 1)
//  6 events: landing_view, cta_click, signup_started,
//            signup_completed, first_doubt, install
//  Founder Dashboard me "Growth Stats" card auto-render hoga
// ============================================================

(function () {
    'use strict';

    const LS_KEY = 'eduva_analytics_v1';

    // ---------- Local store ----------
    function getEvents() {
        try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch (e) { return {}; }
    }
    function trackEvent(name, meta) {
        const ev = getEvents();
        ev[name] = ev[name] || { count: 0, first: Date.now(), last: Date.now() };
        ev[name].count++;
        ev[name].last = Date.now();
        try { localStorage.setItem(LS_KEY, JSON.stringify(ev)); } catch (e) {}
        // Firestore sync (best-effort, background)
        syncToFirestore(name, meta || {});
        renderGrowthStats();
    }
    window.eduvaTrack = trackEvent;

    // ---------- Firestore sync (module — same firebase config) ----------
    async function syncToFirestore(name, meta) {
        try {
            const { initializeApp, getApps } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
            const { getFirestore, collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
            const cfg = { apiKey: 'AIzaSyDO_fAFk8PITh9opzWXPIM_g7wd1NzXsHw', authDomain: 'eduva-app-5ecec.firebaseapp.com', projectId: 'eduva-app-5ecec' };
            const app = getApps().length ? getApps()[0] : initializeApp(cfg);
            const db = getFirestore(app);
            await addDoc(collection(db, 'analytics'), { event: name, meta: meta, at: serverTimestamp(), ua: navigator.userAgent.slice(0, 80) });
        } catch (e) { /* offline/anonymous — local copy kaafi hai */ }
    }

    // ---------- 1. landing_view ----------
    window.addEventListener('load', () => trackEvent('landing_view', { page: location.pathname }));

    // ---------- 2. cta_click (event delegation — sirf key CTAs) ----------
    const CTA_SELECTORS = [
        "[onclick*=\"switchTab('chat')\"]", "[onclick*='snapAndSolve']",
        "[onclick*='openLoginModal']", '#guest-try-btn', "[onclick*='registerAIT']"
    ];
    document.addEventListener('click', (e) => {
        const hit = e.target.closest(CTA_SELECTORS.join(','));
        if (hit) {
            const lbl = (hit.innerText || hit.textContent || 'btn').trim().slice(0, 40);
            trackEvent('cta_click', { label: lbl });
        }
    }, true);

    // ---------- 3 & 4. signup_started / signup_completed ----------
    function wrapAuth() {
        if (window.openLoginModal && !window.openLoginModal.__tracked) {
            const o = window.openLoginModal;
            window.openLoginModal = function () { trackEvent('signup_started'); return o.apply(this, arguments); };
            window.openLoginModal.__tracked = true;
        }
        ['eduvaAuthSignup', 'eduvaAuthLogin', 'eduvaAuthGoogleLogin'].forEach(fn => {
            if (window[fn] && !window[fn].__tracked) {
                const o = window[fn];
                window[fn] = async function () {
                    const r = await o.apply(this, arguments);
                    trackEvent('signup_completed', { method: fn.replace('eduvaAuth', '').replace('GoogleLogin', 'Google') });
                    return r;
                };
                window[fn].__tracked = true;
            }
        });
    }
    wrapAuth();
    setTimeout(wrapAuth, 3000); // module late load ho to bhi wrap ho jaye

    // ---------- 5. first_doubt (sirf pehli baar) ----------
    let doubtTracked = false;
    function hookDoubt() {
        if (window.sendDoubt && !window.sendDoubt.__tracked) {
            const o = window.sendDoubt;
            window.sendDoubt = function () {
                if (!doubtTracked) { doubtTracked = true; trackEvent('first_doubt'); }
                return o.apply(this, arguments);
            };
            window.sendDoubt.__tracked = true;
        }
    }
    hookDoubt();
    setTimeout(hookDoubt, 3000);

    // ---------- 6. install ----------
    let deferredPrompt = null;
    window.addEventListener('beforeinstallprompt', (e) => { window.__eduvaInstallPrompt = e; });
    document.addEventListener('click', (e) => {
        const b = e.target.closest("[onclick*='installApp'], [id*='install']");
        if (b && deferredPrompt) { trackEvent('install', { via: 'prompt' }); }
    }, true);
    window.addEventListener('appinstalled', () => trackEvent('install', { via: 'installed' }));

    // ---------- Founder Dashboard me Growth Stats card ----------
    window.eduvaAnalyticsStats = function () {
        const ev = getEvents();
        const v = (n) => (ev[n] && ev[n].count) || 0;
        return [
            { label: '👀 Landing Views', n: v('landing_view') },
            { label: '👆 CTA Clicks', n: v('cta_click') },
            { label: '🔐 Signup Started', n: v('signup_started') },
            { label: '✅ Signup Completed', n: v('signup_completed') },
            { label: '🧠 First Doubt', n: v('first_doubt') },
            { label: '📲 Installs', n: v('install') }
        ];
    };

    function renderGrowthStats() {
        // Founder view khula ho to card render karo
        const view = document.getElementById('view-founder');
        if (!view || view.classList.contains('hidden')) return;
        let card = document.getElementById('growth-stats-card');
        if (!card) {
            card = document.createElement('div');
            card.id = 'growth-stats-card';
            card.className = 'card-clean p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 space-y-3';
            const host = document.getElementById('founder-stats');
            if (host) host.parentNode.insertBefore(card, host.nextSibling);
            else view.prepend(card);
        }
        const rows = window.eduvaAnalyticsStats().map(s =>
            '<div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">' +
            '<span class="text-xs sm:text-sm font-bold text-slate-700">' + s.label + '</span>' +
            '<span class="text-base font-black text-indigo-600 mono-font">' + s.n + '</span></div>').join('');
        card.innerHTML = '<h3 class="font-black text-slate-800 text-sm">📈 Growth Stats (Funnel)</h3><div class="grid sm:grid-cols-2 gap-2">' + rows + '</div>' +
            '<p class="text-[11px] text-slate-400 font-semibold">Funnel: views → clicks → signup → first doubt → install. Kahan drop ho raha hai, wahi fix karna hai!</p>';
    }
    // switchTab wrap — founder view khulne par render
    if (window.switchTab) {
        const o = window.switchTab;
        window.switchTab = function (t) { const r = o.apply(this, arguments); if (t === 'founder') setTimeout(renderGrowthStats, 300); return r; };
    }
})();

/* ---- consolidated block ---- */

// ============================================================
//  EDUVA — FULL HINDI MODE (v1.0)
//  Village students & parents ke liye — pure Devanagari UI
//  (Hindi toggle — More menu mein)
// ============================================================

(function () {
    'use strict';

    // ---------- 1. SHUDDH HINDI SHABDKOSH (sabse zaroori UI strings) ----------
    const HINDI_DICT = {
        // Header / Common buttons
        'Login': 'लॉगिन', 'Sign Up': 'साइन अप', 'Logout': 'लॉगआउट',
        'Home': 'होम', 'Profile': 'प्रोफ़ाइल', 'Home Dashboard': 'होम डैशबोर्ड',
        'Dark Mode': 'डार्क मोड', 'Lite Mode (fast)': 'लाइट मोड (तेज़)',
        'Full Mode ON karo': 'फुल मोड चालू करो',
        'View Profile': 'प्रोफ़ाइल देखें', 'View All': 'सब देखें',
        'Help & Support': 'मदद और सहायता', 'Help & Support 🆘': 'मदद 🆘',
        'Feedback भेजें 💬': 'सुझाव भेजें 💬', 'Feedback & Suggestions': 'सुझाव और राय',
        'Contact Us': 'संपर्क करें', 'Contact Us ✉️': 'संपर्क करें ✉️',
        'About Us': 'हमारे बारे में', 'About Us 📖': 'हमारे बारे में 📖',
        'FAQs': 'अक्सर पूछे जाने वाले सवाल', 'FAQ ❓': 'सवाल-जवाब ❓',
        'Settings': 'सेटिंग', 'Edit Profile': 'प्रोफ़ाइल बदलें', 'Delete': 'हटाएँ',
        'Save': 'सेव करें', 'Submit': 'जमा करें', 'Cancel': 'रद्द करें',
        'Start': 'शुरू करें', 'Stop': 'रोकें', 'Pause': 'रोकें', 'Reset': 'फिर से',
        'Next': 'आगे', 'Previous': 'पीछे', 'Search': 'खोजें', 'Refresh': 'ताज़ा करें',
        'Share': 'शेयर करें', 'Download': 'डाउनलोड', 'Close': 'बंद करें',
        'Play': '▶ चलाएँ', 'Resume': 'जारी रखें',
        'My Profile': 'मेरी प्रोफ़ाइल', 'My Profile & Badges': 'मेरी प्रोफ़ाइल और बैज',
        'Certificates': 'प्रमाणपत्र', 'Certificates 📜': 'प्रमाणपत्र 📜',
        'Results': 'रिज़ल्ट', 'Trophy': 'ट्रॉफ़ी',

        // Navigation / Sections
        'Continue Learning (In-App Secured)': 'पढ़ाई जारी रखें (ऐप में सुरक्षित)',
        'My Learning': 'मेरी पढ़ाई', 'My Learning & Subjects 📚': 'मेरी पढ़ाई और विषय 📚',
        'Study Material': 'पढ़ने का सामान', 'Study Material (NCERT) 📚': 'पढ़ने का सामान (NCERT) 📚',
        'Video Lectures': 'वीडियो पढ़ाई', 'AI Lectures 🎥': 'वीडियो पढ़ाई 🎥',
        'AI Avatar Lectures': 'AI अवतार पढ़ाई',
        'Motivation': 'हौसला', 'Motivation & Career 🔥': 'हौसला और करियर 🔥',
        'Counseling': 'मार्गदर्शन', 'Mental Health & Counseling 💜': 'मानसिक स्वास्थ्य 💜',
        'AI Chat & Doubts': 'AI चैट और सवाल',
        'Community': 'समुदाय', 'कम्युनिटी डाउट पूल': 'समुदाय सवाल-पूल',
        'Flashcards': 'फ़्लैश कार्ड', '1-Min Flashcards 🃏': '1-मिनट कार्ड 🃏',
        'Mock Test': 'परीक्षा अभ्यास', 'Mock Test ⏱️': 'परीक्षा अभ्यास ⏱️',
        'All India Test': 'अखिल भारतीय परीक्षा', 'All India Test (FREE)': 'अखिल भारतीय परीक्षा (FREE)',
        'Daily Homework': 'रोज़ का होमवर्क', 'Daily Homework 🏠': 'रोज़ का होमवर्क 🏠',
        'Homework': 'होमवर्क', 'Olympiad Guide': 'ओलंपियाड गाइड',
        'Olympiad Guide 🏆': 'ओलंपियाड गाइड 🏆', 'Courses & AI DPPs': 'कोर्स और AI DPP',
        'Courses & AI DPPs 🎯': 'कोर्स और AI DPP 🎯',
        'Health Guide': 'स्वास्थ्य गाइड', 'Health Guide ❤️': 'स्वास्थ्य गाइड ❤️',
        'Upload Notes': 'नोट्स भेजें', 'Upload Notes 📤': 'नोट्स भेजें 📤',
        'Question Bank': 'सवालों का भंडार', 'Question Bank 🗂️': 'सवालों का भंडार 🗂️',
        'Formula Vault': 'सूत्रों का कोष', 'Formula Vault 📌': 'सूत्रों का कोष 📌',
        'Mistake Book': 'गलतियों की किताब', 'My Mistake Book 🧠': 'मेरी गलतियों की किताब 🧠',
        'Parent Report': 'माता-पिता रिपोर्ट', 'Parent Report 👨‍👩‍👧': 'माता-पिता रिपोर्ट 👨‍👩‍👧',
        'AI Time Table': 'AI समय-सारणी', 'Focus Timer': 'ध्यान टाइमर',
        'Focus Timer ⏱️': 'ध्यान टाइमर ⏱️', 'Study Room': 'स्टडी रूम',
        'Study Room 👥': 'स्टडी रूम 👥', 'PYQ Library': 'पिछले वर्षों के पेपर',
        'PYQ Library 🗞️': 'पुराने पेपर 🗞️', 'NCERT/Olympiad': 'NCERT/ओलंपियाड',
        'Vedic Maths': 'वैदिक गणित', 'Vedic Maths 🧮': 'वैदिक गणित 🧮',
        'Abacus 🧮': 'अबेकस 🧮', 'Computer & AI': 'कंप्यूटर और AI',
        'Computer & AI 💻': 'कंप्यूटर और AI 💻', 'Spoken English': 'बोलने की अंग्रेज़ी',
        'Spoken English 🗣️': 'बोलने की अंग्रेज़ी 🗣️',

        // Chat & Doubts
        'Doubt पूछो': 'सवाल पूछो', 'Ask Edu Sir anything...': 'Edu Sir से कुछ भी पूछें...',
        'Direct Answer': 'सीधा जवाब', 'Practice': 'अभ्यास',
        'Save to Vault': 'कोष में सेव करें', 'New': 'नया',
        'Edu Sir को सुनें': 'Edu Sir की आवाज़ सुनें',
        'Voice Input': 'आवाज़ से लिखें', 'Ask Edu Sir': 'Edu Sir से पूछें',
        '🔮 Paper Predictor': '🔮 पेपर भविष्यवाणी',
        'Paper Predictor': 'पेपर भविष्यवाणी',
        'Viva Examiner': 'मौखिक परीक्षक', 'Viva Examiner 🎤': 'मौखिक परीक्षक 🎤',
        'My League': 'मेरी लीग', 'My League 🏆': 'मेरी लीग 🏆',
        'Daily Spin': 'रोज़ का स्पिन', 'Daily Spin 🎡': 'रोज़ का स्पिन 🎡',
        'Mera Ped': 'मेरा पेड़', 'Mera Ped 🌱': 'मेरा पेड़ 🌱',
        'Galti Pakdo': 'गलती पकड़ो', 'Galti Pakdo 🐛': 'गलती पकड़ो 🐛',
        'Kota Chronicles': 'कोटा कहानियाँ', 'Kota Chronicles 📖': 'कोटा कहानियाँ 📖',
        'Weekly Wrapped': 'साप्ताहिक रिपोर्ट', 'Weekly Wrapped 📊': 'साप्ताहिक रिपोर्ट 📊',
        'AI Battle': 'AI लड़ाई', 'AI Battle Mode': 'AI लड़ाई मोड',

        // Labels / Stats
        'Day Streak': 'दिन की लगातार पढ़ाई', 'Tasks Done': 'काम पूरे',
        'My Level': 'मेरा स्तर', "Aaj Ki Padhai": 'आज की पढ़ाई',
        'Doubts Solved': 'सवाल हल हुए', 'Students': 'छात्र',
        'Mock Tests': 'परीक्षा अभ्यास', 'Shortcut Tricks': 'शॉर्टकट तरकीबें',
        'Questions Asked': 'पूछे गए सवाल', 'Tests Attempted': 'दी गई परीक्षाएँ',
        'Total XP': 'कुल XP', 'League': 'लीग',
        'Class': 'कक्षा', 'Subject': 'विषय', 'Level': 'स्तर',
        'Name': 'नाम', 'Email': 'ईमेल', 'Password': 'पासवर्ड',
        'Weekly Goal': 'साप्ताहिक लक्ष्य', 'Select': 'चुनें', 'Choose': 'चुनें',
        'Welcome': 'स्वागत है', 'Hello': 'नमस्ते', 'Student': 'छात्र'
    };

    // ---------- 2. BASIC ROMAN->DEVANAGARI (Hinglish bachi strings ke liye) ----------
    const ROMAN_MAP = [
        ['shree','श्री'],['shri','श्री'],['karo','करो'],['karo!','करो!'],
        ['hai','है'],['hain','हैं'],['hoga','होगा'],['kya','क्या'],
        ['nahi','नहीं'],['nahi.','नहीं।'],['aap','आप'],['aapka','आपका'],
        ['tum','तुम'],['tumhara','तुम्हारा'],['mera','मेरा'],['meri','मेरी'],
        ['aaj','आज'],['aaj ','आज '],['kal','कल'],['roz','रोज़'],
        ['abhi','अभी'],['turant','तुरंत'],['bahut','बहुत'],['bahot','बहुत'],
        ['accha','अच्छा'],['achha','अच्छा'],['acha','अच्छा'],
        ['sab','सब'],['sabhi','सभी'],['sahi','सही'],['galat','गलत'],
        ['batao','बताओ'],['bataiye','बताइए'],['sunao','सुनाओ'],
        ['bhai','भाई'],['yaar','यार'],['dost','दोस्त'],
        ['bilkul','बिल्कुल'],['zaroor','ज़रूर'],['zaruri','ज़रूरी'],
        ['theek','ठीक'],['sach','सच'],['sach mein','सच में'],
        ['padhai','पढ़ाई'],['pado','पढ़ो'],['seekho','सीखो'],
        ['exam','परीक्षा'],['test','टेस्ट'],['marks','अंक'],
        ['answer','उत्तर'],['question','सवाल'],['solution','हल'],
        ['karo ya','करो या'],['karna','करना'],['karna hai','करना है'],
        ['mil gaya','मिल गया'],['milega','मिलेगा'],['milta','मिलता'],
        ['dekhna','देखना'],['dekho','देखो'],['dikh','दिख'],
        ['jaldi','जल्दी'],['dheere','धीरे'],['pyaar','प्यार'],
        ['dhanyavaad','धन्यवाद'],['dhanyavad','धन्यवाद'],['shukriya','शुक्रिया'],
        ['shubh','शुभ'],['labh','लाभ'],['shubhkamna','शुभकामना']
    ];

    function romanToHindi(text) {
        let out = ' ' + text + ' ';
        for (const [from, to] of ROMAN_MAP) {
            out = out.split(from).join(to);
        }
        return out.trim();
    }

    // ---------- 3. APPLY / REVERT ENGINE ----------
    const STORE_KEY = 'eduva_hindi_mode';
    const DATA_ATTR = 'data-eduva-original';
    let hindiMode = false;

    function isEditable(node) {
        const p = node.parentElement;
        if (!p) return false;
        const tag = (p.tagName || '').toUpperCase();
        return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'SCRIPT' || tag === 'STYLE' || tag === 'OPTION';
    }

    function translateTextNode(node) {
        const original = node.nodeValue;
        if (!original || !original.trim()) return;
        if (node.parentElement && node.parentElement.hasAttribute(DATA_ATTR)) return;

        let translated = original;
        // 1) exact dictionary match (trim ke saath)
        const trimmed = original.trim();
        if (HINDI_DICT[trimmed]) {
            translated = original.replace(trimmed, HINDI_DICT[trimmed]);
        } else {
            // 2) partial replacements (string ke andar)
            let changed = false;
            let tmp = original;
            for (const [en, hi] of Object.entries(HINDI_DICT)) {
                if (en.length > 2 && tmp.includes(en)) { tmp = tmp.split(en).join(hi); changed = true; }
            }
            if (changed) translated = tmp;
        }

        // 3) common roman words -> devanagari (sirf pure roman text par)
        if (/^[a-zA-Z\s.,!?'%0-9।]+$/.test(trimmed) && /[a-zA-Z]/.test(trimmed) && trimmed.length > 3) {
            const dev = romanToHindi(trimmed);
            if (dev !== trimmed) translated = original.replace(trimmed, dev);
        }

        if (translated !== original) {
            const span = document.createElement('span');
            span.setAttribute(DATA_ATTR, '1');
            span.setAttribute('data-eduva-text', encodeURIComponent(original));
            span.textContent = translated;
            node.parentNode.replaceChild(span, node);
        }
    }

    function walkAndTranslate(root) {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
        const nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);
        nodes.forEach(n => { if (!isEditable(n)) translateTextNode(n); });
    }

    function revertHindi(root) {
        root.querySelectorAll('[' + DATA_ATTR + ']').forEach(span => {
            const text = decodeURIComponent(span.getAttribute('data-eduva-text'));
            const txt = document.createTextNode(text);
            span.parentNode.replaceChild(txt, span);
        });
    }

    // ---------- 4. TOGGLE + BUTTON ----------
    function applyHindi(on) {
        hindiMode = on;
        localStorage.setItem(STORE_KEY, on ? '1' : '0');
        if (on) {
            walkAndTranslate(document.body);
            document.documentElement.setAttribute('lang', 'hi');
        } else {
            revertHindi(document.body);
        }
        updateToggleBtn();
    }

    function updateToggleBtn() {
        const btn = document.getElementById('eduva-hindi-toggle');
        if (btn) btn.textContent = hindiMode ? '🌐 English' : '🌐 हिंदी';
    }

    function injectToggle() {
        // Header me "Language" button ke paas ek naya button
        const langBtn = document.getElementById('language-toggle-btn');
        const btn = document.createElement('button');
        btn.id = 'eduva-hindi-toggle';
        btn.className = 'p-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl transition cursor-pointer font-bold text-xs';
        btn.style.cssText = 'display:none;'; // desktop header me hidden — mobile "More" menu me dikhta hai
        btn.onclick = () => { applyHindi(!hindiMode); if (window.eduvaAudio) eduvaAudio.pop(); };
        if (langBtn && langBtn.parentNode) langBtn.parentNode.insertBefore(btn, langBtn.nextSibling);
        updateToggleBtn();

        // Mobile "More" menu ke andar bhi option
        const moreMenu = document.getElementById('header-more-menu');
        if (moreMenu) {
            const opt = document.createElement('button');
            opt.id = 'eduva-hindi-toggle-mobile';
            opt.className = 'w-full flex items-center gap-2.5 px-3 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 text-left cursor-pointer';
            opt.innerHTML = '<span class="text-base leading-none">🌐</span> <span id="eduva-hindi-toggle-mobile-label">हिंदी में दिखाओ</span>';
            opt.onclick = () => { applyHindi(!hindiMode); updateMobileLabel(); };
            moreMenu.insertBefore(opt, moreMenu.firstChild);
        }

        // Parents ke liye — Voice button (screen padhne ki zaroorat nahi)
        const moreMenu2 = document.getElementById('header-more-menu');
        if (moreMenu2) {
            const voice = document.createElement('button');
            voice.className = 'w-full flex items-center gap-2.5 px-3 py-2.5 bg-emerald-50 hover:bg-emerald-100 rounded-xl text-xs font-bold text-emerald-800 text-left cursor-pointer';
            voice.innerHTML = '<span class="text-base leading-none">🔊</span> आवाज़ में सुनें (Parents)';
            voice.onclick = () => {
                const text = document.body.innerText.slice(0, 500);
                if ('speechSynthesis' in window) {
                    const u = new SpeechSynthesisUtterance(text);
                    u.lang = 'hi-IN'; u.rate = 0.9;
                    speechSynthesis.cancel(); speechSynthesis.speak(u);
                }
            };
            moreMenu2.insertBefore(voice, moreMenu2.firstChild);
        }
    }

    function updateMobileLabel() {
        const l = document.getElementById('eduva-hindi-toggle-mobile-label');
        if (l) l.textContent = hindiMode ? 'English में दिखाओ' : 'हिंदी में दिखाओ';
    }

    // ---------- 5. BOOT ----------
    function boot() {
        injectToggle();
        const saved = localStorage.getItem(STORE_KEY);
        if (saved === '1') { applyHindi(true); updateMobileLabel(); }

        // Naye dynamically-added content bhi translate ho (SPA views)
        const observer = new MutationObserver(muts => {
            if (!hindiMode) return;
            muts.forEach(m => {
                m.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && !node.hasAttribute(DATA_ATTR)) walkAndTranslate(node);
                });
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();

    // Global API (baaki code se bhi call kar sakte ho)
    window.eduvaApplyHindi = applyHindi;
    window.eduvaHindiMode = () => hindiMode;
})();

/* ---- consolidated block ---- */

(function () {
        var CLASS_DATA = {
            '6':  [{ s: 'गणित', e: '🧮', ch: 'पूर्णांक एवं भिन्न', c: '#2563eb' }, { s: 'विज्ञान', e: '🔬', ch: 'पदार्थ की अवस्थाएँ', c: '#059669' }, { s: 'English', e: '📖', ch: 'Tenses — सही इस्तेमाल', c: '#7c3aed' }],
            '7':  [{ s: 'गणित', e: '🧮', ch: 'सरल समीकरण', c: '#2563eb' }, { s: 'विज्ञान', e: '🔬', ch: 'पोषण एवं श्वसन', c: '#059669' }, { s: 'English', e: '📖', ch: 'Active / Passive Voice', c: '#7c3aed' }],
            '8':  [{ s: 'गणित', e: '🧮', ch: 'घन एवं घनमूल', c: '#2563eb' }, { s: 'विज्ञान', e: '🔬', ch: 'बल एवं दाब', c: '#059669' }, { s: 'English', e: '📖', ch: 'Essay Writing', c: '#7c3aed' }],
            '9':  [{ s: 'गणित', e: '📐', ch: 'बहुपद (Polynomials)', c: '#2563eb' }, { s: 'विज्ञान', e: '⚗️', ch: 'गति एवं बल', c: '#059669' }, { s: 'सामाजिक विज्ञान', e: '🌍', ch: 'अंग्रेजों का शासन', c: '#d97706' }],
            '11': [{ s: 'भौतिकी', e: '⚛️', ch: 'गति की समीकरण', c: '#2563eb' }, { s: 'रसायन', e: '⚗️', ch: 'परमाणु संरचना', c: '#059669' }, { s: 'गणित', e: '📐', ch: 'त्रिकोणमितीय फलन', c: '#7c3aed' }],
            '12': [{ s: 'भौतिकी', e: '⚛️', ch: 'विद्युत धारा', c: '#2563eb' }, { s: 'रसायन', e: '⚗️', ch: 'विलयन', c: '#059669' }, { s: 'गणित', e: '📐', ch: 'समाकलन', c: '#7c3aed' }]
        };

        // 📚 CLASS 10 — POORA CURRICULUM (Phase 1). Baaki classes Phase 2 mein expand hongi.
        var CHAPTER_DATA = {
            '6': {
                'Maths': { e: '🧮', c: '#2563eb', chapters: [
                    ['संख्याओं की जानकारी',' place value | round off'],
                    ['पूर्णांक (Whole)','0,1,2,3... | number line'],
                    ['संख्याओं से खेलना','HCF/LCM | divisibility'],
                    ['ज्यामितीय आकृतियाँ','बिंदु, रेखा, कोण'],
                    ['प्रारंभिक आकृतियाँ','त्रिभुज, चतुर्भुज प्रकार'],
                    ['पूर्णांक (Integers)','+, − संख्याएँ | number line'],
                    ['भिन्न','a/b रूप | equivalent'],
                    ['दशमलव','place value | जोड़-घटाव'],
                    ['आंकड़ों का प्रबंधन','bar graph | mean'],
                    ['क्षेत्रमिति','perimeter, area'],
                    ['बीजगणित','चर, व्यंजक'],
                    ['अनुपात और समानुपात','a:b | unitary'],
                    ['सममिति','line symmetry'],
                    ['व्यावहारिक ज्यामिति','ruler-compass निर्माण']
                ]},
                'Science': { e: '🔬', c: '#059669', chapters: [
                    ['भोजन कहाँ से आता है','sources | nutrients'],
                    ['भोजन के घटक','carbs, proteins, vitamins'],
                    ['तंतु से वस्त्र तक','natural/synthetic fibres'],
                    ['पदार्थों के समूह','metal, non-metal'],
                    ['पदार्थों का पृथक्करण','filtration, evaporation'],
                    ['आसपास के परिवर्तन','reversible/irreversible'],
                    ['पौधों को जानिए','parts | herbs, shrubs'],
                    ['शरीर में गति','bones, joints'],
                    ['सजीव एवं पर्यावरण','habitat, adaptation'],
                    ['गति और दूरी मापन','speed = दूरी/समय'],
                    ['प्रकाश-छाया-परावर्तन','shadow | ∠i=∠r'],
                    ['विद्युत और परिपथ','conductor, insulator'],
                    ['चुंबकों का आनंद','poles | attraction'],
                    ['जल','cycle, conservation'],
                    ['हवा','atmosphere layers'],
                    ['कचरा संग्रहण','reduce, reuse, recycle']
                ]},
                'सामाजिक विज्ञान': { e: '🌍', c: '#d97706', chapters: [
                    ['क्या, कब, कैसे','इतिहास की समझ'],
                    ['मानवीय सभ्यताएँ','नदी घाटी'],
                    ['राजाओं और धर्म','प्राचीन भारत'],
                    ['भक्ति और सूफी','मध्यकाल'],
                    ['विविधता और लोकतंत्र','समाज में मतभेद'],
                    ['सरकार क्या करती है','कार्य और शाखाएँ'],
                    ['सौरमंडल और ग्लोब','ग्रह, अक्षांश'],
                    ['मानचित्र कैसे पढ़ें','symbols, scale'],
                    ['भारत: भूमि और जल','स्थिति, पड़ोसी देश']
                ]},
                'English': { e: '📖', c: '#7c3aed', chapters: [
                    ['A Tale of Two Birds','moral story'],
                    ['The Friendly Mongoose','trust and fear'],
                    ['Taro’s Reward','hard work pays']
                ]},
                'Hindi': { e: '📚', c: '#dc2626', chapters: [
                    ['वह चिड़िया जो','निदा फ़ाज़ली'],
                    ['बचपन','कुसुमाग्रज'],
                    ['मीरा का पद','भक्ति काव्य']
                ]}
            },
            '7': {
                'Maths': { e: '🧮', c: '#2563eb', chapters: [
                    ['पूर्णांक','add, subtract | number line'],
                    ['भिन्न एवं दशमलव','operations | applications'],
                    ['आंकड़ों का प्रबंधन','mean, median, mode'],
                    ['सरल समीकरण','x + a = b हल'],
                    ['रेखाएँ और कोण','types of angles'],
                    ['त्रिभुज और गुणधर्म','angle sum = 180°'],
                    ['तुलना करना','profit%, loss%'],
                    ['परिमेय संख्याएँ','p/q रूप | number line'],
                    ['परिमाप और क्षेत्रफल','rectangle, square'],
                    ['बीजीय व्यंजक','terms, coefficients'],
                    ['घातांक और घात','laws of exponents'],
                    ['सममिति','rotational symmetry'],
                    ['ठोस आकारों की कल्पना','nets | cube, cuboid']
                ]},
                'Science': { e: '🔬', c: '#059669', chapters: [
                    ['पोषण','carbs, proteins'],
                    ['अम्ल, क्षार, लवण','indicators, pH'],
                    ['ऊष्मा','conduction, convection'],
                    ['गति और समय','speed = d/t'],
                    ['विद्युत','current, circuits'],
                    ['रोशनी','reflection, images'],
                    ['मानव तंत्र','organs, systems'],
                    ['पौधे','photosynthesis'],
                    ['मौसम और जलवायु','monsoon'],
                    ['मिट्टी','types, crops'],
                    ['श्वसन','aerobic, anaerobic'],
                    ['परिवहन','blood, xylem'],
                    ['उत्सर्जन','kidney, sweat']
                ]},
                'सामाजिक विज्ञान': { e: '🌍', c: '#d97706', chapters: [
                    ['अध्याय 1: मध्यकाल','sources of history'],
                    ['नई किंडम और साम्राज्य','राजपूत, चोल'],
                    ['दिल्ली सल्तनत','administration'],
                    ['मुगल साम्राज्य','Akbar की नीतियाँ'],
                    ['लोकतंत्र के सिद्धांत','equality, justice'],
                    ['विधानमंडल','Lok Sabha, Rajya Sabha'],
                    ['भारत का वातावरण','climate, monsoon'],
                    ['अंदरूनी जल','rivers, lakes'],
                    ['बाजार के आसपास','trade, shops']
                ]},
                'English': { e: '📖', c: '#7c3aed', chapters: [
                    ['Three Questions','Tolstoy ki kahani'],
                    ['A Gift of Chappals','humour, kindness'],
                    ['The Ashes That Made Trees Bloom','Japanese tale']
                ]},
                'Hindi': { e: '📚', c: '#dc2626', chapters: [
                    ['हम पंछी उन्मुक्त गगन के','स्वतंत्रता की कविता'],
                    ['दादी माँ','कुसुमाग्रज'],
                    ['हिमालय की बेटियाँ','नारी शक्ति']
                ]}
            },
            '8': {
                'Maths': { e: '🧮', c: '#2563eb', chapters: [
                    ['परिमेय संख्याएँ','closure, commutativity'],
                    ['एक चर रेखिक समीकरण','ax + b = c'],
                    ['चतुर्भुज','angles | parallelogram'],
                    ['आंकड़ों का प्रबंधन','pie chart, histogram'],
                    ['वर्ग और वर्गमूल','√ निकालना'],
                    ['घन और घनमूल','cube roots'],
                    ['तुलना करना','compound interest'],
                    ['बीजीय व्यंजक और सर्वसमिकाएँ','(a+b)² family'],
                    ['क्षेत्रमिति','trapezium, polygon'],
                    ['घातांक और घात','negative exponents'],
                    ['सीधा/व्युत्क्रम समानुपात','proportion'],
                    ['गुणनखंड','common factors'],
                    ['आलेखों से परिचय','line graph']
                ]},
                'Science': { e: '🔬', c: '#059669', chapters: [
                    ['फसल उत्पादन','kharif, rabi'],
                    ['सूक्ष्मजीव','virus, bacteria'],
                    ['कोयला-पेट्रोल-ईंधन','fossil fuels'],
                    ['ज्वालन (दहन)','flammable, ignition'],
                    ['ऊष्मा','conductor, insulator'],
                    ['बल और दाब','P = F/A'],
                    ['घर्षण','types | uses'],
                    ['ध्वनि','vibration | amplitude'],
                    ['रासायनिक प्रभाव','electrolysis'],
                    ['विद्युत','Ohm | circuits'],
                    ['प्रकाश','reflection | mirrors'],
                    ['प्राकृतिक परिघटनाएँ','lightning, earthquake']
                ]},
                'सामाजिक विज्ञान': { e: '🌍', c: '#d97706', chapters: [
                    ['आधुनिक भारत','British rule शुरुआत'],
                    ['1857 की क्रांति','causes, results'],
                    ['समाज सुधार','Raja Ram Mohan Roy'],
                    ['स्वतंत्रता आंदोलन','Gandhi era'],
                    ['संविधान और न्याय','Preamble, courts'],
                    ['संसद','functions, sessions'],
                    ['संघवाद','centre-state'],
                    ['भारत की जलवायु','monsoon mechanism'],
                    ['कृषि और उद्योग','types, zones']
                ]},
                'English': { e: '📖', c: '#7c3aed', chapters: [
                    ['The Best Christmas Present','moral story'],
                    ['The Ant and the Cricket','poem: hard work'],
                    ['The Tsunami','courage, humanity']
                ]},
                'Hindi': { e: '📚', c: '#dc2626', chapters: [
                    ['लाख की चूड़ियाँ','रामकुमार वर्मा'],
                    ['बस की यात्रा','हरिशंकर परसाई'],
                    ['दीवानों की हस्ती','कबीर के दोहे']
                ]}
            },
            '9': {
                'Maths': { e: '📐', c: '#2563eb', chapters: [
                    ['वास्तविक संख्याएँ','irrational numbers'],
                    ['बहुपद','zeroes, factor theorem'],
                    ['निर्देशांक ज्यामिति','axes, quadrants'],
                    ['दो चर रेखिक समीकरण','ax + by + c = 0'],
                    ['रेखाएँ और कोण','linear pair | vertically opposite'],
                    ['त्रिभुज','congruence rules'],
                    ['चतुर्भुज','parallelogram properties'],
                    ['वृत्त','chord, arc, angle'],
                    ['हीरोन का सूत्र','area = √[s(s−a)...]'],
                    ['पृष्ठीय क्षेत्रफल-आयतन','cube, cylinder, cone'],
                    ['सांख्यिकी','mean, median, mode']
                ]},
                'Science': { e: '⚗️', c: '#059669', chapters: [
                    ['पदार्थ की अवस्थाएँ','solid, liquid, gas'],
                    ['पदार्थ शुद्ध हैं?','mixtures, solutions'],
                    ['परमाणु और अणु','mole concept'],
                    ['परमाणु की संरचना','electron shells'],
                    ['जीवन की मौलिक इकाई','cell, organelles'],
                    ['ऊतक','plant, animal tissues'],
                    ['गति','v = s/t | graphs'],
                    ['बल और गति के नियम','Newton ke niyam'],
                    ['गुरुत्वाकर्षण','g = 9.8 m/s²'],
                    ['कार्य और ऊर्जा','W = F×s | joule'],
                    ['ध्वनि','waves | frequency'],
                    ['खाद्य संसाधन','crops, improvement']
                ]},
                'सामाजिक विज्ञान': { e: '🌍', c: '#d97706', chapters: [
                    ['फ्रांसीसी क्रांति','1789 | causes'],
                    ['समाजवाद','Russia | USSR'],
                    ['नाज़ीवाद','Hitler ka utthaan'],
                    ['रूसी क्रांति','1917'],
                    ['लोकतंत्र क्या, क्यों?','features'],
                    ['संविधानिक रचना','rights, duties'],
                    ['चुनाव','process, fairness'],
                    ['भारत: स्थिति और विस्तार','location'],
                    ['भौतिक स्वरूप','mountains, plains'],
                    ['गरीबी और भोजन','PDS, schemes']
                ]},
                'English': { e: '📖', c: '#7c3aed', chapters: [
                    ['The Fun They Had','future vs past schools'],
                    ['The Sound of Music','Evelyn Glennie'],
                    ['The Little Girl','Kezia aur papa']
                ]},
                'Hindi': { e: '📚', c: '#dc2626', chapters: [
                    ['दो बैलों की कथा','प्रेमचंद'],
                    ['ल्हासा की ओर','राहुल सांकृत्यायन'],
                    ['रैदास के पद','भक्ति काव्य']
                ]}
            },
            '10': {
                'Maths': { e: '📐', c: '#7c3aed', chapters: [
                    ['वास्तविक संख्याएँ', 'HCF×LCM = a×b | यूक्लिड: a = bq + r'],
                    ['बहुपद', 'α+β = −b/a | αβ = c/a'],
                    ['रेखिक समीकरण युग्म', 'अद्वितीय हल: a₁/a₂ ≠ b₁/b₂'],
                    ['द्विघात समीकरण', 'x = [−b±√(b²−4ac)]/2a | D = b²−4ac'],
                    ['समांतर श्रेणी (AP)', 'aₙ = a+(n−1)d | Sₙ = n/2[2a+(n−1)d]'],
                    ['त्रिभुज', 'BPT: DE∥BC ⇒ AD/DB = AE/EC'],
                    ['निर्देशांक ज्यामिति', 'दूरी = √[(x₂−x₁)²+(y₂−y₁)²]'],
                    ['त्रिकोणमिति', 'sin²θ+cos²θ = 1'],
                    ['त्रिकोणमिति के अनुप्रयोग', 'tanθ = लंब/आधार'],
                    ['वृत्त', 'स्पर्श-रेखा ⊥ त्रिज्या | PA = PB'],
                    ['वृत्त के क्षेत्रफल', 'त्रिज्यखंड = (θ/360)×πr²'],
                    ['पृष्ठीय क्षेत्रफल और आयतन', 'बेलन V=πr²h | शंकु V=(1/3)πr²h'],
                    ['सांख्यिकी', 'Mode = 3M − 2x̄'],
                    ['प्रायिकता', 'P(E) = अनुकूल/कुल | 0≤P≤1']
                ]},
                'Science': { e: '⚗️', c: '#059669', chapters: [
                    ['रासायनिक अभिक्रियाएँ', 'संयोजन/वियोजन/विस्थापन + संतुलन'],
                    ['अम्ल, क्षार और लवण', 'pH<7 अम्ल | अम्ल+क्षार→लवण+जल'],
                    ['धातु और अधातु', 'क्रियाशीलता श्रेणी | रेडॉक्स'],
                    ['कार्बन के यौगिक', 'समावयवता | साबुनीकरण'],
                    ['जीवन की प्रक्रियाएँ', 'श्वसन, पोषण, परिवहन, उत्सर्जन'],
                    ['नियंत्रण और समन्वय', 'प्रतिवर्त | हॉर्मोन'],
                    ['जनन', 'अलैंगिक/लैंगिक | मानव जनन तंत्र'],
                    ['आनुवंशिकता', 'मेंडल 3:1 | जीन और DNA'],
                    ['प्रकाश', '1/v+1/u=1/f | ∠i=∠r'],
                    ['मानव नेत्र', 'मायोपिया→अवतल | हाइपर→उत्तल'],
                    ['विद्युत', 'V=IR | P=VI | श्रेणी/समांतर'],
                    ['चुंबकीय प्रभाव', 'फ्लेमिंग वाम-हस्त (मोटर)'],
                    ['हमारा पर्यावरण', 'पोषी स्तर | 10% ऊर्जा नियम']
                ]},
                'सामाजिक विज्ञान': { e: '🌍', c: '#d97706', chapters: [
                    ['राष्ट्रवाद यूरोप में', '1789 फ्रांस क्रांति → 1871 जर्मनी'],
                    ['भारत में राष्ट्रवाद', '1915→1947: गाँधी युग की timeline'],
                    ['वैश्विक विश्व का निर्माण', 'रेशम/मसाला मार्ग, उपनिवेश'],
                    ['मुद्रण संस्कृति', 'पुस्तकों ने जनमत बनाया'],
                    ['संसाधन और विकास', 'भूमि-उपयोग वर्ग | जल-अभाव'],
                    ['कृषि', 'खरीफ/रबी | जूट, चाय, कपास'],
                    ['शक्ति की साझेदारी', 'संघ/राज्य/समवर्ती सूची'],
                    ['राजनीतिक दल', 'राष्ट्रीय/क्षेत्रीय | चुनाव चिह्न'],
                    ['विकास', 'GDP, HDI, सतत विकास'],
                    ['वैश्वीकरण', 'MNC, उदारीकरण, WTO']
                ]},
                'English': { e: '📖', c: '#2563eb', chapters: [
                    ['A Letter to God', 'Faith, irony, Lencho ka hailstorm'],
                    ['Nelson Mandela', 'Freedom, apartheid, sacrifice'],
                    ['Glimpses of India', 'Goa, Assam, Karnataka की कहानियाँ'],
                    ['Amanda! (poem)', 'Imagination vs parental nagging'],
                    ['A Tiger in the Zoo', 'Freedom vs captivity (imagery)']
                ]},
                'Hindi': { e: '📚', c: '#dc2626', chapters: [
                    ['बड़े भाई साथ (प्रेमचंद)', 'संघर्ष, त्याग, परिवार'],
                    ['डायरी का एक पन्ना', 'आत्मनिरीक्षण की शैली'],
                    ['तीसरी कसम (शैलेंद्र)', 'हीरा की कहानी — वादा और मर्यादा'],
                    ['कारतूस (हबीब तनवीर)', '1857 की पृष्ठभूमि'],
                    ['बिहारी के दोहे', 'रस, अलंकार, लोक-जीवन']
                ]}
            },
            '11': {
                'Physics': { e: '⚛️', c: '#2563eb', chapters: [
                    ['मात्रक और मापन','SI units | errors'],
                    ['सरल रेखा में गति','v = u + at'],
                    ['तल में गति','projectile'],
                    ['गति के नियम','F = ma'],
                    ['कार्य, ऊर्जा और शक्ति','W = F·s'],
                    ['कणों का तंत्र और घूर्णी गति','torque'],
                    ['गुरुत्वाकर्षण','GMm/r²'],
                    ['ठोसों के यांत्रिक गुण','elasticity'],
                    ['द्रवों के यांत्रिक गुण','pressure, Bernoulli'],
                    ['द्रव्य की तापीय गुण','expansion'],
                    ['उष्मागतिकी','laws of thermodynamics'],
                    ['गैसों का अगुणित सिद्धांत','PV = nRT'],
                    ['दोलन','SHM | T = 2π√(l/g)'],
                    ['तरंगें','v = fλ']
                ]},
                'Chemistry': { e: '⚗️', c: '#059669', chapters: [
                    ['रसायन की मूल अवधारणाएँ','mole concept'],
                    ['परमाणु की संरचना','orbitals'],
                    ['तत्त्वों का वर्गीकरण','periodic trends'],
                    ['रासायनिक आबंधन','ionic, covalent'],
                    ['उष्मागतिकी','ΔH, entropy'],
                    ['साम्य','Kc, Le Chatelier'],
                    ['रेडॉक्स अभिक्रियाएँ','oxidation number'],
                    ['कार्बनिक रसायन के मूल सिद्धांत','IUPAC'],
                    ['हाइड्रोकार्बन','alkane, alkene, alkyne']
                ]},
                'Maths': { e: '📐', c: '#7c3aed', chapters: [
                    ['समुच्चय','union, intersection'],
                    ['संबंध और फलन','domain, range'],
                    ['त्रिकोणमितीय फलन','identities'],
                    ['सम्मिश्र संख्याएँ','i² = −1'],
                    ['रेखीय असमिकाएँ','number line'],
                    ['क्रमचय और संचय','nCr, nPr'],
                    ['द्विपद प्रमेय','(a+b)ⁿ'],
                    ['अनुक्रम और श्रेणी','AP, GP'],
                    ['सरल रेखाएँ','slope'],
                    ['शंकु परिच्छेद','circle, parabola'],
                    ['त्रि-आयामी ज्यामिति','direction ratios'],
                    ['सीमा और अवकलज','dy/dx'],
                    ['सांख्यिकी','mean, SD'],
                    ['प्रायिकता','P(E)']
                ]},
                'Biology': { e: '🧬', c: '#dc2626', chapters: [
                    ['जीव जगत','classification'],
                    ['वानस्पतिक वर्गीकरण','plant kingdom'],
                    ['प्राणी जगत','animal kingdom'],
                    ['पुष्पी पादपों का आकारिकी','morphology'],
                    ['पादपों का शारीरक','anatomy'],
                    ['जंतुओं में संरचनात्मक संगठन','tissues'],
                    ['जीवन की इकाई — कोशिका','cell organelles'],
                    ['जैव-अणु','proteins, DNA'],
                    ['कोशिका चक्र और विभाजन','mitosis, meiosis'],
                    ['पादपों में परिवहन','xylem, phloem'],
                    ['खनिज पोषण','N, P, K'],
                    ['प्रकाश संश्लेषण','Calvin cycle'],
                    ['पादप श्वसन','glycolysis'],
                    ['मानव श्वसन','lungs'],
                    ['तंत्रिका नियंत्रण','reflex arc']
                ]},
                'English': { e: '📖', c: '#d97706', chapters: [
                    ['The Portrait of a Lady','Khushwant Singh'],
                    ['We’re Not Afraid to Die','courage at sea'],
                    ['Discovering Tut','history mystery']
                ]},
                'Hindi': { e: '📚', c: '#0891b2', chapters: [
                    ['कबीर के दोहे','भक्ति रस'],
                    ['मीरा के पद','कृष्ण-भक्ति'],
                    ['रहीम के दोहे','लोकजीवन']
                ]}
            },
            '12': {
                'Physics': { e: '⚛️', c: '#2563eb', chapters: [
                    ['वैद्युत आवेश और क्षेत्र','Coulomb: F = kq₁q₂/r²'],
                    ['स्थिरवैद्युत विभव','V = kq/r'],
                    ['धारा विद्युत','Ohm | R = ρl/A'],
                    ['गतिशील आवेश और चुंबकत्व','F = qvB'],
                    ['चुंबकत्व और द्रव्य','dipole'],
                    ['विद्युत-चुंबकीय प्रेरण','Faraday ka niyam'],
                    ['प्रत्यावर्ती धारा','RMS value'],
                    ['विद्युत-चुंबकीय तरंगें','EM spectrum'],
                    ['किरण प्रकाशिकी','mirror/lens formula'],
                    ['तरंग प्रकाशिकी','interference'],
                    ['विकिरण का द्वैत स्वभाव','photoelectric'],
                    ['परमाणु','Bohr model'],
                    ['नाभिक','E = mc²'],
                    ['अर्धचालक इलेक्ट्रॉनिक्स','diode, transistor']
                ]},
                'Chemistry': { e: '⚗️', c: '#059669', chapters: [
                    ['विलयन','molarity, molality'],
                    ['विद्युत रसायन','Faraday ke niyam'],
                    ['रासायनिक बलगतिकी','rate laws'],
                    ['d- और f-ब्लॉक तत्त्व','transition metals'],
                    ['उपसहसंयोजन यौगिक','coordination'],
                    ['हैलोएल्केन और हैलोऐरीन','SN1, SN2'],
                    ['एल्कोहॉल, फीनॉल, ईथर','reactions'],
                    ['एल्डिहाइड और कीटोन','oxidation-reduction'],
                    ['ऐमाइन','basicity'],
                    ['जैव-अणु','carbs, proteins']
                ]},
                'Maths': { e: '📐', c: '#7c3aed', chapters: [
                    ['संबंध और फलन','types'],
                    ['प्रतिलोम त्रिकोणमितीय फलन','domains'],
                    ['आव्यूह','operations | inverse'],
                    ['सारणिक','|A| properties'],
                    ['सांतत्य और अवकलनीयता','dy/dx rules'],
                    ['अवकलज के अनुप्रयोग','maxima-minima'],
                    ['समाकलन','∫ techniques'],
                    ['समाकलन के अनुप्रयोग','area under curve'],
                    ['अवकल समीकरण','dy/dx = f(x,y)'],
                    ['सदिश बीजगणित','dot, cross'],
                    ['त्रि-आयामी ज्यामिती','planes, lines'],
                    ['रैखिक प्रोग्रामन','LPP'],
                    ['प्रायिकता','Bayes theorem']
                ]},
                'Biology': { e: '🧬', c: '#dc2626', chapters: [
                    ['पुष्पी पादपों में लैंगिक जनन','pollination'],
                    ['मानव जनन','reproductive system'],
                    ['जनन स्वास्थ्य','contraception'],
                    ['वंशागति के सिद्धांत','Mendel ke niyam'],
                    ['वंशागति का आणविक आधार','DNA replication'],
                    ['उद्भव','evolution'],
                    ['मानव स्वास्थ्य और रोग','immunity'],
                    ['मानव कल्याण में सूक्ष्मजीव','antibiotics'],
                    ['जैव-प्रौद्योगिकी: सिद्धांत','PCR, cloning'],
                    ['जैव-प्रौद्योगिकी के अनुप्रयोग','GMO, insulin'],
                    ['जीव और समष्टियाँ','population'],
                    ['पारिस्थितिक तंत्र','food chain'],
                    ['जैव-विविधता','hotspots']
                ]},
                'English': { e: '📖', c: '#d97706', chapters: [
                    ['The Last Lesson','Franco-Prussian war'],
                    ['Lost Spring','child labour'],
                    ['Deep Water','fear of water'],
                    ['Indigo','Gandhi in Champaran']
                ]},
                'Hindi': { e: '📚', c: '#0891b2', chapters: [
                    ['आरोह के काव्यांश','आधुनिक कविता'],
                    ['उपन्यास के अंश','कथ्य और शिल्प'],
                    ['संस्मरण के अंश','अनुभव-लेखन']
                ]}
            }
        };

        // 🧠 Chapter button

        // ▶ Video: chapter ke liye YouTube search kholta hai (zero-maintenance)
        window.watchChapter = function (cls, subj, ch) {
            try {
                var q = encodeURIComponent('Class ' + cls + ' ' + subj + ' ' + ch + ' NCERT Hindi');
                window.open('https://www.youtube.com/results?search_query=' + q, '_blank');
            } catch (e) {}
        };

        // 🧠 Chapter button: chat kholta hai, prompt prefilled
        window.askChapter = function (cls, subj, ch, mode) {
            try {
                if (typeof switchTab === 'function') switchTab('chat');
                setTimeout(function () {
                    var input = document.getElementById('chat-input');
                    if (!input) return;
                    input.value = (mode === 'full')
                        ? 'Class ' + cls + ' ' + subj + ' — ' + ch + ': key concepts aur important formulas step-by-step Hindi mein samjhao.'
                        : 'Class ' + cls + ' ' + subj + ' (' + ch + '): ';
                    input.focus();
                }, 400);
            } catch (e) {}
        };

        function getCls() {
            try {
                var p = JSON.parse(localStorage.getItem('eduva_student_profile') || '{}');
                if (p.cls && (CHAPTER_DATA[p.cls] || CLASS_DATA[p.cls])) return p.cls;
            } catch (e) {}
            return '10';
        }

        window.renderContinueLearning = function () {
            var box = document.getElementById('continue-learning-body');
            if (!box) return;
            var cls = getCls();
            var prog = {};
            try { prog = JSON.parse(localStorage.getItem('eduva_subject_progress_v1') || '{}'); } catch (e) {}

            // 🆕 Naya: Class 10 (aur jahan CHAPTER_DATA ho) → full chapter accordion
            var CD = CHAPTER_DATA[cls];
            if (CD) {
                box.innerHTML = Object.keys(CD).map(function (sub) {
                    var d = CD[sub];
                    var pct = Math.min(100, Math.max(0, prog[sub] || 0));
                    var rows = d.chapters.map(function (ch) {
                        return '<div class="flex items-center gap-2 py-2 border-b border-slate-100 last:border-0">'
                            + '<div class="flex-1 min-w-0"><strong class="text-[13px] text-slate-900 block truncate">' + ch[0] + '</strong>'
                            + '<span class="text-[10px] text-slate-500 block truncate">' + ch[1] + '</span></div>'
                            + '<button onclick="askChapter(\'' + cls + '\',\'' + sub + '\',\'' + ch[0].replace(/'/g, '') + '\',\'full\')" class="px-2.5 py-1.5 rounded-lg text-[11px] font-black text-white shrink-0" style="background:' + d.c + '">🧠 Samjho</button>'
                            + '<button onclick="askChapter(\'' + cls + '\',\'' + sub + '\',\'' + ch[0].replace(/'/g, '') + '\',\'doubt\')" class="px-2.5 py-1.5 rounded-lg text-[11px] font-black bg-slate-900 text-white shrink-0">📸 Doubt</button>'
                            + '<button onclick="watchChapter(\'' + cls + '\',\'' + sub + '\',\'' + ch[0].replace(/'/g, '') + '\')" class="px-2 py-1.5 rounded-lg text-[11px] font-black bg-red-600 text-white shrink-0" title="Video lessons">▶</button>'
                            + '</div>';
                    }).join('');
                    return '<details class="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden mb-2">'
                        + '<summary class="flex items-center gap-3.5 p-3.5 cursor-pointer list-none">'
                        + '<div class="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-lg shrink-0" style="background:' + d.c + '18;color:' + d.c + '">' + d.e + '</div>'
                        + '<div class="flex-1"><strong class="text-sm block text-slate-900">' + sub + ' <span class="text-[10px] text-slate-400 font-bold">(Class ' + cls + ')</span></strong>'
                        + '<div class="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2"><div class="h-full rounded-full" style="width:' + pct + '%;background:' + d.c + '"></div></div></div>'
                        + '<b class="text-xs font-black shrink-0" style="color:' + d.c + '">' + (pct === 0 ? 'शुरू करें' : pct + '%') + '</b>'
                        + '</summary>'
                        + '<div class="px-3.5 pb-2 bg-white">' + rows + '</div>'
                        + '</details>';
                }).join('');
                return;
            }

            // ⬇️ Purana: baaki classes (6-9, 11-12) ke liye demo cards
            box.innerHTML = CLASS_DATA[cls].map(function (sub) {
                var pct = Math.min(100, Math.max(0, prog[sub.s] || 0));
                var badge = pct === 0 ? '<b class="text-xs text-emerald-600 font-black">शुरू करें →</b>'
                                      : '<b class="text-xs font-black" style="color:' + sub.c + '">' + pct + '%</b>';
                return '<div onclick="switchTab(\'learning\')" class="flex items-center gap-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer hover:border-blue-300 transition">'
                    + '<div class="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-lg" style="background:' + sub.c + '18;color:' + sub.c + '">' + sub.e + '</div>'
                    + '<div class="flex-1"><strong class="text-sm block text-slate-900">' + sub.s + ' <span class="text-[10px] text-slate-400 font-bold">(Class ' + cls + ')</span></strong>'
                    + '<span class="text-xs text-slate-500">' + sub.ch + '</span>'
                    + '<div class="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2"><div class="h-full rounded-full transition-all duration-700" style="width:' + pct + '%;background:' + sub.c + '"></div></div></div>'
                    + badge + '</div>';
            }).join('');
        };
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', window.renderContinueLearning);
        else window.renderContinueLearning();
    })();

/* ---- consolidated block ---- */

window.eduvaCopyNotes = function(){ try{ var t=document.getElementById('notesText'); t.select(); navigator.clipboard.writeText(t.value).then(function(){alert('📋 Notes copy हो गए!');}); }catch(e){ alert('Copy नहीं हुआ — text select करके खुद copy कर लो'); } };

/* ---- consolidated block ---- */

// ============ REAL PWA INSTALL BUTTON ============
    var __eduvaBIP = null;
    window.addEventListener('beforeinstallprompt', function (e) {
        e.preventDefault();
        __eduvaBIP = e;
    });
    window.addEventListener('appinstalled', function () {
        __eduvaBIP = null;
        try { if (typeof eduvaTrack === 'function') eduvaTrack('install', { via: 'button' }); } catch (e) {}
        alert('🎉 EDUVA install हो गई! Home screen पर icon दिखेगा — अब app की तरह खुलेगी।');
    });
    window.eduvaInstallApp = function () {
        if (__eduvaBIP) {
            __eduvaBIP.prompt();
            __eduvaBIP.userChoice.then(function (choice) {
                if (choice.outcome === 'accepted') {
                    try { if (typeof eduvaTrack === 'function') eduvaTrack('install', { via: 'prompt-accepted' }); } catch (e) {}
                }
                __eduvaBIP = null;
            });
        } else {
            // Fallback: simple step-by-step instructions (iPhone / desktop / already installed)
            var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
            var msg = isIOS
                ? '📲 iPhone पर install:\n\n1. Safari में नीचे "Share" बटन दबाओ\n2. "Add to Home Screen" चुनो\n3. "Add" दबाओ — हो गया! ✅'
                : '📲 Install करने के steps:\n\n1. Chrome में ऊपर 3-dots (⋮) menu खोलो\n2. "Add to Home Screen" / "Install app" चुनो\n3. "Install" दबाओ — हो गया! ✅\n\n(पहले से installed है? तो app चला रहे हो!)';
            alert(msg);
            try { if (typeof eduvaTrack === 'function') eduvaTrack('cta_click', { label: 'InstallFallbackShown' }); } catch (e) {}
        }
    };

/* ---- consolidated block ---- */

// ============ FULL UI ENGLISH MODE ============
    (function () {
        var EN_DICT = {
            'अपना पहला सवाल पूछो (FREE)':'Ask your first question (FREE)',
            'सवाल की Photo भेजो':'Send a photo of your question','तुरंत Solution पाओ':'Get instant solution',
            'बिना app download किए अभी इस्तेमाल करो':'Use right now without downloading the app',
            'App Install करें (FREE)':'Install App (FREE)','Android Chrome पर एक tap में':'One tap on Android Chrome',
            'अपना Batch चुनें':'Choose your batch','होम डैशबोर्ड':'Home Dashboard','मेरी पढ़ाई और विषय':'My Learning & Subjects',
            'हौसला और करियर':'Motivation & Career','मानसिक स्वास्थ्य':'Mental Health','AI चैट और सवाल':'AI Chat & Doubts',
            'समुदाय सवाल-पूल':'Community Doubt Pool','फ़्लैश कार्ड':'Flashcards','परीक्षा अभ्यास':'Mock Test',
            'अखिल भारतीय परीक्षा':'All India Test','रोज़ का होमवर्क':'Daily Homework','AI लड़ाई मोड':'AI Battle Mode',
            'पेपर भविष्यवाणी':'Paper Predictor','मौखिक परीक्षक':'Viva Examiner','मेरी लीग':'My League',
            'रोज़ का स्पिन':'Daily Spin','मेरा पेड़':'My Tree','साप्ताहिक रिपोर्ट':'Weekly Report',
            'सूत्रों का कोष':'Formula Vault','मेरी गलतियों की किताब':'My Mistake Book','माता-पिता रिपोर्ट':'Parent Report',
            'AI समय-सारणी':'AI Time Table','ध्यान टाइमर':'Focus Timer','स्टडी रूम':'Study Room',
            'पुराने पेपर':'PYQ Library','बोलने की अंग्रेज़ी':'Spoken English','कंप्यूटर और AI':'Computer & AI',
            'वैदिक गणित':'Vedic Maths','कोर्स और AI DPP':'Courses & AI DPP','स्वास्थ्य गाइड':'Health Guide',
            'ओलंपियाड गाइड':'Olympiad Guide','नोट्स भेजें':'Upload Notes','सवालों का भंडार':'Question Bank',
            'प्रमाणपत्र':'Certificates','पढ़ने का सामान':'Study Material','वीडियो पढ़ाई':'Video Lectures',
            'हमारे बारे में':'About Us','संपर्क करें':'Contact Us','मदद और सहायता':'Help & Support',
            'सुझाव और राय':'Feedback & Suggestions','सवाल-जवाब':'FAQs','प्रोफ़ाइल देखें':'View Profile',
            'सब देखें':'View All','लॉगिन':'Login','साइन अप':'Sign Up','होम':'Home','प्रोफ़ाइल':'Profile',
            'सवाल पूछो':'Ask Doubt','सीधा जवाब':'Direct Answer','अभ्यास':'Practice','Edu Sir की आवाज़ सुनें':'Listen to Edu Sir',
            'कम्युनिटी में पूछें':'Ask Community','कोष में सेव करें':'Save to Vault','आवाज़ से पूछें':'Voice Input',
            'फोटो खींचें':'Take Photo','गैलरी से चुनें':'Choose from Gallery','अपना डाउट लिखो भाई':'Type your doubt, friend',
            'पढ़ाई जारी रखें':'Continue Learning','आज का होमवर्क':'Today\'s Homework','रोज़ 3 सवाल • submit करो • Edu Sir खुद marks देंगे':'3 questions daily • submit • AI gives marks',
            'मेरा स्तर':'My Level','काम पूरे':'Tasks Done','दिन लगातार पढ़ाई':'Day Streak','आज की पढ़ाई':'Study Time Today',
            'Board Exam Countdown':'Board Exam Countdown','अपनी exam date चुनो — रोज़ यहाँ countdown दिखेगा!':'Pick your exam date — see countdown daily!',
            'आज का सवाल पूछो (FREE)':'Ask your first question (FREE)',
            'लाइब्रेरी में खोजो...':'Search the library...','खोजें':'Search','सेव करें':'Save','हटाएँ':'Delete',
            'प्रोफ़ाइल बदलें':'Edit Profile','शुरू करें':'Start','रोकें':'Stop','आगे':'Next','पीछे':'Previous',
            'ताज़ा करें':'Refresh','शेयर करें':'Share','डाउनलोड':'Download','बंद करें':'Close','जारी रखें':'Resume',
            'सेव करें ✅':'Save ✅','उत्तर (Answer):':'Answer:','प्रश्न (Question):':'Question:','हल (Solution):':'Solution:',
            'चित्र (Figure):':'Figure:','स्वयं अभ्यास करो:':'Practice yourself:','विषय':'Subject','कक्षा':'Class','तारीख':'Date',
            'पूरी तरह सत्यापित (Verified by Edu Sir)':'Fully verified (by Edu Sir)',
            'Daily Homework 🏠':'Daily Homework 🏠','आज का Homework':'Today\'s Homework',
            'सभी':'All','चुनें':'Select','नाम':'Name','ईमेल':'Email','पासवर्ड':'Password',
            'मेरा पहला सवाल पूछो':'Ask my first question','दोस्तों को भी बताओ':'Tell your friends too',
            'Photo खींचो = Solution पाओ':'Snap photo = Get solution','FREE • Hindi में • Class 6-12':'FREE • Class 6-12',
            'गाँव के बच्चों का अपना कोटा':'Village kids\' own Kota','Link in Bio':'Link in Bio',
            'दिन':'Days','घंटे':'Hours','मिनट':'Minutes','सेकंड':'Seconds','सबको Certificate + Analysis':'Certificate + Analysis for all',
            'TOP 5 → 3 साल FREE':'TOP 5 → 3 years FREE','TOP 100 → 1 साल FREE':'TOP 100 → 1 year FREE',
            'सबसे ऊपर से शुरू करें':'Start from top'
        };
        var ON = false;
        function editable(node){const p=node.parentElement;if(!p)return true;const t=(p.tagName||'').toUpperCase();return t==='INPUT'||t==='TEXTAREA'||t==='SELECT'||t==='SCRIPT'||t==='STYLE'||t==='OPTION';}
        function swap(node, dict, attr) {
            var orig = node.nodeValue; if (!orig || !orig.trim()) return;
            if (node.parentElement && node.parentElement.hasAttribute(attr)) return;
            var out = orig, hit = false;
            var trimmed = orig.trim();
            if (dict[trimmed]) { out = orig.replace(trimmed, dict[trimmed]); hit = true; }
            else { for (var k in dict) { if (k.length > 1 && out.indexOf(k) !== -1) { out = out.split(k).join(dict[k]); hit = true; } } }
            if (!hit) return;
            var sp = document.createElement('span');
            sp.setAttribute(attr, '1');
            sp.setAttribute('data-eduva-ui', encodeURIComponent(orig));
            sp.textContent = out;
            node.parentNode.replaceChild(sp, node);
        }
        function walk(root, fn) {
            var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), ns = [];
            while (w.nextNode()) ns.push(w.currentNode);
            ns.forEach(function (n) { if (!editable(n)) fn(n); });
        }
        function revert(root, attr) {
            root.querySelectorAll('[' + attr + ']').forEach(function (sp) {
                sp.parentNode.replaceChild(document.createTextNode(decodeURIComponent(sp.getAttribute('data-eduva-ui'))), sp);
            });
        }
        window.eduvaApplyUIEnglish = function (on) {
            ON = on;
            if (on) walk(document.body, function (n) { swap(n, EN_DICT, 'data-eduva-en'); });
            else revert(document.body, 'data-eduva-en');
        };
        // selectLanguage wrap karo (original ke baad UI bhi badlo)
        function hook() {
            if (window.selectLanguage && !window.selectLanguage.__uiHook) {
                var o = window.selectLanguage;
                window.selectLanguage = function (id) {
                    var r = o.apply(this, arguments);
                    try { window.eduvaApplyUIEnglish(id === 'english'); } catch (e) {}
                    return r;
                };
                window.selectLanguage.__uiHook = true;
            }
            // Boot: saved language se UI sync
            try {
                var saved = null;
                try { saved = localStorage.getItem('eduva_current_language') || localStorage.getItem('eduva_lang') || localStorage.getItem('eduva_language'); } catch (e) {}
                if (!saved && typeof currentLanguageId !== 'undefined') saved = currentLanguageId;
                if (saved === 'english') window.eduvaApplyUIEnglish(true);
            } catch (e) {}
        }
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hook);
        else hook();
        // Dynamic content bhi translate ho
        new MutationObserver(function (muts) {
            if (!ON) return;
            muts.forEach(function (m) {
                m.addedNodes.forEach(function (nd) {
                    if (nd.nodeType === 1 && !nd.hasAttribute('data-eduva-en')) walk(nd, function (n) { swap(n, EN_DICT, 'data-eduva-en'); });
                });
            });
        }).observe(document.body, { childList: true, subtree: true });
    })();

/* ---- consolidated block ---- */

(function () {
        'use strict';
        function build() {
            var chat = document.getElementById('view-chat');
            if (!chat || document.getElementById('chat-tools-card')) return;
            var hit = [];
            Array.prototype.forEach.call(chat.querySelectorAll(':scope > div'), function (c) {
                if (c.querySelector && (c.querySelector('a[href="/features.html"]')
                    || c.querySelector('[onclick="openDiary()"]')
                    || c.querySelector('[onclick="openRevision()"]'))) hit.push(c);
            });
            if (!hit.length) return;
            var anchor = hit[0];
            var card = document.createElement('div');
            card.id = 'chat-tools-card';
            card.style.cssText = 'margin:8px 12px 0;';
            card.innerHTML =
                '<button id="chat-tools-toggle" style="width:100%;display:flex;align-items:center;gap:8px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:14px;padding:9px 14px;font-size:12px;font-weight:800;color:#334155;cursor:pointer;">'
                + '<span>📌</span><span style="flex:1;text-align:left;">Study Tools (Diary • Revision • Parent Report)</span>'
                + '<span id="chat-tools-arrow" style="transition:.2s;">▾</span></button>'
                + '<div id="chat-tools-body" style="display:none;grid-template-columns:1fr 1fr;gap:8px;padding:10px 2px 2px;"></div>';
            anchor.parentElement.insertBefore(card, anchor);
            var body = document.getElementById('chat-tools-body');
            [['📓', 'Doubt Diary', "openDiary()", '#0f3c7d'],
             ['📅', 'Aaj ka Revision', "openRevision()", '#065f46'],
             ['👨‍👩‍👦', 'Parent Report', "openParentReport()", '#7c2d12'],
             ['⚡', 'All Features', "window.location.href='/features.html'", '#4f46e5']
            ].forEach(function (t) {
                var b = document.createElement('button');
                b.style.cssText = 'display:flex;align-items:center;gap:8px;background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:10px 12px;font-size:12px;font-weight:800;color:#1c2333;cursor:pointer;text-align:left;box-shadow:0 2px 6px rgba(15,23,42,.05);';
                b.innerHTML = '<span style="font-size:16px;">' + t[0] + '</span>' + t[1];
                b.setAttribute('onclick', t[2]);
                body.appendChild(b);
            });
            document.getElementById('chat-tools-toggle').onclick = function () {
                var open = body.style.display === 'grid';
                body.style.display = open ? 'none' : 'grid';
                document.getElementById('chat-tools-arrow').style.transform = open ? '' : 'rotate(180deg)';
            };
            hit.forEach(function (c) { c.style.display = 'none'; });
        }
        function init() { build(); setTimeout(build, 2000); }
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
        else init();
    })();
