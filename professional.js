/* ============================================================
   ✨ EDUVA PROFESSIONAL POLISH — spacing, cards, home order
   ============================================================ */
(function () {
    'use strict';
    // ---------- 1. Global CSS normalize ----------
    var css = [
        /* Consistent section rhythm on home */
        '#view-home { display: flex; flex-direction: column; gap: 14px; }',
        '#view-home > * { margin-bottom: 0 !important; }',
        /* Uniform cards & banners */
        '#view-home .card-clean, #view-home > button, #view-home > a.btn-like { border-radius: 20px !important; }',
        '#view-home > button { box-shadow: 0 6px 18px rgba(15,23,42,.08) !important; }',
        '#view-home .card-clean { box-shadow: 0 4px 14px rgba(15,23,42,.05) !important; }',
        /* Inline stray margins normalize */
        '#view-home div[style*="margin:10px 12px"] { margin-left: 0 !important; margin-right: 0 !important; }',
        /* Headings: tighter, pro */
        '#view-home h3 { letter-spacing: -.01em; }',
        /* Numbers strip: slimmer */
        '#view-home .grid.grid-cols-2.sm\\:grid-cols-4 .p-4 { padding: 12px 8px !important; }',
        /* Continue learning & lists: tighter rows */
        '#continue-learning-body .p-4, #continue-learning-body .p-3 { padding: 10px 12px !important; }',
        /* Big hero heading: slightly smaller on mobile for balance */
        '@media (max-width: 640px) { .hero-custom h1 { font-size: 26px !important; } .hero-custom { min-height: 0 !important; padding: 22px !important; } }',
        /* Chat header: compact, no wrap */
        '#view-chat .min-w-0 > p { white-space: nowrap !important; }',
        '#view-chat .min-w-0 > p:first-child { font-size: 12px !important; }',
        /* Consistent grid gaps */
        '#view-home .grid { gap: 10px !important; }'
    ].join('\n');
    var style = document.createElement('style');
    style.id = 'eduva-prof-style';
    style.textContent = css;
    document.head.appendChild(style);

    // ---------- 2. Home reorder: Hero → AIT → Ganita → Numbers → Snap → Homework → Spin → Mission → rest ----------
    function find(match) {
        var els = document.querySelectorAll('#view-home > *');
        for (var i = 0; i < els.length; i++) {
            if (match(els[i])) return els[i];
        }
        return null;
    }
    function hasText(el, t) { return el && (el.textContent || '').indexOf(t) !== -1; }
    function reorder() {
        var home = document.getElementById('view-home');
        if (!home || home.__profOrdered) return;
        var hero = find(function (e) { return e.classList && e.classList.contains('hero-custom'); });
        if (!hero) return;
        var order = [
            function (e) { return e.tagName === 'BUTTON' && hasText(e, 'ALL INDIA EDUVA TEST'); },          // AIT golden
            function (e) { return e.tagName === 'BUTTON' && hasText(e, 'Ganita Manjari'); },               // Ganita banner
            function (e) { return hasText(e, 'doubts solved') && e.querySelector && e.querySelector('.grid'); }, // numbers strip
            function (e) { return e.tagName === 'BUTTON' && (e.getAttribute('onclick') || '').indexOf('snapAndSolve') !== -1; }, // Snap & Solve
            function (e) { return e.tagName === 'BUTTON' && (e.getAttribute('onclick') || '').indexOf("switchTab('homework')") !== -1; },
            function (e) { return e.tagName === 'BUTTON' && (e.getAttribute('onclick') || '').indexOf("switchTab('spin')") !== -1; },
            function (e) { return e.querySelector && e.querySelector('#mission-list'); }                    // mission
        ];
        var anchor = hero;
        order.forEach(function (match) {
            var el = find(match);
            if (el && el !== anchor) {
                anchor.parentElement.insertBefore(el, anchor.nextSibling);
                anchor = el;
            }
        });
        home.__profOrdered = true;
        console.log('✨ EDUVA home reordered');
    }
    function chatHeader() {
        var dc = document.getElementById('doubt-counter-num-chat');
        if (dc && !dc.__compact) {
            dc.__compact = true;
            var n = dc.textContent;
            dc.parentElement.innerHTML = '🧠 <span id="doubt-counter-num-chat" style="white-space:nowrap;">' + n + '</span> doubts';
        }
        var titleP = document.querySelector('#view-chat .min-w-0 > p');
        if (titleP && !titleP.__compact) {
            titleP.__compact = true;
            titleP.innerHTML = '<span style="font-size:12px;font-weight:900;color:#0f172a;">Edu Sir</span>';
        }
    }
    function init() {
        chatHeader();
        reorder();
        setTimeout(function () { reorder(); chatHeader(); }, 1800); // after dynamic renders
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
    console.log('✨ EDUVA Professional Polish loaded');
})();
