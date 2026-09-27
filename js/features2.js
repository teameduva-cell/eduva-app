window.openSettings = function () { document.getElementById('settings-modal').classList.remove('hidden'); };
    window.closeSettings = function () { document.getElementById('settings-modal').classList.add('hidden'); };
    window.showPwSection = function () { document.getElementById('settings-pw').classList.remove('hidden'); };
    window.hidePwSection = function () { document.getElementById('settings-pw').classList.add('hidden'); };
    window.askDeleteAccount = function () { if (confirm('Pakka account delete karna hai?')) { deleteMyAccount(); } };
    window.submitPwChange = async function () {
        var msg = document.getElementById('pw-msg');
        var c = document.getElementById('pw-current').value, n = document.getElementById('pw-new').value, n2 = document.getElementById('pw-confirm').value;
        if (!c || !n) { msg.textContent = '❌ दोनों password भरो'; msg.style.color = '#dc2626'; return; }
        if (n.length < 6) { msg.textContent = '❌ नया password कम से कम 6 अक्षर'; msg.style.color = '#dc2626'; return; }
        if (n !== n2) { msg.textContent = '❌ दोनों नए password मिल नहीं रहे'; msg.style.color = '#dc2626'; return; }
        msg.textContent = '⏳ बदला जा रहा है...'; msg.style.color = '#2563eb';
        try {
            if (typeof eduvaAuthChangePassword !== 'function') throw new Error('Login चाहिए');
            await eduvaAuthChangePassword(c, n);
            msg.textContent = '✅ Password बदल गया!'; msg.style.color = '#059669';
            setTimeout(closeSettings, 1200);
        } catch (e) {
            msg.textContent = '❌ ' + (e.message || 'Failed — current password सही है?'); msg.style.color = '#dc2626';
        }
    };

/* ---- consolidated block ---- */

(function () {
        var lastRender = 0;
        window.renderPartnerLeads = async function () {
            var box = document.getElementById('founder-partner-leads');
            var badge = document.getElementById('pl-count-badge');
            if (!box) return;
            box.innerHTML = '<p class="text-sm text-slate-400 text-center py-3">⏳ Loading...</p>';
            try {
                if (typeof eduvaGetPartnerLeads !== 'function') throw new Error('Firebase not ready');
                var leads = await eduvaGetPartnerLeads();
                try { if (typeof eduvaGetCreatorLeads === 'function') leads = leads.concat(await eduvaGetCreatorLeads()); } catch (e2) {}
                leads.sort(function (a, b) { return ((b.at && b.at.seconds) || 0) - ((a.at && a.at.seconds) || 0); });
                if (badge) badge.textContent = leads.length + ' leads';
                if (!leads.length) { box.innerHTML = '<p class="text-sm text-slate-400 text-center py-3">Abhi koi lead nahi — Contact Us page ka form test karke dekho 🙏</p>'; return; }
                box.innerHTML = leads.map(function (l) {
                    var when = l.at && l.at.seconds ? new Date(l.at.seconds * 1000).toLocaleString('hi-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
                    var phone = (l.phone || '').replace(/\D/g, '');
                    var wa = phone.length >= 10 ? 'https://wa.me/91' + phone.slice(-10) : null;
                    if (l._creator) {
                        return '<div class="p-3.5 bg-white border border-fuchsia-200 rounded-2xl shadow-2xs space-y-1.5">'
                            + '<div class="flex flex-wrap items-center justify-between gap-2">'
                            + '<p class="text-sm font-black text-slate-900">✍️ ' + (l.name || '-') + ' <span class="text-[10px] font-bold text-fuchsia-500">(CREATOR — ' + (l.subject || '') + ' • ' + (l.classRange || '') + ')</span></p>'
                            + '<span class="text-[10px] font-bold text-slate-400">' + when + '</span></div>'
                            + '<p class="text-xs font-bold text-slate-600">🎓 ' + (l.qual || '-') + ' &nbsp;|&nbsp; 📍 ' + (l.city || '-') + (l.sample ? ' &nbsp;|&nbsp; 🔗 <a href="' + esc(l.sample) + '" target="_blank" class="text-blue-600 underline">Sample</a>' : '') + '</p>'
                            + (l.why ? '<p class="text-xs font-semibold text-slate-500">💬 ' + esc(l.why) + '</p>' : '')
                            + '<div class="flex gap-2 pt-1">'
                            + (wa ? '<a href="' + wa + '" target="_blank" rel="noopener" class="px-3 py-1.5 bg-emerald-600 text-white text-[11px] font-black rounded-lg">📱 WhatsApp (' + phone.slice(-10) + ')</a>' : '<span class="text-xs text-slate-400">📱 ' + esc(l.phone || '-') + '</span>')
                            + '<a href="tel:' + phone + '" class="px-3 py-1.5 bg-slate-800 text-white text-[11px] font-black rounded-lg">📞 Call</a>'
                            + '</div></div>';
                    }
                    return '<div class="p-3.5 bg-white border border-indigo-100 rounded-2xl shadow-2xs space-y-1.5">'
                        + '<div class="flex flex-wrap items-center justify-between gap-2">'
                        + '<p class="text-sm font-black text-slate-900">🏫 ' + (l.org || '-') + ' <span class="text-[10px] font-bold text-indigo-500">(' + (l.type || '') + ' • ' + (l.size || '') + ')</span></p>'
                        + '<span class="text-[10px] font-bold text-slate-400">' + when + '</span></div>'
                        + '<p class="text-xs font-bold text-slate-600">👤 ' + (l.person || '-') + ' &nbsp;|&nbsp; 📍 ' + (l.city || '-') + (l.email ? ' &nbsp;|&nbsp; ✉️ ' + l.email : '') + '</p>'
                        + (l.message ? '<p class="text-xs font-semibold text-slate-500">💬 ' + l.message + '</p>' : '')
                        + '<div class="flex gap-2 pt-1">'
                        + (wa ? '<a href="' + wa + '" target="_blank" rel="noopener" class="px-3 py-1.5 bg-emerald-600 text-white text-[11px] font-black rounded-lg">📱 WhatsApp (' + phone.slice(-10) + ')</a>' : '<span class="text-xs text-slate-400">📱 ' + (l.phone || '-') + '</span>')
                        + '<a href="tel:' + phone + '" class="px-3 py-1.5 bg-slate-800 text-white text-[11px] font-black rounded-lg">📞 Call</a>'
                        + '</div></div>';
                }).join('');
            } catch (e) {
                box.innerHTML = '<p class="text-sm text-rose-500 font-bold text-center py-3">❌ Load nahi hua — ' + (e.message || 'error') + ' (Refresh try karo)</p>';
            }
        };
        setInterval(function () {
            try {
                var v = document.getElementById('view-founder');
                if (v && !v.classList.contains('hidden') && Date.now() - lastRender > 30000) {
                    lastRender = Date.now();
                    window.renderPartnerLeads();
                }
            } catch (e) {}
        }, 3000);
    })();

/* ---- consolidated block ---- */



/* ---- consolidated block ---- */

(function () {
        window.__eduvaViewSwitch = 0;
        document.addEventListener('click', function (e) {
            var t = e.target;
            if (t && t.closest && t.closest('summary, details, a[href="#"]')) return; // in-page toggle/links — haath mat laga
            // view switch hua hai toh hi top pe jaao (switchTab ne flag set kiya hoga)
            setTimeout(function () {
                if (Date.now() - window.__eduvaViewSwitch < 800) { try { window.scrollTo(0, 0); } catch (x) {} }
            }, 60);
            setTimeout(function () {
                if (Date.now() - window.__eduvaViewSwitch < 800) { try { window.scrollTo(0, 0); } catch (x) {} }
            }, 350);
        }, true);
    })();
