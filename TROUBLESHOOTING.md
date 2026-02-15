# Troubleshooting Guide - Backend Issues

## The Problem You Encountered

**Error:** `[nodemon] app crashed - waiting for file changes before starting...`

**Root Cause:** MongoDB was not running when the backend tried to connect.

**Why It Happened:**
1. Backend tries to connect to MongoDB on startup
2. MongoDB wasn't running
3. Connection failed → app crashed
4. Nodemon saw the crash and waited for file changes to restart

## The Solution We Implemented

### 1. **Fixed Server Startup Logic** ✅
- Made MongoDB connection async and non-blocking
- Backend now starts even if MongoDB connection fails
- Will auto-reconnect when MongoDB becomes available

**File:** `backend/server.js` (Lines 27-31)
```javascript
// Now handles async connection gracefully
connectDB().catch(err => {
  console.warn('Proceeding without database connection...');
});
```

### 2. **Created nodemon.json Configuration** ✅
- Proper restart delay to prevent crash loops
- File watching configured correctly
- Verbose logging disabled for cleaner output

**File:** `backend/nodemon.json`

### 3. **Created Startup Documentation** ✅
- Step-by-step MongoDB startup instructions
- Common issues and solutions
- Success indicators to verify everything works

**File:** `backend/BACKEND_STARTUP.md`

### 4. **Created Startup Scripts** ✅
Three easy-to-use batch files for Windows:

| Script | Purpose |
|--------|---------|
| `start-backend.bat` | Start only backend (checks MongoDB) |
| `start-frontend.bat` | Start only frontend |
| `start-all.bat` | Start everything (recommended) |

## How to Use Going Forward

### Option 1: Using the Startup Scripts (Easiest)
```batch
# In main project folder, double-click one of:
start-all.bat          # Start everything (recommended)
start-backend.bat      # Start only backend
start-frontend.bat     # Start only frontend
```

### Option 2: Manual Command Line
```bash
# Terminal 1: Verify MongoDB is running
mongod

# Terminal 2: Start backend
cd backend
npm run dev    # with auto-reload
# or
npm start      # production mode

# Terminal 3: Start frontend
cd frontend
npm run dev
```

## Preventing Future Crashes

### Before Starting Backend:
```bash
# ✅ ALWAYS verify MongoDB is running
# Check with:
tasklist | findstr mongod

# If not running, start it:
mongod
```

### If Backend Crashes Again:

**See error: "MongoDB connection failed"?**
1. Start MongoDB: `mongod`
2. Backend will auto-reconnect
3. Or manually restart backend

**See error: "Port 5000 already in use"?**
```bash
# Find and kill process using port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change PORT in .env file
```

**See other error?**
1. Check `backend/.env` exists
2. Verify MongoDB running
3. Run `npm install` in backend folder
4. Check Node.js version: `node --version` (need v18+)

## Environment Files

### .env (with actual values)
```
MONGODB_URI=mongodb://localhost:27017/ai-learning-assistant
JWT_SECRET=your-secret-key-here
ANTHROPIC_API_KEY=sk-ant-xxx
PORT=5000
```

### .env.example (template)
Used as reference, contains instructions

Always keep `.env` private and don't commit to git!

## Server Health Checks

### Is Backend Running?
```bash
curl http://localhost:5000/
# Should return: {"message":"AI Learning Assistant API is running!"}
```

### Is Frontend Running?
```bash
curl http://localhost:5174/
# Should return HTTP 200
# Or open in browser: http://localhost:5174
```

### Is MongoDB Connected?
Look for this in backend terminal:
```
MongoDB Connected: localhost
```

## Quick Reference

| Issue | Quick Fix |
|-------|-----------|
| App keeps crashing | Start MongoDB first |
| Port in use | `taskkill /F /IM node.exe` |
| Modules missing | Run `npm install` |
| Connection refused | Check MONGODB_URI in .env |
| Hot reload not working | Restart `npm run dev` |
| Can't find mongod | Install MongoDB from mongodb.com |
| Port 5000 stays in use | `netstat -ano` then `taskkill /PID` |
| File watch limit exceeded | Increase max_user_watches |

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│         Startup Sequence                    │
├─────────────────────────────────────────────┤
│ 1. User runs start-all.bat (or manual)      │
│ 2. Script verifies MongoDB running          │
│ 3. Starts Backend on port 5000              │
│ 4. Backend loads .env variables             │
│ 5. Backend tries to connect MongoDB         │
│    (async - doesn't block)                  │
│ 6. Starts Frontend on port 5174             │
│ 7. Frontend connects to Backend via CORS    │
│ 8. System ready! Open http://localhost:5174│
└─────────────────────────────────────────────┘
```

## Advanced Setup

### Enable Debug Logging
Edit `backend/server.js` and change:
```javascript
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});
```

### Change Primary Port
Edit `backend/.env`:
```
PORT=3001  # Changed from 5000
```

### Use Different MongoDB
Edit `backend/.env`:
```
MONGODB_URI=mongodb://atlas-xxx/database-name
```

## Getting Help

If you encounter issues:

1. Check the error message carefully
2. Search in this Troubleshooting Guide
3. Verify MongoDB is running
4. Check all .env variables are set
5. Try a clean restart: `start-all.bat`
6. Check file permissions in `/uploads` folder
7. Ensure port 5000 & 5174 are available

## Success Indicators ✅

Backend terminal should show:
```
Server is running on port 5000
http://localhost:5000/
MongoDB Connected: localhost
```

Frontend terminal should show:
```
VITE v5.4.21  ready in 1061 ms
➜  Local:   http://localhost:5174/
```

Browser at http://localhost:5174 should:
- Load the React application
- Show no errors in DevTools console
- Connect to API at localhost:5000
