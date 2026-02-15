# Quick Setup - Forgot Password Feature

## 1️⃣ Install Nodemailer
```bash
cd ai-learning-assistant/backend
npm install
```

## 2️⃣ Configure Email (Backend .env)
```
# Gmail (Recommended)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:5173
```

### Get Gmail App Password:
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer"  
3. Copy the 16-character password → `EMAIL_PASSWORD`

## 3️⃣ Start Application
```bash
# Terminal 1: Backend
cd ai-learning-assistant/backend
npm run dev

# Terminal 2: Frontend
cd ai-learning-assistant/frontend
npm run dev
```

## 4️⃣ Test It!
1. Go to http://localhost:5173/login
2. Click "Forgot password?"
3. Enter your email
4. Check inbox for reset link
5. Click link and set new password

---

**Need help?** See [FORGOT_PASSWORD_GUIDE.md](./FORGOT_PASSWORD_GUIDE.md) for detailed setup instructions.
