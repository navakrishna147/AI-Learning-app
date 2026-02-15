#!/usr/bin/env node

/**
 * Complete AI Features Test
 * Tests all AI features with a real sample document
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
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

const log = {
  header: (msg) => console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}`),
  title: (msg) => console.log(`${colors.bright}${colors.blue}📌 ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.bright}${colors.magenta}▶ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  output: (msg) => console.log(`${colors.blue}${msg}${colors.reset}`),
  divider: () => console.log(`${colors.cyan}${'-'.repeat(60)}${colors.reset}`)
};

// Sample academic document
const sampleDocument = `
ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING: TRANSFORMING EDUCATION

1. INTRODUCTION TO AI IN EDUCATION

Artificial Intelligence (AI) is revolutionizing the education sector by providing personalized learning experiences, automating administrative tasks, and offering real-time feedback to students. Machine Learning (ML), a subset of AI, enables systems to learn from data without being explicitly programmed.

The integration of AI in educational systems has shown remarkable potential in improving student outcomes, reducing teacher workload, and making quality education more accessible to learners worldwide. According to recent studies, AI-powered tutoring systems can increase student engagement by up to 40% and improve learning outcomes significantly.

2. KEY CONCEPTS IN MACHINE LEARNING

2.1 SUPERVISED LEARNING
Supervised learning is a machine learning technique where the algorithm learns from labeled training data. Each training example consists of input features and a corresponding output label. Common applications include:
- Classification (predicting categories)
- Regression (predicting continuous values)
- Examples: Decision Trees, Support Vector Machines, Neural Networks

2.2 UNSUPERVISED LEARNING
Unlike supervised learning, unsupervised learning works with unlabeled data. The algorithm discovers hidden patterns and structures in the data. Applications include:
- Clustering (grouping similar data points)
- Dimensionality Reduction
- Anomaly Detection
- Examples: K-Means, Hierarchical Clustering, Principal Component Analysis

2.3 REINFORCEMENT LEARNING
Reinforcement learning involves an agent learning from interactions with an environment. The agent receives rewards or penalties based on its actions, aiming to maximize cumulative rewards over time. This approach is popular in:
- Game AI
- Robotics
- Autonomous Systems

3. NEURAL NETWORKS AND DEEP LEARNING

Neural Networks are inspired by biological neurons and form the foundation of Deep Learning. A neural network consists of:
- Input Layer: Receives input features
- Hidden Layers: Perform computations and extract features
- Output Layer: Produces predictions

Deep Learning extends neural networks with multiple hidden layers, enabling the system to learn hierarchical representations of data. Convolutional Neural Networks (CNNs) excel at image recognition, while Recurrent Neural Networks (RNNs) are ideal for sequential data processing.

4. APPLICATIONS OF AI IN EDUCATION

4.1 PERSONALIZED LEARNING
AI systems analyze student performance data and adapt learning materials in real-time. Each student receives customized learning paths based on their pace, learning style, and preferences.

4.2 INTELLIGENT TUTORING SYSTEMS
AI-powered tutors provide one-on-one guidance, answer questions, and identify knowledge gaps. These systems can operate 24/7, providing consistent support to students.

4.3 AUTOMATED GRADING
AI can automatically grade assignments and exams, providing instant feedback to students. This reduces teacher workload and allows educators to focus on higher-level interactions.

4.4 PREDICTIVE ANALYTICS
Educational institutions use AI to predict student dropout risks, identify struggling learners, and recommend interventions before students fall behind.

5. CHALLENGES AND ETHICAL CONSIDERATIONS

While AI in education offers tremendous benefits, several challenges must be addressed:
- Data Privacy: Protecting student data is crucial
- Bias in Algorithms: AI systems must be fair and unbiased
- Teacher Displacement: Proper training and support for educators
- Digital Divide: Ensuring equitable access to AI-powered tools
- Transparency: Making AI decisions interpretable to stakeholders

6. FUTURE TRENDS

The future of AI in education includes:
- Adaptive Learning Platforms: More sophisticated personalization
- Virtual Reality Integration: Immersive learning experiences
- Emotional Intelligence: AI recognizing student emotions and adjusting support
- Collaborative AI: Teachers and AI working together seamlessly
- Lifelong Learning Support: AI enabling continuous education throughout life

CONCLUSION

Artificial Intelligence and Machine Learning are transforming education by making it more accessible, personalized, and effective. As these technologies continue to evolve, educators and technologists must work together to ensure responsible implementation that benefits all learners while addressing ethical concerns.
`;

const testDocument = {
  title: 'Artificial Intelligence and Machine Learning in Education',
  content: sampleDocument
};

async function testAPIStatus() {
  log.section('1. Checking API Status');
  
  const status = aiService.getAPIStatus();
  
  if (!status.available) {
    log.error('Groq API is not configured!');
    log.warning('Ensure GROQ_API_KEY is set in .env file');
    return false;
  }
  
  log.success('Groq API is configured and ready');
  log.info(`Provider: ${status.provider}`);
  log.info(`Model: ${status.model}`);
  log.info(`Status: ${status.status}`);
  log.divider();
  
  return true;
}

async function testChatWithDocument() {
  log.section('2. Testing Chat with Document');
  
  try {
    const question = 'What are the three main types of machine learning mentioned in this document?';
    log.info(`Question: "${question}"`);
    log.divider();
    
    const answer = await aiService.generateAnswer(
      testDocument.content,
      question,
      testDocument.title
    );
    
    if (answer && answer.length > 0) {
      log.success('Chat response generated successfully');
      log.info(`Response length: ${answer.length} characters`);
      log.output(`\n📝 Answer:\n${answer}\n`);
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

async function testGenerateSummary() {
  log.section('3. Testing Generate Summary');
  
  try {
    log.info('Generating comprehensive summary...');
    log.divider();
    
    const summary = await aiService.generateDocumentSummary(
      testDocument.content,
      testDocument.title
    );
    
    if (summary && summary.length > 0) {
      log.success('Summary generated successfully');
      log.info(`Summary length: ${summary.length} characters`);
      log.info(`Paragraphs: ${summary.split('\n\n').length}`);
      log.output(`\n📋 Summary:\n${summary}\n`);
      return true;
    } else {
      log.error('Empty summary generated');
      return false;
    }
  } catch (error) {
    log.error(`Summary generation failed: ${error.message}`);
    return false;
  }
}

async function testExtractConcepts() {
  log.section('4. Testing Extract Key Concepts');
  
  try {
    log.info('Extracting key concepts from document...');
    log.divider();
    
    const concepts = await aiService.extractKeyConcepts(
      testDocument.content,
      testDocument.title
    );
    
    if (concepts && concepts.length > 0) {
      log.success(`Extracted ${concepts.length} key concepts`);
      log.output('\n🎯 Key Concepts:');
      concepts.forEach((concept, idx) => {
        log.output(`  ${idx + 1}. ${concept}`);
      });
      log.output('');
      return true;
    } else {
      log.warning('No concepts extracted');
      return false;
    }
  } catch (error) {
    log.error(`Concept extraction failed: ${error.message}`);
    return false;
  }
}

async function testGenerateFlashcards() {
  log.section('5. Testing Generate Flashcards');
  
  try {
    const count = 5; // Generate 5 flashcards for demo
    log.info(`Generating ${count} flashcards...`);
    log.divider();
    
    const flashcards = await aiService.generateFlashcards(
      testDocument.content,
      testDocument.title,
      count
    );
    
    if (flashcards && flashcards.length > 0) {
      log.success(`Generated ${flashcards.length} flashcards`);
      log.output('\n🎴 Flashcards:');
      
      flashcards.forEach((card, idx) => {
        log.output(`\n  Flashcard ${idx + 1}:`);
        log.output(`  Q: ${card.question}`);
        log.output(`  A: ${card.answer}`);
      });
      log.output('');
      
      // Validate JSON structure
      log.info('JSON Structure Validation:');
      flashcards.forEach((card, idx) => {
        const hasQuestion = card.question && card.question.trim().length > 0;
        const hasAnswer = card.answer && card.answer.trim().length > 0;
        const status = (hasQuestion && hasAnswer) ? '✓' : '✗';
        log.info(`  Card ${idx + 1}: ${status}`);
      });
      
      return true;
    } else {
      log.warning('No flashcards generated');
      return false;
    }
  } catch (error) {
    log.error(`Flashcard generation failed: ${error.message}`);
    return false;
  }
}

async function testGenerateQuiz() {
  log.section('6. Testing Generate Quiz');
  
  try {
    const count = 5; // Generate 5 questions for demo
    log.info(`Generating ${count} quiz questions...`);
    log.divider();
    
    const questions = await aiService.generateQuizQuestions(
      testDocument.content,
      testDocument.title,
      count
    );
    
    if (questions && questions.length > 0) {
      log.success(`Generated ${questions.length} quiz questions`);
      log.output('\n❓ Quiz Questions:');
      
      questions.forEach((q, idx) => {
        log.output(`\n  Question ${idx + 1}: ${q.question}`);
        log.output(`  Options:`);
        q.options.forEach((opt, optIdx) => {
          const marker = optIdx === q.correctAnswer ? ' ✓ (Correct)' : '';
          log.output(`    ${String.fromCharCode(65 + optIdx)}) ${opt}${marker}`);
        });
        if (q.explanation) {
          log.output(`  Explanation: ${q.explanation}`);
        }
      });
      log.output('');
      
      // Validate JSON structure
      log.info('JSON Structure Validation:');
      const allValid = questions.every(q => 
        q.question && 
        q.options && 
        q.options.length === 4 && 
        typeof q.correctAnswer === 'number' &&
        q.correctAnswer >= 0 && q.correctAnswer < 4
      );
      log.info(`  All questions valid: ${allValid ? '✓' : '✗'}`);
      
      return true;
    } else {
      log.warning('No quiz questions generated');
      return false;
    }
  } catch (error) {
    log.error(`Quiz generation failed: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log(`\n${colors.bright}${colors.cyan}╔═══════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}║  COMPLETE AI FEATURES VERIFICATION    ║${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}║  Testing All Functions with Sample    ║${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}║  Document on Groq API                 ║${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}╚═══════════════════════════════════════╝${colors.reset}\n`);

  log.title('Sample Document: AI and Machine Learning in Education');
  log.info(`Document length: ${testDocument.content.length} characters`);
  log.info(`Word count: ${testDocument.content.split(/\s+/).length} words`);
  log.header();

  const results = [];

  // Run all tests
  results.push({ test: 'API Status', passed: await testAPIStatus() });
  if (!results[0].passed) {
    log.error('Cannot proceed without Groq API');
    process.exit(1);
  }

  results.push({ test: 'Chat with Document', passed: await testChatWithDocument() });
  results.push({ test: 'Generate Summary', passed: await testGenerateSummary() });
  results.push({ test: 'Extract Concepts', passed: await testExtractConcepts() });
  results.push({ test: 'Generate Flashcards', passed: await testGenerateFlashcards() });
  results.push({ test: 'Generate Quiz', passed: await testGenerateQuiz() });

  // Summary
  log.header();
  log.section('FINAL RESULTS');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.passed 
      ? `${colors.green}✓ PASS${colors.reset}` 
      : `${colors.red}✗ FAIL${colors.reset}`;
    console.log(`${status} ${result.test}`);
  });

  log.divider();
  
  if (passed === total) {
    log.success(`All ${total} tests passed!`);
    console.log(`\n${colors.bright}${colors.green}═════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bright}${colors.green}✨ ALL AI FEATURES WORKING PERFECTLY ✨${colors.reset}`);
    console.log(`${colors.bright}${colors.green}═════════════════════════════════════════${colors.reset}\n`);
    process.exit(0);
  } else {
    log.warning(`${passed}/${total} tests passed`);
    log.error(`${total - passed} test(s) failed`);
    console.log(`\n${colors.bright}${colors.red}═════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bright}${colors.red}Some Tests Failed - Please Review${colors.reset}`);
    console.log(`${colors.bright}${colors.red}═════════════════════════════════════════${colors.reset}\n`);
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  log.error(`Test suite error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
