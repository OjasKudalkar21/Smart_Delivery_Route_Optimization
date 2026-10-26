@echo off
echo ========================================================
echo Building RoutePilot C++17 DSA Engine Executable...
echo ========================================================

if not exist bin mkdir bin

g++ -std=c++17 -O2 -Wall -Wextra -Wl,--nxcompat,--dynamicbase ^
    -I include ^
    src\Graph.cpp ^
    src\SampleData.cpp ^
    src\RouteOptimizer.cpp ^
    src\EngineHandler.cpp ^
    src\main.cpp ^
    -o bin\route_engine.exe

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Build failed with error code %ERRORLEVEL%!
    exit /b %ERRORLEVEL%
)

echo.
echo [SUCCESS] Engine compiled successfully to: bin\route_engine.exe
