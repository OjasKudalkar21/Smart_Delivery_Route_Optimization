Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Compiling and Running RoutePilot Phase 1 Core Tests..." -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

g++ -std=c++17 -Wall -Wextra -Wl,--nxcompat,--dynamicbase -I cpp-engine/include cpp-engine/src/Graph.cpp cpp-engine/src/SampleData.cpp tests/test_graph_core.cpp -o tests/test_graph_core.exe
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Compilation failed with exit code $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host ""
Write-Host "Running tests..." -ForegroundColor Green
& .\tests\test_graph_core.exe
