# 🔐 Forgot Password - Quick Reference

## ⚡ 5-Minute Setup

```
1. Go to: https://myaccount.google.com/apppasswords
2. Select: Mail + Windows Computer
3. Copy: 16-char password (remove spaces)
4. Edit backend/.env:
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASSWORD=abcdefghijklmnop
5. Restart backend: npm run dev
✅ Done!
```

---

## 🔍 Verification Checklist

- [ ] Gmail 2FA enabled (https://myaccount.google.com/security)
- [ ] App Password generated (16 characters, no spaces)
- [ ] EMAIL_USER set correctly in .env
- [ ] EMAIL_PASSWORD set correctly in .env (16 chars, no spaces)
- [ ] Backend restarted
- [ ] Console shows: ✅ Email configuration validated
- [ ] Console shows: ✅ Email transporter connection verified

---

## 📋 API Endpoints

```bash
# 1. Request password reset
POST /api/auth/forgot-password
Body: { "email": "user@example.com" }
Response: { success: true, message: "...", email: "..." }

# 2. Validate reset token
GET /api/auth/reset-password/:token
Response: { success: true, message: "Token is valid", email: "..." }

# 3. Reset password
POST /api/auth/reset-password/:token
Body: { "password": "newPass", "confirmPassword": "newPass" }
Response: { success: true, message: "Password reset successfully" }
```

---

## 🚨 Fix Error 535

**Error:** "Invalid login: 535-5.7.8 Username and Password not accepted"

**Causes:**
1. ❌ Using regular Gmail password (not App Password)
2. ❌ App Password has 15 chars instead of 16
3. ❌ App Password still has spaces in it
4. ❌ 2FA not enabled

**Solution:**
```bash
1. Enable 2FA: https://myaccount.google.com/security
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Select: Mail + Windows Computer
4. Copy EXACTLY: 16 characters, NO spaces
5. Paste in .env: EMAIL_PASSWORD=abcdefghijklmnop
6. Restart: npm run dev
7. Check console for ✅ confirmation
```

---

## 📧 Backend Console Output

### ✅ When Working:
```
✅ Email configuration validated
   📧 Email: your-gmail@gmail.com
   🔑 App Password length: 16 characters
🔌 Testing email transporter connection...
✅ Email transporter connection verified successfully
📬 Sending password reset email to: user@example.com
✅ Password reset email sent successfully
📧 Message ID: <id@gmail.com>
```

### ❌ When Error 535:
```
❌ GMAIL AUTHENTICATION FAILED (Error 535)
   Possible causes:
   1. Using regular Gmail password instead of App Password
   2. App Password is incorrect or incomplete
   3. 2-Factor Authentication not enabled on Gmail account
```

---

## 🧪 Test Flow

```
1. Open frontend → http://localhost:5174
2. Click "Forgot Password"
3. Enter email → "Send Reset Link"
4. Check Gmail inbox (or spam folder)
5. Click reset link in email
6. Enter new password → "Reset Password"
7. Login with new password ✅
```

---

## 📝 .env Template

```bash
# Gmail SMTP Settings
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
FRONTEND_URL=http://localhost:5173
```

⚠️ **PASSWORD MUST BE:**
- Exactly 16 characters
- From Gmail App Passwords
- NO spaces in the middle
- NOT your regular Gmail password

---

## 🔗 Important Links

| Task | Link |
|------|------|
| Enable 2FA | https://myaccount.google.com/security |
| Generate App Password | https://myaccount.google.com/apppasswords |
| Full Setup Guide | See GMAIL_SETUP_GUIDE.md |
| Implementation Guide | See FORGOT_PASSWORD_IMPLEMENTATION_GUIDE.md |

---

## 🔐 Features Included

✅ Random token generation (crypto.randomBytes)  
✅ Token hashing (SHA256)  
✅ 30-minute expiration  
✅ BCrypt password hashing  
✅ Email validation  
✅ Token validation  
✅ Confirmation email  
✅ Error handling  
✅ Production-ready security  

---

## 🚀 Deploy to Production

1. Set EMAIL_USER in production environment
2. Set EMAIL_PASSWORD (App Password) safely
3. Update FRONTEND_URL to production domain
4. Ensure HTTPS on login/reset pages
5. Test password reset flow
6. Monitor email delivery

---

**Quick Help:** Check backend console for detailed error messages  
**Docs:** See GMAIL_SETUP_GUIDE.md for complete instructions
