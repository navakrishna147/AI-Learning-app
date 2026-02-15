# Document Management & AI Chat Implementation Guide

## Overview
This guide covers the complete implementation of Document Management with PDF processing, text extraction, and AI-powered conversations using Claude Sonnet 3.5 API.

## ✅ Architecture & Features

### Backend Services
1. **aiService.js** - Claude API Integration
   - Streaming and non-streaming chat responses
   - Document summarization
   - Question generation from content
   - Answer generation based on document context
   - Key concept extraction
   - API availability checking
   - Comprehensive error handling

2. **documentService.js** - Document Processing Pipeline
   - PDF text extraction with page counting
   - Text cleaning and normalization
   - Content validation
   - Statistics generation (words, sentences, paragraphs, reading time)
   - Text chunking for API limits
   - Keyword extraction
   - File size formatting
   - Comprehensive processing pipeline

### Database Models
1. **Document.js** - Enhanced with 40+ fields
   - Basic metadata (title, description, filename, filepath, filesize)
   - Content organization (category, tags, access levels)
   - Sharing settings (user-based access control)
   - Content analysis (summary, keywords, statistics)
   - Usage tracking (viewCount, chatSessionsCount, lastAccessed)
   - Full-text search capability
   - Automatic statistics methods

2. **Chat.js** - Comprehensive Session Management
   - Session tracking with active/inactive states
   - Message history with role-based organization
   - Token usage tracking per message
   - Session statistics (totalMessages, averageResponseTime)
   - Adjustable settings (temperature, maxTokens, context window)
   - Helper methods for message recording and session management

### API Endpoints

#### Document Management
```
POST   /api/documents              - Upload document with AI processing
GET    /api/documents              - List documents with filtering
GET    /api/documents/:id          - Get full document content
PUT    /api/documents/:id          - Update document metadata
DELETE /api/documents/:id          - Delete document and cleanup
GET    /api/documents/:id/stats    - Get document statistics
POST   /api/documents/:id/summary  - Generate AI summary
POST   /api/documents/:id/concepts - Extract key concepts
```

#### Chat System
```
POST   /api/chat/:documentId           - Send message to AI
GET    /api/chat/:documentId           - Get chat history (paginated)
GET    /api/chat                       - Get all chat sessions
DELETE /api/chat/:documentId           - End chat session (preserve history)
DELETE /api/chat/:documentId/permanent - Permanently delete session
GET    /api/chat/status                - Check AI service status
```

### Frontend Components

#### Chat.jsx - AI Chat Interface
- Real-time message streaming
- Message history display
- AI status indicator
- Session management (start/end chat)
- Error handling with retry logic
- Token usage display
- Loading states and animations

#### DocumentDetail.jsx - Enhanced Document View
- Multiple tabs: Content, Chat, AI, Flashcards, Quizzes
- Document statistics dashboard
- AI features integration (summary, concepts, flashcards, quizzes)
- Embedded chat interface
- Document preview and metadata

## 🔧 Environment Setup

### Required Environment Variables (.env)
```
# MongoDB
MONGODB_URI=mongodb://localhost:27017/lms-ai

# JWT
JWT_SECRET=your_jwt_secret_key

# Claude AI
ANTHROPIC_API_KEY=sk-ant-xxxxx  # Your Claude API key
CLAUDE_MODEL=claude-3-5-sonnet-20241022

# Server
PORT=5000
NODE_ENV=development
```

### Installation & Dependencies

#### Backend
```bash
cd backend
npm install

# Key dependencies:
# - @anthropic-ai/sdk ^0.27.3 (Claude API)
# - pdf-parse ^1.1.1 (PDF text extraction)
# - mongoose (MongoDB ODM)
# - dotenv (Environment variables)
# - express (Web framework)
# - cors (Cross-origin requests)
# - multer (File uploads)
# - jsonwebtoken (JWT authentication)
```

#### Frontend
```bash
cd frontend
npm install

# Key dependencies:
# - react
# - react-router-dom
# - axios (API calls)
# - lucide-react (Icons)
# - tailwindcss (Styling)
```

## 🚀 Getting Started

### 1. Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file with required variables
# Make sure MongoDB is running
# Start server
npm start

# Server will run on http://localhost:5000
```

### 2. Frontend Setup
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Frontend will run on http://localhost:5173
```

### 3. First-Time Usage

1. **Register Account**
   - Go to signup page
   - Create account with email and password

2. **Upload Document**
   - Navigate to Documents
   - Click "Upload Document"
   - Select PDF file
   - Add title and description
   - System will:
     - Extract text from PDF
     - Analyze content
     - Generate summary (if AI configured)
     - Calculate statistics

3. **Use AI Chat**
   - Open document detail page
   - Go to "Chat" tab
   - Ask questions about document content
   - AI will respond with context-aware answers

4. **Generate Study Materials**
   - Go to "AI" tab
   - Generate flashcards from content
   - Generate quiz questions
   - Extract key concepts

## 📊 Features Details

### Document Upload & Processing
- **Max file size**: 10MB
- **Supported formats**: PDF
- **Processing pipeline**:
  1. File validation
  2. PDF text extraction
  3. Text cleaning and normalization
  4. Statistics calculation
  5. Keyword extraction
  6. Optional: AI summary generation

### AI Chat Features
- **Models supported**: Claude 3.5 Sonnet
- **Streaming**: Real-time token streaming for faster responses
- **Context**: AI uses document content for accurate answers
- **Session management**: Maintain chat history per document
- **Token tracking**: Monitor API usage

### Document Organization
- **Categories**: Science, Tech, Math, Language, History, Arts, Other
- **Sharing**: Private, Shared, Public access levels
- **Tagging**: Custom tags for organization
- **Search**: Full-text search across documents
- **Status**: Active tracking of document usage

## 🔒 Security Features

### Authentication
- JWT-based authentication
- Password hashing (bcrypt)
- Token validation on protected routes
- Automatic logout on token expiration

### Authorization
- User-based document access control
- Sharing permissions per document
- Activity logging for audit trail
- File cleanup on document deletion

### Data Validation
- Input sanitization
- File type validation
- File size limits
- Content validation before processing

## 📈 Performance Considerations

### Optimization
- Document chunking for large files (API token limits)
- Pagination for chat history and document lists
- Lazy loading of documents
- Text indexing for faster search
- Streaming responses for real-time feedback

### API Rate Limiting (Recommended)
```javascript
// Add to future implementation
const rateLimit = require('express-rate-limit');

const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/chat', chatLimiter);
```

## 🐛 Troubleshooting

### Issues & Solutions

1. **"AI service not configured"**
   - Check ANTHROPIC_API_KEY in .env
   - Verify API key format (starts with sk-ant-)
   - Restart server after adding key

2. **PDF extraction fails**
   - Verify file is not corrupted
   - Check file size (max 10MB)
   - Try uploading different PDF

3. **Chat responses are empty**
   - Check document has text content
   - Verify AI API key is valid
   - Check server logs for errors

4. **Database connection errors**
   - Ensure MongoDB is running
   - Check MONGODB_URI format
   - Verify database permissions

## 🧪 Testing

### Test Workflow
1. Create test account
2. Upload sample PDF document
3. Verify text extraction in document detail
4. Test chat with various questions
5. Generate flashcards and quiz
6. Test document search
7. Test sharing/permissions

### Sample Test Questions
- "What is this document about?"
- "Summarize the main points"
- "What are the key concepts?"
- "Give me 3 key takeaways"

## 📦 File Structure

```
backend/
├── services/
│   ├── aiService.js         # Claude API integration
│   └── documentService.js   # Document processing
├── controllers/
│   ├── documentController.js # Document CRUD + AI features
│   ├── chatController.js    # Chat management
│   └── ... (other controllers)
├── models/
│   ├── Document.js          # Enhanced document model
│   ├── Chat.js              # Enhanced chat model
│   └── ... (other models)
├── routes/
│   ├── documents.js         # Document routes
│   ├── chat.js              # Chat routes
│   └── ... (other routes)
└── server.js

frontend/
├── components/
│   ├── Chat.jsx             # Chat UI component
│   └── ... (other components)
├── pages/
│   └── DocumentDetail.jsx   # Enhanced document page
└── services/
    └── api.js               # API configuration
```

## 🔄 Workflow Example

### Complete Document Analysis Workflow
```
1. User uploads PDF → documentController.uploadDocument()
   ↓
2. Document processing → documentService.processDocument()
   - Extract text
   - Clean text
   - Generate statistics
   - Extract keywords
   ↓
3. AI summary generation → aiService.generateDocumentSummary()
   ↓
4. Document saved to database with:
   - Extracted text
   - Statistics
   - Keywords
   - Summary (if AI enabled)
   ↓
5. User can now:
   - Chat about document
   - Generate flashcards
   - Generate quiz
   - View statistics
```

### Chat Interaction Workflow
```
1. User sends message → chatController.chatWithDocument()
   ↓
2. Retrieve document and chat history
   ↓
3. Generate system prompt → aiService.generateSystemPrompt()
   - Include document context
   - Include recent messages
   - Set temperature/parameters
   ↓
4. Call Claude API → aiService.chatWithClaude()
   - Stream or non-stream mode
   - Track tokens
   ↓
5. Save conversation to database
   - Record message
   - Update statistics
   - Track token usage
   ↓
6. Send response to user
```

## 🚦 Status Indicators

The AI Chat interface displays:
- 🟢 **Online**: AI service is available and working
- 🔴 **Offline**: AI service not configured or error
- ⏳ **Loading**: Processing request
- 💬 **Chat Active**: Session is active and ready

## 📝 Future Enhancements

1. **Advanced Features**
   - Multi-document conversations
   - Custom AI model selection
   - Document comparison
   - Advanced analytics

2. **Performance**
   - Caching for frequently accessed docs
   - Background job processing
   - Document indexing optimization

3. **User Experience**
   - Voice input/output
   - Real-time collaboration
   - Mobile app support
   - Export chat history

4. **Integration**
   - LMS integration
   - Email notifications
   - Third-party tool integrations
   - API for external access

## 📞 Support

For issues or questions:
1. Check troubleshooting section
2. Review server logs
3. Verify environment configuration
4. Check Claude API documentation

## 📄 License

This implementation is part of the AI Learning Assistant project.
