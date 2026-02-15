# 🔧 ADVANCED TROUBLESHOOTING & DEBUGGING GUIDE

**For complex issues, advanced debugging techniques, and edge cases.**

---

## Table of Contents

1. [Diagnostic Tools](#diagnostic-tools)
2. [Backend Issues](#backend-issues)
3. [Frontend Issues](#frontend-issues)
4. [Database Issues](#database-issues)
5. [Network & Proxy Issues](#network--proxy-issues)
6. [Authentication Issues](#authentication-issues)
7. [Performance Issues](#performance-issues)
8. [Development Environment Issues](#development-environment-issues)

---

## 🔍 DIAGNOSTIC TOOLS

### System Information

```powershell
# Check Node.js version
node --version
npm --version

# Check if ports are in use
netstat -ano | findstr :5000     # Backend port
netstat -ano | findstr :5173     # Frontend port
netstat -ano | findstr :27017    # MongoDB port

# Get process details
tasklist | findstr node          # Find node processes
```

### Network Diagnostics

```powershell
# Test connection to backend
curl -v http://localhost:5000    # Verbose output

# Test connection with specific header
curl -v -H "Accept: application/json" http://localhost:5000/api/health

# Trace DNS (if using remote MongoDB)
nslookup cluster.mongodb.net
```

### MongoDB Diagnostics

```powershell
# Check if MongoDB is running
net start MongoDB                 # Start service
net stop MongoDB                  # Stop service

# Connect to MongoDB shell
mongo

# In MongoDB shell
db.version()                      # Check version
db.serverStatus()                 # Server status
db.currentOp()                    # Current operations
db.stats()                        # Database stats
db.getCollectionNames()           # List collections
```

---

## 🔴 BACKEND ISSUES

### Issue: Backend crashes on startup

**Symptoms:**
```
✅ Server starting...
❌ Error: listen EADDRINUSE :::5000
Process exited
```

**Debugging:**

```powershell
# 1. Check what's using port 5000
netstat -ano | findstr :5000
# Output: TCP  127.0.0.1:5000  0.0.0.0:0  LISTENING  12345

# 2. Kill that process (12345 is the PID)
taskkill /PID 12345 /F

# 3. Verify port is free
netstat -ano | findstr :5000
# Should return nothing

# 4. Try starting backend again
npm run dev
```

**Alternative Fix:**
```dotenv
# Change port in backend/.env
PORT=5001

# Update frontend proxy
VITE_BACKEND_URL=http://localhost:5001
```

---

### Issue: "Cannot find module" error

**Symptoms:**
```
Error: Cannot find module 'express'
```

**Debugging:**

```powershell
# 1. Check node_modules exists
dir backend\node_modules

# 2. If missing, reinstall
cd backend
npm install

# 3. If still broken, clear cache
npm cache clean --force
rm -r node_modules package-lock.json
npm install
```

---

### Issue: MongoDB not connecting

**Symptoms:**
```
❌ MongoDB connection failed
MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017
```

**Debugging:**

```powershell
# 1. Check if MongoDB service is running
sc query MongoDB                           # Service status

# 2. Start MongoDB if not running
net start MongoDB

# 3. Test connection
mongo                                      # Should open shell

# 4. Check connection string in .env
# Should be: mongodb://localhost:27017/ai-learning-assistant

# 5. If using MongoDB Atlas (cloud), check:
# - Connection string has username:password
# - IP is whitelisted in Atlas dashboard
# - Network access configured
```

**Connection String Examples:**

```dotenv
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/ai-learning-assistant

# MongoDB Atlas (Cloud)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-learning-assistant?retryWrites=true&w=majority

# With authentication
MONGODB_URI=mongodb://user:password@localhost:27017/ai-learning-assistant?authSource=admin
```

---

### Issue: POST requests failing

**Symptoms:**
```
POST /api/auth/login
❌ 500 Internal Server Error
```

**Debugging:**

```bash
# 1. Check backend console for error message
# Look for: Error: ..., Stack: ...

# 2. Test with curl verbose flag
curl -v -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'

# 3. Check request body format
# Must be valid JSON, no trailing commas

# 4. Check Content-Type header
# Must be: Content-Type: application/json

# 5. Check .env variables
# Ensure JWT_SECRET is set
```

---

### Issue: CORS errors

**Symptoms:**
```
Access to XMLHttpRequest at 'http://localhost:5000/api/...'
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Debugging:**

```javascript
// In backend/server.js, check CORS configuration:
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// If still failing, use wildcard (only in development!)
app.use(cors());
```

---

### Issue: "Cannot POST /api/auth/login" (404)

**Symptoms:**
```
Cannot POST /api/auth/login
404 Not Found
```

**Debugging:**

```javascript
// Check if route is registered in backend/routes/auth.js
// File should contain:
module.exports = (app) => {
  app.post('/api/auth/login', ...)
  app.post('/api/auth/signup', ...)
  // etc.
}

// Check route is mounted in server.js:
const authRoutes = require('./routes/auth')
authRoutes(app)

// Verify endpoint actually has /api prefix
// Should be: /api/auth/login
// NOT: /auth/login
```

---

## 🟦 FRONTEND ISSUES

### Issue: Vite proxy not working

**Symptoms:**
```
🔴 PROXY ERROR: ECONNREFUSED
Backend NOT RUNNING!
```

**Debugging:**

```javascript
// Check vite.config.js has correct proxy:
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
      ws: true,
      rewrite: (path) => path.replace(/^\/api/, '/api')
    }
  }
}

// Verify target port matches backend PORT
// Check backend is running: npm run dev in backend folder

// Test proxy manually:
curl http://localhost:5173/api/health
// Should work even if only frontend is running (if backend is running)
```

---

### Issue: Blank page after login

**Symptoms:**
```
1. Login successful
2. Page redirects to /dashboard
3. Dashboard shows blank/white page
```

**Debugging:**

```javascript
// Open DevTools: F12

// 1. Check console for errors
// Look for red text (errors)

// 2. Check Network tab
// Look for failed requests (red status codes)

// 3. Check localStorage
// Type in console:
console.log(localStorage.getItem('user'))
console.log(localStorage.getItem('token'))
// Should show user object and JWT token

// 4. Check if user data exists
// Type in console:
const user = JSON.parse(localStorage.getItem('user'))
console.log(user)

// 5. If token exists but user doesn't, manually set:
localStorage.setItem('user', JSON.stringify({
  id: 'xxx',
  email: 'testuser@example.com',
  username: 'testuser'
}))

// 6. Full page refresh
// Ctrl+Shift+R (hard refresh)
```

---

### Issue: "Cannot GET /dashboard"

**Symptoms:**
```
Cannot GET /dashboard
404 Not Found
```

**Debugging:**

```javascript
// Check App.jsx has route defined
// File should contain:
<Routes>
  <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
  // etc.
</Routes>

// Check PrivateRoute component checks auth correctly
// Should verify token exists in localStorage

// Verify page component exists
// Check: src/pages/DashboardPage.jsx exists

// Check React Router version (should be 6.x)
npm list react-router-dom
```

---

### Issue: Styling not loading (CSS issues)

**Symptoms:**
```
Page shows but no CSS styling applied
```

**Debugging:**

```javascript
// Check if Tailwind CSS is configured
// In vite.config.js or tailwind.config.js:
// - Tailwind should be installed: npm list tailwindcss
// - Config should reference src files: 'src/**/*.jsx'

// Check CSS imports
// In src/App.jsx or main.jsx:
import './index.css'

// Verify index.css has Tailwind directives:
@tailwind base;
@tailwind components;
@tailwind utilities;

// Clear cache and rebuild
npm run build
```

---

### Issue: Hot Module Replacement (HMR) not working

**Symptoms:**
```
Changes to code don't appear in browser
Have to manually refresh page
```

**Debugging:**

```javascript
// Check vite.config.js HMR configuration:
server: {
  hmr: {
    host: 'localhost',
    port: 5173,
    protocol: 'ws'
  }
}

// Verify Vite server is running
// Should see: "➜  Local:   http://localhost:5173"

// Check browser console for HMR messages
// Should see: "[vite] ✓ app.jsx updated in Xms"

// If not working:
// 1. Hard refresh: Ctrl+Shift+R
// 2. Restart Vite: Kill and run npm run dev again
// 3. Check firewall isn't blocking port 5173
```

---

### Issue: "Cannot find state for ..." error

**Symptoms:**
```
Error: Cannot find AuthContext or auth state
User context is undefined
```

**Debugging:**

```javascript
// Check AuthContext is provided at root level
// In App.jsx or main.jsx:
<AuthProvider>
  <Routes>
    {/* Routes here */}
  </Routes>
</AuthProvider>

// Check context file exists
// Verify: src/context/AuthContext.js exists

// Check useAuth hook is properly exported
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

// Verify components use correct hook
// Should be: const { user, login, logout } = useAuth()
// NOT: const { user } = useContext(AuthContext) // Direct access not recommended
```

---

## 🗄️ DATABASE ISSUES

### Issue: Duplicate user creation failures

**Error:**
```
E11000 duplicate key error collection: ai-learning-assistant.users index: email_1
```

**Cause:** User with that email already exists

**Fix:**

```javascript
// Delete duplicate user in MongoDB
use ai-learning-assistant
db.users.deleteOne({ email: "duplicate@example.com" })

// Or check if user exists first before signup
// Backend should already handle this, check authController.js

// If trying to seed again:
npm run seed
// This checks for existing user before creating
```

---

### Issue: Password not hashing properly

**Symptoms:**
```
Password stored in plain text in database
Or password comparison always fails
```

**Debugging:**

```javascript
// Check User model has password middleware
// In backend/models/User.js:
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  try {
    const salt = await bcryptjs.genSalt(10)
    this.password = await bcryptjs.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Check password comparison in authController.js
const isPasswordValid = await user.comparePassword(password)
// NOT: password === user.password (this would fail)

// Verify hashed password format
// In MongoDB shell:
db.users.findOne({ email: "test@example.com" })
// Password should look like: $2a$10$...

// If password is plain text:
// Delete user and re-register to trigger hashing
db.users.deleteOne({ email: "test@example.com" })
```

---

### Issue: Database slow or timing out

**Symptoms:**
```
MongooseError: operation ... timed out after 30000ms
```

**Debugging:**

```javascript
// Check MongoDB is running and responsive
mongo
db.serverStatus()

// Check network connection to MongoDB
// For MongoDB Atlas:
// - Ping cluster: ping cluster.mongodb.net
// - Check IP whitelisting in Atlas dashboard
// - Verify network access rules

// Check connection pool size
// In db.js:
const conn = mongoose.connect(uri, {
  maxPoolSize: 10,
  minPoolSize: 5,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
})

// Increase timeouts if needed:
connectTimeoutMS: 30000,  // 30 seconds
socketTimeoutMS: 60000    // 60 seconds

// Check for slow queries
// In MongoDB:
db.setProfilingLevel(1, { slowms: 100 })
db.system.profile.find().pretty()
```

---

## 🌐 NETWORK & PROXY ISSUES

### Issue: Proxy showing "Backend unreachable"

**Symptoms:**
```
Vite Proxy Error
Unable to connect to backend at http://localhost:5000
ECONNREFUSED
```

**Debugging:**

```bash
# 1. Verify backend is actually running
# Check for "✅ SERVER STARTED SUCCESSFULLY" in backend terminal

# 2. Test backend directly
curl http://localhost:5000/api/health

# 3. Test proxy path
curl http://localhost:5173/api/health
# Should return same result as backend (proxied)

# 4. Check vite.config.js proxy target
# Should be: target: 'http://localhost:5000'
# NOT: target: 'localhost:5000' (missing protocol)
# NOT: target: '127.0.0.1:5000' (firewall issue)

# 5. Check firewall allows localhost connections
# Should allow: 127.0.0.1:5000 and 0.0.0.0:5000

# 6. Try hardcoding IP instead of localhost
target: 'http://127.0.0.1:5000'
```

---

### Issue: CORS blocking requests (even with proxy)

**Symptoms:**
```
Access-Control-Allow-Origin header missing
CORS policy blocks request
```

**Debugging:**

```javascript
// Check CORS is enabled in server.js:
const cors = require('cors')
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))

// For production, don't use wildcard:
app.use(cors()) // BAD - too permissive

// Use specific origins:
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
}))

// Check headers are being sent
curl -i -X OPTIONS http://localhost:5000/api/auth/login
// Should see: Access-Control-Allow-Origin header

// Test in DevTools Network tab
// Right-click request → Response headers
// Should see: access-control-allow-origin: http://localhost:5173
```

---

### Issue: WebSocket errors

**Symptoms:**
```
WebSocket is closed before the connection is established
```

**Debugging:**

```javascript
// Check vite.config.js allows WebSocket
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      ws: true,  // Enable WebSocket
      changeOrigin: true
    }
  }
}

// Check firewall allows WebSocket connections
// WebSocket uses same port as HTTP

// Test WebSocket manually (if backend supports it):
// In browser console:
const ws = new WebSocket('ws://localhost:5000')
ws.onopen = () => console.log('Connected')
ws.onerror = (e) => console.log('Error:', e)
ws.onmessage = (e) => console.log('Message:', e.data)
```

---

## 🔐 AUTHENTICATION ISSUES

### Issue: "Invalid token" error on protected routes

**Symptoms:**
```
GET /api/auth/profile
❌ 401 Unauthorized
{"success": false, "message": "Invalid token"}
```

**Debugging:**

```javascript
// Check if token exists in request
// In browser console:
const token = localStorage.getItem('token')
console.log(token)
// Should return JWT token (long string starting with "eyJ")

// If no token, user needs to login again

// If token exists, check format in API calls
// In frontend/src/services/api.js:
interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Check token format in backend
// Token should be: Bearer eyJ...
// NOT: eyJ... (missing "Bearer " prefix)
// NOT: Bearer "eyJ..." (quoted)

// Test token validity manually:
TOKEN="eyJ..."
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/auth/profile

// Check JWT_SECRET in .env is same on frontend and backend
// Both should use same secret to verify tokens

// Check token expiration:
// In browser console:
const token = localStorage.getItem('token')
const decoded = JSON.parse(atob(token.split('.')[1]))
console.log(decoded)
// Check: exp field (expiration timestamp)
```

---

### Issue: Token not being stored in localStorage

**Symptoms:**
```
User logs in successfully but next page refresh shows logged out
localStorage.getItem('token') returns null
```

**Debugging:**

```javascript
// Check if login response includes token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"Test@1234"}'

// Response should include:
{
  "success": true,
  "token": "eyJ...",
  "user": {...}
}

// Check frontend stores token after login:
// In LoginPage.jsx or auth context:
localStorage.setItem('token', response.data.token)
localStorage.setItem('user', JSON.stringify(response.data.user))

// Check if localStorage is being cleared somewhere:
// Search for: localStorage.clear()
// Or: localStorage.removeItem('token')

// Check privateRoute component checks localStorage on mount:
useEffect(() => {
  const token = localStorage.getItem('token')
  if (!token) {
    navigate('/login')
  }
}, [])

// Test localStorage manually in console:
localStorage.setItem('test', 'value')
localStorage.getItem('test') // Should return 'value'

// If localStorage not working at all:
// Could be browser settings, incognito mode, or disabled JavaScript
// Check: Browser → Settings → Site Data
```

---

### Issue: "Invalid email or password" even with correct credentials

**Symptoms:**
```
POST /api/auth/login
❌ 401 Unauthorized
{"success": false, "message": "Invalid email or password"}
```

**Debugging:**

```bash
# 1. Verify user exists in database
# In MongoDB shell:
use ai-learning-assistant
db.users.findOne({ email: "testuser@example.com" })

# 2. If user doesn't exist, create with seed
npm run seed

# 3. If user exists, check password hashing
db.users.findOne({ email: "testuser@example.com" }).password
# Should look like: $2a$10$...

# 4. Check bcryptjs is comparing passwords correctly
# In authController.js:
const isPasswordValid = await user.comparePassword(password)

# 5. Test password comparison manually:
# Install bcryptjs in separate file:
const bcrypt = require('bcryptjs')
const hashedPassword = "$2a$10$..."  // From database
bcrypt.compare("Test@1234", hashedPassword, (err, result) => {
  console.log(result) // Should be true
})

# 6. Check for whitespace in password
# Password field might have spaces: " Test@1234 "
# Trim before comparing in backend:
password = password.trim()

# 7. Check email is case-insensitive query
# Query should use .toLowerCase():
user = User.findOne({ email: email.toLowerCase() })
```

---

## ⚡ PERFORMANCE ISSUES

### Issue: Slow API responses

**Symptoms:**
```
API requests taking 5+ seconds
Network tab shows long wait times
```

**Debugging:**

```javascript
// Check backend is not doing heavy work
// Add timing logging in server.js:
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    const duration = Date.now() - start
    console.log(`${req.method} ${req.path} - ${duration}ms`)
  })
  next()
})

// Check MongoDB query performance
// Enable MongoDB query logging:
mongoose.set('debug', true)

// Check for N+1 queries (fetching related data multiple times)
// Use .populate() to fetch related documents in one query

// Check HTTP requests waterfall in DevTools
// Network tab → select request → Timing
// Look for: DNS Lookup, TCP Connection, TLS, Request, Wait, Response

// Check backend console for errors or warnings
// Error logs usually indicate slowness

// Check MongoDB connection pool
// Ensure adequate connections in db.js:
maxPoolSize: 10
```

---

### Issue: Frontend freezes during login

**Symptoms:**
```
Click login button
Page becomes unresponsive
Loading spinner never goes away
```

**Debugging:**

```javascript
// Check if API call is actually being made
// DevTools → Network tab
// Should see POST /api/auth/login request

// If no request, check form validation:
// Make sure password field isn't blocked by validation

// Check if backend is responding
// In terminal: curl -X POST http://localhost:5000/api/auth/login ...
// Does it respond quickly?

// Check for infinite loops in frontend
// Search for: while(true), recursive calls without exit condition

// Check loading state management
// In LoginPage:
const [isLoading, setIsLoading] = useState(false)
// setIsLoading should be set to false after request completes

// Add console.log to track execution:
console.log('Login clicked')
console.log('Sending request...')
// Check if these appear in console

// Check for uncaught promise rejections:
fetch('/api/auth/login')
  .then(r => r.json())
  .then(data => {
    console.log('Response:', data)
    // Make sure to update state here
  })
  .catch(err => {
    console.error('Error:', err)
    // Make sure to handle error
  })
```

---

## 🛠️ DEVELOPMENT ENVIRONMENT ISSUES

### Issue: Dependencies conflicting

**Symptoms:**
```
npm ERR! peer dep missing: react@18
or
npm ERR! package-lock.json is incorrect
```

**Debugging:**

```bash
# 1. Check Node and npm versions
node --version    # Should be 14+
npm --version     # Should be 6+

# 2. Delete lock files and reinstall
rm -r node_modules
rm package-lock.json
npm cache clean --force
npm install

# 3. Check for conflicting packages
npm ls          # Lists all dependencies and conflicts (marked with red)

# 4. Update npm itself
npm install -g npm@latest

# 5. Force specific versions if needed
npm install package@version
```

---

### Issue: TypeScript errors (if using TS)

**Symptoms:**
```
Type 'any' is not assignable to type 'string'
Cannot find name 'React'
```

**Debugging:**

```bash
# 1. Check tsconfig.json exists and is valid
cat tsconfig.json

# 2. Install TypeScript globally
npm install -g typescript

# 3. Type check project
npx tsc --noEmit

# 4. Check if @types packages are installed
npm list @types/node
npm list @types/react

# 5. Install missing @types:
npm install --save-dev @types/react @types/react-dom @types/node
```

---

### Issue: "nodemon: command not found"

**Symptoms:**
```
npm ERR! code ENOENT
ERR! spawn nodemon ENOENT
```

**Fix:**

```bash
# 1. Install nodemon globally
npm install -g nodemon

# 2. Or install locally in project
cd backend
npm install --save-dev nodemon

# 3. Update package.json scripts:
"dev": "nodemon server.js"

# 4. Make sure package.json is in backend folder and has script
```

---

## 🚨 EMERGENCY RECOVERY

### Complete System Reset

```bash
# Kill all processes
taskkill /F /IM node.exe

# Clear everything
cd ai-learning-assistant/backend
rm -r node_modules package-lock.json
cd ../frontend
rm -r node_modules package-lock.json

# Reinstall everything
cd backend
npm install
cd ../frontend
npm install

# Clear MongoDB if needed (WARNING: data loss)
mongo
# In mongo shell:
db.dropDatabase()
exit

# Start fresh
cd backend
npm run seed    # Create test user
npm run dev

# In new terminal:
cd frontend
npm run dev

# Browser: http://localhost:5173
```

---

## 📞 STILL NOT WORKING?

### Gather Diagnostic Information

1. **Browser DevTools** (F12):
   - Console tab: Copy all errors
   - Network tab: Screenshot of failed request
   - Application tab: Show localStorage contents

2. **Backend Console**:
   - Copy last 50 lines of output
   - Any error messages with stack trace

3. **System Info**:
   - `node --version`
   - `npm --version`
   - `mongo --version`

4. **Environment**:
   - Show contents of `backend/.env`
   - Show contents of `frontend/.env`

5. **Reproduction Steps**:
   - Write exact steps that cause the issue
   - Try to reproduce on fresh system

---

**Last Updated**: February 13, 2026  
**Status**: Comprehensive Debugging Guide

