# 🔴 FIXING "Backend unreachable — retrying automatically" ERROR

## 🎯 Diagnosis

This error appears on login page and means:

```
Frontend: "I tried to call the backend API at /api/health"
          ↓
Vite Proxy: "I'll forward that to http://localhost:5000"
          ↓
Connection Result: "ECONNREFUSED - Connection refused"
          ↓
Frontend: "Backend is unreachable!"
```

**ROOT CAUSE:** Backend is not listening on port 5000

---

## ✅ FIX: START THE BACKEND

This is the **only** solution to this error.

### Step 1: Open a Terminal/PowerShell

### Step 2: Navigate to Backend
```powershell
cd backend
```

### Step 3: Start the Server
```powershell
npm run dev
```

### Step 4: Wait for This Message
```
═══════════════════════════════════════════════════════════════════════════════
✅ SERVER STARTED SUCCESSFULLY
═══════════════════════════════════════════════════════════════════════════════
🚀 Backend Server
   Port: 5000
   Environment: development
   Binding: 0.0.0.0:5000 (all interfaces)

📊 Health Check Endpoints:
   GET /health              → Server alive check
   GET /api/health          → Quick health (with DB status)
   GET /api/health/detailed → Full diagnostics
═══════════════════════════════════════════════════════════════════════════════
```

### Step 5: Backend is Now Running
- Keep this terminal open (do NOT close it)
- Terminal will show requests from frontend in real-time
- Frontend app will work now

---

## 🆘 IF BACKEND FAILS TO START

### Error 1: "EADDRINUSE: Port 5000 already in use"

**Cause:** Something else is using port 5000

**Solution:**
```powershell
# Kill all Node processes
taskkill /F /IM node.exe

# Wait 2 seconds
ping 127.0.0.1 -n 3

# Try again
npm run dev
```

### Error 2: "Cannot connect to MongoDB"

**Cause:** MongoDB not running

**Solution:**
```powershell
# Start MongoDB
net start MongoDB

# Verify it's running
mongosh
# Should show: mongosh 2.x.x
exit()

# Then start backend
npm run dev
```

### Error 3: "CRITICAL: Unhandled bootstrap error"

**Cause:** Environment variables missing

**Solution:**
```powershell
# Check backend/.env has all required values
type .env

# Should have:
# PORT=5000
# MONGODB_URI=mongodb://localhost:...
# JWT_SECRET=...
# GROQ_API_KEY=...

# If any missing, add them and restart:
npm run dev
```

### Error 4: "EACCES: Permission denied"

**Cause:** Not allowed to use port 5000

**Solution:**
```powershell
# Use different port (edit backend/.env):
PORT=5001

# Then update vite.config.js line 7:
# target: 'http://localhost:5001'

# Then restart both:
npm run dev
```

---

## ✅ VERIFY BACKEND IS RUNNING

Open a **NEW** terminal (do NOT close the first one):

```powershell
# Test 1: Direct health check
curl http://localhost:5000/health
# Should return: {"ok":true,...}

# Test 2: API health check
curl http://localhost:5000/api/health
# Should return: {"status":"ok","database":"✅ Connected",...}

# If both return data → Backend is running ✅
# If both fail → Backend not started or crashed
```

---

## ✅ VERIFY FRONTEND SEES BACKEND

1. Open browser: http://localhost:5173
2. Login page should display (NO "Backend unreachable" banner)
3. Open DevTools (F12) → Console tab
4. Should show: `✅ Backend available`
5. If shows error: Backend is not running

---

## 🔄 THREE TERMINAL SETUP

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
# Leave running
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
# Leave running
```

**Terminal 3 - Testing:**
```powershell
# Test commands
curl http://localhost:5000/health
```

When both Terminal 1 and 2 show "ready", open browser at http://localhost:5173

---

## 🧪 QUICK VERIFICATION CHECKLIST

- [ ] Backend started with `npm run dev`
- [ ] Backend shows "✅ SERVER STARTED SUCCESSFULLY"
- [ ] Backend terminal shows "Port: 5000"
- [ ] `curl http://localhost:5000/health` returns 200
- [ ] Frontend started with `npm run dev`
- [ ] Browser opens http://localhost:5173
- [ ] Login page displays (no error banner)
- [ ] DevTools Console shows "✅ Backend available"
- [ ] Can enter email/password in login form
- [ ] Can click Login button

If all checked → Problem is FIXED ✅

---

## 📊 REAL-TIME DEBUGGING

### Watch Backend Console
When backend is running:
```
Every API call shows:
GET /api/auth/login
POST /api/chat/message
GET /api/health
```

### Watch Frontend Console (F12)
When frontend has health check issue:
```
❌ http proxy error: /api/health
ECONNREFUSED localhost:5000
```

### Watch Browser Network Tab (F12)
1. Open DevTools (F12)
2. Go to Network tab
3. Refresh page (Ctrl+R)
4. Look for requests:
   - /api/health should be red (failed) if backend not running
   - /api/health should be green (200 OK) if backend running

---

## ⏱️ TIMING

From startup to working:
1. Backend starts: 3-5 seconds
2. Frontend starts: 2-3 seconds
3. Browser loads: 2-3 seconds
4. Login page ready: 10 seconds total

**Total: 10-15 seconds from first npm run dev to usable app**

---

## 🔥 NUCLEAR OPTION: Complete Reset

If nothing works:

```powershell
# Terminal 1
# Kill all Node processes
taskkill /F /IM node.exe

# Terminal 2
# Delete node_modules (both frontend and backend)
cd backend
rm -r node_modules
npm install

cd ../frontend
rm -r node_modules
npm install

# Terminal 3
# Restart MongoDB
net stop MongoDB
net start MongoDB

# Terminal 4
# Start backend
cd backend
npm run dev

# Terminal 5 (different window)
# Start frontend
cd frontend
npm run dev

# Browser
# Open http://localhost:5173
```

---

## 📝 WHAT TO REPORT IF STILL BROKEN

If after following this guide the error persists, provide:

1. **Terminal output from backend startup:**
   ```powershell
   cd backend
   npm run dev
   # Copy entire output here
   ```

2. **Browser console error (F12):**
   - Screenshot of console
   - Exact error message

3. **Network tab error (F12):**
   - Screenshot showing /api/health request
   - Status code and response

4. **Verification results:**
   ```powershell
   curl http://localhost:5000/health
   # Copy response or "connection refused"
   ```

5. **Port check:**
   ```powershell
   netstat -ano | findstr ":5000"
   # Copy output
   ```

---

## 💡 KEY POINTS

- **Backend must be running** - No backend = "Backend unreachable"
- **Port 5000 must be free** - If in use, kill other process or change port
- **MongoDB must be running** - Some features need it
- **Keep terminal open** - Closing backend terminal stops backend
- **Frontend automatically connects** - When backend is running, no config needed

---

## 🎯 SUCCESS = Login Page Displays

When you see the login page with:
- Email input field
- Password input field
- Login button
- NO "Backend unreachable" banner

**CONGRATULATIONS - The connectivity issue is FIXED! 🎉**

You can now login. If login fails with an error, that's an auth issue (separate from connectivity).

---

**Start with: `cd backend && npm run dev` RIGHT NOW!**
