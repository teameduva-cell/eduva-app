module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Edu Sir की personality + कड़ी भाषा-नियमावली (frontend के rules का backup)
  const SYSTEM_PROMPT = `तुम "Edu Sir" हो — कोटा का प्यार भरा, high-energy mentor (22-24 साल का बड़ा भाई)।
कड़े नियम:
1. भाषा (सबसे ज़रूरी): हर जवाब उसी भाषा में दो जो latest message में साफ़ तौर पर बताई गई हो (जैसे message में "[कड़ा नियम... हिंदी में]" लिखा हो तो पूरा जवाब सिर्फ सरल हिंदी में, देवनागरी में)। अगर कोई अलग भाषा नहीं बताई गई, तो सवाल जिस भाषा में पूछा गया है उसी भाषा में जवाब दो।
2. कभी भी motivational filler, अलग टॉपिक या generic बात से जवाब शुरू मत करना — हमेशा सवाल का सीधा, पूरा, सही, step-by-step उत्तर दो।
3. कोई गाली, कोई negativity नहीं। छात्र को "चैंपियन" बुलाओ, प्यार से समझाओ।
4. हर उत्तर original हो — किसी book का copy नहीं।`;

  try {
    const { message, image, history } = req.body;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    // हर request में एक टेक्स्ट part तो हमेशा भेजेंगे
    const parts = [{ text: message || 'Hello' }];

    // अगर फोटो आई है, तो उसे Gemini के लिए सही format में जोड़ेंगे
    if (image) {
      // frontend से image "data:image/jpeg;base64,....." इस फॉर्मेट में आती है
      const match = image.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
      if (match) {
        parts.push({
          inline_data: {
            mime_type: match[1],
            data: match[2]
          }
        });
      }
    }

    // ✅ FIX 1: पिछली बातचीत (history) से Gemini के contents बनाओ —
    // इससे "हिंदी में आंसर दो" जैसे follow-up सही काम करेंगे (पहले ignore हो जाती थी)
    const contents = [];
    if (Array.isArray(history)) {
      for (const m of history.slice(-10)) {
        if (!m || m.role === 'system') continue; // local system prompt skip
        let text = '';
        if (typeof m.content === 'string') {
          text = m.content;
        } else if (Array.isArray(m.content)) {
          // image वाले messages में content array होता है — सिर्फ text parts लो
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
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] }, // ✅ FIX 2: backend से भी कड़ी भाषा-नियम
          contents,
          generationConfig: { maxOutputTokens: 4096, temperature: 0.7 } // ✅ FIX 3: 2048→4096 (material pura आए)
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'API error' });
    }

    // ✅ FIX 4: safety-block / empty response पर crash रोकने के लिए safe parsing
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) {
      return res.status(500).json({ error: 'Model से खाली जवाब आया, दोबारा कोशिश करें' });
    }

    // frontend को वही format वापस जो index.html उम्मीद करता है
    res.status(200).json({ choices: [{ message: { content: reply } }] });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
};