// Test AI insights generation
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

async function testInsights() {
  console.log('🧠 Testing AI insights generation...');

  try {
    const pool = await sql.connect(dbConfig);
    console.log('✅ Database connected');

    // Get analyzed feedback
    const result = await pool.request().query(`
      SELECT TOP 5
        id, rating, comment, meal_type, meal_date,
        ai_priority_score, ai_priority_level, ai_category,
        ai_summary, ai_recommended_action, ai_health_safety_concern,
        created_at
      FROM Feedback 
      WHERE comment IS NOT NULL 
        AND ai_analyzed_at IS NOT NULL 
      ORDER BY ai_priority_score DESC, created_at DESC
    `);

    const feedback = result.recordset;
    console.log(`📊 Found ${feedback.length} analyzed feedback entries`);

    if (feedback.length === 0) {
      console.log('❌ No analyzed feedback found. Cannot generate insights.');
      return;
    }

    // Show feedback data
    feedback.forEach((fb, index) => {
      console.log(`\n${index + 1}. Feedback ID: ${fb.id}`);
      console.log(`   Rating: ${fb.rating}/5`);
      console.log(`   Comment: "${fb.comment.substring(0, 50)}..."`);
      console.log(`   Category: ${fb.ai_category}`);
      console.log(`   Priority: ${fb.ai_priority_level} (${fb.ai_priority_score}/10)`);
    });

    // Test insights generation
    console.log('\n🤖 Generating AI insights...');
    
    const geminiService = require('./src/services/geminiService').default;
    const insights = await geminiService.generateInsights(feedback);
    
    console.log('\n✅ AI Insights Generated:');
    console.log('─'.repeat(50));
    console.log(insights);
    console.log('─'.repeat(50));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testInsights();
