// Submit a single feedback and check for AI analysis
async function submitAndCheck() {
  console.log('🧪 Submitting single feedback for AI analysis...');

  try {
    // Login
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'user1', password: 'password123' })
    });

    const loginData = await loginResponse.json();
    const token = loginData.tokens.accessToken;
    console.log('✅ Logged in successfully');

    // Submit feedback with detailed comment
    const feedbackData = {
      rating: 1,
      comment: "The chicken curry today smelled terrible and made several students sick. This is a serious health emergency that needs immediate attention!",
      meal_type: "lunch",
      is_anonymous: false
    };

    console.log('🔄 Submitting feedback...');
    console.log('Comment:', feedbackData.comment);

    const response = await fetch('http://localhost:5000/api/feedback/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(feedbackData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Feedback submission failed:', response.status, errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ Feedback submitted successfully');
    console.log('Feedback ID:', result.feedback?.id);
    
    // Check if AI analysis was performed
    if (result.feedback?.ai_priority_score) {
      console.log('🤖 AI Analysis completed:');
      console.log('   Priority Score:', result.feedback.ai_priority_score);
      console.log('   Priority Level:', result.feedback.ai_priority_level);
      console.log('   Sentiment:', result.feedback.ai_sentiment);
      console.log('   Category:', result.feedback.ai_category);
      console.log('   Health Safety Concern:', result.feedback.ai_health_safety_concern);
    } else {
      console.log('⚠️ AI Analysis not found in response');
      console.log('Response:', JSON.stringify(result, null, 2));
    }

    // Wait a moment and check the database
    console.log('⏳ Waiting 3 seconds for AI processing...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check admin insights
    const adminLoginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'Admin123!' })
    });

    const adminData = await adminLoginResponse.json();
    const adminToken = adminData.tokens.accessToken;

    const insightsResponse = await fetch('http://localhost:5000/api/admin/insights', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });

    if (insightsResponse.ok) {
      const insights = await insightsResponse.json();
      console.log('📊 Admin insights:', JSON.stringify(insights, null, 2));
    } else {
      console.log('❌ Failed to fetch insights');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

submitAndCheck();
