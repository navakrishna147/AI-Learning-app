# Quick Start Guide - Document Management & AI Chat

## 🚀 5-Minute Setup

### Step 1: Configure Environment Variables

Create `.env` file in the `backend` folder:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/lms-ai

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_here_change_this

# Claude AI API
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Server Configuration
PORT=5000
NODE_ENV=development
```

**Important**: Replace `sk-ant-...` with your actual Claude API key from Anthropic.

### Step 2: Start MongoDB

```bash
# Windows (if using MongoDB locally)
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env with your connection string
```

### Step 3: Start Backend Server

```bash
cd backend
npm install  # Only needed first time
npm start
```

Expected output:
```
✅ Server is running on port 5000
✅ Connected to MongoDB
http://localhost:5000/
```

### Step 4: Start Frontend

In a new terminal:

```bash
cd frontend
npm install  # Only needed first time
npm run dev
```

Expected output:
```
VITE v... ready in ... ms

➜  Local:   http://localhost:5173/
➜  Press h to show help
```

### Step 5: Test the Application

1. Open http://localhost:5173 in your browser
2. Go to signup, create a test account
3. Upload a PDF document
4. Go to the document detail page
5. Click on "Chat" tab
6. Ask a question about the document

---

## ✅ Verification Checklist

### Backend Running?
```bash
# In another terminal, test the API
curl http://localhost:5000/

# Expected response:
# {"message":"AI Learning Assistant API is running!"}
```

### AI Service Available?
```bash
# Check AI status
curl http://localhost:5000/api/chat/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected response includes:
# {"aiStatus":{"isAvailable":true},"apiAvailable":true}
```

### MongoDB Connected?
```bash
# Check if documents can be fetched
curl http://localhost:5000/api/documents \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Should return array of documents (may be empty on first run)
```

---

## 🧪 Testing Workflow

### 1. Document Upload Test ✅

```
1. Login to application
2. Click "Documents" → "Upload Document"
3. Select a PDF file (try a tutorial or article)
4. Enter title and description
5. Click "Upload"

Expected: Document appears in list with extracted info
```

### 2. AI Chat Test ✅

```
1. Click on uploaded document
2. Go to "Chat" tab
3. Ask a question, e.g., "What is this document about?"
4. Wait for AI response

Expected: AI responds with accurate information from document
```

### 3. AI Features Test ✅

```
1. In document detail, go to "AI" tab
2. Click "Generate Summary"
3. Click "Extract Concepts"
4. Click "Generate Flashcards"
5. Click "Generate Quiz"

Expected: Each feature generates content from the document
```

---

## 🔍 Troubleshooting

### ❌ "Cannot find module '@anthropic-ai/sdk'"

**Solution**: The package wasn't installed properly.

```bash
cd backend
npm install @anthropic-ai/sdk
npm start
```

### ❌ "AI service is not configured"

**Solution**: Claude API key is missing or invalid.

```bash
# 1. Check .env file has ANTHROPIC_API_KEY
cat backend/.env | grep ANTHROPIC_API_KEY

# 2. Verify key format (should start with sk-ant-)
# 3. Make sure you didn't miss any characters
# 4. Restart backend server: npm start
```

### ❌ "PDF extraction failed"

**Solution**: The PDF might be corrupted or not readable.

```bash
# Try uploading a different PDF file
# Make sure it's a valid PDF (not scanned image)
# Keep file size under 10MB
```

### ❌ "Cannot connect to MongoDB"

**Solution**: MongoDB service isn't running.

```bash
# Start MongoDB
mongod

# Or if using MongoDB Atlas, verify connection string in .env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lms-ai
```

### ❌ "Chat response is empty"

**Solution**: Document might not have text or API error occurred.

```bash
# 1. Check document content in detail page
# 2. Verify API key is working: check /api/chat/status
# 3. Check server logs for errors
# 4. Make sure you have Claude API credits
```

### ❌ "Port 5000 already in use"

**Solution**: Another service is using port 5000.

```bash
# Use a different port
PORT=5001 npm start

# Then update frontend to use http://localhost:5001
```

---

## 📊 System Architecture

```
┌─────────────────────────────────────────┐
│          Frontend (React)                │
│  - Document Upload                      │
│  - Chat Interface                       │
│  - Document Management                  │
└──────────────┬──────────────────────────┘
               │ HTTP/REST
┌──────────────▼──────────────────────────┐
│          Backend (Express)              │
│  - API Routes                           │
│  - Document Controller                  │
│  - Chat Controller                      │
│  - Document Service (PDF extract)       │
│  - AI Service (Claude integration)      │
└──────────────┬──────────────────────────┘
               │ Database Driver
┌──────────────▼──────────────────────────┐
│         MongoDB                         │
│  - Users Collection                     │
│  - Documents Collection                 │
│  - Chat Collection                      │
│  - Activities Collection                │
└─────────────────────────────────────────┘

               │ API Call
┌──────────────▼──────────────────────────┐
│       Claude API (Anthropic)            │
│  - chatWithClaude                       │
│  - generateSummary                      │
│  - extractConcepts                      │
└─────────────────────────────────────────┘
```

---

## 🎯 Key Features Summary

### Document Management
- ✅ PDF upload with automatic text extraction
- ✅ Content cleaning and normalization
- ✅ Document categorization and tagging
- ✅ Sharing controls (Private/Shared/Public)
- ✅ Full-text search
- ✅ View count and usage statistics

### AI Chat
- ✅ Context-aware conversations
- ✅ Real-time streaming responses
- ✅ Session management with history
- ✅ Token usage tracking
- ✅ AI status monitoring
- ✅ Error recovery

### Study Tools
- ✅ Flashcard generation
- ✅ Quiz generation
- ✅ Summary generation
- ✅ Concept extraction

---

## 🔐 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing (bcrypt)
- ✅ Protected API routes
- ✅ File upload validation
- ✅ Authorization checks per document
- ✅ Activity logging and audit trail

---

## 📈 Performance Tips

1. **Large Documents**: System automatically chunks text for API limits
2. **Chat History**: Use pagination for long conversations
3. **Search**: Indexed fields for fast queries
4. **Uploads**: Max 10MB per file for reliability

---

## 🆘 Getting Help

### Check Logs
```bash
# Backend logs show detailed information
# Look for:
# - ❌ Error messages with red color
# - ⚠️ Warning messages
# - ✅ Success indicators

# Enable detailed logging:
NODE_ENV=development npm start
```

### Common Error Patterns

| Error | Likely Cause | Solution |
|-------|---|----------|
| 401 Unauthorized | No token or invalid token | Login again |
| 404 Not Found | Document doesn't exist or wrong ID | Verify document exists |
| 503 Service Unavailable | AI service down | Check API key and credits |
| ENOENT (file not found) | Upload directory missing | Check /uploads folder exists |

---

## 🎓 Example Test Prompts

After uploading a document, try these chat prompts:

```
"What is the main topic of this document?"
"Summarize this in one paragraph"
"What are the 3 key points?"
"Explain this concept in simple terms"
"What questions does this document answer?"
"Can you break down this topic step by step?"
```

---

## 📱 Browser Support

- ✅ Chrome/Chromium (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## ✨ Next Steps After Setup

1. ✅ Upload a sample document
2. ✅ Test AI chat functionality
3. ✅ Try all AI features (summary, concepts, flashcards)
4. ✅ Test document sharing
5. ✅ Run performance checks

---

## 🚨 Need Help?

If something isn't working:

1. **Check Error Messages**: Read the detailed error in console/logs
2. **Verify Setup**: Go through the 5-minute setup again
3. **Restart Services**: Stop (Ctrl+C) and restart both servers
4. **Clear Cache**: Hard refresh browser (Ctrl+Shift+R)
5. **Check Connection**: Verify backend is running on port 5000

---

## 📝 Development Tips

### Hot Reload
- Backend: Restart server for changes (or use nodemon)
- Frontend: Automatically reloads on save

### Debug Mode
```bash
# Backend with detailed logging
DEBUG=* npm start

# Frontend in browser console
localStorage.debug = '*'
```

### Test API Endpoints
```bash
# Use curl or Postman
curl -X POST http://localhost:5000/api/chat/DOC_ID \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'
```

---

## 🎉 Success Indicators

You'll know everything is working when:

- ✅ Backend shows "Connected to MongoDB"
- ✅ Frontend loads without console errors
- ✅ You can upload a PDF
- ✅ Chat responds with AI answers
- ✅ Generate buttons create content
- ✅ No red error messages anywhere

**Congratulations! You're all set! 🚀**

---

## 📚 Additional Resources

- [Claude API Documentation](https://docs.anthropic.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Express.js Guide](https://expressjs.com)
- [React Documentation](https://react.dev)

---

**Version**: 1.0 | **Last Updated**: 2024 | **Status**: Ready for Production ✅
