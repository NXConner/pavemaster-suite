#!/bin/sh

# PaveMaster Suite Health Check Script
# Comprehensive health monitoring for production deployment

set -e

# Configuration
HEALTH_CHECK_URL="http://localhost/health"
APP_URL="http://localhost"
TIMEOUT=5
MAX_RETRIES=3
LOG_FILE="/tmp/health-check.log"

# Colors for output (if terminal supports it)
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

error() {
    echo "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo "${GREEN}[OK]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Check if curl is available
check_curl() {
    if ! command -v curl >/dev/null 2>&1; then
        error "curl is not available"
        exit 1
    fi
}

# Check nginx process
check_nginx_process() {
    log "Checking nginx process..."
    
    if ! pgrep nginx >/dev/null; then
        error "nginx process not found"
        return 1
    fi
    
    success "nginx process is running"
    return 0
}

# Check nginx configuration
check_nginx_config() {
    log "Checking nginx configuration..."
    
    if ! nginx -t >/dev/null 2>&1; then
        error "nginx configuration is invalid"
        return 1
    fi
    
    success "nginx configuration is valid"
    return 0
}

# Check disk space
check_disk_space() {
    log "Checking disk space..."
    
    # Check if disk usage is above 90%
    disk_usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ "$disk_usage" -gt 90 ]; then
        error "Disk usage is critical: ${disk_usage}%"
        return 1
    elif [ "$disk_usage" -gt 80 ]; then
        warning "Disk usage is high: ${disk_usage}%"
    fi
    
    success "Disk usage is acceptable: ${disk_usage}%"
    return 0
}

# Check memory usage
check_memory() {
    log "Checking memory usage..."
    
    # Check available memory
    if command -v free >/dev/null 2>&1; then
        mem_usage=$(free | awk 'NR==2{printf "%.2f", $3*100/$2}')
        mem_usage_int=${mem_usage%.*}
        
        if [ "$mem_usage_int" -gt 90 ]; then
            error "Memory usage is critical: ${mem_usage}%"
            return 1
        elif [ "$mem_usage_int" -gt 80 ]; then
            warning "Memory usage is high: ${mem_usage}%"
        fi
        
        success "Memory usage is acceptable: ${mem_usage}%"
    else
        warning "Cannot check memory usage - 'free' command not available"
    fi
    
    return 0
}

# Check HTTP health endpoint
check_http_health() {
    log "Checking HTTP health endpoint..."
    
    local retry=1
    while [ $retry -le $MAX_RETRIES ]; do
        if curl -f -s --max-time $TIMEOUT "$HEALTH_CHECK_URL" >/dev/null 2>&1; then
            success "Health endpoint is responding"
            return 0
        fi
        
        log "Health check attempt $retry failed, retrying..."
        retry=$((retry + 1))
        sleep 1
    done
    
    error "Health endpoint is not responding after $MAX_RETRIES attempts"
    return 1
}

# Check application availability
check_app_availability() {
    log "Checking application availability..."
    
    local retry=1
    while [ $retry -le $MAX_RETRIES ]; do
        response=$(curl -s --max-time $TIMEOUT -w "%{http_code}" -o /dev/null "$APP_URL" 2>/dev/null || echo "000")
        
        if [ "$response" = "200" ]; then
            success "Application is available (HTTP $response)"
            return 0
        fi
        
        log "Application check attempt $retry failed (HTTP $response), retrying..."
        retry=$((retry + 1))
        sleep 1
    done
    
    error "Application is not available after $MAX_RETRIES attempts (HTTP $response)"
    return 1
}

# Check SSL certificate (if HTTPS is enabled)
check_ssl_certificate() {
    if [ -n "$SSL_CERT_PATH" ] && [ -f "$SSL_CERT_PATH" ]; then
        log "Checking SSL certificate..."
        
        # Check certificate expiration
        if command -v openssl >/dev/null 2>&1; then
            cert_expiry=$(openssl x509 -in "$SSL_CERT_PATH" -noout -enddate | cut -d= -f2)
            cert_expiry_epoch=$(date -d "$cert_expiry" +%s 2>/dev/null || echo "0")
            current_epoch=$(date +%s)
            days_until_expiry=$(( (cert_expiry_epoch - current_epoch) / 86400 ))
            
            if [ "$days_until_expiry" -lt 7 ]; then
                error "SSL certificate expires in $days_until_expiry days"
                return 1
            elif [ "$days_until_expiry" -lt 30 ]; then
                warning "SSL certificate expires in $days_until_expiry days"
            fi
            
            success "SSL certificate is valid (expires in $days_until_expiry days)"
        else
            warning "Cannot check SSL certificate - 'openssl' command not available"
        fi
    fi
    
    return 0
}

# Check application files
check_app_files() {
    log "Checking application files..."
    
    # Check if index.html exists
    if [ ! -f "/usr/share/nginx/html/index.html" ]; then
        error "index.html not found"
        return 1
    fi
    
    # Check if assets directory exists
    if [ ! -d "/usr/share/nginx/html/assets" ]; then
        warning "assets directory not found"
    fi
    
    success "Application files are present"
    return 0
}

# Check file permissions
check_file_permissions() {
    log "Checking file permissions..."
    
    # Check nginx html directory permissions
    if [ ! -r "/usr/share/nginx/html" ]; then
        error "nginx html directory is not readable"
        return 1
    fi
    
    # Check if nginx can write to log directory
    if [ ! -w "/var/log/nginx" ]; then
        error "nginx log directory is not writable"
        return 1
    fi
    
    success "File permissions are correct"
    return 0
}

# Performance check
check_performance() {
    log "Checking performance metrics..."
    
    # Measure response time
    response_time=$(curl -o /dev/null -s -w "%{time_total}" --max-time $TIMEOUT "$APP_URL" 2>/dev/null || echo "999")
    response_time_ms=$(echo "$response_time * 1000" | bc 2>/dev/null || echo "999")
    
    if [ "$(echo "$response_time > 5" | bc 2>/dev/null || echo "1")" = "1" ]; then
        error "Response time is too slow: ${response_time}s"
        return 1
    elif [ "$(echo "$response_time > 2" | bc 2>/dev/null || echo "0")" = "1" ]; then
        warning "Response time is slow: ${response_time}s"
    fi
    
    success "Response time is acceptable: ${response_time}s"
    return 0
}

# Main health check function
main() {
    log "Starting health check..."
    
    local exit_code=0
    
    # Initialize log file
    echo "Health check started at $(date)" > "$LOG_FILE"
    
    # Required checks
    check_curl || exit_code=1
    check_nginx_process || exit_code=1
    check_app_files || exit_code=1
    check_http_health || exit_code=1
    check_app_availability || exit_code=1
    
    # Optional checks (warnings don't fail the health check)
    check_nginx_config || true
    check_disk_space || exit_code=1
    check_memory || true
    check_file_permissions || exit_code=1
    check_ssl_certificate || true
    check_performance || true
    
    if [ $exit_code -eq 0 ]; then
        success "All health checks passed"
        log "Health check completed successfully"
    else
        error "Some health checks failed"
        log "Health check completed with errors"
    fi
    
    return $exit_code
}

# Cleanup function
cleanup() {
    # Remove old log files (keep last 7 days)
    find "$(dirname "$LOG_FILE")" -name "health-check.log.*" -mtime +7 -delete 2>/dev/null || true
    
    # Rotate current log if it's too large (>1MB)
    if [ -f "$LOG_FILE" ] && [ $(stat -f%z "$LOG_FILE" 2>/dev/null || stat -c%s "$LOG_FILE" 2>/dev/null || echo 0) -gt 1048576 ]; then
        mv "$LOG_FILE" "${LOG_FILE}.$(date +%Y%m%d_%H%M%S)"
    fi
}

# Trap cleanup
trap cleanup EXIT

# Run main function
main "$@"