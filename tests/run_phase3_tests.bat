@echo off
echo ========================================================
echo Compiling and Running RoutePilot Phase 3 Optimizer Tests...
echo ========================================================

if exist tests\test_route_optimizer.exe del /f /q tests\test_route_optimizer.exe

g++ -std=c++17 -Wall -Wextra -Wl,--nxcompat,--dynamicbase -I cpp-engine/include cpp-engine/src/Graph.cpp cpp-engine/src/SampleData.cpp cpp-engine/src/RouteOptimizer.cpp tests/test_route_optimizer.cpp -o tests/test_route_optimizer.exe
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Compilation failed!
    exit /b %ERRORLEVEL%
)

echo.
echo Running Route Optimizer tests:
tests\test_route_optimizer.exe
