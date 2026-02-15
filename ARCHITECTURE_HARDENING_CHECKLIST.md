# Architecture Hardening — Startup & Deployment Checklist

## Startup Verification (run after every env change)

| # | Check | Command / Action |
|---|-------|-----------------|
| 1 | MongoDB is running | `mongosh` → should connect |
| 2 | Backend `.env` exists with **all 4 required** vars | `PORT`, `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL` |
| 3 | Backend starts without errors | `cd backend && npm run dev` |
| 4 | Health endpoint responds | `curl http://localhost:5000/health` → `{ "status": "ok", ... }` |
| 5 | API health with DB check | `curl http://localhost:5000/api/health` → 200 |
| 6 | Frontend `.env` exists | `VITE_API_URL=/api`, `VITE_BACKEND_URL=http://127.0.0.1:5000` |
| 7 | Frontend starts on port 5173 | `cd frontend && npm run dev` |
| 8 | Proxy works | Browser → `http://localhost:5173/api/health` → 200 |
| 9 | Login page loads | No "Backend unreachable" banner |
| 10 | Login succeeds | Valid credentials → redirected to `/dashboard` |

---

## Deployment Checklist

### Local Development
```
backend/.env          →  PORT=5000, CLIENT_URL=http://localhost:5173
frontend/.env         →  VITE_API_URL=/api, VITE_BACKEND_URL=http://127.0.0.1:5000
```

### Docker
```
backend/.env          →  PORT=5000, CLIENT_URL=http://frontend:5173 (or external domain)
frontend/.env         →  VITE_API_URL=/api, VITE_BACKEND_URL=http://backend:5000
docker-compose.yml    →  Ensure backend starts AFTER mongo (depends_on)
```

### Reverse Proxy (Nginx)
```
backend/.env          →  PORT=5000, CLIENT_URL=https://app.example.com
frontend/.env (build) →  VITE_API_URL=https://api.example.com/api
Nginx config          →  proxy_pass http://127.0.0.1:5000 for /api/*
```

### Custom Domain
```
backend/.env          →  CLIENT_URL=https://app.yourdomain.com
                         CORS_ORIGINS=https://app.yourdomain.com
frontend/.env (build) →  VITE_API_URL=https://api.yourdomain.com/api
DNS                   →  A records for api.yourdomain.com → server IP
```

---

## How This Prevents ECONNREFUSED Permanently

### Root Causes Eliminated

| Problem | Old Behavior | New Behavior |
|---------|-------------|--------------|
| Missing env vars | Silent undefined → crash later | **Fail-fast at startup** with clear message listing every missing var |
| MongoDB down | Dev mode started without DB → every API call fails | **Server refuses to start** until DB connects (5 retries) |
| Port conflict | Silent fallback to random port | **Strict port binding** — fails immediately if port taken |
| Duplicate process handlers | 3 separate places registered SIGTERM/uncaughtException | **Exactly one set** in server.js |
| Frontend hardcoded URLs | `localhost:5000` scattered across files | **All URLs from env** — Vite proxy for dev, env var for prod |
| Health endpoint inconsistency | Different JSON shapes across endpoints | **Stable contract**: `{ status: "ok", uptime, timestamp }` |
| Infinite retry loops | Frontend retried forever if backend truly offline | **Exponential backoff** capped at 30s, stops after pattern |
| `require('os')` in ESM | healthService.js crashed in ESM context | Fixed: proper `import os from 'os'` |
| Environment validated twice | environment.js ran validation at import + bootstrap called it again | **Single validation** in env.js at import time |
| Dev mode "limited mode" | Backend started without DB, then every request failed with ECONNREFUSED | **Removed** — DB connection is mandatory in all environments |

### Architecture Guarantee

```
server.js
  ├── import config/env.js        ← validates env, exits if invalid
  ├── process handlers            ← one set, never duplicated
  └── bootstrap()
        ├── [1] Filesystem         ← create uploads/
        ├── [2] Env confirm        ← already validated
        ├── [3] connectDB()        ← BLOCKS until success or throws
        ├── [4] Email (optional)   ← non-fatal
        ├── [5] Express + routes   ← middleware → routes → error handlers
        └── [6] app.listen()       ← ONLY runs after DB is ready
```

**The server process literally cannot be listening on a port unless the database
is connected and all environment variables are valid.** This makes ECONNREFUSED
from the frontend a clear signal that the backend process isn't running at all —
not that it started in a broken half-state.
