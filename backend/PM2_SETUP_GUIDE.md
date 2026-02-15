# PM2 SETUP GUIDE: PERMANENT FIX FOR SLEEP/WAKE INSTABILITY

## 🎯 PROBLEM SOLVED

After this setup, your backend will:
- ✅ **Auto-restart on crash** - Process manager resurrects dead instances
- ✅ **Survive sleep/wake** - Auto-reconnect to MongoDB after system resumption
- ✅ **Auto-start on boot** - Runs automatically when Windows starts
- ✅ **Auto-reconnect to DB** - Aggressive MongoDB reconnection (2-3s intervals)
- ✅ **Monitor health** - Health check endpoints for automated monitoring

---

## 📋 SETUP INSTRUCTIONS (5-10 MINUTES)

### Step 1: Install PM2 Globally

Open PowerShell as Administrator and run:

```powershell
npm install -g pm2
```

**Verify installation:**
```powershell
pm2 --version
```

---

### Step 2: Navigate to Backend Directory

```powershell
cd "d:\LMS-Full Stock Project\LMS\MERNAI\ai-learning-assistant\backend"
```

---

### Step 3: Start Backend with PM2

Use the included ecosystem configuration:

```powershell
pm2 start ecosystem.config.js
```

**Expected output:**
```
[PM2] Starting app [ai-backend] in fork mode ...
[PM2] Module started
[PM2] App [ai-backend] pid 12345 online
```

**Verify it's running:**
```powershell
pm2 list
```

You'll see:
```
┌─────────────────────┬───────┬─────────┬──────┐
│ App name            │ id    │ version │ pid  │
├─────────────────────┼───────┼─────────┼──────┤
│ ai-backend          │ 0     │ N/A     │ 1234 │
└─────────────────────┴───────┴─────────┴──────┘
```

---

### Step 4: Test Backend Connection

```powershell
# Test if backend responds
curl http://localhost:5000/health

# You should get:
# {"status":"OK","service":"alive","timestamp":"...","uptime":123}

# Check database health
curl http://localhost:5000/api/health

# You should get:
# {"status":"healthy","service":"running","database":{"connected":true,...}}
```

---

### Step 5: Enable Windows Startup (CRITICAL)

**Option A: Automatic (Recommended)**

```powershell
pm2 startup windows
```

This command will:
1. Create a Windows task scheduler entry
2. Auto-run PM2 and your app on system restart

**Option B: Manual Startup Setup**

This is required if Option A doesn't work:

1. Open Task Scheduler (Win+R → `taskschd.msc`)
2. Click "Create Task..."
3. Fill in:
   - **Name:** `PM2 App Startup`
   - **Trigger:** "At startup"
   - **Action:** Start a program
   - **Program:** `C:\Program Files\nodejs\npm.cmd`
   - **Arguments:** `-g pm2 resurrect`
4. Click OK

---

### Step 6: Save PM2 Configuration

```powershell
pm2 save
```

This saves the current process list so PM2 can restore it on startup.

---

### Step 7: Verify Auto-Startup (IMPORTANT)

**Test 1: Check if PM2 auto-starts on Windows restart**

```powershell
# Restart your computer
# After restart, open PowerShell and run:
pm2 list

# You should see ai-backend is running
```

**Test 2: Simulate Sleep/Wake**

```powershell
# Put system to sleep
rundll32.exe powrprof.dll,SetSuspendState 0,1,0

# Or: Close and reopen laptop lid

# Wait 20 seconds...

# Open PowerShell and check:
pm2 logs ai-backend

# You should see MongoDB reconnection logs
```

---

## 🧪 TESTING SLEEP/WAKE STABILITY

### Full Test Cycle:

1. **Start the app:**
   ```powershell
   pm2 start ecosystem.config.js
   ```

2. **Verify backend is healthy:**
   ```powershell
   curl http://localhost:5000/api/health
   ```

3. **Put system to sleep:**
   - Close laptop lid, OR
   - Run: `rundll32.exe powrprof.dll,SetSuspendState 0,1,0`

4. **Wait 30+ seconds**

5. **Wake system:**
   - Open laptop lid, OR
   - Press any key

6. **Check backend immediately:**
   ```powershell
   curl http://localhost:5000/api/health
   ```

   **Expected:** 200 OK with `status: "healthy"` (should reconnect within 5-10 seconds)

7. **Check logs:**
   ```powershell
   pm2 logs ai-backend --lines 50
   ```

   **Expected logs:**
   ```
   ⚠️  MongoDB DISCONNECTED - Triggering aggressive reconnection...
   🔄 Reconnecting in 2s... (backoff: 2000ms)
   🔌 Attempting MongoDB reconnection...
   ✅ MongoDB RECONNECTED - Connection restored!
   ```

---

## 📊 MONITORING SETUP

### Real-Time Monitoring:

```powershell
# View live process stats
pm2 monit

# View logs (all)
pm2 logs

# View logs (specific app)
pm2 logs ai-backend

# Follow logs (real-time)
pm2 logs ai-backend --follow

# View detailed process info
pm2 describe ai-backend
```

### Health Check Endpoints:

Your backend has 3 health check endpoints:

1. **`GET /health`** - Server alive check (always 200)
   ```powershell
   curl http://localhost:5000/health
   # {"status":"OK","service":"alive","uptime":123}
   ```

2. **`GET /api/health`** - Quick health with DB status
   ```powershell
   curl http://localhost:5000/api/health
   # {"status":"healthy","database":{"connected":true}}
   ```

3. **`GET /api/health/detailed`** - Full diagnostics
   ```powershell
   curl http://localhost:5000/api/health/detailed
   # Includes memory, CPU, connection pool info
   ```

---

## ⚠️ TROUBLESHOOTING

### Problem: "Port 5000 already in use"

**Solution 1:** Kill existing process
```powershell
# Find process on port 5000
netstat -ano | findstr :5000

# Kill it (replace PID)
taskkill /PID 12345 /F

# Or: Use PM2 to stop it
pm2 stop ai-backend
pm2 delete ai-backend
```

**Solution 2:** Use different port
- Edit `.env` file
- Change `PORT=5000` to `PORT=5001`
- Restart: `pm2 restart ecosystem.config.js`

---

### Problem: MongoDB still shows "disconnected"

**Check MongoDB is running:**
```powershell
# For local MongoDB
mongod

# For MongoDB Atlas
# Ensure internet connection and credentials in .env
```

**Check connection string:**
```powershell
# View current env vars
pm2 describe ai-backend
# Look for MONGODB_URI value
```

---

### Problem: PM2 doesn't auto-start on Windows boot

**Solution 1:** Re-run startup setup (as Admin)
```powershell
pm2 startup windows --force
pm2 save
```

**Solution 2:** Verify Task Scheduler
1. Win+R → `taskschd.msc`
2. Look for "pm2" or "PM2" in Task Scheduler
3. Right-click → Properties → Triggers → Should show "At startup"

**Solution 3:** Manual verification
```powershell
# Check if PM2 is in startup registry
reg query HKCU\Software\Microsoft\Windows\CurrentVersion\Run | find pm2
```

---

## 🔧 USEFUL PM2 COMMANDS

```powershell
# START & STOP
pm2 start ecosystem.config.js        # Start app
pm2 stop ai-backend                  # Stop app (good for debugging)
pm2 restart ai-backend               # Restart app
pm2 delete ai-backend                # Remove from PM2

# MONITORING
pm2 list                             # List all processes
pm2 monit                            # Real-time dashboard
pm2 logs ai-backend                  # View logs
pm2 logs ai-backend --lines 100      # View last 100 lines
pm2 logs ai-backend --follow         # Follow logs in real-time
pm2 describe ai-backend              # Detailed process info

# CONFIGURATION
pm2 save                             # Save current app list
pm2 startup windows                  # Enable Windows startup
pm2 unstartup windows                # Disable Windows startup
pm2 resurrect                        # Restore saved app list

# ADVANCED
pm2 web                              # Web dashboard (localhost:9615)
pm2 kill                             # Kill all PM2 processes
pm2 update                           # Update PM2 itself
```

---

## 🎯 KEY IMPROVEMENTS IN THIS SETUP

### 1. **Aggressive MongoDB Reconnection**
- Start reconnect at 2 seconds (was 5 seconds)
- Max out at 10 seconds backoff
- Prevents long downtime after sleep/wake

### 2. **Event Listeners Setup BEFORE Connection**
- Reconnection logic ready from startup
- Handles connection failures immediately
- No silent crashes

### 3. **TCP Keep-Alive Enabled**
- Detects broken connections after network interruption
- Stale connections cleaned up automatically
- Better connection pool management

### 4. **Process Auto-Restart**
- Crashes trigger automatic restart (within 10s)
- Exponential backoff prevents restart loops
- Max 10 restarts within 60 seconds before pause

### 5. **Comprehensive Health Checks**
- `/health` endpoint always responds if server is alive
- `/api/health` returns proper HTTP status codes (200/503)
- `/api/health/detailed` shows connection pool status

### 6. **Windows Auto-Startup**
- Built into PM2
- Auto-restart on system reboot
- Compatible with sleep/wake cycles

---

## 📈 PRODUCTION DEPLOYMENT

For production servers:

```powershell
# Start with production environment
pm2 start ecosystem.config.js --env production

# Enable cloud monitoring (optional)
npm install pm2 -g
pm2 link <secret_key> <public_key>  # From PM2+ account

# Enable auto-log rotation
pm2 install pm2-logrotate

# Save configuration
pm2 save

# Enable Windows startup
pm2 startup windows
pm2 save
```

---

## 🚀 WHAT'S NEXT

1. **Monitor logs daily:**
   ```powershell
   pm2 logs ai-backend | more
   ```

2. **Check health endpoint regularly:**
   ```powershell
   # Add to monitoring tools like:
   # - Uptime Robot
   # - Datadog
   # - New Relic
   # - Azure Monitor
   ```

3. **Test after updates:**
   ```powershell
   pm2 restart ai-backend
   curl http://localhost:5000/api/health
   ```

4. **Monitor MongoDB:**
   ```powershell
   # Check connection status
   curl http://localhost:5000/api/health/detailed | ConvertFrom-Json | Select database
   ```

---

## 📞 STILL HAVING ISSUES?

### Check these files:
1. **Backend logs:**
   ```powershell
   pm2 logs ai-backend
   ```

2. **System event logs:**
   - Win+R → `eventvwr.msc`
   - Look in "Windows Logs" → "System"

3. **MongoDB logs:**
   - Local: `C:\Program Files\MongoDB\Server\{version}\log\mongod.log`
   - Atlas: Check MongoDB Atlas Dashboard

4. **Environment variables:**
   ```powershell
   pm2 describe ai-backend
   # Check if MONGODB_URI is correct
   ```

---

## ✅ FINAL VERIFICATION CHECKLIST

- [ ] PM2 installed globally (`pm2 --version`)
- [ ] Backend starts with PM2 (`pm2 list` shows ai-backend running)
- [ ] Health check responds (`curl localhost:5000/health` returns 200)
- [ ] Database connects (`curl localhost:5000/api/health` shows connected: true)
- [ ] Windows startup enabled (`pm2 startup windows` confirmed)
- [ ] Configuration saved (`pm2 save` completed)
- [ ] Sleep/wake test passed (backend reconnects within 10s)
- [ ] Logs accessible (`pm2 logs ai-backend` works)

---

## 📝 NOTES

- **Logs stored in:** `./logs/` directory
- **Config file:** `ecosystem.config.js`
- **Auto-restart on crash:** YES (with exponential backoff)
- **Memory limit:** 500MB (auto-restart if exceeded)
- **Graceful shutdown:** 10 seconds before forced kill
- **Watch mode:** Enabled in development (auto-restarts on file changes)

---

**Your backend is now PRODUCTION-GRADE and SLEEP/WAKE STABLE! 🎉**
