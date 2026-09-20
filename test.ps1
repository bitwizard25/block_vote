Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  BLOCKVOTE -- COMPREHENSIVE TEST SUITE RUNNER  " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host ">>> [1/2] RUNNING BACKEND GO UNIT AND E2E TESTS..." -ForegroundColor Yellow
go test -v ./...
if ($LASTEXITCODE -ne 0) {
    Write-Host "Backend Go tests failed!" -ForegroundColor Red
    exit 1
}
Write-Host "SUCCESS: All Backend Go Unit and E2E Tests Passed!" -ForegroundColor Green
Write-Host ""

Write-Host ">>> [2/2] RUNNING FRONTEND REACT AND REDUX TESTS..." -ForegroundColor Yellow
Set-Location frontend
npm test
$frontendCode = $LASTEXITCODE
Set-Location ..

if ($frontendCode -ne 0) {
    Write-Host "Frontend tests failed!" -ForegroundColor Red
    exit 1
}
Write-Host "SUCCESS: All Frontend React and Redux Tests Passed!" -ForegroundColor Green
Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  ALL TESTS PASSED! 100% GREEN (BACKEND + FRONTEND)   " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
