@echo off
echo ========================================================
echo Compiling and Running RoutePilot Phase 2 Dijkstra Tests...
echo ========================================================

if exist tests\test_dijkstra.exe del /f /q tests\test_dijkstra.exe

g++ -std=c++17 -Wall -Wextra -Wl,--nxcompat,--dynamicbase -I cpp-engine/include cpp-engine/src/Graph.cpp cpp-engine/src/SampleData.cpp tests/test_dijkstra.cpp -o tests/test_dijkstra.exe
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Compilation failed!
    exit /b %ERRORLEVEL%
)

echo.
echo Running Dijkstra tests:
tests\test_dijkstra.exe
