# RoutePilot One-Click PowerShell Startup Script
$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " Starting RoutePilot Full-Stack Delivery Route Optimization System" -ForegroundColor White
Write-Host "======================================================================" -ForegroundColor Cyan

# 1. Verify / compile C++ engine
$engineBin = Join-Path $rootDir "cpp-engine\bin\route_engine.exe"
if (-not (Test-Path $engineBin)) {
    Write-Host "[Setup] Compiling C++17 engine..." -ForegroundColor Yellow
    Set-Location (Join-Path $rootDir "cpp-engine")
    & .\build.bat
    Set-Location $rootDir
}

# 2. Start Express API Server
Write-Host "[1/2] Launching Backend API on Port 5000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$rootDir\backend'; npm.cmd start"

Start-Sleep -Seconds 2

# 3. Start Frontend
Write-Host "[2/2] Launching Vite Frontend on Port 5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$rootDir\frontend'; npm.cmd run dev"

Start-Sleep -Seconds 2
Start-Process "http://localhost:5173"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " RoutePilot launched successfully! Press enter to finish." -ForegroundColor White
Write-Host "======================================================================" -ForegroundColor Cyan
