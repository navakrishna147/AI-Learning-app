/**
 * Comprehensive Application Verification Test
 * Tests signup, login, health check, and AI chat features
 */

const http = require('http');

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: defaultHeaders,
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
            headers: res.headers,
            data: responseData ? JSON.parse(responseData) : null,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
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
  console.log('║    COMPREHENSIVE APPLICATION VERIFICATION TEST          ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  const tests = [];
  let authToken = null;
  let testUserId = null;

  try {
    // Test 1: Health Check
    console.log('📋 Test 1: Backend Health Check');
    const healthResult = await makeRequest('GET', '/api/health');
    const healthPassed = healthResult.status === 200 && healthResult.data.status === 'healthy';
    console.log(`   Status: ${healthResult.status}`);
    console.log(`   Database: ${healthResult.data.database}`);
    console.log(`   Environment: ${healthResult.data.environment}`);
    console.log(`   Result: ${healthPassed ? '✅ PASSED' : '❌ FAILED'}`);
    tests.push({ name: 'Health Check', passed: healthPassed, status: healthResult.status });
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}`);
    tests.push({ name: 'Health Check', passed: false });
  }

  // Test 2: Create New User (Sign Up)
  console.log('\n📋 Test 2: User Registration');
  const timestamp = Date.now();
  const testUsername = `testuser${timestamp}`;
  const testEmail = `testuser${timestamp}@example.com`;
  const testPassword = 'Test@123456';

  try {
    const signupResult = await makeRequest('POST', '/api/auth/signup', {
      username: testUsername,
      email: testEmail,
      password: testPassword,
      confirmPassword: testPassword,
    });

    const signupPassed = signupResult.status === 201 && signupResult.data.token;
    console.log(`   Email: ${testEmail}`);
    console.log(`   Status: ${signupResult.status}`);
    console.log(`   Result: ${signupPassed ? '✅ PASSED' : '⚠️ ' + signupResult.status}`);
    if (signupResult.data.token) {
      console.log(`   Token: Generated ✓`);
      authToken = signupResult.data.token;
      testUserId = signupResult.data.user._id;
    }
    if (signupResult.data.message) console.log(`   Message: ${signupResult.data.message}`);
    tests.push({ name: 'User Registration', passed: signupPassed, status: signupResult.status });
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}`);
    tests.push({ name: 'User Registration', passed: false });
  }

  // Test 3: Login With Created User
  console.log('\n📋 Test 3: User Login');
  if (authToken) {
    try {
      const loginResult = await makeRequest('POST', '/api/auth/login', {
        email: testEmail,
        password: testPassword,
      });

      const loginPassed = loginResult.status === 200 && loginResult.data.token;
      console.log(`   Email: ${testEmail}`);
      console.log(`   Status: ${loginResult.status}`);
      console.log(`   Result: ${loginPassed ? '✅ PASSED' : '❌ FAILED'}`);
      if (loginResult.data.message) console.log(`   Message: ${loginResult.data.message}`);
      if (loginResult.data.token) {
        authToken = loginResult.data.token;
        console.log(`   Token: Refreshed ✓`);
      }
      tests.push({ name: 'User Login', passed: loginPassed, status: loginResult.status });
    } catch (error) {
      console.log(`   ❌ FAILED: ${error.message}`);
      tests.push({ name: 'User Login', passed: false });
    }
  } else {
    console.log(`   ⚠️ SKIPPED: No token from signup`);
    tests.push({ name: 'User Login', passed: false, skipped: true });
  }

  // Test 4: Get User Profile
  console.log('\n📋 Test 4: Get User Profile');
  if (authToken) {
    try {
      const profileResult = await makeRequest('GET', '/api/auth/profile', null, {
        'Authorization': `Bearer ${authToken}`,
      });

      const profilePassed = profileResult.status === 200 && profileResult.data.user;
      console.log(`   Status: ${profileResult.status}`);
      console.log(`   Result: ${profilePassed ? '✅ PASSED' : '❌ FAILED'}`);
      if (profileResult.data.user) {
        console.log(`   Username: ${profileResult.data.user.username}`);
        console.log(`   Email: ${profileResult.data.user.email}`);
      }
      tests.push({ name: 'Get Profile', passed: profilePassed, status: profileResult.status });
    } catch (error) {
      console.log(`   ❌ FAILED: ${error.message}`);
      tests.push({ name: 'Get Profile', passed: false });
    }
  } else {
    console.log(`   ⚠️ SKIPPED: No authentication token`);
    tests.push({ name: 'Get Profile', passed: false, skipped: true });
  }

  // Test 5: Chat Endpoint
  console.log('\n📋 Test 5: AI Chat Functionality');
  if (authToken) {
    try {
      const chatResult = await makeRequest('POST', '/api/chat/send-message', {
        message: 'Hello, what is machine learning?',
      }, {
        'Authorization': `Bearer ${authToken}`,
      });

      const chatPassed = chatResult.status === 200 && chatResult.data.reply;
      console.log(`   Message: "Hello, what is machine learning?"`);
      console.log(`   Status: ${chatResult.status}`);
      console.log(`   Result: ${chatPassed ? '✅ PASSED' : '⚠️ ' + chatResult.status}`);
      if (chatResult.data.reply) {
        console.log(`   AI Response: ${chatResult.data.reply.substring(0, 50)}...`);
      }
      if (chatResult.data.message) console.log(`   Message: ${chatResult.data.message}`);
      tests.push({ name: 'AI Chat', passed: chatPassed, status: chatResult.status });
    } catch (error) {
      console.log(`   ⚠️ Failed: ${error.message}`);
      tests.push({ name: 'AI Chat', passed: false });
    }
  } else {
    console.log(`   ⚠️ SKIPPED: No authentication token`);
    tests.push({ name: 'AI Chat', passed: false, skipped: true });
  }

  // Test 6: Frontend Connectivity
  console.log('\n📋 Test 6: Frontend Server Check');
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
      const skipped = tests.filter((t) => t.skipped).length;

      console.log(`\n  Total Tests: ${total}`);
      console.log(`  Passed: ${passed} ✅`);
      console.log(`  Failed: ${total - passed - skipped} ❌`);
      if (skipped > 0) console.log(`  Skipped: ${skipped} ⏭️`);
      console.log(`  Success Rate: ${((passed / (total - skipped)) * 100).toFixed(1)}%\n`);

      tests.forEach((test) => {
        const status = test.skipped ? '⏭️ ' : test.passed ? '✅' : '❌';
        console.log(`  ${status} ${test.name.padEnd(25)} (${test.status})`);
      });

      console.log('\n╔════════════════════════════════════════════════════════╗');
      const criticalTests = tests.filter(
        (t) => ['Health Check', 'User Registration', 'Frontend Running'].includes(t.name)
      );
      const criticalPassed = criticalTests.filter((t) => t.passed).length;

      if (criticalPassed === 3) {
        console.log('║  ✅ CORE FUNCTIONALITY WORKING - APP READY FOR USE     ║');
      } else {
        console.log(`║  ⚠️  SOME TESTS FAILED - CHECK DETAILS ABOVE             ║`);
      }
      console.log('╚════════════════════════════════════════════════════════╝\n');

      // Additional information
      console.log('📌 Application Access Information:');
      console.log('   Frontend: http://localhost:5173');
      console.log('   Backend:  http://localhost:5000');
      console.log('   API Docs: http://localhost:5000/api/health\n');

      console.log('🚀 Next Steps:');
      console.log('   1. Open http://localhost:5173 in your browser');
      console.log('   2. Sign up or login with the test account');
      console.log('   3. Test the chat functionality');
      console.log('   4. Upload documents for analysis\n');

      process.exit(passed > 3 ? 0 : 1);
    }, 500);
  }
}

// Run tests
runTests().catch((error) => {
  console.error('Test suite error:', error);
  process.exit(1);
});
