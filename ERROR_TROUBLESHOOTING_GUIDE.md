# 🆘 ERROR TROUBLESHOOTING GUIDE - Non-Technical Version

## For Course Administrators & Users

---

## ❌ Error 1: "API Credits Exhausted"

### What This Means
The AI chatting feature is using an external service (Anthropic Claude AI). Like paying for electricity, you need to "buy credits" to use this service. Credits are used up when students use the Chat feature to ask questions about documents.

### Why This Happens
- ✗ Starting API credits have been used up
- ✗ Many students have been using the Chat feature
- ✗ No new credits purchased to replenish

### How to Fix It (For Administrators Only)

**Step 1: Go to the API Dashboard**
- Visit: https://console.anthropic.com/account/billing/overview
- Sign in with your Anthropic account (that created the API key)

**Step 2: Purchase More Credits**
- Click: "Purchase Credits" (or "Add Payment Method")
- Select amount: Start with $5, but recommend $20+ for regular use
- Complete payment with credit card

**Step 3: Get New API Key** (if needed)
- Go to: https://console.anthropic.com/account/keys
- Copy your API key
- Paste in: `backend/.env` file (ANTHROPIC_API_KEY=...)

**Step 4: Restart the Application**
- Stop the backend server (Ctrl+C)
- Start again: `npm start`
- Wait 30 seconds for server to start

**Step 5: Test**
- Have a student try using Chat
- If it works → ✅ Problem solved!

### What Students Will See
**Before Fix:**
```
❌ Error
API Credits Exhausted: The AI learning service is temporarily unavailable. 
Please contact your course administrator. Reason: AI Service Temporarily 
Unavailable - The AI learning assistant is currently unavailable due to 
insufficient API credits.
```

**After Fix:**
```
✅ Chat works normally
Questions are answered by AI
```

### Cost Estimation
- **$5 credits** = ~50-100 student questions (rough estimate)
- **$20 credits** = ~200-400 student questions
- **$100 credits** = Full semester for small class (~50 students)

### How to Avoid This in Future
- Set up **monthly budget alerts** on Anthropic dashboard
- **Check usage** every 2 weeks
- **Purchase credits** 1-2 weeks before they run out (doesn't hurt to have extra)

---

## ❌ Error 2: "Invalid email or password"

### What This Means
Either:
- Email or username was typed wrong
- Password was typed wrong
- Account doesn't exist

### Why This Happens
- ✗ User enters wrong email/username
- ✗ User enters wrong password
- ✗ User typed in CAPS LOCK
- ✗ User account hasn't been created yet (need to sign up first)
- ✗ Extra spaces in email

### How to Fix It (For Users)

**Check 1: Is CAPS LOCK ON?**
- Look at keyboard for CAPS LOCK light
- If ON, turn it OFF and try again

**Check 2: Did You Copy-Paste Correctly?**
- Clear the email/password fields
- Type slowly and carefully (or copy-paste from a note)
- Check for spaces at the beginning or end

**Check 3: Did You Create an Account Yet?**
- Password only works if you already signed up
- Never created account? → Click "Sign up" button
- Forgot password? → Click "Forgot Password" link

**Check 4: Alternative Login Methods**
- Try with **email** instead of username
- Try with **username** instead of email
- One of these MUST work if account was created correctly

**Check 5: Still Not Working?**
- Take a screenshot of the error
- Forward to administrator or IT support
- Provide: email used, whether account was created, approximate date created

---

## ❌ Error 3: "Database error: Unable to..."

### What This Means
The application cannot "talk" to MongoDB (the database where student data is stored).

### Why This Happens
- ✗ MongoDB service is not running
- ✗ Connection string in configuration is wrong
- ✗ MongoDB server is down
- ✗ Network connection is broken

### How to Fix It (For Administrators)

**For Windows Users:**

**Check 1: Is MongoDB Running?**
```
1. Open: Control Panel → Services
2. Look for: "MongoDB" or "mongod"
3. If Status = "Running" ✅ → Go to Check 2
4. If Status = "Stopped" ✗ → Right-click → Start
5. Wait 30 seconds
6. Restart Node.js backend server
```

**Check 2: MongoDB Atlas Connection**
If using MongoDB Atlas (cloud version):
```
1. Visit: https://cloud.mongodb.com/
2. Sign in
3. Check: Cluster status (should be "Available")
4. If status = "Paused" → Click "Resume"
5. Wait for cluster to start (5-10 minutes)
6. Restart Node.js backend server
```

**For Linux/Mac Users:**
```bash
# Start MongoDB
sudo systemctl start mongodb

# Or for Mac:
brew services start mongodb-community
```

---

## ❌ Error 4: "Email already registered"

### What This Means
Someone already created an account with this email address.

### Why This Happens
- ✗ You created an account before and forgot
- ✗ A friend/colleague created account with your email
- ✗ Email is a shared email (classroom, office)

### How to Fix It (For Users)

**Option 1: Use Different Email**
- Create account with a different email address
- Example: If email@example.com is taken, try email.lastname@example.com

**Option 2: Reset Your Password**
- Click: "Forgot Password"
- Enter: Your email
- Check: Your email inbox (or spam folder!)
- Click: The reset link in email
- Set: A new password
- Try: Login with new password

**Option 3: Contact Administrator**
- If unsure which account is yours
- Admin can help verify
- Admin can reset password for you

---

## ❌ Error 5: "Username already taken"

### What This Means
Someone already chose that username.

### Why This Happens
- ✗ You created account with this username before
- ✗ Another student chose the same username
- ✗ Usernames must be unique

### How to Fix It (For Users)

**Solution: Choose Different Username**
- Clear the username field
- Add a number at the end (username123)
- Add your year (username2024)
- Use first+last (johnsmith)
- Use initials (jsmith123)
- Try anything unique!

**Example:**
- ✗ Username: "john" (already taken)
- ✓ Username: "john_smith" (available!)
- ✓ Username: "john123" (available!)

---

## ❌ Error 6: "Unable to connect to server"

### What This Means
Frontend website cannot "talk" to backend server. Frontend received no response.

### Why This Happens
- ✗ Backend server is not running
- ✗ Backend server crashed
- ✗ Wrong port/URL in configuration
- ✗ Firewall is blocking connection
- ✗ Internet connection is down

### How to Fix It (For Administrators)

**Step 1: Check Backend Server**
```powershell
# Windows: Check if node.js is running
Get-Process | findstr node

# If nothing shows up → Server is not running
# To start:
cd "path/to/backend"
npm start

# Wait for message: "✅ SERVER STARTED SUCCESSFULLY"
```

**Step 2: Check Port 5000**
```powershell
# Check if something is using port 5000
netstat -ano | findstr :5000

# If shows "LISTENING" → Server is running on correct port ✅
# If empty → Server is not running on port 5000
```

**Step 3: Check Firewall**
```
Windows:
1. Settings → Firewall & Network Protection
2. Click: "Allow an app through firewall"
3. Look for: node.js
4. Check: both "Private" and "Public" boxes
5. Click: OK
```

**Step 4: Check Backend Terminal Output**
```
Look for these messages:

✅ "SERVER STARTED SUCCESSFULLY" (good)
❌ "Error: listen EADDRINUSE" (port 5000 is busy)
❌ "Error: Cannot find module" (missing dependency - run npm install)
❌ "MongoDB connection failed" (database issue)
```

---

## ❅ Preventive Maintenance

### Weekly Checks
- [ ] API credits usage (check Anthropic dashboard)
- [ ] MongoDB connection status
- [ ] Server logs for errors
- [ ] Student feedback about issues

### Monthly Checks
- [ ] Update npm packages (`npm update`)
- [ ] Check server uptime
- [ ] Review storage space
- [ ] Test all features (signup, login, chat, flashcards, quizzes)

### Quarterly Checks
- [ ] Security updates (`npm audit fix`)
- [ ] Database backup
- [ ] Server performance analysis
- [ ] Student usage statistics

---

## 📞 Quick Reference Card

| Error | Quick Fix | Who Should Fix |
|-------|-----------|---|
| API Credits Exhausted | Buy more credits on Anthropic | Administrator |
| Invalid email/password | Check spelling, CAPS LOCK | User |
| Database error | Start MongoDB service | Administrator |
| Email already registered | Use different email or reset password | User |
| Username taken | Choose different username | User |
| Cannot connect to server | Start backend server | Administrator |

---

## 🆘 When to Contact Support

**Contact IT/Developer if:**
- Error repeats after trying all fixes
- Multiple students reporting same error
- Error message is different from this guide
- Database corruption suspected
- Server keeps crashing
- Memory usage very high
- Strange security issues

**Provide Them With:**
- Full error message (screenshot)
- When error started happening
- How many students affected
- Any recent changes made
- Recent hardware/software updates

---

## ✅ Checklist Before Going Live

### Before First Day of Class
- [ ] Create login accounts for all students
- [ ] Test login/signup yourself
- [ ] Test Chat feature
- [ ] Create sample documents
- [ ] Test flashcards generation
- [ ] Test quiz creation
- [ ] Check API credits (should have $20+)
- [ ] Brief IT staff on basic troubleshooting
- [ ] Create help document for students

### Daily During Class
- [ ] Monitor for errors  
- [ ] Check student issues
- [ ] Monitor API credit usage
- [ ] Check server uptime

### End of Week
- [ ] Review any errors that occurred
- [ ] Review API usage/costs
- [ ] Plan next week's credit budget

---

## 📖 For Visual Learners

### Signup Flow (Correct)
```
1. Click "Sign up"
   ↓
2. Enter email, username, password
   ↓
3. Click "Create Account"
   ↓
✅ Account created!
   ↓
4. Automatically logged in
   ↓
5. Redirect to dashboard
```

### Signup Flow (Error - Duplicate Email)
```
1. Click "Sign up"
   ↓
2. Enter email (already used):
   email@example.com ← ALREADY EXISTS ✗
   ↓
3. Click "Create Account"
   ↓
❌ Error: "Email already registered"
   ↓
4. Try different email:
   email2@example.com ← NEW ✅
   ↓
5. Click "Create Account"
   ↓
✅ Account created!
```

### Chat Flow (API Credits Working)
```
1. Click Chat tab
   ↓
2. Type question
   ↓
3. Press "Send"
   ↓
4. (Loading...)
   ↓
✅ AI response appears!
```

### Chat Flow (API Credits Exhausted)
```
1. Click Chat tab
   ↓
2. Type question
   ↓
3. Press "Send"
   ↓
4. (Loading...)
   ↓
❌ Error: "API Credits Exhausted"
   ↓
SOLUTION:
→ Contact administrator
→ Request credit purchase
→ Try again after credits added
```

---

## 💡 Pro Tips

### For Administrators
- Set phone reminder for monthly credit check
- Keep digital copy of Anthropic dashboard access
- Document common errors in staff handbook
- Create video tutorial for students

### For Users
- Save your password in browser (if secure)
- Write down email used (in case you forget)
- Check email spam folder if password reset doesn't come through
- Close browser if errors persist (clear cache)

---

## ✨ Success Indicator

✅ **You'll know everything is working when:**
- Signup takes < 5 seconds
- Login takes < 3 seconds
- Chat question answered < 10 seconds
- No red error messages
- Dashboard loads smoothly

---

**Last Updated**: February 11, 2026

For technical details, see: `COMPLETE_FIX_GUIDE.md`

