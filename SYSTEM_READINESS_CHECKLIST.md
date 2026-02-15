# System Readiness Checklist

Before testing the authentication system, verify everything is in place with this checklist.

---

## 📋 Pre-Launch Verification

### Backend Setup

**Check 1: Dependencies Installed**
```bash
cd ai-learning-assistant/backend
# Should show nodemailer and other packages
npm list nodemailer
npm list bcryptjs
npm list express
```
- [ ] All packages installed
- [ ] No missing dependencies

**Check 2: Environment Variables**
```bash
# View backend/.env file
cat backend/.env
```

Verify these exist:
- [ ] `MONGODB_URI=mongodb://localhost:27017/ai-learning-assistant`
- [ ] `JWT_SECRET=your-secret-key-here`
- [ ] `PORT=5000`
- [ ] `EMAIL_USER=your-email@gmail.com` ← **Must be configured**
- [ ] `EMAIL_PASSWORD=your-app-password` ← **Must be configured** 
- [ ] `FRONTEND_URL=http://localhost:5173`

**Check 3: Key Files Exist**
```bash
# From backend directory
dir config
dir controllers
dir middleware
dir models
dir routes
dir services
```

Verify these files:
- [ ] `backend/package.json` - Has "start": "node server.js"
- [ ] `backend/server.js` - Main server file
- [ ] `backend/config/db.js` - MongoDB connection
- [ ] `backend/controllers/authController.js` - Auth logic (280+ lines)
- [ ] `backend/services/emailService.js` - Email service (234+ lines)
- [ ] `backend/models/User.js` - Has resetPasswordToken, resetPasswordExpire fields
- [ ] `backend/routes/auth.js` - Has forgot-password, reset-password routes
- [ ] `backend/middleware/auth.js` - JWT verification middleware

---

### MongoDB Setup

**Check 4: MongoDB Running**
```bash
# Test connection
mongosh --eval "db.version()"
```

Expected output:
```
6.0.0  # (or any version number)
```

- [ ] MongoDB running locally
- [ ] Port 27017 accessible
- [ ] Can connect successfully

**Check 5: Database Exists**
```bash
# In mongosh shell
use ai-learning-assistant
db.users.countDocuments()
```

- [ ] Database `ai-learning-assistant` exists
- [ ] `users` collection exists (even if empty)

---

### Frontend Setup

**Check 6: Dependencies Installed**
```bash
cd ai-learning-assistant/frontend
npm list react
npm list react-router-dom
npm list axios
```

- [ ] React installed
- [ ] React Router installed
- [ ] Axios installed
- [ ] No missing dependencies

**Check 7: Key Files Exist**
```bash
# From frontend directory
dir src/pages/auth
dir src/contexts
dir src/services
```

Verify these files:
- [ ] `frontend/src/pages/auth/Login.jsx` - Login page (150+ lines)
- [ ] `frontend/src/pages/auth/Signup.jsx` - Signup page (200+ lines)
- [ ] `frontend/src/pages/auth/ForgotPassword.jsx` - Forgot password (150+ lines)
- [ ] `frontend/src/pages/auth/ResetPassword.jsx` - Reset password (200+ lines)
- [ ] `frontend/src/contexts/AuthContext.jsx` - Auth context with 7 functions
- [ ] `frontend/src/services/api.js` - Axios API client
- [ ] `frontend/src/App.jsx` - Routes defined for auth pages

**Check 8: Important Routes in App.jsx**
```bash
# Search App.jsx file for these routes
grep -n "/login\|/signup\|/forgot-password\|/reset-password" src/App.jsx
```

Should find:
- [ ] `/login` route
- [ ] `/signup` route
- [ ] `/forgot-password` route
- [ ] `/reset-password/:token` route

---

## ⚙️ Email Configuration Verification

**⚠️ CRITICAL: Without this, emails won't send!**

### Google Gmail Setup

**Step 1: Enable 2-Factor Authentication**
1. Go to https://myaccount.google.com/security
2. Look for "2-Step Verification"
3. If not enabled, enable it now
- [ ] 2FA enabled on Gmail account

**Step 2: Generate App Password**
1. Go to https://myaccount.google.com/apppasswords
2. Select app: Email
3. Select device: Windows/Linux/Mac (your OS)
4. Generate password (16 characters)
5. Copy the password
- [ ] App password generated
- [ ] Password copied

**Step 3: Update .env**
```bash
# backend/.env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # The 16-char password
```

- [ ] EMAIL_USER set to your Gmail
- [ ] EMAIL_PASSWORD set to 16-char app password
- [ ] No spaces around = sign

**Step 4: Verify Configuration**
```bash
# Quick test in Node
node
> const email = process.env.EMAIL_USER;
> console.log(email === "your-email@gmail.com") // Should be true
> .exit
```

- [ ] EMAIL_USER reads correctly
- [ ] EMAIL_PASSWORD has value

---

## 🚀 Startup Verification

### Terminal 1: Start Backend

```bash
cd ai-learning-assistant/backend
npm run dev
```

**Wait for these logs (15-30 seconds):**
```
✅ Server is running on port 5000
✅ MongoDB Connected
📧 Email service initialized (on first request)
```

- [ ] Server started without errors
- [ ] MongoDB connection successful
- [ ] No "Cannot find module" errors
- [ ] No port already in use error

### Terminal 2: Start Frontend

```bash
cd ai-learning-assistant/frontend
npm run dev
```

**Wait for these logs (10-20 seconds):**
```
VITE v5.0.8 
ready in 1000 ms

➜  Local:   http://localhost:5173/
```

- [ ] Frontend started without errors
- [ ] Vite dev server running
- [ ] No "Cannot find module" errors
- [ ] Access http://localhost:5173 in browser

---

## 🎯 Quick Functionality Check

### Test 1: Can You Reach Pages?

1. **Signup page:** http://localhost:5173/signup
   - [ ] Page loads
   - [ ] Form visible
   - [ ] No console errors

2. **Login page:** http://localhost:5173/login
   - [ ] Page loads
   - [ ] Form visible
   - [ ] "Forgot password?" link visible

3. **Forgot Password:** http://localhost:5173/forgot-password
   - [ ] Page loads
   - [ ] Form visible
   - [ ] No console errors

---

### Test 2: API Connectivity

Open browser DevTools (F12) → Console and run:

```javascript
// Test backend connectivity
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@test.com', password: 'test' })
})
.then(r => r.json())
.then(d => console.log(d))
```

**Expected response:**
```json
{
  "success": false,
  "message": "Invalid email or password"  // OK - user doesn't exist
}
```

OR if MongoDB issue:
```json
{
  "success": false,
  "message": "Error logging in..."
}
```

- [ ] Backend API responds
- [ ] No CORS errors
- [ ] Returns JSON response

---

### Test 3: Email Service Check

Run this in backend terminal (after server started):

```bash
# In Node REPL while server is running
node -e "
const emailService = require('./services/emailService');
emailService.sendPasswordResetEmail('test@example.com', 'http://localhost:5173/reset-password/test-token-123')
  .then(() => console.log('✅ Email service working'))
  .catch(err => console.log('❌ Error:', err.message))
"
```

- [ ] No errors in output
- [ ] Can see email sending logs
- [ ] No "Email configuration incomplete" errors

---

## ✅ Final Readiness Score

**All checks passed? You're ready to test!**

| Category | Status |
|----------|--------|
| Backend Dependencies | [ ] |
| Frontend Dependencies | [ ] |
| Environment Variables | [ ] |
| MongoDB Running | [ ] |
| Email Configured | [ ] |
| Backend Startup | [ ] |
| Frontend Startup | [ ] |
| API Connectivity | [ ] |
| Email Service | [ ] |

**If all boxes checked:** Proceed to [AUTHENTICATION_TEST_PLAN.md](AUTHENTICATION_TEST_PLAN.md)

**If any box unchecked:** 
1. Find the failing check
2. See corresponding troubleshooting below
3. Fix the issue
4. Re-check

---

## 🔧 Troubleshooting Quick Reference

### "Cannot GET /api/auth/login"
- **Cause:** Backend not running
- **Fix:** Verify Terminal 1 shows "✅ Server is running on port 5000"

### "CORS error / Cannot access from localhost:5173"
- **Cause:** Backend CORS not configured
- **Fix:** Check `backend/server.js` has `app.use(cors())`

### "MongooseError: Cannot connect to MongoDB"
- **Cause:** MongoDB not running
- **Fix:** Start MongoDB with `mongod` or MongoDB Compass

### "Email not sending / timeout"
- **Cause:** EMAIL_USER or EMAIL_PASSWORD not configured
- **Fix:** Double-check `.env` file - re-run Gmail app password setup

### "node: Cannot find module 'nodemailer'"
- **Cause:** Dependencies not installed
- **Fix:** Run `cd backend && npm install` again

### "FRONTEND_URL not working in email"
- **Cause:** URL mismatch between .env and actual frontend
- **Fix:** Make sure FRONTEND_URL matches your frontend URL (e.g., http://localhost:5173)

---

## 📞 Need Help?

Refer to these guides:
- **Setup Issues:** [AUTHENTICATION_SETUP_GUIDE.md](AUTHENTICATION_SETUP_GUIDE.md)
- **Quick Start:** [AUTHENTICATION_QUICK_REFERENCE.md](AUTHENTICATION_QUICK_REFERENCE.md)
- **Testing Guide:** [AUTHENTICATION_TEST_PLAN.md](AUTHENTICATION_TEST_PLAN.md)
- **What Changed:** [AUTHENTICATION_CHANGES_SUMMARY.md](AUTHENTICATION_CHANGES_SUMMARY.md)
