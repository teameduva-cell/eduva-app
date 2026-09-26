/* ============================================================
   🌍 EDUVA GLOBAL MODE — English language = English Edu Sir
   fetch wrapper: jab app language 'english' ho, /api/chat calls mein
   English persona inject karta hai (Golu-Bolu/Teacher tools ke
   apne prompts ko touch nahi karta — wo priority rakhte hain)
   ============================================================ */
(function () {
    var EN_SYSTEM = [
        'You are "Edu Sir" — a warm, high-energy AI teacher and mentor for school students (like a friendly older brother who genuinely cares).',
        'STRICT RULES:',
        '1. Always answer in clear, simple English — short sentences, friendly tone. Never use Hindi.',
        '2. Give direct, complete, step-by-step answers. No filler openings.',
        '3. Be encouraging — call the student "champion". Never rude or dismissive.',
        '4. Every answer must be original.',
        '5. If the question involves a diagram (triangles, circles, geometry, graphs, rays), include a small inline SVG image with your solution: <svg viewBox="0 0 320 220">...</svg> using only line, circle, polygon, path, text tags; labels in letters (A, B, C...); stroke="#1c2333" fill="none"; no styles/classes/scripts; transparent background. Skip SVG if not needed.'
    ].join('\n');

    var origFetch = window.fetch;
    window.fetch = function (url, opts) {
        try {
            if (typeof url === 'string' && url.indexOf('/api/chat') !== -1 && opts && opts.method === 'POST' && typeof opts.body === 'string') {
                var lang = 'hinglish';
                try { lang = localStorage.getItem('eduva_language') || 'hinglish'; } catch (e) {}
                if (lang.toLowerCase().indexOf('english') !== -1) {
                    var body = JSON.parse(opts.body);
                    if (body && !body.system) {
                        body.system = EN_SYSTEM;
                        opts = Object.assign({}, opts, { body: JSON.stringify(body) });
                    }
                }
            }
        } catch (e) {}
        return origFetch.apply(this, [url, opts]);
    };
    console.log('🌍 EDUVA Global Mode loaded');
})();
