/* ============================================================
   🌐 EDUVA UI TRANSLATOR v1 — Global language = FULL app language
   Reads localStorage 'eduva_language'. Contains 'english' → UI English.
   Framework: text-node walker + dictionary. Add new strings to DICT anytime.
   ============================================================ */
(function () {
    'use strict';
    var DICT = {
        'कम्युनिटी': 'Community', 'वॉल्ट': 'Vault',
        'कम्युनिटी डाउट पूल 👥': 'Community Doubt Pool 👥', 'AI टाइम टेबल जनरेटर': 'AI Time Table Generator',
        '📸 सवाल की Photo भेजो': '🸕 Send a photo of your question', '📸 सवाल की Photo भेजो': '📸 Send a photo of your question',
        'तुरंत Solution पाओ': 'Get instant Solutions', 'FREE • Hindi में • Class 6-12': 'FREE • In Hindi • Class 6-12',
        'बिना app download किए अभी इस्तेमाल करो': 'Use it right now — no download needed',
        '🚀 अपना पहला सवाल पूछो (FREE)': '🚀 Ask your first question (FREE)',
        '📲 App Install करें (FREE)': '📲 Install the App (FREE)', 'Android Chrome पर एक tap में': 'One tap on Android Chrome',
        'माँ-बाप की सबसे बड़ी टेंशन': "Parents' biggest worry", 'तो पढ़ाई भी mobile में ही!': "Then let studies be on mobile too!",
        'और 100% FREE।': 'And 100% FREE.', 'दोस्तों को बताओ — EDUVA FREE है!': 'Tell your friends — EDUVA is FREE!',
        'EDUVA का अनुभव कैसा होगा?': 'How will the EDUVA experience feel?',
        'Ye hai hamara promise — har EDUVA champion ke लिए 🌟': 'This is our promise — for every EDUVA champion 🌟',
        '2-Minute Doubt Solving — Photo bhejo, step-by-step solution Hindi mein, bina ratta.': '2-Minute Doubt Solving — Send a photo, step-by-step solution in Hindi, no rote learning.',
        'AI Marks + Streaks — Roz practice submit karo, streak banao, weak areas pakdo.': 'AI Marks + Streaks — Submit practice daily, build streaks, catch weak areas.',
        'Gamified Learning — Ped badao, spin karo, missions complete karo — padhai game jaisi!': 'Gamified Learning — Grow your tree, spin, complete missions — studies like a game!',
        '⏳ Board Exam Countdown': '⏳ Board Exam Countdown', 'Set करो 👇': 'Set it 👇',
        'अपनी exam date चुनो — रोज़ यहाँ countdown दिखेगा!': 'Choose your exam date — the countdown shows here every day!',
        '🧠 Aaj Ka Concept': '🧠 Concept of the Day', '✨ आज का high-yield concept दिखाओ': '✨ Show today\'s high-yield concept',
        "TODAY'S MISSION": "TODAY'S MISSION", 'पूरा': 'done',
        'आज का Homework': "Today's Homework", 'रोज़ 3 सवाल • submit करो • Edu Sir खुद marks देंगे': '3 questions daily • submit • Edu Sir himself gives marks',
        'Daily Spin — आज का इनाम लो!': 'Daily Spin — Claim today\'s reward!', 'रोज़ 1 free spin • XP, surprises aur bahut kuch!': '1 free spin daily • XP, surprises and much more!',
        'Edu Sir को Yaad Hai...': 'Edu Sir Remembers...', '🧠 2-Min Rapid Revision': '🧠 2-Min Rapid Revision',
        'Day Streak': 'Day Streak', 'Tasks Done': 'Tasks Done', 'My Level': 'My Level', 'Aaj Ki Padhai': "Today's Study",
        'Ask Edu Sir anything... (कोटा स्टाइल में सवाल पूछें)': 'Ask Edu Sir anything... (ask Kota-style)',
        'Ask Your Way (कोटा स्टाइल)': 'Ask Your Way (Kota Style)', '📚 Academics (पढ़ाई)': '📚 Academics',
        '🏆 Challenges (खेल-खेल में पढ़ाई)': '🏆 Challenges (Learning via Games)', '📊 Progress (अपनी रिपोर्ट)': '📊 Progress (Your Report)',
        'मोटिवेशनल वीडियो': 'Motivational videos', 'मेंटल हेल्थ सपोर्ट': 'Mental health support', '1-Min रिवीजन कार्ड्स': '1-min revision cards',
        'अक्सर पूछे जाने वाले सवाल': 'Frequently asked questions',
        'अपना डाउट लिखो भाई...': 'Type your doubt, champion...', '📷 Photo से पूछो': '📷 Ask via Photo',
        '🎤 आवाज़ से': '🎤 By voice', '📝 हैंडरिटेन नोट्स': '📝 Handwritten Notes', '✍️ हैंडरिटेन सॉल्यूशन': '✍️ Handwritten Solution',
        '🔊 Edu Sir को सुनें': '🔊 Listen to Edu Sir', '👥 कम्युनिटी': '👥 Community',
        'AI-generated answer — exam से पहले book से एक बार confirm कर लेना, चैंपियन!': 'AI-generated answer — please confirm once from your book before the exam, champion!',
        'अपना Batch चुनें': 'Choose your Batch', 'हिंदी में दिखाओ': 'Show in Hindi', 'English में दिखाओ': 'Show in English',
        'Teacher Panel — Paper बनाओ & Audit': 'Teacher Panel — Create & Audit Papers',
        'Edu Sir का अंदाज़': "Edu Sir's Style", 'भाषा चुनें': 'Choose Language', 'Feedback भेजें 💬': 'Send Feedback 💬',
        '📚 Padhai': '📚 Study', '📚 Padhai Quick Links': '📚 Study Quick Links',
        'आवाज़ में सुनें (Parents)': 'Listen by voice (Parents)',
        'नमस्ते, चैंपियन! मैं हूँ आपका अपना': 'Namaste, champion! I am your very own',
        'चाहे डायरेक्ट आंसर लो या हिंट लेकर खुद सॉल्व करना सीखो — तेरा भाई हर तरह से तैयार है! बोल, आज का सवाल क्या है?': 'Take a direct answer or learn to solve yourself with hints — your brother is ready in every way! Speak up, what is today\'s question?',
        '🔔 Notifications ON कर लो!': '🔔 Turn Notifications ON!', 'Doubt reply + streak reminder + big announcements': 'Doubt replies + streak reminders + big announcements',
        'Enable': 'Enable', 'रुका हुआ है': 'Paused', 'पढ़ाई': 'Study',
        '🎯 Weights ke saath har sawal, marks turant': '🎯 Every question with weights, marks instantly',
        'शुरू करें': 'Start', 'Test Result जोड़ें': 'Add Test Result',
        'EDU SIR का COACH NOTE': "EDU SIR'S COACH NOTE",
        'आज की Mission अभी शुरू नहीं हुई है — पहला टास्क अभी शुरू करो, momentum बन जाएगा।': "Today's Mission hasn't started yet — start the first task now, momentum will build.",
        'अपनी exam date चुनो — रोज़ यहाँ countdown दिखेगा!': 'Choose your exam date — countdown shows here daily!',
        '✨ आज का high-yield concept दिखाओ': "✨ Show today's high-yield concept",
        'रोज़ 3 सवाल • submit करो • Edu Sir खुद marks देंगे': '3 questions daily • submit • Edu Sir himself gives marks',
        'Daily Spin — आज का इनाम लो!': "Daily Spin — Claim today's reward!",
        'रोज़ 1 free spin • XP, surprises aur bahut kuch!': '1 free spin daily • XP, surprises and more!',
        'आज का Homework': "Today's Homework",
        '0/4 पूरा': '0/4 done', 'पूरा': 'done',
        'Continue Learning (In-App Secured)': 'Continue Learning (In-App Secured)',
        'View All': 'View All',
        'कम्युनिटी': 'Community',
        'EDUVA APP FEATURES': 'EDUVA APP FEATURES',
        'Doubt • Marks • Notes • Tests — सब FREE देखो →': 'Doubt • Marks • Notes • Tests — All FREE →',
        'Doubt Diary': 'Doubt Diary',
        'आवाज़ में सुनें (Parents)': 'Listen by voice (Parents)',
        '⚡ Weights ke saath har sawal, marks turant': '⚡ Every question with weights, marks instantly',
        'Aaj ka Revision': "Today's Revision",
        'roz 5 minute, marks pakke': '5 min daily, marks pakka',
        'hafte ka hisaab, WhatsApp pe': "week's report, on WhatsApp",
        'namaste, चैंपियन! मैं हूँ आपका अपना': 'Namaste, champion! I am your very own'
    };
    function currentLang() {
        try { var l = localStorage.getItem('eduva_language') || 'hinglish'; return l.indexOf('english') !== -1 ? 'en' : 'hi'; } catch (e) { return 'hi'; }
    }
    var applied = null;
    function walk(root, lang) {
        var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
            acceptNode: function (node) {
                if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
                var p = node.parentElement;
                if (!p) return NodeFilter.FILTER_REJECT;
                var tag = p.tagName;
                if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return NodeFilter.FILTER_REJECT;
                if (p.closest('#chat-messages')) return NodeFilter.FILTER_REJECT; // AI answers — chat language controls them
                if (p.closest('.watermark-layer')) return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            }
        });
        var nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);
        nodes.forEach(function (node) {
            if (lang === 'en') {
                var key = node.nodeValue.trim();
                if (DICT[key] !== undefined) {
                    if (node.__hiOrig === undefined) node.__hiOrig = node.nodeValue;
                    node.nodeValue = node.nodeValue.replace(key, DICT[key]);
                }
            } else {
                if (node.__hiOrig !== undefined) { node.nodeValue = node.__hiOrig; }
            }
        });
    }
    function apply() {
        var lang = currentLang();
        if (lang === applied) return;
        applied = lang;
        walk(document.body, lang);
        syncPanels(lang);
    }
    function syncPanels(lang) {
        // Teacher panel + audit — global language se chalao (alag toggle chhupa do)
        try {
            ['pg-lang-wrap', 'dp-lang-wrap'].forEach(function (id) { var el = document.getElementById(id); if (el) el.style.display = 'none'; });
            var pcl = document.getElementById('pcl-hi'); if (pcl && pcl.parentElement) pcl.parentElement.style.display = 'none';
            if (window.setPaperCheckLang) window.setPaperCheckLang(lang);
            if (window.setPgLang) window.setPgLang(lang);
            if (window.setDpLang) window.setDpLang(lang);
        } catch (e) {}
    }
    function init() { apply(); setInterval(apply, 2000); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
    console.log('🌐 EDUVA UI Translator v1 loaded');
})();
