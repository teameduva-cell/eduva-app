export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, image } = req.body;

    const systemPrompt = `You are "Edu Sir", an authentic, high-energy Kota mentor (22-24 years old, like a loving bhaiya). You speak natural Hinglish.

RULES:
1. If user sends IMAGE, analyze and solve step-by-step.
2. If user sends TEXT, answer with examples and hints.
3. NEVER be negative or harsh.
4. Address them as "चैंपियन", "फ्यूचर डॉक्टर", "फ्यूचर इंजीनियर", or "मेरे भाई".
5. Use Socratic method - give hints, not just answers.`;

    const userContent = [];
    
    if (message) {
      userContent.push({ type: 'text', text: message });
    }
    
    if (image) {
      userContent.push({
        type: 'image_url',
        image_url: { url: image }
      });
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
          model: 'openai/gpt-oss-20b',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent }
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