@echo off
title Stop teamLab Wildlife Sanctuary Installation
color 0c

echo =============================================================
echo        Stopping teamLab Wildlife Sanctuary Services
echo =============================================================
echo.

echo Terminating processes on ports 4000 (Backend), 5173 (Screen), and 5174 (Mobile)...

for %%p in (4000 5173 5174) do (
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%%p" 2^>nul') do (
        echo Killing process PID %%a on port %%p...
        taskkill /F /PID %%a >nul 2>&1
    )
)

echo.
echo All Wildlife Sanctuary services have been stopped.
echo.
pause
