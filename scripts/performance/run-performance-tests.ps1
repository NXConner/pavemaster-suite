# Performance Testing PowerShell Script for PaveMaster Suite
# This script runs comprehensive performance tests using both K6 and Artillery

param(
    [string]$BaseUrl = "http://localhost:8080"
)

Write-Host "🚀 Starting Performance Tests for PaveMaster Suite" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Configuration
$ResultsDir = "./performance-results"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

# Create results directory
if (!(Test-Path $ResultsDir)) {
    New-Item -ItemType Directory -Path $ResultsDir | Out-Null
}

Write-Host "📊 Test Configuration:" -ForegroundColor Cyan
Write-Host "  Base URL: $BaseUrl" -ForegroundColor White
Write-Host "  Results Directory: $ResultsDir" -ForegroundColor White
Write-Host "  Timestamp: $Timestamp" -ForegroundColor White
Write-Host ""

# Check if application is running
Write-Host "🔍 Checking if application is accessible..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $BaseUrl -Method Head -TimeoutSec 10
    Write-Host "✅ Application is accessible at $BaseUrl" -ForegroundColor Green
} catch {
    Write-Host "❌ Application is not accessible at $BaseUrl" -ForegroundColor Red
    Write-Host "Please ensure the application is running before running performance tests." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Run K6 tests if k6 is available
if (Get-Command k6 -ErrorAction SilentlyContinue) {
    Write-Host "🏃 Running K6 Load Tests..." -ForegroundColor Cyan
    Write-Host "----------------------------" -ForegroundColor Cyan
    
    $env:BASE_URL = $BaseUrl
    k6 run --out "json=$ResultsDir/k6-results-$Timestamp.json" --out "csv=$ResultsDir/k6-results-$Timestamp.csv" scripts/performance/load-test.js
    
    Write-Host "✅ K6 tests completed" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "⚠️  K6 not found. Install from: https://k6.io/docs/getting-started/installation/" -ForegroundColor Yellow
    Write-Host ""
}

# Run Artillery tests if artillery is available
if (Get-Command artillery -ErrorAction SilentlyContinue) {
    Write-Host "🎯 Running Artillery Load Tests..." -ForegroundColor Cyan
    Write-Host "----------------------------------" -ForegroundColor Cyan
    
    $env:BASE_URL = $BaseUrl
    artillery run --output "$ResultsDir/artillery-results-$Timestamp.json" scripts/performance/artillery-test.yml
    
    # Generate HTML report
    artillery report "$ResultsDir/artillery-results-$Timestamp.json" --output "$ResultsDir/artillery-report-$Timestamp.html"
    
    Write-Host "✅ Artillery tests completed" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "⚠️  Artillery not found. Install with: npm install -g artillery" -ForegroundColor Yellow
    Write-Host ""
}

# Performance summary
Write-Host "📈 Performance Test Summary" -ForegroundColor Green
Write-Host "============================" -ForegroundColor Green
Write-Host "Results saved in: $ResultsDir" -ForegroundColor White
Write-Host ""

if (Test-Path "$ResultsDir/k6-results-$Timestamp.json") {
    Write-Host "📊 K6 Results:" -ForegroundColor Cyan
    Write-Host "  - JSON: $ResultsDir/k6-results-$Timestamp.json" -ForegroundColor White
    Write-Host "  - CSV: $ResultsDir/k6-results-$Timestamp.csv" -ForegroundColor White
}

if (Test-Path "$ResultsDir/artillery-results-$Timestamp.json") {
    Write-Host "🎯 Artillery Results:" -ForegroundColor Cyan
    Write-Host "  - JSON: $ResultsDir/artillery-results-$Timestamp.json" -ForegroundColor White
    Write-Host "  - HTML Report: $ResultsDir/artillery-report-$Timestamp.html" -ForegroundColor White
}

Write-Host ""
Write-Host "🎉 Performance testing completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Review the generated reports" -ForegroundColor White
Write-Host "  2. Check for performance bottlenecks" -ForegroundColor White
Write-Host "  3. Optimize code based on findings" -ForegroundColor White
Write-Host "  4. Re-run tests to verify improvements" -ForegroundColor White