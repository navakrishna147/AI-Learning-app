@echo off
REM AI Learning Assistant - Complete Startup Script
REM This script starts MongoDB, Backend, and Frontend

echo.
echo ════════════════════════════════════════════════════════════════
echo        🎉 AI Learning Assistant - Complete Startup 🎉
echo ════════════════════════════════════════════════════════════════
echo.

REM Check if MongoDB is running
echo 1️⃣  Checking MongoDB...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo   ✅ MongoDB is running
) else (
    echo   ⚠️  MongoDB not running. Starting...
    start mongod.exe
    echo   ✅ MongoDB started (wait 3 seconds for startup)
    timeout /t 3 /nobreak
)

echo.
echo 2️⃣  Starting Backend Server...
echo   Opening new window...
start cmd /k "cd /d %CD% && call start-backend.bat"
timeout /t 5 /nobreak

echo.
echo 3️⃣  Starting Frontend Server...
echo   Opening new window...
start cmd /k "cd /d %CD% && call start-frontend.bat"

echo.
echo ════════════════════════════════════════════════════════════════
echo ✅ All services are starting in new windows!
echo ════════════════════════════════════════════════════════════════
echo.
echo 📱 Frontend:    http://localhost:5174
echo 🖥️  Backend:     http://localhost:5000
echo 🗄️  MongoDB:     localhost:27017
echo.
echo Press any key to close this window...
pause >nul
