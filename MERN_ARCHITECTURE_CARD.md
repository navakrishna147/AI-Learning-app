# 🏗️ Production MERN Architecture - Quick Reference Card

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     PRODUCTION DEPLOYMENT                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐             ┌──────────────────┐          │
│  │   Frontend SPA   │  HTTPS      │  Backend API     │  HTTPS  │
│  │  (Vite React)   ├──────────────┤  (Express.js)    ├─────────┤─┐
│  │ :5173 (dev)     │  Proxy:/api  │  :5000 (prod)    │         │ │
│  │ yourdomain.com  │              │  yourdomain.com  │         │ │
│  └──────────────────┘             └──────────────────┘         │ │
│                                     │                          │ │
│                                     ▼                          │ │
│                            ┌──────────────────┐               │ │
│                            │ MongoDB Database │               │ │
│                            │ (Atlas Cloud)    │               │ │
│                            │ production DB    │               │ │
│                            └──────────────────┘               │ │
│                                                                 │ │
│                     Groq AI Service (External)                │ │
│                     API calls for chat features                │ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

LOCAL DEVELOPMENT:
┌──────────────────┐         ┌──────────────────┐
│  Frontend        │ Proxy   │  Backend         │
│  localhost:5173  ├────────►│  localhost:5000  │
│  (Vite server)   │  /api   │  (Node/Express)  │
└──────────────────┘         └─────────┬────────┘
                                       │
                            ┌──────────▼────────┐
                            │  MongoDB Local    │
                            │  localhost:27017  │
                            └───────────────────┘
```

---

## 🚀 Startup Sequence (What Happens)

### Backend Startup (from `server.js` → `bootstrap.js`)
```
server.js loaded
  ↓
env.js imported (loads .env)
  ↓
Process error handlers registered:
  • process.on('unhandledRejection')
  • process.on('uncaughtException')
  • process.on('SIGTERM')
  • process.on('SIGINT')
  ↓
bootstrap() function called
  ↓
  1. Environment validation (all vars checked)
  2. Filesystem initialized (uploads dir created)
  3. MongoDB connected (BLOCKING - wait for DB)
  4. Express app created with CORS/middleware
  5. Routes registered
  6. Error handlers registered
  7. HTTP server started on :5000
  8. Port binding VERIFIED
  ↓
✅ "APPLICATION STARTED SUCCESSFULLY"
```

### Frontend Startup (Vite dev server)
```
npm run dev
  ↓
Vite loads vite.config.js
  ↓
API proxy configured:
  /api/* → http://127.0.0.1:5000
  ↓
Frontend server starts on :5173
  ↓
React loads, api.js initializes
  ↓
Health check manager starts:
  • Periodically checks /api/health
  • Uses exponential backoff on failure
  ↓
✅ Frontend ready at http://localhost:5173
```

---

## 📝 Environment Variables Cheat Sheet

### Backend Required Variables

| Variable | Example | Purpose |
|----------|---------|---------|
| `NODE_ENV` | `development` | App mode |
| `PORT` | `5000` | Server port |
| `MONGODB_URI` | `mongodb://localhost:27017/...` | Database URL |
| `JWT_SECRET` | `abc123...` (32+ chars) | Token signing |

### Backend Optional (Recommended)

| Variable | Example | Purpose |
|----------|---------|---------|
| `CLIENT_URL` | `https://yourdomain.com` | Frontend CORS |
| `GROQ_API_KEY` | `gsk_...` | AI service |
| `CORS_ORIGINS` | `http://localhost:5173,...` | Allowed origins |
| `EMAIL_USER` | `noreply@example.com` | Email service |

### Frontend Variables

| Variable | Example | Purpose |
|----------|---------|---------|
| `VITE_API_URL` | `/api` (dev) | API endpoint |
| `VITE_BACKEND_URL` | `http://127.0.0.1:5000` | Fallback URL |
| `VITE_API_TIMEOUT` | `60000` | Request timeout ms |

---

## 🔧 Common Operations

### Start Everything (Local Dev)

```bash
# Terminal 1: MongoDB (if local)
mongod --dbpath "C:\data\db"

# Terminal 2: Backend
cd backend
npm run dev

# Terminal 3: Frontend
cd frontend
npm run dev

# Browser
http://localhost:5173/login
```

### Check Backend Health

```bash
# Ultra-lightweight (server alive check)
curl http://localhost:5000/health

# With database status
curl http://localhost:5000/api/health

# Full diagnostics  
curl http://localhost:5000/api/health/detailed
```

### Kill Process on Port

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID 12345 /F

# Mac/Linux
lsof -i :5000
kill -9 12345
```

### Install Dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

### Build for Production

```bash
# Backend (copy files, no build needed)
cd backend && npm install --production

# Frontend (creates dist/ folder)
cd frontend && npm run build
```

---

## 🐛 Error Quick Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `ECONNREFUSED` | Backend not running | `cd backend && npm run dev` |
| `Port 5000 in use` | Another process using port | `taskkill /PID <pid> /F` or change PORT |
| `"Cannot connect to database"` | MongoDB not running | Start MongoDB or use MongoDB Atlas |
| `Backend unreachable` | Proxy can't reach backend | Check backend is on port 5000 |
| `CORS error` | Wrong origin in CORS_ORIGINS | Update backend/.env CLIENT_URL |
| `JWT_SECRET too short` | Security requirement | Use 32+ character string |
| `Missing MONGODB_URI` | No database configured | Set MONGODB_URI in .env |

---

## ✅ Pre-Startup Checklist

- [ ] Backend `.env` file exists and filled
- [ ] Frontend `.env` file exists (or will use defaults)
- [ ] MongoDB running (local or Atlas accessible)
- [ ] Port 5000 available
- [ ] Port 5173 available
- [ ] `npm install` completed in both folders
- [ ] Run `node verify-startup.js`

---

## 📊 Health Check Response Examples

### `/health` (Ultra-lightweight)
```json
{
  "status": "OK",
  "service": "alive",
  "timestamp": "2026-02-14T10:30:00.000Z",
  "uptime": 12345
}
```

### `/api/health` (Quick check)
```json
{
  "status": "healthy",
  "service": "running",
  "database": {
    "connected": true,
    "state": "connected",
    "responsive": true
  },
  "timestamp": "2026-02-14T10:30:00.000Z",
  "uptime": 12345
}
```

### `/api/health/detailed` (Full diagnostics)
```json
{
  "status": "healthy",
  "database": {
    "connected": true,
    "responsive": true,
    "state": "connected",
    "host": "localhost:27017"
  },
  "groq": {
    "configured": true,
    "key_length": 60
  },
  "server": {
    "uptime": 12345,
    "memory": {
      "rss": 150,
      "heapUsed": 100,
      "heapTotal": 200
    }
  }
}
```

---

## 🌐 Deployment URLs by Platform

| Platform | Backend | Frontend |
|----------|---------|----------|
| **Local Dev** | `http://localhost:5000` | `http://localhost:5173` |
| **Heroku** | `https://app-backend.herokuapp.com` | `https://app-frontend.herokuapp.com` |
| **Docker** | `http://backend:5000` | `http://frontend:80` |
| **Custom Domain** | `https://api.yourdomain.com` | `https://yourdomain.com` |

---

## 📚 Files Modified/Created

### Backend Configuration
- ✅ `config/environment.js` - Enhanced with CLIENT_URL support
- ✅ `config/bootstrap.js` - Enhanced port verification
- ✅ `.env.local-example` - Local dev template
- ✅ `.env.production-example` - Production template

### Frontend Configuration
- ✅ `vite.config.js` - Enhanced proxy with detailed errors
- ✅ `.env.local-example` - Local dev template
- ✅ `.env.production-example` - Production template

### Documentation
- ✅ `PRODUCTION_HARDENING_COMPLETE.md` - Full guide
- ✅ `PRODUCTION_MERN_ARCHITECTURE_CARD.md` - This file
- ✅ `verify-startup.js` - Startup verification script

---

## 🎯 Next Steps After Setup

1. **Local Testing**
   - Run `verify-startup.js` to check setup
   - Start backend and frontend
   - Test login and features
   - Verify no console errors

2. **Production Preparation**
   - Create production `.env` files with real secrets
   - Set up MongoDB Atlas or production database
   - Update `CLIENT_URL` to frontend domain
   - Build frontend: `npm run build`

3. **Deployment**
   - Choose platform (Heroku, Railway, VPS, Docker, etc.)
   - Deploy backend with environment secrets
   - Deploy frontend with correct API URLs
   - Test production URLs
   - Monitor health endpoints

4. **Ongoing**
   - Monitor `/api/health` regularly
   - Check logs for errors
   - Keep dependencies updated
   - Rotate secrets periodically

---

## 📞 Getting Help

If something isn't working:

1. Check the **Troubleshooting** section in `PRODUCTION_HARDENING_COMPLETE.md`
2. Run `verify-startup.js` to check configuration
3. Check backend logs: `npm run dev` output
4. Check frontend logs: Browser console (F12)
5. Test health endpoints directly in browser
6. Check all `.env` variables are set correctly
7. Verify MongoDB is running and accessible

---

**Status:** 🚀 **PRODUCTION READY**

*Your MERN stack has been hardened with enterprise-grade reliability.*
