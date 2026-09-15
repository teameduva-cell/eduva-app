// ============================================================
// EDUVA — api/chat.js (FIXED v2)
// Fixes: 503 auto-retry, REAL Firebase token verify (bot-proof),
//        tighter guest limits, sab kuch baaki same
// ============================================================

module.exports = async function handler(req, res) {
  // ── 1️⃣ CORS ───────────────────────────────────────────────
  const ALLOWED_ORIGINS = [
    'https://eduva-app.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000'
  ];
  const origin = req.headers.origin;
  if (origin) {
    if (!ALLOWED_ORIGINS.includes(origin)) {
      return res.status(403).json({ error: 'Unauthorized origin' });
    }
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // ── 2️⃣ FIREBASE TOKEN VERIFY (bot fake Bearer nahi bhej sakta) ──
  let isVerifiedUser = false;
  try {
    const authHeader = req.headers.authorization || '';
    if (authHeader.startsWith('Bearer ') && authHeader.length > 40) {
      const idToken = authHeader.slice(7);
      const r = await fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken));
      if (r.ok) {
        const info = await r.json();
        if (info.aud === 'eduva-app-5ecec') {
          isVerifiedUser = true; // asli EDUVA student (Firebase ID token)
        }
      }
    }
  } catch (e) { /* verify fail ho toh guest treat karo */ }

  // ── 3️⃣ RATE LIMIT (per IP) + memory cleanup ──────────────
  const nowTs = Date.now();
  globalThis.__eduvaRL = globalThis.__eduvaRL || {};
  if (!globalThis.__eduvaRL_lastClean || nowTs - globalThis.__eduvaRL_lastClean > 600000) {
    for (const k of Object.keys(globalThis.__eduvaRL)) {
      globalThis.__eduvaRL[k] = globalThis.__eduvaRL[k].filter(ts => nowTs - ts < 60000);
      if (globalThis.__eduvaRL[k].length === 0) delete globalThis.__eduvaRL[k];
    }
    globalThis.__eduvaRL_lastClean = nowTs;
  }

  try {
    const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'local')
      .toString().split(',')[0].trim();

    // Guest (no verified login): 15/min | Verified student: 90/min
    const limit = isVerifiedUser ? 90 : 15;

    globalThis.__eduvaRL[ip] = (globalThis.__eduvaRL[ip] || []).filter(ts => nowTs - ts < 60000);
    if (globalThis.__eduvaRL[ip].length >= limit) {
      return res.status(429).json({ error: 'Bahut zyada requests — 1 minute ruko phir try karo. 🙏' });
    }
    globalThis.__eduvaRL[ip].push(nowTs);
  } catch (e) { /* rate limit fail ho toh allow */ }

  // ── 4️⃣ Payload guards ────────────────────────────────────
  const { message, image, history } = req.body || {};
  if ((!message || !message.trim()) && !image) {
    return res.status(400).json({ error: 'Message ya photo toh bhejo!' });
  }
  if (image && image.length > 6000000) {
    return res.status(413).json({ error: 'Photo bahut badi hai — 4MB se chhoti photo bhejo.' });
  }

  // ── 5️⃣ Edu Sir की personality (UNCHANGED) ───────────────
  const SYSTEM_PROMPT = `तुम "Edu Sir" हो — कोटा का प्यार भरा, high-energy mentor (22-24 साल का बड़ा भाई)।
कड़े नियम:
0. स्वभाव: कभी गुस्सा/चिढ़/थकान नहीं दिखाना। छात्र 20 बार भी पूछे — हर बार प्यार से। बुरे शब्दों पर भी जवाब मीठा।
1. भाषा (सबसे ज़रूरी): हर जवाब उसी भाषा में दो जो latest message में बताई गई हो; नहीं तो सवाल की भाषा में। छात्र नई भाषा माँगे तो तुरंत बदल दो।
2. हमेशा सवाल का सीधा, पूरा, step-by-step उत्तर दो — filler से शुरुआत नहीं।
3. कोई गाली नहीं। छात्र को "चैंपियन" बुलाओ।
4. हर उत्तर original हो।`;

  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) return res.status(500).json({ error: 'Server config error' });

    const parts = [{ text: message || 'Hello' }];
    if (image) {
      const match = image.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/);
      if (match) parts.push({ inline_data: { mime_type: match[1], data: match[2] } });
    }

    const contents = [];
    if (Array.isArray(history)) {
      for (const m of history.slice(-10)) {
        if (!m || m.role === 'system') continue;
        let text = '';
        if (typeof m.content === 'string') text = m.content;
        else if (Array.isArray(m.content)) text = m.content.filter(p => p && p.type === 'text').map(p => p.text).join(' ');
        text = (text || '').trim();
        if (!text) continue;
        contents.push({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text }] });
      }
    }
    contents.push({ role: 'user', parts });

    // ── 6️⃣ GEMINI call + 503 RETRY (naya fix!) ─────────────
    async function callGemini() {
      return await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=' + GEMINI_API_KEY,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents,
            generationConfig: { maxOutputTokens: 4096, temperature: 0.7 }
          })
        }
      );
    }

    let response = await callGemini();

    // 🔁 503/502 pe ek baar 4 sec rukkar retry (overload ke liye)
    if (response.status === 503 || response.status === 502) {
      await new Promise(r => setTimeout(r, 4000));
      response = await callGemini();
    }

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: (data.error && data.error.message) || 'AI service error — 1 min baad try karo.' });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) return res.status(500).json({ error: 'Model से खाली जवाब आया, दोबारा कोशिश करें' });

    res.status(200).json({ choices: [{ message: { content: reply } }] });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
};
