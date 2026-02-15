#!/usr/bin/env node

/**
 * Groq Migration Test Script
 * Tests all AI features work correctly with the new Groq API integration
 */

import aiService from './services/aiService.js';
import dotenv from 'dotenv';

dotenv.config();

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.bright}${colors.cyan}━━━ ${msg} ━━━${colors.reset}\n`)
};

// Test sample document
const sampleDocument = `
Machine Learning Fundamentals

Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed. It focuses on developing algorithms and statistical models that computers use to perform specific tasks.

Types of Machine Learning:
1. Supervised Learning: The algorithm learns from labeled training data
2. Unsupervised Learning: The algorithm finds patterns in unlabeled data
3. Reinforcement Learning: The algorithm learns through interaction with an environment

Key Concepts:
- Features: Input variables used in predictions
- Labels: Target output in supervised learning
- Model Training: Process of fitting a model to training data
- Overfitting: When a model learns noise instead of patterns
- Regularization: Technique to prevent overfitting

Applications:
Machine learning is used in various domains including computer vision, natural language processing, recommendation systems, fraud detection, and autonomous vehicles. These applications demonstrate the transformative potential of machine learning in solving real-world problems.
`;

const testSampleDoc = {
  title: 'Machine Learning Fundamentals',
  content: sampleDocument
};

async function testAPIStatus() {
  log.section('1. Testing API Status');
  
  const status = aiService.getAPIStatus();
  
  if (status.available) {
    log.success(`Groq API is configured`);
    log.info(`Provider: ${status.provider}`);
    log.info(`Model: ${status.model}`);
    log.info(`Status: ${status.status}`);
    return true;
  } else {
    log.error('Groq API is not configured!');
    log.warning('Ensure GROQ_API_KEY is set in .env file');
    return false;
  }
}

async function testChatWithDocument() {
  log.section('2. Testing Chat with Document');
  
  try {
    const question = 'What are the three main types of machine learning?';
    log.info(`Question: ${question}`);
    
    const answer = await aiService.generateAnswer(
      testSampleDoc.content,
      question,
      testSampleDoc.title
    );
    
    if (answer && answer.length > 0) {
      log.success('Chat response generated');
      log.info(`Response length: ${answer.length} characters`);
      log.info(`Preview: ${answer.substring(0, 100)}...`);
      return true;
    } else {
      log.error('Empty response from chat');
      return false;
    }
  } catch (error) {
    log.error(`Chat test failed: ${error.message}`);
    return false;
  }
}

async function testDocumentSummary() {
  log.section('3. Testing Document Summary Generation');
  
  try {
    const summary = await aiService.generateDocumentSummary(
      testSampleDoc.content,
      testSampleDoc.title
    );
    
    if (summary && summary.length > 0) {
      log.success('Summary generated successfully');
      log.info(`Summary length: ${summary.length} characters`);
      log.info(`Paragraphs: ${summary.split('\n\n').length}`);
      return true;
    } else {
      log.error('Empty summary generated');
      return false;
    }
  } catch (error) {
    log.error(`Summary test failed: ${error.message}`);
    return false;
  }
}

async function testExtractConcepts() {
  log.section('4. Testing Key Concepts Extraction');
  
  try {
    const concepts = await aiService.extractKeyConcepts(
      testSampleDoc.content,
      testSampleDoc.title
    );
    
    if (concepts && concepts.length > 0) {
      log.success(`Extracted ${concepts.length} key concepts`);
      concepts.slice(0, 3).forEach((concept, idx) => {
        log.info(`${idx + 1}. ${concept}`);
      });
      if (concepts.length > 3) {
        log.info(`... and ${concepts.length - 3} more`);
      }
      return true;
    } else {
      log.warning('No concepts extracted');
      return false;
    }
  } catch (error) {
    log.error(`Concept extraction test failed: ${error.message}`);
    return false;
  }
}

async function testFlashcards() {
  log.section('5. Testing Flashcard Generation');
  
  try {
    const count = 3; // Test with 3 cards for speed
    const flashcards = await aiService.generateFlashcards(
      testSampleDoc.content,
      testSampleDoc.title,
      count
    );
    
    if (flashcards && flashcards.length > 0) {
      log.success(`Generated ${flashcards.length} flashcards`);
      
      flashcards.slice(0, 2).forEach((card, idx) => {
        log.info(`\nFlashcard ${idx + 1}:`);
        log.info(`  Q: ${card.question.substring(0, 60)}...`);
        log.info(`  A: ${card.answer.substring(0, 60)}...`);
      });
      
      return true;
    } else {
      log.warning('No flashcards generated');
      return false;
    }
  } catch (error) {
    log.error(`Flashcard test failed: ${error.message}`);
    return false;
  }
}

async function testQuizGeneration() {
  log.section('6. Testing Quiz Generation');
  
  try {
    const count = 3; // Test with 3 questions for speed
    const questions = await aiService.generateQuizQuestions(
      testSampleDoc.content,
      testSampleDoc.title,
      count
    );
    
    if (questions && questions.length > 0) {
      log.success(`Generated ${questions.length} quiz questions`);
      
      const firstQ = questions[0];
      log.info(`\nSample Question:`);
      log.info(`  Q: ${firstQ.question.substring(0, 60)}...`);
      log.info(`  Options: ${firstQ.options.join(', ')}`);
      log.info(`  Correct Answer: ${firstQ.options[firstQ.correctAnswer]}`);
      
      return true;
    } else {
      log.warning('No quiz questions generated');
      return false;
    }
  } catch (error) {
    log.error(`Quiz generation test failed: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log(`\n${colors.bright}${colors.cyan}╔═══════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}║   Groq API Migration Test Suite       ║${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}╚═══════════════════════════════════════╝${colors.reset}\n`);

  const results = [];

  // Test 1: API Status
  const apiOk = await testAPIStatus();
  results.push({ test: 'API Status', passed: apiOk });
  
  if (!apiOk) {
    log.section('Migration Status');
    log.error('Cannot proceed without Groq API key');
    log.warning('Please ensure:');
    log.warning('1. GROQ_API_KEY is set in .env');
    log.warning('2. API key starts with "gsk_"');
    process.exit(1);
  }

  // Run all tests
  results.push({ test: 'Chat with Document', passed: await testChatWithDocument() });
  results.push({ test: 'Summary Generation', passed: await testDocumentSummary() });
  results.push({ test: 'Concept Extraction', passed: await testExtractConcepts() });
  results.push({ test: 'Flashcard Generation', passed: await testFlashcards() });
  results.push({ test: 'Quiz Generation', passed: await testQuizGeneration() });

  // Print summary
  log.section('Test Summary');
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.passed 
      ? `${colors.green}✓ PASS${colors.reset}` 
      : `${colors.red}✗ FAIL${colors.reset}`;
    console.log(`${status} ${result.test}`);
  });

  log.section('Results');
  if (passed === total) {
    log.success(`All ${total} tests passed!`);
    console.log(`\n${colors.bright}${colors.green}===== Migration Complete and Verified =====${colors.reset}\n`);
    process.exit(0);
  } else {
    log.warning(`${passed}/${total} tests passed`);
    log.error(`${total - passed} test(s) failed`);
    console.log(`\n${colors.bright}${colors.red}===== Some Tests Failed =====${colors.reset}\n`);
    process.exit(1);
  }
}

// Run the tests
runAllTests().catch(error => {
  log.error(`Test suite error: ${error.message}`);
  process.exit(1);
});
