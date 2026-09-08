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

    // ✅ Simple string format
    let userContent = message || '';

    // === CHANGE: Gemini API ===
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    const geminiResponse = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + GEMINI_API_KEY,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: systemPrompt + '

' + userContent }]
          }],
          generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.7
          }
        })
      }
    );

    const data = await geminiResponse.json();

    if (!geminiResponse.ok) {
      console.error('Gemini Error:', data);
      return res.status(geminiResponse.status).json({
        error: data.error?.message || 'Gemini API error'
      });
    }

    // === CHANGE: Gemini Response Parse ===
    if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content.parts[0].text) {
      throw new Error('No response from Gemini');
    }

    const reply = data.candidates[0].content.parts[0].text;

    res.status(200).json({
      choices: [
        {
          message: {
            content: reply
          }
        }
      ]
    });

  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
}