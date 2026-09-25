/* ============================================================
   📓 EDUVA PRACTICE NOTEBOOK — haath se likho, jaise register mein!
   Endless page + auto-scroll + pen/eraser + 🤖 AI check
   ============================================================ */
(function () {
    'use strict';
    var cv, ctx, strokes = [], current = null, color = '#1c2333', size = 3, erasing = false;
    var PAGE_H = 4000;
    var pagesArr = [[]], curPage = 0;

    function openPad() {
        closePad();
        var ov = document.createElement('div');
        ov.id = 'wp-ov';
        ov.style.cssText = 'position:fixed;inset:0;background:#fff;z-index:95;display:flex;flex-direction:column;';
        ov.innerHTML =
            '<div style="background:#0f172a;color:#fff;padding:8px 10px;display:flex;align-items:center;gap:6px;flex-wrap:wrap;flex-shrink:0;">'
            + '<strong style="font-size:13px;flex:1;min-width:100px;">📓 Practice Notebook</strong>'
            + '<input id="wp-q" placeholder="कौन सा सवाल solve कर रहे हो? (optional)" style="flex:2;min-width:140px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);color:#fff;border-radius:10px;padding:7px 10px;font-size:11px;font-weight:700;outline:none;">'
            + '<button onclick="window.__wpColor(\'#1c2333\')" class="wp-tb" style="background:#1c2333;width:26px;height:26px;border-radius:8px;border:2px solid #fff;cursor:pointer;"></button>'
            + '<button onclick="window.__wpColor(\'#2563eb\')" class="wp-tb" style="background:#2563eb;width:26px;height:26px;border-radius:8px;border:2px solid rgba(255,255,255,.3);cursor:pointer;"></button>'
            + '<button onclick="window.__wpColor(\'#dc2626\')" class="wp-tb" style="background:#dc2626;width:26px;height:26px;border-radius:8px;border:2px solid rgba(255,255,255,.3);cursor:pointer;"></button>'
            + '<button onclick="window.__wpEraser()" id="wp-eraser" class="wp-tb" style="background:rgba(255,255,255,.15);color:#fff;border:none;border-radius:8px;padding:5px 9px;font-size:15px;cursor:pointer;">🧽</button>'
            + '<button onclick="window.__wpUndo()" class="wp-tb" style="background:rgba(255,255,255,.15);color:#fff;border:none;border-radius:8px;padding:5px 9px;font-size:15px;cursor:pointer;">↩️</button>'
            + '<button onclick="window.__wpClear()" class="wp-tb" style="background:rgba(255,255,255,.15);color:#fff;border:none;border-radius:8px;padding:5px 9px;font-size:15px;cursor:pointer;">🗑️</button>'
            + '</div>'
            + '<div style="background:#1e293b;color:#fff;padding:6px 10px;display:flex;align-items:center;gap:8px;flex-shrink:0;">'
            + '<button onclick="window.__wpGoto(-1)" class="wp-tb" style="background:rgba(255,255,255,.12);color:#fff;border:none;border-radius:8px;padding:4px 10px;font-size:13px;cursor:pointer;">⬅ Prev</button>'
            + '<span id="wp-pno" style="font-size:12px;font-weight:900;flex:1;text-align:center;">📄 Page 1/1</span>'
            + '<button onclick="window.__wpGoto(1)" class="wp-tb" style="background:rgba(255,255,255,.12);color:#fff;border:none;border-radius:8px;padding:4px 10px;font-size:13px;cursor:pointer;">Next ➡</button>'
            + '<button onclick="window.__wpNewPage()" class="wp-tb" style="background:#059669;color:#fff;border:none;border-radius:8px;padding:4px 12px;font-size:12px;font-weight:900;cursor:pointer;">➕ Naya Page</button>'
            + '</div>'
            + '<div id="wp-scroll" style="flex:1;overflow-y:auto;background:#fdfdf8;touch-action:none;">'
            + '<canvas id="wp-cv" style="display:block;background:repeating-linear-gradient(#fdfdf8 0 34px,#dbeafe 34px 35px);"></canvas>'
            + '<p style="text-align:center;color:#94a3b8;font-size:11px;font-weight:700;padding:14px;">— नीचे लिखते जाओ, page अपने आप बढ़ता है ✍️ —</p></div>'
            + '<div style="padding:8px 10px;display:flex;gap:6px;background:#f8fafc;border-top:1px solid #e2e8f0;flex-shrink:0;">'
            + '<button onclick="window.__wpCheck()" id="wp-check" class="flex-1 py-3 rounded-xl text-white font-black text-xs cursor-pointer" style="background:linear-gradient(135deg,#4f46e5,#7c3aed);">🤖 AI se check karwao (marks + galtiyan)</button>'
            + '<button onclick="window.__wpPages()" class="px-4 py-3 rounded-xl bg-emerald-600 text-white font-black text-xs cursor-pointer">📚 My Pages</button>'
            + '<button onclick="window.__wpSave()" class="px-4 py-3 rounded-xl bg-slate-800 text-white font-black text-xs cursor-pointer">💾 Save</button>'
            + '<button onclick="closePad()" class="px-4 py-3 rounded-xl bg-slate-200 text-slate-600 font-black text-xs cursor-pointer">✕ Band</button></div>'
            + '<div id="wp-result" style="max-height:32vh;overflow-y:auto;background:#f8fafc;border-top:1px solid #e2e8f0;padding:8px 10px;display:none;"></div>';
        document.body.appendChild(ov);
        pagesArr = [[]]; curPage = 0; strokes = pagesArr[0];
        initCanvas();
    }
    window.openPad = openPad;
    window.closePad = function () { var o = document.getElementById('wp-ov'); if (o) o.remove(); };

    function initCanvas() {
        cv = document.getElementById('wp-cv');
        var sc = document.getElementById('wp-scroll');
        var dpr = window.devicePixelRatio || 1;
        cv.width = window.innerWidth * dpr;
        cv.height = PAGE_H * dpr;
        cv.style.width = window.innerWidth + 'px';
        cv.style.height = PAGE_H + 'px';
        ctx = cv.getContext('2d');
        ctx.scale(dpr, dpr);
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        redraw();
        var drawing = false;
        function pos(e) { var r = cv.getBoundingClientRect(); var t = e.touches ? e.touches[0] : e; return { x: t.clientX - r.left, y: t.clientY - r.top }; }
        function start(e) { e.preventDefault(); drawing = true; var p = pos(e); current = { pts: [p], color: erasing ? '#fdfdf8' : color, size: erasing ? 22 : size }; }
        function move(e) {
            if (!drawing) return;
            e.preventDefault();
            var p = pos(e);
            current.pts.push(p);
            drawSeg(current, current.pts.length - 2);
            // AUTO-SCROLL: pen neeche jaaye to page khud neeche
            var sc = document.getElementById('wp-scroll');
            var relY = p.y - sc.scrollTop;
            if (relY > sc.clientHeight * 0.72) sc.scrollTop += 14;
        }
        function end(e) {
            if (!drawing) return;
            drawing = false;
            if (current && current.pts.length > 1) { strokes.push(current); if (strokes.length > 400) strokes.shift(); }
            current = null;
        }
        cv.addEventListener('touchstart', start, { passive: false });
        cv.addEventListener('touchmove', move, { passive: false });
        cv.addEventListener('touchend', end);
        cv.addEventListener('mousedown', start);
        cv.addEventListener('mousemove', function (e) { if (drawing) move(e); });
        cv.addEventListener('mouseup', end);
    }
    function drawSeg(st, i) {
        ctx.strokeStyle = st.color; ctx.lineWidth = st.size;
        ctx.beginPath();
        ctx.moveTo(st.pts[i].x, st.pts[i].y);
        ctx.lineTo(st.pts[i + 1].x, st.pts[i + 1].y);
        ctx.stroke();
    }
    function drawWatermark(c, w, h, alpha) {
        c.save();
        c.globalAlpha = alpha || 0.07;
        c.fillStyle = '#1e3a8a';
        c.font = '900 26px sans-serif';
        c.rotate(-0.4);
        for (var yy = -100; yy < h + 200; yy += 140) {
            for (var xx = -150; xx < w + 250; xx += 260) {
                c.fillText('EDUVA', xx, yy);
            }
        }
        c.restore();
    }
    function redraw() {
        ctx.clearRect(0, 0, cv.width, cv.height);
        drawWatermark(ctx, window.innerWidth, PAGE_H, 0.05);
        strokes.forEach(function (st) { for (var i = 0; i < st.pts.length - 1; i++) drawSeg(st, i); });
    }
    window.__wpColor = function (c) { color = c; erasing = false; document.querySelectorAll('.wp-tb').forEach(function () {}); var e = document.getElementById('wp-eraser'); if (e) e.style.background = 'rgba(255,255,255,.15)'; };
    function pageLabel() { var el = document.getElementById('wp-pno'); if (el) el.textContent = '📄 Page ' + (curPage + 1) + '/' + pagesArr.length; }
    window.__wpGoto = function (dir) {
        var t = curPage + dir;
        if (t < 0 || t >= pagesArr.length) return;
        pagesArr[curPage] = strokes;
        curPage = t; strokes = pagesArr[curPage];
        redraw();
        var sc = document.getElementById('wp-scroll'); if (sc) sc.scrollTop = 0;
        pageLabel();
    };
    window.__wpNewPage = function () {
        if (pagesArr.length >= 20) { alert('Ek session mein 20 pages ka limit hai — 💾 Save karke naya session khol lo.'); return; }
        pagesArr[curPage] = strokes;
        pagesArr.push([]); curPage = pagesArr.length - 1; strokes = pagesArr[curPage];
        redraw();
        var sc = document.getElementById('wp-scroll'); if (sc) sc.scrollTop = 0;
        pageLabel();
        try { if (typeof eduvaToast !== 'undefined') eduvaToast('📄 Naya page — likho shuru!'); } catch (e) {}
    };
    window.__wpEraser = function () { erasing = !erasing; var e = document.getElementById('wp-eraser'); if (e) e.style.background = erasing ? '#f59e0b' : 'rgba(255,255,255,.15)'; };
    window.__wpUndo = function () { strokes.pop(); redraw(); };
    window.__wpClear = function () { if (confirm('Poora page saaf?')) { strokes = []; redraw(); } };
    function getPages() { try { return JSON.parse(localStorage.getItem('eduva_wp_pages') || '[]'); } catch (e) { return []; } }
    function setPages(a) { try { localStorage.setItem('eduva_wp_pages', JSON.stringify(a.slice(0, 12))); } catch (e) { alert('Storage full — purani pages delete karo.'); } }
    window.__wpSave = function () {
        if (!strokes.length) { alert('Pehle kuch likho! ✍️'); return; }
        // thumbnail banao
        var th = document.createElement('canvas');
        th.width = 160; th.height = 200;
        var tc = th.getContext('2d');
        tc.fillStyle = '#fdfdf8'; tc.fillRect(0, 0, 160, 200);
        drawWatermark(tc, 160, 200, 0.09);
        var sx = 160 / window.innerWidth, sy = 200 / Math.min(PAGE_H, 1200);
        strokes.forEach(function (st) {
            tc.strokeStyle = st.color; tc.lineWidth = Math.max(1, st.size * sx); tc.lineCap = 'round';
            tc.beginPath();
            st.pts.forEach(function (pt, i) { var x = pt.x * sx, y = pt.y * sy * (sy > sx ? 1 : 1); if (i === 0) tc.moveTo(x, y); else tc.lineTo(x, y); });
            tc.stroke();
        });
        var pages = getPages();
        var q = (document.getElementById('wp-q') || {}).value || '';
        pages.unshift({
            id: Date.now(), date: new Date().toLocaleString('hi-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
            title: (q ? q.slice(0, 40) : 'Page — ' + new Date().toLocaleDateString('hi-IN')) + (pagesArr.length > 1 ? ' (P' + (curPage + 1) + ')' : ''),
            strokes: strokes, thumb: th.toDataURL('image/jpeg', 0.6)
        });
        setPages(pages);
        try { if (typeof eduvaToast !== 'undefined') eduvaToast('💾 Page save ho gaya! "📚 My Pages" mein dekho.'); } catch (e) {}
    };
    window.__wpPages = function () {
        var pages = getPages();
        var ov = document.createElement('div');
        ov.id = 'wp-pages-ov';
        ov.style.cssText = 'position:fixed;inset:0;background:rgba(10,15,35,.85);z-index:96;display:flex;align-items:center;justify-content:center;padding:14px;';
        ov.innerHTML = '<div style="background:#f4f6fb;width:100%;max-width:520px;max-height:80vh;border-radius:20px;overflow:hidden;display:flex;flex-direction:column;">'
            + '<div style="background:#065f46;color:#fff;padding:13px 16px;display:flex;align-items:center;gap:10px;"><strong style="flex:1;font-size:15px;">📚 My Pages (' + pages.length + '/12)</strong>'
            + '<button onclick="document.getElementById(\'wp-pages-ov\').remove()" style="background:rgba(255,255,255,.2);border:none;color:#fff;border-radius:10px;width:32px;height:32px;font-size:17px;cursor:pointer;">X</button></div>'
            + '<div style="overflow-y:auto;padding:12px;display:grid;grid-template-columns:1fr 1fr;gap:10px;">'
            + (pages.length ? pages.map(function (pg) {
                return '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;">'
                    + '<img src="' + pg.thumb + '" style="width:100%;height:110px;object-fit:cover;object-position:top;background:#fdfdf8;">'
                    + '<div style="padding:8px;"><p style="font-size:11px;font-weight:900;color:#1c2333;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + pg.title.replace(/</g, '&lt;') + '</p>'
                    + '<p style="font-size:9px;color:#94a3b8;font-weight:700;">' + pg.date + '</p>'
                    + '<div style="display:flex;gap:4px;margin-top:6px;">'
                    + '<button onclick="window.__wpOpen(' + pg.id + ')" style="flex:1;padding:6px;background:#065f46;color:#fff;border:none;border-radius:8px;font-size:10px;font-weight:900;cursor:pointer;">✏️ Kholo</button>'
                    + '<button onclick="window.__wpDl(' + pg.id + ')" style="flex:1;padding:6px;background:#0f172a;color:#fff;border:none;border-radius:8px;font-size:10px;font-weight:900;cursor-pointer;">⬇️ PNG</button>'
                    + '<button onclick="window.__wpDel(' + pg.id + ')" style="padding:6px 8px;background:#fee2e2;color:#b91c1c;border:none;border-radius:8px;font-size:10px;font-weight:900;cursor:pointer;">🗑️</button>'
                    + '</div></div></div>';
            }).join('') : '<p style="grid-column:1/-1;text-align:center;color:#64748b;font-weight:700;padding:20px;">Abhi koi page nahi — likho aur 💾 Save dabao!</p>')
            + '</div></div>';
        document.body.appendChild(ov);
    };
    window.__wpOpen = function (id) {
        var pg = getPages().filter(function (x) { return x.id === id; })[0];
        if (!pg) return;
        strokes = JSON.parse(JSON.stringify(pg.strokes));
        var q = document.getElementById('wp-q'); if (q) q.value = pg.title.indexOf('Page') === 0 ? '' : pg.title;
        var po = document.getElementById('wp-pages-ov'); if (po) po.remove();
        redraw();
        var sc = document.getElementById('wp-scroll'); if (sc) sc.scrollTop = 0;
        try { if (typeof eduvaToast !== 'undefined') eduvaToast('✏️ Page khul gaya — aage likho!'); } catch (e) {}
    };
    window.__wpDl = function (id) {
        var pg = getPages().filter(function (x) { return x.id === id; })[0];
        if (!pg) return;
        var big = document.createElement('canvas');
        big.width = window.innerWidth; big.height = Math.min(PAGE_H, 1600);
        var bc = big.getContext('2d');
        bc.fillStyle = '#fdfdf8'; bc.fillRect(0, 0, big.width, big.height);
        drawWatermark(bc, big.width, big.height, 0.08);
        pg.strokes.forEach(function (st) {
            bc.strokeStyle = st.color; bc.lineWidth = st.size; bc.lineCap = 'round'; bc.lineJoin = 'round';
            bc.beginPath();
            st.pts.forEach(function (pt, i) { if (i === 0) bc.moveTo(pt.x, pt.y); else bc.lineTo(pt.x, pt.y); });
            bc.stroke();
        });
        var a = document.createElement('a');
        a.href = big.toDataURL('image/png');
        a.download = 'EDUVA-page-' + id + '.png';
        a.click();
    };
    window.__wpDel = function (id) {
        if (!confirm('Ye page delete?')) return;
        setPages(getPages().filter(function (x) { return x.id !== id; }));
        var po = document.getElementById('wp-pages-ov'); if (po) po.remove();
        window.__wpPages();
    };
    window.__wpCheck = async function () {
        if (!strokes.length) { alert('Pehle kuch likho! ✍️'); return; }
        var btn = document.getElementById('wp-check'), res = document.getElementById('wp-result');
        btn.disabled = true; btn.textContent = '⏳ AI padh raha hai... 20-40 sec';
        res.style.display = 'block';
        res.innerHTML = '<p style="color:#64748b;font-size:12px;font-weight:700;">⏳ Handwriting padhi ja rahi hai...</p>';
        try {
            var img = cv.toDataURL('image/jpeg', 0.7).split(',')[1];
            var q = (document.getElementById('wp-q') || {}).value || '';
            var body = {
                message: 'Maine ye solution haath se likha hai (photo attached)' + (q ? '. Sawal ye tha: ' + q : ' (sawal photo mein bhi likha ho to wahi padh lo)') + '. Isse check karke marks do (10 में से) + galtiyan + sudhaar tips.',
                system: 'तुम एक teacher हो जो बच्चे की HANDWRITING wali copy check कर रहे हो। Photo में लिखा solution पढ़ो। साफ न दिखे तो ईमानदारी से बताओ। Marks दो, गलतियाँ निकालो, encouragement रखो। Hindi में।',
                images: [img]
            };
            var r = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            if (!r.ok) throw new Error('API ' + r.status);
            var d = await r.json();
            var reply = (d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content) || 'खाली जवाब';
            res.innerHTML = '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:12px;font-size:13px;line-height:1.7;color:#1c2333;white-space:pre-wrap;">' + String(reply).replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</div>';
        } catch (e) {
            res.innerHTML = '<p style="color:#dc2626;font-size:12px;font-weight:800;">⚠️ ' + e.message + ' — दोबारा try करो।</p>';
        }
        btn.disabled = false; btn.textContent = '🤖 AI se check karwao (marks + galtiyan)';
    };

    function injectEntry() {
        var slot = document.getElementById('revision-card-slot');
        if (slot && !document.getElementById('wp-home-btn')) {
            var b = document.createElement('button');
            b.id = 'wp-home-btn';
            b.className = 'w-full p-4 rounded-2xl flex items-center gap-3 text-left cursor-pointer transition hover:scale-[1.01] border-2 border-blue-200 bg-gradient-to-r from-sky-50 to-blue-50';
            b.innerHTML = '<div class="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center text-xl shrink-0">✍️</div>'
                + '<div class="flex-1"><p class="text-sm font-black text-slate-900">Haath se likho — Practice Notebook</p>'
                + '<p class="text-[11px] font-bold text-slate-500">Finger/stylus se likho (register jaisi lines) • 🤖 AI khud marks dega!</p></div><span class="text-blue-500 text-lg">›</span>';
            b.onclick = openPad;
            slot.insertAdjacentElement('afterend', b);
        }
        // Homework view mein bhi
        var hw = document.getElementById('homework-tasks');
        if (hw && !document.getElementById('wp-hw-btn')) {
            var hb = document.createElement('button');
            hb.id = 'wp-hw-btn';
            hb.className = 'w-full p-3 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/50 text-blue-700 text-xs font-black cursor-pointer';
            hb.textContent = '✍️ Answer haath se likhna hai? Practice Notebook kholo → AI check karega';
            hb.onclick = openPad;
            hw.parentElement.insertBefore(hb, hw.nextSibling);
        }
    }
    function init() { try { injectEntry(); } catch (e) {} setTimeout(injectEntry, 2000); setTimeout(injectEntry, 5000); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
    console.log('📓 EDUVA Practice Notebook loaded');
})();
