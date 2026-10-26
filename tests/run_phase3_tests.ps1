Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Compiling and Running RoutePilot Phase 3 Optimizer Tests..." -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

g++ -std=c++17 -Wall -Wextra -Wl,--nxcompat,--dynamicbase -I cpp-engine/include cpp-engine/src/Graph.cpp cpp-engine/src/SampleData.cpp cpp-engine/src/RouteOptimizer.cpp tests/test_route_optimizer.cpp -o tests/test_route_optimizer.exe
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Compilation failed with exit code $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host ""
Write-Host "Running Route Optimizer tests..." -ForegroundColor Green
& .\tests\test_route_optimizer.exe
