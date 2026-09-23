/* ============================================================
   🧹 EDUVA DEDUPE — AIT ke multiple buttons → sirf 1 (golden banner)
   Teacher Panel home card hatao (menu + sidebar mein already hai)
   ============================================================ */
(function () {
    'use strict';
    function hide(el) { if (el) el.style.display = 'none'; }
    function run() {
        // 1. Hero ke dono AIT buttons (openTestCampaign) — golden banner hi kaafi hai
        document.querySelectorAll('#view-home button[onclick="openTestCampaign()"]').forEach(hide);
        // 2. Challenges grid ka "All India Test" chip (class p-3.5 wala card)
        document.querySelectorAll('#view-home button.switchTab, #view-home button').forEach(function (b) {
            var oc = b.getAttribute('onclick') || '';
            var cls = b.className || '';
            if (oc.indexOf("switchTab('ait')") !== -1 && cls.indexOf('p-3.5') !== -1) hide(b);
        });
        // 3. Olympiad view ka AIT button (agar hai)
        document.querySelectorAll('#view-olympiad button').forEach(function (b) {
            var oc = b.getAttribute('onclick') || '';
            if (oc.indexOf('ait') !== -1 && (b.textContent || '').indexOf('All India Test') !== -1) hide(b);
        });
        // 4. Teacher Panel ka home acquisition card (menu + sidebar mein already hai)
        document.querySelectorAll('#view-home button').forEach(function (b) {
            if ((b.textContent || '').indexOf('Teacher हो?') !== -1 || (b.textContent || '').indexOf('Teacher ho?') !== -1) hide(b);
        });
        // 5. Home pe doubt ki 3 entries → sirf Snap & Solve (golden) rakho
        document.querySelectorAll('#view-home button').forEach(function (b) {
            var t = b.textContent || '';
            if (t.indexOf('पहला सवाल') !== -1 && (b.getAttribute('onclick') || '').indexOf('chat') !== -1) hide(b);
        });
        var si = document.getElementById('home-search-input');
        if (si) { var bar = si.closest('.card-clean'); if (bar) hide(bar); }
    }
    function init() { run(); setTimeout(run, 1500); setTimeout(run, 4000); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
    console.log('🧹 EDUVA Dedupe loaded');
})();
