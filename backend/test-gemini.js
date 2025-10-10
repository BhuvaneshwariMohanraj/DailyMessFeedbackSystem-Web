// Test Gemini API directly
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testGemini() {
  console.log('🤖 Testing Gemini API...');
  
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('API Key exists:', !!apiKey);
  console.log('API Key length:', apiKey ? apiKey.length : 0);
  
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in environment variables');
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      Analyze this mess feedback and provide a JSON response:
      
      Comment: "The food was terrible today and made me sick"
      Rating: 1/5
      Meal Type: lunch
      
      Return JSON with: priority_score (1-10), sentiment, category
    `;

    console.log('🔄 Sending test request to Gemini...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Gemini API working!');
    console.log('Response:', text);
    
  } catch (error) {
    console.error('❌ Gemini API Error:', error.message);
    
    if (error.message.includes('API_KEY_INVALID')) {
      console.error('🔑 Your API key is invalid. Please check your GEMINI_API_KEY in .env file');
    } else if (error.message.includes('quota')) {
      console.error('📊 API quota exceeded. Check your Gemini API usage limits');
    }
  }
}

testGemini();
