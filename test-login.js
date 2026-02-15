import http from 'http';

const data = JSON.stringify({
  email: 'testuser@example.com',
  password: 'Test@1234'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  },
  timeout: 5000
};

const req = http.request(options, (res) => {
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log(`✅ Status: ${res.statusCode}`);
    try {
      const parsed = JSON.parse(responseData);
      console.log(`📨 Response:`, JSON.stringify(parsed, null, 2));
      if (parsed.token) {
        console.log(`\n🔐 Token (first 30 chars): ${parsed.token.substring(0, 30)}...`);
      }
    } catch (e) {
      console.log(`📨 Response:`, responseData);
    }
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error(`❌ Error: ${e.message}`);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('❌ Request timeout');
  process.exit(1);
});

console.log('Testing login endpoint...');
req.write(data);
req.end();
