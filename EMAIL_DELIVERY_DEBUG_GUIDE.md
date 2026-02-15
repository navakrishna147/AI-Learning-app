# 📧 Email Delivery Debug Guide

## Problem
- Frontend shows: "We've sent a password reset link to your email"
- Backend shows: No errors
- Reality: **Email NOT received in inbox**

---

## 🧪 Step 1: Test Email Delivery

### Run Test Email Endpoint

**URL:** `http://localhost:5000/api/auth/test-email?email=your-email@gmail.com`

**In Browser:**
```
http://localhost:5000/api/auth/test-email?email=your-email@gmail.com
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Test email sent successfully",
  "data": {
    "messageId": "<abc123@gmail.com>",
    "to": "your-email@gmail.com",
    "from": "your-email@gmail.com",
    "timestamp": "2026-02-14T12:00:00.000Z"
  }
}
```

### Check Backend Console

You should see detailed logs:

```
════════════════════════════════════════════════════════════════════════
🧪 TEST EMAIL ENDPOINT CALLED
════════════════════════════════════════════════════════════════════════
Test Email: your-email@gmail.com
Timestamp: 2026-02-14T12:00:00.000Z

🔌 Testing transporter connection...
✅ Transporter verified

📧 Sending test email...
✅ TEST EMAIL SENT
   Message ID: <abc123@gmail.com>
   To: your-email@gmail.com
════════════════════════════════════════════════════════════════════════
```

---

## ✅ If Test Email Works

**Good news!** Email delivery is working.

**Check these:**

1. **Gmail Inbox:**
   - Look in main inbox
   - Check "Promotions" tab
   - Check "Social" tab

2. **Gmail Spam Folder:**
   - Check spam/junk folder
   - If found there, mark as "Not Spam"

3. **Email Filters:**
   - Check Gmail filters (Settings → Filters and Blocked Addresses)
   - Your backend might be sending emails to trash automatically

4. **Gmail Security:**
   - Go to: https://myaccount.google.com/security
   - Check "Recent security events" for blocked login attempts
   - Check "Connected apps & sites"

5. **Try Real Forgot Password:**
   - Go to http://localhost:5174
   - Click "Forgot Password"
   - Enter: your-email@gmail.com
   - Watch backend console for logs
   - Check Gmail inbox

---

## ❌ If Test Email FAILS

### Error: "Email configuration missing"

**Fix:**
```bash
# Check your .env file
cat backend/.env | grep EMAIL

# Should show:
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASSWORD=abcdefghijklmnop
```

If missing, update and restart:
```bash
npm run dev
```

---

### Error: "Authentication failed (535)"

**Root Cause:** Email credentials are wrong

**Check:**

1. **Is EMAIL_PASSWORD really 16 characters?**
   ```bash
   echo "abcdefghijklmnop" | wc -c
   # Should output: 17 (16 chars + newline)
   ```

2. **Does it have spaces?**
   ```bash
   # Wrong: abcd efgh ijkl mnop (with spaces)
   # Right: abcdefghijklmnop (no spaces)
   ```

3. **Is it Gmail App Password (not regular password)?**
   - Regular Gmail password won't work
   - Must use 16-character App Password from:
     https://myaccount.google.com/apppasswords

4. **Is 2FA enabled?**
   - Go to: https://myaccount.google.com/security
   - Check "2-Step Verification" is ON
   - App Password only works with 2FA

**Fix:**
1. Generate new App Password:
   ```
   https://myaccount.google.com/apppasswords
   Select: Mail → Windows Computer
   Copy 16 chars: abcdefghijklmnop (no spaces)
   ```

2. Update .env:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=abcdefghijklmnop
   ```

3. Restart backend:
   ```bash
   npm run dev
   ```

4. Test again:
   ```
   http://localhost:5000/api/auth/test-email?email=your-email@gmail.com
   ```

---

### Error: "SMTP connection timeout"

**Root Cause:** Gmail server not responding

**Fix:**
1. Check internet connection
2. Try again in a few seconds
3. Gmail might be temporarily blocking your region

---

## 📊 Understanding the Email Logs

When you test email, you'll see detailed logs in backend console:

### ✅ SUCCESS LOGS

```
════════════════════════════════════════════════════════════════════════
📧 PASSWORD RESET EMAIL REQUEST
════════════════════════════════════════════════════════════════════════
Request ID: EMAIL_1707902400000
Timestamp: 2026-02-14T12:00:00.000Z
Recipient: your-email@gmail.com
Sender: your-email@gmail.com
Frontend URL: http://localhost:5173

🔌 Testing email transporter connection...
✅ Email transporter connection verified successfully
   SMTP Host: smtp.gmail.com
   Port: 587
   Auth: Gmail App Password

📬 Sending password reset email...
   To: your-email@gmail.com
   From: your-email@gmail.com
   Subject: 🔐 Password Reset Request - AI Learning Assistant

✅ PASSWORD RESET EMAIL SENT SUCCESSFULLY
════════════════════════════════════════════════════════════════════════
Request ID: EMAIL_1707902400000
Message ID: <abc123@mail.gmail.com>
To: your-email@gmail.com
From: your-email@gmail.com
Timestamp: 2026-02-14T12:00:00.000Z

📧 EMAIL DETAILS:
   Response Code: 250 2.0.0 OK
   Accepted: ["your-email@gmail.com"]
   Rejected: []
   Pending: []

💡 NEXT STEPS:
   1. Check your inbox at your-email@gmail.com
   2. Check spam/junk folder
   3. Wait 1-2 minutes for delivery
   4. If not received, check error messages above
════════════════════════════════════════════════════════════════════════
```

**What this means:**
- ✅ SMTP connection successful
- ✅ Email sent to Gmail server (accepted: 1)
- ✅ No rejections
- ✅ Message ID issued (proof it was sent)

**Next:** Check Gmail inbox

---

### ❌ FAILURE LOGS

```
════════════════════════════════════════════════════════════════════════
❌ FAILED TO SEND PASSWORD RESET EMAIL
════════════════════════════════════════════════════════════════════════
Request ID: EMAIL_1707902400000
Timestamp: 2026-02-14T12:00:00.000Z
Recipient: your-email@gmail.com
Error Code: EAUTH
Error Message: Invalid login: 535-5.7.8 Username and password not accepted
Error Details: { code: 'EAUTH', command: 'AUTH LOGIN' }
════════════════════════════════════════════════════════════════════════
```

**What this means:**
- ❌ Gmail rejected credentials
- ❌ EMAIL_USER or EMAIL_PASSWORD is wrong
- ❌ Email was NOT sent

**Fix:** Update credentials and restart

---

## 🔍 Common Scenarios

### Scenario 1: Email Sent But Not Received (Most Common)

**Possible Causes:**
1. Email going to spam folder
2. Gmail filters routing to trash
3. Wrong recipient email
4. Network latency (wait 1-2 minutes)

**Debug Steps:**
```
1. Check Gmail Spam folder
2. Check Gmail Filters (Settings → Filters)
3. Check Gmail blocked addresses
4. Try with different email address
5. Check Gmail security alerts
```

### Scenario 2: "Email configuration invalid" Error

**Cause:** EMAIL_USER or EMAIL_PASSWORD in .env are missing or wrong

**Fix:**
```bash
# Check .env file
cat backend/.env | grep EMAIL

# Should see:
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop

# If not, update and restart:
npm run dev
```

### Scenario 3: SMTP Connection Fails

**Cause:** Gmail blocked the connection OR credentials are wrong

**Check:**
1. Go to: https://myaccount.google.com/security
2. Check "Recent security events"
3. If you see "blocked login attempt", click it and select "Yes, that was me"
4. Restart backend
5. Test again

### Scenario 4: Test Email Works But Forgot Password Doesn't

**Cause:** Frontend URL wrong OR email address typo

**Check:**
1. Is FRONTEND_URL correct in .env?
   - Should be: `http://localhost:5173`
2. Did user enter correct email in forgot password form?
3. Check backend logs for the exact recipient address

---

## 🛠️ Advanced Debugging

### Check Email Logs from Terminal

```bash
# Navigate to backend directory
cd backend

# Run test email
node -e "
const axios = require('axios');
axios.get('http://localhost:5000/api/auth/test-email?email=test@example.com')
  .then(r => console.log(JSON.stringify(r.data, null, 2)))
  .catch(e => console.error(e.message))
"
```

### Check Gmail SMTP Directly

```bash
# Test SMTP connection
telnet smtp.gmail.com 587

# If connection works, type:
EHLO example.com
QUIT
```

### View Email Configuration in Code

File: `backend/services/emailService.js`

Key functions:
- `validateEmailConfig()` - Checks email settings (lines 48-124)
- `createTransporter()` - Creates Gmail connection (lines 6-45)
- `sendPasswordResetEmail()` - Sends reset email with detailed logs (lines 130+)

---

## ✅ Checklist for Email Delivery

- [ ] .env file has EMAIL_USER and EMAIL_PASSWORD
- [ ] EMAIL_PASSWORD is 16 characters, no spaces
- [ ] Gmail 2FA is enabled at https://myaccount.google.com/security
- [ ] App Password generated from https://myaccount.google.com/apppasswords
- [ ] Backend restarted after updating .env
- [ ] Test endpoint returns success at http://localhost:5000/api/auth/test-email
- [ ] Test email received in Gmail inbox (check spam too)
- [ ] Gmail security didn't block login attempt
- [ ] Frontend URL is correct (http://localhost:5173)
- [ ] Password reset feature works end-to-end

---

## 📞 Still Having Issues?

**Check in this order:**

1. **Backend logs** - Most info is there
   - Look for "🧪 TEST EMAIL ENDPOINT CALLED"
   - Look for "✅ PASSWORD RESET EMAIL SENT" or "❌ FAILED"

2. **Gmail inbox & spam folder** - Is email there?

3. **.env file** - Are credentials correct?
   ```bash
   cat backend/.env | grep EMAIL
   ```

4. **Gmail security** - Did Gmail block login?
   - https://myaccount.google.com/security
   - Check "Recent security events"

5. **Gmail App Password** - Is it valid?
   - Re-generate from https://myaccount.google.com/apppasswords
   - Copy 16 chars without spaces

6. **Restart everything:**
   ```bash
   # Kill backend
   Ctrl+C
   
   # Update .env if needed
   
   # Restart
   npm run dev
   
   # Test
   http://localhost:5000/api/auth/test-email?email=your@email.com
   ```

---

## 🚀 Once Email Is Working

The forgot password feature is now fully functional:

1. User clicks "Forgot Password"
2. Enters email: your-email@gmail.com
3. Backend sends reset email
4. User receives email in inbox
5. User clicks reset link
6. User sets new password
7. User logs in with new password

**All working! ✅**
