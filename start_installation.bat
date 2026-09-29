@echo off
title teamLab Wildlife Living Sanctuary Launcher
color 0a

echo =============================================================
echo    teamLab: 3D Wildlife Living Sanctuary Installation Launcher
echo =============================================================
echo.

:: Ensure we are in the script's directory
cd /d "%~dp0"

echo [0/3] Clearing stale processes on ports 4000, 5173, 5174...
for %%p in (4000 5173 5174) do (
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%%p" 2^>nul') do (
        taskkill /F /PID %%a >nul 2>&1
    )
)

echo [1/3] Launching Wildlife Sanctuary Server (Port 4000)...
start "teamLab - 1. Sanctuary Backend" cmd /k "cd /d "%~dp0backend" && title [SANCTUARY SERVER - PORT 4000] && node src/server.js"

echo [2/3] Launching 3D Living Sanctuary Screen Display (Port 5173)...
start "teamLab - 2. 3D Living Sanctuary Screen" cmd /k "cd /d "%~dp0main-screen" && title [3D MAIN SCREEN - PORT 5173] && npm run dev"

echo [3/3] Launching Mobile Wildlife Field Scanner (Port 5174)...
start "teamLab - 3. Mobile Field Scanner" cmd /k "cd /d "%~dp0mobile-scanner" && title [MOBILE FIELD SCANNER - PORT 5174] && npm run dev"

echo.
echo Waiting 4 seconds for sanctuary services to initialize...
timeout /t 4 /nobreak >nul

echo Opening 3D Living Sanctuary in default browser...
start http://localhost:5173

echo.
echo =============================================================
echo   All 3 Sanctuary Services are Running!
echo   - Backend Server:    http://localhost:4000
echo   - 3D Main Screen:    http://localhost:5173
echo   - Mobile Field Guide: Check Backend console for your LAN QR code!
echo =============================================================
echo.
echo Press any key to exit this launcher window (services keep running).
pause >nul
