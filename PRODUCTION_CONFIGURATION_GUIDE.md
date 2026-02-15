# ============================================================================
# COMPLETE MERN CONNECTIVITY CONFIGURATION GUIDE
# ============================================================================
#
# Production-ready configuration for local development and custom domain deployment
# Works for localhost, custom domains, and cloud deployments
#

---

## 🚀 QUICK START (5 MINUTES)

### For Local Development:

```bash
# Terminal 1: Start Backend
cd backend
npm run dev

# You should see:
# ✅ APPLICATION STARTED SUCCESSFULLY
# 🚀 Server Port: 5000
# GET /health → 200

# Terminal 2: Start Frontend
cd frontend
npm run dev

# Open browser:
# http://localhost:5173

# You should see:
# ✅ Login page (NOT "Backend unreachable")
```

---

## 📋 CONFIGURATION CHECKLIST

### Backend Configuration:

```env
# backend/.env (DEVELOPMENT)
NODE_ENV=development
PORT=5000  # ⚠️ CRITICAL - must match frontend VITE_BACKEND_URL
JWT_SECRET=dev_secret_key_change_in_production
MONGODB_URI=mongodb://localhost:27017/ai-learning-assistant
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
GROQ_API_KEY=your_api_key_here
MAX_FILE_SIZE=10485760
```

### Frontend Configuration:

```env
# frontend/.env (DEVELOPMENT)
VITE_API_URL=/api                              # Vite proxy path
VITE_BACKEND_URL=http://127.0.0.1:5000        # Direct fallback URL
VITE_API_TIMEOUT=60000                          # 60 seconds
VITE_DEBUG_MODE=true                            # Development logging
```

### Vite Proxy Configuration:

```javascript
// frontend/vite.config.js (ALREADY CONFIGURED)
proxy: {
  '/api': {
    target: 'http://localhost:5000',  // Backend URL
    changeOrigin: true,
    secure: false,
    rewrite: (path) => path,
  }
}

// This automatically forwards:
// /api/auth/login → http://localhost:5000/api/auth/login
```

---

## 🔗 HOW CONNECTIVITY WORKS

### Flow Diagram:

```
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND (http://localhost:5173)                            │
│                                                              │
│  1️⃣ Login form → axios.post('/api/auth/login')             │
│  2️⃣ Vite proxy intercepts /api/* requests                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                          ⬇️
                     (Vite Proxy)
                   http://localhost:5000
                          ⬇️
┌─────────────────────────────────────────────────────────────┐
│ BACKEND (http://localhost:5000)                             │
│                                                              │
│  3️⃣ Express receives POST /api/auth/login                  │
│  4️⃣ Check CORS: Origin http://localhost:5173 ✅ allowed    │
│  5️⃣ Authenticate user, return JWT token                    │
│  6️⃣ Response sent back through proxy                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Why This Works:

1. **Vite Proxy** (Development only):
   - Intercepts requests to `/api/*`
   - Forwards them to backend
   - Avoids CORS issues (same-origin)
   - Only works in development
   - No setup needed - already configured

2. **CORS** (For direct API calls):
   - Backend allows requests from frontend origin
   - Configured in backend/.env: `CORS_ORIGINS`
   - Fallback if proxy fails
   - Required for production

---

## 🔧 BACKEND CONFIGURATION DETAILS

### Server Startup Sequence:

```
1. Load environment variables (.env)
2. Validate all required variables exist
3. Connect to MongoDB with timeout
4. Initialize Express app
5. Setup CORS middleware (MUST be before routes)
6. Setup all routes
7. Setup error handling
8. Start HTTP server on PORT
9. Verify health endpoints working
10. Print startup confirmation
```

### Health Check Endpoints (Built-in):

```bash
# Check if server is alive (always 200 if running)
GET http://127.0.0.1:5000/health
# Response: { "status": "OK", "service": "alive", "uptime": 123 }

# Check if healthy (200 if DB connected, 503 if not)
GET http://127.0.0.1:5000/api/health
# Response: { "status": "healthy", "database": { "connected": true } }

# Get detailed diagnostics
GET http://127.0.0.1:5000/api/health/detailed
# Response: Includes memory, DB pool, CPU info
```

### Important: Server Binding

```javascript
// backend/config/bootstrap.js
server.listen(PORT, '0.0.0.0', () => {
  // Binds to ALL interfaces: 127.0.0.1, localhost, etc.
  // Critical for Docker, Kubernetes, cloud deployments
})
```

This means frontend can reach backend via:
- `http://127.0.0.1:5000` ✅ (IP address)
- `http://localhost:5000` ✅ (hostname - with DNS lookup)
- `http://backend:5000` ✅ (hostname in Docker networks)

**Recommendation**: Use `http://127.0.0.1:5000` to avoid DNS lookups

---

## 🌐 FRONTEND CONFIGURATION DETAILS

### Vite Proxy Configuration:

```javascript
// frontend/vite.config.js
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',  // Backend URL
        changeOrigin: true,               // Change Host header
        secure: false,                    // Allow HTTP
        ws: true,                          // Support WebSocket
        
        // Error handling with diagnostics
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            if (err.code === 'ECONNREFUSED') {
              console.error('❌ BACKEND CONNECTION REFUSED!');
              console.error('Solution: Start backend with: npm run dev');
            }
          });
        }
      }
    }
  }
}
```

### API Service Configuration:

```javascript
// frontend/src/services/api.js
const createApiInstance = () => {
  const instance = axios.create({
    baseURL: '/api',  // Uses Vite proxy
    timeout: 30000,
    withCredentials: false,  // Same-origin, no creds needed
  });

  // Request interceptor: Add JWT token
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Response interceptor: Handle errors
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.code === 'ECONNREFUSED') {
        // Backend not running
        return Promise.reject({
          message: 'Backend server not responding',
          code: 'CONNECTION_REFUSED'
        });
      }
      return Promise.reject(error);
    }
  );

  return instance;
};
```

---

## 🚀 DEPLOYMENT WITH CUSTOM DOMAIN

### Scenario: Deploy on Custom Domain (e.g., myapp.com)

#### Option 1: Same Domain (Recommended)

```
Frontend: https://myapp.com
Backend:  https://myapp.com/api
```

**Configuration:**

```env
# backend/.env.production
PORT=5000
CORS_ORIGINS=https://myapp.com,https://www.myapp.com

# frontend/.env.production
VITE_API_URL=/api                    # Same domain
VITE_BACKEND_URL=https://myapp.com
```

**Nginx Configuration:**

```nginx
server {
  listen 443 ssl;
  server_name myapp.com www.myapp.com;

  # Frontend
  location / {
    proxy_pass http://localhost:3000;
  }

  # Backend API
  location /api {
    proxy_pass http://localhost:5000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

#### Option 2: Separate Subdomains

```
Frontend: https://app.myapp.com
Backend:  https://api.myapp.com
```

**Configuration:**

```env
# backend/.env.production
PORT=5000
CORS_ORIGINS=https://app.myapp.com

# frontend/.env.production
VITE_API_URL=https://api.myapp.com/api
VITE_BACKEND_URL=https://api.myapp.com
```

**Nginx Configuration:**

```nginx
# Frontend server
server {
  listen 443 ssl;
  server_name app.myapp.com;
  
  location / {
    proxy_pass http://localhost:3000;
  }
}

# Backend server
server {
  listen 443 ssl;
  server_name api.myapp.com;
  
  location / {
    proxy_pass http://localhost:5000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

#### Option 3: Docker Deployment

```dockerfile
# Dockerfile for backend
FROM node:18
WORKDIR /app
COPY backend/ .
RUN npm install
ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000
CMD ["npm", "start"]
```

```bash
# Deploy with Docker Compose
docker-compose up -d

# Verify
curl http://localhost:5000/health
```

---

## ✅ PRODUCTION CHECKLIST

### Before Deploying to Production:

- [ ] **Backend Ready**
  - [ ] `.env.production` configured
  - [ ] `PORT` set correctly
  - [ ] `JWT_SECRET` is strong (32+ characters)
  - [ ] `MONGODB_URI` points to production DB
  - [ ] `CORS_ORIGINS` includes all frontend URLs
  - [ ] Build: `npm run build` (if applicable)
  - [ ] Test: `npm start` starts without errors

- [ ] **Frontend Ready**
  - [ ] `.env.production` configured
  - [ ] `VITE_API_URL` points to backend
  - [ ] `VITE_BACKEND_URL` is correct domain
  - [ ] Build: `npm run build` succeeds
  - [ ] Dist folder created with no errors

- [ ] **Connectivity**
  - [ ] Backend health check: `curl https://api.yourdomain.com/health`
  - [ ] CORS working: Check network tab in browser DevTools
  - [ ] No "Backend unreachable" error on login page
  - [ ] Login succeeds with valid credentials
  - [ ] JWT token visible in localStorage

- [ ] **Security**
  - [ ] HTTPS enabled on both frontend and backend
  - [ ] CORS limited to specific origins (not `*`)
  - [ ] JWT_SECRET changed from default
  - [ ] Database credentials not in frontend code
  - [ ] API keys not in version control (use .env)

- [ ] **Monitoring**
  - [ ] Health check endpoint monitored
  - [ ] Logs being collected
  - [ ] Alerting configured
  - [ ] Error tracking (Sentry, DataDog) configured

- [ ] **Backup & Recovery**
  - [ ] Database backups automated
  - [ ] Rollback plan defined
  - [ ] Disaster recovery tested

---

## 🔍 VERIFICATION & TESTING

### Manual Verification:

```bash
# 1. Test backend health
curl http://127.0.0.1:5000/health
# Expected: { "status": "OK", "service": "alive" }

# 2. Test API health
curl http://127.0.0.1:5000/api/health
# Expected: { "status": "healthy" }

# 3. Test CORS (from frontend)
curl http://127.0.0.1:5000/api/auth/health-check \
  -H "Origin: http://localhost:5173"
# Expected: 200 OK

# 4. Test login
curl -X POST http://127.0.0.1:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
# Expected: { "token": "..." }
```

### Automated Testing:

```bash
# Run verification script
node verify-connectivity.cjs

# Run with verbose output
node verify-connectivity.cjs --verbose

# Run full diagnostics
node verify-connectivity.cjs --full
```

---

## 📊 PERFORMANCE OPTIMIZATION

### Frontend Optimization:

```env
# frontend/.env.production
# Increase timeout for slow networks
VITE_API_TIMEOUT=120000  # 2 minutes

# Disable debug logging in production
VITE_DEBUG_MODE=false
```

### Backend Optimization:

```env
# backend/.env.production
# Database connection pooling
MONGODB_MAX_POOL_SIZE=20
MONGODB_MIN_POOL_SIZE=5

# Keep-alive settings
KEEP_ALIVE_TIMEOUT=65000

# Request timeout
REQUEST_TIMEOUT=30000
```

---

## 🐛 DEBUGGING TIPS

### Enable Request Logging:

```env
# backend/.env
DEBUG_MODE=true
LOG_LEVEL=debug

# frontend/.env
VITE_DEBUG_API=true
VITE_DEBUG_NETWORK=true
```

### Check Request Headers:

```javascript
// browser console
fetch('/api/health', {
  headers: { 'X-Debug': 'true' }
}).then(r => r.json()).then(console.log)
```

### Monitor Network Traffic:

```bash
# Windows PowerShell
netstat -ano -p tcp | findstr :5000

# Linux
sudo tcpdump -i any port 5000

# Mac
lsof -i :5000
```

---

## 📚 COMMON ISSUES & FIXES

| Issue | Symptom | Fix |
|-------|---------|-----|
| Backend unreachable | Frontend shows error | Run `npm run dev` in backend |
| ECONNREFUSED | Connection refused error | Verify PORT in .env and backend running |
| CORS error | 403 Forbidden | Add frontend URL to CORS_ORIGINS |
| Timeout | Request times out | Check MongoDB, increase timeout in .env |
| 401 Unauthorized | Cannot login | Verify JWT_SECRET, check credentials |
| Database not found | Cannot connect DB | Start MongoDB, verify MONGODB_URI |
| Port already in use | EADDRINUSE | Kill process on port or change PORT |

---

## 🔗 USEFUL LINKS

- [Express CORS Documentation](https://www.npmjs.com/package/cors)
- [Vite Server Configuration](https://vitejs.dev/config/server-options.html)
- [MongoDB Connection String](https://www.mongodb.com/docs/manual/reference/connection-string/)
- [PM2 Process Manager](https://pm2.io/)
- [Nginx Proxy Configuration](https://nginx.org/en/docs/http/ngx_http_proxy_module.html)
- [Docker Containerization](https://docs.docker.com/get-started/)
