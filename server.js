const express = require('express');
const cors = require('cors');
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());
// Enable CORS for all routes ( allow frontend to connect)
app.use(cors());

// POST endpoint for chat completions
app.post('/chat', async (req, res) => {
  try {
    // Extract user message from request body
    const userMessage = req.body.message;

    // Validate input
    if (!userMessage) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Forward the request to Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // FIXED: Updated to a currently active model
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: userMessage }],
        temperature: 0.7 // Optional: Adjust creativity
      })
    });

    // Handle Groq API errors
    if (!response.ok) {
      const errText = await response.text();
      // Log the actual error from Groq to Render console
      console.error('Groq API error:', errText);
      return res.status(response.status).json({ error: errText });
    }

    // Send Groq's response back to frontend
    const data = await response.json();
    res.json(data);

  } catch (error) {
    // Handle unexpected proxy server errors
    console.error('Proxy Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Define port and start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));
