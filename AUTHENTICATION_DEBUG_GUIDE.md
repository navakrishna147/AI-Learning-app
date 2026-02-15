# Authentication Debug & Setup Guide

## ⚠️ Common Issues & Solutions

### Error 500 - Login/Signup Failed

#### **Issue 1: MongoDB Not Running**
**Symptom:** Server starts but login/signup returns error 500
**Solution:**
```bash
# Windows: Start MongoDB
mongod

# Or use MongoDB Atlas (Cloud)
# Update MONGODB_URI in .env to your MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ai-learning-assistant
```

#### **Issue 2: Missing or Wrong Environment Variables**
**Symptom:** Backend crashes or logs show undefined variables
**Solution:**
1. Check `.env` file exists in `/backend` folder
2. Required variables:
```env
# Database (Local OR Atlas)
MONGODB_URI=mongodb://localhost:27017/ai-learning-assistant

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Server
PORT=5000

# Email (for forgot password)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password

# Frontend
FRONTEND_URL=http://localhost:5173
```

#### **Issue 3: Backend Not Running**
**Symptom:** Frontend shows "Network Error" or "Unable to connect"
**Solution:**
```bash
# From /backend folder
npm install
npm start

# Or use nodemon for development
npx nodemon server.js
```

#### **Issue 4: JWT Secret Issues**
**Symptom:** Token errors after login
**Solution:**
```env
# Use a strong secret key
JWT_SECRET=your_unique_secret_key_at_least_32_characters_long
```

#### **Issue 5: CORS Issues**
**Symptom:** Frontend requests blocked by browser
**Solution:**
- Backend CORS is configured for localhost:5173, 5174, 5176
- If using different port, add it to CORS origins in `server.js`

---

## 🔧 Backend Setup Checklist

### 1. Environment Configuration
- [ ] MongoDB running locally OR Atlas connection string in `.env`
- [ ] `JWT_SECRET` set in `.env`
- [ ] `FRONTEND_URL` matches your frontend URL
- [ ] `PORT=5000` (or desired port)

### 2. Database Initialization
```bash
# No migration needed - MongoDB creates collections on first write
# Just ensure MongoDB is running before starting backend
```

### 3. Start Backend
```bash
cd backend
npm install
npm start
```

### 4. Verify Backend Health
```bash
# Should return JSON
curl http://localhost:5000/

# Health check
curl http://localhost:5000/health
```

---

## 🚀 Frontend Setup Checklist

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Frontend
```bash
npm run dev
```

### 3. Access Application
- Visit `http://localhost:5173` (or displayed URL)

---

## 🧪 Testing Authentication Flow

### 1. Test Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGc...",
  "user": {
    "_id": "...",
    "username": "testuser",
    "email": "test@example.com"
  }
}
```

### 2. Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Test Protected Route
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📊 Database Structure

### User Collection
- `username` (String, unique)
- `email` (String, unique)
- `password` (String, hashed with bcrypt)
- `role` (String: 'student', 'instructor', 'admin')
- `isActive` (Boolean)
- `resetPasswordToken` (String, hashed)
- `resetPasswordExpire` (Date)
- `lastLogin` (Date)
- `stats` (Object with achievements, streaks, etc.)
- `timestamps` (createdAt, updatedAt)

---

## 🔐 Password Reset Flow

### 1. Request Reset
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### 2. Email Configuration (if needed)
- Uses Gmail by default
- Requires App Password (not regular Gmail password)
- Setup: https://myaccount.google.com/apppasswords

### 3. Validate & Reset Token
```bash
# Validate
curl -X GET http://localhost:5000/api/auth/reset-password/TOKEN_HERE

# Reset
curl -X POST http://localhost:5000/api/auth/reset-password/TOKEN_HERE \
  -H "Content-Type: application/json" \
  -d '{
    "password": "newpassword123",
    "confirmPassword": "newpassword123"
  }'
```

---

## 🐛 Debugging Tips

### 1. Backend Logs
- Check terminal where backend is running
- Look for error messages with 🔍 🔐 ❌ symbols
- Database connection status shown at startup

### 2. Browser Console
- Open DevTools (F12)
- Check Network tab for API responses
- Look for CORS errors in Console

### 3. Network Debugging
```bash
# Test backend connectivity
curl http://localhost:5000/health -v

# Test specific endpoint
curl http://localhost:5000/api/auth/login -v
```

### 4. Enable Detailed Logging
The backend logs show:
- ✅ Success operations
- ❌ Errors with full context
- ⚠️ Warnings for non-critical issues
- 🔍 Search/lookup operations
- 📧 Email sending attempts

### 5. Common Error Messages & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "Database error: Unable to retrieve user" | MongoDB not running | Start `mongod` |
| "Token has expired" | Session expired | Login again |
| "Invalid email or password" | Wrong credentials | Check spelling |
| "User with this email already exists" | Email already registered | Use different email or login |
| "Failed to send reset email" | Email not configured | Set EMAIL_USER/PASSWORD in .env |

---

## 📝 Improvement Summary

### What Was Fixed:
1. ✅ Enhanced error handling in login/signup/forgot-password
2. ✅ Better database error detection and reporting
3. ✅ Improved JWT token validation
4. ✅ Added detailed logging throughout auth flow
5. ✅ Better password hashing and comparison error handling
6. ✅ Improved User model with indexes and validation
7. ✅ Enhanced middleware with specific error messages
8. ✅ Better frontend error handling in AuthContext
9. ✅ Added health check endpoints
10. ✅ Database connection retry logic

### Backend Changes:
- `controllers/authController.js` - Added detailed logging and error handling
- `config/db.js` - Added retry logic and better connection error messages
- `models/User.js` - Added indexes and improved validation
- `middleware/auth.js` - Better token verification and error messages
- `server.js` - Added health check, better error handling

### Frontend Changes:
- `contexts/AuthContext.jsx` - Better error handling and network error detection
- Added detailed console logging for debugging

---

## ✅ Verification Steps

1. **Start MongoDB**
   ```bash
   mongod
   ```

2. **Backend Running?**
   ```bash
   # Should show: ✅ SERVER STARTED SUCCESSFULLY
   # Check http://localhost:5000/health
   ```

3. **Frontend Running?**
   ```bash
   # Should be accessible at http://localhost:5173
   ```

4. **Try Signup**
   - Create test account
   - Should see success message
   - Should redirect to dashboard

5. **Try Login**
   - Use credentials from signup
   - Should receive JWT token
   - localStorage should contain token

6. **Check Backend Logs**
   - Should see ✅ and 🔍 messages
   - No ❌ errors for successful auth

---

## 🆘 Still Having Issues?

1. **Check MongoDB Connection:**
   ```bash
   mongosh
   # Should connect successfully
   ```

2. **Check Environment Variables:**
   - Verify `.env` file in `/backend`
   - No quotes around values: `KEY=value` not `KEY="value"`

3. **Check Port 5000:**
   ```bash
   netstat -an | findstr 5000
   # If occupied, change PORT in .env
   ```

4. **Clear Browser Cache:**
   - DevTools → Application → Clear all site data
   - Refresh page

5. **Check Network:**
   - Frontend should make request to `http://localhost:5000/api/auth/login`
   - Check Network tab in DevTools

---

## 📞 Support

For additional issues, check:
- Backend error logs (most detailed information)
- Browser Console (CORS, network errors)
- Network tab in DevTools (request/response details)
- MongoDB logs (connection issues)

All auth changes maintain backward compatibility with other features.
