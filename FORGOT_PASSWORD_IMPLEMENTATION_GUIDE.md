# 🔐 Forgot Password Implementation Guide

## Overview

The forgot password feature allows users to securely reset their password via email. This guide covers the **complete flow**, **API endpoints**, **database fields**, and **setup instructions**.

---

## ✅ What's Already Implemented

The project already has a production-ready forgot password system. You only need to **configure Gmail credentials**.

### ✓ Backend Components:
- **User Model**: `resetPasswordToken` and `resetPasswordExpire` fields
- **Auth Controller**: `forgotPassword()`, `validateResetToken()`, `resetPassword()`
- **Email Service**: `sendPasswordResetEmail()`, `sendPasswordResetConfirmationEmail()`
- **API Routes**: All endpoints configured and ready to use
- **Security**: Token hashing with crypto, 30-minute expiration

---

## 📋 COMPLETE FORGOT PASSWORD FLOW

### **Flow Diagram:**

```
User enters email
    ↓
Backend validates email exists
    ↓
Generate random reset token (crypto.randomBytes)
    ↓
Hash token with SHA256
    ↓
Save hashed token + expiration (30 min) to database
    ↓
Send email with reset link
    ↓
User clicks reset link
    ↓
Frontend extracts token from URL
    ↓
User enters new password
    ↓
Backend verifies token is valid & not expired
    ↓
Hash new password with bcrypt
    ↓
Save new password, clear reset token
    ↓
User logs in with new password ✅
```

---

## 🔌 API ENDPOINTS

### **1. POST /api/auth/forgot-password**

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response - Success (200):**
```json
{
  "success": true,
  "message": "Password reset email has been sent to your email address.",
  "email": "user@example.com"
}
```

**Response - Error (400/500):**
```json
{
  "success": false,
  "message": "User with this email does not exist"
}
```

**Console Output (Backend):**
```
📬 Sending password reset email to: user@example.com
✅ Password reset email sent successfully
📧 Message ID: <id@gmail.com>
✅ Password reset email sent to: user@example.com
```

---

### **2. GET /api/auth/reset-password/:token**

**Purpose:** Validate token before showing password reset form

**Response - Success (200):**
```json
{
  "success": true,
  "message": "Token is valid",
  "email": "user@example.com"
}
```

**Response - Error (400):**
```json
{
  "success": false,
  "message": "Invalid or expired reset token"
}
```

---

### **3. POST /api/auth/reset-password/:token**

**Request:**
```json
{
  "password": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

**Response - Success (200):**
```json
{
  "success": true,
  "message": "Password has been reset successfully. You can now log in with your new password."
}
```

**Response - Error (400/500):**
```json
{
  "success": false,
  "message": "Passwords do not match"
}
```

**Console Output:**
```
✅ Password reset successfully for: user@example.com
```

---

## 🗄️ DATABASE SCHEMA

### User Model Fields for Password Reset:

```javascript
// In User.js model
resetPasswordToken: {
  type: String,
  default: null
  // Stores SHA256 hashed reset token
},
resetPasswordExpire: {
  type: Date,
  default: null
  // Stores token expiration time (30 minutes from generation)
}
```

### Database Example:

```javascript
// When user requests password reset:
{
  _id: ObjectId("..."),
  email: "user@example.com",
  password: "$2a$10$hashedPasswordWithBcrypt...",
  resetPasswordToken: "a7f3e9d2c5b1f4a8e6d9c1b5a7f3e9d2", // SHA256 hash
  resetPasswordExpire: ISODate("2024-02-14T14:45:00Z"), // 30 minutes later
  ...
}

// After password reset:
{
  _id: ObjectId("..."),
  email: "user@example.com",
  password: "$2a$10$newHashedPasswordWithBcrypt...",
  resetPasswordToken: null,           // Cleared
  resetPasswordExpire: null,          // Cleared
  ...
}
```

---

## 📧 EMAIL TEMPLATE

The email sent to users contains:

```html
Subject: 🔐 Password Reset Request - AI Learning Assistant

Email Body (HTML):
- Green header with "Password Reset" title
- Instructions text
- Big green "Reset Your Password" button
- Backup text link to reset URL
- 30-minute expiration warning (red)
- Security notice
- Footer with copyright

Plain Text Version (for non-HTML clients):
- Plain text version of same information
```

**Reset Link Format:**
```
http://localhost:5173/reset-password/{TOKEN}
```

---

## 🛠️ SETUP CHECKLIST

Before testing, complete these steps:

### **Step 1: Enable 2FA on Gmail**
- [ ] Go to https://myaccount.google.com/security
- [ ] Click "2-Step Verification"
- [ ] Complete verification process
- [ ] Wait 5-10 minutes after enabling

### **Step 2: Generate Gmail App Password**
- [ ] Go to https://myaccount.google.com/apppasswords
- [ ] Select "Mail" from first dropdown
- [ ] Select "Windows Computer" from second dropdown
- [ ] Click "Generate"
- [ ] Copy the 16-character password **without spaces**

### **Step 3: Update .env File**
- [ ] Edit `backend/.env`
- [ ] Set `EMAIL_USER=your-gmail@gmail.com`
- [ ] Set `EMAIL_PASSWORD=16characterapppassword` (no spaces)
- [ ] Ensure `FRONTEND_URL=http://localhost:5173`

### **Step 4: Restart Backend**
```bash
# Kill any running backend process
# Then restart:
cd backend
npm run dev
```

### **Step 5: Verify Configuration**
- [ ] Check backend console for:
  - "✅ Email configuration validated"
  - "✅ Email transporter connection verified"
  - "🔑 App Password length: 16 characters"

---

## 🧪 TESTING THE FORGET PASSWORD FLOW

### **Test Scenario 1: Valid Email**

1. Open frontend: http://localhost:5174
2. Click "Forgot Password" or similar link
3. Enter registered email address
4. Click "Send Reset Link"
5. **Expected:** Success message, email sent
6. **Backend Console Should Show:**
   ```
   📬 Sending password reset email to: user@example.com
   ✅ Password reset email sent successfully
   📧 Message ID: <message@gmail.com>
   ```

---

### **Test Scenario 2: Non-Existent Email**

1. Enter email not registered in system
2. Click "Send Reset Link"
3. **Expected:** Error message "User with this email does not exist"
4. **Backend Console Should Show:**
   ```
   ❌ User not found with email: nonexistent@example.com
   ```

---

### **Test Scenario 3: Click Reset Link**

1. Check email inbox (or spam folder)
2. Click blue "Reset Your Password" button
3. **Expected:** Taken to reset password form
4. **Frontend Should Show:** Email address pre-filled, password input fields
5. **Browser URL Should Contain:** `reset-password/{TOKEN}`

---

### **Test Scenario 4: Reset Password**

1. Enter new password (min 6 characters)
2. Confirm new password (must match)
3. Click "Reset Password"
4. **Expected:** Success message
5. **Backend Console Should Show:**
   ```
   ✅ Password reset successfully for: user@example.com
   ```

---

### **Test Scenario 5: Invalid/Expired Token**

1. Manually change token in URL
2. Or wait 31+ minutes and try to click reset link
3. **Expected:** Error "Invalid or expired reset token"

---

## 🔍 SECURITY FEATURES ALREADY IMPLEMENTED

✅ **Token Security:**
- Tokens are **hashed** before storing (not stored in plain text)
- Tokens are **random** (32 bytes of cryptographic randomness)
- Tokens **expire** after 30 minutes
- Tokens are **cleared** after successful reset

✅ **Password Security:**
- Passwords are **hashed** with bcrypt before storing
- Password match validation
- Minimum 6-character requirement
- Confirm password field validation

✅ **Email Security:**
- Reset email includes user-friendly instructions
- Backup text link provided
- Clear expiration warning (30 minutes)
- Confirmation email sent after reset

---

## 📝 RELEVANT SOURCE FILES

### Frontend Components (Example - if you have a forgot password form):
```
frontend/src/pages/ForgotPassword.jsx     (if exists)
frontend/src/pages/ResetPassword.jsx      (if exists)
frontend/src/components/ForgotPasswordForm.jsx (if exists)
```

### Backend Files:
```
backend/routes/auth.js                    ✅ Routes configured
backend/controllers/authController.js     ✅ Controllers implemented
backend/services/emailService.js          ✅ Email service ready (fixed)
backend/models/User.js                    ✅ Schema has reset fields
backend/.env                              ⏳ NEEDS YOUR GMAIL CREDENTIALS
```

---

## 🚀 QUICK START

### **Fastest Way to Setup:**

1. **Go to Gmail App Passwords:**
   ```
   https://myaccount.google.com/apppasswords
   ```

2. **Generate password:**
   - Select: Mail + Windows Computer
   - Copy: 16-character password (no spaces)

3. **Update .env:**
   ```bash
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASSWORD=abcdefghijklmnop
   ```

4. **Restart backend:**
   ```bash
   npm run dev
   ```

5. **Test by requesting password reset**

---

## ⚠️ COMMON ISSUES & SOLUTIONS

| Issue | Cause | Solution |
|-------|-------|----------|
| Error 535 SMTP | Using regular password | Use Gmail App Password (16 chars) |
| Email not sent | Gmail not configured | Check .env EMAIL_USER and EMAIL_PASSWORD |
| Token expired | Waited 30+ minutes | Generate new reset link |
| Wrong password accepted | Old hash stored | Ensure bcrypt applied correctly |
| Email in spam | Sender reputation | Add to contacts or whitelist |

---

## 📞 DEBUGGING TIPS

### **Enable Detailed Logging:**
All console.log statements are already in the code. Check backend terminal for:

```bash
# Configuration check:
✅ Email configuration validated

# Connection test:
🔌 Testing email transporter connection...
✅ Email transporter connection verified successfully

# Sending:
📬 Sending password reset email to: user@example.com
✅ Password reset email sent successfully
📧 Message ID: <message-id>

# Errors:
❌ GMAIL AUTHENTICATION FAILED (Error 535)
```

### **Check Database:**
```javascript
// Connect to MongoDB and check if token is stored:
db.users.findOne({ email: "user@example.com" })
// Should show: resetPasswordToken and resetPasswordExpire fields populated
```

---

## 🎯 PRODUCTION CHECKLIST

Before deploying to production:

- [ ] Gmail 2FA enabled
- [ ] App Password generated and stored in production .env
- [ ] FRONTEND_URL points to live domain (not localhost)
- [ ] JWT_SECRET is strong (min 32 chars)
- [ ] MONGODB_URI points to production database
- [ ] Email error handling configured
- [ ] HTTPS enabled for login/reset pages
- [ ] Rate limiting on forgot-password endpoint added
- [ ] User feedback messages are clear
- [ ] Email templates branded for production

---

## 📚 ADDITIONAL RESOURCES

- [Nodemailer Gmail Docs](https://nodemailer.com/smtp/gmail/)
- [Google App Passwords](https://myaccount.google.com/apppasswords)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
- [OWASP Password Reset](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html)

---

**Last Updated:** February 2024  
**Status:** ✅ Production Ready (just needs Gmail credentials)
