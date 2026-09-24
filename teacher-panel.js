/* ============================================================
   🧑‍🏫 EDUVA TEACHER PANEL — Paper Generator + Paper Audit
   Self-contained. Sirf file include karo — sahi chalega.
   Dependencies: app ka existing /api/chat endpoint
   Integration guide: README-INTEGRATION.md
   ============================================================ */
(function () {
    'use strict';

    /* ---------- 0. 2-HOUR AUTO-DELETE (hard guarantee) ---------- */
    var PAPER_TTL = 2 * 60 * 60 * 1000; // exactly 2 hours
    var paperImages = [];        // audit ke pages (base64, WITHOUT data: prefix)
    var genPaperText = '';       // generated paper ka text
    var paperAttachedAt = null;  // countdown ke liye

    function purgeExpiredPapers() {
        var now = Date.now();
        ['eduva_pc_images', 'eduva_gen_paper', 'eduva_dp_sheet'].forEach(function (k) {
            try {
                var raw = sessionStorage.getItem(k);
                if (!raw) return;
                var entry = JSON.parse(raw);
                if (now - entry.t > PAPER_TTL) {
                    sessionStorage.removeItem(k);
                    console.log('🗑️ [EDUVA] Paper purged after 2h:', k);
                }
            } catch (e) { sessionStorage.removeItem(k); }
        });
        if (paperImages.length && paperAttachedAt && (now - paperAttachedAt > PAPER_TTL)) {
            paperImages = []; paperAttachedAt = null;
            var cc = document.getElementById('paper-delete-countdown');
            if (cc) cc.textContent = '🗑️ पेपर 2 घंटे पूरे होने पर system से delete हो चुका है';
        }
        if (genPaperText && window.__genPaperAt && (now - window.__genPaperAt > PAPER_TTL)) {
            genPaperText = ''; window.__genPaperAt = null;
            var gr = document.getElementById('pg-result');
            if (gr) gr.classList.add('hidden');
            var st = document.getElementById('pg-status');
            if (st) st.textContent = '🗑️ पेपर 2 घंटे बाद system से delete हो चुका है — फिर से बनाओ।';
        }
    }
    purgeExpiredPapers();
    setInterval(purgeExpiredPapers, 60 * 1000);

    function startDeleteCountdown() {
        var el = document.getElementById('paper-delete-countdown');
        if (!el) return;
        clearInterval(window.__pcCountdown);
        window.__pcCountdown = setInterval(function () {
            if (!paperAttachedAt) return;
            var left = PAPER_TTL - (Date.now() - paperAttachedAt);
            if (left <= 0) {
                el.textContent = '🗑️ पेपर delete हो चुका है';
                clearInterval(window.__pcCountdown);
                return;
            }
            var m = Math.floor(left / 60000), s = Math.floor((left % 60000) / 1000);
            el.textContent = '🔒 ऑटो-डिलीट: ' + m + ':' + String(s).padStart(2, '0') + ' बाकी';
        }, 1000);
    }

    /* ---------- 1. SHARED HELPERS ---------- */
    function esc(s) {
        return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    function $(id) { return document.getElementById(id); }

    // Generic AI call — app ke /api/chat endpoint pe
    async function eduvaAI(message, images) {
        var body = { message: message };
        if (images && images.length) body.images = images;
        var res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error('API ' + res.status);
        var data = await res.json();
        var reply = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';
        if (!reply) throw new Error('खाली जवाब');
        return reply.trim();
    }

    function renderAIReply(containerId, text) {
        var box = $(containerId);
        if (!box) return;
        var div = document.createElement('div');
        div.className = 'p-4 bg-white border border-slate-200 rounded-2xl chat-bubble text-sm text-slate-800 whitespace-pre-line leading-relaxed animate-fadeIn';
        div.innerHTML = marked ? marked.parse(text) : esc(text);
        box.appendChild(div);
        box.scrollTop = box.scrollHeight;
    }

    function sanitizeLatex(s) {
        if (!s) return s;
        return String(s)
            .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '($1)/($2)')
            .replace(/\\sqrt\[?\]?\s*\{?([^}\\$]*)\}?/g, '\u221A($1)')
            .replace(/\^\{\\circ\}/g, '\u00B0')
            .replace(/\\circ/g, '\u00B0')
            .replace(/\^\{?2\}?/g, '\u00B2')
            .replace(/\^\{?3\}?/g, '\u00B3')
            .replace(/\^\{([^}]*)\}/g, '^$1')
            .replace(/\\times/g, '\u00D7')
            .replace(/\\div/g, '\u00F7')
            .replace(/\\pi/g, '\u03C0')
            .replace(/\\theta/g, '\u03B8')
            .replace(/\\alpha/g, '\u03B1')
            .replace(/\\beta/g, '\u03B2')
            .replace(/\\sum/g, '\u03A3')
            .replace(/\\Delta/g, '\u0394')
            .replace(/\\angle/g, '\u2220')
            .replace(/\\therefore/g, '\u2234')
            .replace(/\\$/g, '')
            .replace(/\$/g, '');
    }

    function langToggleBtns(prefix, cur) {
        return '<button type="button" onclick="set' + (prefix === 'pg' ? 'Pg' : 'Dp') + 'Lang(\'hi\')" class="px-2.5 py-1 rounded-full text-[10px] font-black cursor-pointer ' + (cur === 'hi' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500') + '">🇮🇳 Hindi</button>'
            + '<button type="button" onclick="set' + (prefix === 'pg' ? 'Pg' : 'Dp') + 'Lang(\'en\')" class="px-2.5 py-1 rounded-full text-[10px] font-black cursor-pointer ' + (cur === 'en' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500') + '">🇬🇧 English</button>';
    }
    function injectLangToggles() {
        [['pg-topic-chips', 'pg-lang-wrap', 'pg'], ['dp-topic-chips', 'dp-lang-wrap', 'dp']].forEach(function (cfg) {
            var chips = document.getElementById(cfg[0]);
            if (!chips) return;
            var label = chips.previousElementSibling;
            if (!label || document.getElementById(cfg[1])) return;
            var span = document.createElement('span');
            span.id = cfg[1];
            span.className = 'float-right inline-flex items-center gap-1 bg-slate-100 rounded-full p-0.5 ml-2';
            span.innerHTML = langToggleBtns(cfg[2], 'hi');
            label.appendChild(span);
        });
    }


    function secSpec(marks, lang) {
        var parts = [];
        function add(label, id, defM) {
            var c = readCount(id);
            if (c > 0) parts.push('- ' + label + ': ' + c + (lang === 'en' ? ' questions' : ' सवाल') + (defM ? ' (~' + defM + ' marks each)' : ''));
        }
        add(lang === 'en' ? 'MCQ' : 'MCQ', 'pg-c-mcq', 1);
        add(lang === 'en' ? 'Very Short (1-2 lines)' : 'Very Short (1-2 line)', 'pg-c-vs', 2);
        add(lang === 'en' ? 'Short Answer' : 'Short Answer', 'pg-c-s', 3);
        add(lang === 'en' ? 'Long Answer' : 'Long Answer', 'pg-c-l', 5);
        add(lang === 'en' ? 'Case Study / Passage based' : 'Case Study / Passage based', 'pg-c-cs', 4);
        add(lang === 'en' ? 'Match the Following' : 'Match the Following', 'pg-c-m', 5);
        add(lang === 'en' ? 'Compare / Differentiate' : 'Compare / Differentiate', 'pg-c-c', 3);
        add(lang === 'en' ? 'Assertion-Reason' : 'Assertion-Reason', 'pg-c-ar', 1);
        if (!parts.length) parts.push(lang === 'en' ? '- (teacher gave no breakdown — create balanced sections yourself)' : '- (teacher ने breakdown नहीं दिया — तुम अपने हिसाब से balanced sections बनाओ)');
        var head = lang === 'en' ? 'SECTION BREAKDOWN (teacher request):\n' : 'SECTION BREAKDOWN (teacher की माँग):\n';
        return head + parts.join('\n') + (lang === 'en'
            ? '\n- Total marks: ' + marks + ' — adjust sections so total is EXACTLY ' + marks + ' marks.'
            : '\n- कुल Marks: ' + marks + ' — sections को ऐसे adjust करो कि total EXACTLY ' + marks + ' marks बने।');
    }
    function buildGenPrompt(o) {
        var en = o.lang === 'en';
        var lvl = en
            ? { easy: 'EASY — every average student can solve, basic concepts, confidence-building paper',
                moderate: 'MODERATE — above-average students, board-exam level, mix of standard questions',
                hard: 'HARD — toughest, topper-level, JEE/NEET/Olympiad pattern, depth in every question' }[pgLevel]
            : { easy: 'EASY — हर average बच्चा solve कर पाए, basic concepts, confidence-building paper',
                moderate: 'MODERATE — average से ऊपर के बच्चों के लिए, board-exam level, mix of standard questions',
                hard: 'HARD — toughest, topper-level, JEE/NEET/Olympiad pattern, हर सवाल में depth' }[pgLevel];
        var fmt = o.mcqMode === 'all' ? (en ? 'Only MCQ — 4 options (a)-(d) per question' : 'सिर्फ MCQ — हर सवाल के 4 options (a)-(d)')
            : o.mcqMode === 'mixed' ? (en ? 'Mixed — MCQ + descriptive sections' : 'Mixed — MCQ + descriptive sections')
            : (en ? 'Descriptive — with sections' : 'Descriptive — sections में');
        if (en) return [
            'You are EDUVA\'s senior paper setter with 20 years of experience at Kota\'s best coaching. Create an exam paper for a teacher.',
            '',
            'SPECIFICATIONS:',
            '- Class: ' + o.cls + ' | Subject: ' + o.subj,
            '- Topics: ' + o.selTopics.join(', '),
            '- Total marks: ' + o.marks + ' | Time limit: ' + o.time + ' minutes',
            '- Difficulty: ' + lvl,
            secSpec(o.marks, 'en'),
            '- Format: ' + fmt,
            (o.negMarking ? '- Negative marking: yes — state clearly in header (e.g. -0.25 or -1 for MCQ)' : '- Negative marking: no'),
            '',
            'STRICT RULES:',
            '1. Every question must be 100% correct and solvable — no ambiguous, wrong-data or misprint questions. Your reputation is at stake.',
            '2. Sensible marks distribution — easy questions fewer marks, hard questions more.',
            '3. Clean printable format: Header (Class, Subject, Time, Max Marks, General Instructions), then sections, marks in front of each question.',
            '4. Do NOT include an answer key — it is generated separately.',
            '5. All questions must be ORIGINAL — not copied from any book or paper.',
            '6. Last line exactly in this format: Estimated time: X minutes',
            '',
            'Give the complete paper now.'
        ].join('\n');
        return [
            'तुम EDUVA के senior paper setter हो — कोटा के best coaching का 20 साल का experience। एक teacher के लिए exam paper बनाओ।',
            '',
            'SPECIFICATIONS:',
            '- Class: ' + o.cls + ' | Subject: ' + o.subj,
            '- Topics: ' + o.selTopics.join(', '),
            '- कुल Marks: ' + o.marks + ' | Time limit: ' + o.time + ' मिनट',
            '- Difficulty: ' + lvl,
            secSpec(o.marks, 'hi'),
            '- Format: ' + fmt,
            (o.negMarking ? '- Negative marking: हाँ — header में साफ लिखो (MCQ में -0.25 या -1)' : '- Negative marking: नहीं'),
            '',
            'कड़े नियम:',
            '1. हर सवाल 100% सही और solvable हो — कोई ambiguous, गलत-data या misprint वाला सवाल नहीं। तुम्हारी reputation दाव पर है।',
            '2. Marks distribution sensible हो — आसान सवाल कम marks, कठिन ज़्यादा।',
            '3. साफ printable format: Header (Class, Subject, Time, Max Marks, General Instructions), फिर sections, हर सवाल के आगे marks।',
            '4. Answer key इसमें मत डालो — वो अलग से generate होगी।',
            '5. सारे सवाल ORIGINAL बनाओ — किसी book/paper की copy नहीं।',
            '6. आखिरी line ठीक इस format में: ⏱️ अनुमानित समय: X मिनट',
            '',
            'पूरा paper अभी दो।'
        ].join('\n');
    }
    function buildDpPrompt(o) {
        var en = o.lang === 'en';
        var lvl = en
            ? { easy: 'EASY — concept reinforcement, every student can do',
                moderate: 'MODERATE — daily revision level, some effort for average students',
                hard: 'HARD — topper practice, depth in every question' }[dpLevel]
            : { easy: 'EASY — concept reinforcement, हर बच्चा कर पाए',
                moderate: 'MODERATE — daily revision level, average बच्चे के लिए थोड़ा effort',
                hard: 'HARD — topper practice, हर सवाल में depth' }[dpLevel];
        var fmt = o.mcqMode === 'all' ? (en ? 'Only MCQ (4 options)' : 'सिर्फ MCQ (4 options)')
            : o.mcqMode === 'mixed' ? (en ? 'Mixed — some MCQ + some short' : 'Mixed — कुछ MCQ + कुछ short')
            : (en ? 'Short answer (1-3 lines each)' : 'Short answer (1-3 lines each)');
        var head = en
            ? ('Daily Practice — Class ' + o.cls + ' | ' + o.subj + ' | ' + o.selTopics.join(', '))
            : ('Daily Practice — Class ' + o.cls + ' | ' + o.subj + ' | ' + o.selTopics.join(', '));
        if (en) return [
            'You are EDUVA\'s senior educator. Create a DAILY PRACTICE SHEET (worksheet) for a teacher to give students as homework/revision.',
            '',
            'SPECIFICATIONS:',
            '- Class: ' + o.cls + ' | Subject: ' + o.subj,
            '- Topics: ' + o.selTopics.join(', '),
            '- Total questions: ' + o.numQ,
            '- Difficulty: ' + lvl,
            '- Format: ' + fmt,
            o.withAnswers ? '- Include a short answer below every question (teacher reference copy)' : '- Do NOT include answers — clean printable sheet for students',
            '',
            'STRICT RULES:',
            '1. Every question must be 100% correct — no ambiguous or wrong-data questions.',
            '2. Keep the sheet short and focused — it is daily practice, not an exam paper. Header: "' + head + '".',
            '3. Number the questions Q1, Q2... Printable format.',
            '4. All questions ORIGINAL.',
            '',
            'Give the complete sheet now.'
        ].join('\n');
        return [
            'तुम EDUVA के senior educator हो। एक teacher के लिए DAILY PRACTICE SHEET (worksheet) बनाओ — जो teacher हर रोज़ बच्चों को homework/revision के लिए देता है।',
            '',
            'SPECIFICATIONS:',
            '- Class: ' + o.cls + ' | Subject: ' + o.subj,
            '- Topics: ' + o.selTopics.join(', '),
            '- कुल सवाल: ' + o.numQ,
            '- Difficulty: ' + lvl,
            '- Format: ' + fmt,
            o.withAnswers ? '- हर सवाल के नीचे उसका छोटा answer भी दो (teacher के reference के लिए)' : '- सवालों के answers मत दो — साफ printable sheet बच्चों को देने के लिए',
            '',
            'कड़े नियम:',
            '1. हर सवाल 100% सही हो — कोई ambiguous या गलत-data वाला सवाल नहीं।',
            '2. Sheet छोटी और focused हो — daily practice के लिए, exam paper नहीं। Header में लिखो: "' + head + '"।',
            '3. सवालों के आगे Q1, Q2... नंबर लगाओ। Printable format।',
            '4. सारे सवाल ORIGINAL बनाओ।',
            '',
            'पूरी sheet अभी दो।'
        ].join('\n');
    }

    function renderTyping(containerId, label) {
        var box = $(containerId);
        if (!box) return null;
        var div = document.createElement('div');
        div.className = 'p-3.5 bg-slate-100 border border-slate-200 rounded-2xl text-xs font-bold text-slate-500 w-fit';
        div.innerHTML = '<span class="eduva-typing"><i></i><i></i><i></i></span> ' + esc(label || 'Edu Sir काम कर रहे हैं...');
        box.appendChild(div);
        box.scrollTop = box.scrollHeight;
        return div;
    }

    /* ---------- 2. TABS ---------- */
    window.setTeacherTab = function (t) {
        $('teacher-audit-tab').classList.toggle('hidden', t !== 'audit');
        $('teacher-generate-tab').classList.toggle('hidden', t !== 'generate');
        $('teacher-practice-tab').classList.toggle('hidden', t !== 'practice');
        var ccTab = $('teacher-copy-tab'); if (ccTab) ccTab.classList.toggle('hidden', t !== 'copy');
        $('ttab-audit').className = 'flex-1 py-3 rounded-xl cursor-pointer text-xs font-black ' + (t === 'audit' ? 'ink-navy text-white' : 'text-slate-600');
        $('ttab-generate').className = 'flex-1 py-3 rounded-xl cursor-pointer text-xs font-black ' + (t === 'generate' ? 'ink-navy text-white' : 'text-slate-600');
        $('ttab-practice').className = 'flex-1 py-3 rounded-xl cursor-pointer text-xs font-black ' + (t === 'practice' ? 'ink-navy text-white' : 'text-slate-600');
        var ttC = $('ttab-copy'); if (ttC) ttC.className = 'flex-1 py-3 rounded-xl cursor-pointer text-xs font-black ' + (t === 'copy' ? 'ink-navy text-white' : 'text-slate-600');
    };

    /* ============================================================
       PART A — 🧾 PAPER AUDIT (teacher ka banaya paper validate karo)
       ============================================================ */
    var pcLang = 'hi';

    window.setPaperCheckLang = function (l) {
        pcLang = l;
        $('pcl-hi').className = 'px-3 py-1.5 rounded-full text-[10px] font-black cursor-pointer ' + (l === 'hi' ? 'bg-white shadow-sm' : 'text-slate-500');
        $('pcl-en').className = 'px-3 py-1.5 rounded-full text-[10px] font-black cursor-pointer ' + (l === 'en' ? 'bg-white shadow-sm' : 'text-slate-500');
    };

    function buildAuditPrompt(lang) {
        if (lang === 'en') return [
            'You are EDUVA\'s senior paper auditor — 20 years of experience setting and vetting board/coaching exam papers.',
            'A TEACHER has created a question paper (for students to attempt) and wants YOU to audit THE PAPER ITSELF for errors before it goes to students.',
            '',
            'STRICT RULES:',
            '1. Read EVERY question of the paper. Your job is to find flaws IN THE QUESTIONS, not solve the paper for a student.',
            '2. For EACH question, audit these 7 things:',
            '   (a) SOLVABILITY — is it mathematically/logically solvable? (wrong given data, impossible conditions)',
            '   (b) ANSWER KEY — if a key is printed with the paper, verify it. A wrong printed key is the most dangerous error.',
            '   (c) DATA CONSISTENCY — do numericals yield a clean/correct answer? Any misprinted number?',
            '   (d) LANGUAGE — grammar, spelling, clarity of the question text itself',
            '   (e) AMBIGUITY — two interpretations possible? Missing units? Referenced diagram absent? MCQ options incomplete?',
            '   (f) LEVEL FIT — appropriate for the stated class/board?',
            '   (g) DUPLICATES — same concept/question repeated?',
            '3. Report every issue exactly like this:',
            '',
            '❌ [Q3] — Problem: given data makes the equation unsolvable (discriminant negative) | Fix: change "x²+4x+8=0" to "x²+4x-8=0" | Severity: 🔴 Must fix before exam',
            '💡 Why it matters: <what happens if students get this paper>',
            '',
            '4. If a question is fully clean, say briefly: "Q1 — ✅ clean"',
            '5. If any photo is unclear: "📷 This part is not clearly visible — re-upload needed" — NEVER guess.',
            '6. After ALL questions, give these sections:',
            '   (i) 📋 QUICK SUMMARY — one line per question: Q1 — ✅ clean | Q2 — key wrong | Q3 — data error | ...',
            '   (ii) 🏥 PAPER HEALTH SCORE: __/10 with a one-line verdict',
            '   (iii) ⚖️ PAPER DESIGN AUDIT: marks distribution sensible? difficulty balance? can it be finished in the given time? syllabus gaps?',
            '   (iv) End your reply with exactly these two lines:',
            '[PAPER_CHECKED]',
            '✅ Audited by EDUVA Paper Checker — FREE for teachers',
            '',
            'The paper photos and the teacher\'s note follow. Start auditing.'
        ].join('\n');

        return [
            'तुम EDUVA के सीनियर पेपर ऑडिटर हो — 20 साल का board/coaching exam paper बनाने और जाँचने का experience।',
            'एक TEACHER ने students के लिए question paper बनाया है और वो चाहता है कि students तक पहुँचने से पहले तुम उस पेपर में मौजूद गलतियाँ पकड़ो। तुम्हें पेपर खुद AUDIT करना है — किसी की checked copy नहीं।',
            '',
            'सख्त नियम:',
            '1. पेपर का हर सवाल पढ़ो। तुम्हारा काम सवालों में मौजूद खामियाँ ढूंढना है।',
            '2. हर सवाल की ये 7 जाँच करो:',
            '   (a) SOLVABILITY — क्या सवाल solve हो सकता है? (गलत given data, impossible condition, answer exists ही नहीं)',
            '   (b) ANSWER KEY — पेपर में key दी है तो verify करो। Printed key गलत होना सबसे खतरनाक error है।',
            '   (c) DATA CONSISTENCY — numericals के numbers साफ/सही answer देते हैं? कोई misprint?',
            '   (d) LANGUAGE — सवाल के अपने grammar, spelling, clarity',
            '   (e) AMBIGUITY — दो मतलब निकलते हैं? Unit missing? Diagram का जिक्र पर diagram नहीं? MCQ options अधूरे?',
            '   (f) LEVEL FIT — सवाल उसी class/board का है?',
            '   (g) DUPLICATES — same concept/sवाल दो बार तो नहीं?',
            '3. हर issue का format:',
            '',
            '❌ [Q3] — समस्या: given data से equation unsolvable है (discriminant negative) | Fix: "x²+4x+8=0" की जगह "x²+4x-8=0" लिखो | Severity: 🔴 Exam से पहले ज़रूर ठीक करो',
            '💡 असर: <student को ये पेपर मिला तो क्या होगा — time waste, शिकायत, दोबारा test>',
            '',
            '4. सवाल बिल्कुल साफ हो तो एक line: "Q1 — ✅ clean"',
            '5. कोई photo धुंधली हो तो: "📷 यह हिस्सा साफ नहीं दिख रहा — दोबारा photo भेजो" — guess मत करो।',
            '6. सारे सवालों के बाद ये sections दो:',
            '   (i) 📋 QUICK SUMMARY — हर सवाल एक line: Q1 — ✅ clean | Q2 — key गलत | Q3 — data error | ...',
            '   (ii) 🏥 PAPER HEALTH SCORE: __/10 और एक line का verdict',
            '   (iii) ⚖️ PAPER DESIGN AUDIT: marks distribution ठीक है? difficulty balance? समय में पेपर हो पाएगा? syllabus coverage gap?',
            '   (iv) अपने जवाब के आखिर में ठीक ये दो lines लिखो:',
            '[PAPER_CHECKED]',
            '✅ Audited by EDUVA Paper Checker — FREE for teachers',
            '',
            'नीचे teacher का note और paper की photos आ रही हैं। Auditing शुरू करो।'
        ].join('\n');
    }

    // Photo attach (multi-page)
    window.pcAttachPhotos = function (input) {
        var files = input.files;
        if (!files || !files.length) return;
        Array.prototype.forEach.call(files, function (f) {
            var reader = new FileReader();
            reader.onload = function (ev) {
                var b64 = String(ev.target.result).split(',')[1];
                paperImages.push(b64);
                if (!paperAttachedAt) {
                    paperAttachedAt = Date.now();
                    startDeleteCountdown();
                }
                try { sessionStorage.setItem('eduva_pc_images', JSON.stringify({ t: Date.now(), data: paperImages })); } catch (e) {}
                renderPcPages();
            };
            reader.readAsDataURL(f);
        });
        input.value = '';
    };

    function renderPcPages() {
        var el = $('pc-pages');
        if (!el) return;
        if (!paperImages.length) { el.innerHTML = ''; return; }
        el.innerHTML = paperImages.map(function (_, i) {
            return '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-[11px] font-black text-blue-700">📄 Page ' + (i + 1) +
                ' <button onclick="pcRemovePage(' + i + ')" class="text-rose-500 cursor-pointer">✕</button></span>';
        }).join('') +
        '<span class="text-[10px] font-bold text-slate-400 ml-1">सभी pages attach कर लो, फिर Check दबाओ →</span>';
    }
    window.pcRemovePage = function (i) {
        paperImages.splice(i, 1);
        if (!paperImages.length) paperAttachedAt = null;
        renderPcPages();
    };
    window.pcClearAll = function () {
        paperImages = []; paperAttachedAt = null;
        sessionStorage.removeItem('eduva_pc_images');
        renderPcPages();
        $('pc-result').innerHTML = '';
        $('pc-extra-cards').classList.add('hidden');
        var cc = $('paper-delete-countdown'); if (cc) cc.textContent = '';
    };

    // AUDIT trigger
    window.runPaperAudit = async function () {
        if (!paperImages.length) { alert('पहले paper की photos attach करो (एक से ज़्यादा pages भी चलेंगे)।'); return; }
        var note = ($('pc-note') && $('pc-note').value.trim()) || '';
        var btn = $('pc-run-btn');
        btn.disabled = true; btn.textContent = '⏳ AI पेपर पढ़ रहा है... 30-60 sec';
        var typing = renderTyping('pc-result', 'पूरा पेपर line-by-line पढ़ा जा रहा है...');
        try {
            var prompt = buildAuditPrompt(pcLang) + '\n\n---\n👤 TEACHER का note: ' + (note || '(कोई खास निर्देश नहीं — पूरा पेपर audit करो)');
            var reply = await eduvaAI(prompt, paperImages);
            if (typing) typing.remove();
            var checked = reply.indexOf('[PAPER_CHECKED]') !== -1;
            reply = reply.replace('[PAPER_CHECKED]', '');
            renderAIReply('pc-result', reply);
            if (checked) $('pc-extra-cards').classList.remove('hidden');
        } catch (e) {
            if (typing) typing.remove();
            renderAIReply('pc-result', '⚠️ कुछ दिक्कत आई (' + esc(e.message) + ') — internet check करके दोबारा दबाओ।');
        }
        btn.disabled = false; btn.textContent = '🧾 पेपर Audit करो';
    };

    // Post-audit extras — SOLUTION + ANSWER KEY (photos auto-resent, teacher touches nothing)
    window.pcGenerateExtra = async function (type) {
        if (!paperImages.length) {
            try { var s = JSON.parse(sessionStorage.getItem('eduva_pc_images') || 'null'); if (s && Date.now() - s.t <= PAPER_TTL) paperImages = s.data || []; } catch (e) {}
        }
        if (!paperImages.length) {
            alert('⚠️ Session refresh हो गया — paper की photos फिर से attach करके Check दबाओ।');
            return;
        }
        var btn = $(type === 'solution' ? 'pc-sol-btn' : 'pc-key-btn');
        var orig = btn.innerHTML;
        btn.disabled = true; btn.innerHTML = '⏳ बन रहा है...';
        var label = type === 'solution' ? 'Full solution बन रहा है...' : 'Answer key बन रही है...';
        var typing = renderTyping('pc-result', label);
        var prompt, images;
        if (type === 'solution') {
            prompt = pcLang === 'hi'
                ? 'तुमने अभी एक paper audit किया (ऊपर की photos वही paper हैं)। अब उसी paper का FULL SOLUTION बनाओ — हर सवाल का step-by-step हल हिंदी में। पहले सवाल नंबर से शुरू करो। Checking दोबारा मत लिखो — सिर्फ solutions।'
                : 'You just audited a paper (same photos above). Now produce the FULL WORKED SOLUTION of that same paper — every question, step by step, in English. Start with question numbers. No audit report again — only solutions.';
            images = paperImages;
        } else {
            prompt = pcLang === 'hi'
                ? 'उसी paper की (ऊपर की photos) ANSWER KEY बनाओ हिंदी में — सिर्फ इस format में, एक भी extra line नहीं:\nQ1. (b)\nQ2. 42\nQ3. (d)\n...और अंत में एक line: कुल सवाल: X'
                : 'Create the ANSWER KEY of the same paper (photos above) in English — ONLY in this format, no extra lines:\nQ1. (b)\nQ2. 42\nQ3. (d)\n...and one final line: Total questions: X';
            images = paperImages;
        }
        try {
            var reply = await eduvaAI(prompt, images);
            if (typing) typing.remove();
            renderAIReply('pc-result', reply);
        } catch (e) {
            if (typing) typing.remove();
            renderAIReply('pc-result', '⚠️ नहीं बन पाया (' + esc(e.message) + ') — दोबारा try करो।');
        }
        btn.disabled = false; btn.innerHTML = orig;
    };

    // Save paper to device
    window.pcSaveToDevice = function () {
        if (!paperImages.length) { alert('अभी कोई paper attach नहीं है।'); return; }
        paperImages.forEach(function (b64, i) {
            var a = document.createElement('a');
            a.href = 'data:image/jpeg;base64,' + b64;
            a.download = 'EDUVA-audit-paper-page-' + (i + 1) + '.jpg';
            document.body.appendChild(a); a.click(); a.remove();
        });
    };

    // Optional consent → sirf apne account mein save
    window.pcSaveToAccount = async function () {
        if (!paperImages.length) { alert('पहले paper attach करो।'); return; }
        if (typeof window.eduvaSaveTeacherPaper !== 'function') {
            alert('Login चाहिए — पहले Login करो, फिर save होगा।'); return;
        }
        var uid = window.__eduvaUid || (window.eduvaAuth && window.eduvaAuth.currentUser && window.eduvaAuth.currentUser.uid);
        if (!uid) { alert('Login चाहिए।'); return; }
        try {
            await window.eduvaSaveTeacherPaper(uid, paperImages, { title: 'Audit paper ' + new Date().toLocaleString('hi-IN') });
            alert('✅ सिर्फ आपके account में save हो गया — किसी और को नहीं दिखेगा।');
        } catch (e) { alert('⚠️ Save नहीं हुआ — device पर save कर लो (📥 button)।'); }
    };

    /* ============================================================
       PART B — 📝 PAPER GENERATOR
       ============================================================ */
    var pgLevel = 'moderate';
    var pgTopics = [];

    var pgLang = 'hi';
    window.setPgLang = function (l) {
        pgLang = l;
        var wrap = $('pg-lang-wrap');
        if (wrap) wrap.innerHTML = langToggleBtns('pg', l);
        renderPgTopicChips();
    };
    window.loadPgTopics = function () {
        var cls = $('pg-class').value;
        var subj = $('pg-subject').value;
        var raw = (window.PG_TOPICS_BI && window.PG_TOPICS_BI[cls] && window.PG_TOPICS_BI[cls][subj]) || [['पूरा syllabus', 'Full syllabus']];
        pgTopics = raw.map(function (t) { return { hi: t[0], en: t[1], sel: false }; });
        renderPgTopicChips();
    };

    function renderPgTopicChips() {
        var el = $('pg-topic-chips');
        if (!el) return;
        if (!pgTopics.length) { el.innerHTML = '<span class="text-[11px] text-slate-400 font-bold">Topics load हो रहे हैं...</span>'; return; }
        el.innerHTML = pgTopics.map(function (t, i) {
            return '<button type="button" onclick="togglePgTopic(' + i + ')" class="px-3 py-1.5 rounded-full text-[11px] font-black border-2 transition cursor-pointer ' +
                (t.sel ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400') + '">' + esc(pgLang === 'en' ? t.en : t.hi) + '</button>';
        }).join('');
    }
    window.togglePgTopic = function (i) { pgTopics[i].sel = !pgTopics[i].sel; renderPgTopicChips(); };

    window.addPgTopic = function () {
        var v = $('pg-custom-topic').value.trim();
        if (!v) return;
        pgTopics.push({ hi: v, en: v, sel: true, custom: true });
        $('pg-custom-topic').value = '';
        renderPgTopicChips();
    };

    window.setPgLevel = function (l) {
        pgLevel = l;
        ['easy', 'moderate', 'hard'].forEach(function (x) {
            var b = $('pgl-' + x);
            if (b) b.style.outline = (x === l) ? '3px solid #312e81' : 'none';
        });
    };

    // Question-type breakdown helper
    function readCount(id) { var v = parseInt($(id).value, 10); return (isNaN(v) || v < 0) ? 0 : v; }

    function buildSectionSpec(marks) {
        var parts = [];
        function add(label, count, id, defMarks) {
            if (count > 0) parts.push('- ' + label + ': ' + count + ' सवाल' + (defMarks ? ' (≈' + defMarks + ' marks each)' : ''));
        }
        add('MCQ', readCount('pg-c-mcq'), null, 1);
        add('Very Short (1-2 line)', readCount('pg-c-vs'), null, 2);
        add('Short Answer', readCount('pg-c-s'), null, 3);
        add('Long Answer', readCount('pg-c-l'), null, 5);
        add('Case Study / Passage based', readCount('pg-c-cs'), null, 4);
        add('Match the Following', readCount('pg-c-m'), null, 5);
        add('Compare / Differentiate', readCount('pg-c-c'), null, 3);
        add('Assertion-Reason', readCount('pg-c-ar'), null, 1);
        if (!parts.length) parts.push('- (teacher ने breakdown नहीं दिया — तुम अपने हिसाब से balanced sections बनाओ)');
        return 'SECTION BREAKDOWN (teacher की माँग):\n' + parts.join('\n') + '\n- कुल Marks: ' + marks + ' — sections को ऐसे adjust करो कि total EXACTLY ' + marks + ' marks बने।';
    }

    window.generateTeacherPaper = async function () {
        var cls = $('pg-class').value;
        var subj = $('pg-subject').value;
        var marks = $('pg-marks').value || '80';
        var time = $('pg-time').value || '180';
        var mcqMode = $('pg-mcq').value;
        var negMarking = $('pg-neg').checked;
        var selTopics = pgTopics.filter(function (t) { return t.sel; }).map(function (t) { return pgLang === 'en' ? t.en : t.hi; });
        if (!selTopics.length) { alert('कम से कम एक topic select करो (या ऊपर से "पूरा syllabus")।'); return; }

        var lvlHi = {
            easy: 'EASY — हर average बच्चा solve कर पाए, basic concepts, confidence-building paper',
            moderate: 'MODERATE — average से ऊपर के बच्चों के लिए, board-exam level, mix of standard questions',
            hard: 'HARD — toughest, topper-level, JEE/NEET/Olympiad pattern, हर सवाल में depth'
        }[pgLevel];

        var prompt = buildGenPrompt({ cls: cls, subj: subj, marks: marks, time: time, mcqMode: mcqMode, negMarking: negMarking, selTopics: selTopics, lang: pgLang });

        var btn = $('pg-btn');
        btn.disabled = true; btn.textContent = '⏳ पेपर बन रहा है... 20-40 sec';
        $('pg-status').textContent = '';
        var typing = renderTyping('pg-result', 'Edu Sir पेपर बना रहे हैं...');
        try {
            var reply = await eduvaAI(prompt, null);
            if (typing) typing.remove();
            genPaperText = reply;
            window.__genPaperAt = Date.now();
            try { sessionStorage.setItem('eduva_gen_paper', JSON.stringify({ t: Date.now(), data: reply })); } catch (e) {}

            // Time estimate parse (Hindi + English patterns)
            var est = reply.match(/⏱️\s*अनुमानित समय[:：]?\s*(\d+)\s*मिनट/) || reply.match(/[Ee]stimated?\s*[Tt]ime[:：]?\s*(\d+)\s*(?:min)/);
            $('pg-time-estimate').textContent = est
                ? '⏱️ AI estimate: यह पेपर ' + est[1] + ' मिनट में होने योग्य है (आपकी limit: ' + time + ' min)' + (parseInt(est[1],10) > parseInt(time,10) ? '  ⚠️ Estimate limit से ज़्यादा है!' : '')
                : '⏱️ आपकी time limit: ' + time + ' मिनट';
            $('pg-paper-content').textContent = sanitizeLatex(reply);
            $('pg-result').innerHTML = '';   // typing cleanup safety
            $('pg-result-wrap').classList.remove('hidden');
            $('pg-status').textContent = '✅ पेपर तैयार! नीचे Save / Audit / Answer Key / Solution।';
        } catch (e) {
            if (typing) typing.remove();
            $('pg-status').textContent = '⚠️ पेपर नहीं बन पाया (' + e.message + ') — दोबारा दबाओ।';
        }
        btn.disabled = false; btn.textContent = '📝 पेपर बनाओ';
    };

    // Generated paper actions
    window.pgDownload = function () {
        if (!genPaperText) return;
        var blob = new Blob([genPaperText], { type: 'text/plain;charset=utf-8' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'EDUVA-paper-class' + $('pg-class').value + '-' + $('pg-subject').value + '-' + Date.now() + '.txt';
        document.body.appendChild(a); a.click(); a.remove();
    };
    window.pgCopy = function () {
        if (!genPaperText) return;
        try { navigator.clipboard.writeText(genPaperText); alert('✅ पेपर copy हो गया — Word में paste करके print कर लो।'); }
        catch (e) { alert('Copy नहीं हुआ — 📥 Download से file save करो।'); }
    };
    window.pgAuditSelf = async function () {
        if (!genPaperText) return;
        var btn = $('pg-audit-btn');
        btn.disabled = true; btn.textContent = '⏳ Audit हो रहा है...';
        var typing = renderTyping('pc-result', 'अपने ही पेपर की audit...');
        setTeacherTab('audit');
        try {
            var prompt = buildAuditPrompt('hi') + '\n\n⚠️ SPECIAL: यह पेपर TEXT के रूप में दिया गया है (photo नहीं) — उसी तरह audit करो।\n\n--- PAPER START ---\n' + genPaperText + '\n--- PAPER END ---';
            var reply = await eduvaAI(prompt, null);
            if (typing) typing.remove();
            var checked = reply.indexOf('[PAPER_CHECKED]') !== -1;
            reply = reply.replace('[PAPER_CHECKED]', '');
            renderAIReply('pc-result', reply);
            if (checked) $('pc-extra-cards').classList.remove('hidden');
        } catch (e) {
            if (typing) typing.remove();
            renderAIReply('pc-result', '⚠️ Audit नहीं हो पाया (' + e.message + ')।');
        }
        btn.disabled = false; btn.textContent = '🧾 अपने पेपर की Audit';
    };
    window.pgAnswerKey = async function () {
        if (!genPaperText) return;
        var btn = $('pg-key-btn');
        btn.disabled = true; btn.textContent = '⏳...';
        var typing = renderTyping('pg-result', 'Answer key बन रही है...');
        try {
            var prompt = 'नीचे दिए गए paper की ANSWER KEY बनाओ हिंदी में — सिर्फ इस format में:\nQ1. (b)\nQ2. 42\n...\nऔर अंत में: कुल सवाल: X\n\n--- PAPER ---\n' + genPaperText;
            var reply = await eduvaAI(prompt, null);
            if (typing) typing.remove();
            renderAIReply('pc-result', reply);
            setTeacherTab('audit');
        } catch (e) { if (typing) typing.remove(); renderAIReply('pg-result', '⚠️ नहीं बन पाई — दोबारा दबाओ।'); }
        btn.disabled = false; btn.textContent = '🔑 Answer Key';
    };
    window.pgSolution = async function () {
        if (!genPaperText) return;
        var btn = $('pg-sol-btn');
        btn.disabled = true; btn.textContent = '⏳...';
        var typing = renderTyping('pg-result', 'Full solution बन रहा है...');
        try {
            var prompt = 'नीचे दिए गए paper का FULL SOLUTION बनाओ हिंदी में — हर सवाल का step-by-step हल। पहले सवाल नंबर से शुरू करो।\n\n--- PAPER ---\n' + genPaperText;
            var reply = await eduvaAI(prompt, null);
            if (typing) typing.remove();
            renderAIReply('pc-result', reply);
            setTeacherTab('audit');
        } catch (e) { if (typing) typing.remove(); renderAIReply('pg-result', '⚠️ नहीं बन पाया — दोबारा दबाओ।'); }
        btn.disabled = false; btn.textContent = '📘 Full Solution';
    };


    /* ============================================================
       PART C — 📄 DAILY PRACTICE SHEET
       ============================================================ */
    var dpLevel = 'moderate';
    var dpLang = 'hi';
    var dpTopics = [];
    var dpSheetText = '';
    window.setDpLang = function (l) {
        dpLang = l;
        var wrap = $('dp-lang-wrap');
        if (wrap) wrap.innerHTML = langToggleBtns('dp', l);
        renderDpTopicChips();
    };

    window.loadDpTopics = function () {
        var cls = $('dp-class').value;
        var subj = $('dp-subject').value;
        var raw = (window.PG_TOPICS_BI && window.PG_TOPICS_BI[cls] && window.PG_TOPICS_BI[cls][subj]) || [['पूरा syllabus', 'Full syllabus']];
        dpTopics = raw.map(function (t) { return { hi: t[0], en: t[1], sel: false }; });
        renderDpTopicChips();
    };
    function renderDpTopicChips() {
        var el = $('dp-topic-chips');
        if (!el) return;
        el.innerHTML = dpTopics.map(function (t, i) {
            return '<button type="button" onclick="toggleDpTopic(' + i + ')" class="px-3 py-1.5 rounded-full text-[11px] font-black border-2 transition cursor-pointer ' +
                (t.sel ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400') + '">' + esc(dpLang === 'en' ? t.en : t.hi) + '</button>';
        }).join('');
    }
    window.toggleDpTopic = function (i) { dpTopics[i].sel = !dpTopics[i].sel; renderDpTopicChips(); };
    window.addDpTopic = function () {
        var v = $('dp-custom-topic').value.trim();
        if (!v) return;
        dpTopics.push({ hi: v, en: v, sel: true, custom: true });
        $('dp-custom-topic').value = '';
        renderDpTopicChips();
    };
    window.setDpLevel = function (l) {
        dpLevel = l;
        ['easy', 'moderate', 'hard'].forEach(function (x) {
            var b = $('dpl-' + x);
            if (b) b.style.outline = (x === l) ? '3px solid #134e4a' : 'none';
        });
    };

    window.generateDailyPractice = async function () {
        var cls = $('dp-class').value;
        var subj = $('dp-subject').value;
        var numQ = $('dp-num').value || '12';
        var mcqMode = $('dp-mcq').value;
        var withAnswers = $('dp-with-ans').checked;   // printable sheet (bina answers) ya with-answers
        var selTopics = dpTopics.filter(function (t) { return t.sel; }).map(function (t) { return dpLang === 'en' ? t.en : t.hi; });
        if (!selTopics.length) { alert('कम से कम एक topic select करो।'); return; }

        var lvlHi = {
            easy: 'EASY — concept reinforcement, हर बच्चा कर पाए',
            moderate: 'MODERATE — daily revision level, average बच्चे के लिए थोड़ा effort',
            hard: 'HARD — topper practice, हर सवाल में depth'
        }[dpLevel];

        var prompt = buildDpPrompt({ cls: cls, subj: subj, numQ: numQ, mcqMode: mcqMode, withAnswers: withAnswers, selTopics: selTopics, lang: dpLang });

        var btn = $('dp-btn');
        btn.disabled = true; btn.textContent = '⏳ Sheet बन रही है... 15-30 sec';
        $('dp-status').textContent = '';
        var typing = renderTyping('dp-result', 'Daily practice sheet बन रही है...');
        try {
            var reply = await eduvaAI(prompt, null);
            if (typing) typing.remove();
            dpSheetText = reply;
            window.__dpAt = Date.now();
            try { sessionStorage.setItem('eduva_dp_sheet', JSON.stringify({ t: Date.now(), data: reply })); } catch (e) {}
            $('dp-sheet-content').textContent = sanitizeLatex(reply);
            $('dp-result-wrap').classList.remove('hidden');
            $('dp-status').textContent = '✅ Sheet तैयार! Download / Copy / Answer Key / Solution।';
        } catch (e) {
            if (typing) typing.remove();
            $('dp-status').textContent = '⚠️ Sheet नहीं बन पाई (' + e.message + ') — दोबारा दबाओ।';
        }
        btn.disabled = false; btn.textContent = '📄 Practice Sheet बनाओ';
    };

    window.dpDownload = function () {
        if (!dpSheetText) return;
        var blob = new Blob([dpSheetText], { type: 'text/plain;charset=utf-8' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'EDUVA-daily-practice-class' + $('dp-class').value + '-' + $('dp-subject').value + '-' + Date.now() + '.txt';
        document.body.appendChild(a); a.click(); a.remove();
    };
    window.dpCopy = function () {
        if (!dpSheetText) return;
        try { navigator.clipboard.writeText(dpSheetText); alert('✅ Sheet copy हो गई।'); }
        catch (e) { alert('Copy नहीं हुआ — 📥 Download से save करो।'); }
    };
    window.dpAnswerKey = async function () {
        if (!dpSheetText) return;
        var btn = $('dp-key2-btn');
        btn.disabled = true; btn.textContent = '⏳...';
        var typing = renderTyping('dp-result', 'Answer key बन रही है...');
        try {
            var reply = await eduvaAI('नीचे दी गई daily practice sheet की ANSWER KEY बनाओ — हर सवाल का सही answer छोटे में:\n\n--- SHEET ---\n' + dpSheetText, null);
            if (typing) typing.remove();
            renderAIReply('dp-result', reply);
        } catch (e) { if (typing) typing.remove(); renderAIReply('dp-result', '⚠️ नहीं बन पाई — दोबारा दबाओ।'); }
        btn.disabled = false; btn.textContent = '🔑 Answer Key';
    };
    window.dpSolution = async function () {
        if (!dpSheetText) return;
        var btn = $('dp-sol2-btn');
        btn.disabled = true; btn.textContent = '⏳...';
        var typing = renderTyping('dp-result', 'Solutions बन रहे हैं...');
        try {
            var reply = await eduvaAI('नीचे दी गई daily practice sheet के हर सवाल का step-by-step solution बनाओ:\n\n--- SHEET ---\n' + dpSheetText, null);
            if (typing) typing.remove();
            renderAIReply('dp-result', reply);
        } catch (e) { if (typing) typing.remove(); renderAIReply('dp-result', '⚠️ नहीं बन पाया — दोबारा दबाओ।'); }
        btn.disabled = false; btn.textContent = '📘 Solutions';
    };

    // Init
    function initTp() { loadPgTopics(); loadDpTopics(); injectLangToggles(); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initTp);
    else initTp();

    console.log('🧑‍🏫 EDUVA Teacher Panel loaded');
})();
