@echo off
title Nexus Smart Display Launcher
echo ===================================================
echo   Starting Nexus Smart Display Services...
echo ===================================================
echo.

:: Ensure we are running from the project root directory
cd /d "%~dp0"

:: 1. Launch Node.js Backend Server (Port 4000) in a separate terminal
echo [1/2] Starting Express & Socket.io Server...
start "Nexus Backend Server" cmd /k "node server/server.cjs"

:: Brief delay to let the backend server start up
timeout /t 2 /nobreak >nul

:: 2. Launch Vite Frontend Development Server in a separate terminal
echo [2/2] Starting Vite Frontend Dashboard...
start "Nexus Frontend Dashboard" cmd /k "npm run dev"

:: 3. Automatically open the frontend dashboard in the default browser
timeout /t 3 /nobreak >nul
echo Opening Nexus Dashboard in browser...
start http://localhost:5173

echo.
echo ===================================================
echo Nexus is up and running!
echo - Display Dashboard: http://localhost:5173
echo - Admin Panel:       http://localhost:4000
echo ===================================================
echo.
pause
