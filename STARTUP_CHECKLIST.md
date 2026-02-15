# ✅ COMPLETE STARTUP CHECKLIST

## 🎯 Quick Overview

Your MERN stack has:
- **Frontend:** Vite on http://localhost:5173
- **Backend:** Express on http://localhost:5000
- **Database:** MongoDB on mongodb://localhost:27017
- **Proxy:** Vite proxies /api → backend

The "Backend unreachable" error means **backend is not running**. This checklist fixes it.

---

## 📋 PRE-STARTUP VERIFICATION (5 min)

### 1. Check MongoDB is Running
```powershell
# Verify MongoDB is installed and running
mongosh
# Should show: mongosh 2.x.x version
# Then exit with: exit()
```

✅ **Fix if needed:**
```powershell
# Start MongoDB (if using local)
# Windows: MongoDB runs as service (should auto-start)
# Or start manually:
net start MongoDB
```

### 2. Verify Backend .env Configuration
```powershell
cd backend
type .env | findstr "PORT\|MONGODB_URI\|JWT_SECRET\|GROQ_API_KEY"
```

✅ **Expected output:**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-learning-assistant
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
GROQ_API_KEY=gsk_YOUR_GROQ_API_KEY_HERE
```

✅ **If missing:** Update backend/.env with all values above

### 3. Verify Frontend .env Configuration
```powershell
cd frontend
type .env | findstr "VITE_API_URL\|VITE_BACKEND_URL"
```

✅ **Expected output:**
```
VITE_API_URL=/api
VITE_BACKEND_URL=http://127.0.0.1:5000
```

✅ **If missing:** Update frontend/.env with values above

### 4. Check Port 5000 Not in Use
```powershell
netstat -ano | findstr ":5000"
```

✅ **Expected:** No output (port is free)

❌ **If output shown:** Port 5000 is in use
```powershell
# Option 1: Kill process on port 5000
taskkill /F /IM node.exe

# Option 2: Use different port
# Edit backend/.env: PORT=5001 (then update frontend proxy)
```

---

## 🚀 STARTUP SEQUENCE (10 min)

### Step 1: Start MongoDB (if not auto-running)
```powershell
# Check if running:
mongosh
# If connects → already running → exit
# If fails → Start it:
net start MongoDB
```

### Step 2: Start Backend Server
```powershell
cd backend
npm run dev
```

✅ **Look for this message:**
```
═══════════════════════════════════════════════════════════════════════════════
✅ SERVER STARTED SUCCESSFULLY
═══════════════════════════════════════════════════════════════════════════════
🚀 Backend Server
   Port: 5000
   Environment: development
   Binding: 0.0.0.0:5000 (all interfaces)
   Binding: development

📊 Health Check Endpoints:
   GET /health              → Server alive check
   GET /api/health          → Quick health (with DB status)
   GET /api/health/detailed → Full diagnostics
═══════════════════════════════════════════════════════════════════════════════
```

❌ **If you see error:**

**Error: "EADDRINUSE: address already in use"**
```powershell
# Port 5000 is already in use
taskkill /F /IM node.exe
# Wait 2 seconds, then try: npm run dev
```

**Error: "MongoNetworkError" or "connection refused"**
```powershell
# MongoDB not running
mongosh
# Should connect
# If fails, start mongodb: net start MongoDB
```

**Error: "CRITICAL: Unhandled bootstrap error"**
```powershell
# Check backend/.env has all values:
# PORT=5000
# MONGODB_URI=<correct value>
# JWT_SECRET=<set>
# GROQ_API_KEY=<set>
```

✅ **Once backend shows startup message, go to Step 3** (do NOT close this terminal)

### Step 3: Start Frontend Server (New Terminal)
```powershell
# Open NEW PowerShell window
cd frontend
npm run dev
```

✅ **Look for:**
```
  VITE v5.x.x  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

❌ **If errors:**

**Error: "ERR_CONNECTION_REFUSED on /api/health"**
- ✅ Backend is not running
- ✅ Go back to Step 2 and start backend

**Error: "Port 5173 already in use"**
```powershell
taskkill /F /IM node.exe
# Wait, then: npm run dev
```

---

## 🧪 CONNECTIVITY TEST (2 min)

### Test 1: Backend Health Check
```powershell
# New terminal (3rd window)
curl http://localhost:5000/health
```

✅ **Expected response:**
```json
{"ok":true,"timestamp":"...","uptime":...}
```

### Test 2: Backend API Health Check
```powershell
curl http://localhost:5000/api/health
```

✅ **Expected response:**
```json
{"status":"ok","database":"✅ Connected","timestamp":"..."}
```

### Test 3: Open Frontend in Browser
```
http://localhost:5173
```

✅ **You should see:**
- Login page displays
- NO "Backend unreachable" banner
- NO error messages in browser console (F12)

### Test 4: Browser Console Check (F12)
Open DevTools → Console tab

✅ **Should show:**
```
✅ Backend available
```

❌ **If shows error:**
1. Click Network tab
2. Refresh page (Ctrl+R)
3. Look for failed requests
4. If /api/health fails → backend not running
5. If auth/login fails → check credentials

### Test 5: Login Test
1. Use test credentials:
   - Email: `test@example.com`
   - Password: `password123`
2. Click Login
3. Check backend console for request
4. Check browser Network tab for response

✅ **Success:** Login works or shows proper error (not connection error)

---

## 📊 DIAGNOSTICS

### If "Backend unreachable" still shows:

#### 1. Check Backend is Actually Running
```powershell
# Terminal should show:
# "✅ SERVER STARTED SUCCESSFULLY"
# If not visible, backend crashed
```

#### 2. Check Vite Proxy Error
```powershell
# In frontend terminal, look for:
# 🔴 PROXY ERROR - CRITICAL!
# This tells you exactly what's wrong
```

#### 3. Check Browser Console (F12)
```
1. Open DevTools (F12)
2. Go to Console tab
3. Look for red errors
4. Common errors:
   - ERR_CONNECTION_REFUSED → Backend not running
   - CORS error → Check backend CORS config
   - Timeout → Backend too slow
```

#### 4. Check Network Tab (F12)
```
1. In DevTools, open Network tab
2. Refresh page (Ctrl+R)
3. Look for requests:
   - /api/health should return 200 OK
   - If fails → backend not running
   - If CORS error → check CORS config
```

#### 5. Test Direct Backend Connection
```powershell
# Try connecting directly to backend
curl -v http://localhost:5000/health

# Should show:
# < HTTP/1.1 200 OK
# {"ok":true...}
```

---

## 🔧 COMMON SOLUTIONS

### Problem: Backend crashes on startup

**Solution:**
```powershell
# 1. Check MongoDB
mongosh
# Should connect

# 2. Check .env has all values
type backend\.env | findstr "MONGODB_URI"

# 3. Delete node_modules and reinstall
cd backend
rm -r node_modules
npm install
npm run dev
```

### Problem: Port 5000 already in use

**Solution:**
```powershell
# Method 1: Kill all Node processes
taskkill /F /IM node.exe

# Method 2: Use different port
# Edit backend/.env:
# PORT=5001
# Then update Vite proxy in frontend/vite.config.js:
# target: 'http://localhost:5001'
```

### Problem: Frontend still shows "Backend unreachable"

**Solution:**
```powershell
# 1. Clear browser cache
# Ctrl+Shift+Delete → Clear all time

# 2. Restart frontend
# In frontend terminal: Ctrl+C
# Then: npm run dev

# 3. Hard refresh browser
# Ctrl+Shift+R (forces clear cache)

# 4. Check backend is actually running
curl http://localhost:5000/health
# If fails → backend not running
```

### Problem: GET /health returns 404

**Solution:**
```powershell
# Backend routes not set up correctly
# Edit backend/config/routes.js
# Verify this exists:
# app.get('/health', (req, res) => { ... })

# Or restart backend to reload routes:
# In backend terminal: Ctrl+C
# Then: npm run dev
```

---

## ✅ SUCCESS INDICATORS

You know it's working when:

1. ✅ Backend terminal shows: "✅ SERVER STARTED SUCCESSFULLY"
2. ✅ Frontend terminal shows: "Local: http://localhost:5173/"
3. ✅ Browser shows login page (NO "Backend unreachable")
4. ✅ DevTools Console shows: "✅ Backend available"
5. ✅ curl http://localhost:5000/health returns 200 OK
6. ✅ Browser Network tab shows /api/health with status 200
7. ✅ Can enter email/password in login form
8. ✅ Can submit login (either succeeds or shows proper error)

---

## 📱 THREE TERMINAL LAYOUT

Recommended setup:

**Terminal 1 (Backend):**
```
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```
cd frontend
npm run dev
```

**Terminal 3 (Testing):**
```
curl http://localhost:5000/health
curl http://localhost:5000/api/health
# Plus any testing commands
```

---

## ⏱️ TIMING EXPECTATIONS

- Backend startup: 3-5 seconds
- Frontend startup: 2-3 seconds
- First page load: 2-3 seconds
- Health check response: <100ms

If slower, your machine might be slow or MongoDB needs indexing.

---

## 🎯 NEXT STEPS

1. ✅ Follow this startup sequence now
2. ✅ Test all connectivity
3. ✅ Share any error messages you see
4. ✅ If issues, check the terminal output carefully

**Most issues**: Backend not started or MongoDB not running. Verify Step 1-3 first!
