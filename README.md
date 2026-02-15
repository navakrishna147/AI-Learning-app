# AI-Powered Learning Assistant 🚀

A full-stack MERN application that uses AI to enhance learning through interactive features like document chat, flashcard generation, and automated quizzes.

## ✨ Features

- 📚 **Document Management**: Upload and organize PDF learning materials
- 💬 **AI Chat**: Ask questions about your documents using Claude AI
- 🎴 **Smart Flashcards**: Auto-generate flashcards from document content
- 📝 **AI Quizzes**: Create custom quizzes to test your understanding
- 📊 **Analytics Dashboard**: Real-time activity tracking, statistics, and progress visualization (NEW!)
- 🏆 **Achievement System**: Unlock badges based on learning milestones (NEW!)
- 🔒 **Secure Authentication**: JWT-based user authentication
- 📱 **Responsive Design**: Beautiful UI that works on all devices

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client
- **Lucide React** - Beautiful icons
- **Vite** - Fast build tool

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **Multer** - File uploads
- **PDF-Parse** - PDF text extraction
- **Anthropic Claude API** - AI capabilities

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn
- Anthropic API Key

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ai-learning-assistant.git
cd ai-learning-assistant
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
MONGODB_URI=mongodb://localhost:27017/ai-learning-assistant
JWT_SECRET=your_super_secret_jwt_key_change_this
ANTHROPIC_API_KEY=your_anthropic_api_key_here
PORT=5000
MAX_FILE_SIZE=10485760
```

**Getting an Anthropic API Key:**
1. Visit https://console.anthropic.com/
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy and paste it into your .env file

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

### 4. Start MongoDB

Make sure MongoDB is running on your machine:

```bash
# macOS (using Homebrew)
brew services start mongodb-community

# Ubuntu/Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

### 5. Run the Application

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 📖 Usage Guide

### 1. Create an Account
- Navigate to http://localhost:5173/signup
- Enter your username, email, and password
- Click "Sign up"

### 2. Upload a Document
- Go to the Documents page
- Click "Upload Document"
- Select a PDF file and give it a title
- Click "Upload"

### 3. Chat with Your Document
- Click on any document
- Navigate to the "Chat" tab
- Ask questions about the content
- The AI will provide detailed answers

### 4. Generate Flashcards
- Open a document
- Go to "AI Actions" tab
- Click "Generate Flashcards"
- Review flashcards in the "Flashcards" tab

### 5. Take a Quiz
- From "AI Actions", click "Generate Quiz"
- Navigate to "Quizzes" tab
- Start the quiz and test your knowledge
- View your score and correct answers

## 📁 Project Structure

```
ai-learning-assistant/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database configuration
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── documentController.js # Document CRUD operations
│   │   ├── chatController.js     # AI chat functionality
│   │   ├── flashcardController.js# Flashcard generation
│   │   ├── quizController.js     # Quiz generation
│   │   └── activityController.js # Dashboard analytics
│   ├── middleware/
│   │   ├── auth.js               # JWT authentication
│   │   └── upload.js             # File upload handling
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── Document.js           # Document schema
│   │   ├── Chat.js               # Chat history schema
│   │   ├── Flashcard.js          # Flashcard schema
│   │   ├── Quiz.js               # Quiz schema
│   │   └── Activity.js           # Activity log schema
│   ├── routes/
│   │   ├── auth.js               # Auth routes
│   │   ├── documents.js          # Document routes
│   │   ├── chat.js               # Chat routes
│   │   ├── flashcards.js         # Flashcard routes
│   │   ├── quizzes.js            # Quiz routes
│   │   └── dashboard.js          # Dashboard routes
│   ├── uploads/                  # Uploaded files directory
│   ├── .env.example              # Environment variables template
│   ├── package.json
│   └── server.js                 # Express server entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx        # Main layout wrapper
│   │   │   └── Sidebar.jsx       # Navigation sidebar
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx   # Authentication context
│   │   ├── pages/
│   │   │   ├── Login.jsx         # Login page
│   │   │   ├── Signup.jsx        # Signup page
│   │   │   ├── Dashboard.jsx     # Dashboard page
│   │   │   ├── Documents.jsx     # Documents list page
│   │   │   ├── DocumentDetail.jsx# Document detail page
│   │   │   ├── Flashcards.jsx    # Flashcards page
│   │   │   └── Profile.jsx       # User profile page
│   │   ├── services/
│   │   │   └── api.js            # Axios API configuration
│   │   ├── App.jsx               # Main app component
│   │   ├── main.jsx              # React entry point
│   │   └── index.css             # Global styles
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
│
└── README.md
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Documents
- `POST /api/documents` - Upload document
- `GET /api/documents` - Get all user documents
- `GET /api/documents/:id` - Get single document
- `DELETE /api/documents/:id` - Delete document
- `GET /api/documents/stats` - Get document statistics

### Chat
- `POST /api/chat/:documentId` - Send message to AI
- `GET /api/chat/:documentId` - Get chat history
- `DELETE /api/chat/:documentId` - Clear chat history

### Flashcards
- `POST /api/flashcards/generate/:documentId` - Generate flashcards
- `GET /api/flashcards/:documentId` - Get flashcards for document
- `GET /api/flashcards/sets` - Get all flashcard sets
- `PUT /api/flashcards/:id/review` - Update review status
- `GET /api/flashcards/stats` - Get flashcard statistics

### Quizzes
- `POST /api/quizzes/generate/:documentId` - Generate quiz
- `GET /api/quizzes/:documentId` - Get quizzes for document
- `GET /api/quizzes/quiz/:id` - Get single quiz
- `POST /api/quizzes/:id/submit` - Submit quiz answers
- `GET /api/quizzes/:id/results` - Get quiz results
- `GET /api/quizzes/stats` - Get quiz statistics

### Dashboard & Analytics (NEW!)
- `GET /api/dashboard/stats` - Get comprehensive user statistics
- `GET /api/dashboard/analytics?days=7` - Get 7-day activity analytics
- `GET /api/dashboard/activities?limit=15` - Get recent activity log
- `GET /api/dashboard/learning-goals` - Get learning goals with progress
- `GET /api/dashboard/achievements` - Get all achievements and unlock status
- `GET /api/dashboard/summary` - Get complete dashboard summary

**Dashboard Features:**
- 📊 Real-time activity tracking (automatic logging of all user actions)
- 📈 Advanced analytics with 7-day trends and performance charts
- 🎯 5 pre-defined learning goals with progress visualization
- 🏆 8 achievement badges that auto-unlock based on conditions
- ⏱️ Automatic streak calculation and daily tracking
- 🔄 Auto-refresh every 2 minutes
- 📱 4-tab interface (Overview, Analytics, Goals, Achievements)

## 🎨 Features Breakdown

### Document Upload & Processing
- Supports PDF files up to 10MB
- Automatic text extraction using PDF-Parse
- File storage with organized structure
- Document metadata tracking

### AI-Powered Chat
- Context-aware conversations about documents
- Powered by Claude Sonnet 4
- Chat history persistence
- Real-time message streaming

### Smart Flashcard Generation
- AI analyzes document content
- Generates relevant Q&A pairs
- Progress tracking
- Review status management

### Automated Quiz Creation
- Multiple-choice question generation
- Configurable difficulty levels
- Score tracking
- Detailed result analysis

## 🔒 Security Features

- Bcrypt password hashing
- JWT token authentication
- Protected API routes
- Secure file upload validation
- CORS configuration

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongosh

# Restart MongoDB
brew services restart mongodb-community  # macOS
sudo systemctl restart mongod            # Linux
```

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill

# Kill process on port 5173
lsof -ti:5173 | xargs kill
```

### PDF Upload Errors
- Ensure file is a valid PDF
- Check file size (must be under 10MB)
- Verify uploads directory exists and has write permissions

## 🚀 Deployment

### Backend (Heroku/Railway/Render)
1. Set environment variables
2. Connect to MongoDB Atlas
3. Deploy using Git

### Frontend (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Configure API URL in environment variables

## 📝 Environment Variables

### Backend (.env)
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
ANTHROPIC_API_KEY=your_anthropic_api_key
PORT=5000
MAX_FILE_SIZE=10485760
```

## 📊 Dashboard & Analytics Documentation

A complete analytics system has been implemented with real-time activity tracking, statistics calculation, achievement management, and learning goal visualization.

### Quick Links
- 📚 **[Dashboard Index](DASHBOARD_INDEX.md)** - Start here! Complete documentation index and guide
- ⚡ **[Quick Reference Card](DASHBOARD_QUICK_REFERENCE.md)** - One-page cheat sheet with API endpoints and integration checklist
- 🏗️ **[System Architecture](DASHBOARD_ARCHITECTURE.md)** - Detailed architecture diagrams and data flow
- 🔧 **[Integration Guide](DASHBOARD_INTEGRATION_GUIDE.md)** - Step-by-step integration with code examples
- 📖 **[Full Documentation](DASHBOARD_DOCUMENTATION.md)** - Complete technical reference

### Key Features
- **Real-time Activity Tracking**: Automatically logs quiz completions, chat messages, flashcard reviews, and document accesses
- **User Statistics**: Calculates and updates scores, time spent, study streaks, and achievement progress
- **4-Tab Dashboard Interface**:
  - Overview: Stats cards, streaks, average score, recent achievements
  - Analytics: 7-day trends, feature usage charts, performance tracking
  - Learning Goals: 5 objectives with progress visualization
  - Achievements: 8 badges that auto-unlock based on learning milestones
- **Auto-refresh**: Dashboard updates every 2 minutes
- **Streak Management**: Daily tracking with automatic calculation

### Getting Started with Dashboard
1. Read: [DASHBOARD_QUICK_REFERENCE.md](DASHBOARD_QUICK_REFERENCE.md) (5 minutes)
2. Review: [DASHBOARD_ARCHITECTURE.md](DASHBOARD_ARCHITECTURE.md) (15 minutes)
3. Integrate: [DASHBOARD_INTEGRATION_GUIDE.md](DASHBOARD_INTEGRATION_GUIDE.md) (45 minutes)
4. Test: Complete activities and verify dashboard data updates

### Status
✅ Backend implementation: Complete (6 API endpoints, 450+ lines of code)
✅ Frontend component: Complete (262-line React component with 4 tabs)
✅ Database models: Enhanced (Activity logging + User statistics)
✅ Production build: Verified (262.79 KB, 0 errors)
⏳ Route integration: Ready for implementation (see Integration Guide)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Built with ❤️ using the MERN stack and Claude AI

## 🙏 Acknowledgments

- Anthropic for Claude API
- MongoDB for database solutions
- React team for the amazing framework
- Tailwind CSS for beautiful styling

---

**Happy Learning! 📚✨**
