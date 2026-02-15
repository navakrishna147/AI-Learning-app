# Backend Environment Setup (.env)

## Required for Backend to Work

### MongoDB Database
```env
# Option 1: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/ai-learning-assistant

# Option 2: MongoDB Atlas (Cloud - RECOMMENDED)
# Go to: https://www.mongodb.com/cloud/atlas
# Create free account → Cluster → Get Connection String
# Replace username:password with your Atlas credentials
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ai-learning-assistant?retryWrites=true&w=majority
```

### JWT Authentication
```env
# Generate a strong secret (minimum 32 characters)
# Use online generator: https://www.random.org/strings/
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_at_least_32_chars
```

### Server Configuration
```env
# Server port (default 5000, change if occupied)
PORT=5000

# Maximum file upload size (10MB = 10485760 bytes)
MAX_FILE_SIZE=10485760
```

### Email Configuration (for Forgot Password)
```env
# Option 1: Gmail (RECOMMENDED)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password  # NOT your regular password!

# To get Gmail App Password:
# 1. Go to https://myaccount.google.com/apppasswords
# 2. Select "Mail" and "Windows Computer"
# 3. Copy the 16-character password
# 4. Paste it as EMAIL_PASSWORD
```

### Frontend URL
```env
# URL where frontend is running (for password reset links)
FRONTEND_URL=http://localhost:5173

# If using different frontend port, update this
```

### Optional: Non-Gmail SMTP
```env
# Only if not using Gmail
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_SECURE=false
```

---

## Step-by-Step Setup

### 1. Create .env File
```bash
cd backend
# Create new file called .env (no extension)
# Copy contents below
```

### 2. Complete .env File Example
```env
# Database
MONGODB_URI=mongodb://localhost:27017/ai-learning-assistant

# JWT
JWT_SECRET=your_super_secret_key_minimum_32_characters_long_1234567890

# Server
PORT=5000
MAX_FILE_SIZE=10485760

# Email (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password

# Frontend
FRONTEND_URL=http://localhost:5173
```

### 3. Start Backend
```bash
cd backend
npm install
npm start

# You should see:
# ✅ SERVER STARTED SUCCESSFULLY
# ✅ MongoDB Connected
```

---

## MongoDB Setup

### Local MongoDB
```bash
# Windows: Download from https://www.mongodb.com/try/download/community
# Install and run: mongod command

# Verify connection
mongosh
# Should connect to default database
```

### MongoDB Atlas (Cloud - No Installation Needed)
```
1. Visit https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster
4. Get connection string → Database → Connect
5. Replace in .env:
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ai-learning-assistant
```

---

## Email Setup (Gmail)

### Getting App Password
```
1. Go to https://myaccount.google.com/apppasswords
2. Enable 2-Factor Authentication (if not already)
3. Select "Mail" from dropdown
4. Select "Windows Computer" from dropdown
5. Google generates 16-character password
6. Copy this password to EMAIL_PASSWORD in .env
7. Use your Gmail address for EMAIL_USER
```

### Example:
```env
EMAIL_USER=myname@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop  # Spaces can be removed
```

---

## Verification Checklist

After creating .env file:

- [ ] MONGODB_URI points to valid database
  ```bash
  # Test:
  mongosh "YOUR_MONGODB_URI"
  ```

- [ ] JWT_SECRET is 32+ characters
  - Don't use the placeholder!

- [ ] EMAIL_USER is valid Gmail address
  - Must have 2FA enabled

- [ ] EMAIL_PASSWORD is 16-character app password
  - NOT your regular Gmail password

- [ ] FRONTEND_URL matches your frontend port

- [ ] No quotes around values
  - ✅ PORT=5000
  - ❌ PORT="5000"

---

## Common Setup Mistakes

| Mistake | Fix |
|---------|-----|
| JWT_SECRET too short | Use 32+ character strong secret |
| Email_USER is not Gmail | Only Gmail tested, use other SMTP if needed |
| EMAIL_PASSWORD is Gmail password | Use 16-char App Password instead |
| MONGODB_URI wrong | Test with mongosh first |
| PORT already in use | Change to 5001, 5002, etc |
| Quotes around values | Remove quotes: `KEY=value` |
| File not named .env | Must be exactly `.env` |
| No email configuration | Forgot password won't work |

---

## Test Configuration

After saving .env, startup backend:

```bash
npm start
```

Check for these messages:
```
✅ SERVER STARTED SUCCESSFULLY
✅ MongoDB Connected
📌 Server URL: http://localhost:5000/
```

Test with curl:
```bash
curl http://localhost:5000/health
# Should respond with JSON
```

---

## Advanced Configuration

### Custom MongoDB Connection
```env
# With authentication
MONGODB_URI=mongodb://username:password@host:port/database

# With options
MONGODB_URI=mongodb://localhost:27017/db?authSource=admin&replicaSet=rs0
```

### Multiple Environments
Create separate files:
- `.env` (default)
- `.env.local` (local development)
- `.env.production` (production)

Load with: `NODE_ENV=production npm start`

### Debug Mode
Add to .env:
```env
DEBUG=*
LOG_LEVEL=debug
```

---

## Still Not Working?

1. **Check .env exists:**
   ```bash
   ls -la backend/.env
   ```

2. **Verify no typos:**
   ```bash
   # Each line should be KEY=VALUE
   # No spaces around =
   ```

3. **Test MongoDB:**
   ```bash
   mongosh "YOUR_CONNECTION_STRING"
   ```

4. **Check backend logs:**
   - Look for error messages when starting
   - Contains clues about what's misconfigured

5. **Clear node modules & reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm start
   ```

---

## Required Environment Variables (Quick Reference)

| Variable | Purpose | Example | Required |
|----------|---------|---------|----------|
| MONGODB_URI | Database connection | mongodb://localhost:27017/db | ✅ Yes |
| JWT_SECRET | Token signing | your_secret_key_32+ chars | ✅ Yes |
| PORT | Server port | 5000 | ✅ Yes |
| FRONTEND_URL | Frontend URL for links | http://localhost:5173 | ✅ Yes |
| EMAIL_USER | Gmail address | user@gmail.com | ❌ Optional (forgot password won't work) |
| EMAIL_PASSWORD | Gmail app password | xxxx xxxx xxxx xxxx | ❌ Optional (forgot password won't work) |
| MAX_FILE_SIZE | Max upload size | 10485760 | ❌ Optional (default 10MB) |

---

## Next Steps

1. ✅ Create and configure .env file
2. ✅ Start backend: `npm start`
3. ✅ Start frontend: `npm run dev`
4. ✅ Test signup at http://localhost:5173
5. ✅ Check backend logs for any errors

All auth features will now work properly!
