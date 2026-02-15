# ✅ SETUP CHECKLIST - Forgot Password Testing

## Pre-Check: Is Backend Running?

```bash
# Terminal 1 - Check if backend is running on port 5000
curl http://localhost:5000/api/health
```

**Expected:** ✅ Returns `{"status":"healthy","database":{"connected":true}}`

**If not running:**
```bash
cd backend
npm run dev
# Wait for: ✅ DATABASE CONNECTED
# Wait for: ✅ SERVER LISTENING ON 5000
```

---

## 📱 GMAIL SETUP (Do exactly in this order)

### ✅ Task 1: Enable 2-Factor Authentication

**[⏱️ 2 minutes]**

- [ ] Open: https://myaccount.google.com/security
- [ ] Sign in with: `your-email@gmail.com`
- [ ] Find: "2-Step Verification"
- [ ] Click: "Get Started"
- [ ] Choose: Text, Call, or Authenticator
- [ ] Complete verification
- [ ] **STOP HERE - Wait 5-10 minutes before next step!**

**Verification:**
Back at Google Account → Security → 2-Step Verification should show **"on"** ✅

---

### ✅ Task 2: Generate App Password

**[⏱️ 2 minutes] - Do this ONLY after 2FA is enabled**

- [ ] Open: https://myaccount.google.com/apppasswords
- [ ] Sign in again (may need 2FA verification)
- [ ] **First dropdown:** Select "Mail" ⬇️
- [ ] **Second dropdown:** Select "Windows Computer" ⬇️
- [ ] Click: **"Generate"**
- [ ] Google displays a password like: `abcd efgh ijkl mnop`
- [ ] **IMPORTANT:** Copy ONLY the 16 characters: `abcdefghijklmnop`
- [ ] **Paste somewhere temporary** to not lose it

---

## 🔧 BACKEND CONFIGURATION

### ✅ Task 3: Update .env File

**[⏱️ 2 minutes]**

**File location:** `backend/.env`

**Find these lines:**
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=0000000000000000
```

**Replace with your values:**
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
```

**Checklist:**
- [ ] File: `backend/.env`
- [ ] EMAIL_USER = `your-email@gmail.com`
- [ ] EMAIL_PASSWORD = Your 16-char App Password (NO SPACES)
- [ ] File saved (Ctrl+S)
- [ ] No quotes around values
- [ ] No extra spaces

---

### ✅ Task 4: Restart Backend

**[⏱️ 2 minutes]**

**In terminal with backend running:**

- [ ] Press: `Ctrl+C` (stop backend)
- [ ] Type: `npm run dev`
- [ ] Wait for:
  - [ ] `✅ DATABASE CONNECTED`
  - [ ] `✅ SERVER LISTENING ON 5000`

---

## 🔐 VERIFICATION

### ✅ Task 5: Test Email Configuration

**[⏱️ 2 minutes]**

**In new terminal (backend folder):**

```bash
node test-email-config.js
```

**Checklist:**
- [ ] Command executed without errors
- [ ] Output shows: `✅ All tests passed!`
- [ ] Output shows your email: `📧 Email: your-email@gmail.com`
- [ ] Output shows masked password: `🔑 Password: ••••••••••••••••`

**If you see errors:**
- Check .env file for typos
- Check App Password is exactly 16 characters
- Check no extra spaces
- Restart backend again

---

## 🧪 TESTING PHASE (Now the actual functionality test)

### ✅ Task 6: Create Test Account

**[⏱️ 1 minute]**

**Open:** http://localhost:5174

- [ ] Click: "Sign Up"
- [ ] Enter Email: `your-email@gmail.com`
- [ ] Enter Password: `TestPassword123`
- [ ] Enter Name: `John Doe`
- [ ] Click: "Sign Up"
- [ ] See: Dashboard loads
- [ ] ✅ Account created successfully

---

### ✅ Task 7: Request Password Reset

**[⏱️ 2 minutes]**

- [ ] Click: Your profile (top right)
- [ ] Click: "Logout"
- [ ] Click: "Forgot Password?"
- [ ] Enter: `your-email@gmail.com`
- [ ] Click: "Send Reset Link"
- [ ] See message: ✅ "Password reset email has been sent"
- [ ] ✅ Check inbox/spam in Gmail

---

### ✅ Task 8: Click Reset Email Link

**[⏱️ 2 minutes]**

**In Gmail (https://gmail.com):**

- [ ] Sign in with: `your-email@gmail.com`
- [ ] Find email with subject: "🔐 Password Reset Request"
- [ ] Open email
- [ ] Click: "Reset Your Password" button
- [ ] Browser opens reset page
- [ ] See form for new password

---

### ✅ Task 9: Set New Password

**[⏱️ 1 minute]**

**On reset password form:**

- [ ] Enter: New Password = `NewPassword456`
- [ ] Enter: Confirm Password = `NewPassword456`
- [ ] Click: "Reset Password"
- [ ] See message: ✅ "Password has been reset successfully"
- [ ] See button: "Go to Login"

---

### ✅ Task 10: Login with New Password

**[⏱️ 1 minute]**

**On login page:**

- [ ] Enter Email: `your-email@gmail.com`
- [ ] Enter Password: `NewPassword456` ← NEW PASSWORD
- [ ] Click: "Sign In"
- [ ] Dashboard loads
- [ ] ✅ **YOU'RE LOGGED IN!**

---

### ✅ Task 11: Test Old Password Doesn't Work

**[⏱️ 1 minute]**

**Back at login:**

- [ ] Click: Logout
- [ ] Enter Email: `your-email@gmail.com`
- [ ] Enter Password: `TestPassword123` ← OLD PASSWORD
- [ ] Click: "Sign In"
- [ ] See error: ❌ "Invalid credentials"
- [ ] ✅ **OLD PASSWORD REJECTED!**

---

## 🎉 FINAL CHECKLIST

All done when ALL these are ✅:

- [ ] Task 1: 2FA enabled (Google shows "on")
- [ ] Task 2: App Password generated (16 characters)
- [ ] Task 3: .env file updated with credentials
- [ ] Task 4: Backend restarted successfully
- [ ] Task 5: `node test-email-config.js` shows ✅ All tests passed
- [ ] Task 6: Test account created successfully
- [ ] Task 7: Password reset email received in Gmail
- [ ] Task 8: Reset link clicked successfully
- [ ] Task 9: New password set successfully
- [ ] Task 10: Logged in with new password
- [ ] Task 11: Old password rejected

---

## 📊 Progress Tracker

```
SETUP PHASE (Tasks 1-5):
[ ] Task 1: Enable 2FA            ⏱️  2 min
[ ] Task 2: App Password           ⏱️  2 min  
[ ] Task 3: Update .env            ⏱️  2 min
[ ] Task 4: Restart Backend        ⏱️  2 min
[ ] Task 5: Verify Setup           ⏱️  2 min
                                   ───────────
SETUP TOTAL:                       ⏱️  10 min

TESTING PHASE (Tasks 6-11):
[ ] Task 6: Create Account         ⏱️  1 min
[ ] Task 7: Request Reset          ⏱️  2 min
[ ] Task 8: Click Email Link       ⏱️  2 min
[ ] Task 9: Set New Password       ⏱️  1 min
[ ] Task 10: Login New Password    ⏱️  1 min
[ ] Task 11: Test Old Password     ⏱️  1 min
                                   ───────────
TESTING TOTAL:                     ⏱️  8 min

GRAND TOTAL:                       ⏱️  18 min
```

---

## 🆘 QUICK TROUBLESHOOTING

### ❌ "Email Not Received"

```
✅ Check Gmail Spam folder first
✅ Run: node test-email-config.js (check for errors)
✅ Verify 2FA is actually turned on
✅ Verify App Password is exactly 16 chars (no spaces)
```

### ❌ "Backend Won't Start"

```
✅ Check port 5000 is free: netstat -ano | findstr 5000
✅ Kill any process on 5000
✅ Run: npm run dev again
```

### ❌ "Reset Link Doesn't Work"

```
✅ Token expires after 30 minutes - request new email
✅ Make sure you're using the exact URL from email
✅ Check browser console for errors (F12)
```

---

## 📚 NEED MORE HELP?

- **Gmail Setup:** See `GMAIL_APP_PASSWORD_SETUP.md`
- **Testing Guide:** See `FORGOT_PASSWORD_COMPLETE_TEST.md`
- **System Check:** See `READY_FOR_TESTING.md`
- **What's Implemented:** See `FORGOT_PASSWORD_SUMMARY.md`

---

**You're all set! Start with Task 1 above 🚀**
