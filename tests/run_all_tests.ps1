Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Running ALL RoutePilot C++ Engine Tests (Phases 1-4)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

Write-Host "`n[1/4] Running Phase 1 Graph Core tests..." -ForegroundColor Yellow
& .\tests\run_phase1_tests.ps1
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "`n[2/4] Running Phase 2 Dijkstra tests..." -ForegroundColor Yellow
& .\tests\run_phase2_tests.ps1
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "`n[3/4] Running Phase 3 Route Optimizer tests..." -ForegroundColor Yellow
& .\tests\run_phase3_tests.ps1
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "`n[4/4] Running Phase 4 Engine Interface tests..." -ForegroundColor Yellow
& .\tests\run_phase4_tests.ps1
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host "[SUCCESS] ALL TEST SUITES (PHASES 1 - 4) PASSED!" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
