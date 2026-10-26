@echo off
echo ========================================================
echo Running ALL RoutePilot C++ Engine Tests (Phases 1-4)
echo ========================================================

echo.
echo [1/4] Compiling and running Phase 1 Graph Core tests...
call tests\run_phase1_tests.bat
if %ERRORLEVEL% NEQ 0 (
    echo [FAIL] Phase 1 tests failed!
    exit /b %ERRORLEVEL%
)

echo.
echo [2/4] Compiling and running Phase 2 Dijkstra tests...
call tests\run_phase2_tests.bat
if %ERRORLEVEL% NEQ 0 (
    echo [FAIL] Phase 2 tests failed!
    exit /b %ERRORLEVEL%
)

echo.
echo [3/4] Compiling and running Phase 3 Route Optimizer tests...
call tests\run_phase3_tests.bat
if %ERRORLEVEL% NEQ 0 (
    echo [FAIL] Phase 3 tests failed!
    exit /b %ERRORLEVEL%
)

echo.
echo [4/4] Compiling and running Phase 4 Engine Interface tests...
call tests\run_phase4_tests.bat
if %ERRORLEVEL% NEQ 0 (
    echo [FAIL] Phase 4 tests failed!
    exit /b %ERRORLEVEL%
)

echo.
echo ========================================================
echo [SUCCESS] ALL TEST SUITES (PHASES 1 - 4) PASSED!
echo ========================================================

