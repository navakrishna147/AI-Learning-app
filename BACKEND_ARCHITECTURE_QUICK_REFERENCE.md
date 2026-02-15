**BACKEND ARCHITECTURE - QUICK REFERENCE**

## System Overview

```
User Request
    ↓
server.js (23 lines - entry point)
    ↓
bootstrap.js (orchestration)
    ├─ Phase 1: Filesystem ✅
    ├─ Phase 2: Environment ✅
    ├─ Phase 3: Database (BLOCKING) ✅
    ├─ Phase 4: Express + Middleware ✅
    ├─ Phase 5: Routes ✅
    ├─ Phase 6: Error Handlers ✅
    └─ Phase 7: HTTP Server START ✅
    ↓
[Request Processing]
    ├─ CORS middleware → cors.js
    ├─ Body parsing → express.json, express.urlencoded
    ├─ Morgan logging → request logging
    ├─ Authentication → middleware/auth.js
    ├─ Route handler → One of 7 route files
    └─ Response → errorHandling.js (if error)
```

## Module Responsibilities

| Module | Purpose | Lines | Status |
|--------|---------|-------|--------|
| `server.js` | Entry point | 23 | ✅ |
| `bootstrap.js` | Orchestration | 280 | ✅ |
| `environment.js` | Validation | 150 | ✅ |
| `middleware.js` | Middleware setup | 60 | ✅ |
| `routes.js` | Route registration | 85 | ✅ |
| `errorHandling.js` | Error handlers | 120 | ✅ |
| `healthService.js` | Health checks | 120 | ✅ |
| `db.js` | DB connection | 94 | ✅ |
| `env.js` | dotenv loader | 8 | ✅ |

## Request Flow

```
1. Client sends request to http://localhost:5000/api/route
2. Express receives request
3. CORS middleware checks origin
4. Body parsing middleware reads JSON
5. Request logging middleware logs
6. Route handler processes request
7. Response sent back to client
8. If error: errorHandling.js catches it
```

## Critical Files for Each Task

### Adding a New Route
**Edit:** `backend/routes/*.js`
- No changes needed to server.js or bootstrap.js
- Route auto-loads in phase 5

### Adding a New Middleware
**Edit:** `backend/config/middleware.js` setupMiddleware()
- Add in correct order (CORS first!)
- Reload backend only

### Handling a New Error Type
**Edit:** `backend/config/errorHandling.js`
- Add handler before global handler
- App continues to work while reloading

### Changing Environment Variables
**Edit:** `backend/config/environment.js` envSchema
- Add validation rules
- Backend will fail at startup if missing

### Checking System Health
**Endpoint:** `GET /api/health/detailed`
- Database status
- Memory usage
- Server uptime
- AI service status

## Startup Phases Explained

### Phase 1: Filesystem
- Creates `/uploads` directory if missing
- Needed for file uploads

### Phase 2: Environment Validation
- Checks all environment variables
- Validates format, length, values
- Fails if critical variables missing

### Phase 3: Database Connection (BLOCKING)
- Connects to MongoDB
- **Waits** until connected or fails
- Critical: Routes won't load until DB ready
- Production: Fails if cannot connect

### Phase 4: Express Initialization
- Creates Express app
- Applies all middleware in order:
  1. Helmet (security headers)
  2. Body parsing
  3. Logging
  4. Static files
  5. Request tracking

### Phase 5: Route Registration
- Registers all 7 API routes
- Adds health endpoints
- Adds 404 handler

### Phase 6: Error Handling
- **MUST BE LAST** (after routes)
- Catches unhandled errors
- Provides consistent error responses

### Phase 7: HTTP Server Startup
- Listens on configured PORT
- Shows startup summary
- Ready for requests

## Error Handling Chain

```
Request Error occurs
    ↓
errorHandling.js checks error type:
    ├─ Type: Validation? → 400
    ├─ Type: Auth? → 401
    ├─ Type: Database? → 503
    ├─ Type: Upload? → 413
    ├─ Type: External Service? → 503
    └─ Type: Unknown? → 500
    ↓
Error logged with ID: ERR_<timestamp>_<random>
    ↓
Response sent: {error, message, errorId, stack (dev only)}
```

## Health Check Endpoints

```
GET /health
→ {status: "ok", uptime: 123, timestamp: "2024-..."}

GET /api/health
→ {status: "healthy", database: "connected", environment: "development"}

GET /api/health/detailed
→ {
    status: "healthy",
    database: {
      connected: true,
      responsive: true,
      checkTime: 45,
      host: "localhost:27017"
    },
    environment: {node_env: "development", port: 5000},
    groq: {configured: true, key_length: 50},
    server: {uptime: 3600, memory: {...}},
    timestamp: "2024-...",
    checkDuration: "45ms"
  }
```

## Environment Variables

### Required
- `MONGODB_URI` → MongoDB connection string
- `JWT_SECRET` → Min 32 characters for token signing
- `GROQ_API_KEY` → AI service authentication

### Optional (with defaults)
- `NODE_ENV` → development | staging | production (default: development)
- `PORT` → Server port (default: 5000)
- `CORS_ORIGINS` → Comma-separated CORS list (default: localhost:5173,5174)
- `FRONTEND_URL` → Frontend URL (default: http://localhost:5173)
- `EMAIL_USER` → Gmail for password reset
- `EMAIL_PASSWORD` → Gmail app password

## Fixed Issues

| Issue | Root Cause | Solution | Status |
|-------|------------|----------|--------|
| ECONNREFUSED | No blocking | Phase 3 blocks startup | ✅ |
| Backend unreachable | Server starts before DB | Phase 3 waits for DB | ✅ |
| AI not available | No validation | environment.js validates | ✅ |
| Auth bypassed | Middleware order wrong | middleware.js explicit order | ✅ |
| DB not ready | Async but not awaited | Phase 3 await blocking | ✅ |
| Port conflicts | No error handling | bootstrap.js handles EADDRINUSE | ✅ |

## Configuration Hierarchy

```
1. Environment variables (.env file)
   ↓
2. environment.js (validation + defaults)
   ↓
3. bootstrap.js (uses validated config)
   ↓
4. Modules access validated config
```

**Key:** No module should directly access `process.env` - use validated config from environment.js

## Testing Quick Commands

```bash
# Start server
npm run dev

# Health check
curl http://localhost:5000/health

# Detailed health
curl http://localhost:5000/api/health/detailed

# Protected route (should fail)
curl http://localhost:5000/api/documents

# Health check while request processing
curl http://localhost:5000/api/health/detailed
```

## Performance Indicators

| Metric | Good | Warning | Critical |
|--------|------|---------|----------|
| Phase 3 time | < 500ms | 500-2000ms | > 2000ms |
| Startup time | < 2s | 2-5s | > 5s |
| Health check | < 100ms | 100-500ms | > 500ms |
| Memory usage | < 100MB | 100-300MB | > 300MB |

## Deployment Checklist

- [ ] .env contains all required variables
- [ ] MongoDB is accessible
- [ ] Port 5000 is available
- [ ] CORS_ORIGINS configured for production
- [ ] NODE_ENV=production
- [ ] Health endpoints respond correctly
- [ ] Protected routes require auth
- [ ] SIGTERM/SIGINT shutdown works

## Architecture Changes Summary

**Before:** 377-line server.js with mixed concerns
**After:** 23-line server.js + 7 focused modules

**Benefits:**
- ✅ Clear separation of concerns
- ✅ Phase-based blocking startup
- ✅ Testable architecture
- ✅ Easy to extend
- ✅ Production-grade error handling
- ✅ Health monitoring
- ✅ Graceful shutdown

## Extending the System

### Add New Middleware
1. Edit `backend/middleware/yourMiddleware.js`
2. Edit `backend/config/middleware.js` setupMiddleware()
3. Add: `app.use(yourMiddleware())`
4. Restart backend

### Add New Route
1. Create `backend/routes/yourRoute.js`
2. Edit `backend/config/routes.js`
3. Add: `app.use('/api/yourRoute', yourRouteImport)`
4. Restart backend

### Add New Health Check
1. Edit `backend/services/healthService.js` checkHealthStatus()
2. Add new metrics to return object
3. Frontend reads from `/api/health/detailed`

### Change Validation Rules
1. Edit `backend/config/environment.js` envSchema
2. Add validation rules for new variables
3. Restart backend (fails if validation fails)

## Emergency Actions

**Port in use?**
```bash
netstat -ano | findstr :5000
taskkill /PID <pid> /F
```

**Database not responding?**
```bash
# Start MongoDB
mongod
# Or update MONGODB_URI in .env
```

**Module not found?**
```bash
# Check file exists
ls -la backend/config/
# Check import path in bootstrap.js
```

**Environment validation failed?**
```bash
# Check .env file
cat .env
# Verify required variables
# Restart backend
npm run dev
```

## File Size Summary

| File | Size | Complexity |
|------|------|-----------|
| server.js | 23 lines | ⭐ Simple |
| bootstrap.js | 280 lines | ⭐⭐⭐ Complex |
| environment.js | 150 lines | ⭐⭐ Medium |
| middleware.js | 60 lines | ⭐ Simple |
| routes.js | 85 lines | ⭐ Simple |
| errorHandling.js | 120 lines | ⭐⭐ Medium |
| healthService.js | 120 lines | ⭐⭐ Medium |

**Total New Code:** ~815 lines (replacing 377-line server.js)
**Quality:** Production-grade
**Status:** ✅ Ready for deployment

## Quick Links

- [Complete Documentation](./BACKEND_PRODUCTION_REFACTORING_COMPLETE.md)
- [Testing Guide](./BACKEND_TESTING_NEXTSTEPS.md)
- [API Testing](./API_TESTING_GUIDE.md)
- [Environment Setup](./ENVIRONMENT_SETUP.md)

---

**Architecture Status:** ✅ PRODUCTION-GRADE
**All Issues:** ✅ RESOLVED
**Ready for:** Deployment, Scaling, Monitoring
