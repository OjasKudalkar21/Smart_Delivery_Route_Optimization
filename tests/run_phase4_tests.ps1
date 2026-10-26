Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Compiling and Running RoutePilot Phase 4 Interface Tests..." -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$compileCmd = "g++ -std=c++17 -Wall -Wextra -Wl,--nxcompat,--dynamicbase -I cpp-engine/include cpp-engine/src/Graph.cpp cpp-engine/src/SampleData.cpp cpp-engine/src/RouteOptimizer.cpp cpp-engine/src/EngineHandler.cpp tests/test_engine_interface.cpp -o tests/test_engine_interface.exe"
Invoke-Expression $compileCmd

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Compilation failed with exit code $LASTEXITCODE!" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "`nRunning Engine Interface tests:" -ForegroundColor Yellow
& .\tests\test_engine_interface.exe
