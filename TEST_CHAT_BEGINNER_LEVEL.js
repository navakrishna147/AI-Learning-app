#!/usr/bin/env node

/**
 * TEST SCRIPT: Chat Feature with Beginner-Level Explanations
 * Tests the Chat API with a software testing question
 * Expects: Beginner-level explanation of software testing concepts
 * Expected response: Real Claude AI response, NOT demo/fallback
 */

const http = require('http');

// Software Testing Document Content (from user)
const softwareTestingContent = `
INTRODUCTION TO SOFTWARE TESTING

Purpose of Testing:
- Verify that software meets requirements
- Identify defects and bugs before deployment
- Ensure quality and reliability
- Build confidence in the system

Dichotomies in Testing:
1. Manual vs Automated Testing
2. Black-box vs White-box Testing
3. Positive vs Negative Testing
4. Functional vs Non-functional Testing

Models for Testing:
- Waterfall Model
- V-Model
- Agile Testing Model
- DevOps Testing Model

Consequences of Bugs:
- Financial loss
- Customer dissatisfaction
- Loss of reputation
- Security vulnerabilities
- System failures

Taxonomy of Bugs:
1. Logic Errors: Incorrect algorithm implementation
2. Syntax Errors: Code structure problems
3. Interface Errors: Incorrect data flow
4. Performance Errors: Slow execution
5. Resource Errors: Memory/disk issues

Flow Graphs and Path Testing:

Basic Concepts of Path Testing:
- Control flow graph representation
- Node coverage
- Edge coverage
- Path coverage

Predicates and Path Predicates:
- Boolean conditions in code
- Decision points
- Path sensitivity

Achievable Paths:
- Reachable code paths
- Determining path feasibility
- Infeasible paths

Path Sensitizing:
- Test data selection
- Making data affect execution path
- Distinguishing between paths

Path Instrumentation:
- Adding monitoring code
- Tracking execution paths
- Collecting coverage data

Application of Path Testing:
- Critical systems
- Security-sensitive code
- Performance-critical code
- High-risk areas
`;

// Test Case 1: Create a chat test
async function testChatWithSoftwareTesting() {
  console.log('🧪 TEST CASE: Chat Feature - Software Testing Question');
  console.log('=' .repeat(60));
  console.log('📝 Question: What is software testing and why is it important?');
  console.log('Expected: Beginner-level explanation from REAL Claude API');
  console.log('=' .repeat(60));

  const testMessage = {
    userId: 'test-user-123',
    documentId: 'test-doc-123',
    documentTitle: 'Software Testing - Introduction',
    documentContent: softwareTestingContent,
    message: 'What is software testing and why is it important? Explain for someone learning this for the first time.'
  };

  return new Promise((resolve) => {
    const postData = JSON.stringify({
      message: testMessage.message
    });

    const options = {
      hostname: 'localhost',
      port: 5001,
      path: `/api/chat/test-doc-123`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length,
        'Authorization': 'Bearer test-token-123'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
        process.stdout.write('.');
      });

      res.on('end', () => {
        console.log('\n\n✅ Response Received!');
        console.log('Status Code:', res.statusCode);
        console.log('=' .repeat(60));

        try {
          const response = JSON.parse(data);

          // Check if response is from REAL Claude API or fallback
          if (data.includes('development mode response') || data.includes('Please configure your ANTHROPIC_API_KEY')) {
            console.log('❌ FAILED: Still getting development mode response');
            console.log('Response:', data);
          } else if (response.error) {
            console.log('⚠️  Error Response:');
            console.log('Error:', response.error);
            console.log('Message:', response.message);
          } else if (response.response) {
            console.log('✅ SUCCESS: Got real Claude AI response!');
            console.log('\n📚 AI RESPONSE (Beginner Level):\n');
            console.log(response.response);
            console.log('\n' + '=' .repeat(60));
            console.log('✨ Testing PASSED: Real AI provided beginner-level explanation');
          } else {
            console.log('Response:', response);
          }
        } catch (e) {
          console.log('Raw Response:', data);
        }

        resolve();
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request Failed:', error.message);
      if (error.code === 'ECONNREFUSED') {
        console.error('🔌 Connection Error: Backend not running on port 5001');
        console.error('   Start backend with: npm start (in backend directory)');
      }
      resolve();
    });

    req.on('timeout', () => {
      console.error('⏱️  Request Timeout');
      req.destroy();
      resolve();
    });

    req.setTimeout(30000);
    req.write(postData);
    req.end();
  });
}

// Test Case 2: More specific software testing question
async function testAdvancedQuestion() {
  console.log('\n\n🧪 TEST CASE 2: Path Testing Question');
  console.log('=' .repeat(60));
  console.log('📝 Question: What is path testing in software testing?');
  console.log('Expected: Beginner-friendly explanation with examples');
  console.log('=' .repeat(60));

  const postData = JSON.stringify({
    message: 'What is path testing and why is it important for software quality? Please explain like I\'m learning this for the first time.'
  });

  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5001,
      path: `/api/chat/test-doc-123`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length,
        'Authorization': 'Bearer test-token-123'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
        process.stdout.write('.');
      });

      res.on('end', () => {
        console.log('\n\n✅ Response Received!');
        console.log('Status Code:', res.statusCode);
        console.log('=' .repeat(60));

        try {
          const response = JSON.parse(data);
          if (response.response) {
            console.log('✅ SUCCESS: Got real Claude AI response!');
            console.log('\n📚 AI RESPONSE (Beginner Level):\n');
            console.log(response.response);
            console.log('\n' + '=' .repeat(60));
          } else if (response.error) {
            console.log('⚠️  Error:', response.error);
            console.log('Message:', response.message);
          }
        } catch (e) {
          console.log('Raw Response:', data);
        }

        resolve();
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request Failed:', error.message);
      resolve();
    });

    req.setTimeout(30000);
    req.write(postData);
    req.end();
  });
}

// Run all tests
async function runAllTests() {
  console.log('\n\n');
  console.log('╔' + '═'.repeat(58) + '╗');
  console.log('║' + ' '.repeat(10) + '🚀 CHAT BEGINNER-LEVEL TEST SUITE 🚀' + ' '.repeat(10) + '║');
  console.log('╚' + '═'.repeat(58) + '╝');
  console.log('\nTesting: Software Testing Education Chatbot');
  console.log('Backend: http://localhost:5001');
  console.log('Testing beginner-level AI responses...\n');

  await testChatWithSoftwareTesting();
  await testAdvancedQuestion();

  console.log('\n\n✨ Test Suite Completed!');
  console.log('📌 Check responses above to verify beginner-level explanations');
  console.log('📌 If you see "development mode response", the API key is not configured\n');
}

runAllTests().catch(console.error);
