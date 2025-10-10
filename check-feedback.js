// Check if feedback has AI analysis
async function checkFeedback() {
  console.log('🔍 Checking feedback data...');

  try {
    // Login as admin
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'Admin123!' })
    });

    const loginData = await loginResponse.json();
    const token = loginData.tokens.accessToken;

    // Check all feedback
    const response = await fetch('http://localhost:5000/api/feedback/admin/all', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      console.error('❌ Failed to fetch feedback');
      return;
    }

    const data = await response.json();
    const feedback = data.feedback || [];
    
    console.log(`📊 Total feedback entries: ${feedback.length}`);
    
    feedback.forEach((f, index) => {
      console.log(`\n${index + 1}. Feedback ID: ${f.id}`);
      console.log(`   Rating: ${f.rating}/5`);
      console.log(`   Comment: "${f.comment?.substring(0, 50)}..."`);
      console.log(`   AI Priority: ${f.ai_priority_score || 'Not analyzed'}`);
      console.log(`   AI Sentiment: ${f.ai_sentiment || 'Not analyzed'}`);
      console.log(`   AI Category: ${f.ai_category || 'Not analyzed'}`);
      console.log(`   AI Analyzed: ${f.ai_analyzed_at ? 'Yes' : 'No'}`);
    });

    // Count analyzed vs unanalyzed
    const analyzed = feedback.filter(f => f.ai_analyzed_at).length;
    const unanalyzed = feedback.length - analyzed;
    
    console.log(`\n📈 AI Analysis Status:`);
    console.log(`   ✅ Analyzed: ${analyzed}`);
    console.log(`   ⏳ Pending: ${unanalyzed}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkFeedback();
