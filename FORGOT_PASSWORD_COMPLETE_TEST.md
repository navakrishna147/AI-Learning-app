# 🔐 Complete Forgot Password Testing Guide
## For: your-email@gmail.com

---

## 📋 Prerequisites Check

✅ **Backend:** Running on port 5000  
✅ **Frontend:** Running on port 5174  
✅ **MongoDB:** Connected  
✅ **Code:** Password reset endpoints implemented and working  

⚠️ **Missing:** Gmail App Password (5-minute setup required)

---

## ⚡ Quick Setup (5 minutes)

### Phase 1: Enable 2-Factor Authentication (2 minutes)

**For your-email@gmail.com:**

1. Go to: https://myaccount.google.com/security
2. Sign in with: **your-email@gmail.com**
3. Scroll down to find "**2-Step Verification**"
4. Click on it
5. Click "**Get Started**"
6. Choose how to verify (phone number, authenticator, etc.)
7. Complete the verification
8. ⏳ **Wait 5-10 minutes** for changes to take effect

### Phase 2: Generate Gmail App Password (2 minutes)

Once 2FA is enabled:

1. Go to: https://myaccount.google.com/apppasswords
2. Sign in again if asked
3. You may need to verify with your 2FA method
4. **Dropdown 1:** Select "**Mail**"
5. **Dropdown 2:** Select "**Windows Computer**"
6. Click "**Generate**"
7. Google shows: `abcd efgh ijkl mnop` (with spaces)
8. **Copy ONLY the 16 characters:** `abcdefghijklmnop` (no spaces)

### Phase 3: Configure Backend (1 minute)

1. Open: `backend/.env`
2. Find:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=0000000000000000
   ```
3. Replace with:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=abcdefghijklmnop
   ```
4. **Save the file** (Ctrl+S)
5. Stop backend (Ctrl+C in terminal)
6. Restart backend: `npm run dev`

### Phase 4: Verify Configuration (1 minute)

In terminal, run:
```bash
node test-email-config.js
```

Expected output:
```
✅ All tests passed!
📧 Email: your-email@gmail.com
🔑 Password: ••••••••••••••••
```

---

## 🧪 Test the Complete Flow

### Test Scenario: User "John Doe" requests password reset

#### Step 1: Create a Test User (if not exists)
1. Go to: http://localhost:5174
2. Click "**Sign Up**"
3. Create account with:
   - **Email:** your-email@gmail.com (or another test email)
   - **Password:** TestPassword123
   - **Name:** John Doe
4. Complete signup

#### Step 2: Logout
1. Click your profile
2. Click "**Logout**"

#### Step 3: Request Password Reset
1. Go to: http://localhost:5174 (login page)
2. Click "**Forgot Password?**"
3. Enter: **your-email@gmail.com**
4. Click "**Send Reset Link**"

**Expected Result:**
```
✅ "Password reset email has been sent to your email address. 
Please check your inbox and spam folder."
```

#### Step 4: Check Email
1. Open Gmail: https://gmail.com
2. Sign in with: **your-email@gmail.com**
3. Find email from: `your-email@gmail.com` (sender address configured in .env)
4. Subject: `🔐 Password Reset Request - AI Learning Assistant`
5. Click "**Reset Your Password**" button (or copy the link)

#### Step 5: Set New Password
You're now on the reset password page:
```
Link format: /reset-password/TOKEN_HERE
```

1. Enter new password: **NewPassword456**
2. Confirm password: **NewPassword456**
3. Click "**Reset Password**"

**Expected Result:**
```
✅ "Password has been reset successfully. 
You can now log in with your new password."
```

#### Step 6: Login with New Password
1. Go back to login page
2. Email: **your-email@gmail.com**
3. Password: **NewPassword456**
4. Click "**Sign In**"

**Expected Result:**
```
✅ Dashboard loads successfully
✅ You're logged in as the user
```

---

## 🔍 Verify Current Implementation

The code already includes:

✅ **Forgot Password Endpoint**
- `/api/auth/forgot-password` (POST)
- Sends email with 30-minute expiring link
- Email template with branding

✅ **Token Validation**  
- `/api/auth/reset-password/:token` (GET)
- Validates token format and expiration
- Returns user email if valid
- Returns error if expired or invalid

✅ **Password Reset**
- `/api/auth/reset-password/:token` (POST)
- Updates password with bcrypt hashing
- Clears reset token after use
- Sends confirmation email

✅ **Security Features**
- Tokens expire after 30 minutes
- Tokens are hashed in database
- Password hashing with bcryptjs
- OnePassword reset per token

---

## ✅ Complete Code Validation

### Backend Endpoints (Already Implemented)

```javascript
// Routes are in: backend/routes/authRoutes.js

POST /api/auth/forgot-password
  - Input: { email }
  - Output: { success, message, email }
  - Sends email with reset link

GET /api/auth/reset-password/:token
  - Input: token in URL
  - Output: { success, message, email }
  - Validates token

POST /api/auth/reset-password/:token
  - Input: { password, confirmPassword }
  - Output: { success, message }
  - Updates password
```

### Frontend Components (Already Implemented)

✅ **ForgotPassword.jsx** (`frontend/src/pages/auth/ForgotPassword.jsx`)
- Email input form
- Success/error messages
- Email validation
- Loading states

✅ **ResetPassword.jsx** (`frontend/src/pages/auth/ResetPassword.jsx`)
- Token validation on mount
- Password input form
- Password confirmation
- Success/error messages

### Database Schema (Already Implemented)

```javascript
// User model includes:
resetPasswordToken: String,      // Hashed token
resetPasswordExpire: Date         // 30-minute expiration
password: String                  // Bcrypt hashed
```

---

## 🔧 Password Reset Code Walkthrough

### What Happens When User Clicks "Forgot Password"

1. **Frontend sends request:**
   ```javascript
   POST /api/auth/forgot-password
   { email: "your-email@gmail.com" }
   ```

2. **Backend processes:**
   - Validates email format
   - Finds user in database
   - Generates random token (32 bytes)
   - Hashes token with SHA256
   - Saves hashed token to user.resetPasswordToken
   - Sets expiration to 30 minutes: Date.now() + 30*60*1000
   - Saves user

3. **Backend sends email:**
   - Creates reset URL: `http://localhost:5174/reset-password/{PLAIN_TOKEN}`
   - Builds HTML email template
   - Sends via Gmail SMTP
   - Returns success/error

4. **User receives email:**
   - From: your-email@gmail.com
   - Contains reset link with plain token (only known to user)
   - Link expires after 30 minutes

### What Happens When User Clicks Reset Link

1. **Frontend validates token (GET):**
   ```javascript
   GET /api/auth/reset-password/{token}
   ```

2. **Backend validates:**
   - Hashes the token: SHA256(token)
   - Finds user where:
     - resetPasswordToken == hashedToken
     - resetPasswordExpire > now()
   - Returns user email if valid
   - Returns error if:
     - Token doesn't match (invalid/wrong token)
     - Expiration time passed (>30 min)
     - Token already used (cleared after reset)

3. **Frontend shows reset form:**
   - Only if token is valid
   - Shows user's email
   - Prompts for new password

### What Happens When User Sets New Password

1. **Frontend sends request:**
   ```javascript
   POST /api/auth/reset-password/{token}
   {
     password: "NewPassword456",
     confirmPassword: "NewPassword456"
   }
   ```

2. **Backend validates:**
   - Password length ≥ 6 chars
   - Passwords match
   - Token is valid and not expired

3. **Backend updates password:**
   - **Direct assignment:** `user.password = "NewPassword456"`
   - **Pre-save hook automatically hashes it** using bcryptjs
   - Clears reset token: `user.resetPasswordToken = null`
   - Clears expiration: `user.resetPasswordExpire = null`
   - Saves user to database

4. **Password hashing happens automatically:**
   ```javascript
   // In User model:
   userSchema.pre("save", async function(next) {
     if (!this.isModified("password")) return next();
     const salt = await bcryptjs.genSalt(10);
     this.password = await bcryptjs.hash(this.password, salt);
     next();
   });
   ```

5. **Frontend confirmation:**
   - Shows success message
   - Redirects to login after 3 seconds
   - User can login with new password

---

## 🆘 Troubleshooting

### Email Not Received

**Cause:** Email service not configured

**Fix:**
```bash
npm run dev
node test-email-config.js
```

Check for output:
```
✅ All tests passed!
```

### "Backend unreachable" Error

**Cause:** Backend not running or MongoDB disconnected

**Fix:**
```bash
pm2 status              # Check backend status
pm2 restart ai-backend  # Restart if needed
pm2 logs ai-backend     # View logs
```

### Token Invalid Error When Clicking Email Link

**Causes:**
- Token expired (>30 minutes)
- Link opened twice (token cleared after first use)
- URL modified

**Fix:**
- Request new password reset
- Click link immediately after requesting

### Password Doesn't Update

**Cause:** Unlikely, but could be database issue

**Fix:**
1. Check backend logs for errors
2. Verify MongoDB is running
3. Check user document in database:
   ```bash
   # In MongoDB
   db.users.findOne({ email: "your-email@gmail.com" })
   # Should show password hash
   ```

---

## ✨ Features We'll Test

| Feature | Status |
|---------|--------|
| User requests password reset | ✅ Implemented |
| Email sent with reset link | ✅ Implemented |
| Link includes secure token | ✅ Implemented |
| Token expires after 30 min | ✅ Implemented |
| Frontend validates token | ✅ Implemented |
| User sets new password | ✅ Implemented |
| Password hashed with bcrypt | ✅ Implemented |
| Confirmation email sent | ✅ Implemented |
| User can login with new password | ✅ Implemented |

---

## 📝 Testing Checklist

- [ ] Gmail 2FA enabled
- [ ] Gmail App Password generated
- [ ] `.env` file updated with credentials
- [ ] Backend restarted
- [ ] `test-email-config.js` runs successfully
- [ ] Test user created
- [ ] Forgot password email received
- [ ] Reset link works
- [ ] New password set successfully
- [ ] Can login with new password
- [ ] Old password doesn't work

---

## 🎯 Summary

**Everything is ready!** The only missing step is:

1. Set up Gmail App Password (5 min)
2. Update `.env` (1 min)
3. Restart backend (1 min)
4. Run test (1 min)

**Total: 8 minutes** → Your forgot password feature will be fully functional!

Start with **Phase 1** above ☝️
