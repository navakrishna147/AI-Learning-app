@echo off
REM AI Learning Assistant - Frontend Startup Script
REM This script starts the Vite React development server

echo.
echo ════════════════════════════════════════════════════════
echo    🎨 AI Learning Assistant - Frontend Startup
echo ════════════════════════════════════════════════════════
echo.

cd frontend

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

REM Start the frontend server
echo ════════════════════════════════════════════════════════
echo Frontend Server is starting on port 5174...
echo ════════════════════════════════════════════════════════
echo.

call npm run dev

REM If it exits, keep window open to see the error
pause
