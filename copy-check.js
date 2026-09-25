/* ============================================================
   📷 EDUVA COPY CHECK — handwritten copy ki photo → AI checking
   2 modes: (1) 🔍 Only Check — sirf galtiyan (2) ✅ Marks bhi
   Student + Faculty dono use kar sakte hain.
   Photos 2 ghante baad auto-delete (privacy).
   ============================================================ */
(function () {
    'use strict';
    var KEY_IMG = 'eduva_cc_images';
    var TTL = 2 * 60 * 60 * 1000;
    var imgs = [], mode = 'marks', attachedAt = null;
    function $(id) { return document.getElementById(id); }
    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

    function purge() {
        try {
            var raw = sessionStorage.getItem(KEY_IMG);
            if (raw) {
                var e = JSON.parse(raw);
                if (Date.now() - e.t > TTL) { sessionStorage.removeItem(KEY_IMG); imgs = []; }
                else imgs = e.data || [];
            }
        } catch (x) { sessionStorage.removeItem(KEY_IMG); }
    }
    purge();

    var SYS_CHECK = ['तुम एक अनुभवी examiner हो जो बच्चों की copies check करता है। यह "ONLY CHECK" mode है।',
        'कड़े नियम:',
        '1. Photos में दिए हर handwritten answer को ध्यान से पढ़ो।',
        '2. सिर्फ GALTIYAN पकड़ो: spelling, grammar, calculation error, गलत concept/formula, missing steps, unit missing, presentation की गड़बड़ी।',
        '3. Marks बिल्कुल मत दो — गिनती भी मत करो। Teacher खुद marks देगा।',
        '4. हर गलती का format: [Q2] गलत: "..." | सही: "..." | गंभीरता: 🔴 major / 🟡 minor',
        '5. जो answer साफ है उसे भी एक line में बताओ: "Q3 — साफ है ✅" (ताकि पता चले सब check हुआ)।',
        '6. Photo धुंधली हो तो ईमानदारी से लिखो "📷 यह हिस्सा साफ नहीं — दोबारा खींचो"।',
        '7. अंत में: कुल गलतियाँ: N | सबसे common गलती: एक line में।'].join('\n');

    var SYS_MARKS = ['तुम एक अनुभवी teacher हो जो copies check करके marks देता है। हर सवाल 10 में से है।',
        'कड़े नियम:',
        '1. Photos में दिए हर handwritten answer को पढ़ो और जाँचो।',
        '2. हर सवाल का format: Q1 — Marks: 7/10 | ✅ सही: ... | ❌ गलतियाँ: ... | एक line feedback',
        '3. Steps देखो — सीधे answer पर पूरे marks मत दो।',
        '4. Photo धुंधली हो तो "📷 यह हिस्सा साफ नहीं" लिखो, guess मत करो।',
        '5. अंत में ये section ज़रूर दो:',
        '📊 SUMMARY — कुल: X/Y marks | Grade: A/B/C',
        '🎯 Top 3 सुधार (जिनसे सबसे ज़्यादा marks बढ़ेंगे)'].join('\n');

    window.openCopyCheck = function (defaultMode) {
        mode = defaultMode === 'check' ? 'check' : 'marks';
        purge();
        attachedAt = imgs.length ? Date.now() : null;
        render();
    };

    function render() {
        var old = $('cc-ov'); if (old) old.remove();
        var isFaculty = mode === 'check';
        var ov = document.createElement('div');
        ov.id = 'cc-ov';
        ov.style.cssText = 'position:fixed;inset:0;background:rgba(10,15,35,.8);z-index:99;display:flex;align-items:center;justify-content:center;padding:14px;';
        ov.innerHTML = '<div style="background:#f4f6fb;width:100%;max-width:540px;max-height:88vh;border-radius:20px;overflow:hidden;display:flex;flex-direction:column;">'
            + '<div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;padding:13px 16px;display:flex;align-items:center;gap:10px;">'
            + '<strong style="flex:1;font-size:16px;">📷 Copy Check — ' + (isFaculty ? 'Faculty Mode' : 'Answer Check') + '</strong>'
            + '<span id="cc-countdown" style="font-size:10px;font-weight:800;opacity:.85;"></span>'
            + '<button onclick="document.getElementById(\'cc-ov\').remove()" style="background:rgba(255,255,255,.2);border:none;color:#fff;border-radius:10px;width:32px;height:32px;font-size:17px;cursor:pointer;">X</button></div>'
            + '<div style="overflow-y:auto;padding:14px;" id="cc-body">'
            + '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;">'
            + '<button onclick="document.getElementById(\'cc-cam\').click()" style="padding:9px 14px;background:#4f46e5;color:#fff;border:none;border-radius:11px;font-weight:900;font-size:12px;cursor:pointer;">📸 Camera</button>'
            + '<button onclick="document.getElementById(\'cc-file\').click()" style="padding:9px 14px;background:#e2e8f0;color:#334155;border:none;border-radius:11px;font-weight:900;font-size:12px;cursor:pointer;">🖼️ Gallery</button>'
            + (imgs.length ? '<button onclick="window.__ccClear()" style="padding:9px 14px;background:#fee2e2;color:#b91c1c;border:none;border-radius:11px;font-weight:900;font-size:12px;cursor:pointer;">🗑️ साफ</button>' : '')
            + '</div>'
            + '<input type="file" id="cc-cam" accept="image/*" capture="environment" class="hidden">'
            + '<input type="file" id="cc-file" accept="image/*" multiple class="hidden">'
            + '<div id="cc-pages" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;"></div>'
            + '<div style="display:flex;gap:8px;background:#eef2ff;border:1px solid #c7d2fe;border-radius:12px;padding:8px;margin-bottom:10px;">'
            + '<button onclick="window.__ccMode(\'check\')" id="cc-m-check" style="flex:1;padding:10px;border-radius:10px;font-weight:900;font-size:11px;cursor:pointer;border:2px solid ' + (isFaculty ? '#4f46e5' : '#e2e8f0') + ';background:' + (isFaculty ? '#eef2ff' : '#fff') + ';color:#1c2333;">🔍 Only Check<br><span style="font-size:9px;font-weight:700;opacity:.7;">सिर्फ गलतियाँ — marks नहीं</span></button>'
            + '<button onclick="window.__ccMode(\'marks\')" id="cc-m-marks" style="flex:1;padding:10px;border-radius:10px;font-weight:900;font-size:11px;cursor:pointer;border:2px solid ' + (!isFaculty ? '#4f46e5' : '#e2e8f0') + ';background:' + (!isFaculty ? '#eef2ff' : '#fff') + ';color:#1c2333;">✅ Check + Marks<br><span style="font-size:9px;font-weight:700;opacity:.7;">गलतियाँ + marks + grade</span></button></div>'
            + '<p style="font-size:10px;font-weight:700;color:#64748b;margin-bottom:10px;">🔒 Copies 2 घंटे बाद system से auto-delete — कहीं save/share नहीं होतीं।</p>'
            + '<button onclick="window.__ccRun(this)" id="cc-run" style="width:100%;padding:13px;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;border:none;border-radius:13px;font-weight:900;font-size:14px;cursor:pointer;">🚀 Check शुरू करो (30-60 sec)</button>'
            + '<div id="cc-result" style="margin-top:12px;"></div>'
            + '</div></div>';
        document.body.appendChild(ov);
        $('cc-cam').onchange = function () { addFiles(this); };
        $('cc-file').onchange = function () { addFiles(this); };
        renderPages();
        tick();
    }
    function tick() {
        var el = $('cc-countdown'); if (!el) return;
        if (!attachedAt) { el.textContent = ''; return; }
        var left = TTL - (Date.now() - attachedAt);
        if (left <= 0) { imgs = []; attachedAt = null; renderPages(); el.textContent = '🗑️ deleted'; return; }
        var m = Math.floor(left / 60000);
        el.textContent = '🔒 ' + m + ' min में delete';
        setTimeout(tick, 30000);
    }
    function compressFile(file, cb) {
        try {
            var img = new Image();
            var url = URL.createObjectURL(file);
            img.onload = function () {
                try {
                    var maxW = 1600;
                    var scale = Math.min(1, maxW / img.width);
                    var c = document.createElement('canvas');
                    c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
                    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
                    URL.revokeObjectURL(url);
                    cb(c.toDataURL('image/jpeg', 0.72).split(',')[1]);
                } catch (e) { cb(null); }
            };
            img.onerror = function () { try { URL.revokeObjectURL(url); } catch (e) {} cb(null); };
            img.src = url;
        } catch (e) { cb(null); }
    }
    function pushImg(b64) {
        if (!b64) return;
        imgs.push(b64);
        if (!attachedAt) attachedAt = Date.now();
        try { sessionStorage.setItem(KEY_IMG, JSON.stringify({ t: Date.now(), data: imgs })); } catch (e) {}
        renderPages(); tick();
    }
    function addFiles(inp) {
        var files = inp.files;
        if (!files || !files.length) return;
        Array.prototype.forEach.call(files, function (f) {
            compressFile(f, function (b64) {
                if (b64) pushImg(b64);
                else { var r = new FileReader(); r.onload = function (ev) { pushImg(String(ev.target.result).split(',')[1]); }; r.readAsDataURL(f); }
            });
        });
        inp.value = '';
    }
    function renderPages() {
        var el = $('cc-pages'); if (!el) return;
        el.innerHTML = imgs.map(function (_, i) {
            return '<span style="display:inline-flex;align-items:center;gap:4px;background:#fff;border:1px solid #e2e8f0;border-radius:99px;padding:4px 10px;font-size:11px;font-weight:800;color:#4f46e5;">📄 Page ' + (i + 1)
                + ' <a href="#" onclick="window.__ccDel(' + i + ');return false;" style="color:#dc2626;text-decoration:none;">✕</a></span>';
        }).join('') + (imgs.length ? '<span style="font-size:10px;color:#94a3b8;font-weight:700;">सभी pages जोड़ो, फिर Check दबाओ →</span>' : '<span style="font-size:11px;color:#94a3b8;font-weight:700;">अभी कोई page नहीं — Camera/Gallery से जोड़ो</span>');
    }
    window.__ccDel = function (i) { imgs.splice(i, 1); if (!imgs.length) attachedAt = null; renderPages(); };
    window.__ccClear = function () { imgs = []; attachedAt = null; renderPages(); };
    window.__ccMode = function (m) { mode = m; render(); };

    window.__ccRun = function (btn) {
        if (!imgs.length) { alert('पहले copy की photos जोड़ो (एक-एक page)।'); return; }
        btn.disabled = true; btn.textContent = '⏳ AI copy पढ़ रहा है... 30-60 sec';
        $('cc-result').innerHTML = '<div style="padding:12px;background:#fff;border:1px solid #e2e8f0;border-radius:12px;color:#64748b;font-size:13px;font-weight:700;"><span class="eduva-typing"><i></i><i></i><i></i></span> हर answer line-by-line पढ़ा जा रहा है...</div>';
        var body = {
            message: (mode === 'check' ? 'ये copies की photos हैं। ONLY CHECK mode: सिर्फ गलतियाँ पकड़ो, marks मत दो।' : 'ये copies की photos हैं। हर सवाल 10 में से marks दो।'),
            system: mode === 'check' ? SYS_CHECK : SYS_MARKS,
            images: imgs
        };
        fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
            .then(function (r) { return r.json(); })
            .then(function (d) {
                btn.disabled = false; btn.textContent = '🚀 Check शुरू करो (30-60 sec)';
                var reply = (d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content) || '⚠️ जवाब नहीं आया — दोबारा try करो।';
                $('cc-result').innerHTML = '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:14px;font-size:14px;line-height:1.7;color:#1c2333;white-space:pre-wrap;max-height:45vh;overflow-y:auto;">' + esc(reply) + '</div>'
                    + '<div style="display:flex;gap:8px;margin-top:10px;">'
                    + '<button onclick="window.__ccRun(document.getElementById(\'cc-run\'))" style="flex:1;padding:11px;background:#e2e8f0;border:none;border-radius:11px;font-weight:900;font-size:12px;cursor:pointer;color:#334155;">🔄 दोबारा Check</button>'
                    + '<button onclick="document.getElementById(\'cc-ov\').remove()" style="flex:1;padding:11px;background:#0f172a;border:none;border-radius:11px;font-weight:900;font-size:12px;cursor:pointer;color:#fff;">✅ हो गया</button></div>';
            })
            .catch(function (e) {
                btn.disabled = false; btn.textContent = '🚀 Check शुरू करो (30-60 sec)';
                $('cc-result').innerHTML = '<p style="color:#dc2626;font-weight:800;font-size:13px;">⚠️ ' + esc(e.message) + ' — दोबारा try करो।</p>';
            });
    };
    console.log('📷 EDUVA Copy Check loaded');
})();
