const Groq = require("groq-sdk");

module.exports = async function handler(req, res) {
  // CORS Headers ताकी कहीं से भी ब्लॉक न हो
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { message } = req.body || {};

    if (!message) {
      return res.status(400).json({ error: "Message is missing in request body." });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: "CRITICAL: GROQ_API_KEY is not set in Vercel Environment Variables!" });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You are EDUVA, a helpful AI tutor for students." },
        { role: "user", content: message }
      ],
    });

    const reply = completion.choices?.[0]?.message?.content || "No response from AI.";
    return res.status(200).json({ response: reply });

  } catch (err) {
    // यह खुद एरर को रीड करके उसका कच्चा-चिट्ठा बाहर निकाल देगा
    console.error("Auto-Caught Server Error:", err);
    return res.status(500).json({ 
      error: "AI Generation Failed", 
      details: err.message,
      stack: err.stack 
    });
  }
};
