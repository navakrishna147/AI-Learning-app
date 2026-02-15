# ✅ PRODUCTION DEPLOYMENT CHECKLIST

## Pre-Deployment Phase (Local Development)

### Environment Configuration ✓

- [ ] **Backend `.env` configured**
  ```env
  NODE_ENV=development
  PORT=5000
  MONGODB_URI=mongodb://localhost:27017/ai-learning-assistant
  JWT_SECRET=dev_secret_key_32_characters_minimum
  GROQ_API_KEY=gsk_your_api_key
  CLIENT_URL=http://localhost:5173
  ```

- [ ] **Frontend `.env` configured**
  ```env
  VITE_API_URL=/api
  VITE_BACKEND_URL=http://127.0.0.1:5000
  VITE_API_TIMEOUT=60000
  VITE_HEALTH_CHECK_TIMEOUT=10000
  ```

- [ ] **No `.env` files committed to git**
  ```bash
  # Check .gitignore contains:
  .env
  .env.local
  .env.*.local
  ```

### Database Setup ✓

- [ ] **MongoDB running locally**
  - Windows: `mongod --dbpath "C:\data\db"`
  - macOS: `brew services start mongodb-community`
  - Linux: `sudo service mongod start`
  - OR MongoDB Atlas account created and credentials ready

- [ ] **Database user created (if using Atlas)**
  - Username configured
  - Password generated
  - IP whitelist includes your IP

- [ ] **Connection string verified**
  ```bash
  # Test connection:
  mongosh "mongodb://localhost:27017"
  # Or for Atlas:
  mongosh "mongodb+srv://user:pass@cluster.mongodb.net"
  ```

### Backend Startup ✓

- [ ] **Dependencies installed**
  ```bash
  cd backend
  npm install
  ```

- [ ] **No port conflicts**
  ```bash
  # Check port 5000 is available:
  netstat -ano | findstr :5000
  # Should return nothing
  ```

- [ ] **Backend starts cleanly**
  ```bash
  npm run dev
  ```
  Output should show:
  ```
  ✅ APPLICATION STARTED SUCCESSFULLY
  🚀 Server Port: 5000 (verified listening)
  💾 Database: ✅ Connected
  ```

- [ ] **Health endpoints work**
  ```bash
  # Test in browser or curl:
  curl http://localhost:5000/health
  curl http://localhost:5000/api/health
  curl http://localhost:5000/api/health/detailed
  ```

### Frontend Startup ✓

- [ ] **Dependencies installed**
  ```bash
  cd frontend
  npm install
  ```

- [ ] **Frontend starts on port 5173**
  ```bash
  npm run dev
  ```
  Output should show:
  ```
  ➜  Local:   http://localhost:5173/
  ```

- [ ] **Vite proxy works (no ECONNREFUSED)**
  - Open http://localhost:5173
  - Check browser console (F12)
  - Should see: `✅ Backend is available`
  - Should NOT see: `❌ BACKEND CONNECTION REFUSED`

### Login Testing ✓

- [ ] **Login page loads**
  ```
  http://localhost:5173/login
  ```

- [ ] **No console errors** (F12 → Console tab)
  - No red CORS errors
  - No ECONNREFUSED errors
  - No network errors

- [ ] **Login works with test credentials**
  - Enter email and password
  - Click Sign In
  - Should navigate to dashboard

---

## Production Deployment Phase

### Backend Configuration (Production)

- [ ] **Environment variables set (not files)**
  ```env
  NODE_ENV=production
  PORT=5000
  MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/database
  JWT_SECRET=STRONG_RANDOM_STRING_32_CHARS_MIN
  CLIENT_URL=https://yourdomain.com
  GROQ_API_KEY=your_key
  ```

- [ ] **Backend health check passes**
  ```bash
  curl https://yourdomain.com/health
  ```

### Frontend Deployment

- [ ] **Build production bundle**
  ```bash
  npm run build
  ```

- [ ] **Production `.env` used**
  ```env
  VITE_API_URL=https://yourdomain.com/api
  VITE_BACKEND_URL=https://yourdomain.com
  ```

- [ ] **Frontend accessible**
  ```
  https://yourdomain.com
  ```

### Testing ✓

- [ ] **Login works**
- [ ] **No console errors**
- [ ] **Health endpoints respond**
- [ ] **Core features work**

---

## Success Criteria

✅ **Deployment successful if ALL pass:**

- Frontend loads without "Backend unreachable"
- Login works
- No console errors
- Health endpoints return 200
- Response times < 500ms

---

**Reference: See ARCHITECTURE_HARDENING_FINAL.md for detailed explanation**

