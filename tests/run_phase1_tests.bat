@echo off
echo ========================================================
echo Compiling and Running RoutePilot Phase 1 Core Tests...
echo ========================================================

if exist tests\test_graph_core.exe del /f /q tests\test_graph_core.exe

g++ -std=c++17 -Wall -Wextra -Wl,--nxcompat,--dynamicbase -I cpp-engine/include cpp-engine/src/Graph.cpp cpp-engine/src/SampleData.cpp tests/test_graph_core.cpp -o tests/test_graph_core.exe
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Compilation failed!
    exit /b %ERRORLEVEL%
)

echo.
echo Running tests:
tests\test_graph_core.exe
