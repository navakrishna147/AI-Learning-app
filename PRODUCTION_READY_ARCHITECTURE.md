# 🏗️ PRODUCTION-READY MERN ARCHITECTURE - Complete Guide

**Date**: February 13, 2026  
**Status**: ✅ Fully Documented & Implementation Complete  
**Severity**: Critical Architecture Review & Fix

---

## 📋 TABLE OF CONTENTS

1. [Root Cause Analysis](#root-cause-analysis)
2. [Architecture Overview](#architecture-overview)
3. [Configuration Files](#configuration-files)
4. [Installation & Startup](#installation--startup)
5. [System Verification](#system-verification)
6. [Troubleshooting](#troubleshooting)
7. [Production Deployment](#production-deployment)

---

## 🔍 ROOT CAUSE ANALYSIS

### Problem Statement
```
Error: ECONNREFUSED - Backend unreachable from Vite proxy
Symptoms:
  - Login page shows "Backend unreachable"
  - Vite proxy reports ECONNREFUSED on /api/health
  - Frontend and backend on different unpredictable ports
```

### Root Causes Identified

#### **Issue #1: PORT FALLBACK TRAP** ⚠️ CRITICAL
```javascript
// ❌ OLD server.js - PROBLEMATIC
const nextPort = port === 5000 ? 50001 : (port + 1000);
// Problem: 
// - If port 5000 taken → backend silently goes to 50001
// - Frontend expects 5000 → connection refused
// - Creates unpredictable port binding
```

**Fix Applied**:
```javascript
// ✅ NEW server.js - DETERMINISTIC
if (err.code === 'EADDRINUSE') {
  console.error(`❌ FATAL: Port ${port} is already in use!`);
  console.error(`   Kill existing process or change PORT in .env`);
  process.exit(1); // Fail loudly instead of silently falling back
}
```

#### **Issue #2: HARDCODED PORT FALLBACK IN API SERVICE**
```javascript
// ❌ OLD api.js
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:50001';
// Problem: Falls back to 50001 when env var not set
```

**Fix Applied**:
```javascript
// ✅ NEW api.js
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
// Now falls back to correct default port
```

#### **Issue #3: NO PORT VERIFICATION BEFORE STARTUP**
The backend didn't verify if the port was available before trying to bind.

**Fix Applied**: Added explicit error handling with helpful guidance.

#### **Issue #4: RACE CONDITIONS**
Frontend startup independent of backend startup.

**Fix Applied**: Added exponential backoff health checks with auto-retry.

#### **Issue #5: INCONSISTENT PORT CONFIGURATION**
Port defined in 3+ places with different values.

**Fix Applied**: Centralized configuration in `.env` files.

---

## 🏗️ ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────┐
│                    USER BROWSER                          │
│              (http://localhost:5173)                     │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│            VITE DEV SERVER (Port 5173)                   │
│  ┌─────────────────────────────────────────────────────┴─┐
│  │  ✅ React Application                                  │
│  │  ✅ Hot Module Replacement (HMR)                      │
│  │  ✅ Development Proxy (/api/*)                        │
│  │                                                        │
│  │  Proxy Configuration:                                 │
│  │  ┌──────────────────────────────────────────────────┐└─┐
│  │  │ Target: http://localhost:5000                     │  │
│  │  │ Path: /api/* → backend:/api/*                    │  │
│  │  │ ChangeOrigin: true                               │  │
│  │  │ WebSocket: true                                  │  │
│  │  └──────────────────────────────────────────────────┘  │
└──────────────────┬────────────────────────────────────────┘
                   │
      HTTP/HTTPS Proxy Forward
      All /api/* requests
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│        EXPRESS BACKEND SERVER (Port 5000)               │
│  ┌─────────────────────────────────────────────────────┐│
│  │  ✅ Authentication Routes (/api/auth/*)             ││
│  │  ✅ Document Routes (/api/documents/*)              ││
│  │  ✅ Chat Routes (/api/chat/*)                       ││
│  │  ✅ Health Check Route (/api/health)                ││
│  │  ✅ Graceful Error Handling                         ││
│  │  ✅ CORS Middleware                                 ││
│  │                                                      ││
│  │  Server Details:                                    ││
│  │  - Host: 0.0.0.0 (all interfaces)                  ││
│  │  - Port: ${process.env.PORT} (default: 5000)       ││
│  │  - Instance: Single, non-fallback                   ││
│  │  - Connection: Deterministic & predictable          ││
│  └─────────────────────────────────────────────────────┘│
└──────────────────┬────────────────────────────────────────┘
                   │
          Database & Services
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
    ┌────────┐           ┌──────────────┐
    │  MongoDB            Anthropic API  │
    │  :27017             (External)    │
    └────────┘           └──────────────┘
```

### Data Flow

```
User Login Flow:
1. User enters credentials on http://localhost:5173/login
2. Frontend sends: POST /api/auth/login
3. Vite proxy intercepts: /api/auth/login
4. Proxy forwards: http://localhost:5000/api/auth/login
5. Backend validates credentials
6. Backend returns: { success: true, token, user }
7. Frontend stores token in localStorage
8. Frontend redirects to dashboard
9. All subsequent requests use Authorization header
```

---

## 📁 CONFIGURATION FILES

### 1. Backend `.env` Configuration

**File: `backend/.env`**

```dotenv
# ========== SERVER CONFIGURATION ==========
# CRITICAL: This PORT must match frontend proxy target
PORT=5000
NODE_ENV=development

# ========== DATABASE CONFIGURATION ==========
MONGODB_URI=mongodb://localhost:27017/ai-learning-assistant
MONGODB_TIMEOUT=10000

# ========== AUTHENTICATION CONFIGURATION ==========
# Generate strong secret: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# ========== FILE UPLOAD CONFIGURATION ==========
MAX_FILE_SIZE=10485760  # 10MB in bytes

# ========== EMAIL CONFIGURATION ==========
# Optional: For forgot password functionality
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:5173

# ========== AI SERVICE CONFIGURATION ==========
ANTHROPIC_API_KEY=sk-ant-...

# ========== CORS CONFIGURATION ==========
# Optional: Specify allowed origins (leave empty for localhost detection)
VITE_BACKEND_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 2. Frontend `.env` Configuration

**File: `frontend/.env`**

```dotenv
# ========== API CONFIGURATION ==========
# IMPORTANT: In development, always use /api (proxy path)
# In production, use absolute URL to backend
VITE_API_URL=/api

# ========== BACKEND URL ==========
# CRITICAL: Must match backend PORT in backend/.env
# Used for direct health checks (when not using proxy)
# Dev (with Vite proxy): http://localhost:5000
# Production: https://api.yourdomain.com
VITE_BACKEND_URL=http://localhost:5000

# ========== API TIMEOUT ==========
# Milliseconds before request times out
VITE_API_TIMEOUT=30000

# ========== ENVIRONMENT ==========
VITE_ENV=development
```

### 3. Vite Configuration

**File: `frontend/vite.config.js`**

```javascript
// Key sections:
// 1. Port: 5173 (Vite dev server)
// 2. Proxy: /api/* → http://localhost:5000
// 3. HMR: ws://localhost:5173 (Hot Module Replacement)
// 4. strictPort: true (fail if port taken)
```

### 4. Backend Server Configuration

**File: `backend/server.js`**

```javascript
// Key improvements:
// 1. No port fallback - fail loudly if in use
// 2. Graceful shutdown with timeout
// 3. Comprehensive error handling
// 4. Production-grade logging
// 5. Health check endpoints
```

### 5. Frontend API Service

**File: `frontend/src/services/api.js`**

```javascript
// Key features:
// 1. Exponential backoff retry logic
// 2. Circuit breaker pattern
// 3. Comprehensive error classification
// 4. Singleton health check manager
// 5. Automatic recovery detection
```

---

## 🚀 INSTALLATION & STARTUP

### Prerequisites

```bash
# Check Node.js version (need 14+)
node --version

# Check npm version (need 6+)
npm --version

# Verify MongoDB is running
# Windows: Check Services for MongoDB
# macOS: brew services list | grep mongodb
# Linux: systemctl status mongod
```

### Complete Setup Steps

#### Step 1: Backend Setup

```bash
# Navigate to backend
cd ai-learning-assistant/backend

# Install dependencies
npm install

# Create .env file (if not exists)
cp .env.example .env  # or create manually

# Verify PORT=5000 in .env
cat .env  # or type .env (Windows)

# Start backend
npm run dev
```

**Expected Output**:
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
GET /
GET /api/health
```

#### Step 2: Frontend Setup

```bash
# In NEW terminal, navigate to frontend
cd ai-learning-assistant/frontend

# Install dependencies
npm install

# Verify .env has VITE_BACKEND_URL=http://localhost:5000
cat .env

# Start frontend
npm run dev
```

**Expected Output**:
```
 VITE v5.0.8  ready in 245 ms

 ➜  Local:   http://localhost:5173/
 ➜  Press h to show help
```

#### Step 3: Verify Connection

Open browser to **http://localhost:5173**

**Verification Checklist**:

```
✅ Frontend loads on http://localhost:5173
✅ No "Backend unreachable" error on login page
✅ Browser console shows proxy logs:
   📤 Proxy Request: GET /api/health
   📥 Proxy Response: 200 /api/health
✅ Login form is visible and interactive
```

---

## ✅ SYSTEM VERIFICATION

### 1. Health Check via Browser Console

```javascript
// In browser developer console (F12):

// Check health status
await fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(console.log);

// Expected response:
// { status: 'ok', message: 'Backend is running successfully', timestamp: '2026-02-13T...' }
```

### 2. Health Check via Backend Proxy

```javascript
// Frontend should route through proxy automatically
// In browser console:

// This goes through Vite proxy to backend
fetch('/api/health')
  .then(r => r.json())
  .then(console.log);
```

### 3. Terminal Health Check

**Check Backend Health**:

```powershell
# PowerShell
curl http://localhost:5000/api/health

# Expected:
# {"status":"ok","message":"Backend is running successfully","timestamp":"2026-02-13T..."}
```

**Check Frontend Proxy**:

```powershell
# While frontend is running, test proxy
curl http://localhost:5173/api/health

# Expected: Same as backend response
```

### 4. Test Complete Login Flow

```bash
# Terminal 1: Backend (running on 5000)
cd backend && npm run dev

# Terminal 2: Frontend (running on 5173)
cd frontend && npm run dev

# Terminal 3: Test login API
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Expected response (if user exists):
# {
#   "success": true,
#   "token": "eyJhbGc...",
#   "user": { "_id": "...", "email": "test@example.com", ... }
# }
```

### 5. Monitor Logs in Development

**Backend Terminal** - Look for:
```
✅ SERVER STARTED SUCCESSFULLY
📍 URL: http://localhost:5000
GET /api/auth/login
❌ Login error: Invalid email or password
(or)
✅ User logged in: user@example.com
```

**Frontend Terminal** - Look for:
```
📤 Proxy Request: POST /api/auth/login
📥 Proxy Response: 200 /api/auth/login
✅ Token attached to request
📥 API Response: 200 /api/auth/login
```

---

## 🔧 TROUBLESHOOTING

### Problem 1: "Port 5000 already in use"

**Symptoms**:
```
❌ FATAL: Port 5000 is already in use!
   Kill existing process or change PORT in .env
```

**Solution A - Kill Process** (Windows):
```powershell
# Find process on port 5000
netstat -ano | findstr :5000
# Output: TCP    127.0.0.1:5000    LISTENING    1234

# Kill process by PID
taskkill /PID 1234 /F

# Verify port is free
netstat -ano | findstr :5000
# Should return empty
```

**Solution B - Change Port**:
```dotenv
# backend/.env
PORT=5001  # (instead of 5000)
```

Then update frontend:
```dotenv
# frontend/.env
VITE_BACKEND_URL=http://localhost:5001
```

---

### Problem 2: "ECONNREFUSED" on Backend Health Check

**Symptoms**:
```
🔴 Proxy Error: ECONNREFUSED
Backend Connection Error: Cannot connect to backend - server may be offline
```

**Root Causes & Solutions**:

1. **Backend not running**:
   ```bash
   # Terminal check
   cd backend && npm run dev
   # Should show: ✅ SERVER STARTED SUCCESSFULLY
   ```

2. **Wrong PORT in backend/.env**:
   ```bash
   # Check
   cat backend/.env | grep PORT
   # Should show: PORT=5000
   ```

3. **Frontend pointing to wrong backend**:
   ```bash
   # Check
   cat frontend/.env | grep VITE_BACKEND_URL
   # Should show: VITE_BACKEND_URL=http://localhost:5000
   ```

4. **Frontend not seeing updated .env**:
   ```bash
   # Solution: Kill frontend and restart
   # Terminal with frontend: Ctrl+C
   cd frontend && npm run dev
   ```

---

### Problem 3: "Cannot GET /api/*" on Frontend

**Symptoms**: 404 errors when making API calls

**Solution**:
```
1. Verify backend is serving /api/* routes
   curl http://localhost:5000/api/health ✅

2. Verify frontend proxy config
   Check: vite.config.js has proxy for /api

3. Verify .env variables loaded
   Frontend: npm run dev (restart)
   Backend: npm run dev (restart)
```

---

### Problem 4: CORS Errors in Console

**Symptoms**:
```
Access to XMLHttpRequest at 'http://localhost:5000' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solution**: Check backend CORS configuration in `server.js`:

```javascript
// Should see:
app.use(cors({
  origin: (origin) => {
    if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return true;
    return false;
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
}));
```

---

### Problem 5: API Calls Timeout

**Symptoms**:
```
Request timeout - backend taking too long to respond
```

**Solutions**:
1. Increase timeout in frontend/.env:
   ```dotenv
   VITE_API_TIMEOUT=60000  # 60 seconds
   ```

2. Check backend is responding:
   ```bash
   curl -v http://localhost:5000/api/health
   ```

3. Check MongoDB connection:
   ```bash
   # Backend log should show:
   MongoDB Connected
   ```

---

## 🏢 PRODUCTION DEPLOYMENT

### Pre-Production Checklist

```
□ All environment variables set in production
□ MongoDB connection string points to production DB
□ JWT_SECRET is strong and changed
□ ANTHROPIC_API_KEY is valid
□ Frontend built: npm run build
□ Backend tests pass
□ HTTPS/SSL certificates configured
□ CORS configured for production domains only
□ Rate limiting enabled
□ Database backups configured
□ Monitoring & logs configured
```

### Production Environment Variables

**Backend Production**:
```dotenv
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=<generate-strong-secret>
VITE_BACKEND_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

**Frontend Production**:
```dotenv
VITE_API_URL=/api
VITE_BACKEND_URL=https://api.yourdomain.com
VITE_ENV=production
```

### Docker Deployment

```dockerfile
# Dockerfile.backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]

# Dockerfile.frontend
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

### Kubernetes Deployment

See `helm/values.yaml` for k8s configuration.

---

## 📞 SUPPORT REFERENCE

| Issue | Cause | Solution |
|-------|-------|----------|
| ECONNREFUSED | Backend not running | `npm run dev` in backend folder |
| Port in use | Process already on port | `taskkill /PID <pid> /F` |
| 404 on /api | Vite proxy misconfigured | Check vite.config.js proxy section |
| CORS error | Frontend URL not allowed | Add to CORS whitelist in server.js |
| Timeout | Backend slow | Check MongoDB, increase timeout |
| Token invalid | Session expired | Login again |
| 500 error | Backend error | Check backend logs, error ID |

---

## ✨ Summary

### What Was Fixed

| Issue | Before | After |
|-------|--------|-------|
| Port binding | Fallback to 50001 | Fail loudly at 5000 |
| Health checks | No exponential backoff | Exponential backoff + jitter |
| Error handling | Generic "Failed" | Detailed error classification |
| Proxy | Basic configuration | Production-grade with logging |
| Retries | Fixed 3-second interval | Smart exponential backoff |
| API errors | Unknown origin | Enhanced context & debugging |
| Backend startup | Silent port changes | Loud, deterministic failure |

### Architecture Improvements

✅ **Deterministic**: Same port every time
✅ **Resilient**: Automatic retry with backoff
✅ **Observable**: Detailed logging for debugging
✅ **Maintainable**: Clear configuration structure
✅ **Scalable**: Production-ready patterns
✅ **Recovery**: Graceful degradation & auto-recovery

---

**Generated**: 2026-02-13
**Version**: 1.0.0 (Production Ready)
