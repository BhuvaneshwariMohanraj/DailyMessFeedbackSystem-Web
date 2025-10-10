// Debug script to test API endpoints
async function testAPI() {
  console.log('🔍 Testing API endpoints...');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:5000/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health:', healthData);

    // Test login
    console.log('2. Testing login...');
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
      const errorText = await loginResponse.text();
      console.error('❌ Login failed:', loginResponse.status, errorText);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful, token received');
    console.log('Login response:', JSON.stringify(loginData, null, 2));
    
    const token = loginData.tokens.accessToken;
    console.log('Token length:', token.length);
    console.log('Token starts with:', token.substring(0, 20) + '...');

    // Test feedback submission
    console.log('3. Testing feedback submission...');
    const feedbackResponse = await fetch('http://localhost:5000/api/feedback/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        rating: 1,
        comment: "Test feedback for AI analysis",
        meal_type: "lunch",
        is_anonymous: false
      })
    });

    if (!feedbackResponse.ok) {
      const errorText = await feedbackResponse.text();
      console.error('❌ Feedback submission failed:', feedbackResponse.status, errorText);
      return;
    }

    const feedbackData = await feedbackResponse.json();
    console.log('✅ Feedback submitted successfully:', feedbackData);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAPI();
