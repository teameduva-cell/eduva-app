/* ================= HANDWRITTEN NOTES GENERATOR ================= */
        const NOTES_CANVAS_WIDTH = 800;
        const NOTES_LEFT_MARGIN_X = 100;
        const NOTES_RIGHT_PADDING = 40;
        const NOTES_TOP_START_Y = 60;
        const NOTES_LINE_HEIGHT = 40;
        const NOTES_BOTTOM_PADDING = 40;
        const NOTES_FONT_SIZE = 28;
        const NOTES_FONT = `${NOTES_FONT_SIZE}px "Kalam","Patrick Hand",cursive`;

        async function openNotesModal(prefillText) {
            document.getElementById('notes-modal').classList.remove('hidden');
            const textarea = document.getElementById('notesText');
            if (prefillText) textarea.value = cleanNotesText(prefillText);
            try {
                // font load hone ka intezaar, lekin 3 sec se zyada nahi (slow net par bhi modal khali na rahe)
                await Promise.race([
                    Promise.all([document.fonts.load(NOTES_FONT), document.fonts.ready]),
                    new Promise(r => setTimeout(r, 3000))
                ]);
            } catch (e) { /* font na mile to fallback font se bana do */ }
            generateNotes();
        }

        function closeNotesModal() {
            document.getElementById('notes-modal').classList.add('hidden');
        }

        // 🐛 BUG FIX: यह function ऊपर हिंदी/English बटन से call होता था लेकिन कहीं भी define नहीं था
        // (इसलिए वो दोनों बटन क्लिक करने पर कुछ नहीं करते थे)। अब यह असल में मौजूदा notes/solution को
        // चुनी हुई भाषा में दोबारा बनवाता है (generateTopicNotes/generateHandwrittenSolution पहले से
        // window.__notesReq में सवाल/टॉपिक सेव कर देते हैं, बस उसे इस्तेमाल करने वाला कोड गायब था)।
        async function eduvaRegenNotes(lang) {
            const req = window.__notesReq;
            const textarea = document.getElementById('notesText');
            if (!req || !req.q) {
                alert('⚠️ पहले कोई टॉपिक-नोट्स या हैंडरिटेन सॉल्यूशन बनाओ, फिर भाषा बदल सकते हो चैंपियन!');
                return;
            }
            const langLine = lang === 'en'
                ? 'IMPORTANT LANGUAGE RULE: पूरा जवाब सिर्फ और सिर्फ simple English में लिखो — हिंदी का एक भी शब्द मत use करो।\n\n'
                : 'IMPORTANT LANGUAGE RULE: पूरा जवाब सिर्फ शुद्ध हिंदी (Devanagari script) में लिखो।\n\n';
            if (textarea) textarea.value = '⏳ नोट्स ' + (lang === 'en' ? 'English' : 'हिंदी') + ' में दोबारा बन रहे हैं...';
            try {
                const persona = (typeof personaLine === 'function') ? personaLine() : '';
                let prompt;
                if (req.type === 'solution') {
                    prompt = persona + langLine + 'Edu Sir, नीचे दिए सवाल का पूरा solution एक school copy की तरह सुंदर ढंग से लिखो। सख्त format:\n\nQ. ' + req.q + '\nGiven : <दी गई जानकारी>\nFind : <क्या निकालना है>\nSolution :\n<step-by-step, हर step (1) (2) (3) numbering से, नई line पर>\nHence, <अंतिम उत्तर> ✅\n\nनियम: LaTeX ($...$, \\frac) बिल्कुल मत use करो — सादा text (a^2, x/2, √5)। Format सख्ती से ऐसा रखो: सीधे Solution : से शुरू करो — Q./Given:/Find: sections बिल्कुल मत लिखो। फिर flowing explanation — 2-4 line के natural paragraphs, जैसे कोई होनहार student अपनी copy में लिखता है; (1)(2)(3) जैसी numbering मत करो। ज़रूरी values अलग lines पर लिखो, जैसे — Vertical side = x (bracket में reason)। Working में हर equation अलग line पर, fractions साफ़ inline (जैसे x = L/√2)। आखिर में सिर्फ एक line — Hence, <कथन> | <अंतिम उत्तर>। अगर सवाल में कोई आकृति/shape बनता है, तो solution के बीच में अलग line पर एक छोटा SVG diagram भी दो — सादा 2D line drawing, stroke #1e3a8a, stroke-width 3, fill none, viewBox 0 0 400 300, ज़रूरी labels <text> में। कभी भी [diagram] जैसा text placeholder मत लिखो।';
                } else {
                    prompt = persona + langLine + 'Edu Sir, नीचे दिए TOPIC पर बहुत DETAILED exam-ready NOTES बनाओ, सादा text — LaTeX बिल्कुल मत। Rule: छोटे bullet-fragments बिल्कुल मत लिखो — पूर्ण वाक्यों में, विस्तार से, कम से कम 350-500 शब्द। Format:\n\n📌 Topic: <topic का नाम>\n📖 Detailed Explanation: <2-3 पूरे paragraphs — हर paragraph 3-4 lines, आसान भाषा, रोज़मर्रा के examples के साथ>\n🔑 Important Formulas / Points: <complete list, सादे text में>\n💡 Solved Example: <step-by-step, पूरा>\n⚠️ Common Mistakes: <2-3, explain करके>\n\nTOPIC (सवाल से): ' + req.q;
                }
                const payload = { message: prompt };
                if (req.photo) payload.image = req.photo;
                const res = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) throw new Error('Status ' + res.status);
                const data = await res.json();
                const reply = ((data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '').replace(/<think>[\s\S]*?<\/think>/g, '').trim();
                if (!reply) throw new Error('खाली जवाब');
                if (textarea) textarea.value = cleanNotesText(reply);
                generateNotes();
            } catch (e) {
                if (textarea) textarea.value = '';
                alert('⚠️ नोट्स ' + (lang === 'en' ? 'English' : 'हिंदी') + ' में दोबारा नहीं बन पाए (' + e.message + ')। दोबारा कोशिश करो!');
            }
        }

        // Chat/KaTeX se copy kiya gaya text aksar toota-footaa hota hai (har akshar alag line par).
        // Isse saaf karke saaf-suthre paragraphs mein badalta hai taaki notes SAHI likhen.
        function cleanNotesText(raw) {
            if (!raw) return '';
            let t = String(raw)
                .replace(/<svg[\s\S]*?<\/svg>/gi, ' [diagram] ')   // FIX: raw SVG code notes se hatao
                .replace(/<\/?[a-zA-Z][^>]{0,120}>/g, '')
                .replace(/\r\n?/g, '\n')
                .replace(/[\u200B\u200C\u200D\uFEFF\u00AD]/g, '');

            const lines = t.split('\n').map(l => l.trim());

            // Step 1: toote hue chhote tokens (KaTeX/MathML wale har-akshar-alag-line hisse) ko jodo
            const hasDevanagari = s => /[\u0900-\u097F]/.test(s);
            const isTiny = s => s.length > 0 && s.length <= 2 && !hasDevanagari(s);

            const merged = [];
            let carry = '';
            for (const l of lines) {
                if (l === '') {
                    if (carry) { merged.push(carry); carry = ''; }
                    merged.push('');
                } else if (isTiny(l)) {
                    carry += l;
                } else {
                    if (carry) { merged.push(carry); carry = ''; }
                    merged.push(l);
                }
            }
            if (carry) merged.push(carry);

            // Step 2: paragraphs banao — khaali line = paragraph gap
            const paragraphs = [];
            let cur = '';
            for (const l of merged) {
                if (l === '') {
                    if (cur) { paragraphs.push(cur); cur = ''; }
                } else {
                    cur = cur ? cur + ' ' + l : l;
                }
            }
            if (cur) paragraphs.push(cur);

            return paragraphs.join('\n');
        }

        // टेक्स्ट को \n पर पैराग्राफ में तोड़ो, फिर हर पैराग्राफ को word-wrap करो
        function wrapNotesText(ctx, text, maxWidth) {
            const paragraphs = text.split('\n');
            const lines = [];

            paragraphs.forEach((para) => {
                if (para.trim() === '') {
                    lines.push(''); // खाली लाइन = पैराग्राफ गैप
                    return;
                }
                const words = para.split(/\s+/);
                let line = '';

                for (let n = 0; n < words.length; n++) {
                    const word = words[n];
                    if (!word) continue;

                    // bahut lamba bina-break token ho to use tod do (overflow na ho)
                    if (ctx.measureText(word).width > maxWidth) {
                        if (line) { lines.push(line.trim()); line = ''; }
                        let chunk = '';
                        for (const ch of word) {
                            if (chunk && ctx.measureText(chunk + ch).width > maxWidth) {
                                lines.push(chunk); chunk = ch;
                            } else {
                                chunk += ch;
                            }
                        }
                        if (chunk) line = chunk + ' ';
                        continue;
                    }

                    const testLine = line + word + ' ';
                    const testWidth = ctx.measureText(testLine).width;

                    if (testWidth > maxWidth && line !== '') {
                        lines.push(line.trim());
                        line = word + ' ';
                    } else {
                        line = testLine;
                    }
                }
                lines.push(line.trim());
            });

            return lines;
        }

        function eduvaSvgToImg(svg) {
            return new Promise(function (res) {
                try {
                    let s = String(svg);
                    const vb = s.match(/viewBox="([^"]+)"/);
                    let w = 320, hg = 220;
                    if (vb) { const p = vb[1].trim().split(/[\s,]+/); if (p.length === 4) { w = +p[2] || 320; hg = +p[3] || 220; } }
                    if (!/width\s*=/.test(s)) s = s.replace(/<svg/i, '<svg width="' + w + '" height="' + hg + '"');
                    if (!/xmlns/.test(s)) s = s.replace(/<svg/i, '<svg xmlns="http://www.w3.org/2000/svg"');
                    const url = URL.createObjectURL(new Blob([s], { type: 'image/svg+xml;charset=utf-8' }));
                    const img = new Image();
                    img.onload = function () { URL.revokeObjectURL(url); res(img); };
                    img.onerror = function () { URL.revokeObjectURL(url); res(null); };
                    img.src = url;
                } catch (e) { res(null); }
            });
        }

        function generateNotes() {
            const rawVal = document.getElementById('notesText').value;
            const __svgBlocks = [];
            const __withPh = String(rawVal).replace(/<svg[\s\S]*?<\/svg>/gi, function (m) { __svgBlocks.push(m); return '\n\u00A7\u00A7SVG' + (__svgBlocks.length - 1) + '\u00A7\u00A7\n'; });
            Promise.all(__svgBlocks.map(eduvaSvgToImg)).then(function (__imgs) { eduvaRenderNotes(__imgs, __withPh); });
        }
        async function eduvaRenderNotes(svgImgs, preText) {
            // ✅ Font load hone ka wait karo — warna measure aur draw alag fonts se hote hain (text cut hota hai)
            try {
                await document.fonts.load('400 ' + NOTES_FONT_SIZE + 'px Kalam');
                await document.fonts.load('700 ' + NOTES_FONT_SIZE + 'px Kalam');
                await document.fonts.ready;
            } catch (e) {}
            const canvas = document.getElementById('notesCanvas');
            const ctx = canvas.getContext('2d');
            const textarea = document.getElementById('notesText');
            const text = cleanNotesText(preText);
            textarea.value = text;
            const naturalTilt = document.getElementById('naturalTilt').checked;
            const W = NOTES_CANVAS_WIDTH;
            const M = NOTES_LEFT_MARGIN_X;
            const maxW = W - M - 90;
            const INK = '#1e3a8a';
            const normText = text
                .replace(/(\s*(?:Solution|समाधान|हल)\s*:)/gi, '\n$1\n')
                .replace(/(\s*(?:Hence|Therefore|अतः|इसलिए|इस प्रकार)\b)/gi, '\n$1')
                .replace(/(\s*\(?\d+\)\s+)/g, '\n$1')
                .replace(/\n{2,}/g, '\n');
            const rawLines = normText.split('\n').map(s => s.trim()).filter(s => s !== '');
            let questionLines = [], solutionLines = [], inSolution = false;
            rawLines.forEach(l => {
                if (/^(q\.?|question|प्रश्न|सवाल)[\s:.\-]/i.test(l) && !inSolution) {
                    inSolution = true;
                    l = l.replace(/^(q\.?|question|प्रश्न|सवाल)[\s:.\-]*/i, '');
                    if (l) questionLines.push(l);
                } else if (inSolution) { solutionLines.push(l); }
                else { questionLines.push(l); }
            });
            if (!solutionLines.length && questionLines.length > 1) {
                solutionLines = questionLines.slice(1);
                questionLines = questionLines.slice(0, 1);
            }
            const figureRequested = /diagram|figure|चित्र|आकृति|triangle|त्रिभुज|circle|वृत्त|square|वर्ग|rectangle|आयत/i.test(text) && /\d+\s*(cm|mm|metre|meter|मीटर|सेमी|सेंटी)/i.test(text);
            ctx.font = NOTES_FONT;
            const stepGap = 8;
            const realSvgs = (svgImgs || []).filter(Boolean);
            let diagStackH = 0;
            realSvgs.forEach(function (im) { let ih2 = 360 * (im.height / im.width); if (ih2 > 320) { ih2 = 320; } diagStackH += ih2 + 24; });
            let textColW = realSvgs.length ? (maxW - 330) : maxW;
            if (textColW < 300) textColW = maxW; // narrow canvas — columns skip karo, diagram neeche
            const qLines = wrapNotesText(ctx, questionLines.join('\n'), textColW);
            const sLines = wrapNotesText(ctx, solutionLines.join('\n'), textColW);
            const FIG_H = realSvgs.length ? Math.max(0, diagStackH - sLines.length * (NOTES_LINE_HEIGHT + stepGap)) : (figureRequested ? 380 : 0);
            let height = 150 + 60 + qLines.length * NOTES_LINE_HEIGHT + 60
                + 50 + sLines.length * (NOTES_LINE_HEIGHT + stepGap)
                + (figureRequested ? 40 + FIG_H : 0) + 60 + 70 + 60 + 150;
            canvas.height = Math.max(1250, height);
            drawNotesPaperBackground(ctx, canvas);
            drawNotesRuledLines(ctx, canvas);
            ctx.fillStyle = INK;
            let y = 150;
            function drawInlineDiagram(l, x, yPos) {
                const ph = String(l).match(/\u00A7\u00A7SVG(\d+)\u00A7\u00A7/);
                if (!ph || !svgImgs || !svgImgs[+ph[1]]) return 0;
                const im = svgImgs[+ph[1]];
                let iw = Math.min(textColW - 20, 340);
                let ih = iw * (im.height / im.width);
                if (ih > 280) { ih = 280; iw = ih * (im.width / im.height); }
                ctx.drawImage(im, x + 20, yPos - 16, iw, ih);
                return ih + 26;
            }
            function writeLine(str, x, y, bold) {
                ctx.save();
                ctx.font = bold ? 'bold ' + NOTES_FONT : NOTES_FONT;
                ctx.fillStyle = INK;
                const isHead = /:$/.test(str) || /solution|समाधान|हल|उत्तर|answer/i.test(str);
                if (naturalTilt) {
                    const angle = (Math.random() * 0.7 - 0.35) * (Math.PI / 180);
                    ctx.translate(x, y + Math.random() * 1.2 - 0.6);
                    ctx.rotate(angle);
                    ctx.fillText(str, Math.random() * 0.7, 0);
                    if (bold && isHead) {
                        const tw = ctx.measureText(str).width;
                        ctx.strokeStyle = INK; ctx.lineWidth = 2;
                        ctx.beginPath(); ctx.moveTo(0, 5); ctx.lineTo(tw, 5); ctx.stroke();
                    }
                } else {
                    ctx.fillText(str, x, y);
                    if (bold && isHead) {
                        const tw = ctx.measureText(str).width;
                        ctx.strokeStyle = INK; ctx.lineWidth = 2;
                        ctx.beginPath(); ctx.moveTo(x, y + 5); ctx.lineTo(x + tw, y + 5); ctx.stroke();
                    }
                }
                ctx.restore();
            }
            // Topic-notes mode: lambey detailed notes flowing document ki tarah render karo
            if (text.length > 500 || /Topic:|📌 |📖 /.test(text)) {
                wrapNotesText(ctx, text, maxW).forEach(function (l) {
                    { var dH = drawInlineDiagram(l, M, y); if (dH) { y += dH; return; } }
                    var isHead = (l.length < 70 && /:$/.test(l)) || /^📌|^📖|^🔑|^💡|^⚠|^✍|^Q\.|^Solution|^उत्तर/.test(l);
                    writeLine(l, M + (isHead ? 0 : 14), y, isHead);
                    y += NOTES_LINE_HEIGHT + (isHead ? 8 : 3);
                });
                y += 34;
                
                drawNotesWatermark(ctx, canvas);
                return;
            }
            writeLine('Solution:', M, 92, true);
            ctx.strokeStyle = 'rgba(30,58,138,0.75)'; ctx.lineWidth = 2.5;
            { const hw = ctx.measureText('Solution:').width; ctx.beginPath(); ctx.moveTo(M, 100); ctx.lineTo(M + hw + 6, 100); ctx.stroke(); }
            y = 92 + NOTES_LINE_HEIGHT + 10;
            // right-column floating diagrams (ChatGPT style)
            let diagY = y + 4;
            realSvgs.forEach(function (im) {
                let iw = Math.min(370, 360);
                let ih = iw * (im.height / im.width);
                if (ih > 330) { ih = 330; iw = ih * (im.width / im.height); }
                ctx.drawImage(im, M + textColW + 30, diagY, iw, ih);
                diagY += ih + 26;
            });
            // question as plain text (no box — ChatGPT style)
            if (questionLines.join(' ').trim().length > 2) {
                qLines.forEach(l => { const dH = drawInlineDiagram(l, M, y); if (dH) { y += dH; } else { writeLine(l, M, y, false); y += NOTES_LINE_HEIGHT - 6; } });
                y += 6;
            }
            // solution body — flowing text, no forced numbering
            sLines.forEach(l => {
                const t = l.trim();
                const dH = drawInlineDiagram(t, M, y);
                if (dH) { y += dH; return; }
                writeLine(t, M, y, false);
                y += NOTES_LINE_HEIGHT + stepGap;
            });
            y += 20;
            // ✅ dead code tha — ab fallback smart figure actually draw hota hai (jab AI SVG na de paaye)
            if (figureRequested && !realSvgs.length && FIG_H > 0) {
                drawSmartFigure(ctx, M, y, Math.min(maxW, 480), Math.max(FIG_H - 40, 260), text);
                y += FIG_H;
            }
            // boxed final answer
            const ansMatch = text.match(/(hence|therefore|thus|अतः|इसलिए|इस प्रकार)[^\n]*[.\n]?/i);
            ctx.strokeStyle = 'rgba(30,58,138,0.6)'; ctx.lineWidth = 2.5;
            ctx.strokeRect(M - 12, y - 28, maxW + 24, 60);
            writeLine((ansMatch ? ansMatch[0].replace(/\n/g, ' ').replace(/^[.,\s]+/, '').slice(0, 90) : '\u2714 Verified by Edu Sir'), M, y + 8, true);
            y += 80;
            drawNotesWatermark(ctx, canvas);
        }

        // Smart Figure: asli diagram banata hai
        function drawSmartFigure(ctx, x, y, w, h, fullText) {
            const INK = '#1e3a8a';
            ctx.save();
            ctx.strokeStyle = INK; ctx.fillStyle = INK; ctx.lineWidth = 3.5; ctx.lineJoin = 'round';
            const nums = (fullText.match(/\d+(\.\d+)?/g) || []).map(Number).filter(n => n > 0 && n < 10000).slice(0, 4);
            const wob = () => (Math.random() * 4 - 2);
            function label(txt, lx, ly) {
                ctx.font = '26px "Kalam", cursive';
                ctx.fillText(txt, lx + wob(), ly + wob());
            }
            function edge(x1, y1, x2, y2) {
                ctx.beginPath(); ctx.moveTo(x1 + wob(), y1 + wob()); ctx.lineTo(x2 + wob(), y2 + wob()); ctx.stroke();
            }
            if (/square|वर्ग/i.test(fullText)) {
                const s = Math.min(w, h) * 0.55, cx = x + w / 2 - s / 2, cy = y + h / 2 - s / 2;
                edge(cx, cy, cx + s, cy); edge(cx + s, cy, cx + s, cy + s); edge(cx + s, cy + s, cx, cy + s); edge(cx, cy + s, cx, cy);
                label((nums[0] ? nums[0] + ' cm' : 'a'), cx + s / 2 - 30, cy - 12);
            } else if (/circle|वृत्त/i.test(fullText)) {
                const r = Math.min(w, h) * 0.32, cx = x + w / 2, cy = y + h / 2;
                ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
                edge(cx, cy, cx + r, cy);
                label((nums[0] ? nums[0] + ' cm' : 'r'), cx + r / 2 - 14, cy - 12);
                ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill();
            } else {
                const [a, b, c] = [nums[0] || 3, nums[1] || 4, nums[2] || 5];
                const rightAngled = Math.abs(a * a + b * b - c * c) < 1;
                const bw = Math.min(w * 0.55, 380), bh = Math.min(h * 0.7, 260);
                const ox = x + w / 2 - bw / 2, oy = y + h / 2 + bh / 2;
                if (rightAngled) {
                    edge(ox, oy, ox + bw, oy); edge(ox, oy, ox, oy - bh); edge(ox, oy - bh, ox + bw, oy);
                    ctx.lineWidth = 2;
                    edge(ox + 26, oy, ox + 26, oy - 26); edge(ox + 26, oy - 26, ox, oy - 26);
                    ctx.lineWidth = 3.5;
                    label(a + ' cm', ox + bw / 2 - 34, oy + 34);
                    label(b + ' cm', ox - 74, oy - bh / 2);
                    label(c + ' cm', ox + bw / 2 + 20, oy - bh / 2 - 14);
                } else {
                    edge(ox, oy, ox + bw, oy); edge(ox, oy, ox + bw * 0.3, oy - bh); edge(ox + bw * 0.3, oy - bh, ox + bw, oy);
                    label(a + ' cm', ox + bw / 2 - 34, oy + 34);
                    label(b + ' cm', ox + bw * 0.15 - 70, oy - bh / 2);
                    label(c + ' cm', ox + bw * 0.68, oy - bh / 2 - 14);
                }
                ctx.font = '24px "Kalam", cursive';
                ctx.fillText('A', ox - 24, oy + 8); ctx.fillText('B', ox + bw + 10, oy + 8);
                ctx.fillText('C', ox + bw * (rightAngled ? 0 : 0.3) - 8, oy - bh - 14);
            }
            ctx.restore();
        }

        function drawNotesWatermark(ctx, canvas) {
            ctx.save();
            ctx.globalAlpha = 0.4;
            ctx.fillStyle = '#94a3b8';
            ctx.font = '13px "Plus Jakarta Sans", sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText('EDUVA • Kota Smart Hub', canvas.width - 20, canvas.height - 14);
            ctx.restore();
        }

        function drawNotesPaperBackground(ctx, canvas) {
            ctx.fillStyle = '#fdfbf7';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        function drawNotesRuledLines(ctx, canvas) {
            // नीली क्षैतिज लाइनें
            ctx.strokeStyle = '#93c5fd';
            ctx.lineWidth = 1;
            for (let y = NOTES_TOP_START_Y; y < canvas.height; y += NOTES_LINE_HEIGHT) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }

            // लाल मार्जिन लाइन (वर्टिकल)
            ctx.strokeStyle = '#f87171';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(80, 0);
            ctx.lineTo(80, canvas.height);
            ctx.stroke();
        }

        function downloadNotes() {
            const canvas = document.getElementById('notesCanvas');
            const link = document.createElement('a');
            link.download = 'eduva-notes-' + Date.now() + '.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        }

        function downloadNotesPDF() {
            const canvas = document.getElementById('notesCanvas');
            if (!window.jspdf) {
                // lazy load karke retry
                loadScriptOnce('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', function () { downloadNotesPDF(); });
                return;
            }
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save('eduva-notes-' + Date.now() + '.pdf');
        }
        /* ================= END HANDWRITTEN NOTES GENERATOR ================= */

        /* ================= HANDWRITTEN SOLUTION GENERATOR (copy-style) ================= */
        async function generateHandwrittenSolution(overrideQ) {
            // ✅ DOM se LAST USER MESSAGE lo — lastQA/lastUserQuestion pe bharosa nahi
            let q = '';
            let sawPhoto = false;
            try {
                const rows = document.querySelectorAll('#chat-messages > div');
                for (let i = rows.length - 1; i >= 0; i--) {
                    const r = rows[i];
                    if (r.classList && r.classList.contains('justify-end')) {
                        const t = r.textContent.trim();
                        if (/Photo Attached/i.test(t)) sawPhoto = true;
                        const clean = t.replace(/\s*📷?\s*\[?Photo Attached\]?/gi, '').trim();
                        if (clean) { q = clean; }
                        break;
                    }
                }
            } catch (e) {}
            if (overrideQ) q = overrideQ;
            if (!q) q = (window.lastUserQuestion || '').trim();
            const photoAvailable = !!(window.__lastPhoto || (typeof base64Image !== 'undefined' && base64Image));
            if (!q && !photoAvailable) { alert("पहले कोई सवाल पूछो चैंपियन!"); return; }

            addEduSirSystemBubble('✍️ Edu Sir तुम्हारे लिए <b>copy जैसा सुंदर handwritten solution</b> बना रहे हैं... 30-40 second लगेंगे चैंपियन!');
            try {
                const usePhoto = sawPhoto || (!q && photoAvailable);
                window.__notesReq = { type: 'solution', q: q, photo: (usePhoto ? (window.__lastPhoto || (typeof base64Image !== 'undefined' ? base64Image : null)) : null) };
                const prompt = usePhoto
                    ? personaLine() + 'Edu Sir, student ne PHOTO mein सवाल भेजा है (photo attached)। Photo में दिए सवाल का पूरा solution एक school copy की तरह सुंदर ढंग से लिखो। सख्त format:\n\nQ. <photo से पढ़कर सवाल यहाँ लिखो>\nGiven : <दी गई जानकारी>\nFind : <क्या निकालना है>\nSolution :\n<step-by-step, हर step (1) (2) (3) numbering से, नई line पर>\nHence, <अंतिम उत्तर> ✅\n\nनियम: LaTeX ($...$, \\frac) बिल्कुल मत use करो — सादा text (a^2, x/2, √5)। Format सख्ती से ऐसा रखो: सीधे Solution : से शुरू करो — Q./Given:/Find: sections बिल्कुल मत लिखो। फिर flowing explanation — 2-4 line के natural paragraphs, जैसे कोई होनहार student अपनी copy में लिखता है; (1)(2)(3) जैसी numbering मत करो। ज़रूरी values अलग lines पर लिखो, जैसे — Vertical side = x (bracket में reason)। Working में हर equation अलग line पर, fractions साफ़ inline (जैसे x = L/√2)। आखिर में सिर्फ एक line — Hence, <कथन> | <अंतिम उत्तर>। अगर सवाल में कोई आकृति/shape बनता है, तो solution के बीच में अलग line पर एक छोटा SVG diagram भी दो — सादा 2D line drawing, stroke #1e3a8a, stroke-width 3, fill none, viewBox 0 0 400 300, ज़रूरी labels <text> में। कभी भी [diagram] जैसा text placeholder मत लिखो।'
                    : personaLine() + 'Edu Sir, नीचे दिए सवाल का पूरा solution एक school copy की तरह सुंदर ढंग से लिखो। सख्त format:\n\nQ. ' + q + '\nGiven : <दी गई जानकारी>\nFind : <क्या निकालना है>\nSolution :\n<step-by-step, हर step (1) (2) (3) numbering से, नई line पर>\nHence, <अंतिम उत्तर> ✅\n\nनियम: LaTeX ($...$, \\frac) बिल्कुल मत use करो — सादा text (a^2, x/2, √5)। Format सख्ती से ऐसा रखो: सीधे Solution : से शुरू करो — Q./Given:/Find: sections बिल्कुल मत लिखो। फिर flowing explanation — 2-4 line के natural paragraphs, जैसे कोई होनहार student अपनी copy में लिखता है; (1)(2)(3) जैसी numbering मत करो। ज़रूरी values अलग lines पर लिखो, जैसे — Vertical side = x (bracket में reason)। Working में हर equation अलग line पर, fractions साफ़ inline (जैसे x = L/√2)। आखिर में सिर्फ एक line — Hence, <कथन> | <अंतिम उत्तर>। अगर सवाल में कोई आकृति/shape बनता है, तो solution के बीच में अलग line पर एक छोटा SVG diagram भी दो — सादा 2D line drawing, stroke #1e3a8a, stroke-width 3, fill none, viewBox 0 0 400 300, ज़रूरी labels <text> में। कभी भी [diagram] जैसा text placeholder मत लिखो।';
                const payload = { message: prompt };
                if (usePhoto) {
                    const img = window.__lastPhoto || (typeof base64Image !== 'undefined' ? base64Image : null);
                    if (img) payload.image = img;
                }
                const res = await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) throw new Error('Status ' + res.status);
                const data = await res.json();
                let reply = ((data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '').replace(/<think>[\s\S]*?<\/think>/g, '').trim();
                if (!reply) throw new Error('खाली जवाब');
                openNotesModal(reply);
            } catch (e) {
                addEduSirSystemBubble('⚠️ Handwritten solution नहीं बन पाया (' + e.message + ')। दोबारा कोशिश करो!');
            }
        }

// ============ TOPIC NOTES GENERATOR (handwritten notes = topic ke notes) ============
    window.generateTopicNotes = async function (contextText) {
        var q = '';
        try {
            var rows = document.querySelectorAll('#chat-messages > div');
            for (var i = rows.length - 1; i >= 0; i--) {
                var r = rows[i];
                if (r.classList && r.classList.contains('justify-end')) {
                    q = r.textContent.replace(/\u{1F4F7}?\s*\[?Photo Attached\]?/gi, '').trim();
                    break;
                }
            }
        } catch (e) {}
        if (!q && contextText) q = String(contextText).slice(0, 300);
        if (!q) { alert('पहले कोई सवाल पूछो चैंपियन!'); return; }
        if (typeof addEduSirSystemBubble === 'function') {
            addEduSirSystemBubble('📚 Edu Sir इस topic के <b>complete exam-ready notes</b> बना रहे हैं... 30-40 second लगेंगे चैंपियन!');
        }
        window.__notesReq = { type: 'notes', q: q };
        try {
            var persona = (typeof personaLine === 'function') ? personaLine() : '';
            var prompt = persona + 'Edu Sir, नीचे दिए TOPIC पर बहुत DETAILED exam-ready NOTES बनाओ (हिंदी में, सादा text — LaTeX बिल्कुल मत)। Rule: छोटे bullet-fragments बिल्कुल मत लिखो — पूर्ण वाक्यों में, विस्तार से, कम से कम 350-500 शब्द। Format:\n\n📌 Topic: <topic का नाम>\n📖 Detailed Explanation: <2-3 पूरे paragraphs — हर paragraph 3-4 lines, आसान भाषा, रोज़मर्रा के examples के साथ>\n🔑 Important Formulas / Points: <complete list, सादे text में>\n💡 Solved Example: <step-by-step, पूरा>\n⚠️ Common Mistakes: <2-3, explain करके>\n\nTOPIC (सवाल से): ' + q;
            var res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: prompt })
            });
            if (!res.ok) throw new Error('Status ' + res.status);
            var data = await res.json();
            var reply = ((data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '').trim();
            if (!reply) throw new Error('खाली जवाब');
            openNotesModal(reply);
        } catch (e) {
            if (typeof addEduSirSystemBubble === 'function') {
                addEduSirSystemBubble('⚠️ Notes नहीं बन पाए (' + e.message + ')। दोबारा try करो!');
            }
        }
    };
