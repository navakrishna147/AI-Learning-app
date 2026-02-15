@echo off
REM ============================================================================
REM FRONTEND SERVER STARTUP SCRIPT
REM ============================================================================
REM 
REM This script starts the Vite development server
REM It will automatically proxy /api requests to http://localhost:5000
REM 
REM Prerequisites:
REM   - Node.js installed
REM   - npm dependencies installed (npm install)
REM   - Backend running on port 5000

setlocal enabledelayedexpansion

echo.
echo ============================================================================
echo  FRONTEND SERVER STARTUP
echo ============================================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if !ERRORLEVEL! NEQ 0 (
    echo ❌ ERROR: Node.js is not installed or not in PATH
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Get Node.js version
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js version: !NODE_VERSION!

REM Check if we're in the frontend directory
if not exist "vite.config.js" (
    echo.
    echo ❌ ERROR: vite.config.js not found in current directory
    echo Please run this script from the frontend folder:
    echo   cd ai-learning-assistant\frontend
    echo.
    pause
    exit /b 1
)

echo ✅ Frontend files found
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo ⚠️  node_modules not found
    echo Installing dependencies...
    call npm install
    if !ERRORLEVEL! NEQ 0 (
        echo ❌ npm install failed
        pause
        exit /b 1
    )
)

echo ✅ Dependencies installed
echo.

REM Check if .env exists
if not exist ".env" (
    echo ⚠️  WARNING: .env file not found!
    echo Creating .env with default configuration...
    (
        echo # Frontend Environment Configuration
        echo VITE_API_URL=/api
        echo VITE_API_TIMEOUT=30000
        echo VITE_BACKEND_URL=http://localhost:5000
    ) > .env
    echo ✅ .env created with default configuration
)

echo ✅ Configuration file exists
echo.

REM Display startup information
echo ============================================================================
echo  SERVER STARTUP INFORMATION
echo ============================================================================
echo.
echo 🌐 Frontend Server Details:
echo    Port: 5173
echo    URL: http://localhost:5173
echo    API Proxy: /api/* -^> http://localhost:5000
echo.
echo 📝 Environment:
echo    VITE_API_URL=/api (proxy path)
echo    VITE_BACKEND_URL=http://localhost:5000
echo    VITE_API_TIMEOUT=30000ms
echo.
echo ⚡ Features:
echo    - Hot Module Replacement (HMR) enabled
echo    - Automatic proxy to backend
echo    - React Fast Refresh
echo.
echo ⚠️  Make sure backend is running on port 5000 first!
echo.
echo ⌨️  Controls:
echo    Ctrl+C - Stop the server
echo.
echo ============================================================================
echo  STARTING SERVER...
echo ============================================================================
echo.

REM Start the server
npm run dev

REM If we get here, the server stopped
echo.
echo ❌ Server stopped
pause
