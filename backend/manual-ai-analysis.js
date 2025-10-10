// Manually run AI analysis on existing feedback
const { GoogleGenerativeAI } = require('@google/generative-ai');
const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

async function runManualAnalysis() {
  console.log('🤖 Running manual AI analysis on existing feedback...');

  try {
    // Connect to database
    const pool = await sql.connect(dbConfig);
    console.log('✅ Database connected');

    // Get unanalyzed feedback
    const result = await pool.request().query(`
      SELECT TOP 5 id, rating, comment, meal_type 
      FROM Feedback 
      WHERE comment IS NOT NULL 
        AND comment != '' 
        AND ai_analyzed_at IS NULL
      ORDER BY created_at DESC
    `);

    const feedback = result.recordset;
    console.log(`📊 Found ${feedback.length} unanalyzed feedback entries`);

    if (feedback.length === 0) {
      console.log('ℹ️ No unanalyzed feedback found');
      return;
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Process each feedback
    for (const fb of feedback) {
      console.log(`\n🔄 Analyzing feedback ${fb.id}...`);
      console.log(`Comment: "${fb.comment.substring(0, 50)}..."`);

      try {
        const prompt = `
          Analyze this mess hall feedback and return ONLY a valid JSON object with these exact fields:
          
          Feedback: "${fb.comment}"
          Rating: ${fb.rating}/5
          Meal: ${fb.meal_type}
          
          Return JSON with:
          {
            "priority_score": number (1-10),
            "priority_level": "LOW" | "MEDIUM" | "HIGH" | "URGENT",
            "sentiment": "positive" | "neutral" | "negative",
            "category": "Food Quality" | "Service" | "Hygiene" | "Health Safety" | "Staff Behavior" | "General",
            "keywords": ["keyword1", "keyword2"],
            "summary": "brief summary",
            "recommended_action": "suggested action",
            "escalation_needed": true/false,
            "health_safety_concern": true/false
          }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let analysisText = response.text().trim();
        
        // Clean up the response to extract JSON
        if (analysisText.includes('```json')) {
          analysisText = analysisText.split('```json')[1].split('```')[0].trim();
        } else if (analysisText.includes('```')) {
          analysisText = analysisText.split('```')[1].split('```')[0].trim();
        }

        const analysis = JSON.parse(analysisText);
        console.log('✅ AI Analysis successful');
        console.log(`   Priority: ${analysis.priority_level} (${analysis.priority_score}/10)`);
        console.log(`   Sentiment: ${analysis.sentiment}`);
        console.log(`   Category: ${analysis.category}`);

        // Update database
        await pool.request()
          .input('feedbackId', fb.id)
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

        console.log('✅ Database updated');

        // Wait between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ Error analyzing feedback ${fb.id}:`, error.message);
      }
    }

    console.log('\n🎉 Manual AI analysis completed!');
    console.log('📊 Check your admin dashboard now - it should show data');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

runManualAnalysis();
