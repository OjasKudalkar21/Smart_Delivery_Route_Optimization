@echo off
echo ========================================================
echo Compiling and Running RoutePilot Phase 4 Interface Tests...
echo ========================================================

if exist tests\test_engine_interface.exe del /f /q tests\test_engine_interface.exe

g++ -std=c++17 -Wall -Wextra -Wl,--nxcompat,--dynamicbase ^
    -I cpp-engine/include ^
    cpp-engine/src/Graph.cpp ^
    cpp-engine/src/SampleData.cpp ^
    cpp-engine/src/RouteOptimizer.cpp ^
    cpp-engine/src/EngineHandler.cpp ^
    tests/test_engine_interface.cpp ^
    -o tests/test_engine_interface.exe

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Compilation failed!
    exit /b %ERRORLEVEL%
)

echo.
echo Running Engine Interface tests:
tests\test_engine_interface.exe
