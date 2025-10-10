// Simple test script to submit feedback via API
const testFeedback = [
  {
    rating: 1,
    comment: "The chicken curry today smelled bad and many students got stomach ache after eating it. This is a serious health issue!",
    meal_type: "lunch",
    is_anonymous: false
  },
  {
    rating: 2,
    comment: "The food counter was closed during lunch time and staff was very rude to students waiting in queue.",
    meal_type: "lunch", 
    is_anonymous: false
  },
  {
    rating: 3,
    comment: "The rice was too salty today and the dal was cold. Food quality needs improvement.",
    meal_type: "lunch",
    is_anonymous: false
  },
  {
    rating: 5,
    comment: "The food was delicious today, especially the dessert. Great job by the kitchen staff!",
    meal_type: "lunch",
    is_anonymous: false
  }
];

async function submitTestFeedback() {
  console.log('🧪 Submitting test feedback...');
  
  // First login as a user
  const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: 'user1',
      password: 'password123'
    })
  });

  if (!loginResponse.ok) {
    console.error('❌ Login failed');
    return;
  }

  const loginData = await loginResponse.json();
  const token = loginData.tokens.accessToken;
  console.log('✅ Logged in successfully');

  // Submit each feedback
  for (let i = 0; i < testFeedback.length; i++) {
    const feedback = testFeedback[i];
    
    try {
      const response = await fetch('http://localhost:5000/api/feedback/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(feedback)
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Feedback ${i + 1} submitted successfully`);
        if (result.feedback.ai_analysis) {
          console.log(`   🤖 AI Priority: ${result.feedback.ai_analysis.priority_level} (${result.feedback.ai_analysis.priority_score}/10)`);
          console.log(`   😊 Sentiment: ${result.feedback.ai_analysis.sentiment}`);
          console.log(`   📋 Category: ${result.feedback.ai_analysis.category}`);
        }
      } else {
        console.error(`❌ Failed to submit feedback ${i + 1}`);
      }
    } catch (error) {
      console.error(`❌ Error submitting feedback ${i + 1}:`, error.message);
    }

    // Wait a bit between submissions
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('🎉 Test feedback submission completed!');
  console.log('📊 Check your AI Insights dashboard to see the results');
}

// Run the test
submitTestFeedback().catch(console.error);
