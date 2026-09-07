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
      error: "Only POST request allowed."
    });
  }

  try {
    const body = req.body || {};
    const message =
      typeof body.message === "string" ? body.message.trim() : "";

    if (!message) {
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

    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [
            {
              role: "system",
              content:
                "You are EDUVA, a helpful AI tutor for NEET, JEE and classes 6 to 12. " +
                "Reply in simple Hindi-English. Explain all concepts step by step. " +
                "For numerical questions, show formula and calculation."
            },
            {
              role: "user",
              content: message
            }
          ],
          temperature: 0.7,
          max_tokens: 800
        })
      }
    );

    const groqData = await groqResponse.json();

    if (!groqResponse.ok) {
      console.error("Groq error:", groqData);

      return res.status(groqResponse.status).json({
        error: "Groq API error.",
        details:
          groqData?.error?.message ||
          "Groq did not accept the request."
      });
    }

    const answer =
      groqData?.choices?.[0]?.message?.content ||
      "AI ne empty response diya.";

    return res.status(200).json({
      response: answer
    });

  } catch (error) {
    console.error("EDUVA proxy error:", error);

    return res.status(500).json({
      error: "Server error.",
      details: error.message || "Unknown error"
    });
  }
};