# Groq API Migration - Developer Quick Reference

## 🎯 Quick Start

### 1. Environment Setup
```bash
# Set your Groq API key in .env
GROQ_API_KEY=gsk_your_api_key_here
```

### 2. Available AI Functions

#### Chat with Document
```javascript
import aiService from './services/aiService.js';

// Answer questions about a document
const answer = await aiService.generateAnswer(
  documentContent,      // string: Full document text
  question,             // string: User's question
  documentTitle         // string: Document title
);
```

#### Generate Summary
```javascript
const summary = await aiService.generateDocumentSummary(
  content,  // Document content
  title     // Document title
);
// Returns: 2-3 paragraph summary
```

#### Extract Key Concepts
```javascript
const concepts = await aiService.extractKeyConcepts(
  content,  // Document content
  title     // Document title
);
// Returns: Array of concept definitions
```

#### Generate Flashcards
```javascript
const flashcards = await aiService.generateFlashcards(
  content,  // Document content
  title,    // Document title
  10        // Number of cards (default: 10)
);
// Returns: [{ question: "...", answer: "..." }, ...]
```

#### Generate Quiz
```javascript
const questions = await aiService.generateQuizQuestions(
  content,  // Document content
  title,    // Document title
  10        // Number of questions (default: 10)
);
// Returns: [{
//   question: "...",
//   options: ["A", "B", "C", "D"],
//   correctAnswer: 0,
//   explanation: "..."
// }, ...]
```

#### Direct Chat with Messages
```javascript
const systemPrompt = aiService.generateSystemPrompt(
  documentContent,
  documentTitle
);

const response = await aiService.chatWithClaude(
  [
    { role: 'user', content: 'Your question here' },
    { role: 'assistant', content: 'Previous response' }
  ],
  systemPrompt
);
```

#### Check API Status
```javascript
if (aiService.isAPIKeyAvailable()) {
  const status = aiService.getAPIStatus();
  console.log(status);
  // {
  //   available: true,
  //   model: 'llama-3.1-8b-instant',
  //   provider: 'Groq',
  //   status: 'ready'
  // }
}
```

---

## 🔧 Configuration

### Available Models

```javascript
// In services/aiService.js, line 7:
const GROQ_MODEL = 'llama-3.1-8b-instant';

// Options:
// 'llama-3.1-8b-instant'      - Fast, good for real-time
// 'llama-3.1-70b-versatile'   - Powerful, better analysis
// 'llama-3.2-90b-vision-preview' - Advanced features
```

### Temperature Settings

```javascript
// Adjust in callGroq() function:
- temperature: 0.5  // More factual (Quiz)
- temperature: 0.7  // Balanced (Chat, Summary)
- temperature: 0.9  // More creative (Brainstorming)
```

### Token Limits

```javascript
// Adjust in callGroq() function:
- maxTokens: 1000   // Quick responses
- maxTokens: 2048   // Standard (default)
- maxTokens: 3000   // Long-form content
- maxTokens: 4096   // Maximum allowed
```

---

## 🛠️ Implementation Patterns

### Controller Integration
```javascript
import { generateFlashcards, isAPIKeyAvailable } from '../services/aiService.js';

export const generateFlashcards = async (req, res) => {
  try {
    if (!isAPIKeyAvailable()) {
      return res.status(503).json({
        success: false,
        message: 'AI service not configured'
      });
    }

    const { documentId } = req.params;
    const { count = 10 } = req.body;
    
    const document = await Document.findById(documentId);
    const flashcards = await generateFlashcards(
      document.content,
      document.title,
      count
    );

    res.json({ success: true, data: flashcards });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};
```

### Error Handling
```javascript
try {
  const result = await aiService.generateDocumentSummary(content, title);
} catch (error) {
  // Error messages are already sanitized
  // - Rate limit: "Please wait a minute..."
  // - Auth error: "Check your API key..."
  // - Server error: "AI service encountered error..."
  
  if (error.statusCode === 429) {
    // Handle rate limit
  } else if (error.statusCode === 503) {
    // Handle service unavailable
  }
  
  // User-friendly message ready to send to frontend
  res.status(error.statusCode).json({
    success: false,
    message: error.message
  });
}
```

---

## 📊 Response Structures

### Flashcards Response
```javascript
[
  {
    question: "What is machine learning?",
    answer: "Machine learning is a subset of AI that enables systems to learn from data..."
  },
  {
    question: "Name three types of ML",
    answer: "Supervised, Unsupervised, and Reinforcement Learning..."
  }
]
```

### Quiz Response
```javascript
[
  {
    question: "Which is a supervised learning algorithm?",
    options: ["Decision Trees", "K-Means", "Autoencoders", "DBSCAN"],
    correctAnswer: 0,  // Index of correct option
    explanation: "Decision Trees are supervised as they learn from labeled data..."
  }
]
```

### Concepts Response
```javascript
[
  "Machine Learning: Subset of AI for learning from data",
  "Supervised Learning: Learning with labeled training data",
  "Features: Input variables in predictions",
  ...
]
```

---

## 📈 API Usage Limits

### Rate Limits (RPM-based)
- Check Groq dashboard for your account limits
- Standard: 30 requests/minute per account
- Model may have different limits

### Token Counting
```javascript
// Rough estimate:
// English text: 1 token ≈ 4 characters
// Average document: 10,000 words ≈ 2,500 tokens

const estimateTokens = (text) => Math.ceil(text.length / 4);
```

### Cost Optimization
1. Truncate large documents (50KB max)
2. Use faster model for real-time chat
3. Cache summaries when possible
4. Batch requests if applicable

---

## 🧪 Testing

### Run Full Migration Test
```bash
cd backend
GROQ_API_KEY=gsk_your_key node test-groq-migration.js
```

### Test Individual Function
```javascript
import aiService from './services/aiService.js';

const testDoc = 'Your test document content...';
const summary = await aiService.generateDocumentSummary(testDoc, 'Test Doc');
console.log(summary);
```

---

## 🚀 Deployment

### Environment Variables
```bash
# Production
export GROQ_API_KEY="gsk_your_prod_key"

# Via .env file
GROQ_API_KEY=gsk_your_prod_key

# Via Docker
docker run -e GROQ_API_KEY=gsk_... your_app
```

### Monitoring
```javascript
// Log API status on startup
const status = aiService.getAPIStatus();
console.log('AI Service Status:', status);

// Check before operations
if (!aiService.isAPIKeyAvailable()) {
  console.warn('AI features disabled');
}
```

### Fallback Strategies
```javascript
// Option 1: Mock data
if (!isAPIKeyAvailable()) {
  return generateMockFlashcards(count);
}

// Option 2: User notification
if (!isAPIKeyAvailable()) {
  return res.status(503).json({
    message: 'AI features temporarily unavailable'
  });
}
```

---

## 🔍 Debugging

### Check API Connection
```javascript
const status = aiService.getAPIStatus();
console.log('Available:', status.available);
console.log('Model:', status.model);
console.log('Status:', status.status);
```

### Log API Calls
Add logging in `services/aiService.js`:
```javascript
console.log('📤 Calling Groq with:', {
  model: GROQ_MODEL,
  messages: messages.length,
  maxTokens,
  temperature
});
```

### Test API Key
```javascript
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

groq.chat.completions.create({
  model: 'llama-3.1-8b-instant',
  messages: [{ role: 'user', content: 'Hi' }]
})
.then(res => console.log('✓ API Connected'))
.catch(err => console.error('✗ API Error:', err.message));
```

---

## 📚 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Model decommissioned" | Update model in aiService.js line 7 |
| "Invalid API key" | Verify key format (gsk_...) and permissions |
| "Rate limit exceeded" | Wait 60s or upgrade API tier |
| "Empty response" | Increase maxTokens or check document format |
| "Authentication failed" | Check GROQ_API_KEY env variable |

---

## 📞 Support Resources

- **Groq Docs:** https://console.groq.com/docs
- **Models:** https://console.groq.com/docs/models
- **Rate Limits:** https://console.groq.com/limits
- **Issue Tracker:** Check test-groq-migration.js output

---

## ✅ Checklist Before Production

- [ ] GROQ_API_KEY set in environment
- [ ] All 6 tests passing
- [ ] Documents under 50KB processed correctly
- [ ] Error messages display properly
- [ ] Rate limiting handled gracefully
- [ ] Monitoring/logging configured
- [ ] Fallback strategies in place
- [ ] Documentation updated for team

---

**Last Updated:** February 13, 2026  
**Status:** Production Ready (llama-3.1-8b-instant)
