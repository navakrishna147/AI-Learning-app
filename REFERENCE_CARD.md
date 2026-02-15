# 📎 REFERENCE CARD

**Quick reference for common setups, commands, and file locations.**

---

## 🚀 STARTUP COMMANDS

### Windows (Using Batch Files)
```batch
Backend:  backend\START_BACKEND.bat
Frontend: frontend\START_FRONTEND.bat
Seed:     cd backend && npm run seed
```

### Windows (Using Terminal)
```powershell
# Terminal 1 - Backend
cd backend
npm install  # First time only
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install  # First time only
npm run dev
```

### macOS/Linux
```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

---

## 📁 KEY FILES & LOCATIONS

### Backend
```
backend/
├── server.js                    # Main Express app (297 lines)
├── package.json                 # Dependencies + "seed" script
├── .env                        # Configuration (PORT, DB, JWT)
├── models/
│   └── User.js                 # User schema with password hashing
├── controllers/
│   └── authController.js       # Login, signup, profile endpoints
├── routes/
│   └── auth.js                 # /api/auth routes
├── config/
│   └── db.js                   # MongoDB connection + retry logic
├── scripts/
│   └── seedDatabase.js         # Create test user (NEW)
└── START_BACKEND.bat           # Windows startup script (NEW)
```

### Frontend
```
frontend/
├── vite.config.js              # Vite config + /api proxy
├── .env                        # Configuration (API_URL, TIMEOUT)
├── src/
│   ├── App.jsx                 # Routes + auth guards
│   ├── services/
│   │   └── api.js              # Axios config + health checks
│   ├── pages/
│   │   ├── LoginPage.jsx       # Login form
│   │   ├── SignupPage.jsx      # Signup form
│   │   └── DashboardPage.jsx   # Protected dashboard (home)
│   └── context/
│       └── AuthContext.js      # Global auth state
└── START_FRONTEND.bat          # Windows startup script (NEW)
```

---

## 🔧 ENVIRONMENT VARIABLES

### Backend (.env)
```dotenv
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ai-learning-assistant
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```dotenv
VITE_API_URL=/api
VITE_API_TIMEOUT=30000
VITE_BACKEND_URL=http://localhost:5000
```

---

## 🌐 URLs & PORTS

| Service | URL | Port | Notes |
|---------|-----|------|-------|
| Frontend | http://localhost:5173 | 5173 | React app |
| Backend | http://localhost:5000 | 5000 | Express API |
| Proxy | http://localhost:5173/api | →5000 | Vite proxy |
| Health Check | http://localhost:5000/api/health | 5000 | Backend status |
| MongoDB | mongodb://localhost:27017 | 27017 | Database |

---

## 🔑 TEST USER CREDENTIALS

```
Email:    testuser@example.com
Password: Test@1234
```

**Create test user:** `npm run seed` (in backend folder)

---

## 📋 API ENDPOINTS

### Authentication
```
POST   /api/auth/signup         # Register new user
POST   /api/auth/login          # Login with email/password
GET    /api/auth/profile        # Get current user (protected)
POST   /api/auth/verify-token   # Verify JWT token (protected)
POST   /api/auth/logout         # Logout user (protected)
POST   /api/auth/forgot-password # Start password reset
```

### Health Check
```
GET    /api/health              # Backend health status
GET    /health                  # Root health check
```

---

## 🧪 QUICK API TESTS

### Test Backend
```bash
curl http://localhost:5000/api/health
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"Test@1234"}'
```

### Test Protected Route
```bash
TOKEN="eyJ..."  # from login response
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/auth/profile
```

---

## ❌ COMMON ERRORS & FIXES

| Error | Cause | Fix |
|-------|-------|-----|
| ECONNREFUSED | Backend not running | `npm run dev` in backend folder |
| Port 5000 in use | Another app using port | `taskkill /pid` or change PORT in .env |
| MongoDB connection failed | MongoDB not running | Start mongod or MongoDB service |
| "No token provided" | Missing authorization header | Login first, use returned token |
| Blank page on login | Frontend/Backend mismatch | Check console, restart both servers |
| CORS error | Backend blocking frontend | Check Vite proxy config |

---

## 🔐 AUTHENTICATION FLOW

```
1. User enters email/password on login page
              ↓
2. Frontend sends POST /api/auth/login
              ↓
3. Backend validates password with bcryptjs
              ↓
4. Backend returns JWT token & user data
              ↓
5. Frontend stores token in localStorage
              ↓
6. Frontend adds "Authorization: Bearer {token}" to all requests
              ↓
7. Backend middleware verifies token on protected routes
              ↓
8. Request granted or denied (401 Unauthorized)
```

---

## 📊 ARCHITECTURE AT A GLANCE

```
┌─ Browser (http://localhost:5173)
│   └─ React App (Login, Dashboard, etc.)
│       └─ Vite Dev Server (Port 5173)
│           └─ Proxy: /api → http://localhost:5000
│               └─ Express API (Port 5000)
│                   └─ MongoDB (localhost:27017)
```

---

## npm SCRIPTS

### Backend
```bash
npm install              # Install dependencies
npm run dev              # Start with nodemon (watch mode)
npm run seed            # Create test user in database
npm run build           # Build for production
npm start               # Start production server
```

### Frontend
```bash
npm install              # Install dependencies
npm run dev              # Start Vite dev server
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint            # Check code quality
```

---

## 🛠️ DATABASE OPERATIONS

### MongoDB Shell
```javascript
// Connect
mongo

// Select database
use ai-learning-assistant

// View users
db.users.find()

// View one user
db.users.findOne({ email: "testuser@example.com" })

// Delete test data
db.users.deleteOne({ email: "testuser@example.com" })

// Check password is hashed
db.users.findOne({ email: "testuser@example.com" }).password
// Should look like: $2a$10$...

// Count users
db.users.countDocuments()
```

---

## 🔐 PASSWORD HASHING

All passwords are hashed with **bcryptjs** before storage:

```javascript
// Generation (11 salt rounds)
bcryptjs.genSalt(10) → bcryptjs.hash(password)

// Verification
bcryptjs.compare(plainText, hashedPassword)

// Result stored in DB
$2a$10$KsK6Hl1EG8QxD4x8qXfUEuRgfDQqNWJBZpZwH1B0eK2Kw8S6iGRFC
```

✅ Use `bcryptjs.compare()` - never plain text comparison

---

## 📈 PERFORMANCE NOTES

- **Health Check Retry**: Exponential backoff (1s → 30s max)
- **Password Hashing**: 10 salt rounds (secure, ~100ms per hash)
- **Database Connection**: Retry with exponential backoff (3s, 6s, 9s)
- **Frontend Dev Server**: Hot Module Replacement (HMR) enabled
- **Backend Dev Server**: Nodemon watches for changes

---

## ✅ VERIFICATION CHECKLIST

- [ ] Backend runs without errors: `npm run dev`
- [ ] Frontend runs without errors: `npm run dev`
- [ ] MongoDB connected: Check backend logs
- [ ] Health check responds: `curl http://localhost:5000/api/health`
- [ ] Proxy working: `curl http://localhost:5173/api/health`
- [ ] Test user created: `npm run seed`
- [ ] Login works: Log in with testuser@example.com / Test@1234
- [ ] Dashboard accessible: Redirected after login
- [ ] No console errors: F12 → Console
- [ ] Token in localStorage: F12 → Application → localStorage

---

## 📚 DOCUMENTATION FILES

| File | Purpose |
|------|---------|
| QUICK_START_5_MINUTES.md | Fast setup guide |
| COMPLETE_SETUP_VERIFICATION.md | Full detailed setup |
| API_TESTING_GUIDE.md | Testing all endpoints |
| REFERENCE_CARD.md | This file - quick reference |

---

## 🚨 EMERGENCY TROUBLESHOOTING

### Everything Broken?

```bash
# 1. Kill all node processes
taskkill /F /IM node.exe

# 2. Clear npm cache
npm cache clean --force

# 3. Delete node_modules
rm -r backend/node_modules frontend/node_modules

# 4. Reinstall
cd backend && npm install && cd ../frontend && npm install

# 5. Start fresh
cd ../backend && npm run dev
# In new terminal:
cd frontend && npm run dev

# 6. Seed database
cd backend && npm run seed
```

---

## 💡 TIPS & TRICKS

1. **Keep TWO Terminals Open**: One for backend, one for frontend
2. **Use Batch Files**: `START_BACKEND.bat` and `START_FRONTEND.bat`
3. **Browser DevTools**: F12 → Console & Network tabs for debugging
4. **Check Backend Logs**: Output shows all API calls being made
5. **MongoDB Verification**: `db.users.find()` to check data
6. **Token Inspection**: Copy token in localStorage, paste in jwt.io
7. **Clear Cache**: Ctrl+Shift+Delete if seeing old data
8. **Hard Refresh**: Ctrl+Shift+R if frontend not updating
9. **Port Conflicts**: Use `netstat -ano | findstr :PORT` to find processes
10. **Email Testing**: Check backend logs for password reset links

---

## 📞 SUPPORT

See full documentation in:
- **COMPLETE_SETUP_VERIFICATION.md** - Complete step-by-step guide
- **API_TESTING_GUIDE.md** - Testing all endpoints with curl
- **QUICK_START_5_MINUTES.md** - Ultra-fast startup

---

**Version**: 1.0  
**Last Updated**: February 13, 2026  
**Status**: ✅ Production Ready

