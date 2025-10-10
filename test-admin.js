// Test admin login and insights API
async function testAdminAPI() {
  console.log('🔍 Testing Admin API...');

  try {
    // Test admin login
    console.log('1. Testing admin login...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'Admin123!'
      })
    });

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.error('❌ Admin login failed:', loginResponse.status, errorText);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Admin login successful');
    
    const token = loginData.tokens.accessToken;
    console.log('Admin user role:', loginData.user.role_id);

    // Test insights API
    console.log('2. Testing insights API...');
    const insightsResponse = await fetch('http://localhost:5000/api/admin/insights', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!insightsResponse.ok) {
      const errorText = await insightsResponse.text();
      console.error('❌ Insights API failed:', insightsResponse.status, errorText);
      return;
    }

    const insightsData = await insightsResponse.json();
    console.log('✅ Insights API successful');
    console.log('Insights data:', JSON.stringify(insightsData, null, 2));

    // Test alerts API
    console.log('3. Testing alerts API...');
    const alertsResponse = await fetch('http://localhost:5000/api/admin/alerts', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!alertsResponse.ok) {
      const errorText = await alertsResponse.text();
      console.error('❌ Alerts API failed:', alertsResponse.status, errorText);
      return;
    }

    const alertsData = await alertsResponse.json();
    console.log('✅ Alerts API successful');
    console.log('Alerts data:', JSON.stringify(alertsData, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAdminAPI();
