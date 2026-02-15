# 🚀 Quick Start Guide - Running Your Application

## ⚡ 30-Second Quick Start

### Option 1: Test Everything (Recommended First)
```bash
# 1. Set API key
$env:GROQ_API_KEY="gsk_YOUR_GROQ_API_KEY_HERE"

# 2. Enter backend directory
cd backend

# 3. Run comprehensive feature test
node test-all-features.js

# Expected: All 6 tests PASS ✅
```

### Option 2: Start the Application
```bash
# 1. Set API key
$env:GROQ_API_KEY="gsk_YOUR_GROQ_API_KEY_HERE"

# 2. Start backend
cd backend
npm start

# 3. In another terminal, start frontend
cd frontend
npm start

# 4. Open browser to http://localhost:5173
```

---

## 📋 What Each Test Does

### Test All Features
```bash
node test-all-features.js
```
**Tests:**
- ✅ API Status Check
- ✅ Chat with Document
- ✅ Generate Summary
- ✅ Extract Concepts
- ✅ Generate Flashcards
- ✅ Generate Quiz

**Duration:** 30-60 seconds  
**Output:** Colored, formatted results with sample inputs/outputs

### Migration Verification
```bash
node test-groq-migration.js
```
**Tests:**
- ✅ API Key Configuration
- ✅ Basic feature validation
- ✅ Quick smoke test

**Duration:** 15-30 seconds  
**Output:** Pass/Fail status for each feature

---

## 🏃 Running the Backend

### Development Mode (with auto-reload)
```bash
cd backend
npm run dev
# or
nodemon server.js
```

### Production Mode
```bash
cd backend
npm start
```

**Expected Output:**
```
✅ AI Service: Groq initialised with model: llama-3.1-8b-instant
✅ MongoDB connected
✅ Server running on port 5000
```

---

## 🎯 Testing the Features

### Test 1: Upload a Document
1. Go to http://localhost:5173
2. Login with your credentials
3. Click "Upload Document"
4. Select a PDF or text file
5. Click "Upload"

### Test 2: Generate Summary
1. Click on your document
2. Click "Generate Summary"
3. Wait 3-7 seconds
4. See the summary appear ✅

### Test 3: Generate Flashcards
1. Click on your document
2. Click "Generate Flashcards"
3. Select number of cards (e.g., 10)
4. Wait 5-10 seconds
5. See flashcards with Q&A pairs ✅

### Test 4: Generate Quiz
1. Click on your document
2. Click "Generate Quiz"
3. Select number of questions (e.g., 10)
4. Wait 5-15 seconds
5. See quiz with multiple choice questions ✅

### Test 5: Extract Concepts
1. Click on your document
2. Click "Extract Concepts"
3. Wait 3-6 seconds
4. See key concepts extracted ✅

### Test 6: Chat with Document
1. Click on your document
2. Type a question (e.g., "What is the main topic?")
3. Press Send
4. Wait 2-5 seconds
5. See AI response ✅

---

## 🔧 Configuration Files

### Backend Configuration
**Location:** `backend/.env`

```env
# Set your API key (REQUIRED)
GROQ_API_KEY=gsk_your_api_key_here

# Other settings
MONGODB_URI=mongodb://localhost:27017/ai-learning-assistant
JWT_SECRET=your_secret_key
PORT=5000
```

### Frontend Configuration
**Location:** `frontend/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📊 Sample Test Input/Output

### Chat with Document
**Input:** "What are the three main types of machine learning?"
**Output:** 1,388 character response explaining supervised, unsupervised, and reinforcement learning

### Generate Summary
**Input:** A 592-word document on AI/ML
**Output:** 1,731 character summary in 6 paragraphs

### Extract Concepts
**Input:** Same document
**Output:** 13 key concepts with definitions

### Generate Flashcards
**Input:** Same document + count=5
**Output:** 5 JSON-formatted Q&A flashcards

### Generate Quiz
**Input:** Same document + count=5
**Output:** 5 multiple choice questions with explanations

---

## ✅ Verification Checklist

Run through this to verify everything works:

- [ ] Backend starts without errors
- [ ] API key is configured
- [ ] Test all features passes
- [ ] Can upload a document
- [ ] Can generate summary
- [ ] Can extract concepts
- [ ] Can create flashcards
- [ ] Can generate quiz
- [ ] Can chat with document

---

## 🚨 Troubleshooting

### Error: "GROQ_API_KEY not configured"
**Solution:** Set the environment variable before running
```bash
$env:GROQ_API_KEY="gsk_your_key_here"
```

### Error: "Cannot POST /api/chat"
**Solution:** Backend might not be running. Start it first:
```bash
cd backend
npm start
```

### Error: "Model not found"
**Solution:** Update model in `backend/services/aiService.js` line 7:
```javascript
const GROQ_MODEL = 'llama-3.1-8b-instant';
```

### Error: "Rate limit exceeded"
**Solution:** Wait 60 seconds and try again

### Database Connection Error
**Solution:** Make sure MongoDB is running
```bash
# On Windows
mongod

# On Mac
brew services start mongodb-community

# On Linux
sudo systemctl start mongod
```

---

## 📁 Project Structure

```
MERNAI/
├── backend/
│   ├── services/
│   │   └── aiService.js          ← AI features here
│   ├── controllers/
│   │   ├── chatController.js
│   │   ├── flashcardController.js
│   │   ├── quizController.js
│   │   └── documentController.js
│   ├── test-all-features.js      ← Run this to test
│   ├── test-groq-migration.js    ← Run this for quick test
│   ├── package.json
│   ├── .env                       ← Add API key here
│   └── server.js
├── frontend/
│   ├── src/
│   └── package.json
└── Documentation/
    ├── README_GROQ_MIGRATION.md
    ├── FEATURE_VERIFICATION_REPORT.md
    └── GROQ_DEVELOPER_REFERENCE.md
```

---

## 🎓 API Endpoints

All endpoints require authentication (JWT token)

### Documents
- `POST /api/documents` - Upload document
- `GET /api/documents` - Get all user documents
- `GET /api/documents/:id` - Get specific document
- `DELETE /api/documents/:id` - Delete document
- `GET /api/documents/:id/summary` - Get summary
- `GET /api/documents/:id/concepts` - Get concepts

### Chat
- `POST /api/chat/:documentId` - Chat with document
- `GET /api/chat/:documentId` - Get chat history

### Flashcards
- `POST /api/flashcards/generate/:documentId` - Generate flashcards
- `GET /api/flashcards/:documentId` - Get flashcards
- `DELETE /api/flashcards/:id` - Delete flashcard

### Quizzes
- `POST /api/quizzes/generate/:documentId` - Generate quiz
- `GET /api/quizzes/:documentId` - Get quizzes
- `DELETE /api/quizzes/:id` - Delete quiz

---

## 📈 Performance Tips

1. **Clear browser cache** - Sometimes helps with loading issues
2. **Use smaller documents** - Faster processing (under 10MB)
3. **Use llama-3.1-8b-instant model** - Faster than alternatives
4. **Batch requests** - Don't request everything at once
5. **Monitor Groq dashboard** - Check usage and quotas

---

## 🔄 Workflow Example

### Complete Workflow
```
1. Start Backend
   npm start

2. Start Frontend
   npm start

3. Login to Application
   Use your credentials

4. Upload Document
   Click "Upload PDF" → Select file

5. Generate Summary
   Click "Generate Summary" → View results

6. Extract Concepts
   Click "Extract Concepts" → Review concepts

7. Create Flashcards
   Click "Generate Flashcards" → Study

8. Take Quiz
   Click "Generate Quiz" → Test yourself

9. Chat with Content
   Ask questions about the document
```

---

## ✨ Expected Results

When everything is working:

✅ Backend starts: "Server running on port 5000"  
✅ Frontend loads: Application appears in browser  
✅ Test output: "All 6 tests passed"  
✅ Features work: Summary generates in ~5 seconds  
✅ Quiz generates: With proper multiple choice format  
✅ Flashcards created: With Q&A pairs in JSON format  
✅ Chat responds: With contextual answers in 2-5 seconds  

---

## 📚 Documentation Reference

| Document | Purpose |
|----------|---------|
| README_GROQ_MIGRATION.md | Overview & getting started |
| GROQ_DEVELOPER_REFERENCE.md | API details & examples |
| GROQ_SETUP_CONFIG.md | Setup & troubleshooting |
| FEATURE_VERIFICATION_REPORT.md | Test results & output |

---

## 🎯 Success Criteria

You'll know it's working when you see:

```
✅ Backend server running
✅ Frontend app loaded
✅ Can login successfully
✅ Can upload documents
✅ Can generate summaries (3-7 seconds)
✅ Can create flashcards (5-10 seconds)
✅ Can generate quizzes (5-15 seconds)
✅ Can extract concepts (3-6 seconds)
✅ Can chat with AI (2-5 seconds)
✅ All responses are properly formatted
✅ No errors in browser console
✅ No errors in server logs
```

---

## 🚀 You're All Set!

Everything is configured and ready. Just:

1. Set your Groq API key
2. Run the tests
3. Start the application
4. Test the features through the UI

---

**Status:** ✅ Ready to Go  
**Time to Setup:** < 5 minutes  
**Time to Test:** ~1 minute per feature  
**Production Ready:** YES  

🎉 **Happy Testing!** 🎉
