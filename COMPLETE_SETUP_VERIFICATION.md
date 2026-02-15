# 🚀 COMPLETE FULL-STACK MERN SETUP & VERIFICATION GUIDE

**Date**: February 13, 2026  
**Status**: ✅ Production Ready  
**Scope**: Frontend + Backend + Database + Authentication

---

## 📋 TABLE OF CONTENTS

1. [Architecture Overview](#architecture-overview)
2. [Environment Configuration](#environment-configuration)
3. [Complete Startup Instructions](#complete-startup-instructions)
4. [Database Seeding](#database-seeding)
5. [End-to-End Verification](#end-to-end-verification)
6. [Troubleshooting](#troubleshooting)
7. [Test User Credentials](#test-user-credentials)

---

## 🏗️ ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│                     USER BROWSER                             │
│                 http://localhost:5173                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              VITE DEV SERVER (Port 5173)                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ React Application                                       │ │
│  │ - Authentication (Login/Signup)                        │ │
│  │ - Dashboard                                            │ │
│  │ - Documents                                            │ │
│  │ - Feature Routes                                       │ │
│  │                                                         │ │
│  │ Vite Proxy Configuration:                             │ │
│  │ /api/* → http://localhost:5000/api/*                 │ │
│  └────────────────┬────────────────────────────────────────┘ │
└──────────────────┼──────────────────────────────────────────┘
                   │
                   │ HTTP Proxy
                   │ All /api/* requests
                   ▼
┌─────────────────────────────────────────────────────────────┐
│          EXPRESS BACKEND SERVER (Port 5000)                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Routes:                                                │ │
│  │ ✅ /api/auth/* (Login, Signup, Token validation)      │ │
│  │ ✅ /api/documents/* (CRUD operations)                 │ │
│  │ ✅ /api/chat/* (Chat functionality)                   │ │
│  │ ✅ /api/flashcards/* (Study materials)                │ │
│  │ ✅ /api/health (Health check)                         │ │
│  │ ✅ /health (Root health check)                        │ │
│  │                                                        │ │
│  │ Middleware:                                           │ │
│  │ ✅ CORS (for cross-origin requests)                   │ │
│  │ ✅ JWT Authentication                                 │ │
│  │ ✅ Error Handling                                     │ │
│  │ ✅ Request Logging                                    │ │
│  └────────────────┬────────────────────────────────────────┘ │
└──────────────────┼──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│              MONGODB DATABASE                               │
│  ✅ mongoose://localhost:27017/ai-learning-assistant       │
│                                                              │
│  Collections:                                               │
│  - Users (with password hashing)                            │
│  - Documents                                                │
│  - Flashcards                                               │
│  - Quizzes                                                  │
│  - Chats                                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 ENVIRONMENT CONFIGURATION

### Backend Configuration

**File: `backend/.env`**

```dotenv
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/ai-learning-assistant

# JWT & Security
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# File Upload
MAX_FILE_SIZE=10485760

# Email (Optional - for forgot password)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:5173

# AI Service (Optional)
ANTHROPIC_API_KEY=sk-ant-...
```

### Frontend Configuration

**File: `frontend/.env`**

```dotenv
# API Configuration
VITE_API_URL=/api
VITE_API_TIMEOUT=30000
VITE_BACKEND_URL=http://localhost:5000
```

---

## 🚀 COMPLETE STARTUP INSTRUCTIONS

### Prerequisites

1. **Node.js 14+** - Download from https://nodejs.org/
2. **MongoDB** - Either:
   - Local: Download from https://www.mongodb.com/try/download/community
   - Cloud: MongoDB Atlas (https://www.mongodb.com/cloud/atlas)

### Step 1: Verify MongoDB is Running

**For Local MongoDB:**
```bash
# Windows: Check MongoDB service
net start MongoDB

# Or start mongod manually
mongod

# Verify connection
mongo
# Should show: connecting to: mongodb://127.0.0.1:27017/
```

**For MongoDB Atlas:**
- Ensure connection string is in `backend/.env` as `MONGODB_URI`

### Step 2: Start Backend Server

**Option A: Using Batch File (Windows)**
```bash
# Navigate to project root
cd ai-learning-assistant\backend

# Double-click: START_BACKEND.bat
# Or run in terminal:
START_BACKEND.bat
```

**Option B: Using Terminal**
```bash
# Navigate to backend
cd ai-learning-assistant/backend

# Install dependencies (first time only)
npm install

# Start server
npm run dev
```

**Expected Output:**
```
✅ SERVER STARTED SUCCESSFULLY
════════════════════════════════════════════════════════
📍 URL: http://localhost:5000
🔌 Port: 5000
🌍 Environment: development
🔑 JWT Secret: ✅ Set
🗄️  MongoDB: ✅ Configured
════════════════════════════════════════════════════════

GET /health
```

✅ **Success Indicators:**
- No errors in console
- "✅ SERVER STARTED SUCCESSFULLY" message
- "MongoDB Connected" message
- Server listening on port 5000

### Step 3: Start Frontend Server

**In a NEW Terminal Window:**

**Option A: Using Batch File (Windows)**
```bash
# Navigate to frontend folder
cd ai-learning-assistant\frontend

# Double-click: START_FRONTEND.bat
# Or run in terminal:
START_FRONTEND.bat
```

**Option B: Using Terminal**
```bash
# Navigate to frontend
cd ai-learning-assistant/frontend

# Install dependencies (first time only)
npm install

# Start server
npm run dev
```

**Expected Output:**
```
 VITE v5.0.8  ready in 245 ms

 ➜  Local:   http://localhost:5173/
 ➜  press h to show help
```

✅ **Success Indicators:**
- No errors in console
- Vite server running on port 5173
- Ready for browser access

### Step 4: Open in Browser

```
Navigate to: http://localhost:5173
```

✅ **Expected Landing Page:**
- Redirects to `/login` (no user logged in)
- Login form visible with Email & Password fields
- "Sign up" link present

---

## 🌱 DATABASE SEEDING

### Create Test User Automatically

**Option A: Using npm script**
```bash
# Navigate to backend directory
cd backend

# Run seeding script
npm run seed
```

**Expected Output:**
```
===============================================================================
🌱 DATABASE SEEDING SCRIPT
===============================================================================

📍 MongoDB Connection Details:
   URI: mongodb://localhost:27017/ai-learning-assistant

🔗 Connecting to MongoDB...
✅ Successfully connected to MongoDB

🔍 Checking if test user already exists...
👤 Creating test user...
✅ Test user created successfully

📋 Created Test User:
   ID: 507f1f77bcf86cd799439011
   Email: testuser@example.com
   Username: testuser
   Full Name: Test User
   Role: student
   Active: true
   Created: 2026-02-13T...

🔑 LOGIN CREDENTIALS:
   Email: testuser@example.com
   Password: Test@1234

===============================================================================
✨ SEEDING COMPLETE
===============================================================================
```

**Option B: Manual MongoDB Creation**
```javascript
// In MongoDB shell (mongo)
use admin
db.users.insertOne({
  username: "testuser",
  email: "testuser@example.com",
  password: "$2a$10$...", // bcryptjs hashed password
  fullName: "Test User",
  role: "student",
  isActive: true,
  createdAt: new Date()
})
```

---

## ✅ END-TO-END VERIFICATION

### Verification Checklist

Complete these checks in order to verify the entire system works:

#### 1️⃣ Backend Health Check

**Via Terminal (PowerShell/CMD):**
```powershell
# Check backend health endpoint
curl http://localhost:5000/api/health

# Expected response:
# {"status":"ok","message":"Backend is running successfully","timestamp":"2026-02-13T..."}
```

**Via Browser:**
```
Open: http://localhost:5000/api/health
Expected: JSON response with { status: 'ok', message: '...' }
```

✅ **Verification**: Backend is responding correctly

#### 2️⃣ Frontend Health Check via Proxy

```powershell
# Test that Vite proxy is working
curl http://localhost:5173/api/health

# Expected response: Same as backend (proxied through Vite)
# {"status":"ok","message":"Backend is running successfully","timestamp":"..."}
```

✅ **Verification**: Frontend proxy is working correctly

#### 3️⃣ Test Login Flow

**In Browser (http://localhost:5173):**

1. Go to login page
2. Enter credentials:
   - Email: `testuser@example.com`
   - Password: `Test@1234`
3. Click "Login"

**Expected Result:**
- ✅ No console errors
- ✅ No proxy errors
- ✅ Redirects to `/dashboard`
- ✅ User information displayed
- ✅ Token stored in localStorage

**Verify in Browser DevTools:**
```javascript
// Open DevTools (F12) > Console, paste:
console.log(localStorage.getItem('user'))
console.log(localStorage.getItem('token'))

// Should see user object and JWT token
```

#### 4️⃣ Test Protected Route Access

After logging in:

1. Click on various dashboard features
2. Verify no "401 Unauthorized" errors
3. Check that protected routes are accessible

**In Browser Console:**
```javascript
// Check API calls are including JWT token
fetch('/api/dashboard/metrics')
  .then(r => r.json())
  .then(console.log)

// Should succeed with 200 response
```

#### 5️⃣ Test Logout

1. Click "Logout" button
2. Verify redirect to `/login`
3. Verify localStorage is cleared

**In Browser Console:**
```javascript
console.log(localStorage.getItem('token'))
// Should be: null
```

#### 6️⃣ Check Console for Errors

**Frontend Console (F12):**
```
✅ No red error messages
✅ APIRequests logged: "📤 API Request: POST /api/auth/login"
✅ API Responses logged: "📥 API Response: 200 /api/auth/login"
✅ No proxy errors
✅ No ECONNREFUSED errors
```

**Backend Console:**
```
✅ "POST /api/auth/login" logged
✅ "✅ User logged in: testuser@example.com" message
✅ No error stack traces
✅ No MongoDB connection errors
```

---

## 🔍 DETAILED VERIFICATION SCRIPT

Run this comprehensive verification:

### Test 1: Backend Connectivity
```bash
curl -i http://localhost:5000/health
# Expected: HTTP/1.1 200 OK
```

### Test 2: Frontend Health Check
```bash
curl http://localhost:5173/api/health
# Expected: {"status":"ok",...}
```

### Test 3: Frontend health check through proxy
```bash
curl http://localhost:5173/api/health
# Should match backend response exactly
```

### Test 4: Create Test Account
```json
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username":"newuser",
    "email":"newuser@example.com",
    "password":"Test@1234",
    "confirmPassword":"Test@1234"
  }'

// Expected response:
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJ...",
  "user": { "email": "newuser@example.com", ... }
}
```

### Test 5: Login with Test User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"Test@1234"}'

# Expected response:
{
  "success": true,
  "message": "Login successful",
  "token": "eyJ...",
  "user": { "email": "testuser@example.com", ... }
}
```

### Test 6: Protected Route with Token
```bash
# Copy token from login response
TOKEN="eyJ..."

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/auth/profile

# Expected: User profile data (200 OK)
# Without token: 401 Unauthorized
```

---

## 🐛 TROUBLESHOOTING

### Issue 1: "Cannot Connect to Backend"

**Error Message:**
```
ECONNREFUSED - Backend not responding
🔴 Proxy Error: ECONNREFUSED
```

**Solutions:**
1. Check if backend is running (`npm run dev` in backend folder)
2. Verify backend is on port 5000: `netstat -ano | findstr :5000`
3. Check .env file: `PORT=5000`
4. Check for errors in backend terminal
5. Restart both servers

---

### Issue 2: "Port 5000 Already in Use"

**Error Message:**
```
❌ FATAL: Port 5000 is already in use!
EADDRINUSE: address already in use :::5000
```

**Solutions:**

**Option A: Kill Process on Port 5000**
```powershell
# Find process
netstat -ano | findstr :5000

# Kill process (replace PID with actual number)
taskkill /PID 1234 /F

# Verify port is free
netstat -ano | findstr :5000
# Should return nothing
```

**Option B: Change Port**
```dotenv
# In backend/.env
PORT=5001

# Then update frontend .env
VITE_BACKEND_URL=http://localhost:5001
```

---

### Issue 3: "MongoDB Connection Failed"

**Error Message:**
```
❌ MongoDB connection failed
MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017
```

**Solutions:**

1. **Start MongoDB Locally:**
```powershell
# Start MongoDB service
net start MongoDB

# Or manually run mongod
mongod
```

2. **Verify MongoDB is Running:**
```powershell
# Check if MongoDB service is running
net start MongoDB

# Test connection
mongo --eval "db.version()"
```

3. **Check Connection String:**
```dotenv
# In backend/.env
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/ai-learning-assistant

# MongoDB Atlas (cloud)
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/ai-learning-assistant
```

---

### Issue 4: "Login Failed - Invalid Credentials"

**Error Message:**
```
Invalid email or password
```

**Solutions:**
1. Verify test user exists: Run `npm run seed` in backend
2. Verify credentials:
   - Email: `testuser@example.com`
   - Password: `Test@1234` (exactly, case-sensitive)
3. Check backend logs for validation errors
4. Verify no syntax errors in password field

---

### Issue 5: "Vite Proxy Errors"

**Error Message:**
```
🔴 PROXY ERROR: ECONNREFUSED
Backend NOT RUNNING!
```

**Solutions:**
1. Start backend first: `npm run dev` in backend folder
2. Check backend is on port 5000
3. Verify vite.config.js has correct proxy target:
   ```javascript
   target: 'http://localhost:5000'
   ```
4. Clear browser cache (Ctrl+Shift+Delete)
5. Restart frontend: Kill terminal and `npm run dev` again

---

### Issue 6: "Blank Page on Login"

**Solutions:**
1. Open DevTools (F12) and check console for errors
2. Check that backend is running
3. Check proxy in console shows requests being made
4. Clear localStorage: `localStorage.clear()` in console
5. Hard refresh: Ctrl+Shift+R
6. Restart both servers

---

## 🧪 TEST USER CREDENTIALS

### Primary Test Account (Pre-seeded)

```
┌─────────────────────────────────────────────────┐
│ TEST USER ACCOUNT                               │
├─────────────────────────────────────────────────┤
│ Email:     testuser@example.com                 │
│ Password:  Test@1234                            │
│ Username:  testuser                             │
│ Role:      student                              │
│ Status:    Active                               │
└─────────────────────────────────────────────────┘
```

### How to Login

1. Navigate to **http://localhost:5173**
2. You'll be redirected to `/login`
3. Enter:
   - **Email**: testuser@example.com
   - **Password**: Test@1234
4. Click **"Login"**
5. Expected redirect to `/dashboard`

### Password Reset Test

If you want to test forgot password flow:
1. Click "Forgot Password" on login page
2. Enter: `testuser@example.com`
3. Check backend logs for reset link
4. (Note: Email setup required for full functionality)

---

## 📊 SYSTEM STATUS CHECK

### Quick Verification Commands

```bash
# Terminal 1: Check backend
curl -w "\n%{http_code}\n" http://localhost:5000/api/health

# Terminal 2: Check frontend proxy
curl -w "\n%{http_code}\n" http://localhost:5173/api/health

# Both should return:
# {"status":"ok",...}
# 200
```

### Browser DevTools Checks

```javascript
// F12 > Console

// 1. Check API base URL
fetch('/api/health').then(r => r.json()).then(console.log)

// 2. Check token (after login)
console.log(localStorage.getItem('token'))

// 3. Check user data (after login)
console.log(JSON.parse(localStorage.getItem('user')))

// 4. Make authenticated request
const token = localStorage.getItem('token')
fetch('/api/auth/profile', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json()).then(console.log)
```

---

## 📝 Final Checklist

Before considering the setup complete:

```
✅ Backend running on port 5000
✅ Frontend running on port 5173
✅ MongoDB connected and database selected
✅ Vite proxy configured correctly
✅ Test user created (testuser@example.com)
✅ Login works with test credentials
✅ Dashboard accessible after login
✅ Protected routes require authentication
✅ No console errors (frontend or backend)
✅ No proxy errors (ECONNREFUSED, etc.)
✅ API calls include JWT token in headers
✅ Logout clears localStorage and redirects
✅ Browser DevTools shows correct API calls
✅ All environment variables configured
✅ No database connection errors
```

---

## 🎓 NEXT STEPS

### Development
1. Keep both `npm run dev` terminals running
2. Frontend hot-reloads on file changes
3. Backend hot-reloads with nodemon
4. Use Browser DevTools to debug API calls

### Testing
1. Test all authentication flows
2. Test protected routes
3. Test error handling
4. Check API response formats

### Deployment
1. Build frontend: `npm run build`
2. Configure production environment variables
3. Set up MongoDB Atlas (if not local)
4. Deploy backend to hosting service
5. Deploy frontend static files to CDN

---

**Setup Complete! Your MERN application is ready for development.** 🎉
