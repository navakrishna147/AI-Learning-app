## 🐛 File Upload 500 Error - Troubleshooting Guide

### ❌ Most Common Cause: MongoDB Not Running

The **#1 reason** for 500 errors during file upload is **MongoDB not running**.

#### ✅ Fix: Start MongoDB

**Windows (Local MongoDB):**
```powershell
# If MongoDB is installed as a service
net start MongoDB

# Or if using MongoDB Community Edition
mongod
```

**Windows (MongoDB Atlas - Cloud):**
```
- Ensure your MONGODB_URI in .env points to your Atlas cluster
- Example: mongodb+srv://username:password@cluster.mongodb.net/dbname
- Check that your IP is whitelisted in Atlas Network Access
```

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

---

### 🔍 Diagnosis Steps

#### 1. Check Server Logs
Look at the terminal where the backend is running. You'll see:

```
✅ Upload started
📤 Uploading document: {...}
✅ PDF parsed successfully
✅ Document created in DB: 507f1f77bcf44165f6879df1
✅ Activity logged
✅ Document uploaded successfully
```

**If you see MongoDB error instead:**
```
❌ Upload error: connect ECONNREFUSED 127.0.0.1:27017
```
→ **MongoDB is not running** (see Fix above)

#### 2. Check .env File
Verify `.env` has these **required** variables:
```
MONGODB_URI=mongodb://localhost:27017/ai-learning-assistant
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
```

#### 3. Test MongoDB Connection
```powershell
# Open PowerShell/Terminal and try:
mongosh  # If using MongoDB 5.0+
# or
mongo    # If using older MongoDB

# If it connects, you're good!
# If it fails: "connect ECONNREFUSED" → MongoDB is not running
```

---

### 🛠️ Other Possible Issues

#### Issue: "Only PDF files are allowed"
**Cause:** File isn't a PDF
**Fix:** Select a valid .pdf file

#### Issue: "File size exceeds 10MB limit"
**Cause:** File is too large
**Fix:** 
- Use a smaller PDF
- Or change `MAX_FILE_SIZE` in `.env` (in bytes)
  ```
  MAX_FILE_SIZE=52428800  # 50MB instead of 10MB
  ```

#### Issue: "User not authenticated"
**Cause:** Token not sent or invalid
**Fix:** 
- Make sure you're logged in
- Check that localStorage has a 'token'
- Token might be expired

#### Issue: "Document title is required"
**Cause:** Title field is empty
**Fix:** Provide a document title before uploading

#### Issue: "Database connection error"
**Cause:** MongoDB connection failed
**Fix:** Check MongoDB is running (see top of this guide)

---

### 📋 Complete Checklist

- [ ] MongoDB is running (`mongosh` or `mongo` command works)
- [ ] `.env` file exists with `MONGODB_URI`, `JWT_SECRET`, `PORT`
- [ ] Backend server is running (`npm run dev` or `npm start`)
- [ ] Frontend is running (`npm run dev`)
- [ ] You are logged in to the application
- [ ] Uploading a valid PDF file
- [ ] File size is under 10MB (or your configured limit)
- [ ] Title field is filled in

---

### 🚀 Quick Restart Guide

If still getting 500 error, do a complete restart:

#### 1. Backend
```powershell
# Kill old process (if running)
Get-Process node | Stop-Process -Force

# Start fresh
cd backend
npm install  # Install any missing packages
npm run dev
```

#### 2. MongoDB (Windows)
```powershell
# Make sure MongoDB is running
net start MongoDB
# or
mongod
```

#### 3. Frontend
```powershell
cd frontend
npm install
npm run dev
```

#### 4. Test Upload
- Navigate to Documents page
- Upload a test PDF
- Check backend console for detailed logs

---

### 📞 Still Having Issues?

**Check the server output** for these error messages:

| Message | Meaning | Solution |
|---------|---------|----------|
| `ECONNREFUSED` | Cannot connect to MongoDB | Start MongoDB |
| `ValidationError` | Required field missing | Check .env variables |
| `PDF parsing warning` | PDF can't be read | Use a valid PDF file |
| `Document created` followed by error | DB write failed | Check MongoDB is running & space available |

---

### 🔧 Development Mode Debugging

Set `NODE_ENV=development` in `.env` to get full error stack traces:

```
NODE_ENV=development
```

This will show detailed error messages in the response, not just generic 500 errors.

