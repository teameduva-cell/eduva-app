// server.js - Vercel Serverless Function for EDUVA
const Groq = require('groq-sdk');

// Initialize Groq client
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Main handler for Vercel serverless function
module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        // Parse request body
        const { message, chatHistory = [], context = {} } = req.body;
        
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Invalid message' });
        }
        
        // Build conversation history for context
        const messages = [
            {
                role: 'system',
                content: `You are EDUVA, an expert AI tutor for NEET, JEE, and classes 6-12. 
                Provide clear, accurate, step-by-step explanations. 
                Use LaTeX for math: $E=mc^2$ or $$\\int x dx$$.
                Keep responses concise but complete. 
                Current student context: ${JSON.stringify(context)}.
                If asked about topics outside your expertise, politely redirect to relevant subjects.`
            },
            ...chatHistory.slice(-10), // Last 10 messages
            { role: 'user', content: message }
        ];
        
        // Call Groq API
        const completion = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: messages,
            temperature: 0.7,
            max_tokens: 1024,
            top_p: 1,
            stream: false
        });
        
        const aiResponse = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
        
        // Return response
        return res.status(200).json({
            response: aiResponse,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Groq API Error:', error);
        return res.status(500).json({
            error: 'Failed to get AI response',
            details: error.message
        });
    }
};