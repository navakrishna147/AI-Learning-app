# 👨‍💻 Developer Reference Guide - AI Learning Assistant API

## 🎯 Quick API Reference

### **Core Endpoints Overview**

```
CHAT SYSTEM
├─ POST   /api/chat/:documentId          → Send message & get response
├─ GET    /api/chat/:documentId          → Get chat history
├─ GET    /api/chat/status               → Check AI service status
├─ DELETE /api/chat/:documentId          → Clear chat
└─ DELETE /api/chat/:documentId/permanent → End session

QUIZ SYSTEM
├─ POST   /api/quizzes/generate/:documentId  → Generate quiz
├─ GET    /api/quizzes/:documentId           → Get document quizzes
├─ GET    /api/quizzes/quiz/:id              → Get quiz with questions
├─ POST   /api/quizzes/:id/submit            → Submit answers & score
├─ GET    /api/quizzes/:id/results           → Get results
└─ GET    /api/quizzes/stats                 → Get user stats

FLASHCARD SYSTEM
├─ POST   /api/flashcards/generate/:documentId   → Generate flashcards
├─ GET    /api/flashcards/:documentId            → Get flashcards
├─ GET    /api/flashcards/sets                   → Get all sets
├─ PUT    /api/flashcards/:id/review             → Mark as reviewed
└─ GET    /api/flashcards/stats                  → Get stats

DOCUMENT SYSTEM
├─ POST   /api/documents/upload          → Upload document
├─ GET    /api/documents                 → List all documents
├─ GET    /api/documents/:id             → Get document details
├─ PUT    /api/documents/:id             → Update document
└─ DELETE /api/documents/:id             → Delete document

AUTHENTICATION
├─ POST   /api/auth/register             → User registration
├─ POST   /api/auth/login                → User login
├─ GET    /api/auth/validate             → Validate token
└─ POST   /api/auth/logout               → User logout

USER MANAGEMENT
├─ GET    /api/user/profile              → Get user profile
├─ PUT    /api/user/profile              → Update profile
├─ GET    /api/user/activity             → Get user activity
└─ GET    /api/user/stats                → Get learning stats
```

---

## 📤 Request/Response Examples

### **1. SEND CHAT MESSAGE**

#### **Request:**
```bash
POST http://localhost:50001/api/chat/61a1d2e3c4d5e6f7g8h9i0j1

Headers:
  Content-Type: application/json
  Authorization: Bearer {jwt_token}

Body:
{
  "message": "What is the main topic of this document?",
  "context": "recent"  // optional: "recent", "all", or message limit
}
```

#### **Response (Success):**
```javascript
{
  "success": true,
  "message": "The main topic of this document is machine learning and its applications in modern software development. The document covers...",
  "tokensUsed": 245,
  "chatId": "61a1d2e3c4d5e6f7g8h9i0j1",
  "messageId": "msg_1234567890",
  "timestamp": "2024-02-11T10:20:30.000Z",
  "sessionStats": {
    "totalMessages": 5,
    "userMessages": 3,
    "assistantMessages": 2,
    "totalTokensUsed": 1200
  }
}
```

#### **Response (Error):**
```javascript
{
  "success": false,
  "error": "API service temporarily unavailable",
  "code": "SERVICE_UNAVAILABLE",
  "fallbackMode": true,
  "message": "Using mock response: The document discusses important concepts..."
}
```

---

### **2. GET CHAT HISTORY**

#### **Request:**
```bash
GET http://localhost:50001/api/chat/61a1d2e3c4d5e6f7g8h9i0j1

Headers:
  Authorization: Bearer {jwt_token}

Query Parameters:
  ?limit=10       # Default: get last 10 messages
  ?skip=0         # For pagination
```

#### **Response:**
```javascript
{
  "success": true,
  "chatId": "61a1d2e3c4d5e6f7g8h9i0j1",
  "title": "Document Chat",
  "topic": "Machine Learning",
  "documentId": "61a1d2e3c4d5e6f7g8h9i0j1",
  "messages": [
    {
      "_id": "msg_001",
      "role": "user",
      "content": "What is machine learning?",
      "timestamp": "2024-02-11T10:20:00.000Z",
      "tokens": 15
    },
    {
      "_id": "msg_002",
      "role": "assistant",
      "content": "Machine learning is a subset of AI that enables...",
      "timestamp": "2024-02-11T10:20:10.000Z",
      "tokens": 230
    }
  ],
  "stats": {
    "totalMessages": 5,
    "userMessages": 3,
    "assistantMessages": 2,
    "totalTokensUsed": 1200
  }
}
```

---

### **3. GENERATE QUIZ**

#### **Request:**
```bash
POST http://localhost:50001/api/quizzes/generate/61a1d2e3c4d5e6f7g8h9i0j1

Headers:
  Content-Type: application/json
  Authorization: Bearer {jwt_token}

Body:
{
  "questionCount": 5,          // optional: 3-10
  "difficultyLevel": "basic",  // optional: basic, intermediate, advanced
  "focusAreas": ["concepts", "definitions"],  // optional
  "title": "Custom Title"      // optional
}
```

#### **Response (Success):**
```javascript
{
  "success": true,
  "quiz": {
    "_id": "quiz_1234567890",
    "user": "user_id",
    "document": "doc_id",
    "title": "Document Title - Quiz",
    "questions": [
      {
        "question": "What is the primary focus of machine learning?",
        "options": [
          "Creating human-like robots",
          "Enabling systems to learn from data",
          "Building web applications",
          "Managing databases"
        ],
        "correctAnswer": 1,
        "explanation": "Machine learning focuses on enabling systems to learn and improve from experience without being explicitly programmed. According to the document, this is achieved through..."
      }
    ],
    "score": 0,
    "completed": false,
    "createdAt": "2024-02-11T10:20:00.000Z"
  },
  "message": "Quiz generated successfully with 5 questions"
}
```

---

### **4. SUBMIT QUIZ ANSWERS**

#### **Request:**
```bash
POST http://localhost:50001/api/quizzes/61a1d2e3c4d5e6f7g8h9i0j1/submit

Headers:
  Content-Type: application/json
  Authorization: Bearer {jwt_token}

Body:
{
  "answers": [
    {
      "questionId": 0,
      "selectedAnswer": 1,
      "isCorrect": true
    },
    {
      "questionId": 1,
      "selectedAnswer": 2,
      "isCorrect": false
    },
    {
      "questionId": 2,
      "selectedAnswer": 1,
      "isCorrect": true
    }
  ]
}
```

#### **Response:**
```javascript
{
  "success": true,
  "quiz": {
    "_id": "quiz_1234567890",
    "score": 66,  // 2 out of 3 correct = 66.67%
    "completed": true,
    "results": {
      "totalQuestions": 3,
      "correctAnswers": 2,
      "incorrectAnswers": 1,
      "percentage": 66.67,
      "timing": {
        "startTime": "2024-02-11T10:20:00.000Z",
        "endTime": "2024-02-11T10:22:30.000Z",
        "duration": 150000  // milliseconds
      }
    },
    "feedback": [
      {
        "questionId": 0,
        "correct": true,
        "userAnswer": "Option B",
        "feedback": "Correct! Machine learning indeed focuses on learning from data."
      },
      {
        "questionId": 1,
        "correct": false,
        "userAnswer": "Option C",
        "correctAnswer": "Option B",
        "feedback": "Incorrect. The correct answer is Option B because..."
      }
    ]
  },
  "achievements": [
    {
      "name": "Quiz Master",
      "description": "Completed your first quiz!",
      "earnedAt": "2024-02-11T10:22:30.000Z"
    }
  ]
}
```

---

### **5. GENERATE FLASHCARDS**

#### **Request:**
```bash
POST http://localhost:50001/api/flashcards/generate/61a1d2e3c4d5e6f7g8h9i0j1

Headers:
  Content-Type: application/json
  Authorization: Bearer {jwt_token}

Body:
{
  "count": 10,           // optional: 5-20 flashcards
  "topic": "concepts",   // optional: concepts, definitions, examples
  "difficulty": "basic"  // optional: basic, intermediate, advanced
}
```

#### **Response:**
```javascript
{
  "success": true,
  "flashcards": [
    {
      "_id": "fc_001",
      "user": "user_id",
      "document": "doc_id",
      "question": "What is machine learning?",
      "answer": "Machine learning is a subset of artificial intelligence that enables computer systems to learn and improve from experience without being explicitly programmed. It works by analyzing patterns in data and making predictions based on those patterns.",
      "difficulty": "basic",
      "createdAt": "2024-02-11T10:20:00.000Z",
      "updatedAt": "2024-02-11T10:20:00.000Z"
    },
    {
      "_id": "fc_002",
      "user": "user_id",
      "document": "doc_id",
      "question": "Name three types of machine learning.",
      "answer": "The three main types are: 1) Supervised Learning - where data is labeled and the model learns to predict outputs, 2) Unsupervised Learning - where data is unlabeled and the model finds patterns, 3) Reinforcement Learning - where the model learns through rewards and penalties.",
      "difficulty": "basic",
      "createdAt": "2024-02-11T10:20:00.000Z"
    }
  ],
  "count": 10,
  "message": "Successfully generated 10 flashcards"
}
```

---

### **6. GET FLASHCARDS**

#### **Request:**
```bash
GET http://localhost:50001/api/flashcards/61a1d2e3c4d5e6f7g8h9i0j1

Headers:
  Authorization: Bearer {jwt_token}

Query Parameters:
  ?limit=20
  ?skip=0
  ?sortBy=createdAt  // or: updatedAt, difficulty
```

#### **Response:**
```javascript
{
  "success": true,
  "flashcards": [
    // Array of flashcard objects (as shown above)
  ],
  "total": 10,
  "limit": 20,
  "skip": 0,
  "documentId": "61a1d2e3c4d5e6f7g8h9i0j1"
}
```

---

## 🔑 Error Codes & Handling

### **Common Error Codes:**

```javascript
// Authentication Errors (401)
{
  "error": "Unauthorized",
  "code": "UNAUTHORIZED",
  "message": "Token expired or invalid. Please log in again."
}

// Validation Errors (400)
{
  "error": "Bad Request",
  "code": "VALIDATION_ERROR",
  "message": "Invalid message content. Length must be between 1 and 5000 characters."
}

// Not Found (404)
{
  "error": "Not Found",
  "code": "RESOURCE_NOT_FOUND",
  "message": "Document with ID xyz not found"
}

// Service Errors (503)
{
  "error": "Service Unavailable",
  "code": "SERVICE_UNAVAILABLE",
  "message": "AI service is temporarily down. Using fallback data.",
  "fallbackMode": true
}

// Server Errors (500)
{
  "error": "Internal Server Error",
  "code": "SERVER_ERROR",
  "message": "An unexpected error occurred. Please try again."
}
```

---

## 🔌 Frontend API Integration Examples

### **Using the Chat API in React:**

```javascript
// frontend/src/pages/DocumentDetail.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';

function Chat({ documentId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load chat history on mount
  useEffect(() => {
    const loadChat = async () => {
      try {
        const response = await api.get(`/chat/${documentId}`);
        setMessages(response.data.messages);
      } catch (err) {
        setError('Failed to load chat history');
      }
    };
    loadChat();
  }, [documentId]);

  // Send new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError('');

    try {
      // Add user message immediately (optimistic update)
      const userMessage = {
        role: 'user',
        content: input,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
      setInput('');

      // Send to API
      const response = await api.post(`/chat/${documentId}`, {
        message: input
      });

      // Add assistant response
      const assistantMessage = {
        role: 'assistant',
        content: response.data.message,
        timestamp: new Date(response.data.timestamp)
      };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
      // Remove user message if API failed
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
      </div>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSendMessage}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

export default Chat;
```

---

### **Using the Quiz API in React:**

```javascript
// frontend/src/pages/DocumentDetail.jsx - Quiz Modal
function QuizModal({ quizId, onClose, documentId }) {
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load quiz questions
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const response = await api.get(`/quizzes/quiz/${quizId}`);
        setQuiz(response.data.quiz);
        setAnswers(new Array(response.data.quiz.questions.length).fill(-1));
      } catch (err) {
        console.error('Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };
    loadQuiz();
  }, [quizId]);

  // Handle answer selection
  const handleSelectAnswer = (optionIndex) => {
    if (!submitted) {
      const newAnswers = [...answers];
      newAnswers[currentQuestion] = optionIndex;
      setAnswers(newAnswers);
    }
  };

  // Submit quiz
  const handleSubmit = async () => {
    try {
      const response = await api.post(`/quizzes/${quizId}/submit`, {
        answers: answers.map((ans, idx) => ({
          questionIndex: idx,
          selectedAnswer: ans
        }))
      });
      
      setSubmitted(true);
      // Show results or score
    } catch (err) {
      console.error('Failed to submit quiz');
    }
  };

  if (loading) return <div>Loading quiz...</div>;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>×</button>
        
        {!submitted ? (
          <>
            <h2>{quiz.title}</h2>
            <div className="question">
              <div className="question-number">
                Question {currentQuestion + 1} of {quiz.questions.length}
              </div>
              <p>{quiz.questions[currentQuestion].question}</p>
              
              <div className="options">
                {quiz.questions[currentQuestion].options.map((opt, idx) => (
                  <button
                    key={idx}
                    className={`option ${answers[currentQuestion] === idx ? 'selected' : ''}`}
                    onClick={() => handleSelectAnswer(idx)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="navigation">
              <button onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}>
                Previous
              </button>
              {currentQuestion === quiz.questions.length - 1 ? (
                <button onClick={handleSubmit}>Submit</button>
              ) : (
                <button onClick={() => setCurrentQuestion(currentQuestion + 1)}>
                  Next
                </button>
              )}
            </div>
          </>
        ) : (
          <QuizResults quiz={quiz} answers={answers} />
        )}
      </div>
    </div>
  );
}
```

---

## 🛠️ Configuration & Environment Setup

### **Backend .env Variables:**
```env
# API Keys
ANTHROPIC_API_KEY=sk-ant-...

# Database
MONGO_URI=mongodb://localhost:27017/ai-learning-assistant
MONGO_PASSWORD=your_password

# Server
NODE_ENV=development
PORT=50001
CORS_ORIGIN=http://localhost:5175

# AI Configuration
AI_MODEL=claude-3-5-sonnet-20241022
AI_MAX_TOKENS=2048
AI_TEMPERATURE=0.7
AI_MAX_DOCUMENT_LENGTH=100000

# Feature Flags
ENABLE_CHAT=true
ENABLE_QUIZ=true
ENABLE_FLASHCARDS=true
ENABLE_MOCK_FALLBACK=true
```

### **Frontend Configuration (vite.config.js):**
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    proxy: {
      '/api': {
        target: 'http://localhost:50001',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser'
  }
})
```

---

## 📚 Data Models Reference

### **Chat Model:**
```javascript
{
  _id: ObjectId,
  user: ObjectId,                    // Reference to User
  document: ObjectId,                // Reference to Document
  title: String,
  topic: String,
  messages: [{
    role: 'user' | 'assistant',
    content: String,
    timestamp: Date,
    tokens: Number
  }],
  isActive: Boolean,
  stats: {
    totalMessages: Number,
    userMessages: Number,
    assistantMessages: Number,
    totalTokensUsed: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

### **Quiz Model:**
```javascript
{
  _id: ObjectId,
  user: ObjectId,
  document: ObjectId,
  title: String,
  questions: [
    {
      question: String,
      options: [String, String, String, String],
      correctAnswer: Number,      // 0-3
      explanation: String,        // NEW!
      userAnswer: Number          // -1 if not answered
    }
  ],
  score: Number,        // 0-100
  completed: Boolean,
  timing: {
    startTime: Date,
    endTime: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

### **Flashcard Model:**
```javascript
{
  _id: ObjectId,
  user: ObjectId,
  document: ObjectId,
  question: String,
  answer: String,
  difficulty: 'basic' | 'intermediate' | 'advanced',
  reviewed: Boolean,
  reviewCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 Deployment Checklist

- [ ] Set NODE_ENV=production
- [ ] Set ANTHROPIC_API_KEY in production environment
- [ ] Configure MongoDB Atlas (or production DB)
- [ ] Update CORS_ORIGIN to production domain
- [ ] Run `npm run build` in frontend
- [ ] Set up proper error logging (Sentry, etc.)
- [ ] Enable HTTPS only
- [ ] Set up rate limiting
- [ ] Configure backup strategy
- [ ] Test all features in production
- [ ] Monitor API usage and costs
- [ ] Set up alerts for errors

---

**Last Updated:** February 11, 2026  
**API Version:** 1.0  
**Status:** Production Ready ✅
