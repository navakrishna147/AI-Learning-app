/**
 * Complete System Verification Script
 * Tests all backend and frontend connectivity
 * Run this after starting both backend and frontend
 */

import axios from 'axios';

const BACKEND_URL = 'http://localhost:5000';
const FRONTEND_URL = 'http://localhost:5174';
const API_PROXY = `${FRONTEND_URL}/api`;

console.log(`
╔════════════════════════════════════════════════════════════════╗
║     🔍 AI Learning Assistant - System Verification             ║
║                                                                ║
║     Testing: Backend Connection, CORS, and API Endpoints      ║
╚════════════════════════════════════════════════════════════════╝
`);

const tests = [];
let passedTests = 0;
let failedTests = 0;

// Test utilities
const logTest = (name, status, details = '') => {
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏳';
  const message = \`\${icon} \${name}\`;
  console.log(\`  \${message.padEnd(50)}\${details}\`);
  
  if (status === 'PASS') passedTests++;
  else if (status === 'FAIL') failedTests++;
};

// Main verification tests
const runTests = async () => {
  console.log('\n📋 Test Suite 1: Backend Connectivity\n');
  
  // Test 1: Backend Health Check
  try {
    const response = await axios.get(\`\${BACKEND_URL}/health\`, { timeout: 5000 });
    if (response.status === 200) {
      logTest('Backend Health Check', 'PASS', 'Status 200');
    } else {
      logTest('Backend Health Check', 'FAIL', \`Status \${response.status}\`);
    }
  } catch (error) {
    logTest('Backend Health Check', 'FAIL', error.message);
  }

  // Test 2: API Health Check
  try {
    const response = await axios.get(\`\${BACKEND_URL}/api/health\`, { timeout: 5000 });
    if (response.status === 200) {
      logTest('API Health Endpoint', 'PASS', 'Status 200');
    } else {
      logTest('API Health Endpoint', 'FAIL', \`Status \${response.status}\`);
    }
  } catch (error) {
    logTest('API Health Endpoint', 'FAIL', error.message);
  }

  // Test 3: Auth Health Check
  try {
    const response = await axios.get(\`\${BACKEND_URL}/api/auth/health-check\`, { timeout: 5000 });
    if (response.status === 200 && response.data.success) {
      logTest('Auth Health Check', 'PASS', 'Status 200');
    } else {
      logTest('Auth Health Check', 'FAIL', 'Response not successful');
    }
  } catch (error) {
    logTest('Auth Health Check', 'FAIL', error.message);
  }

  console.log('\n📋 Test Suite 2: CORS Configuration\n');

  // Test 4: CORS Headers
  try {
    const response = await axios.options(\`\${BACKEND_URL}/api/auth/login\`, {
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type'
      },
      timeout: 5000
    });
    const hasCors = response.headers['access-control-allow-origin'];
    if (hasCors) {
      logTest('CORS Preflight', 'PASS', hasCors);
    } else {
      logTest('CORS Preflight', 'FAIL', 'No CORS headers');
    }
  } catch (error) {
    logTest('CORS Preflight', 'FAIL', error.message);
  }

  console.log('\n📋 Test Suite 3: Environment Configuration\n');

  // Test 5: Port Configuration
  try {
    const backendRunning = await axios.get(\`\${BACKEND_URL}/\`).then(() => true).catch(() => false);
    if (backendRunning) {
      logTest('Backend Port 5000', 'PASS', 'Listening');
    } else {
      logTest('Backend Port 5000', 'FAIL', 'Not responding');
    }
  } catch (error) {
    logTest('Backend Port 5000', 'FAIL', error.message);
  }

  console.log('\n📋 Test Suite 4: Frontend API Proxy\n');

  // Test 6: Frontend Proxy Setup
  try {
    // This test runs in the browser, so we'll show instructions
    logTest('Frontend Proxy /api', 'SKIP', 'Test in browser console');
    logTest('Frontend Error Handling', 'SKIP', 'Check browser console');
  } catch (error) {
    logTest('Frontend Configuration', 'FAIL', error.message);
  }

  console.log('\n' + '═'.repeat(64));
  console.log(\`
📊 Test Results:
   ✅ Passed: \${passedTests}
   ❌ Failed: \${failedTests}
   ⏭️  Skipped: 2
   
═══════════════════════════════════════════════════════════════════
\`);

  if (failedTests === 0) {
    console.log(\`🎉 ALL TESTS PASSED! Your system is ready to use!\n\`);
  } else {
    console.log(\`⚠️  Some tests failed. Please check the errors above.\n\`);
    console.log(\`💡 Troubleshooting tips:
    1. Make sure MongoDB is running
    2. Make sure backend is running on port 5000
    3. Make sure frontend is running on port 5174
    4. Check that no firewall is blocking connections
    5. Restart all services if needed\n\`);
  }
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.verifySystem = runTests;
  console.log('Run verifySystem() in console to test the application');
}

// Run if executed directly
if (typeof module !== 'undefined' && module.export) {
  runTests();
}

export default runTests;
