@echo off
REM ============================================================================
REM START BACKEND SERVER - Windows Batch Script
REM ============================================================================
REM 
REM This script starts the backend development server.
REM Place in: backend/ directory
REM 
REM Usage:
REM   1. Double-click this file to start the server
REM   2. Or from PowerShell: .\start-backend.bat
REM 
REM Note: Keep this command window open while developing
REM       To stop: Press Ctrl+C in the window
REM
REM ============================================================================

setlocal enabledelayedexpansion

REM Set colors for output
set GREEN=[92m
set BLUE=[94m
set YELLOW=[93m
set RED=[91m
set RESET=[0m

REM Get the directory where this script is located
cd /d "%~dp0"

echo.
echo ════════════════════════════════════════════════════════════════════════════════
echo  🚀 STARTING AI LEARNING ASSISTANT - BACKEND SERVER
echo ════════════════════════════════════════════════════════════════════════════════
echo.

REM Check if Node.js is installed
echo Checking prerequisites...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ ERROR: Node.js is not installed or not in PATH
    echo.
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found
node --version
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ ERROR: npm is not installed
    pause
    exit /b 1
)

echo ✅ npm found
npm --version
echo.

REM Check if .env file exists
if not exist ".env" (
    echo ⚠️  WARNING: .env file not found
    echo.
    echo Creating .env from .env.example...
    if exist ".env.example" (
        copy ".env.example" ".env"
        echo ✅ .env created from .env.example
        echo.
        echo ⚠️  IMPORTANT: Edit .env with your configuration:
        echo   - MONGODB_URI: Your MongoDB connection string
        echo   - JWT_SECRET: A strong random secret
        echo   - GROQ_API_KEY: Your Groq API key (optional)
        echo.
        pause
    ) else (
        echo ❌ ERROR: .env.example not found
        pause
        exit /b 1
    )
)

echo ✅ Configuration (.env) found
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ ERROR: npm install failed
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed
    echo.
)

REM Start the server
echo ════════════════════════════════════════════════════════════════════════════════
echo ✅ Starting backend server...
echo ════════════════════════════════════════════════════════════════════════════════
echo.
echo Server details:
echo   - URL: http://localhost:5000
echo   - Health check: http://localhost:5000/health
echo   - API Health: http://localhost:5000/api/health
echo   - Detailed Health: http://localhost:5000/api/health/detailed
echo.
echo Press Ctrl+C to stop the server
echo.
echo ════════════════════════════════════════════════════════════════════════════════
echo.

REM Start nodemon in development mode
call npm run dev

REM If we get here, the server stopped
echo.
echo ════════════════════════════════════════════════════════════════════════════════
echo  Backend server stopped
echo ════════════════════════════════════════════════════════════════════════════════
echo.

pause
