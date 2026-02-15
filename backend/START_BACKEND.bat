@echo off
REM ============================================================================
REM BACKEND SERVER STARTUP SCRIPT
REM ============================================================================
REM 
REM This script starts the backend Express server with hot reload (nodemon)
REM 
REM Prerequisites:
REM   - Node.js installed
REM   - npm dependencies installed (npm install)
REM   - .env file configured with PORT=5000
REM   - MongoDB running locally or MongoDB Atlas configured

setlocal enabledelayedexpansion

echo.
echo ============================================================================
echo  BACKEND SERVER STARTUP
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

REM Check if we're in the backend directory
if not exist "server.js" (
    echo.
    echo ❌ ERROR: server.js not found in current directory
    echo Please run this script from the backend folder:
    echo   cd ai-learning-assistant\backend
    echo.
    pause
    exit /b 1
)

echo ✅ Backend files found
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
    echo Creating .env from template...
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo ✅ .env created from .env.example
    ) else (
        echo ❌ ERROR: .env.example not found
        echo Please create a .env file with required configuration
        pause
        exit /b 1
    )
)

echo ✅ Configuration file exists
echo.

REM Display startup information
echo ============================================================================
echo  SERVER STARTUP INFORMATION
echo ============================================================================
echo.
echo 🔌 Backend Server Details:
echo    Port: 5000
echo    URL: http://localhost:5000
echo    Health Check: http://localhost:5000/api/health
echo.
echo 📊 Database:
echo    Check .env for MONGODB_URI configuration
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
