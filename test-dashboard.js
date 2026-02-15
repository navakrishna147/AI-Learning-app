import fetch from 'node-fetch';

async function testDashboard() {
  try {
    console.log('Testing dashboard endpoint...\n');

    // First login to get token
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testuser@example.com',
        password: 'Test@1234'
      })
    });

    const loginData = await loginRes.json();
    
    if (!loginRes.ok) {
      console.error('❌ Login failed:', loginData);
      return;
    }

    const token = loginData.token;
    console.log('✅ Logged in successfully');
    console.log(`🔐 Token: ${token.substring(0, 30)}...\n`);

    // Test dashboard endpoint
    console.log('Testing dashboard endpoint...');
    const dashRes = await fetch('http://localhost:5000/api/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (dashRes.ok) {
      const dashData = await dashRes.json();
      console.log('✅ Status:', dashRes.status);
      console.log('📊 Dashboard Data:', JSON.stringify(dashData, null, 2));
    } else {
      console.error('❌ Dashboard failed - Status:', dashRes.status);
      const errorData = await dashRes.json();
      console.error('   Error:', errorData);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testDashboard();
