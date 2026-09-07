const cors = require('cors');

module.exports = async (req, res) => {
  cors()(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
      const userMessage = req.body?.message;

      if (!userMessage) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const response = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [
              {
                role: 'user',
                content: userMessage
              }
            ],
            temperature: 0.7
          })
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        console.error('Groq API error:', errText);
        return res.status(response.status).json({ error: errText });
      }

      const data = await response.json();
      return res.status(200).json(data);

    } catch (error) {
      console.error('Proxy Error:', error);
      return res.status(500).json({
        error: error.message
      });
    }
  });
};