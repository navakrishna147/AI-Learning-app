@echo off
REM ============================================================================
REM AI LEARNING ASSISTANT - COMPLETE STARTUP SCRIPT (Windows)
REM ============================================================================
REM This script starts both backend and frontend in the correct order

setlocal enabledelayedexpansion

echo.
echo ============================================================================
echo  AI LEARNING ASSISTANT - COMPLETE STARTUP
echo ============================================================================
echo.

REM Get current directory
set SCRIPT_DIR=%~dp0
cd /d %SCRIPT_DIR%

echo 📍 Current directory: %CD%
echo.

REM ============================================================================
REM STEP 1: Verify .env files exist
REM ============================================================================
echo Step 1: Verifying configuration files...
echo ─────────────────────────────────────────────────────────────────────────

if not exist "backend\.env" (
  echo ❌ CRITICAL: backend\.env not found!
  echo    Solution: Create backend\.env with required variables:
  echo    - PORT=5000
  echo    - MONGODB_URI=mongodb://localhost:27017/lmsproject
  echo    - JWT_SECRET=your_secret_key
  echo    - GROQ_API_KEY=your_groq_api_key
  echo.
  pause
  exit /b 1
)

if not exist "frontend\.env" (
  echo ❌ CRITICAL: frontend\.env not found!
  echo    Solution: Create frontend\.env
  pause
  exit /b 1
)

echo ✅ Configuration files found
echo.

REM ============================================================================
REM STEP 2: Check if MongoDB is running
REM ============================================================================
echo Step 2: Checking MongoDB...
echo ─────────────────────────────────────────────────────────────────────────

tasklist | find /i "mongod.exe" >nul 2>&1
if %errorlevel% neq 0 (
  echo ⚠️  MongoDB is not running!
  echo    Solutions:
  echo    1. Start MongoDB: mongod
  echo       or "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"
  echo    2. Or use MongoDB Atlas (cloud)
  echo.
  echo    Continue anyway? (Press Y to continue, any other key to exit)
  set /p choice=Your choice: 
  if /i not "%choice%"=="Y" exit /b 1
  echo ⚠️  Proceeding without MongoDB check...
  echo.
) else (
  echo ✅ MongoDB is running
  echo.
)

REM ============================================================================
REM STEP 3: Kill any existing processes on ports 5000 and 5173
REM ============================================================================
echo Step 3: Checking ports 5000 and 5173...
echo ─────────────────────────────────────────────────────────────────────────

for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000 "') do (
  echo ⚠️  Port 5000 is in use. Attempting to free it...
  taskkill /PID %%a /F >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173 "') do (
  echo ⚠️  Port 5173 is in use. Attempting to free it...
  taskkill /PID %%a /F >nul 2>&1
)

echo ✅ Ports verified
echo.

REM ============================================================================
REM STEP 4: Run backend startup verification
REM ============================================================================
echo Step 4: Running backend startup verification...
echo ─────────────────────────────────────────────────────────────────────────
echo.

cd backend
node BACKEND_STARTUP_VERIFICATION.js
if %errorlevel% neq 0 (
  echo ❌ Backend verification failed!
  pause
  exit /b 1
)
cd ..
echo.

REM ============================================================================
REM STEP 5: Start backend server
REM ============================================================================
echo Step 5: Starting backend server...
echo ─────────────────────────────────────────────────────────────────────────

echo 🚀 Starting backend on port 5000...
echo    Press Ctrl+C to stop
echo.

cd backend
start "AI Learning Assistant - Backend" cmd /k "npm run dev"
cd ..

REM Wait for backend to start
echo ⏳ Waiting for backend to start (5 seconds)...
timeout /t 5 /nobreak

REM ============================================================================
REM STEP 6: Verify backend is responding
REM ============================================================================
echo.
echo Step 6: Verifying backend connectivity...
echo ─────────────────────────────────────────────────────────────────────────

set retries=0
:backend_check
if %retries% lss 5 (
  curl -s http://localhost:5000/health >nul 2>&1
  if !errorlevel! equ 0 (
    echo ✅ Backend is responding!
    goto backend_ok
  )
  set /a retries=!retries!+1
  echo ⏳ Backend not responding yet, retrying... (!retries!/5)
  timeout /t 2 /nobreak
  goto backend_check
)

echo ⚠️  Backend not responding after 10 seconds
echo    Check if backend terminal shows errors
echo    Continuing frontend startup anyway...
echo.

:backend_ok

REM ============================================================================
REM STEP 7: Install frontend dependencies if needed
REM ============================================================================
echo Step 7: Checking frontend dependencies...
echo ─────────────────────────────────────────────────────────────────────────

cd frontend
if not exist "node_modules" (
  echo 📦 Installing frontend dependencies...
  call npm install
  if %errorlevel% neq 0 (
    echo ❌ Frontend npm install failed!
    pause
    exit /b 1
  )
)
echo ✅ Frontend dependencies ready
echo.
cd ..

REM ============================================================================
REM STEP 8: Start frontend server
REM ============================================================================
echo Step 8: Starting frontend server...
echo ─────────────────────────────────────────────────────────────────────────

echo 🚀 Starting frontend on port 5173...
echo    It will open in your browser automatically
echo    Press Ctrl+C to stop
echo.

cd frontend
start "AI Learning Assistant - Frontend" cmd /k "npm run dev"
cd ..

REM ============================================================================
REM STEP 9: Wait and open browser
REM ============================================================================
echo.
echo ⏳ Waiting for frontend to start (5 seconds)...
timeout /t 5 /nobreak

echo.
echo ============================================================================
echo ✅ STARTUP COMPLETE!
echo ============================================================================
echo.
echo 📍 Access your application:
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:5000
echo    API:      http://localhost:5000/api
echo.
echo 📋 NEXT STEPS:
echo    1. Frontend should open automatically
echo    2. Login with your credentials
echo    3. Upload a document
echo    4. Test Chat, Summary, Flashcards, Quiz
echo.
echo 📊 For debugging:
echo    - Open browser DevTools (F12)
echo    - Check backend terminal for logs
echo    - Check frontend terminal for errors
echo.
echo ✅ Both servers are running!
echo    Close either terminal to stop that server
echo.
REM Open browser
start http://localhost:5173

pause
