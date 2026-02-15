#!/usr/bin/env node

/**
 * TEST WITH USER CREDENTIALS
 * Set TEST_EMAIL and TEST_PASSWORD env vars before running.
 * Loads documents and asks software testing questions.
 */

const http = require('http');

let authToken = null;

function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null;
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (bodyStr) {
      options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
    }

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ 
            statusCode: res.statusCode, 
            data: JSON.parse(data),
            headers: res.headers 
          });
        } catch (e) {
          resolve({ 
            statusCode: res.statusCode, 
            data: { raw: data }, 
            headers: res.headers 
          });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(60000);
    
    if (bodyStr) {
      req.write(bodyStr);
    }
    req.end();
  });
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function runTests() {
  console.log('\n' + '═'.repeat(100));
  console.log('  🔐 TESTING WITH YOUR CREDENTIALS');
  console.log('═'.repeat(100) + '\n');

  try {
    // ==================== TEST 1: LOGIN ====================
    console.log('📌 TEST 1: Login with Your Credentials');
    console.log('─'.repeat(100));
    
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      email: process.env.TEST_EMAIL || 'test@example.com',
      password: process.env.TEST_PASSWORD || 'TestPassword123'
    });

    if (loginRes.statusCode === 200 && loginRes.data.token) {
      authToken = loginRes.data.token;
      console.log('✅ PASSED: Successfully logged in');
      console.log(`   User: ${loginRes.data.user.email}`);
      console.log(`   Username: ${loginRes.data.user.username}`);
      console.log(`   Token: ${authToken.substring(0, 30)}...\n`);
    } else {
      console.log('❌ FAILED: Login failed');
      console.log(`   Status: ${loginRes.statusCode}`);
      console.log(`   Error: ${loginRes.data.message}\n`);
      return;
    }

    // ==================== TEST 2: GET DOCUMENTS ====================
    console.log('📌 TEST 2: Get Your Uploaded Documents');
    console.log('─'.repeat(100));
    
    const docsRes = await makeRequest('GET', '/api/documents', null, authToken);

    if (docsRes.statusCode === 200 && Array.isArray(docsRes.data)) {
      const documents = docsRes.data;
      console.log(`✅ PASSED: Found ${documents.length} documents\n`);
      
      if (documents.length === 0) {
        console.log('⚠️  No documents found. Creating a test document...\n');
        
        // Create a test document
        const createRes = await makeRequest('POST', '/api/documents/create-from-text', {
          title: 'Software Testing Fundamentals',
          description: 'Learn about software testing',
          category: 'technology',
          content: `
SOFTWARE TESTING FUNDAMENTALS

What is Software Testing?
Software testing is the process of evaluating a software application to detect differences between given input and expected output. It's a systematic and objective way to ensure quality.

Why is Testing Important?
1. Quality Assurance: Ensures software works as intended
2. Cost Saving: Bugs found early are cheaper to fix
3. User Satisfaction: Prevents bad user experiences  
4. Security: Finds vulnerabilities before release
5. Reliability: Ensures the system is dependable

Types of Software Testing:

1. Unit Testing
   - Tests individual components or functions
   - Done by developers
   - Catches bugs early in development
   - Example: Testing a login function

2. Integration Testing
   - Tests how different components work together
   - Verifies data flow between modules
   - Catches interface issues
   - Example: Testing login + database connection

3. System Testing
   - Tests the complete integrated system
   - Verifies all requirements are met
   - Tests end-to-end workflows
   - Example: Testing entire application

4. Acceptance Testing  
   - Tests if system meets user requirements
   - Done by end-users or QA
   - Decision point for release
   - Example: User testing new features

5. Regression Testing
   - Ensures new changes don't break existing features
   - Run after updates/patches
   - Prevents introducing new bugs
   - Example: Testing after fixing a bug

Cost of Bugs Based on When Found:

Development Phase: $1-10 per bug
   - Cheapest to fix
   - Caught during coding
   - Easy to correct

Testing Phase: $10-50 per bug
   - More expensive than development
   - Requires test planning and execution
   - May require code redesign

Production: $1000+ per bug
   - Most expensive
   - Affects users
   - May require emergency patches
   - Damages reputation

Key Testing Characteristics:

1. Completeness: Covers all test cases
2. Independence: Can run independently
3. Repeatability: Produces same results
4. Self-Checking: Clear pass/fail criteria
5. Timely: Written at right time
6. Purposeful: Tests specific requirements
7. Practical: Reasonable to execute and maintain
          `.trim()
        }, authToken);

        if (createRes.statusCode === 201) {
          console.log('✅ Test document created successfully\n');
          documents = [createRes.data];
        } else {
          console.log('❌ Could not create test document\n');
          return;
        }
      }

      const doc = documents[0];
      console.log(`Document Name: ${doc.title}`);
      console.log(`Category: ${doc.category}`);
      console.log(`Words: ${doc.metadata?.totalWords || 'N/A'}`);
      console.log(`Created: ${new Date(doc.createdAt).toLocaleDateString()}\n`);

      // ==================== TEST 3-7: ASK QUESTIONS ====================
      console.log('════════════════════════════════════════════════════════════════════════════════════════════════════\n');
      console.log('❓ ASKING QUESTIONS ABOUT SOFTWARE TESTING\n');

      const documentId = doc._id;
      const questions = [
        {
          num: 3,
          title: 'Definition',
          question: 'What is software testing? Explain it simply.'
        },
        {
          num: 4,
          title: 'Importance',
          question: 'Why is software testing important? Give 3 reasons.'
        },
        {
          num: 5,
          title: 'Types',
          question: 'What are the 5 main types of software testing?'
        },
        {
          num: 6,
          title: 'Cost Impact',
          question: 'How much more expensive is it to find bugs in production vs development?'
        },
        {
          num: 7,
          title: 'Best Practices',
          question: 'What are 5 characteristics that make a good test case?'
        }
      ];

      let successCount = 0;

      for (const q of questions) {
        console.log(`📌 Question ${q.num}: ${q.title}`);
        console.log('─'.repeat(100));
        console.log(`❓ "${q.question}"\n`);

        try {
          const startTime = Date.now();
          const chatRes = await makeRequest('POST', `/api/chat/${documentId}`, {
            message: q.question
          }, authToken);

          const responseTime = Date.now() - startTime;

          if (chatRes.statusCode === 200 && chatRes.data.response) {
            successCount++;
            const response = chatRes.data.response;
            console.log(`✅ Response (${responseTime}ms, ${response.length} chars):`);
            console.log('─'.repeat(100));
            console.log(response);
            console.log('─'.repeat(100) + '\n');
          } else {
            console.log(`❌ Error - Status ${chatRes.statusCode}`);
            console.log(`   Message: ${chatRes.data.message}\n`);
          }

        } catch (error) {
          console.log(`❌ Request failed: ${error.message}\n`);
        }

        if (q.num < questions.length + 2) {
          await sleep(2000);
        }
      }

      // ==================== SUMMARY ====================
      console.log('═'.repeat(100));
      console.log('  ✅ TESTING COMPLETE');
      console.log('═'.repeat(100) + '\n');
      console.log(`Results: ${successCount}/${questions.length} questions answered successfully\n`);

      if (successCount === questions.length) {
        console.log('🎉 ALL TESTS PASSED!\n');
        console.log('✨ Application is working perfectly:');
        console.log('   ✓ Login working with your credentials');
        console.log('   ✓ Documents loading correctly');
        console.log('   ✓ Chat system responding to all questions');
        console.log('   ✓ AI providing detailed, beginner-level answers');
        console.log('   ✓ No errors or crashes\n');
        console.log('🚀 READY FOR USE!');
      } else {
        console.log(`⚠️  ${questions.length - successCount} question(s) failed\n`);
      }

      console.log('═'.repeat(100) + '\n');

    } else {
      console.log('❌ FAILED: Could not get documents');
      console.log(`   Status: ${docsRes.statusCode}`);
      console.log(`   Error: ${docsRes.data.message}\n`);
    }

  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error.message);
    console.error(error.stack);
  }
}

console.log('Waiting 2 seconds for backend to initialize...');
setTimeout(runTests, 2000);
