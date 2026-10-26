@echo off
echo ========================================================
echo Running RoutePilot Phase 6 Backend API Integration Tests
echo ========================================================

cd /d "%~dp0\..\backend"
call npm test

if %ERRORLEVEL% NEQ 0 (
    echo [FAIL] Phase 6 tests failed with code %ERRORLEVEL%!
    exit /b %ERRORLEVEL%
)

echo.
echo ========================================================
echo [SUCCESS] PHASE 6 BACKEND API TESTS COMPLETED!
echo ========================================================
