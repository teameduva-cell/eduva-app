const Groq = require("groq-sdk");

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed. Use POST."
    });
  }

  try {
    const body = req.body || {};
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const chatHistory = Array.isArray(body.chatHistory) ? body.chatHistory : [];
    const context = body.context || {};

    if (!message) {
      return res.status(400).json({
        ok: false,
        error: "Message is required."
      });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        ok: false,
        error: "GROQ_API_KEY missing in Vercel Environment Variables."
      });
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });

    const safeHistory = chatHistory
      .filter((item) => {
        return (
          item &&
          typeof item.content === "string" &&
          ["user", "assistant"].includes(item.role)
        );
      })
      .slice(-8)
      .map((item) => ({
        role: item.role,
        content: item.content
      }));

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      temperature: 0.7,
      max_tokens: 800,
      messages: [
        {
          role: "system",
          content:
            "You are EDUVA, an AI tutor for NEET, JEE, and classes 6 to 12. " +
            "Answer in clear Hindi-English and explain academic topics step by step. " +
            "For numerical questions, show formula, substitution and final answer. " +
            "For biology, be NCERT-focused. " +
            "Use LaTeX only when it helps. " +
            "Context: " + JSON.stringify(context)
        },
        ...safeHistory,
        {
          role: "user",
          content: message
        }
      ]
    });

    const responseText = completion?.choices?.[0]?.message?.content;

    if (!responseText) {
      return res.status(502).json({
        ok: false,
        error: "Groq returned an empty AI response."
      });
    }

    return res.status(200).json({
      ok: true,
      response: responseText
    });
  } catch (error) {
    console.error("EDUVA_CHAT_ERROR", {
      message: error?.message,
      status: error?.status,
      code: error?.code,
      type: error?.type,
      groqError: error?.error
    });

    return res.status(error?.status || 500).json({
      ok: false,
      error: "AI proxy request failed.",
      details: error?.message || "Unknown backend error",
      code: error?.code || null
    });
  }
};