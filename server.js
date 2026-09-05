const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

app.post('/chat', async (req, res) => {
  try {
    const userMessage = req.body.message;

    const response = express.response || await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: userMessage }]
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
