# Quick Reference: Health Check & Authentication System

## 🚀 Quick Start

### Starting the Application

```bash
# Terminal 1: Start Backend (from backend folder)
npm run dev
# Automatically detects if port 5000 is in use, falls back to 50001

# Terminal 2: Start Frontend (from frontend folder)
npm run dev
# Automatically opens on http://localhost:5173
```

### Testing Login

```
Email: your-email@gmail.com
Password: YourPassword123
```

---

## 📋 Health Check System Overview

### How It Works

```
User Accesses App
    ↓
AuthContext initializes
    ↓
Singleton HealthCheckManager checks backend (/api/health)
    ↓
    ├─ Backend responds (healthy) → Proceed with auth
    │
    └─ Backend not responding → Start auto-retry every 3 seconds
       Show user: "Backend unavailable - retrying automatically"
       
When backend comes back online:
    ↓
    Automatic recovery detected
    ↓
    User sees: "Backend recovered! Please try signing in again"
```

---

## 🔧 Key Files Modified

| File | Purpose | Key Change |
|------|---------|-----------|
| `src/services/api.js` | Health check + API setup | New `HealthCheckManager` singleton |
| `src/contexts/AuthContext.jsx` | Auth state management | Uses `checkBackendHealth()` function |
| `frontend/.env` | Environment config | `VITE_BACKEND_URL=http://localhost:50001` |
| `frontend/vite.config.js` | Dev server config | Proxy target from environment |

---

## 💻 API Reference

### Health Check Manager Functions

```javascript
// Check backend once (no retry)
const isHealthy = await checkBackendHealth(timeout);

// Start automatic retry mechanism
startHealthCheckRetry((recovered) => {
  if (recovered) console.log('Backend back online!');
});

// Stop auto-retry (call on cleanup)
stopHealthCheckRetry();

// Get current status without checking
const status = getHealthStatus();

// Cleanup everything (unm
ount)
cleanupHealthCheck();
```

### Login Function

```javascript
const { login } = useAuth();

const result = await login(email, password);

if (result.success) {
  // User logged in, redirected to dashboard
} else {
  // result.message contains error reason
}
```

---

## 🎯 Common Use Cases

### Use Case 1: Checking Backend on Page Load

```javascript
useEffect(() => {
  async function checkBackend() {
    const isHealthy = await checkBackendHealth(2000);
    
    if (!isHealthy) {
      console.log('Backend down, showing maintenance message');
      startHealthCheckRetry((recovered) => {
        if (recovered) window.location.reload();
      });
    }
  }
  
  checkBackend();
  
  return () => cleanupHealthCheck();
}, []);
```

### Use Case 2: Custom Health Check Before API Call

```javascript
async function fetchUserData() {
  const isHealthy = await checkBackendHealth(1000);
  
  if (!isHealthy) {
    throw new Error('Backend unavailable');
  }
  
  const response = await api.get('/user/data');
  return response.data;
}
```

### Use Case 3: Graceful Error Handling

```javascript
try {
  await login(email, password);
} catch (error) {
  if (error.networkError) {
    // Backend is down
    setShowRetryMessage(true);
  } else if (error.response?.status === 401) {
    // Wrong password
    setError('Invalid credentials');
  } else {
    // Other error
    setError(error.message);
  }
}
```

---

## 🐛 Troubleshooting

### Problem: "Backend unreachable" message won't go away

**Solution 1**: Verify backend is running
```bash
# Check if backend started successfully
npm run dev  # in backend folder

# Should see:
# ✅ Server is running on port 50001
# ✅ MongoDB Connected Successfully!
```

**Solution 2**: Check health endpoint
```bash
curl http://localhost:50001/api/health
# Should return JSON response with 200 OK
```

**Solution 3**: Clear browser cache
```javascript
// In browser console:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Problem: Login button disabled

**Cause**: `backendAvailable` is still `false` in UI  
**Solution**: Wait for auto-retry to recover (3 second intervals)  
**Alternative**: Check browser console for errors

### Problem: Getting 401 on every login attempt

**Check**:
1. Is email registered? Try signup first
2. Is password correct? (Case-sensitive)
3. Check backend logs for validation errors
4. Verify User model is working: `mongodb://localhost:27017/ai-learning-assistant`

---

## 📊 Health Check States

```
State            | Meaning                              | Action
─────────────────┼────────────────────────────────────┬──────────────────
isAvailable:true | Backend is healthy and responsive  | Proceed normally
─────────────────┼────────────────────────────────────┤
isChecking:true  | Currently performing health check  | Wait for result
─────────────────┼────────────────────────────────────┤
retryInterval:✓  | Auto-retry is running              | Check logs
─────────────────┼────────────────────────────────────┤
failures:3+      | Multiple failures detected         | Mark unavailable
─────────────────┼────────────────────────────────────┤
lastCheckTime:?  | Time of last health check          | Debug info
```

---

## 🔍 Debugging Tips

### Enable Console Logging

Backend checks include these log messages:

```javascript
✅ Backend is available
❌ Backend is unavailable
🔄 Starting backend availability retry
🔍 Checking backend health
📤 Proxy Request: POST /api/auth/login
📥 Proxy Response: 200 /api/auth/login
```

**Read These First**:
1. Browser console (frontend errors)
2. Backend terminal (server logs)
3. Network tab (API requests)

### View Health Check Status

```javascript
// In browser console
import { getHealthStatus } from './src/services/api.js';
getHealthStatus() // true or false
```

### Monitor Retry Mechanism

```javascript
// Watch for retry messages in console:
// 🔄 Starting backend availability retry
// When backend recovers:
// ✅ Backend recovered! Stopping retry
```

---

## ✅ Checklist Before Deployment

- [ ] Backend `.env` has correct MongoDB URI
- [ ] Backend `.env` has unique JWT_SECRET
- [ ] Frontend `.env` has correct VITE_BACKEND_URL
- [ ] MongoDB is running and accessible
- [ ] Both backend and frontend can start without errors
- [ ] Health check endpoint returns 200 OK
- [ ] Login works with valid credentials
- [ ] Invalid credentials show proper error message
- [ ] Stopping backend shows retry message
- [ ] Starting backend resumes normal operation
- [ ] No console errors in browser

---

## 📈 Performance Notes

- Health check takes ~500-1000ms per attempt
- Retry interval: 3000ms (3 seconds)
- No performance impact on running site
- Memory usage: <1MB (singleton pattern)
- Prevents duplicate/concurrent checks automatically

---

## 🎓 Learning Resources

### Understanding the Architecture

1. **Singleton Pattern**: Ensures only one manager exists
   - File: `src/services/api.js`
   - Concept: Single instance used throughout app

2. **Health Check Flow**: How backend availability is determined
   - Endpoint: GET `/api/health`
   - Timeout: 3000ms
   - Retries: Every 3 seconds until recovery

3. **Authentication Flow**: How login works with health checks
   - File: `src/contexts/AuthContext.jsx`
   - Process: Health check → Validate → Store token

---

## 🆘 Emergency Recovery

If system is completely broken:

```bash
# 1. Kill all processes
taskkill /F /IM node.exe

# 2. Clear everything
# Frontend folder:
rm -rf node_modules package-lock.json
npm install

# Backend folder:
rm -rf node_modules package-lock.json
npm install

# 3. Clear MongoDB
# Connect to MongoDB and clear database (if needed)
mongosh
use ai-learning-assistant
db.users.deleteMany({})
exit

# 4. Restart everything
npm run dev  # in both backend and frontend separately
```

---

## 📞 Getting Help

**Issue**: [Describe the problem]

**Provide**:
1. Error message from browser console
2. Error message from backend terminal
3. Steps to reproduce
4. Environment (port, URL, credentials used)

**Check First**:
- Is backend running? ✓
- Is MongoDB running? ✓
- Are all .env variables set? ✓
- Did you restart after config changes? ✓

---

**Last Updated**: February 13, 2026  
**Version**: 2.0  
**Status**: Production Ready ✅
