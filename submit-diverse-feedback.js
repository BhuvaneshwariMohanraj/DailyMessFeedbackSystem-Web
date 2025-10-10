// Submit diverse feedback for comprehensive testing
async function submitDiverseFeedback() {
  console.log('🧪 Submitting diverse feedback for comprehensive testing...');

  const feedbackSamples = [
    {
      rating: 5,
      comment: "The food was absolutely delicious today! The biryani was perfectly cooked and the dessert was amazing. Great job by the kitchen staff!",
      meal_type: "lunch",
      is_anonymous: false
    },
    {
      rating: 2,
      comment: "The service was very slow today and the staff was rude when we asked about the delay. Food counter was understaffed.",
      meal_type: "dinner",
      is_anonymous: false
    },
    {
      rating: 3,
      comment: "The rice was too salty and the dal was cold. Food quality needs improvement but portion sizes were good.",
      meal_type: "lunch",
      is_anonymous: false
    },
    {
      rating: 1,
      comment: "Found hair in my food today. This is disgusting and unhygienic. The kitchen needs better cleanliness standards.",
      meal_type: "breakfast",
      is_anonymous: true
    },
    {
      rating: 4,
      comment: "Good variety of dishes today. The sambar was tasty but could use more vegetables. Overall satisfied with the meal.",
      meal_type: "dinner",
      is_anonymous: false
    }
  ];

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

    // Submit each feedback
    for (let i = 0; i < feedbackSamples.length; i++) {
      const feedback = feedbackSamples[i];
      
      console.log(`\n🔄 Submitting feedback ${i + 1}/${feedbackSamples.length}...`);
      console.log(`   Rating: ${feedback.rating}/5`);
      console.log(`   Comment: "${feedback.comment.substring(0, 50)}..."`);

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
        console.log(`✅ Submitted successfully - AI Priority: ${result.feedback?.ai_priority_level || 'N/A'}`);
      } else {
        console.error(`❌ Failed to submit feedback ${i + 1}`);
      }

      // Wait between submissions
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\n🎉 All diverse feedback submitted successfully!');
    console.log('📊 Your AI dashboard should now show:');
    console.log('   - Mix of positive and negative sentiment');
    console.log('   - Various priority levels (1-10)');
    console.log('   - Different categories (Food Quality, Service, Hygiene)');
    console.log('   - Health safety concerns flagged');
    console.log('   - Comprehensive AI insights generated');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

submitDiverseFeedback();
