# Authentication System - Step-by-Step Test Plan

**Objective:** Verify all signup, login, and forgot password functionality works correctly

---

## 🔧 Prerequisites

### Required Software
- [ ] Node.js installed
- [ ] MongoDB running locally (default: localhost:27017)
- [ ] Two terminals available

### Required Configuration
- [ ] Edit `backend/.env` and add:
  ```
  EMAIL_USER=your-email@gmail.com
  EMAIL_PASSWORD=your-app-password  
  FRONTEND_URL=http://localhost:5173
  ```

---

## 🚀 Startup Checklist

### Terminal 1: Backend
```bash
cd ai-learning-assistant/backend
npm run dev
```

**Wait for:**
```
✅ Server is running on port 5000
✅ MongoDB Connected
```

### Terminal 2: Frontend
```bash
cd ai-learning-assistant/frontend
npm run dev
```

**Wait for:**
```
✓ ready in 1000ms
VITE v5.0.8  ready in 1000 ms
➜  Local: http://localhost:5173/
```

---

## ✅ Test Suite 1: Signup Flow

### Test 1.1: Valid Signup
**Steps:**
1. Open http://localhost:5173/signup
2. Fill in form:
   - Username: `testuser123`
   - Email: `testuser123@example.com`
   - Password: `password123`
   - Confirm: `password123`
3. Click "Sign up"

**Expected Results:**
- ✅ No error messages
- ✅ Redirected to `/dashboard` automatically
- ✅ Backend logs: "✅ New user registered: testuser123@example.com"
- ✅ User data stored in MongoDB

**Verify in MongoDB:**
```bash
mongosh
use ai-learning-assistant
db.users.findOne({ email: "testuser123@example.com" })
```

---

### Test 1.2: Empty Fields Validation
**Steps:**
1. Go to http://localhost:5173/signup
2. Leave ALL fields empty
3. Click "Sign up"

**Expected Results:**
- ✅ Error: "All fields are required"
- ✅ Red error box appears
- ✅ Form doesn't submit

---

### Test 1.3: Password Mismatch
**Steps:**
1. Go to http://localhost:5173/signup
2. Fill in:
   - Username: `testuser456`
   - Email: `testuser456@example.com`
   - Password: `password123`
   - Confirm: `password456` (different)
3. Click "Sign up"

**Expected Results:**
- ✅ Error: "Passwords do not match"
- ✅ Form doesn't submit

---

### Test 1.4: Short Password
**Steps:**
1. Go to http://localhost:5173/signup
2. Fill in:
   - Username: `testuser789`
   - Email: `testuser789@example.com`
   - Password: `pass` (only 4 chars)
   - Confirm: `pass`
3. Click "Sign up"

**Expected Results:**
- ✅ Error: "Password must be at least 6 characters"
- ✅ Form doesn't submit

---

### Test 1.5: Invalid Email
**Steps:**
1. Go to http://localhost:5173/signup
2. Fill in:
   - Username: `testuser`
   - Email: `invalidemail` (no @)
   - Password: `password123`
   - Confirm: `password123`
3. Click "Sign up"

**Expected Results:**
- ✅ Error: "Please enter a valid email address"
- ✅ Form doesn't submit

---

### Test 1.6: Duplicate Email
**Steps:**
1. Go to http://localhost:5173/signup
2. Fill in:
   - Username: `differentuser`
   - Email: `testuser123@example.com` (already exists)
   - Password: `password123`
   - Confirm: `password123`
3. Click "Sign up"

**Expected Results:**
- ✅ Error: "User with this email already exists. Please login instead."
- ✅ Helpful link to login page

---

### Test 1.7: Duplicate Username
**Steps:**
1. Go to http://localhost:5173/signup
2. Fill in:
   - Username: `testuser123` (already exists)
   - Email: `newemail@example.com`
   - Password: `password123`
   - Confirm: `password123`
3. Click "Sign up"

**Expected Results:**
- ✅ Error: "Username is already taken"
- ✅ Form doesn't submit

---

### Test 1.8: Show/Hide Password
**Steps:**
1. Go to http://localhost:5173/signup
2. Click on password field
3. Enter password: `password123`
4. Click the eye icon (show password toggle)

**Expected Results:**
- ✅ Password becomes visible as plain text
- ✅ Eye icon changes appearance
- ✅ Click again to hide password

---

### Test 1.9: Already Logged In Redirect
**Steps:**
1. Already logged in from previous test
2. Go to http://localhost:5173/signup

**Expected Results:**
- ✅ Automatically redirected to `/dashboard`
- ✅ Signup page doesn't load

---

## ✅ Test Suite 2: Login Flow

### Test 2.1: Valid Login
**Steps:**
1. Logout first (or use new private/incognito window)
2. Go to http://localhost:5173/login
3. Fill in:
   - Email: `testuser123@example.com`
   - Password: `password123`
4. Click "Sign in"

**Expected Results:**
- ✅ No error messages
- ✅ Redirected to `/dashboard` automatically
- ✅ Backend logs: "✅ User logged in: testuser123@example.com"
- ✅ User data in sidebar/header shows username

---

### Test 2.2: Empty Fields
**Steps:**
1. Go to http://localhost:5173/login
2. Leave both fields empty
3. Click "Sign in"

**Expected Results:**
- ✅ Error: "Email and password are required"
- ✅ Form doesn't submit

---

### Test 2.3: Incorrect Email
**Steps:**
1. Go to http://localhost:5173/login
2. Fill in:
   - Email: `wrongemail@example.com`
   - Password: `password123`
3. Click "Sign in"

**Expected Results:**
- ✅ Error: "Invalid email or password"
- ✅ Form doesn't submit
- ✅ No indication which field is wrong (security)

---

### Test 2.4: Incorrect Password
**Steps:**
1. Go to http://localhost:5173/login
2. Fill in:
   - Email: `testuser123@example.com`
   - Password: `wrongpassword`
3. Click "Sign in"

**Expected Results:**
- ✅ Error: "Invalid email or password"
- ✅ Form doesn't submit

---

### Test 2.5: Show/Hide Password
**Steps:**
1. Go to http://localhost:5173/login
2. Enter password: `password123`
3. Click eye icon

**Expected Results:**
- ✅ Password becomes visible
- ✅ Click again to hide

---

### Test 2.6: Logout
**Steps:**
1. Login successfully (Test 2.1)
2. Find logout button (usually in header/navigation)
3. Click logout

**Expected Results:**
- ✅ User data cleared from localStorage
- ✅ Token removed
- ✅ Redirected to `/login`
- ✅ Can't access `/dashboard` anymore

---

## ✅ Test Suite 3: Forgot Password Flow

### Test 3.1: Request Password Reset
**Steps:**
1. Go to http://localhost:5173/login
2. Click "Forgot password?" link

**Expected Results:**
- ✅ Redirected to `/forgot-password`
- ✅ Clean form with email input
- ✅ Helpful instructions displayed

---

### Test 3.2: Valid Email Reset Request
**Steps:**
1. On forgot password page
2. Enter email: `testuser123@example.com`
3. Click "Send Reset Link"

**Expected Results:**
- ✅ Loading spinner appears
- ✅ Success screen shown after 2-5 seconds
- ✅ Message: "Check Your Email"
- ✅ Confirms email address
- ✅ Step-by-step instructions
- ✅ Backend logs show:
  ```
  🔍 Processing forgot password request for: testuser123@example.com
  ✅ User found: testuser123@example.com
  📧 Attempting to send password reset email...
  ✅ Email sent successfully
  ```

---

### Test 3.3: Check Email Received
**Steps:**
1. Open your email (Gmail/Outlook/etc)
2. Look for email with subject: "🔐 Password Reset Request"
3. Check inbox and spam folder

**Expected Results:**
- ✅ Email received in inbox
- ✅ Professional HTML template
- ✅ "Reset Your Password" button
- ✅ Reset link with token
- ✅ Expiration warning (30 minutes)
- ✅ From address is your configured EMAIL_USER

---

### Test 3.4: Non-existent Email
**Steps:**
1. On forgot password page
2. Enter email: `nonexistent@example.com`
3. Click "Send Reset Link"

**Expected Results:**
- ✅ Shows success screen (for security)
- ✅ Message: "If an account with this email exists..."
- ✅ No email actually sent
- ✅ User can't tell if email exists (security feature)

---

### Test 3.5: Invalid Email Format
**Steps:**
1. On forgot password page
2. Enter: `invalidemail`
3. Click "Send Reset Link"

**Expected Results:**
- ✅ Error: "Please enter a valid email address"
- ✅ Form doesn't submit

---

### Test 3.6: Try Another Email
**Steps:**
1. After successful reset request
2. On success screen, click "Try Another Email"

**Expected Results:**
- ✅ Back to forgot password form
- ✅ Email field is empty
- ✅ Can enter different email

---

## ✅ Test Suite 4: Reset Password Flow

### Test 4.1: Valid Password Reset
**Steps:**
1. Click email reset link from Test 3.3
2. Should redirect to `/reset-password/[token]`
3. Page should show "Create New Password" form
4. Fill in:
   - Password: `newpassword456`
   - Confirm: `newpassword456`
5. Click "Reset Password"

**Expected Results:**
- ✅ No errors
- ✅ Success screen shown
- ✅ Message: "Password Reset!"
- ✅ Button: "Go to Login"
- ✅ Backend logs:
  ```
  ✅ Password reset successfully for: testuser123@example.com
  ✅ Password reset confirmation email sent successfully
  ```

---

### Test 4.2: Confirm Email After Reset
**Steps:**
1. Check email again for confirmation
2. Should receive email with subject: "✅ Password Changed Successfully"

**Expected Results:**
- ✅ Confirmation email received
- ✅ Professional template
- ✅ Confirms password was reset
- ✅ Security tips included

---

### Test 4.3: Login with New Password
**Steps:**
1. On reset success screen, click "Go to Login"
2. Enter:
   - Email: `testuser123@example.com`
   - Password: `newpassword456` (new password)
3. Click "Sign in"

**Expected Results:**
- ✅ Login successful
- ✅ Redirected to dashboard
- ✅ Backend logs: "✅ User logged in"
- ✅ Old password no longer works

---

### Test 4.4: Expired Token
**Steps:**
1. Get a reset link from email
2. Wait 30+ minutes
3. Try to click reset link

**Expected Results:**
- ✅ Error: "Invalid or expired reset token"
- ✅ Button: "Request New Link"
- ✅ Can start forgot password process again

---

### Test 4.5: Modified/Invalid Token
**Steps:**
1. Get a reset link from email
2. Modify the token in URL (change a character)
3. Try to access page

**Expected Results:**
- ✅ Error: "Invalid or expired reset token"
- ✅ Professional error display
- ✅ Clear next steps

---

### Test 4.6: Password Mismatch
**Steps:**
1. On reset password form
2. Fill in:
   - Password: `newpassword789`
   - Confirm: `differentpassword`
3. Click "Reset Password"

**Expected Results:**
- ✅ Error: "Passwords do not match"
- ✅ Form doesn't submit

---

### Test 4.7: Short Password
**Steps:**
1. On reset password form
2. Fill in both fields with: `pass` (4 chars)
3. Click "Reset Password"

**Expected Results:**
- ✅ Error: "Password must be at least 6 characters"
- ✅ Form doesn't submit

---

## 🐛 Debugging Tests

### Test D.1: Check Backend Console
**During signup:**
```
✅ New user registered: [email]
```

**During login:**
```
✅ User logged in: [email]
```

**During forgot password:**
```
🔍 Processing forgot password request for: [email]
✅ User found: [email]
🔐 Reset token generated and saved
📧 Attempting to send password reset email...
✅ Email sent successfully
```

---

### Test D.2: Check Email Service Logs
**Expected in backend console:**
```
📧 Initializing Gmail transporter...
✅ Email configuration validated
🔌 Testing email transporter connection...
✅ Email transporter is ready
📬 Sending password reset email to: [email]
✅ Password reset email sent successfully
📧 Message ID: [id]
```

---

### Test D.3: Check MongoDB
**Verify user stored:**
```bash
mongosh
use ai-learning-assistant
db.users.findOne({ email: "testuser123@example.com" })
```

**Should see:**
```json
{
  _id: ObjectId("..."),
  username: "testuser123",
  email: "testuser123@example.com",
  password: "$2a$10$...", // Hashed password
  role: "student",
  lastLogin: ISODate("2026-02-11T..."),
  createdAt: ISODate("2026-02-11T..."),
  updatedAt: ISODate("2026-02-11T...")
}
```

---

### Test D.4: Check localStorage
**In browser DevTools:**
1. F12 → Application → Storage → Local Storage
2. Should see:
   - `user` - JSON with user data
   - `token` - JWT token

---

## 🎯 Summary Checklist

### Signup Tests
- [ ] Test 1.1: Valid Signup ✅
- [ ] Test 1.2: Empty Fields ✅
- [ ] Test 1.3: Password Mismatch ✅
- [ ] Test 1.4: Short Password ✅
- [ ] Test 1.5: Invalid Email ✅
- [ ] Test 1.6: Duplicate Email ✅
- [ ] Test 1.7: Duplicate Username ✅
- [ ] Test 1.8: Show/Hide Password ✅
- [ ] Test 1.9: Redirect if Logged In ✅

### Login Tests
- [ ] Test 2.1: Valid Login ✅
- [ ] Test 2.2: Empty Fields ✅
- [ ] Test 2.3: Incorrect Email ✅
- [ ] Test 2.4: Incorrect Password ✅
- [ ] Test 2.5: Show/Hide Password ✅
- [ ] Test 2.6: Logout ✅

### Forgot Password Tests
- [ ] Test 3.1: Go to Forgot Password Page ✅
- [ ] Test 3.2: Valid Reset Request ✅
- [ ] Test 3.3: Email Received ✅
- [ ] Test 3.4: Non-existent Email ✅
- [ ] Test 3.5: Invalid Email Format ✅
- [ ] Test 3.6: Try Another Email ✅

### Reset Password Tests
- [ ] Test 4.1: Valid Reset ✅
- [ ] Test 4.2: Confirmation Email ✅
- [ ] Test 4.3: Login with New Password ✅
- [ ] Test 4.4: Expired Token ✅
- [ ] Test 4.5: Invalid Token ✅
- [ ] Test 4.6: Password Mismatch ✅
- [ ] Test 4.7: Short Password ✅

### Debug Tests
- [ ] Test D.1: Backend Console Logs ✅
- [ ] Test D.2: Email Service Logs ✅
- [ ] Test D.3: MongoDB Data ✅
- [ ] Test D.4: Browser localStorage ✅

---

**All tests should pass! If any fail, check the troubleshooting guide.**
