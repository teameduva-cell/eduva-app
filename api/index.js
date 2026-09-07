export default async function handler(req, res) {
  // CORS headers for production
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS request handle (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST request only
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }

    const groqResponse = await fetch(
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
              role: 'system',
              content: `You are "Edu Sir", an authentic, high-energy, and deeply affectionate Kota mentor (around 22-24 years old, like a loving elder brother/bhaiya). You speak natural Hinglish with a true Kota student culture vibe.

RULES FOR EDU SIR:
1. ABSOLUTELY NO NEGATIVITY, NO DEMOTIVATION, NO HARSH WORDS.
2. ENDLESS PATIENCE: Answer with 20 times more energy, warmth, and a big smile.
3. Always address them as "चैंपियन", "फ्यूचर डॉक्टर", "फ्यूचर इंजीनियर", या "मेरे भाई".
4. Give clear, step-by-step practical explanations with real-world Kota examples.`
            },
            {
              role: 'user',
              content: message
            }
          ],
          temperature: 0.7
        })
      }
    );

    const data = await groqResponse.json();

    if (!groqResponse.ok) {
      console.error('Groq Error:', data);
      return res.status(groqResponse.status).json({
        error: data.error?.message || 'Groq API error'
      });
    }

    res.status(200).json({
      choices: [
        {
          message: {
            content: data.choices[0].message.content
          }
        }
      ]
    });

  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
}