// ============================================================
// EDUVA — api/chat.js v3 (CACHE + FALLBACK CHAIN)
// Gemini → (retry) → Groq → OpenRouter | Q&A Cache bhi
// ============================================================
const crypto = require('crypto');
const FS_PROJECT = 'eduva-app-5ecec';
const FS_KEY = 'AIzaSyDO_fAFk8PITh9opzWXPIM_g7wd1NzXsHw';

const SYSTEM_PROMPT = `तुम "Edu Sir" हो — कोटा का प्यार भरा, high-energy mentor (22-24 साल का बड़ा भाई)।
कड़े नियम:
0. स्वभाव: कभी गुस्सा/चिढ़/थकान नहीं दिखाना। छात्र 20 बार भी पूछे — हर बार प्यार से।
1. भाषा (सबसे ज़रूरी): हर जवाब उसी भाषा में दो जो latest message में बताई गई हो; नहीं तो सवाल की भाषा में। छात्र नई भाषा माँगे तो तुरंत बदल दो।
2. हमेशा सवाल का सीधा, पूरा, step-by-step उत्तर दो — filler से शुरुआत नहीं।
3. कोई गाली नहीं। छात्र को "चैंपियन" बुलाओ।
4. हर उत्तर original हो।`;

function fetchT(url, opts, ms) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms || 8000);
  return fetch(url, Object.assign({}, opts, { signal: ctrl.signal })).finally(() => clearTimeout(t));
}
function cacheKey(text) {
  const norm = String(text).toLowerCase().replace(/[^a-z0-9\u0900-\u097F]+/g, ' ').trim().slice(0, 300);
  return crypto.createHash('sha256').update(norm).digest('hex').slice(0, 40);
}
async function cacheGet(id) {
  try {
    const r = await fetchT(`https://firestore.googleapis.com/v1/projects/${FS_PROJECT}/databases/(default)/documents/qaCache/${id}?key=${FS_KEY}`, {}, 3000);
    if (!r.ok) return null;
    const d = await r.json();
    return (d.fields && d.fields.a && d.fields.a.stringValue) || null;
  } catch (e) { return null; }
}
async function cacheSet(id, answer) {
  try {
    await fetchT(`https://firestore.googleapis.com/v1/projects/${FS_PROJECT}/databases/(default)/documents/qaCache/${id}?updateMask.fieldPaths=a&updateMask.fieldPaths=t&key=${FS_KEY}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: { a: { stringValue: answer.slice(0, 8000) }, t: { integerValue: Date.now() } } })
    }, 3000);
  } catch (e) {}
}

async function askGemini(message, image) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('no gemini key');
  const parts = [{ text: message }];
  if (image) {
    const m = String(image).match(/^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/);
    if (m) parts.push({ inline_data: { mime_type: m[1], data: m[2] } });
  }
  const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=' + key, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] }, contents: [{ role: 'user', parts }], generationConfig: { maxOutputTokens: 4096, temperature: 0.7 } })
  });
  const d = await r.json();
  if (!r.ok) throw new Error('gemini ' + r.status);
  const text = d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts && d.candidates[0].content.parts.map(p => p.text).join('');
  if (!text) throw new Error('gemini empty');
  return text;
}
async function askGroq(message) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('no groq key');
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
    body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: message }], max_tokens: 2048, temperature: 0.7 })
  });
  const d = await r.json();
  if (!r.ok) throw new Error('groq ' + r.status);
  const text = d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content;
  if (!text) throw new Error('groq empty');
  return text;
}
async function askAny(message, image) {
  const errors = [];
  try { return await askGemini(message, image); } catch (e) { errors.push(e.message); }
  await new Promise(r => setTimeout(r, 3000));
  try { return await askGemini(message, image); } catch (e) { errors.push(e.message); }
  if (!image) {
    try { return await askGroq(message); } catch (e) { errors.push(e.message); }
  }
  throw new Error(errors.join(' | '));
}

module.exports = async function handler(req, res) {
  const ALLOWED_ORIGINS = ['https://eduva-app.vercel.app', 'http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000'];
  const origin = req.headers.origin;
  if (origin) {
    if (!ALLOWED_ORIGINS.includes(origin)) return res.status(403).json({ error: 'Unauthorized origin' });
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Firebase token verify (bot-proof limits)
  let isVerifiedUser = false;
  try {
    const ah = req.headers.authorization || '';
    if (ah.startsWith('Bearer ') && ah.length > 40) {
      const r = await fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(ah.slice(7)));
      if (r.ok) { const info = await r.json(); if (info.aud === 'eduva-app-5ecec') isVerifiedUser = true; }
    }
  } catch (e) {}

  // Rate limit
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
    const ip = (req.headers['x-forwarded-for'] || (req.socket && req.socket.remoteAddress) || 'local').toString().split(',')[0].trim();
    const limit = isVerifiedUser ? 90 : 15;
    globalThis.__eduvaRL[ip] = (globalThis.__eduvaRL[ip] || []).filter(ts => nowTs - ts < 60000);
    if (globalThis.__eduvaRL[ip].length >= limit) return res.status(429).json({ error: 'Bahut zyada requests — 1 minute ruko phir try karo. 🙏' });
    globalThis.__eduvaRL[ip].push(nowTs);
  } catch (e) {}

  // Payload guards
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const { message, image } = body;
  if ((!message || !String(message).trim()) && !image) return res.status(400).json({ error: 'Message ya photo toh bhejo!' });
  if (image && image.length > 6000000) return res.status(413).json({ error: 'Photo bahut badi hai — 4MB se chhoti bhejo.' });
  const msg = String(message || '').trim();

  // CACHE CHECK
  let cacheId = null;
  if (msg.length >= 10 && !image) {
    cacheId = cacheKey(msg);
    const cached = await cacheGet(cacheId);
    if (cached) return res.status(200).json({ choices: [{ message: { content: cached } }], cached: true });
  }

  try {
    const reply = await askAny(msg, image);
    if (cacheId && reply && reply.length > 50) cacheSet(cacheId, reply);
    return res.status(200).json({ choices: [{ message: { content: reply } }] });
  } catch (err) {
    console.error('AI error:', err.message);
    return res.status(502).json({ error: 'AI service busy — 1 minute baad try karo.' });
  }
};
