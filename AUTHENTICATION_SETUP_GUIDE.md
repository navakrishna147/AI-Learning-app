# Complete Authentication Setup & Troubleshooting Guide

## 🚀 Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
cd ai-learning-assistant/backend
npm install
```

### 2. Configure Email in `.env`
Edit `backend/.env` and add email configuration:

```env
# Gmail Configuration (Recommended)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:5173
```

### 3. Get Gmail App Password
1. Go to https://myaccount.google.com/apppasswords
2. Sign in with your Google account
3. Select "Mail" and "Windows Computer"
4. Google generates a 16-character password
5. Copy this password to `EMAIL_PASSWORD` in `.env`

### 4. Start Application
```bash
# Terminal 1: Backend
cd ai-learning-assistant/backend
npm run dev

# Terminal 2: Frontend  
cd ai-learning-assistant/frontend
npm run dev
```

### 5. Test Complete Flow

#### Test Signup:
1. Go to http://localhost:5173/signup
2. Enter: username, email, password, confirm password
3. Click "Sign up"
4. Should redirect to dashboard if successful

#### Test Login:
1. Go to http://localhost:5173/login
2. Enter your email and password
3. Click "Sign in"
4. Should redirect to dashboard if successful

#### Test Forgot Password:
1. Go to http://localhost:5173/login
2. Click "Forgot password?"
3. Enter your registered email
4. Check your email inbox for reset link
5. Click link to reset password
6. Enter new password and confirm
7. Should see success message

---

## 🔧 Troubleshooting

### Issue 1: Signup Not Working

**Symptom:** Error message when trying to sign up

**Solutions:**
- ✅ Check backend is running (`npm run dev` on port 5000)
- ✅ Verify MongoDB is running locally
- ✅ Check console for error messages
- ✅ Try different username/email (might already exist)

**Backend Checklist:**
```
MONGODB_URI=mongodb://localhost:27017/ai-learning-assistant
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

---

### Issue 2: Login Not Working

**Symptom:** "Invalid email or password" error, or login hangs

**Common Causes & Solutions:**

1. **User doesn't exist**
   - Verify you created account first via signup page
   - Check correct email is being used

2. **Wrong password**
   - Password is case-sensitive
   - Minimum 6 characters required
   - Try resetting via forgot password link

3. **Backend not running**
   - Start backend: `npm run dev` in backend folder
   - Should see: "✅ Server is running on port 5000"
   - Should see: "MongoDB Connected"

4. **Database connection failed**
   - Verify MongoDB is running
   - Check `MONGODB_URI` in .env
   - Default should be: `mongodb://localhost:27017/ai-learning-assistant`

**Test Login API:**
```bash
# In terminal/PowerShell:
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

### Issue 3: Forgot Password Email Not Sending

**Symptom:** No email received after clicking "Send Reset Link"

**Step 1: Check Backend Logs**
- Look at backend console output
- Should see:
  - `✅ Email configuration validated`
  - `🔌 Testing email transporter connection...`
  - `✅ Email transporter is ready`
  - `📬 Sending password reset email to: user@example.com`

**Step 2: Verify Email Configuration**

Check `.env` file has:
```env
EMAIL_USER=your-email@gmail.com        # Valid Gmail address
EMAIL_PASSWORD=your-app-password       # 16-character app password, NOT regular password
FRONTEND_URL=http://localhost:5173      # Must match your frontend URL
```

**Step 3: Test Email Configuration**

Add this test to backend temporarily:

1. Open `backend/controllers/authController.js`
2. Find the `forgotPassword` function
3. Check the console logs for:
   - ✅ "User found" message
   - ✅ "Email configuration validated"
   - ✅ "Testing email transporter connection"
   - ❌ Any error messages?

**Step 4: Gmail App Password**

If using Gmail:
1. Go to https://myaccount.google.com/apppasswords
2. Make sure you selected "Mail" and "Windows Computer"
3. Copy the EXACT 16-character password (no spaces, no dashes)
4. Paste to `EMAIL_PASSWORD` in .env
5. Restart backend: `npm run dev`

**Step 5: Check Spam/Junk Folder**

Gmail sometimes filters emails. Check:
- Inbox (look for subject: "🔐 Password Reset Request")
- Spam/Junk folder
- Other/All folder

**Step 6: Verify Frontend URL**

Make sure `FRONTEND_URL` in `.env` matches your setup:
- Local development: `http://localhost:5173`
- Production: `https://yourdomain.com`

**Step 7: Test Email Service Directly**

Create a test endpoint (temporary):

```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@gmail.com"}'
```

Should get response:
```json
{
  "success": true,
  "message": "Password reset email has been sent to your email address..."
}
```

---

### Issue 4: Reset Password Link Not Working

**Symptom:** "Invalid or expired reset token" when clicking email link

**Solutions:**

1. **Token Expired**
   - Token valid for 30 minutes only
   - Request new password reset
   - Click link within 30 minutes

2. **Link Modified**
   - Don't modify the token in URL
   - Copy full link exactly as provided in email

3. **Database Issue**
   - Verify MongoDB is running
   - Check backend logs for errors
   - Restart backend and try again

4. **Frontend URL Mismatch**
   - If `FRONTEND_URL=http://localhost:5173` in .env
   - But you're accessing on different port/URL
   - Link will be invalid
   - Fix `.env` to match your actual frontend URL

---

### Issue 5: Email Configuration Errors

**Common Error Messages & Fixes:**

| Error Message | Cause | Fix |
|---|---|---|
| `EMAIL_USER is not configured` | Missing EMAIL_USER in .env | Add valid Gmail address to .env |
| `EMAIL_PASSWORD is not configured` | Missing EMAIL_PASSWORD in .env | Add 16-char app password to .env |
| `Invalid credentials` | Wrong password or email | Use App Password from Google (not regular password) |
| `ECONNREFUSED` | SMTP server unreachable | Check EMAIL_USER is correct Gmail |
| `Error: connect ECONNREFUSED` | Gmail SMTP connection failed | Verify Gmail account and app password |

---

## 📊 Database Schema Verification

### User Model Fields

Verify these fields exist in MongoDB:

```javascript
{
  username: String,           // Required
  email: String,              // Required, unique
  password: String,           // Hashed
  role: String,               // "student", "instructor", "admin"
  resetPasswordToken: String, // Temporary token
  resetPasswordExpire: Date,  // 30 minutes from creation
  lastLogin: Date,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Test Database:

Start MongoDB and verify:

```bash
# In terminal, connect to MongoDB:
mongosh

# List databases:
show databases

# Use database:
use ai-learning-assistant

# Check users collection:
db.users.find()

# Check if user exists:
db.users.findOne({ email: "your-email@gmail.com" })
```

---

## 🔐 Security Checklist

Before production deployment:

- [ ] Change `JWT_SECRET` to random strong value
- [ ] Use secure SMTP credentials
- [ ] Enable HTTPS/TLS
- [ ] Set `FRONTEND_URL` to production domain
- [ ] Verify email templates are branded
- [ ] Test password reset tokens expire
- [ ] Test tokens can't be reused
- [ ] Monitor failed login attempts
- [ ] Set rate limiting on auth endpoints

---

## 📝 API Endpoints Reference

### Authentication Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/signup` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login user |
| POST | `/api/auth/logout` | Private | Logout user |
| GET | `/api/auth/profile` | Private | Get user profile |
| PUT | `/api/auth/profile` | Private | Update profile |
| POST | `/api/auth/forgot-password` | Public | Request password reset |
| GET | `/api/auth/reset-password/:token` | Public | Validate reset token |
| POST | `/api/auth/reset-password/:token` | Public | Reset password |

### Example Requests

**Signup:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Forgot Password:**
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com"}'
```

---

## 🛠️ Development Tips

### Enable Debug Logging

Edit `backend/services/emailService.js` - logging is already included:
- 📧 Email configuration validation
- 🔌 SMTP connection testing
- 📬 Email sending status
- ✅ Success confirmations
- ❌ Error details

### Test Email Without Sending

Temporarily return token in response for testing:

In `emailService.js`:
```javascript
if (!process.env.EMAIL_USER) {
  return { success: true, token: resetToken };
}
```

Then you can manually test the reset link.

### View Sent Emails

Gmail tip: Check "Sent" folder to verify email sending is working.

---

## 🎯 Common Workflows

### Complete User Journey

```
1. User visits /signup
   ↓
2. New password created (hashed via bcryptjs)
   ↓
3. User redirected to /login
   ↓
4. User enters credentials
   ↓
5. JWT token generated
   ↓
6. Token stored in localStorage
   ↓
7. User redirected to /dashboard
   ↓
8. API calls include Authorization: Bearer {token}
```

### Forgot Password Journey

```
1. User clicks "Forgot password?" on login
   ↓
2. Redirected to /forgot-password
   ↓
3. User enters email
   ↓
4. Backend generates reset token (valid 30 min)
   ↓
5. Email sent with reset link
   ↓
6. User clicks email link
   ↓
7. Frontend validates token with /reset-password/token
   ↓
8. User sees password reset form
   ↓
9. User enters new password
   ↓
10. Password updated and token invalidated
   ↓
11. User redirected to login
   ↓
12. User logs in with new password
```

---

## 📞 Support

### When Something Breaks

1. **Check the logs:**
   - Backend console (npm run dev output)
   - Browser console (F12 → Console)
   - Network tab (F12 → Network) to see API responses

2. **Common fixes:**
   - Restart backend: `npm run dev`
   - Clear browser cache: Ctrl+Shift+Delete
   - Clear localStorage: DevTools → Application → localStorage
   - Restart MongoDB

3. **Contact Information:**
   - Check backend console for detailed error messages
   - Look for 🔴 error markers in logs
   - Review .env configuration

---

## ✅ Verification Checklist

Use this checklist to verify everything works:

- [ ] Backend starts without errors
- [ ] MongoDB connects successfully
- [ ] Frontend loads without errors
- [ ] Signup creates new user
- [ ] Login with new user works
- [ ] Cookies/tokens are stored
- [ ] Logout clears storage
- [ ] Forgot password shows form
- [ ] Email configuration validated
- [ ] Reset link received in email
- [ ] Reset password link works
- [ ] New password works for login
- [ ] Expired token shows error
- [ ] Profile page loads user data
- [ ] Password change requires current password

---

**Setup Complete! 🎉**

Everything should be working now. If you encounter any issues, check the troubleshooting section above.
