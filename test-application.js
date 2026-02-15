/**
 * Application Verification Test Suite
 * Tests core functionality with sample input
 */

const http = require('http');

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: responseData ? JSON.parse(responseData) : null,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: responseData,
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test Suite
async function runTests() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║         APPLICATION VERIFICATION TEST SUITE            ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  const tests = [];

  // Test 1: Health Check
  console.log('📋 Test 1: Health Check Endpoint');
  try {
    const result = await makeRequest('GET', '/api/health');
    const passed = result.status === 200 && result.data.status === 'healthy';
    console.log(`   Status: ${result.status}`);
    console.log(`   Result: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`   Database: ${result.data.database}`);
    tests.push({ name: 'Health Check', passed, status: result.status });
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}`);
    tests.push({ name: 'Health Check', passed: false });
  }

  // Test 2: Sign Up
  console.log('\n📋 Test 2: User Sign Up');
  const timestamp = Date.now();
  const testEmail = `testuser${timestamp}@example.com`;
  const testUsername = `testuser${timestamp}`;
  const signupPayload = {
    username: testUsername,
    email: testEmail,
    password: 'Test@123456',
    confirmPassword: 'Test@123456',
  };
  try {
    const result = await makeRequest('POST', '/api/auth/signup', signupPayload);
    const passed = result.status === 201 && result.data.token;
    console.log(`   Email: ${testEmail}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Result: ${passed ? '✅ PASSED' : '⚠️ ' + result.status}`);
    if (result.data.message) console.log(`   Message: ${result.data.message}`);
    if (result.data.token) console.log(`   Token: Generated ✓`);
    tests.push({ name: 'Sign Up', passed, status: result.status });
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}`);
    tests.push({ name: 'Sign Up', passed: false });
  }

  // Test 3: Login
  console.log('\n📋 Test 3: User Login');
  const loginPayload = {
    email: 'demo@example.com',
    password: 'Test@123456',
  };
  try {
    const result = await makeRequest('POST', '/api/auth/login', loginPayload);
    const passed = result.status === 200 && result.data.token;
    console.log(`   Email: ${loginPayload.email}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Result: ${passed ? '✅ PASSED' : result.status === 401 ? '⚠️ Invalid credentials' : '❌ FAILED'}`);
    if (result.data.token) console.log(`   Token: Generated ✓`);
    if (result.data.message) console.log(`   Message: ${result.data.message}`);
    tests.push({ name: 'Login', passed, status: result.status });
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}`);
    tests.push({ name: 'Login', passed: false });
  }

  // Test 4: Verify Authentication Routes
  console.log('\n📋 Test 4: Verify Auth Routes');
  try {
    const result = await makeRequest('GET', '/api/auth/routes');
    const passed = result.status === 200;
    console.log(`   Status: ${result.status}`);
    console.log(`   Result: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
    if (result.data && result.data.routes) {
      console.log(`   Available Routes: ${result.data.routes.length}`);
      result.data.routes.slice(0, 5).forEach((route) => {
        console.log(`     • ${route.method} ${route.path}`);
      });
    }
    tests.push({ name: 'Verify Routes', passed, status: result.status });
  } catch (error) {
    console.log(`   ⚠️ Route verification endpoint may not exist`);
    tests.push({ name: 'Verify Routes', passed: false });
  }

  // Test 5: Frontend Connectivity
  console.log('\n📋 Test 5: Frontend Server Check');
  try {
    const options = {
      hostname: 'localhost',
      port: 5173,
      path: '/',
      method: 'GET',
    };
    const req = http.request(options, (res) => {
      const passed = res.statusCode < 400;
      console.log(`   Port: 5173`);
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   Result: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
      tests.push({ name: 'Frontend Running', passed, status: res.statusCode });
      printSummary();
    });
    req.on('error', () => {
      console.log(`   Status: Not responding`);
      console.log(`   Result: ❌ FAILED`);
      tests.push({ name: 'Frontend Running', passed: false });
      printSummary();
    });
    req.end();
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}`);
    tests.push({ name: 'Frontend Running', passed: false });
    printSummary();
  }

  // Summary
  function printSummary() {
    setTimeout(() => {
      console.log('\n╔════════════════════════════════════════════════════════╗');
      console.log('║                    TEST SUMMARY                        ║');
      console.log('╚════════════════════════════════════════════════════════╝');
      const passed = tests.filter((t) => t.passed).length;
      const total = tests.length;
      console.log(`\n  Total Tests: ${total}`);
      console.log(`  Passed: ${passed} ✅`);
      console.log(`  Failed: ${total - passed} ❌`);
      console.log(`  Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`);

      tests.forEach((test) => {
        console.log(`  ${test.passed ? '✅' : '❌'} ${test.name.padEnd(25)} (${test.status})`);
      });

      console.log('\n╔════════════════════════════════════════════════════════╗');
      if (passed === total) {
        console.log('║  ✅ ALL TESTS PASSED - APPLICATION READY FOR USE      ║');
      } else {
        console.log(`║  ⚠️  ${total - passed} TEST(S) FAILED - REVIEW ABOVE       ║`);
      }
      console.log('╚════════════════════════════════════════════════════════╝\n');

      process.exit(passed === total ? 0 : 1);
    }, 500);
  }
}

// Run tests
runTests().catch((error) => {
  console.error('Test suite error:', error);
  process.exit(1);
});
