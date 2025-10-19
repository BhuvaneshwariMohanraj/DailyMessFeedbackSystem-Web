// Script to analyze existing feedback with AI
const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
};

// Import Gemini service
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function analyzeFeedback(comment, rating, mealType) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Analyze this mess/cafeteria feedback and provide a structured response:

Feedback: "${comment}"
Rating: ${rating}/5
Meal Type: ${mealType}

Provide analysis in this exact JSON format:
{
  "priority_score": <number 1-10>,
  "priority_level": "<URGENT|HIGH|MEDIUM|LOW>",
  "sentiment": "<positive|neutral|negative>",
  "category": "<Food Quality|Service|Hygiene|Variety|Portion Size|Pricing|Infrastructure|Other>",
  "keywords": ["keyword1", "keyword2"],
  "summary": "<brief summary>",
  "recommended_action": "<specific action to take>",
  "escalation_needed": <true|false>,
  "health_safety_concern": <true|false>
}

Priority Guidelines:
- URGENT (9-10): Health/safety issues, severe complaints
- HIGH (7-8): Significant quality/service issues
- MEDIUM (4-6): General complaints, suggestions
- LOW (1-3): Minor feedback, positive comments`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();
  
  // Extract JSON from response
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Invalid AI response format');
  }
  
  return JSON.parse(jsonMatch[0]);
}

async function analyzeExistingFeedback() {
  let pool;
  
  try {
    console.log('🤖 Starting AI Analysis of Existing Feedback...\n');
    
    // Check API key
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      console.error('❌ GEMINI_API_KEY not configured!');
      console.log('Get your API key from: https://makersuite.google.com/app/apikey');
      console.log('Add it to your .env file: GEMINI_API_KEY=your_actual_key');
      return;
    }
    
    pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log('✅ Connected to database\n');

    // Get feedback that needs analysis (has comment but no AI analysis)
    const feedbackResult = await pool.request().query(`
      SELECT id, rating, comment, meal_type, meal_date
      FROM Feedback 
      WHERE comment IS NOT NULL 
        AND LTRIM(RTRIM(comment)) != ''
        AND ai_analyzed_at IS NULL
      ORDER BY created_at DESC
    `);

    const feedbackList = feedbackResult.recordset;
    console.log(`📊 Found ${feedbackList.length} feedback items to analyze\n`);

    if (feedbackList.length === 0) {
      console.log('✅ All feedback with comments has already been analyzed!');
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < feedbackList.length; i++) {
      const feedback = feedbackList[i];
      
      try {
        console.log(`[${i + 1}/${feedbackList.length}] Analyzing feedback ID ${feedback.id}...`);
        
        // Perform AI analysis
        const analysis = await analyzeFeedback(
          feedback.comment, 
          feedback.rating, 
          feedback.meal_type
        );

        // Update feedback with AI analysis
        await pool.request()
          .input('feedbackId', feedback.id)
          .input('priorityScore', analysis.priority_score)
          .input('priorityLevel', analysis.priority_level)
          .input('sentiment', analysis.sentiment)
          .input('category', analysis.category)
          .input('keywords', JSON.stringify(analysis.keywords))
          .input('summary', analysis.summary)
          .input('recommendedAction', analysis.recommended_action)
          .input('escalationNeeded', analysis.escalation_needed ? 1 : 0)
          .input('healthSafetyConcern', analysis.health_safety_concern ? 1 : 0)
          .input('analyzedAt', new Date())
          .query(`
            UPDATE Feedback SET
              ai_priority_score = @priorityScore,
              ai_priority_level = @priorityLevel,
              ai_sentiment = @sentiment,
              ai_category = @category,
              ai_keywords = @keywords,
              ai_summary = @summary,
              ai_recommended_action = @recommendedAction,
              ai_escalation_needed = @escalationNeeded,
              ai_health_safety_concern = @healthSafetyConcern,
              ai_analyzed_at = @analyzedAt
            WHERE id = @feedbackId
          `);

        console.log(`   ✅ Priority: ${analysis.priority_level}, Sentiment: ${analysis.sentiment}, Category: ${analysis.category}`);
        successCount++;

        // Add a small delay to avoid rate limiting
        if (i < feedbackList.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error) {
        console.error(`   ❌ Failed: ${error.message}`);
        failCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Analysis Complete!');
    console.log('='.repeat(60));
    console.log(`✅ Successfully analyzed: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📈 Total processed: ${successCount + failCount}`);
    console.log('\n🎉 Your AI Insights dashboard should now show data!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

analyzeExistingFeedback();
