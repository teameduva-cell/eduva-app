// ============================================================
// EDUVA — api/chat.js (FINAL, ready-to-deploy)
// Changes: CORS restricted, rate-limit memory cleanup,
// guest vs logged-in limits, empty-message guard
// ============================================================

module.exports = async function handler(req, res) {
  // ── 1️⃣ CORS — sirf apne origins allowed ──────────────────
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

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ── 2️⃣ RATE LIMIT (per IP) + memory cleanup ──────────────
  const nowTs = Date.now();
  globalThis.__eduvaRL = globalThis.__eduvaRL || {};

  // 🧹 har 10 min mein purane/empty IP records saaf karo (memory leak rok)
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

    // 👤 Login vs Guest — Authorization header milta hai toh zyada limit
    let limit = 40; // guest (casual try)
    const authHeader = req.headers.authorization || '';
    if (authHeader.startsWith('Bearer ') && authHeader.length > 40) {
      limit = 120; // logged-in champion
      // NOTE: ye simple differentiation hai. Pura token-verify chahiye toh
      // firebase-admin SDK laga kar verifyIdToken() use karo.
    }

    globalThis.__eduvaRL[ip] = (globalThis.__eduvaRL[ip] || []).filter(ts => nowTs - ts < 60000);
    if (globalThis.__eduvaRL[ip].length >= limit) {
      return res.status(429).json({ error: 'Bahut zyada requests — thoda ruk kar 1 minute baad try karo.' });
    }
    globalThis.__eduvaRL[ip].push(nowTs);
  } catch (e) { /* rate limit fail ho toh request allow */ }

  // ── 3️⃣ Payload guards ────────────────────────────────────
  const { message, image, history } = req.body || {};

  if ((!message || !message.trim()) && !image) {
    return res.status(400).json({ error: 'Message ya photo toh bhejo!' });
  }

  // Size guard — 6MB se bada payload reject
  if (image && image.length > 6000000) {
    return res.status(413).json({ error: 'Photo bahut badi hai — 4MB se chhoti photo bhejo.' });
  }

  // ── 4️⃣ Edu Sir की personality + कड़ी भाषा-नियमावली ──────
  const SYSTEM_PROMPT = `तुम "Edu Sir" हो — कोटा का प्यार भरा, high-energy mentor (22-24 साल का बड़ा भाई)।
कड़े नियम:
0. स्वभाव (सबसे पहला और कभी न तोड़ने वाला नियम — ये सबसे ऊपर है): तुम किसी भी हालत में गुस्सा, चिढ़, थकान या कड़वे शब्द कभी नहीं दिखा सकते। छात्र एक ही सवाल 20 बार भी पूछे — हर बार पहले से ज़्यादा प्यार, मुस्कान और ऊर्जा के साथ जवाब दो। छात्र अगर कड़े/बुरे शब्द बोले, तब भी जवाब मीठा, शांत और प्यार भरा होना चाहिए — कभी डांट, ताना या lecture नहीं। हर जवाब ऐसा हो जैसे कोई खुशमिजाज इंसान मुस्कुराकर समझा रहा हो।
1. भाषा (सबसे ज़रूरी): हर जवाब उसी भाषा में दो जो latest message में बताई गई हो। अगर कोई अलग भाषा नहीं बताई गई, तो सवाल जिस भाषा में पूछा गया है उसी में जवाब दो। ⚠️ हमेशा याद रखो: अगर छात्र कभी भी साफ़ कहे कि दूसरी भाषा में बताओ (जैसे "English में बताओ", "इंग्लिश में", "hindi mein karo", "tamil mein bolo"), तो तुरंत उस नई भाषा में जवाब देना है। कभी भी यह मत कहना कि कोई नियम तुम्हें भाषा बदलने से रोकता है — छात्र की नई request हमेशा पुराने नियम से ज़्यादा ज़रूरी है।
2. कभी भी motivational filler, अलग टॉपिक या generic बात से जवाब शुरू मत करना — हमेशा सवाल का सीधा, पूरा, सही, step-by-step उत्तर दो।
3. कोई गाली, कोई negativity नहीं। छात्र को "चैंपियन" बुलाओ, प्यार से समझाओ।
4. हर उत्तर original हो — किसी book का copy नहीं।`;

  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Server config error' });
    }

    const parts = [{ text: message || 'Hello' }];

    if (image) {
      const match = image.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/);
      if (match) {
        parts.push({ inline_data: { mime_type: match[1], data: match[2] } });
      }
    }

    // पिछली बातचीत (history) से contents बनाओ
    const contents = [];
    if (Array.isArray(history)) {
      for (const m of history.slice(-10)) {
        if (!m || m.role === 'system') continue;
        let text = '';
        if (typeof m.content === 'string') {
          text = m.content;
        } else if (Array.isArray(m.content)) {
          text = m.content.filter(p => p && p.type === 'text').map(p => p.text).join(' ');
        }
        text = (text || '').trim();
        if (!text) continue;
        contents.push({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text }] });
      }
    }
    contents.push({ role: 'user', parts });

    const response = await fetch(
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

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'API error' });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) {
      return res.status(500).json({ error: 'Model से खाली जवाब आया, दोबारा कोशिश करें' });
    }

    res.status(200).json({ choices: [{ message: { content: reply } }] });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
};
