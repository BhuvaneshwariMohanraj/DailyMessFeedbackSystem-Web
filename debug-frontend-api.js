// Debug frontend API calls
async function debugFrontendAPI() {
  console.log('🔍 Debugging frontend API calls...');

  try {
    // Step 1: Login as admin
    console.log('1. Admin login...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'Admin123!' })
    });

    if (!loginResponse.ok) {
      console.error('❌ Login failed:', loginResponse.status);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    
    // Check token format that frontend expects
    const token = loginData.tokens?.accessToken || loginData.accessToken;
    console.log('Token format check:');
    console.log('  - tokens.accessToken exists:', !!loginData.tokens?.accessToken);
    console.log('  - accessToken exists:', !!loginData.accessToken);
    console.log('  - Using token:', token ? 'Found' : 'Missing');

    if (!token) {
      console.error('❌ No token found in login response');
      console.log('Login response:', JSON.stringify(loginData, null, 2));
      return;
    }

    // Step 2: Test insights API (same as frontend)
    console.log('\n2. Testing insights API...');
    const insightsResponse = await fetch('http://localhost:5000/api/admin/insights?timeframe=week', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Insights response status:', insightsResponse.status);
    
    if (insightsResponse.ok) {
      const insightsData = await insightsResponse.json();
      console.log('✅ Insights API successful');
      console.log('Data summary:');
      console.log('  - Total feedback:', insightsData.stats?.total_feedback || 0);
      console.log('  - Urgent issues:', insightsData.stats?.urgent_issues || 0);
      console.log('  - Has AI insights:', !!insightsData.ai_insights);
      console.log('  - Recent urgent count:', insightsData.recent_urgent_feedback?.length || 0);
    } else {
      const errorText = await insightsResponse.text();
      console.error('❌ Insights API failed:', errorText);
    }

    // Step 3: Test alerts API
    console.log('\n3. Testing alerts API...');
    const alertsResponse = await fetch('http://localhost:5000/api/admin/alerts', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Alerts response status:', alertsResponse.status);
    
    if (alertsResponse.ok) {
      const alertsData = await alertsResponse.json();
      console.log('✅ Alerts API successful');
      console.log('  - Total alerts:', alertsData.total_alerts || 0);
      console.log('  - Critical alerts:', alertsData.critical_alerts || 0);
      console.log('  - Alert count:', alertsData.alerts?.length || 0);
    } else {
      const errorText = await alertsResponse.text();
      console.error('❌ Alerts API failed:', errorText);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugFrontendAPI();
