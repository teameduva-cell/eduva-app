/* ============================================================
   💬 EDUVA CHAT POLISH — declutter + professional look
   Saare tools (Features, Diary, Revision, Parent Report)
   ek collapsible "Study Tools" card mein. Chat = chat.
   ============================================================ */
(function () {
    'use strict';
    function build() {
        var chat = document.getElementById('view-chat');
        if (!chat || document.getElementById('chat-tools-card')) return;
        // Purane latakte hue blocks dhoondo
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
        // Compact tool buttons
        var tools = [
            ['📓', 'Doubt Diary', "openDiary()", '#0f3c7d'],
            ['📅', 'Aaj ka Revision', "openRevision()", '#065f46'],
            ['👨‍👩‍👦', 'Parent Report', "openParentReport()", '#7c2d12'],
            ['⚡', 'All Features', "window.location.href='/features.html'", '#4f46e5']
        ];
        tools.forEach(function (t) {
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
        // Purane blocks chhupa do (features ab card mein hain)
        hit.forEach(function (c) { c.style.display = 'none'; });
    }
    function init() { build(); setTimeout(build, 2000); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
    console.log('💬 EDUVA Chat Polish loaded');
})();
