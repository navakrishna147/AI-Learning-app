# 🚀 FORGOT PASSWORD FEATURE - QUICK TEST CHECKLIST

## Pre-Test Setup

- [ ] Backend running: `npm run dev`
- [ ] Frontend running on port 5173
- [ ] Gmail account open: https://gmail.com
- [ ] MongoDB available
- [ ] Test account ready: `your-email@gmail.com`

---

## 🧪 Test Execution (In Order)

### Test 1️⃣: Wrong Password Handling
```
POST /api/auth/login
Body: {
  "email": "your-email@gmail.com",
  "password": "WrongPassword123"
}
Expected: 401 status ✅
```
- [ ] Returns 401
- [ ] Message: "Invalid email or password"

---

### Test 2️⃣: Trigger Forgot Password
```
POST /api/auth/forgot-password
Body: {
  "email": "your-email@gmail.com"
}
Expected: 200 status ✅
```
- [ ] Returns success
- [ ] Token in response
- [ ] Message about email sent

---

### Test 3️⃣: Check Backend Logs
**Look in terminal running `npm run dev`:**
```
📍 Find this section:
════════════════════════════════════════════════════════════════════════
🔐 FORGOT PASSWORD REQUEST
════════════════════════════════════════════════════════════════════════
```
- [ ] User found ✅
- [ ] Token generated ✅
- [ ] Token hashed ✅
- [ ] Email sent successfully ✅

**Key values to note:**
- [ ] Plain token: `______________________________`
- [ ] Message ID: `______________________________`
- [ ] Reset link: `http://localhost:5173/reset-password/...`

---

### Test 4️⃣: Verify Email Received
**Go to:** https://gmail.com (signed in as your-email@gmail.com)

- [ ] Check Inbox for: "🔐 Password Reset Request"
  - [ ] From: your-email@gmail.com
  - [ ] Has reset button/link
  
**If not in Inbox:**
- [ ] Check Spam folder
- [ ] Check Promotions tab
- [ ] Check Social tab
- [ ] Search: "Password Reset"

---

### Test 5️⃣: Verify Token in Database
**Using MongoDB client (mongosh or MongoDB Compass):**

```
Database: lmsproject
Collection: users
Query: { email: "your-email@gmail.com" }
```
- [ ] Field exists: `resetPasswordToken`
  - Should be 64-character hash
- [ ] Field exists: `resetPasswordExpire`
  - Should be future date (~30 min from now)
- [ ] Both fields are populated (not null)

---

### Test 6️⃣: Validate Token
**Using test endpoint:**
```
GET /api/auth/test-forgot-password
Expected: 200 status ✅
```
Response should include:
- [ ] User: `your-email@gmail.com`
- [ ] Token: Plain token (64 chars)
- [ ] Reset link: Working URL
- [ ] Fresh email sent

**Alternative: Validate using API**
```
GET /api/auth/reset-password/{TOKEN}
Where TOKEN = plain token from response
Expected: 200 status ✅
```
- [ ] Message: "Token is valid"
- [ ] Shows correct email

---

### Test 7️⃣: Reset Password

**Option A: Click email link**
1. [ ] Go to Gmail inbox
2. [ ] Open the "🔐 Password Reset Request" email
3. [ ] Click the reset button/link
4. [ ] Should load password form

**Option B: Manual URL**
```
http://localhost:5173/reset-password/{TOKEN}
Where TOKEN = plain token value
```

**Form submission:**
```
POST /api/auth/reset-password/{TOKEN}
Body: {
  "password": "NewPassword456",
  "confirmPassword": "NewPassword456"
}
Expected: 200 status ✅
```
- [ ] Message: "Password has been reset successfully"
- [ ] Status: 200

---

### Test 8️⃣: Login with New Password
```
POST /api/auth/login
Body: {
  "email": "your-email@gmail.com",
  "password": "NewPassword456"
}
Expected: 200 status ✅
```
- [ ] Returns user data
- [ ] JWT token provided
- [ ] User role visible
- [ ] Successfully logged in

---

### Test 9️⃣: Old Password Rejected
```
POST /api/auth/login
Body: {
  "email": "your-email@gmail.com",
  "password": "TestPassword123"     /* OLD PASSWORD */
}
Expected: 401 status ❌
```
- [ ] Returns 401 Unauthorized
- [ ] Message: "Invalid email or password"
- [ ] Cannot login with old password

---

### Test 🔟: Token Cannot Be Reused
**Use the same token from Test 6 again:**
```
GET /api/auth/reset-password/{TOKEN}
Expected: 400 status ❌
```
- [ ] Returns error: "Invalid or expired reset token"
- [ ] Token rejected (already used)
- [ ] Cannot reuse token

---

## 📊 Results Summary

| # | Test | Status | Notes |
|---|------|--------|-------|
| 1 | Wrong password | ✅/❌ | |
| 2 | Forgot password trigger | ✅/❌ | |
| 3 | Backend logs | ✅/❌ | |
| 4 | Email received | ✅/❌ | |
| 5 | Token in database | ✅/❌ | |
| 6 | Token validates | ✅/❌ | |
| 7 | Password reset | ✅/❌ | |
| 8 | New password login | ✅/❌ | |
| 9 | Old password fails | ✅/❌ | |
| 10 | Token one-time use | ✅/❌ | |

---

## 🎯 Success Criteria

✅ **ALL TESTS PASSED** = Feature is working correctly

❌ **Any test failed?** → Check EMAIL_DELIVERY_DEBUG_GUIDE.md for troubleshooting

---

## 📞 Quick Links

- Backend logs: Terminal running `npm run dev`
- Gmail: https://gmail.com
- MongoDB: MongoDB Compass or mongosh
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

---

## 📝 Notes During Testing

**Issue found:** _______________________________________________________________
_______________________________________________________________________________

**Solution:** __________________________________________________________________
_______________________________________________________________________________

**Logs captured:** ______________________________________________________________
_______________________________________________________________________________

**Email received at:** __________________________________________________________

**Token validation result:** ____________________________________________________
