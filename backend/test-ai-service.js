// Test the Gemini service directly
require('dotenv').config();
const geminiService = require('./src/services/geminiService').default;

async function testAIService() {
  console.log('🤖 Testing AI Service...');
  
  try {
    const testComment = "The chicken curry today smelled bad and many students got stomach ache after eating it. This is a serious health issue!";
    const rating = 1;
    const mealType = "lunch";
    
    console.log('🔄 Analyzing test feedback...');
    console.log('Comment:', testComment);
    console.log('Rating:', rating);
    console.log('Meal Type:', mealType);
    
    const analysis = await geminiService.analyzeFeedback(testComment, rating, mealType);
    
    console.log('✅ AI Analysis successful!');
    console.log('Analysis result:', JSON.stringify(analysis, null, 2));
    
  } catch (error) {
    console.error('❌ AI Service Error:', error.message);
    console.error('Full error:', error);
  }
}

testAIService();
