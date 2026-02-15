╔════════════════════════════════════════════════════════════════════════════════╗
║                   FULL SYSTEM FIX - IMPLEMENTATION GUIDE                        ║
║            6-Step Production-Ready Refactoring for MERN Project                 ║
╚════════════════════════════════════════════════════════════════════════════════╝

OVERVIEW:
This guide provides corrected code files for all 6 critical system fixes.
All files have "-CORRECTED.js/.jsx" suffix for easy identification.


═════════════════════════════════════════════════════════════════════════════════
STEP 1: BACKEND SERVER - BLOCKING DATABASE INITIALIZATION
═════════════════════════════════════════════════════════════════════════════════

FILE: backend/server-CORRECTED.js
REPLACES: backend/server.js
KEY FIXES:
  ✅ Validates environment variables at startup
  ✅ Waits for MongoDB connection BEFORE app.listen()
  ✅ Exits immediately if DB fails in production
  ✅ Allows fallback in development mode
  ✅ Removed GEMINI_API_KEY and ANTHROPIC_API_KEY checks
  ✅ Only checks GROQ_API_KEY (single provider)
  ✅ CORS configured from environment variable
  ✅ Fixed require() to import mongoose at top
  ✅ Health check endpoints using imported mongoose
  ✅ Comprehensive startup logging

IMPLEMENTATION:
  1. Backup current: cp backend/server.js backend/server.js.backup
  2. Replace with corrected: cp backend/server-CORRECTED.js backend/server.js
  3. Verify imports at top of file:
     import mongoose from 'mongoose';
  4. Test:
     npm run dev (from backend directory)
     Should see: "✅ SERVER STARTED SUCCESSFULLY"

EXPECTED BEHAVIOR:
  - If MONGODB_URI missing: Exits with error
  - If MONGODB_URI wrong: Retries 3x with exponential backoff
  - If MongoDB not running (production): Exits and fails
  - If MongoDB not running (development): Warns and continues


═════════════════════════════════════════════════════════════════════════════════
STEP 2: DATABASE CONNECTION - PRODUCTION-READY RETRY LOGIC
═════════════════════════════════════════════════════════════════════════════════

FILE: backend/config/db-CORRECTED.js
REPLACES: backend/config/db.js
KEY FIXES:
  ✅ Throws error if connection fails in production
  ✅ Allows fallback in development with warning
  ✅ Exponential backoff: 3s, 6s, 9s retries
  ✅ Comprehensive error classification
  ✅ Better error messages for each error type
  ✅ Health check function with ping attempt
  ✅ Disconnect cleanup function
  ✅ No silent failures

IMPLEMENTATION:
  1. Backup: cp backend/config/db.js backend/config/db.js.backup
  2. Replace: cp backend/config/db-CORRECTED.js backend/config/db.js
  3. Update backend/server.js to use async startup:
     const db = await connectDB();
  4. Test:
     npm run dev
     Should see healthy connection or clear error message

EXPECTED BEHAVIOR:
  - First attempt: immediate try
  - Failure: waits 3 seconds, retries
  - Failure: waits 6 seconds, retries
  - Failure: waits 9 seconds, fails permanently
  - Production: Exits process
  - Development: Warns and continues


═════════════════════════════════════════════════════════════════════════════════
STEP 3: VITE PROXY - CORRECT FRONTEND<>BACKEND COMMUNICATION
═════════════════════════════════════════════════════════════════════════════════

FILE: frontend/vite.config-CORRECTED.js
REPLACES: frontend/vite.config.js
KEY FIXES:
  ✅ strictPort: true (fails if 5173 in use, doesn't auto-pick)
  ✅ Proxy correctly configured: /api → http://localhost:5000
  ✅ changeOrigin: true for production compatibility
  ✅ WS support for WebSocket
  ✅ Detailed error logging when proxy fails
  ✅ ECONNREFUSED error shows clear troubleshooting
  ✅ Cleaned up configuration (removed unnecessary options)

IMPLEMENTATION:
  1. Backup: cp frontend/vite.config.js frontend/vite.config.js.backup
  2. Replace: cp frontend/vite.config-CORRECTED.js frontend/vite.config.js
  3. Restart frontend: npm run dev
  4. Test:
     a. Backend must be running: npm run dev (from backend)
     b. Frontend should NOT show ECONNREFUSED
     c. Verify: http://localhost:5173 (should redirect to /login)

EXPECTED BEHAVIOR:
  - Frontend runs on port 5173 only (no fallback to 5174, etc.)
  - All /api/* requests forwarded to http://localhost:5000
  - If backend offline: Clear error message with troubleshooting
  - If backend online: Transparent proxy (like backend running locally)


═════════════════════════════════════════════════════════════════════════════════
STEP 4: AUTHENTICATION MIDDLEWARE - SECURE JWT VERIFICATION
═════════════════════════════════════════════════════════════════════════════════

FILE: backend/middleware/auth-CORRECTED.js
REPLACES: backend/middleware/auth.js
KEY FIXES:
  ✅ JWT_SECRET required (no fallback defaults)
  ✅ Centralized JWT_SECRET validation
  ✅ Comprehensive error classification (expired, invalid, missing)
  ✅ Better error messages
  ✅ Optional auth middleware (non-blocking variant)
  ✅ Clear Bearer token format checking
  ✅ User active status verification
  ✅ User attachment to request object (req.user)

IMPLEMENTATION:
  1. Backup: cp backend/middleware/auth.js backend/middleware/auth.js.backup
  2. Replace: cp backend/middleware/auth-CORRECTED.js backend/middleware/auth.js
  3. Verify JWT_SECRET in backend/.env:
     JWT_SECRET=your-secret-key-min-32-characters
  4. No code changes needed in routes/auth.js

EXPECTED BEHAVIOR:
  - Missing authorization header: 401 "No authorization header"
  - Invalid Bearer format: 401 "Invalid format"
  - Expired token: 401 "Token expired" with expiredAt timestamp
  - Invalid signature: 401 "Invalid token signature"
  - User inactive: 403 "User account is inactive"
  - Valid token: User attached to req.user


═════════════════════════════════════════════════════════════════════════════════
STEP 5: PROTECTED ROUTES - FRONTEND AUTHENTICATION GUARD
═════════════════════════════════════════════════════════════════════════════════

FILE: frontend/src/components/ProtectedRoute-CORRECTED.jsx
REPLACES: frontend/src/components/ProtectedRoute.jsx
KEY FIXES:
  ✅ Clear loading state with animated indicator
  ✅ Proper unauthenticated redirect with location memory
  ✅ Role-based access control (optional)
  ✅ Better loading UI
  ✅ Clear access denied message
  ✅ Race condition handling

IMPLEMENTATION:
  1. Backup: cp frontend/src/components/ProtectedRoute.jsx frontend/src/components/ProtectedRoute.jsx.backup
  2. Replace: cp frontend/src/components/ProtectedRoute-CORRECTED.jsx frontend/src/components/ProtectedRoute.jsx
  3. Verify usage in App.jsx:
     <ProtectedRoute>
       <Dashboard />
     </ProtectedRoute>
  4. No other code changes needed

EXPECTED BEHAVIOR:
  - Not authenticated: Shows loading → redirects to /login
  - Authenticated: Shows component
  - Wrong role: Shows "Access Denied" message
  - Post-login: Redirects back to original destination


═════════════════════════════════════════════════════════════════════════════════
STEP 6: GROQ AI SERVICE - SINGLE PROVIDER CONFIGURATION
═════════════════════════════════════════════════════════════════════════════════

FILE: backend/services/aiService-CORRECTED.js
REPLACES: backend/services/aiService.js
KEY FIXES:
  ✅ Only Groq provider (removed Gemini & Anthropic fallbacks)
  ✅ Comprehensive error handling
  ✅ Rate limit detection (429 errors)
  ✅ JSON parsing with text fallbacks
  ✅ Proper error classification
  ✅ Better logging
  ✅ Type-safe function signatures
  ✅ Model: llama-3.1-8b-instant

IMPLEMENTATION:
  1. Backup: cp backend/services/aiService.js backend/services/aiService.js.backup
  2. Replace: cp backend/services/aiService-CORRECTED.js backend/services/aiService.js
  3. Verify GROQ_API_KEY in backend/.env:
     GROQ_API_KEY=gsk_...
  4. Delete: rm backend/services/aiService.js.backup (if no longer needed)

EXPECTED BEHAVIOR:
  - GROQ_API_KEY not set: Warning at startup, features disabled
  - Rate limited (429): Returns "service temporarily rate-limited"
  - Auth failed: Returns "authentication failed"
  - Valid key: Chat/Summary/Flashcards/Quiz work
  - Malformed response: Uses text fallback parser


═════════════════════════════════════════════════════════════════════════════════
ENVIRONMENT FILE REQUIREMENTS (.env)
═════════════════════════════════════════════════════════════════════════════════

BACKEND/.ENV (REQUIRED):
───────────────────────────
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lmsproject
JWT_SECRET=your-secret-key-minimum-32-characters-for-security
NODE_ENV=development

OPTIONAL:
GROQ_API_KEY=gsk_... (for AI features)
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password

FRONTEND/.ENV (OPTIONAL):
──────────────────────────
VITE_BACKEND_URL=http://127.0.0.1:5000
VITE_API_URL=/api
VITE_DEBUG_MODE=true


═════════════════════════════════════════════════════════════════════════════════
CLEANUP - REMOVE OLD/BACKUP FILES
═════════════════════════════════════════════════════════════════════════════════

DELETE THESE:
  ✗ backend/controllers/chatController.FIXED.js
  ✗ backend/controllers/chatController.NEW.js
  ✗ backend/services/aiService.js.backup (after successful test)

COMMANDS:
  rm backend/controllers/chatController.FIXED.js
  rm backend/controllers/chatController.NEW.js
  rm backend/services/aiService.js.backup


═════════════════════════════════════════════════════════════════════════════════
TESTING PROCEDURE (COMPLETE FLOW)
═════════════════════════════════════════════════════════════════════════════════

1. MONGODB VERIFICATION:
   ─────────────────────
   # Ensure MongoDB is running
   mongosh (or mongo for older versions)
   # Should connect without errors
   # Exit with: exit

2. BACKEND STARTUP:
   ────────────────
   cd backend
   npm run dev
   
   EXPECTED OUTPUT:
   ✅ Environment variables validated
   ✅ Groq AI Service (or warning if not configured)
   ✅ MongoDB connected (or retry sequence)
   ✅ SERVER STARTED SUCCESSFULLY
   ✅ URL: http://localhost:5000
   
   TEST HEALTH:
   curl http://localhost:5000/health
   Should return: {"status":"ok","message":...}

3. FRONTEND STARTUP:
   ──────────────────
   # New terminal
   cd frontend
   npm run dev
   
   EXPECTED OUTPUT:
   ✅ Vite server running at http://localhost:5173
   ✅ No PROXY ERROR messages
   
   REST:
   http://localhost:5173 → redirects to /login (correct!)

4. LOGIN TEST:
   ────────────
   a. Click "Don't have an account? Sign up"
   b. Create account:
      Email: test@example.com
      Password: Test@123456
   c. Login with credentials
   d. Should redirect to /dashboard
   e. No "Backend unreachable" messages

5. AI FEATURES TEST:
   ──────────────────
   a. Click Documents
   b. Upload PDF
   c. Click on document
   d. Try "Chat", "Summary", "Flashcards"
   
   If GROQ_API_KEY not set:
   - Should show: "AI service not configured"
   
   If GROQ_API_KEY set:
   - Features should work
   - May hit rate limits (wait and retry)

6. ERROR SCENARIOS:
   ─────────────────
   Kill backend:
   - Frontend should show connection error
   - Error message suggests solutions
   - Fixes apply once backend restarted
   
   Remove MongoDB connection:
   - Backend should exit (production) or warn (development)
   - API requests return errors
   - Clear messages on why features don't work


═════════════════════════════════════════════════════════════════════════════════
TROUBLESHOOTING COMMON ISSUES
═════════════════════════════════════════════════════════════════════════════════

ISSUE: Port 5000 already in use
─────────────────────────────
FIX:
  # Find process using port 5000
  lsof -i :5000 (Mac/Linux)
  netstat -ano | findstr :5000 (Windows)
  
  # Kill it
  kill -9 <PID> (Mac/Linux)
  taskkill /PID <PID> /F (Windows)
  
  # OR change port:
  # Edit backend/.env: PORT=5001
  # Edit frontend/.env: VITE_BACKEND_URL=http://127.0.0.1:5001
  # Update vite.config.js proxy target


ISSUE: Port 5173 stuck/in use
─────────────────────────────
FIX:
  # Kill old frontend process
  lsof -i :5173 (Mac/Linux)
  netstat -ano | findstr :5173 (Windows)
  kill -9 <PID>
  
  # Restart: npm run dev


ISSUE: "Backend unreachable - retrying"
────────────────────────────────────────
FIX:
  1. Ensure backend is running: npm run dev (in backend terminal)
  2. Test manually: curl http://localhost:5000/health
  3. Check backend/.env has PORT=5000
  4. Check frontend proxy target in vite.config.js
  5. Clear browser cache (Ctrl+Shift+Delete)
  6. Restart frontend


ISSUE: "AI services not responding"
────────────────────────────────────
FIX:
  1. Check GROQ_API_KEY set: grep GROQ_API_KEY backend/.env
  2. Verify key format: should start with 'gsk_'
  3. Test key: Create fresh key at console.groq.com
  4. Restart backend: npm run dev
  5. Check for rate limiting: wait 60 seconds


ISSUE: MongoDB connection failed
─────────────────────────────────
FIX:
  1. Start MongoDB: mongod (or mongodb service)
  2. Verify: mongosh → should connect
  3. Check MONGODB_URI in backend/.env
  4. Format: mongodb://localhost:27017/lmsproject
  5. Restart backend


═════════════════════════════════════════════════════════════════════════════════
PRODUCTION DEPLOYMENT CHECKLIST
═════════════════════════════════════════════════════════════════════════════════

Before deploying to production:

BACKEND:
  ☐ NODE_ENV=production
  ☐ JWT_SECRET set (32+ chars, strong)
  ☐ MONGODB_URI uses production database
  ☐ GROQ_API_KEY verified working
  ☐ CORS_ORIGINS set to your domain(s)
  ☐ EMAIL configured (if needed)
  ☐ Error logging configured
  ☐ Security headers added
  ☐ Database backups enabled
  ☐ Health checks passing

FRONTEND:
  ☐ NODE_ENV=production
  ☐ VITE_BACKEND_URL points to production backend
  ☐ Build tested locally: npm run build
  ☐ Build served locally: npx http-server dist
  ☐ Asset paths correct (no relative /api paths in production)
  ☐ Auth redirects working
  ☐ Error boundaries in place

INFRASTRUCTURE:
  ☐ SSL/HTTPS enabled
  ☐ Rate limiting configured
  ☐ DDoS protection active
  ☐ Database replication set up
  ☐ Monitoring/alerting active
  ☐ Log aggregation configured
  ☐ Backup strategy in place
  ☐ Load balancing configured (if needed)
  ☐ CDN for static assets (optional)


═════════════════════════════════════════════════════════════════════════════════
NEXT STEPS
═════════════════════════════════════════════════════════════════════════════════

1. Apply all 6 code corrections
2. Run complete testing procedure
3. Fix any remaining errors
4. Deploy to staging environment
5. Final production deployment


═════════════════════════════════════════════════════════════════════════════════
