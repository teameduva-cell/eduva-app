const Groq = require("groq-sdk");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed. Use POST."
    });
  }

  try {
    const { message, chatHistory = [], context = {} } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Message is required."
      });
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "GROQ_API_KEY missing in Vercel Environment Variables."
      });
    }

    const groq = new Groq({
      apiKey: apiKey
    });

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content:
            "You are EDUVA, a friendly and expert AI teacher for NEET, JEE, and classes 6 to 12. " +
            "Reply in simple Hindi-English. Explain every academic concept step by step. " +
            "For Physics, Chemistry and Maths questions, show relevant formulas, units and calculations. " +
            "For Biology, give NCERT-oriented clear explanations. " +
            "Use LaTeX math notation where helpful. " +
            "Student context: " + JSON.stringify(context)
        },
        ...chatHistory.slice(-8),
        {
          role: "user",
          content: message.trim()
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    const answer =
      completion.choices?.[0]?.message?.content ||
      "Sorry, abhi answer generate nahi ho saka.";

    return res.status(200).json({
      response: answer
    });
  } catch (error) {
    console.error("EDUVA_GROQ_ERROR:", {
      message: error.message,
      status: error.status,
      code: error.code,
      type: error.type
    });

    return res.status(error.status || 500).json({
      error: "AI response generate nahi ho saka.",
      details: error.message || "Unknown backend error"
    });
  }
};