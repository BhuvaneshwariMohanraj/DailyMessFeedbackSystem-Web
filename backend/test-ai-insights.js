// Quick test to check AI Insights availability
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

async function testAIInsights() {
  let pool;
  
  try {
    console.log('🔍 Testing AI Insights Setup...\n');
    
    pool = new sql.ConnectionPool(config);
    await pool.connect();

    // Test 1: Check if AI columns exist
    console.log('1️⃣ Checking AI columns...');
    try {
      const test = await pool.request().query(`
        SELECT TOP 1 
          ai_priority_score, 
          ai_analyzed_at 
        FROM Feedback
      `);
      console.log('   ✅ AI columns exist\n');
    } catch (error) {
      console.log('   ❌ AI columns missing!');
      console.log('   → Run fix-feedback-table.sql in Azure SQL\n');
      return;
    }

    // Test 2: Check for feedback data
    console.log('2️⃣ Checking feedback data...');
    const feedbackCount = await pool.request().query(`
      SELECT COUNT(*) as total FROM Feedback
    `);
    console.log(`   Total feedback: ${feedbackCount.recordset[0].total}`);
    
    const withComments = await pool.request().query(`
      SELECT COUNT(*) as count FROM Feedback WHERE comment IS NOT NULL
    `);
    console.log(`   With comments: ${withComments.recordset[0].count}`);
    
    const aiAnalyzed = await pool.request().query(`
      SELECT COUNT(*) as count FROM Feedback WHERE ai_analyzed_at IS NOT NULL
    `);
    console.log(`   AI analyzed: ${aiAnalyzed.recordset[0].count}\n`);

    // Test 3: Check GEMINI_API_KEY
    console.log('3️⃣ Checking GEMINI_API_KEY...');
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      console.log('   ❌ GEMINI_API_KEY not configured');
      console.log('   → Get API key from: https://makersuite.google.com/app/apikey');
      console.log('   → Add to .env file: GEMINI_API_KEY=your_actual_key\n');
    } else {
      console.log('   ✅ GEMINI_API_KEY is configured\n');
    }

    // Test 4: Simulate AI Insights query
    console.log('4️⃣ Testing AI Insights query...');
    const insightsQuery = await pool.request().query(`
      SELECT 
        id, rating, comment, meal_type,
        ai_priority_score, ai_priority_level, ai_sentiment, ai_category
      FROM Feedback 
      WHERE comment IS NOT NULL 
        AND ai_analyzed_at IS NOT NULL 
        AND meal_date >= DATEADD(day, -7, CAST(GETDATE() AS DATE))
      ORDER BY ai_priority_score DESC
    `);
    
    console.log(`   Found ${insightsQuery.recordset.length} AI-analyzed feedback in last 7 days`);
    
    if (insightsQuery.recordset.length > 0) {
      console.log('\n   ✅ AI Insights should be visible!\n');
      console.log('   Sample feedback:');
      insightsQuery.recordset.slice(0, 2).forEach(fb => {
        console.log(`   - ID ${fb.id}: ${fb.ai_priority_level} priority, ${fb.ai_sentiment} sentiment`);
        console.log(`     "${fb.comment.substring(0, 60)}..."`);
      });
    } else {
      console.log('\n   ⚠️  No AI-analyzed feedback found!');
      console.log('\n   📝 To fix this:');
      console.log('   1. Make sure GEMINI_API_KEY is configured');
      console.log('   2. Submit feedback with comments as a user');
      console.log('   3. The backend will automatically analyze it');
      console.log('   4. Check AI Insights tab again');
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Summary:');
    console.log('='.repeat(50));
    
    const issues = [];
    if (aiAnalyzed.recordset[0].count === 0) {
      issues.push('No AI-analyzed feedback');
    }
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      issues.push('GEMINI_API_KEY not configured');
    }
    if (withComments.recordset[0].count === 0) {
      issues.push('No feedback with comments');
    }
    
    if (issues.length > 0) {
      console.log('❌ Issues found:');
      issues.forEach(issue => console.log(`   - ${issue}`));
    } else {
      console.log('✅ Everything looks good!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

testAIInsights();
