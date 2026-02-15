# QUICK START: ENABLE PM2 AUTO-RESTART IN 5 MINUTES

## 🚀 ONE-TIME SETUP (Run ONCE)

Open **PowerShell as Administrator** and run these commands:

### Step 1: Install PM2 (if not already installed)
```powershell
npm install -g pm2
```

### Step 2: Navigate to backend directory
```powershell
cd "d:\LMS-Full Stock Project\LMS\MERNAI\ai-learning-assistant\backend"
```

### Step 3: Start backend with PM2
```powershell
pm2 start ecosystem.config.js
```

### Step 4: Enable Windows autostart
```powershell
pm2 startup windows
pm2 save
```

### Step 5: Verify it works
```powershell
curl http://localhost:5000/api/health
```

Expected response: `{"status":"healthy",...}`

---

## ✅ DONE! Now:

- ✅ Backend auto-restarts if it crashes
- ✅ Backend restarts on Windows boot
- ✅ Backend auto-reconnects to MongoDB after sleep/wake (2-5 seconds)
- ✅ Logs available at: `pm2 logs ai-backend`

---

## 🔧 DAILY COMMANDS

```powershell
# Check status
pm2 list

# View logs
pm2 logs ai-backend

# Restart backend
pm2 restart ai-backend

# Stop backend
pm2 stop ai-backend

# Real-time monitoring
pm2 monit

# Test health
curl http://localhost:5000/api/health
```

---

## 🧪 TEST SLEEP/WAKE

```powershell
# 1. Verify running
pm2 list

# 2. Check health
curl http://localhost:5000/api/health

# 3. Put system to sleep
rundll32.exe powrprof.dll,SetSuspendState 0,1,0

# 4. Wait 30 seconds

# 5. Wake system (press any key)

# 6. Immediately check health
curl http://localhost:5000/api/health

# ✅ Should return 200 "healthy" within 5 seconds
```

---

## 📚 FOR MORE INFO

- **Full Setup Guide:** Read `PM2_SETUP_GUIDE.md`
- **Root Cause Analysis:** Read `SLEEP_WAKE_FIX_SUMMARY.md`
- **Technical Details:** See `ecosystem.config.js` comments
- **Code Changes:** Review `config/db.js` comments

---

**That's it! Your backend is now permanently stable. 🎉**
