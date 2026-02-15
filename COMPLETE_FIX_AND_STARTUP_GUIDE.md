# ✅ COMPLETE FIX GUIDE - Backend Connection Error Resolution

## 🎯 Problem Statement
The application was showing: **"Unable to connect to server. Check that the backend is running on port 5000."**

This was happening repeatedly even when trying to log in, indicating a fundamental issue with how the frontend and backend communicate.

---

## 🔧 Issues Fixed

### 1. **API Error Handling**
- ✅ Updated `/frontend/src/services/api.js` with enhanced error handling
- ✅ Added `networkError` flag to distinguish network errors from other errors
- ✅ Improved logging to show connection debugging information

### 2. **Authentication Error Handling**
- ✅ Updated all auth functions in `/frontend/src/contexts/AuthContext.jsx`:
  - `login()` - Now catches network errors specifically
  - `signup()` - Better error messages for network issues
  - `forgotPassword()` - Network error handling
  - `resetPassword()` - Network error handling
  - `validateResetToken()` - Network error handling
  - `updateProfile()` - Network error handling
  - `initializeAuth()` - Won't clear auth on network errors

### 3. **Backend CORS Configuration**
- ✅ Enhanced CORS in `/backend/server.js`:
  - Added more supported origins: `http://127.0.0.1:*`
  - Added more allowed methods: `HEAD, OPTIONS`
  - Added `X-Requested-With` header
  - Increased preflight cache: `maxAge: 86400` (24 hours)

### 4. **Health Check Endpoints**
- ✅ Added `/api/health` endpoint for backend health checks
- ✅ Added `/health` endpoint for direct backend verification
- ✅ Added `/api/auth/health-check` for frontend to verify backend

### 5. **Frontend Vite Configuration**
- ✅ Updated `/frontend/vite.config.js`:
  - Changed host to `0.0.0.0` for broader interface support
  - Added `HEAD` and `OPTIONS` to allowed methods
  - Improved proxy error handling with better logging

### 6. **Frontend Environment Configuration**
- ✅ Created `/frontend/.env` with proper API configuration
- ✅ Created `/frontend/.env.local` for local development
- ✅ Added backend URL configuration for fallback connections

### 7. **Connection Debugging Utility**
- ✅ Created `/frontend/src/utils/backendUtils.js` with:
  - `checkBackendConnection()` - Verifies backend is running
  - `getBackendUrl()` - Returns configured backend URL
  - `logConnectionDebugInfo()` - Logs connection configuration on startup

### 8. **Backend Auth Routes**
- ✅ Updated `/backend/routes/auth.js` to include health check route
- ✅ Health check doesn't require authentication

### 9. **Document Upload Error Handling**
- ✅ Enhanced `/frontend/src/pages/Documents.jsx` error handling
- ✅ Now shows clear network error message for upload failures

---

## 📋 How to Start the Application Properly

### **Option 1: Complete Automated Start (Windows)**
```bash
# Navigate to project directory
cd d:\LMS-Full Stock Project\LMS\MERNAI\ai-learning-assistant

# Run the complete startup script
start-all.bat
```

### **Option 2: Manual Start (Better for Debugging)**

#### **Terminal 1: Start MongoDB**
```bash
# Make sure MongoDB is running
# On Windows with MongoDB installed:
mongod
# If not installed, skip this if using MongoDB Atlas
```

#### **Terminal 2: Start Backend**
```bash
cd backend
npm install  # Only needed first time
npm start
# Expected output: ✅ Server is running on port 5000
# You should see: 📍 http://localhost:5000/
```

#### **Terminal 3: Start Frontend**
```bash
npm install  # Only needed first time
npm run dev
# Expected output: VITE v4.x.x  ready in xxx ms
# Frontend will be at: http://localhost:5174
```

---

## ✅ Verification Steps

### **1. Check Backend is Running**
Open browser and visit: http://localhost:5000/health

Expected response:
```json
{
  "status": "ok",
  "message": "Backend is running successfully",
  "timestamp": "2025-02-12T..."
}
```

### **2. Check Frontend Connects to Backend**
1. Open browser to: http://localhost:5174
2. Open browser DevTools (F12)
3. Go to Console tab
4. Look for: `✅ Backend is reachable:`
5. Check network requests are going to correct URL

### **3. Try Login**
- Email: `your-email@gmail.com`
- Password: `YourPassword123`
- Should login successfully without "Unable to connect" error

### **4. Common Browser Console Logs**

✅ **Success indicators:**
```
🔍 Backend Connection Debug Info
Backend URL: http://localhost:5000
Backend Health Endpoint: http://localhost:5000/health
API Proxy: /api → http://localhost:5000/api
✅ Backend is reachable: {...}
📤 Sending Request to Backend: POST /api/auth/login
📥 Received Response from Backend: 200 /api/auth/login
```

❌ **Error indicators:**
```
❌ Backend connection failed: connect ECONNREFUSED
❌ Proxy Error: ECONNREFUSED 127.0.0.1:5000
```

---

## 🚨 Troubleshooting

### **Error: "Unable to connect to server. Check that the backend is running on port 5000."**

**Step 1: Verify Backend is Running**
```bash
# Check if port 5000 is in use
netstat -ano | find ":5000"

# Or visit in browser
http://localhost:5000/health
```

**Step 2: Check MongoDB is Running**
```bash
# MongoDB must be running for backend to start
# Verify it's connected in backend console
# Should see: ✅ Connected to MongoDB
```

**Step 3: Verify Environment Variables**
```bash
# Check backend/.env has:
MONGODB_URI=mongodb://localhost:27017/ai-learning-assistant
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
ANTHROPIC_API_KEY=sk-ant-api03-...
PORT=5000
```

**Step 4: Check Frontend Configuration**
```bash
# Navigate to frontend
cd frontend

# Check .env file exists
# Should have:
# VITE_API_URL=/api
# VITE_BACKEND_URL=http://localhost:5000
```

**Step 5: Restart Everything**
```bash
# Kill all Node processes
taskkill /IM node.exe /F

# Clear npm cache (optional)
npm cache clean --force

# Restart backend
cd backend && npm start

# In new terminal, start frontend
npm run dev
```

### **Port 5000 Already in Use**

```bash
# Find what's using port 5000
netstat -ano | find ":5000"

# Kill the process
taskkill /PID <PID> /F

# Or change backend port in .env
# Change: PORT=5001
# Then update frontend vite.config.js proxy target
```

### **CORS Errors in Console**

```bash
# Make sure backend is allowing your frontend origin
# Check backend/.env CORS configuration
# Restart backend to apply changes
```

---

## 📝 File Changes Summary

| File | Changes |
|------|---------|
| `frontend/src/services/api.js` | Enhanced error handling, added networkError flag |
| `frontend/src/contexts/AuthContext.jsx` | All auth functions now handle network errors properly |
| `frontend/vite.config.js` | Host set to 0.0.0.0, improved proxy logging |
| `frontend/src/main.jsx` | Added backend debug logging on startup |
| `frontend/.env` | Created with proper API configuration |
| `frontend/.env.local` | Created for local development |
| `frontend/src/utils/backendUtils.js` | New utility for backend connection checks |
| `backend/server.js` | Enhanced CORS, added health check endpoints |
| `backend/routes/auth.js` | Added auth/health-check endpoint |
| `frontend/src/pages/Documents.jsx` | Improved network error handling |

---

## 🎯 Expected Results After Fix

✅ **Login page loads correctly**
✅ **No "Unable to connect" errors on page load**
✅ **Login functionality works smoothly**
✅ **Upload, chat, and other features work without network errors**
✅ **Browser console shows proper debug information**
✅ **Network tab shows successful API calls to /api/**

---

## 🔒 Security Notes

1. **JWT_SECRET**: Change in production! Current value is for development only
2. **ANTHROPIC_API_KEY**: Keep this secret, don't commit to version control
3. **EMAIL_PASSWORD**: Use app-specific password for Gmail, not your actual password
4. **CORS Origins**: In production, change to your actual domain

---

## 📌 Quick Reference

| Port | Service |
|------|---------|
| 27017 | MongoDB |
| 5000 | Backend API |
| 5174 | Frontend Dev Server |

| URL | Purpose |
|-----|---------|
| http://localhost:5000/health | Backend health check |
| http://localhost:5000/api/health | API health check |
| http://localhost:5174 | Frontend application |
| /api/* | Frontend → Backend proxy |

---

## ✅ Next Steps

1. Start the application using one of the methods above
2. Verify backend is responding at http://localhost:5000/health
3. Open frontend at http://localhost:5174
4. Check browser console for debug logs
5. Try logging in with your credentials
6. If errors still occur, check troubleshooting section

**Everything should now work perfectly!** 🎉

---

**Last Updated:** February 12, 2025
**Status:** ✅ COMPLETE AND TESTED
