# BACKEND RELIABILITY FIXES - Complete Setup Guide

**Date: February 14, 2026**  
**Status: Production-Ready**

---

## Overview

This guide addresses the critical issue where your backend becomes unreachable after closing/reopening your laptop. All fixes follow **production-level best practices** and include:

1. **Enhanced process event handling** - Unhandled rejections and exceptions
2. **Automatic MongoDB reconnection** - Resilient database connections
3. **Health check endpoints** - Multiple monitoring routes
4. **Root API endpoint** - Proper health indication
5. **Error middleware** - Comprehensive error handling
6. **Auto-restart configuration** - Nodemon crash recovery
7. **Windows startup automation** - System-level auto-start

---

## Architecture Improvements Made

### 1. Server Process Handlers (server.js)

**What was added:**
```javascript
process.on('unhandledRejection', (reason, promise) => {...})
process.on('uncaughtException', (error, origin) => {...})
process.on('SIGTERM', ...)
process.on('SIGINT', ...)
```

**Why it matters:**
- Catches unhandled promise rejections before they crash the server
- Catches synchronous errors not caught by try-catch blocks
- Handles graceful shutdown signals
- Logs errors with unique IDs for debugging

**Impact:** Server stays alive and recovers from crashes automatically

---

### 2. MongoDB Auto-Reconnection (config/db.js)

**What was added:**
```javascript
mongoose.connection.on('disconnected', () => {
  // Attempt automatic reconnection in 5 seconds
  scheduleReconnect();
});

mongoose.connection.on('reconnected', () => {
  // Successfully reconnected - reset counters
});
```

**Why it matters:**
- When MongoDB drops connection (laptop sleep, network issue), automatically tries to reconnect
- Uses exponential backoff: 2s, 4s, 6s, etc.
- Resets retry counter on successful reconnection
- Sets connection pool size to 10 for better throughput

**Impact:** Backend automatically recovers from MongoDB connection loss

---

### 3. Health Check Routes (config/routes.js)

**Added endpoints:**
```
GET /              → Returns API status (new root endpoint!)
GET /health        → Simple health check (200 OK)
GET /api/health    → API health with DB status
GET /api/health/detailed → Full diagnostics
```

**Why it matters:**
- Frontend can now check if backend is running
- Can be called before making requests to avoid "Backend unreachable" message
- Detailed health check diagnoses MongoDB connection issues
- Standard monitoring practice for production systems

**Impact:** Frontend knows immediately when backend is unavailable

---

### 4. Error Handling Middleware (config/errorHandling.js)

**What was enhanced:**
- Validation errors → 400
- Authentication errors → 401
- Database errors → 503 with retry indication
- File upload errors → 413/400 with clear messaging
- External service errors → 503
- Unhandled errors → 500 with error ID

**Why it matters:**
- Each error includes a unique error ID for tracking
- Request ID correlates frontend requests to backend errors
- Development mode includes stack traces; production obfuscates them
- Tells clients which errors are retryable (503) vs final (4xx)

**Impact:** Better debugging and clearer error messages to frontend

---

### 5. Nodemon Configuration (nodemon.json)

**What was enhanced:**
```json
{
  "watch": [".", "config", "controllers", "middleware", "models", "routes", "services"],
  "exitcrash": false,  // Auto-restart on crash
  "events": {
    "crash": "echo 'Server crashed. Waiting for changes to restart...'"
  }
}
```

**Why it matters:**
- Watches more directories for changes
- `exitcrash: false` means crashes don't prevent future restarts
- Logs when server crashes (visible in terminal)
- Auto-restarts when you save a file even after crash

**Impact:** Development server automatically recovers from code errors

---

### 6. Startup Scripts for Windows

Three startup options provided:

#### Option A: Batch Script (start-backend.bat)
- Double-click to start
- Checks prerequisites (Node.js, npm)
- Creates .env if missing
- Installs dependencies if needed
- Shows server URL and health endpoints
- Best for: Development use

#### Option B: PowerShell Script (start-backend.ps1)
- Modern Windows scripting
- Better error handling and colors
- Same features as batch script
- Best for: Modern Windows 10+ systems

#### Option C: VBS Autostart Script (start-backend-autostart.vbs)
- Runs hidden (no command window visible)
- Can be scheduled with Windows Task Scheduler
- Logs to `logs/autostart.log` for debugging
- Best for: Automatic system-restart recovery

---

## Setup Instructions

### Step 1: Verify All Files Are Updated

Check these files are in your backend folder:

```
backend/
├── server.js                          ← Updated with process handlers
├── config/
│   ├── bootstrap.js                   ← Orchestrates startup
│   ├── db.js                          ← Updated with auto-reconnect
│   ├── routes.js                      ← Updated with health endpoints
│   ├── middleware.js                  ← Cleaned up
│   ├── errorHandling.js               ← Enhanced
│   └── environment.js
├── nodemon.json                       ← Updated
├── start-backend.bat                  ← NEW
├── start-backend.ps1                  ← NEW
└── start-backend-autostart.vbs        ← NEW
```

---

### Step 2: Environment Setup

Ensure your `.env` file has correct values:

```bash
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lmsai
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/lmsai?retryWrites=true&w=majority

JWT_SECRET=your-secret-key-at-least-32-chars-long
GROQ_API_KEY=your_groq_api_key_optional
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173
```

---

### Step 3: Start Development Server

**Option A: Using Batch Script (Easiest)**
```bash
# Navigate to backend folder, then double-click:
start-backend.bat

# Or from PowerShell/CMD:
.\start-backend.bat
```

**Option B: Using PowerShell**
```powershell
# From PowerShell (may need execution policy change):
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\start-backend.ps1
```

**Option C: Manual npm**
```bash
cd backend
npm install  # First time only
npm run dev  # Start with nodemon
```

---

### Step 4: Verify Backend is Running

Test these URLs in your browser:

1. **Root endpoint (NEW)**
   ```
   http://localhost:5000/
   ```
   Expected response:
   ```json
   {
     "message": "API is running",
     "service": "AI Learning Assistant",
     "version": "1.0.0",
     "timestamp": "2026-02-14T10:30:00.000Z",
     "uptime": "45s",
     "environment": "development"
   }
   ```

2. **Simple health check**
   ```
   http://localhost:5000/health
   ```
   Expected response:
   ```json
   {
     "status": "OK",
     "timestamp": "2026-02-14T10:30:00.000Z",
     "uptime": 45
   }
   ```

3. **API health (with database)**
   ```
   http://localhost:5000/api/health
   ```
   Expected response:
   ```json
   {
     "status": "healthy",
     "database": "connected",
     "environment": "development",
     "timestamp": "2026-02-14T10:30:00.000Z",
     "uptime": 45
   }
   ```

4. **Detailed diagnostics**
   ```
   http://localhost:5000/api/health/detailed
   ```
   Shows full system status, memory usage, database details, etc.

---

### Step 5: Configure Auto-Start on System Restart (Optional)

This ensures backend restarts automatically when you restart your computer.

#### Method 1: Windows Startup Folder (Simplest)

1. Press `Win + R` and type:
   ```
   shell:startup
   ```

2. Create a shortcut to `start-backend.bat` in this folder:
   - Right-click `start-backend.bat`
   - Send To > Desktop (create shortcut)
   - Cut the shortcut
   - Paste it in the startup folder

3. Restart your computer - backend will start automatically

#### Method 2: Windows Task Scheduler (Recommended)

1. Press `Win + R` and type:
   ```
   taskschd.msc
   ```

2. Right-click Task Scheduler Library > Create Basic Task

3. **General Tab:**
   - Name: Backend Auto-Starter
   - Description: Automatically start backend on system startup
   - ✓ Run with highest privileges

4. **Trigger Tab:**
   - Choose "At startup"
   - Click OK

5. **Action Tab:**
   - Action: Start a program
   - Program: `C:\Windows\System32\wscript.exe`
   - Arguments: Add quotes and path:
     ```
     "D:\LMS-Full Stock Project\LMS\MERNAI\ai-learning-assistant\backend\start-backend-autostart.vbs"
     ```
   - Start in: `D:\LMS-Full Stock Project\LMS\MERNAI\ai-learning-assistant\backend\`

6. **Conditions Tab:**
   - Uncheck "Only if computer is on AC power" (if on laptop)

7. Click Finish

8. Test it:
   - Restart your computer
   - After login, check if backend is running by visiting `http://localhost:5000`

#### Method 3: Using PM2 (Advanced - for Production)

For production deployments, use PM2:

```bash
npm install -g pm2

# Start backend with PM2
pm2 start server.js --name backend

# Make it auto-restart on system reboot
pm2 startup windows
pm2 save

# Check status
pm2 status
```

---

## Testing the Fixes

### Test 1: Normal Operation

1. Start backend using `start-backend.bat`
2. Open `http://localhost:5000/api/health` in browser
3. Should show `"status": "healthy"` and database connected

**Expected:** ✅ Backend is responsive

---

### Test 2: Simulate MongoDB Disconnect

1. Stop MongoDB:
   ```bash
   # On Windows, if MongoDB is running as a service:
   net stop MongoDB  # or use Services.msc to stop it
   ```

2. Watch the backend terminal - should show:
   ```
   ⚠️ MongoDB connection lost. Attempting to reconnect...
   🔄 Scheduling reconnection in 5s...
   ```

3. Check `http://localhost:5000/api/health` - should return 503 (degraded)

4. Restart MongoDB:
   ```bash
   net start MongoDB
   ```

5. Within 5 seconds, watch terminal for:
   ```
   ✅ MongoDB reconnected successfully!
   ```

6. Check health endpoint again - should return 200 (healthy)

**Expected:** ✅ Backend automatically recovers from database disconnection

---

### Test 3: Simulate Process Crash

1. Add a syntax error to any route file, save it
2. Nodemon will detect the change and try to restart
3. Watch terminal for crash message
4. Fix the syntax error and save again
5. Nodemon should restart the server successfully

**Expected:** ✅ Nodemon catches crash and restarts automatically

---

### Test 4: Close and Reopen Laptop (The Original Problem)

1. Start backend with `start-backend.bat`
2. Open frontend and verify it works
3. **Close your laptop** (sleep mode)
4. **Wait 5+ minutes**
5. **Reopen your laptop**
6. **Check frontend** - should reconnect automatically

**Expected:** ✅ Frontend no longer shows "Backend unreachable" message

---

## Troubleshooting

### Problem: "Backend unreachable" message still appears

**Solution Steps:**
1. Check if backend is running: `http://localhost:5000`
2. Check terminal for error messages
3. Verify MongoDB is running/connected (check logs)
4. Check .env file has correct MONGODB_URI
5. Check CORS origins in .env include `http://localhost:5173`

---

### Problem: MongoDB connection fails

**Error:** `MongoNetworkError: connect ECONNREFUSED`

**Solution:**
1. Ensure MongoDB is running:
   ```bash
   # Start MongoDB (Windows)
   mongod
   
   # Or if using MongoDB as service
   net start MongoDB
   ```

2. Check MONGODB_URI in .env:
   ```bash
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/lmsai
   ```

3. Test MongoDB connection directly:
   ```bash
   # Use MongoDB shell/compass to verify connection
   ```

---

### Problem: Port 5000 already in use

**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
1. Find and kill the process using port 5000:
   ```bash
   # PowerShell (Admin):
   Get-NetTCPConnection -LocalPort 5000 | Select-Object OwningProcess
   Get-Process -Id <PID> | Stop-Process -Force
   ```

2. Or change the port in .env:
   ```bash
   PORT=5001  # Use different port
   ```

---

### Problem: Unhandled rejection still crashes server

**Solution:**
- Ensure you updated `server.js` with the new process.on handlers
- Check that all Promises in code have `.catch()` handlers
- Use async/await with try-catch blocks:
  ```javascript
  async function myFunction() {
    try {
      await somePromise();
    } catch (error) {
      console.error('Caught error:', error);
      // Handle error
    }
  }
  ```

---

### Problem: Autostart script doesn't run

**Solution:**
1. Check Task Scheduler shows the task
2. Right-click task > Run to test it manually
3. Check `logs/autostart.log` for error messages
4. Ensure path in .vbs script matches your installation:
   ```vbs
   strBackendPath = "D:\LMS-Full Stock Project\LMS\MERNAI\ai-learning-assistant\backend\"
   ```

---

## Monitoring & Maintenance

### Daily Monitoring

1. Check backend health on startup:
   ```
   http://localhost:5000/api/health
   ```

2. Check detailed diagnostics if issues occur:
   ```
   http://localhost:5000/api/health/detailed
   ```

3. Monitor backend terminal for warnings or errors

---

### Logs and Debugging

**Development Logs:**
- Check terminal where `npm run dev` is running
- Error messages include unique ID (e.g., `ERR_1707901234567_abc123def`)

**Autostart Logs:**
- Check `backend/logs/autostart.log` if using VBS script
- Shows each startup attempt with timestamp

---

## Key Metrics from Health Endpoints

### `/api/health` Response
```json
{
  "status": "healthy|degraded",  // "healthy" = all good, "degraded" = DB issue
  "database": "connected|disconnected",
  "environment": "development|production",
  "timestamp": "ISO-8601 timestamp",
  "uptime": 12345  // seconds the server has been running
}
```

### `/api/health/detailed` Response Shows:
- Database connection state and responsiveness
- Memory usage (heap used/total, RSS)
- Node.js version
- Environment configuration
- Groq API configuration
- Full diagnostics for troubleshooting

---

## Production Deployment Checklist

If moving to production:

- [ ] Set `NODE_ENV=production` in .env
- [ ] Use environment-specific `.env.production` file
- [ ] Set strong JWT_SECRET (32+ random characters)
- [ ] Use MongoDB Atlas or production MongoDB server
- [ ] Set up proper CORS_ORIGINS (only production frontend URL)
- [ ] Use PM2 or similar process manager (not nodemon)
- [ ] Set up monitoring and alerting
- [ ] Configure log rotation
- [ ] Use HTTPS (not HTTP)
- [ ] Set secure database credentials
- [ ] Test health endpoints regularly

---

## Summary of Changes

| Component | Change | Benefit |
|-----------|--------|---------|
| **server.js** | Added process event handlers | Catches and logs crashes, graceful shutdown |
| **config/db.js** | Added auto-reconnection logic | Recovers from MongoDB disconnection |
| **config/routes.js** | Added root endpoint & health routes | Frontend can check backend status |
| **config/middleware.js** | Removed duplicate health checks | Cleaner code, no conflicts |
| **config/errorHandling.js** | Enhanced with more error types | Better error identification and logging |
| **nodemon.json** | Added crash recovery, extended watch | Auto-restart on file changes and crashes |
| **startup scripts** | Added .bat, .ps1, .vbs scripts | Easy manual and automatic startup |

---

## Support

If issues persist:

1. **Check logs first** - Terminal output and `backend/logs/autostart.log`
2. **Verify filesystem** - Use file explorer to confirm files exist
3. **Test endpoints** - Use browser to check health endpoints
4. **Review .env** - Ensure all required variables are set correctly
5. **Check processes** - Verify MongoDB and Node.js are running

---

**Last Updated:** February 14, 2026  
**Compatibility:** Windows 10+, Node.js 14+, MongoDB 4.0+
