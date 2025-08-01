#!/bin/bash

# Performance Testing Script for PaveMaster Suite
# This script runs comprehensive performance tests using both K6 and Artillery

set -e

echo "🚀 Starting Performance Tests for PaveMaster Suite"
echo "=================================================="

# Configuration
BASE_URL=${BASE_URL:-"http://localhost:8080"}
RESULTS_DIR="./performance-results"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Create results directory
mkdir -p "$RESULTS_DIR"

echo "📊 Test Configuration:"
echo "  Base URL: $BASE_URL"
echo "  Results Directory: $RESULTS_DIR"
echo "  Timestamp: $TIMESTAMP"
echo ""

# Check if application is running
echo "🔍 Checking if application is accessible..."
if curl -s -f "$BASE_URL" > /dev/null; then
    echo "✅ Application is accessible at $BASE_URL"
else
    echo "❌ Application is not accessible at $BASE_URL"
    echo "Please ensure the application is running before running performance tests."
    exit 1
fi

echo ""

# Run K6 tests if k6 is available
if command -v k6 &> /dev/null; then
    echo "🏃 Running K6 Load Tests..."
    echo "----------------------------"
    
    BASE_URL="$BASE_URL" k6 run \
        --out json="$RESULTS_DIR/k6-results-$TIMESTAMP.json" \
        --out csv="$RESULTS_DIR/k6-results-$TIMESTAMP.csv" \
        scripts/performance/load-test.js
    
    echo "✅ K6 tests completed"
    echo ""
else
    echo "⚠️  K6 not found. Install with: brew install k6 (macOS) or https://k6.io/docs/getting-started/installation/"
    echo ""
fi

# Run Artillery tests if artillery is available
if command -v artillery &> /dev/null; then
    echo "🎯 Running Artillery Load Tests..."
    echo "----------------------------------"
    
    BASE_URL="$BASE_URL" artillery run \
        --output "$RESULTS_DIR/artillery-results-$TIMESTAMP.json" \
        scripts/performance/artillery-test.yml
    
    # Generate HTML report
    artillery report \
        "$RESULTS_DIR/artillery-results-$TIMESTAMP.json" \
        --output "$RESULTS_DIR/artillery-report-$TIMESTAMP.html"
    
    echo "✅ Artillery tests completed"
    echo ""
else
    echo "⚠️  Artillery not found. Install with: npm install -g artillery"
    echo ""
fi

# Performance summary
echo "📈 Performance Test Summary"
echo "============================"
echo "Results saved in: $RESULTS_DIR"
echo ""

if [ -f "$RESULTS_DIR/k6-results-$TIMESTAMP.json" ]; then
    echo "📊 K6 Results:"
    echo "  - JSON: $RESULTS_DIR/k6-results-$TIMESTAMP.json"
    echo "  - CSV: $RESULTS_DIR/k6-results-$TIMESTAMP.csv"
fi

if [ -f "$RESULTS_DIR/artillery-results-$TIMESTAMP.json" ]; then
    echo "🎯 Artillery Results:"
    echo "  - JSON: $RESULTS_DIR/artillery-results-$TIMESTAMP.json"
    echo "  - HTML Report: $RESULTS_DIR/artillery-report-$TIMESTAMP.html"
fi

echo ""
echo "🎉 Performance testing completed!"
echo ""
echo "📋 Next Steps:"
echo "  1. Review the generated reports"
echo "  2. Check for performance bottlenecks"
echo "  3. Optimize code based on findings"
echo "  4. Re-run tests to verify improvements"