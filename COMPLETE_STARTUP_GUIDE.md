# 🚀 Complete Startup Guide

## Quick Start (Windows)

### Option 1: Automatic (Using Batch Scripts)
```bash
# From project root directory
start-all.bat

# This will:
# 1. Check MongoDB status
# 2. Start Backend (port 5000)
# 3. Start Frontend (port 5173)
# 4. Open in browser
```

### Option 2: Manual (Recommended for Development)

#### Terminal 1: MongoDB (if using local)
```bash
mongod

# Or if MongoDB is installed as service, it auto-starts
```

#### Terminal 2: Backend
```bash
cd backend
npm install  # Only first time
npm start

# Should see:
# ✅ SERVER STARTED SUCCESSFULLY
# ✅ MongoDB Connected
```

#### Terminal 3: Frontend
```bash
cd frontend
npm install  # Only first time
npm run dev

# Should see:
# ✅ VITE v5.0.0 ready in X ms
# http://localhost:5173/
```

---

## Complete Setup from Scratch

### Step 1: Clone/Extract Project
```bash
# Project should be in:
# d:\LMS-Full Stock Project\LMS\MERNAI\ai-learning-assistant
cd d:\LMS-Full Stock Project\LMS\MERNAI\ai-learning-assistant
```

### Step 2: Configure Backend
```bash
cd backend

# Create .env file with proper configuration
# Copy contents from ENVIRONMENT_SETUP.md
# Key points:
# - MONGODB_URI: mongodb://localhost:27017/ai-learning-assistant
# - JWT_SECRET: your_secret_32+_chars
# - EMAIL_USER: (optional for now)
# - FRONTEND_URL: http://localhost:5173
```

### Step 3: Install Backend Dependencies
```bash
cd backend
npm install

# Wait for completion (may take 2-3 minutes)
```

### Step 4: Install Frontend Dependencies
```bash
cd frontend
npm install

# Wait for completion (may take 2-3 minutes)
```

### Step 5: Start MongoDB
```bash
# Windows: Either run mongod command or start MongoDB service
mongod

# Should output: "waiting for connections on port 27017"
```

### Step 6: Start Backend (in new terminal)
```bash
cd backend
npm start

# Should show:
# ✅ SERVER STARTED SUCCESSFULLY
# 📌 Server URL: http://localhost:5000/
# ✅ Database Status: Connected
```

### Step 7: Start Frontend (in another new terminal)
```bash
cd frontend
npm run dev

# Should show:
# ✅ VITE v5.0.0 ready in 1234 ms
# http://localhost:5173/
```

### Step 8: Open in Browser
- Visit: http://localhost:5173
- Should see login page
- Try signing up or logging in

---

## First Time Usage

### Create Test Account
1. Click "Sign up" on login page
2. Fill in:
   - Username: testuser
   - Email: test@example.com
   - Password: password123
   - Confirm: password123
3. Click "Create Account"
4. Should see "Registration successful"
5. Should redirect to dashboard

### Login
1. Click "Sign in" on login page
2. Fill in:
   - Email: test@example.com
   - Password: password123
3. Click "Sign in"
4. Should redirect to dashboard

### Dashboard Features
- View profile
- Access documents, flashcards, quizzes
- Chat with AI
- View learning stats

---

## Troubleshooting

### MongoDB Connection Error
```
❌ MongoDB connection failed
Error: Error connecting to mongodb://localhost:27017
```

**Solution:**
1. Ensure mongod is running:
   ```bash
   # Windows: Check Task Manager for mongod.exe
   # Or start it:
   mongod.exe
   ```
2. Wait 3 seconds after starting mongod
3. Restart backend

### Backend on Port 5000 Already in Use
```
❌ Port 5000 is already in use
```

**Solution:**
1. Kill process on port 5000:
   ```bash
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   ```
2. Or change PORT in .env to 5001

### Frontend Not Loading
```
Error: No route found for request
```

**Solution:**
1. Ensure frontend is running (terminal shows http://localhost:5173)
2. Clear browser cache (Ctrl+Shift+Delete)
3. Hard refresh (Ctrl+F5)

### Login Returns Error 500
```
{
  "success": false,
  "message": "Login failed"
}
```

**Solution:**
1. Check backend logs for ❌ symbol
2. Ensure MongoDB is running
3. Check .env MONGODB_URI is correct
4. Verify database has user collection

---

## Development Workflow

### Making Changes

#### Backend Changes
1. Edit file in `/backend`
2. Nodemon auto-restarts (if using npm start)
3. Test with curl or frontend UI
4. Check backend logs for errors

#### Frontend Changes
1. Edit file in `/frontend`
2. Vite auto-reloads browser
3. No refresh needed usually
4. Check browser console for errors

### Testing API Directly
```bash
# Test signup
curl -X POST http://localhost:5000/api/auth/signup ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"test\",\"email\":\"test@test.com\",\"password\":\"pass123\",\"confirmPassword\":\"pass123\"}"

# Test login
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@test.com\",\"password\":\"pass123\"}"
```

---

## Stopping Services

### Graceful Shutdown
```bash
# Backend: Ctrl+C in backend terminal
# Frontend: Ctrl+C in frontend terminal
# MongoDB: Ctrl+C in MongoDB terminal
```

### Force Shutdown (if needed)
```bash
# Kill all Node processes
taskkill /IM node.exe /F

# Kill MongoDB
taskkill /IM mongod.exe /F
```

---

## Production Checklist

Before deploying to production:

- [ ] Change JWT_SECRET to strong random value
- [ ] Set EMAIL_USER and EMAIL_PASSWORD
- [ ] Use MongoDB Atlas (not local MongoDB)
- [ ] Set NODE_ENV=production
- [ ] Update CORS origins to production domain
- [ ] Update FRONTEND_URL to production domain
- [ ] Disable verbose logging
- [ ] Set up SSL/HTTPS
- [ ] Backup database
- [ ] Test all features

---

## Performance Tips

### Reduce Backend Startup Time
```bash
# Skip some startup checks
NODE_ENV=production npm start
```

### Faster Frontend Development
```bash
# Use Vite's dev mode features
npm run dev

# or build for production testing
npm run build
npm run preview
```

### Database Optimization
```bash
# Add indexes for frequent queries
# Already done in User model
```

---

## Monitoring

### Backend Health
```bash
# Check server status
curl http://localhost:5000/health

# Should respond:
{
  "status": "healthy",
  "database": "connected",
  "uptime": 123.45,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Frontend Performance
- Open DevTools (F12)
- Go to Network tab
- Check request times
- Monitor Console for errors

### Database Size
```bash
mongosh
db.stats()
db.users.count()
```

---

## Logs Location

### Backend Logs
- Displayed in terminal running backend
- Look for ✅ (success), ❌ (error), ⚠️ (warning)

### Frontend Logs
- Browser Console (F12 → Console)
- Network tab shows API calls

### MongoDB Logs
- Terminal where mongod runs

---

## Common Tasks

### Reset User Password (for testing)
```bash
# Via reset password flow in UI
# Or directly in MongoDB:
mongosh
use ai-learning-assistant
db.users.updateOne({email: "user@example.com"}, {$set: {password: ""}})
# Then user needs to reset via forgot-password
```

### Clear All User Data
```bash
mongosh
use ai-learning-assistant
db.users.deleteMany({})
```

### View Registered Users
```bash
mongosh
use ai-learning-assistant
db.users.find()
```

---

## Support

If you encounter issues:

1. **Check logs** - Backend and browser console
2. **Read error messages** - They indicate the problem
3. **Verify environment** - MONGODB_URI, JWT_SECRET, etc.
4. **Test MongoDB** - Use mongosh to verify database
5. **Test backend** - Use curl or Postman
6. **Check ports** - Ensure 5000 and 5173 are free
7. **Restart services** - Sometimes fixes temporary issues
8. **Clear cache** - Browser and application cache

---

## Next Steps

After successful startup:

1. ✅ Create test account
2. ✅ Test login/logout
3. ✅ Explore dashboard features
4. ✅ Test document upload
5. ✅ Test quiz functionality
6. ✅ Test chat with AI
7. ✅ Test password reset (if email configured)

Everything is now running! 🎉
