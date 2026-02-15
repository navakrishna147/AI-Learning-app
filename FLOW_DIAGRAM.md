# 🔄 FORGOT PASSWORD FLOW - Visual Guide

## Complete End-to-End Flow

```
USER JOURNEY:

┌─ START ─────────────────────────────────────────────────────────┐
│                                                                  │
│  USER is on LMS (Logged Out)                                   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌─ FORGOT PASSWORD BUTTON ────────────────────────────────────────┐
│                                                                  │
│  1. User clicks "Forgot Password?" link                         │
│  2. Frontend navigates to /forgot-password                      │
│  3. ForgotPassword.jsx component loads                          │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌─ EMAIL INPUT PAGE ──────────────────────────────────────────────┐
│                                                                  │
│  Form displays with:                                            │
│  - Email input field                                            │
│  - "Send Reset Link" button                                     │
│  - Validation (regex check for valid email)                     │
│                                                                  │
│  User enters: your-email@gmail.com                        │
│  User clicks: "Send Reset Link"                                │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              ↓
         ┌─────────────────────────────────────┐
         │  Frontend Calls Backend API:         │
         │  POST /api/auth/forgot-password      │
         │  Body: { email: "..." }              │
         └─────────────────────────────────────┘
                              ↓
┌─ BACKEND PROCESSES REQUEST ─────────────────────────────────────┐
│                                                                  │
│  forgotPassword() function:                                    │
│                                                                  │
│  1. ✅ Find user by email in MongoDB                            │
│  2. ✅ Generate secure token (crypto.randomBytes 32)            │
│  3. ✅ Hash token (SHA256)                                      │
│  4. ✅ Save hashed token + expiry (30 min) to DB                │
│  5. ✅ Send reset email via Gmail SMTP                          │
│  6. ✅ Return: "Email sent successfully"                        │
│                                                                  │
│  Database updated:                                              │
│  User.resetPasswordToken = "hashed_token_value"                │
│  User.resetPasswordExpire = Date + 30 minutes                  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌─ EMAIL DELIVERY ────────────────────────────────────────────────┐
│                                                                  │
│  Gmail SMTP sends email to: your-email@gmail.com          │
│                                                                  │
│  Subject: 🔐 Password Reset Request                             │
│                                                                  │
│  Body includes:                                                 │
│  - "Click the link below to reset your password"              │
│  - Reset link with plain token (NOT hashed): /reset-password?t │
│  - Expires in 30 minutes from now                              │
│  - "If you didn't request this, ignore this email"            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌─ USER CHECKS EMAIL ─────────────────────────────────────────────┐
│                                                                  │
│  1. Open Gmail                                                  │
│  2. Find email from: noreply@gmail.com                         │
│  3. Email subject: 🔐 Password Reset Request                    │
│  4. Click: "Reset Your Password" button                         │
│     (button href = localhost:5174/reset-password/:plainToken)   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              ↓
         ┌─────────────────────────────────────┐
         │  Browser navigates to:               │
         │  /reset-password/abcd1234...         │
         │                                      │
         │  Token: Plain text from URL (not h)  │
         └─────────────────────────────────────┘
                              ↓
┌─ RESET PASSWORD PAGE LOADS ─────────────────────────────────────┐
│                                                                  │
│  ResetPassword.jsx component:                                  │
│                                                                  │
│  1. Extract token from URL                                      │
│  2. Call: GET /api/auth/reset-password/:token                  │
│  3. Backend validates token:                                    │
│     - Hash the plain token from URL                             │
│     - Compare with stored hashed token in DB                    │
│     - Check if expired (< 30 min)                               │
│  4. If valid: "Token is valid, render password form"           │
│  5. If invalid: "Token expired or invalid"                     │
│                                                                  │
│  User sees:                                                     │
│  - Password input field                                         │
│  - Confirm password input field                                 │
│  - "Reset Password" button                                      │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌─ USER ENTERS NEW PASSWORD ──────────────────────────────────────┐
│                                                                  │
│  Form validation:                                               │
│  - Password must be ≥ 6 characters                              │
│  - Passwords must match                                         │
│                                                                  │
│  User enters:                                                   │
│  - Password: NewPassword456                                     │
│  - Confirm: NewPassword456                                      │
│  - Clicks: "Reset Password"                                     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              ↓
         ┌─────────────────────────────────────┐
         │  Frontend Calls Backend API:         │
         │  POST /api/auth/reset-password/:token │
         │  Body: { password: "..." }           │
         └─────────────────────────────────────┘
                              ↓
┌─ BACKEND UPDATES PASSWORD ──────────────────────────────────────┐
│                                                                  │
│  resetPassword() function:                                     │
│                                                                  │
│  1. ✅ Hash plain token from request                            │
│  2. ✅ Find user with matching hashed token                     │
│  3. ✅ Check token not expired                                  │
│  4. ✅ Hash new password with bcryptjs (10 salt rounds)         │
│  5. ✅ Save new password to DB                                  │
│  6. ✅ Clear resetPasswordToken from DB                         │
│  7. ✅ Clear resetPasswordExpire from DB                        │
│  8. ✅ Send confirmation email                                  │
│  9. ✅ Return: "Password reset successfully"                    │
│                                                                  │
│  Database updated:                                              │
│  User.password = "$2b$10$..." (bcrypted)                       │
│  User.resetPasswordToken = null (CLEARED!)                     │
│  User.resetPasswordExpire = null (CLEARED!)                    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌─ SUCCESS MESSAGE ───────────────────────────────────────────────┐
│                                                                  │
│  Frontend shows:                                                │
│  ✅ "Password has been reset successfully.                      │
│     You can now log in with your new password."                │
│                                                                  │
│  Button: "Go to Login"                                          │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌─ CONFIRMATION EMAIL SENT ───────────────────────────────────────┐
│                                                                  │
│  Gmail SMTP sends confirmation email:                           │
│                                                                  │
│  Subject: ✅ Password Reset Confirmation                        │
│                                                                  │
│  Body:                                                          │
│  - "Your password was successfully changed"                     │
│  - "If this wasn't you, contact support"                       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌─ USER LOGS IN WITH NEW PASSWORD ────────────────────────────────┐
│                                                                  │
│  User clicks: "Go to Login"                                     │
│  Page shows: Login form                                         │
│                                                                  │
│  User enters:                                                   │
│  - Email: your-email@gmail.com                            │
│  - Password: NewPassword456                                     │
│  - Clicks: "Sign In"                                            │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                     LOGIN VALIDATION                             │
│                                                                  │
│  Backend login() function:                                     │
│  1. Find user by email                                         │
│  2. Take plain password from form                              │
│  3. Hash it with bcryptjs.compare()                            │
│  4. Compare with stored password hash                          │
│  5. If match: Generate JWT token                               │
│  6. Return: { token: "jwt_token" }                             │
│  7. Frontend stores JWT and redirects to dashboard             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌─ LOGGED IN - SUCCESS! ──────────────────────────────────────────┐
│                                                                  │
│  Dashboard loads                                                │
│  User is logged in with NEW password                            │
│                                                                  │
│  ✅ Forgot password feature working perfectly!                  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Key Security Points

### 🔒 Token Security

```
Token Generation:
  User requests reset → Generate random 32 bytes → Hash with SHA256
  
Token Storage:
  Hashed token stored in DB
  Plain token sent in email (only in URL, not in DB)
  
Token Validation:
  Email link contains: /reset?token=abcd1234...
  User clicks → Frontend extracts plain token from URL
  Frontend sends plain token to backend
  Backend hashes it → compares with stored hash
  If match AND not expired → Token is valid
  
Token Expires:
  30 minutes after generation
  Timestamp checked: if Date.now() > resetPasswordExpire → Expired
  
Token One-Time Use:
  After password reset → Token deleted from DB
  Same token cannot be used again
  Old email links become invalid (security feature)
```

### 🔐 Password Security

```
Old Password (before reset):
  User -> "TestPassword123" -> Hashing algorithm -> "$2b$10$..."
         (plain text)     (bcryptjs 10 rounds)   (stored in DB)

New Password (after reset):
  User enters new password → Bcryptjs hashes → Stored as "$2b$10$..."
  
Login (using new password):
  "NewPassword456" (plain) → bcryptjs.compare() → Matches stored hash ✅
  "TestPassword123" (old)  → bcryptjs.compare() → Does NOT match ❌
  
Result: Old password permanently unusable
```

---

## What Each Component Does

### Frontend Components

```
ForgotPassword.jsx:
├─ Email input field
├─ Validation (regex)
├─ Loading state during submission
├─ Success message: "Email sent"
└─ Error handling: "Email not found"

ResetPassword.jsx:
├─ Extract token from URL
├─ Validate token with backend
├─ If valid:
│  ├─ Show password input form
│  ├─ Validate password (≥6 chars)
│  ├─ Check password confirmation
│  └─ Submit new password
├─ If invalid:
│  └─ Show: "Token expired or invalid"
└─ After success:
   └─ Redirect to login page
```

### Backend APIs

```
POST /api/auth/forgot-password
  Request: { email: "..." }
  Response: { message: "Email sent" }
  Process:
    1. Find user
    2. Generate + hash token
    3. Save token + expiry
    4. Send email
    
GET /api/auth/reset-password/:token
  Request: Token in URL
  Response: { valid: true } or { valid: false }
  Process:
    1. Hash token from URL
    2. Find user with matching hash
    3. Check not expired
    4. Return validity
    
POST /api/auth/reset-password/:token
  Request: { password: "..." }
  Response: { message: "Password reset" }
  Process:
    1. Validate token
    2. Hash new password
    3. Save password
    4. Delete token
    5. Send confirmation email
```

### Email Service

```
Nodemailer + Gmail SMTP
├─ Read Gmail credentials from .env
├─ Connect to Gmail SMTP
├─ Format HTML email
├─ Send password reset email
├─ Send confirmation email
└─ Log results/errors
```

---

## Testing This Flow

### Quick Test

```
1. Request password reset (your-email@gmail.com)
   ↓ (Check Gmail for email)
2. Click link in email
   ↓ (Token validated, form shows)
3. Enter new password
   ↓ (Backend hashes + saves)
4. Success message appears
   ↓ (Confirmation email sent)
5. Click "Go to Login"
   ↓ (Navigate to login)
6. Login with new password
   ↓ (bcryptjs compares)
7. Dashboard loads
   ✅ SUCCESS!
```

### Verification Tests

```
✅ Can request reset with valid email
✅ Cannot request reset with invalid email
✅ Received email in Gmail inbox
✅ Email contains clickable link
✅ Clicking link shows password form (token valid)
✅ Invalid token shows error
✅ Old token shows error (>30 min expired)
✅ Password must be ≥6 characters
✅ Passwords must match
✅ New password saves successfully
✅ Login works with new password
✅ Login fails with old password
✅ Same email link cannot be used twice
✅ Confirmation email received
```

---

## Time Breakdown

```
Setup Phase:
├─ Enable 2FA: 2 minutes
├─ Get App Password: 2 minutes
├─ Update .env: 1 minute
├─ Restart backend: 2 minutes
└─ Verify: 2 minutes
   SETUP TOTAL: 9 minutes

Testing Phase:
├─ Create account: 1 minute
├─ Request reset: 2 minutes
├─ Check email: 2 minutes
├─ Click link: 1 minute
├─ Set password: 1 minute
├─ Login: 1 minute
└─ Verify old password fails: 1 minute
   TEST TOTAL: 9 minutes

GRAND TOTAL: 18 minutes
```

---

**All systems ready! Follow the checklist in `SETUP_CHECKLIST.md` to complete setup. 🚀**
