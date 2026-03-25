@echo off
TITLE AI Money Mentor - Launcher
COLOR 0A

echo ========================================================
echo        Starting AI Money Mentor Platform
echo ========================================================

:: Ensure script executes in its exact folder location
cd /d "%~dp0"

:: Check if port 8000 or 3000 are already in use and warn the user (optional, but good practice)

echo [1/2] Launching FastAPI Backend on Port 8000...
start "AI Money Mentor - Backend" cmd /k "cd backend && python main.py"

echo.
echo [2/2] Launching Next.js Frontend on Port 3000...
start "AI Money Mentor - Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo All services are booting up in separate terminal windows!
echo.
echo - Frontend App: http://localhost:3000
echo - Backend API Docs: http://localhost:8000/docs
echo.
echo Note: Simply close the popped-up terminal windows to stop the servers.
echo ========================================================
pause
