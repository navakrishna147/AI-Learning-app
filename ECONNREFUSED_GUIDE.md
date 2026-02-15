# ============================================================================
# ECONNREFUSED ERRORS - COMPLETE TROUBLESHOOTING GUIDE
# ============================================================================
#
# This guide explains what causes ECONNREFUSED and how to fix it permanently
#

## What is ECONNREFUSED?

ECONNREFUSED (Connection Refused) is a network error that occurs when:
- The client (frontend) attempts to connect to a server (backend)
- The server is either:
  1. **Not running** (most common - 95% of cases)
  2. **Listening on a different port**
  3. **Listening on a different interface** (localhost vs 0.0.0.0)
  4. **Firewall blocking the connection**
  5. **Another process using the same port**

### Error Examples You Might See:

```
Error: connect ECONNREFUSED 127.0.0.1:5000
Error: getaddrinfo ENOTFOUND localhost:5000
Backend unreachable — retrying automatically
Cannot connect to backend server
```

---

## ROOT CAUSE ANALYSIS

### Scenario 1: Backend Server Not Running ✓ MOST COMMON (95%)

**Symptoms:**
- Frontend shows "Backend unreachable"
- Error: `ECONNREFUSED 127.0.0.1:5000`
- Browser console shows connection errors

**Diagnosis:**
1. Check if backend process is actually running
2. Open a new terminal and verify no startup errors

**Fix - IMMEDIATE:**

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Should show:
# ✅ APPLICATION STARTED SUCCESSFULLY
# 🚀 Server Port: 5000
```

**Permanent Prevention:**
- Use PM2 to auto-restart backend on failure
- Use Docker for consistent deployments
- Add health checks to deployment pipeline

---

### Scenario 2: Port Number Mismatch

**Symptoms:**
- Backend starts but frontend still shows unreachable
- Error appears immediately, not after delay
- Different port shows in startup logs

**Root Cause:**
A process is listening on port 5000, but it's **not your backend**

**Diagnosis:**

Windows:
```powershell
# Check what's using port 5000
netstat -ano | findstr :5000

# Get the PID from the output, then:
tasklist | findstr <PID>
```

Linux/Mac:
```bash
# Check what's using port 5000
lsof -i :5000
# or
netstat -lpn | grep 5000
```

**Fix:**

Option 1: Kill the conflicting process
```powershell
# Windows - kill process using port 5000
taskkill /PID <PID> /F

# Then restart backend:
npm run dev
```

Option 2: Change backend port in .env
```env
# backend/.env
PORT=5001  # Use different port

# Update frontend/.env
VITE_BACKEND_URL=http://127.0.0.1:5001
```

Option 3: Use PM2 with --restart-delay
```bash
npm install -g pm2
pm2 start backend/server.js
pm2 restart backend/server.js --delay 500
```

---

### Scenario 3: Environment Variables Not Loaded

**Symptoms:**
- Backend says it's running
- Listens on wrong port or missing port
- Error in startup logs about missing PORT

**Root Cause:**
.env file not being read or NODE_ENV is wrong

**Diagnosis:**

Check backend log output during startup:
```
# Should show:
🚀 Server Port: 5000    ← This tells you which port

# If shows undefined or wrong number:
# - Check backend/.env exists
# - Check PORT=5000 is in .env
# - Check NODE_ENV is correct
```

**Fix:**

1. Verify backend/.env is configured:
```env
# backend/.env
NODE_ENV=development
PORT=5000
JWT_SECRET=your_secret
MONGODB_URI=mongodb://localhost:27017/...
```

2. Restart backend:
```bash
npm run dev
```

3. If still wrong, explicitly set ENV var:
```bash
# Windows PowerShell
$env:PORT = "5000"
npm run dev

# Linux/Mac
PORT=5000 npm run dev
```

---

### Scenario 4: MongoDB Not Running

**Symptoms:**
- Backend starts but `/api/health` returns 503
- Database status shows "Disconnected"
- Some API calls fail, others work

**Root Cause:**
MongoDB service is not running

**Diagnosis:**

Test MongoDB:
```bash
# Try to connect
mongosh
# or
mongo --version
```

**Fix:**

Windows:
```powershell
# Start MongoDB service
net start MongoDB
# or
Set-Service -Name MongoDB -StartupType Automatic
Start-Service -Name MongoDB

# If MongoDB not installed:
# Download from: https://www.mongodb.com/try/download/community
```

Linux (Ubuntu):
```bash
sudo systemctl start mongodb
sudo systemctl status mongodb

# If not installed:
sudo apt-get install mongodb-org
sudo systemctl start mongodb
```

Mac:
```bash
brew services start mongodb-community

# If not installed:
brew tap mongodb/brew
brew install mongodb-community
```

---

### Scenario 5: CORS Origins Configuration

**Symptoms:**
- Backend is running but returns 403 CORS error
- Error: "CORS policy: Access to XMLHttpRequest has been blocked"
- Health check works but auth doesn't

**Root Cause:**
Frontend origin not in CORS_ORIGINS list

**Diagnosis:**

Check browser console: Look for CORS errors mentioning "origin"

**Fix:**

Update backend/.env:
```env
# Include ALL frontend URLs
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000

# For production with custom domain:
CORS_ORIGINS=https://myapp.com,https://www.myapp.com,https://staging.myapp.com
```

Restart backend:
```bash
npm run dev
```

---

### Scenario 6: Firewall Blocking Connection

**Symptoms:**
- Backend and frontend on different machines/networks
- Works locally but not from other computers
- Error: Connection timeout (not refused)

**Root Cause:**
Firewall blocking port 5000

**Windows Firewall:**
```powershell
# Allow port 5000 in Windows Firewall
New-NetFirewallRule -DisplayName "Allow Node Backend" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 5000

# Or through GUI:
# Settings → Privacy & Security → Firewall & network protection
# → Allow an app through firewall
# → Allow Node.js (or your app) on Private networks
```

**Linux (ufw):**
```bash
sudo ufw allow 5000
sudo ufw status
```

---

## PERMANENT PREVENTION STRATEGIES

### 1. Use PM2 for Process Management

```bash
# Install PM2
npm install -g pm2

# Start backend with PM2
cd backend
pm2 start server.js --name "backend"

# Auto-restart on crash
pm2 restart backend --delay 3000

# Monitor
pm2 monit

# Enable auto-start on system reboot
pm2 startup
pm2 save
```

### 2. Use Docker for Consistent Environment

```dockerfile
# Dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000
CMD ["npm", "run", "start"]
```

```bash
# Build and run
docker build -t backend .
docker run -p 5000:5000 backend
```

### 3. Implement Health Checks in Deployment

**For CI/CD Pipeline:**
```bash
#!/bin/bash
# start-and-verify.sh

# Start backend
npm run dev &
BACKEND_PID=$!

# Wait for startup
sleep 3

# Verify it's responding
curl -f http://127.0.0.1:5000/health || {
    echo "❌ Backend health check failed"
    kill $BACKEND_PID
    exit 1
}

echo "✅ Backend health check passed"
```

### 4. Add Monitoring and Alerting

```javascript
// backend/services/healthMonitor.js
setInterval(async () => {
  try {
    const health = await checkHealth();
    if (!health.healthy) {
      // Alert ops team
      console.error('⚠️ Backend degraded - notify ops');
      // Send to monitoring service (DataDog, New Relic, etc.)
    }
  } catch (err) {
    console.error('Critical: Health check failed');
    process.exit(1);
  }
}, 30000); // Every 30 seconds
```

### 5. Use Environment-Specific Configurations

```bash
# Development
NODE_ENV=development PORT=5000 npm run dev

# Testing
NODE_ENV=test PORT=5001 npm run test

# Production
NODE_ENV=production PORT=80 npm start
```

### 6. Implement Graceful Startup Sequence

```javascript
// server.js
const startServer = async () => {
  // Step 1: Environment validation
  validateEnvironment();
  
  // Step 2: Database connection with timeout
  await connectDB({ timeout: 10000 });
  
  // Step 3: Start HTTP server
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server ready on port ${PORT}`);
    
    // Step 4: Perform self-diagnostics
    performHealthCheck();
  });
};
```

---

## QUICK TROUBLESHOOTING FLOWCHART

```
Is "Backend unreachable" showing?
  ↓
  ├─ YES → Check: Is backend running? (npm run dev started?)
  │        ├─ No → Start backend: npm run dev
  │        ├─ Yes → Check backend/.env PORT=5000
  │        └─ Check MongoDB: mongosh
  │
  ├─ NO → Check: Is MongoDB running?
  │       ├─ No → Start MongoDB
  │       └─ Yes → Problem elsewhere, check logs
  │
  └─ Still not working?
     └─ Run diagnostic: node verify-connectivity.cjs --full
```

---

## TESTING CHECKLIST

### Before Deployment:

- [ ] Backend starts without errors: `npm run dev`
- [ ] `/health` returns 200: `curl http://127.0.0.1:5000/health`
- [ ] `/api/health` returns 200: `curl http://127.0.0.1:5000/api/health`
- [ ] Frontend proxy works: Check vite.config.js
- [ ] CORS configured: backend/.env has CORS_ORIGINS
- [ ] Database connected: `/api/health` shows database:connected=true
- [ ] Login works: Can submit credentials and get response
- [ ] No 403 errors in browser console
- [ ] No ECONNREFUSED in network tab

### Production Setup:

- [ ] Build both frontend and backend
- [ ] Set .env.production variables
- [ ] Verify PORT environment variable
- [ ] Test health endpoint externally
- [ ] Configure CORS_ORIGINS for your domain
- [ ] Set up monitoring/alerting
- [ ] Configure auto-restart (PM2, systemd, Docker)
- [ ] Test failover/recovery

---

## COMMON FIXES AT A GLANCE

| Issue | Command | Status |
|-------|---------|--------|
| Backend not starting | `cd backend && npm run dev` | Immediate test |
| Wrong port | `echo $PORT` or `$env:PORT` | Check env var |
| MongoDB not running | `mongosh` or `mongo --version` | Verify DB |
| Port 5000 in use | `netstat -ano \| findstr :5000` | Windows diagnose |
| Port 5000 in use | `lsof -i :5000` | Linux/Mac diagnose |
| CORS error | Add to backend/.env CORS_ORIGINS | Update config |
| Frontend can't find backend | Check VITE_BACKEND_URL | Verify frontend env |
| Health check slow | Check MongoDB indexes, queries | Performance |
| Random disconnects | Enable keep-alive, increase timeout | Connection stability |

---

## SUPPORT RESOURCES

- **MongoDB Connection Issues**: https://www.mongodb.com/docs/manual/reference/connection-string/
- **Express CORS**: https://www.npmjs.com/package/cors
- **Vite Proxy**: https://vitejs.dev/config/server-options.html#server-proxy
- **PM2 Monitoring**: https://pm2.io/
- **Network Debugging**: https://curl.se/
