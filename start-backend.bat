@echo off
REM AI Learning Assistant - Backend Startup Script
REM This script starts MongoDB and the backend server

echo.
echo ════════════════════════════════════════════════════════
echo    🚀 AI Learning Assistant - Backend Startup
echo ════════════════════════════════════════════════════════
echo.

REM Check if MongoDB is running
echo Checking MongoDB...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ✅ MongoDB is already running
) else (
    echo ⚠️  MongoDB not running. Attempting to start...
    start mongod.exe
    echo ✅ MongoDB started (wait 2-3 seconds for full startup)
    timeout /t 3 /nobreak
)

echo.
echo Starting Backend Server...
echo.

cd backend

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

REM Start the backend server
echo ════════════════════════════════════════════════════════
echo Backend Server is starting on port 5000...
echo ════════════════════════════════════════════════════════
echo.

call npm start

REM If it exits, keep window open to see the error
pause
