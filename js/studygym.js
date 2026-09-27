/* ================= STUDY GYM LOGIC ================= */
        async function sgAI(prompt) {
            const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: prompt }) });
            if (!res.ok) throw new Error('Status ' + res.status);
            const d = await res.json();
            return ((d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content) || '').replace(/<think>[\s\S]*?<\/think>/g, '').trim();
        }
        function sgMD(t) { try { return mdParse(t); } catch (e) { return t; } }

        /* 1. BLANK PAGE CHALLENGE */
        async function sgBlurScore() {
            const topic = document.getElementById('sg-blur-topic').value.trim();
            const ans = document.getElementById('sg-blur-ans').value.trim();
            const box = document.getElementById('sg-blur-result');
            const btn = document.getElementById('sg-blur-btn');
            if (!topic || !ans) { alert('Topic aur apna likha hua dono daalo chैंपियन!'); return; }
            btn.disabled = true; btn.textContent = '⏳ Edu Sir check kar rahe hain...';
            box.classList.remove('hidden'); box.innerHTML = '⏳ ...';
            try {
                const r = await sgAI('तू Edu Sir है। Topic: "' + topic + '"。 Student ने blank page पर याद आया सब लिखा:\n"""' + ans + '"""\n\nकाम: (1) इस topic के 8-10 सबसे important points सूचीबद्ध कर, (2) student के हर point से compare कर, (3) पहली line में सिर्फ यह लिखो: Score: X/10, (4) फिर 3 bullet — ✅ क्या सही याद था, ❌ क्या miss हुआ, 💡 1 improvement tip। Hindi में, short, motivating।');
                box.innerHTML = sgMD(r);
                const sc = r.match(/Score:\s*(\d+)/);
                if (sc) { try { if (typeof eduvaToast !== 'undefined') eduvaToast('🎯 Blank Page Score: ' + sc[1] + '/10'); } catch (e) {} }
            } catch (e) { box.innerHTML = '⚠️ Error: ' + e.message + ' — दोबारा try करो!'; }
            btn.disabled = false; btn.textContent = '🎯 Score करो';
        }

        /* 2. CHHOTA TEACHER (Feynman) */
        async function sgFeyRate() {
            const topic = document.getElementById('sg-fey-topic').value.trim();
            const ans = document.getElementById('sg-fey-ans').value.trim();
            const box = document.getElementById('sg-fey-result');
            const btn = document.getElementById('sg-fey-btn');
            if (!topic || !ans) { alert('Topic aur apni explanation dono daalo!'); return; }
            btn.disabled = true; btn.textContent = '⏳ Edu Sir sun rahe hain...';
            box.classList.remove('hidden'); box.innerHTML = '⏳ ...';
            try {
                const r = await sgAI('तू Edu Sir है। Student ने topic "' + topic + '" को अपने शब्दों में समझाया:\n"""' + ans + '"""\n\nFeynman technique से rate कर: (1) पहली line: Score: X/10 (सरलता, सटीकता, पूर्णता), (2) ❌ कौन-सी जargon/heavy words आईं और उनकी simple जगह, (3) ✅ क्या सबसे अच्छा समझाया, (4) 💡 1 line में कैसे और better करे। Hindi में, encouraging tone।');
                box.innerHTML = sgMD(r);
                const sc = r.match(/Score:\s*(\d+)/);
                if (sc) { try { if (typeof eduvaToast !== 'undefined') eduvaToast('⭐ Teacher Rating: ' + sc[1] + '/10'); } catch (e) {} }
            } catch (e) { box.innerHTML = '⚠️ Error: ' + e.message + ' — दोबारा try करो!'; }
            btn.disabled = false; btn.textContent = '⭐ Rating पाओ';
        }

        /* 3. GALTI REGISTER */
        function sgGaltiGet() { try { return JSON.parse(localStorage.getItem('sg_galti') || '[]'); } catch (e) { return []; } }
        function sgGaltiAdd() {
            const subj = document.getElementById('sg-galti-subj').value.trim();
            const why = document.getElementById('sg-galti-why').value.trim();
            const txt = document.getElementById('sg-galti-txt').value.trim();
            if (!txt) { alert('Galti likhna zaroori hai!'); return; }
            const arr = sgGaltiGet();
            arr.unshift({ id: Date.now(), subj: subj || 'General', why: why || '', txt: txt, ts: Date.now() });
            localStorage.setItem('sg_galti', JSON.stringify(arr.slice(0, 50)));
            document.getElementById('sg-galti-subj').value = ''; document.getElementById('sg-galti-why').value = ''; document.getElementById('sg-galti-txt').value = '';
            sgGaltiRender();
            try { if (typeof eduvaToast !== 'undefined') eduvaToast('📒 Galti register mein darj ho gayi!'); } catch (e) {}
        }
        function sgGaltiDel(id) {
            localStorage.setItem('sg_galti', JSON.stringify(sgGaltiGet().filter(g => g.id !== id)));
            sgGaltiRender();
        }
        function sgGaltiRetest(g) {
            const inp = document.getElementById('chat-input');
            if (inp) { inp.value = 'Edu Sir, meri yeh galti hui thi: ' + g.txt + (g.why ? ' (कारण: ' + g.why + ')' : '') + '। Isse related 1 practice सवाल दो और check करो कि अब सही हो गया या नहीं।'; }
            switchTab('chat');
            try { if (typeof eduvaToast !== 'undefined') eduvaToast('💬 Chat mein re-test bheja — Send dabao!'); } catch (e) {}
        }
        function sgGaltiRender() {
            const list = document.getElementById('sg-galti-list');
            const arr = sgGaltiGet();
            if (!arr.length) { list.innerHTML = '<p class="text-xs font-bold text-slate-400 text-center py-2">Abhi koi galti registered nahi — badhai ho! 🎉</p>'; return; }
            const day = 86400000;
            list.innerHTML = arr.map(g => {
                const age = Date.now() - g.ts;
                const due = age > 7 * day ? '🔴 7+ din — abhi re-test!' : age > 3 * day ? '🟠 3 din ho gaye' : age > day ? '🟡 1 din ho gaya' : '🟢 Abhi ki';
                return '<div class="bg-rose-50 border border-rose-100 rounded-xl p-3 space-y-1.5">' +
                    '<div class="flex items-center justify-between gap-2"><span class="text-[10px] font-black text-rose-600 uppercase">' + g.subj + ' • ' + due + '</span>' +
                    '<button onclick="sgGaltiDel(' + g.id + ')" class="text-rose-300 hover:text-rose-600 text-xs font-black cursor-pointer">✕</button></div>' +
                    '<p class="text-xs font-bold text-slate-800">' + g.txt.replace(/</g, '&lt;') + '</p>' +
                    (g.why ? '<p class="text-[11px] font-semibold text-slate-500">क्यों: ' + g.why.replace(/</g, '&lt;') + '</p>' : '') +
                    '<button onclick=\'sgGaltiRetest(' + JSON.stringify(g).replace(/'/g, "&#39;") + ')\' class="text-[11px] font-black text-rose-600 bg-white border border-rose-200 hover:bg-rose-100 px-2.5 py-1 rounded-full transition cursor-pointer">💬 Chat में Re-test</button></div>';
            }).join('');
        }

        /* 4. SYLLABUS TRACKER */
        const SG_SYLLABUS = {
            maths: ['Real Numbers', 'Polynomials', 'Linear Equations', 'Quadratic Equations', 'Arithmetic Progressions', 'Triangles', 'Coordinate Geometry', 'Trigonometry', 'Circles', 'Surface Areas & Volumes', 'Statistics', 'Probability'],
            science: ['Chemical Reactions', 'Acids, Bases & Salts', 'Metals & Non-metals', 'Carbon Compounds', 'Life Processes', 'Control & Coordination', 'Reproduction', 'Heredity & Evolution', 'Light — Reflection & Refraction', 'Human Eye', 'Electricity', 'Magnetic Effects of Current', 'Sources of Energy'],
            sst: ['History: Nationalism in Europe', 'History: Nationalism in India', 'History: Making of Global World', 'Civics: Power Sharing', 'Civics: Federalism', 'Civics: Democracy & Diversity', 'Geography: Resources & Development', 'Geography: Agriculture', 'Geography: Minerals & Energy', 'Economics: Development', 'Economics: Sectors of Economy', 'Economics: Money & Credit'],
            english: ['Reading Comprehension', 'Writing: Formal Letters', 'Writing: Analytical Paragraphs', 'Literature: First Flight (Prose)', 'Literature: First Flight (Poetry)', 'Literature: Footprints without Feet', 'Grammar: Tenses', 'Grammar: Voice', 'Grammar: Reported Speech'],
            hindi: ['गद्य खंड', 'पद्य खंड', 'पत्र लेखन', 'अनुच्छेद लेखन', 'व्याकरण: संधि', 'व्याकरण: समास', 'व्याकरण: मुहावरे', 'व्याकरण: पुनरुक्ति', 'साहित्य: क्षितिज', 'साहित्य: कृतिका']
        };
        function sgSylKey() { return 'sg_syl_' + document.getElementById('sg-syl-subj').value; }
        function sgSylGet() { try { return JSON.parse(localStorage.getItem(sgSylKey()) || '[]'); } catch (e) { return []; } }
        function sgSylToggle(i) {
            const arr = sgSylGet();
            const idx = arr.indexOf(i);
            if (idx >= 0) arr.splice(idx, 1); else arr.push(i);
            localStorage.setItem(sgSylKey(), JSON.stringify(arr));
            sgSylRender();
        }
        function sgSylRender() {
            const subj = document.getElementById('sg-syl-subj').value;
            const done = sgSylGet();
            const chapters = SG_SYLLABUS[subj] || [];
            const pct = chapters.length ? Math.round(done.length / chapters.length * 100) : 0;
            document.getElementById('sg-syl-bar').style.width = pct + '%';
            document.getElementById('sg-syl-pct').textContent = pct + '% complete (' + done.length + '/' + chapters.length + ' chapters)';
            document.getElementById('sg-syl-list').innerHTML = chapters.map((c, i) => {
                const isDone = done.indexOf(i) >= 0;
                return '<label class="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition ' + (isDone ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50 border border-slate-200 hover:border-sky-300') + '">' +
                    '<input type="checkbox" ' + (isDone ? 'checked' : '') + ' onchange="sgSylToggle(' + i + ')" class="w-4 h-4 accent-sky-600 cursor-pointer">' +
                    '<span class="text-xs font-bold ' + (isDone ? 'text-emerald-700 line-through opacity-70' : 'text-slate-700') + '">' + c + '</span></label>';
            }).join('');
        }

        /* 5. FORMULA SPRINT */
        const SG_FORMULAS = [
            { c: 'वेग (Velocity)', a: 'v = s/t' }, { c: 'त्वरण (Acceleration)', a: 'a = (v-u)/t' },
            { c: 'न्यूटन का II नियम', a: 'F = ma' }, { c: 'गुरुत्वाकर्षण बल', a: 'F = G m1m2/r²' },
            { c: 'दाब (Pressure)', a: 'P = F/A' }, { c: 'कार्य (Work)', a: 'W = F × s' },
            { c: 'शक्ति (Power)', a: 'P = W/t' }, { c: 'ऊर्जा ( kinetic )', a: 'KE = ½mv²' },
            { c: 'स्थितिज ऊर्जा (PE)', a: 'PE = mgh' }, { c: 'ओम का नियम', a: 'V = IR' },
            { c: 'प्रतिरोध (Series)', a: 'R = R1 + R2 + ...' }, { c: 'विद्युत शक्ति', a: 'P = VI' },
            { c: 'पाइथागोरस प्रमेय', a: 'a² + b² = c²' }, { c: 'समांतर श्रेणी का nवाँ पद', a: 'an = a + (n-1)d' },
            { c: 'द्विघात समीकरण का मूल', a: 'x = [-b ± √(b²-4ac)]/2a' }, { c: 'वृत्त का क्षेत्रफल', a: 'A = πr²' },
            { c: 'बेलन का आयतन', a: 'V = πr²h' }, { c: 'लम्बवृत्त का आयतन', a: 'V = ⅓πr²h' },
            { c: 'विलेयता (Solubility)', a: 'S = (mass of solute / mass of solvent) × 100' },
            { c: 'मोल संख्या', a: 'n = given mass / molar mass' }
        ];
        let sgSprRound = 0, sgSprScore = 0, sgSprCur = null, sgSprPool = [];
        function sgShow(id, on) { document.getElementById(id).classList.toggle('hidden', !on); }
        function sgSprintStart() {
            sgSprRound = 0; sgSprScore = 0;
            sgSprPool = SG_FORMULAS.slice().sort(() => Math.random() - 0.5).slice(0, 10);
            sgShow('sg-sprint-box', false); sgShow('sg-sprint-card', true);
            sgShow('sg-sprint-start', false); sgShow('sg-sprint-reveal', true);
            sgSprintNext();
        }
        function sgSprintNext() {
            if (sgSprRound >= 10) {
                sgShow('sg-sprint-card', false); sgShow('sg-sprint-reveal', false);
                sgShow('sg-sprint-yes', false); sgShow('sg-sprint-no', false);
                sgShow('sg-sprint-start', true); sgShow('sg-sprint-box', true);
                document.getElementById('sg-sprint-box').innerHTML = '<p class="text-lg font-black text-slate-900">🏁 Score: ' + sgSprScore + '/10</p><p class="text-xs font-bold text-slate-500">' + (sgSprScore >= 8 ? 'कमाल! Formula master 💪' : sgSprScore >= 5 ? 'अच्छा! थोड़ा और practice 🎯' : 'Formula Vault से revise करो 📖') + '</p>';
                document.getElementById('sg-sprint-score').textContent = '';
                return;
            }
            sgSprCur = sgSprPool[sgSprRound];
            document.getElementById('sg-sprint-concept').textContent = sgSprCur.c;
            document.getElementById('sg-sprint-formula').textContent = sgSprCur.a;
            document.getElementById('sg-sprint-answer').classList.add('hidden');
            sgShow('sg-sprint-reveal', true); sgShow('sg-sprint-yes', false); sgShow('sg-sprint-no', false);
            document.getElementById('sg-sprint-score').textContent = 'Round ' + (sgSprRound + 1) + '/10 • Score: ' + sgSprScore;
        }
        function sgSprintReveal() {
            document.getElementById('sg-sprint-answer').classList.remove('hidden');
            sgShow('sg-sprint-reveal', false); sgShow('sg-sprint-yes', true); sgShow('sg-sprint-no', true);
        }
        function sgSprintMark(ok) {
            if (ok) sgSprScore++;
            sgSprRound++;
            sgSprintNext();
        }
        document.addEventListener('DOMContentLoaded', function () { try { sgGaltiRender(); sgSylRender(); } catch (e) {} });
