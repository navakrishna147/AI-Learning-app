# 📧 Gmail App Password Setup Guide

## Overview

The "Forgot Password" feature requires a Gmail account with **App Password** authentication. This guide walks you through the complete setup process in **5 minutes**.

## What You Need

- ✅ A Gmail account (personal or workspace)
- ✅ Access to https://myaccount.google.com
- ✅ Your backend `.env` file open for editing
- ⏱️ About 5 minutes

## ⚠️ Important Points

**Do NOT use your regular Gmail password** - Gmail blocks this for security reasons.

**You MUST use a Gmail App Password** - A special 16-character password generated for this application.

---

## Step-by-Step Setup

### Step 1: Enable 2-Factor Authentication

Gmail requires 2-Factor Authentication (2FA) before you can create App Passwords.

1. **Open Gmail Security Settings:**
   - Go to: https://myaccount.google.com/security
   - Sign in if prompted

2. **Find and Enable 2-Step Verification:**
   - Scroll down to find "**2-Step Verification**"
   - Click on it
   - Click the blue "**Get Started**" button

3. **Choose Your Verification Method:**
   - Google will ask how to verify it's you
   - Choose your preferred method (phone number, authenticator, etc.)
   - Follow the prompts

4. **Wait for Changes to Take Effect:**
   - ⏳ **Important:** Wait **5-10 minutes** after enabling 2FA
   - This gives Google's systems time to process the change

---

### Step 2: Generate Gmail App Password

Once 2FA is enabled, you can create an App Password.

1. **Open App Passwords Page:**
   - Go to: https://myaccount.google.com/apppasswords
   - Sign in if prompted
   - You may need to verify with your 2FA method again

2. **Select "Mail" Application:**
   - **First dropdown:** Select "**Mail**"
   - **Second dropdown:** Select "**Windows Computer**" (or your device type)

   Screenshot example:
   ```
   Select app:          [Mail ▼]
   Select device:       [Windows Computer ▼]
                        [Generate] ← Click this
   ```

3. **Generate and Copy Password:**
   - Click the blue "**Generate**" button
   - Google shows a popup with your App Password
   - Example: `abcd efgh ijkl mnop` (shown with spaces for readability)

4. **Copy the Password WITHOUT Spaces:**
   - Remove all spaces from the displayed password
   - Example: `abcd efgh ijkl mnop` → `abcdefghijklmnop`
   - The final password is **exactly 16 characters**
   - Copy this to your clipboard

---

### Step 3: Update Your Backend `.env` File

Now you'll add the Gmail credentials to your `.env` file.

1. **Open your `.env` file:**
   - Location: `backend/.env`
   - Open with any text editor (VS Code, Notepad, etc.)

2. **Find these lines:**
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=0000000000000000
   ```

3. **Replace with your values:**
   ```env
   EMAIL_USER=your-actual-email@gmail.com
   EMAIL_PASSWORD=abcdefghijklmnop
   ```

   Example:
   ```env
   EMAIL_USER=john.doe@gmail.com
   EMAIL_PASSWORD=zyxwvutsrqponfed
   ```

4. **Save the file:**
   - Use Ctrl+S or File → Save
   - Make sure the file is saved successfully

---

### Step 4: Verify Configuration (Optional but Recommended)

Test your setup before testing the app.

1. **Run the Email Configuration Test:**
   ```bash
   # In the backend directory
   node test-email-config.js
   ```

2. **What to expect:**
   - ✅ **Success:** "All tests passed!" and you receive a test email
   - ❌ **Failure:** Clear error message explaining what's wrong

3. **Restart your backend:**
   ```bash
   npm run dev
   ```

---

## ✅ Testing the Forgot Password Feature

Once configured, test the complete flow:

1. **Go to the login page:**
   - Navigate to your app (usually http://localhost:5174)

2. **Click "Forgot Password?"**
   - Enter any registered email address
   - Click "Send Reset Link"

3. **Check success message:**
   - You should see: "Password reset email has been sent to your email address"

4. **Check your inbox:**
   - Look for email from: `your-email@gmail.com` (or whatever you configured)
   - Subject: "🔐 Password Reset Request - AI Learning Assistant"
   - Click the reset password link inside

---

## ❌ Troubleshooting

### Error 535: Authentication Failed

**Problem:** You see an error like "SMTP Error 535: Authentication failed"

**Causes:**
- ❌ Using regular Gmail password instead of App Password
- ❌ App Password has extra spaces
- ❌ 2FA not actually enabled
- ❌ Copied the password incorrectly

**Fix:**
1. Verify you generated an **App Password** (not using regular password)
2. Count the characters: must be **exactly 16 characters**
3. Remove ALL spaces: `abcd efgh ijkl mnop` → `abcdefghijklmnop`
4. Make sure 2FA is actually enabled: https://myaccount.google.com/security
5. Generate a **new** App Password and try again

### Error: "Failed to send reset email"

**Problem:** Email configuration error message in the app

**Causes:**
- `.env` file not saved after editing
- Backend not restarted after changing `.env`
- Wrong email/password values
- Internet connection issues

**Fix:**
1. Stop the backend (Ctrl+C)
2. Verify `.env` file is saved
3. Verify values are correct
4. Run: `node test-email-config.js`
5. Restart backend: `npm run dev`

### Test Script Shows Errors

**Problem:** Running `node test-email-config.js` shows errors

**Solution:** Follow the error message:
- **Error 535:** Check your App Password (length, spaces, correctness)
- **Timeout:** Check internet connection
- **Authentication failed:** Regenerate App Password at https://myaccount.google.com/apppasswords

### Email Not Received

**Causes:**
- Email went to spam/junk folder
- Gmail's strict security blocked the email
- Link expired (valid for 30 minutes only)

**Fix:**
1. Check spam/junk folder
2. Test sending from your configured email to yourself
3. If link expired, request a new one

---

## ℹ️ Important Information

### Security Notes

- ✅ **Safe:** App Passwords are safe to commit to backend `.env`
- ✅ **Best:** Still keep them out of version control when possible
- ⚠️ **Secure:** These passwords only work for Gmail SMTP, not full account access
- 🔐 **Recommended:** Change regularly in production environments

### Production Deployment

For production servers, consider:

1. **Use Environment Variables:**
   ```bash
   # Instead of .env file, use system environment variables
   export EMAIL_USER="your-email@gmail.com"
   export EMAIL_PASSWORD="your-app-password"
   ```

2. **Consider Alternative Services:**
   - SendGrid (free tier available)
   - Mailgun (free tier available)
   - AWS SES
   - Your company's email service

3. **Backup Email Address:**
   - Set up a dedicated Gmail account for the application
   - Keep credentials secure in a password manager
   - Document the setup for team members

---

## FAQ

### Q: What's the difference between Gmail password and App Password?

**A:** 
- **Gmail Password:** Your regular login password - Gmail blocks using this with 3rd-party apps for security
- **App Password:** A special 16-character password created specifically for this app - only works for email

### Q: Can I use a non-Gmail address?

**A:** Yes, if you have SMTP credentials for that service. You'll need to set additional environment variables:
```env
SMTP_HOST=smtp.your-service.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=your-email@service.com
EMAIL_PASSWORD=your-password
```

### Q: Is the App Password saved securely?

**A:** It's stored in your `.env` file. Make sure:
- `.env` is in `.gitignore` (not committed to git)
- Server access is restricted
- Consider using environment variables instead in production

### Q: Can I reuse the same App Password for other apps?

**A:** Gmail allows multiple App Passwords. It's best practice to create separate ones for each application.

### Q: What if I lost the App Password?

**A:** No problem! Generate a new one:
1. Go to https://myaccount.google.com/apppasswords
2. Select the old one and delete it
3. Generate a new one
4. Update your `.env` file

---

## Next Steps

Once everything is working:

1. ✅ Test forgot password multiple times
2. ✅ Verify email arrives reliably
3. ✅ Check links expire after 30 minutes
4. ✅ Document setup for your team members

## Need Help?

If you're still having trouble:

1. Check the **Error Logs:**
   - Backend console when requesting password reset
   - Browser console (F12) for frontend errors

2. **Run the Diagnostic:**
   ```bash
   node test-email-config.js
   ```

3. **Check .env file:**
   - Is it saved?
   - Are values exactly correct?
   - No extra spaces or characters?

4. **Search for your specific error** in this guide's Troubleshooting section

---

## Summary

| Step | Action | Time |
|------|--------|------|
| 1 | Enable 2FA on Gmail | 2 min |
| 2 | Generate App Password | 1 min |
| 3 | Update .env file | 1 min |
| 4 | Test configuration | 1 min |
| **Total** | | **5 min** |

Once complete: ✅ Your forgot password feature is fully functional!
