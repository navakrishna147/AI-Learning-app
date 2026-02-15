# 🚀 Production-Grade MERN Stack Hardening - COMPLETE GUIDE

## Executive Summary

Your MERN stack has been hardened with **production-grade reliability improvements**. This document explains what was fixed, how to deploy, and how to troubleshoot issues.

**Status:** ✅ **READY FOR PRODUCTION**

---

## 📋 What Was Fixed

### Backend Architecture Improvements

#### 1. **Environment Validation** ✅
- Validates all required environment variables at startup
- Fails immediately with clear errors if config is missing
- Supports development and production modes
- New: `CLIENT_URL` for explicit frontend CORS configuration

#### 2. **Port Conflict Detection** ✅
- Detects and prevents port conflicts with detailed error messages
- Shows exact command to kill conflicting processes
- Provides solutions for Windows, Mac, and Linux
- Verifies actual port binding before declaring success

#### 3. **Process Error Handlers** ✅
- `process.on('unhandledRejection')` - catches promise rejections
- `process.on('uncaughtException')` - catches sync errors
- `process.on('SIGTERM'/'SIGINT')` - graceful shutdown
- All errors logged with unique ID for tracking

#### 4. **Database Connection Resilience** ✅
- Event listeners set up BEFORE connection (prevents race conditions)
- Aggressive TCP keepalive for sleep/wake recovery
- Automatic reconnection with exponential backoff (2s → 10s)
- Blocks startup if DB fails in production, warns in development
- Detailed connection pool monitoring

#### 5. **Health Monitoring** ✅
Three health endpoints for different needs:
- `GET /health` - Ultra-lightweight (always 200 if server alive)
- `GET /api/health` - Quick check (includes DB status)
- `GET /api/health/detailed` - Full diagnostics (memory, pools, etc.)

#### 6. **CORS Hardening** ✅
- Uses `CLIENT_URL` environment variable for production
- Supports multiple origins for staging/domains
- Enables credentials safely
- Falls back to localhost variants in development

#### 7. **Startup Sequence** ✅
Strictly ordered bootstrap:
1. Environment variables loaded
2. Filesystem initialized
3. Environment validated
4. Database connected (blocking)
5. Express app initialized
6. Routes registered
7. Error handling configured
8. HTTP server started (after DB ready)
9. Port binding verified

### Frontend Architecture Improvements

#### 1. **Vite Proxy Configuration** ✅
- Forwards `/api/*` to backend without CORS issues
- Uses 127.0.0.1 instead of localhost (faster DNS resolution)
- Detailed error diagnostics for proxy failures
- Guides user through troubleshooting steps

#### 2. **Health Check Manager** ✅
- Exponential backoff for retries (1s → 30s)
- Circuit breaker pattern to prevent hammering
- Tries both proxy and direct URL
- Detailed error logging for debugging

#### 3. **Axios Error Handling** ✅
- Distinguishes ECONNREFUSED, timeout, network errors
- Provides specific solutions for each error type
- Logs request context for debugging
- Graceful degradation when backend unavailable

#### 4. **Environment Configuration** ✅
- Separate `.env` files for local and production
- Clear comments on what values to use
- Examples provided for all scenarios
- Production build uses absolute URLs

### Documentation Improvements

#### 1. **Example .env Files** ✅
- `.env.local-example` - Local development with local MongoDB
- `.env.production-example` - Cloud MongoDB with real domain
- `frontend/.env.local-example` - Frontend development
- `frontend/.env.production-example` - Frontend production build

#### 2. **This Verification Guide** ✅
- Step-by-step startup instructions
- Troubleshooting by error type
- Port conflict resolution
- Production deployment checklist

---

## 🚀 Quick Start - Local Development

### Prerequisites
- Node.js 16+ installed
- MongoDB running locally (or MongoDB Atlas account)
- Two terminal windows

### Step 1: Copy Environment Files

```bash
# Backend
cd backend
cp .env.local-example .env
```

**Edit `backend/.env` and set:**
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-learning-assistant
JWT_SECRET=dev_secret_key_change_this_in_production
GROQ_API_KEY=gsk_your_actual_key_from_groq
```

```bash
# Frontend
cd frontend
cp .env.local-example .env
```

**Edit `frontend/.env` (or use defaults):**
```
VITE_API_URL=/api
VITE_BACKEND_URL=http://127.0.0.1:5000
```

### Step 2: Start MongoDB (if using local)

**Windows:**
```bash
mongod --dbpath "C:\data\db"
```

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo service mongod start
```

**Or use MongoDB Atlas (cloud):**
- Create account at https://www.mongodb.com/cloud/atlas
- Create cluster and database user
- Copy connection string to `MONGODB_URI` in `.env`

### Step 3: Start Backend

```bash
cd backend
npm install
npm run dev
```

Expected output:
```
═══════════════════════════════════════════════════════════
✅ APPLICATION STARTED SUCCESSFULLY
═══════════════════════════════════════════════════════════
🚀 Server Port: 5000 (verified listening)
🌍 Binding: 0.0.0.0:5000 (all network interfaces)
🔧 Environment: development
💾 Database: ✅ Connected
🤖 AI Service: ✅ Configured
🔒 CORS Origins (4):
   1. http://localhost:5173
   2. http://localhost:5174
   3. http://127.0.0.1:5173
   4. http://127.0.0.1:5174

📊 Health Check Endpoints:
   GET http://localhost:5000/health
   GET http://localhost:5000/api/health
   GET http://localhost:5000/api/health/detailed
═══════════════════════════════════════════════════════════
```

### Step 4: Verify Backend Health

Open browser and test:
- http://localhost:5000/health → Should return `{ status: "OK", ... }`
- http://localhost:5000/api/health → Should return database status

If successful, continue. If not, see **Troubleshooting** section below.

### Step 5: Start Frontend

In a new terminal:
```bash
cd frontend
npm install
npm run dev
```

Expected output:
```
  ➜  Local:   http://localhost:5173/
  ➜  Press h to show help
```

### Step 6: Test Application

Open browser to: http://localhost:5173/login

You should see the login page without "Backend unreachable" errors.

Test by logging in with valid credentials.

---

## 🔧 Troubleshooting by Error Type

### ❌ Error: "Backend unreachable — retrying automatically"

**Cause:** Frontend cannot connect to backend

**Solutions (in order):**

1. **Verify backend is running:**
   ```bash
   # In backend terminal, you should see:
   ✅ APPLICATION STARTED SUCCESSFULLY
   🚀 Server Port: 5000 (verified listening)
   ```

2. **Test backend health endpoint:**
   ```bash
   # Browser, visit:
   http://localhost:5000/health
   
   # Should return 200 OK with JSON response
   ```

3. **Check backend port:**
   ```bash
   # Windows
   netstat -ano | findstr :5000
   
   # Mac/Linux
   lsof -i :5000
   ```

4. **If port 5000 is in use:**
   ```bash
   # Kill the process (Windows)
   taskkill /PID <pid> /F
   
   # Or change PORT in backend/.env to 5001
   # Then update frontend with new port
   ```

5. **Check MongoDB is running:**
   ```bash
   # Windows: mongod --dbpath "C:\data\db"
   # macOS: brew services list | grep mongodb
   # Linux: sudo service mongod status
   ```

### ❌ Error: "ECONNREFUSED"

**This means:** Backend is not listening on the expected port

**Check:**
1. Backend process is actually running (not crashed)
2. Port number is correct (default: 5000)
3. No firewall blocking localhost:5000
4. Not running as different user with permissions issues

**Fix:**
```bash
# Restart backend with debug output
cd backend
npm run dev

# Look for any startup errors
# Should see: "✅ APPLICATION STARTED SUCCESSFULLY"
```

### ❌ Error: "Port 5000 is already in use!"

**Cause:** Another process is using port 5000

**Fix (Windows):**
```bash
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill it
taskkill /PID 12345 /F

# Or use a different port
# Edit backend/.env: PORT=5001
# Then restart backend
```

**Fix (Mac/Linux):**
```bash
# Find what's using port 5000
lsof -i :5000

# Kill it
kill -9 12345

# Or use a different port
```

### ❌ Error: "Cannot connect to database"

**Cause:** MongoDB is not running or connection string is wrong

**Verify:**
```bash
# Check connection string in backend/.env
MONGODB_URI=mongodb://localhost:27017/ai-learning-assistant

# If using local MongoDB, ensure it's running
# Windows: mongod --dbpath "C:\data\db"

# If using MongoDB Atlas:
# 1. String should be: mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/dbname
# 2. Check username/password are correct
# 3. Ensure your IP is whitelisted in Atlas (Settings → Network Access)
```

**Check connection:**
```bash
# Use mongosh (MongoDB shell)
mongosh "mongodb://localhost:27017"

# If successful, you'll see: "test>"
# Type: exit to close
```

### ⚠️ Warning: "Health check failed, retrying..."

**Cause:** Backend is starting up, haven't had time to connect to DB yet

**Solution:** This is normal during startup. Wait 5-10 seconds and refresh the page.

### ❌ Error: "Validation Error: Missing required: GROQ_API_KEY"

**Cause:** GROQ_API_KEY is not set in `.env`

**Fix:**
```bash
# Get API key from https://console.groq.com/keys

# Add to backend/.env:
GROQ_API_KEY=gsk_your_actual_key_here
```

---

## ✅ Startup Verification Checklist

Before deploying to production, verify all items:

### Backend Checklist

- [ ] **Environment File**
  - [ ] Copy `.env.local-example` to `.env` (dev) or configure production secrets
  - [ ] `NODE_ENV` is set correctly
  - [ ] `PORT=5000` (or your custom port)
  - [ ] `MONGODB_URI` points to valid MongoDB
  - [ ] `JWT_SECRET` is set (32+ chars for production)
  - [ ] `GROQ_API_KEY` is set (optional but recommended)
  - [ ] `CLIENT_URL` is set for production CORS

- [ ] **Database**
  - [ ] MongoDB is running (local or cloud)
  - [ ] Connection string is correct
  - [ ] Database user has correct permissions
  - [ ] IP whitelist includes deployment IP (if cloud)

- [ ] **Startup Test**
  - [ ] `npm install` completes without errors
  - [ ] `npm run dev` shows "✅ APPLICATION STARTED SUCCESSFULLY"
  - [ ] No "Port already in use" errors
  - [ ] No "Database connection failed" errors

- [ ] **Health Endpoints**
  - [ ] `http://localhost:5000/health` returns 200
  - [ ] `http://localhost:5000/api/health` returns healthy status
  - [ ] Database shows as connected

- [ ] **Error Handlers**
  - [ ] All console logs are clear and helpful
  - [ ] No unhandled errors appear in startup logs

### Frontend Checklist

- [ ] **Environment File**
  - [ ] Copy `.env.local-example` to `.env` (dev) or `.env.production` for build
  - [ ] `VITE_API_URL=/api` (development) or absolute URL (production)
  - [ ] `VITE_BACKEND_URL` matches backend domain/port

- [ ] **Dependencies**
  - [ ] `npm install` completes without errors
  - [ ] All axios dependencies are listed in package.json

- [ ] **Startup Test**
  - [ ] `npm run dev` starts successfully on port 5173
  - [ ] No proxy errors shown in console
  - [ ] Browser shows http://localhost:5173/login

- [ ] **Backend Connection**
  - [ ] Login page loads without "Backend unreachable"
  - [ ] Try logging in with test credentials
  - [ ] Network tab shows successful `/api/...` requests
  - [ ] No CORS errors in console

### Production Deployment Checklist

- [ ] **Backend (Server)**
  - [ ] Environment file has production secrets (not dev values)
  - [ ] `CLIENT_URL` is set to actual frontend domain
  - [ ] `MONGODB_URI` points to production MongoDB (Atlas recommended)
  - [ ] `JWT_SECRET` is strong random string (32+ chars)
  - [ ] `GROQ_API_KEY` is production key
  - [ ] Deployed to server (Heroku, Railway, VPS, Docker, etc.)
  - [ ] Health endpoint accessible: `https://api.yourdomain.com/health`
  - [ ] Database can be reached from server

- [ ] **Frontend (Static)**
  - [ ] Build created: `npm run build`
  - [ ] `dist/` folder contains built app
  - [ ] Environment is set for production:
    - [ ] `VITE_API_URL=https://api.yourdomain.com/api`
    - [ ] `VITE_BACKEND_URL=https://api.yourdomain.com`
  - [ ] Deployed to static host (Vercel, Netlify, S3, etc.)
  - [ ] Accessible at: `https://yourdomain.com`

- [ ] **CORS & Security**
  - [ ] Backend `CLIENT_URL=https://yourdomain.com`
  - [ ] Backend `CORS_ORIGINS` includes frontend domain
  - [ ] Frontend cannot access backend before startup
  - [ ] Health check works before allowing login

- [ ] **Testing**
  - [ ] Visit frontend: https://yourdomain.com/login
  - [ ] No console errors
  - [ ] Login works with valid credentials
  - [ ] Refresh page doesn't cause connection errors
  - [ ] Chat feature works (if applicable)
  - [ ] File uploads work (if applicable)

---

## 🌍 Production Deployment Examples

### Example 1: Docker Deployment

**Create `Dockerfile` for backend:**
```dockerfile
FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

**Create `docker-compose.yml`:**
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: production
      PORT: 5000
      MONGODB_URI: mongodb+srv://user:pass@cluster.mongodb.net/dbname
      JWT_SECRET: ${JWT_SECRET}
      GROQ_API_KEY: ${GROQ_API_KEY}
      CLIENT_URL: https://yourdomain.com

  frontend:
    build: ./frontend
    ports:
      - "80:80"
```

**Deploy:**
```bash
docker-compose up -d
```

---

## 📞 Support & Troubleshooting

If you encounter issues, work through this guide systematically.

**Your MERN stack is now production-ready!**
