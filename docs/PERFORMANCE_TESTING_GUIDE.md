# Performance Testing Guide - PaveMaster Suite

## Overview

This guide covers performance testing for the PaveMaster Suite using K6 and Artillery load testing tools. Performance testing ensures the application can handle expected user loads and performs optimally under stress.

## Prerequisites

### Required Tools

1. **K6** - Modern load testing tool
   ```bash
   # macOS
   brew install k6
   
   # Windows (via Chocolatey)
   choco install k6
   
   # Ubuntu/Debian
   sudo gpg -k
   sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
   echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
   sudo apt-get update
   sudo apt-get install k6
   ```

2. **Artillery** - Feature-rich load testing toolkit
   ```bash
   npm install -g artillery
   ```

### Application Setup

Ensure the PaveMaster Suite is running before executing performance tests:

```bash
# Start development server
npm run dev

# Or production build
npm run build
npm run preview
```

## Test Execution

### Automated Test Execution

**Linux/macOS:**
```bash
# Make script executable
chmod +x scripts/performance/run-performance-tests.sh

# Run tests against localhost
./scripts/performance/run-performance-tests.sh

# Run tests against custom URL
BASE_URL=https://your-domain.com ./scripts/performance/run-performance-tests.sh
```

**Windows:**
```powershell
# Run tests against localhost
.\scripts\performance\run-performance-tests.ps1

# Run tests against custom URL
.\scripts\performance\run-performance-tests.ps1 -BaseUrl "https://your-domain.com"
```

### Manual Test Execution

**K6 Tests:**
```bash
# Basic test
k6 run scripts/performance/load-test.js

# With custom base URL
BASE_URL=https://your-domain.com k6 run scripts/performance/load-test.js

# With results output
k6 run --out json=results.json --out csv=results.csv scripts/performance/load-test.js
```

**Artillery Tests:**
```bash
# Basic test
artillery run scripts/performance/artillery-test.yml

# With custom base URL
BASE_URL=https://your-domain.com artillery run scripts/performance/artillery-test.yml

# With results output and HTML report
artillery run --output results.json scripts/performance/artillery-test.yml
artillery report results.json --output report.html
```

## Test Scenarios

### K6 Load Test Scenarios

1. **Homepage Load Test**
   - Tests main dashboard loading performance
   - Verifies response times under load
   - Checks for memory leaks and resource usage

2. **Authentication Flow Test**
   - Tests login/logout performance
   - Verifies session management under load
   - Checks authentication response times

3. **Page Navigation Test**
   - Tests routing performance between pages
   - Verifies component loading times
   - Checks for navigation bottlenecks

4. **API Endpoint Test**
   - Tests backend API performance
   - Verifies database query response times
   - Checks for API rate limiting

### Artillery Test Scenarios

1. **User Journey Simulation**
   - Simulates complete user workflows
   - Tests realistic usage patterns
   - Includes think time between actions

2. **Concurrent User Testing**
   - Tests multiple simultaneous users
   - Verifies system stability under load
   - Checks resource scaling behavior

## Performance Targets

### Response Time Targets

- **Page Load Time**: < 2 seconds
- **API Response Time**: < 500ms (95th percentile)
- **Database Query Time**: < 200ms (average)
- **Asset Loading Time**: < 1 second

### Load Targets

- **Concurrent Users**: 100+ simultaneous users
- **Requests per Second**: 1000+ RPS
- **Error Rate**: < 1% under normal load
- **Availability**: 99.9% uptime

### Resource Targets

- **Memory Usage**: < 512MB per instance
- **CPU Usage**: < 80% under peak load
- **Network Bandwidth**: < 10Mbps per instance
- **Storage I/O**: < 100 IOPS per instance

## Interpreting Results

### K6 Metrics

- **http_req_duration**: Request response time
- **http_req_failed**: Failed request rate
- **iterations**: Number of test iterations completed
- **vus**: Virtual users currently active

### Artillery Metrics

- **Response Time**: p50, p95, p99 percentiles
- **Request Rate**: Requests per second
- **Error Rate**: Percentage of failed requests
- **Throughput**: Data transferred per second

### Performance Bottleneck Indicators

1. **High Response Times**: Database queries, large payloads, slow APIs
2. **High Error Rates**: Server overload, memory issues, timeouts
3. **Memory Leaks**: Gradually increasing memory usage
4. **CPU Spikes**: Inefficient algorithms, blocking operations

## Optimization Strategies

### Frontend Optimizations

1. **Code Splitting**: Lazy load components and routes
2. **Asset Optimization**: Compress images, minify CSS/JS
3. **Caching**: Implement browser and CDN caching
4. **Bundle Analysis**: Remove unused dependencies

### Backend Optimizations

1. **Database Indexing**: Optimize slow queries
2. **Connection Pooling**: Manage database connections
3. **Caching Layers**: Redis/Memcached for frequent data
4. **API Rate Limiting**: Prevent abuse and overload

### Infrastructure Optimizations

1. **Load Balancing**: Distribute traffic across instances
2. **Auto Scaling**: Scale resources based on demand
3. **CDN**: Serve static assets from edge locations
4. **Monitoring**: Implement real-time performance monitoring

## Continuous Performance Testing

### CI/CD Integration

Add performance testing to your deployment pipeline:

```yaml
# .github/workflows/performance.yml
name: Performance Tests
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Build application
        run: npm run build
      - name: Start application
        run: npm run preview &
      - name: Wait for application
        run: sleep 10
      - name: Install K6
        run: |
          sudo gpg -k
          sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update
          sudo apt-get install k6
      - name: Run performance tests
        run: BASE_URL=http://localhost:4173 k6 run scripts/performance/load-test.js
```

### Automated Alerts

Set up alerts for performance regressions:

1. **Response Time Degradation**: > 20% increase
2. **Error Rate Increase**: > 5% error rate
3. **Throughput Decrease**: > 30% reduction
4. **Resource Usage Spikes**: > 90% CPU/Memory

## Troubleshooting Common Issues

### High Response Times

1. Check database query performance
2. Verify network latency
3. Analyze bundle size and loading
4. Check for blocking operations

### High Error Rates

1. Check server logs for errors
2. Verify database connections
3. Check rate limiting configuration
4. Analyze memory usage patterns

### Test Failures

1. Ensure application is running
2. Check network connectivity
3. Verify test configuration
4. Review test scenarios for realism

## Best Practices

1. **Realistic Test Data**: Use production-like data volumes
2. **Gradual Load Increase**: Ramp up load gradually
3. **Test Environment Parity**: Mirror production setup
4. **Regular Testing**: Run tests on every deployment
5. **Performance Budgets**: Set and enforce performance limits
6. **Baseline Establishment**: Record initial performance metrics
7. **Regression Testing**: Compare against previous results

## Results Analysis

### Report Generation

Performance test results are automatically saved in the `performance-results` directory:

- **K6 Results**: JSON and CSV formats for detailed analysis
- **Artillery Results**: JSON data with optional HTML reports
- **Timestamps**: All results include execution timestamps
- **Comparisons**: Track performance trends over time

### Key Metrics to Monitor

1. **User Experience Metrics**: Page load times, interaction delays
2. **System Performance**: CPU, memory, network usage
3. **Business Metrics**: Conversion rates, user engagement
4. **Reliability Metrics**: Error rates, availability percentages

This comprehensive performance testing setup ensures the PaveMaster Suite can handle production workloads efficiently and provides early detection of performance regressions.