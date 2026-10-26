@echo off
echo ======================================================================
echo  Starting RoutePilot Full-Stack Delivery Route Optimization System
echo ======================================================================
echo.

set ROOT_DIR=%~dp0

:: 1. Check or build C++ Route Engine binary
if not exist "%ROOT_DIR%cpp-engine\bin\route_engine.exe" (
    echo [Setup] Compiling C++17 route_engine.exe binary...
    cd /d "%ROOT_DIR%cpp-engine"
    call build.bat
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to compile C++ engine!
        pause
        exit /b %ERRORLEVEL%
    )
    cd /d "%ROOT_DIR%"
)

echo [1/2] Launching Node.js Express API Server on Port 5000...
start "RoutePilot Backend API (Port 5000)" cmd /k "cd /d "%ROOT_DIR%backend" && npm start"

:: Wait 2 seconds for backend to initialize
timeout /t 2 /nobreak >nul

echo [2/2] Launching Vite React Dashboard on Port 5173...
start "RoutePilot React Frontend (Port 5173)" cmd /k "cd /d "%ROOT_DIR%frontend" && npm run dev"

:: Wait 2 seconds and open browser
timeout /t 2 /nobreak >nul
start http://localhost:5173

echo.
echo ======================================================================
echo  RoutePilot is running!
echo  Backend:  http://localhost:5000
echo  Frontend: http://localhost:5173
echo ======================================================================
echo  Press any key to close this launcher window (servers will keep running).
pause >nul
