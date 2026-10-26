Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Compiling and Running RoutePilot Phase 2 Dijkstra Tests..." -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

g++ -std=c++17 -Wall -Wextra -Wl,--nxcompat,--dynamicbase -I cpp-engine/include cpp-engine/src/Graph.cpp cpp-engine/src/SampleData.cpp tests/test_dijkstra.cpp -o tests/test_dijkstra.exe
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Compilation failed with exit code $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host ""
Write-Host "Running Dijkstra tests..." -ForegroundColor Green
& .\tests\test_dijkstra.exe
