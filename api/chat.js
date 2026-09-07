const Groq = require("groq-sdk");

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body || {};
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: message }],
    });

    return res.status(200).json({ response: completion.choices[0].message.content });
  } catch (err) {
    console.error("Error details:", err);
    return res.status(500).json({ error: err.message });
  }
};
