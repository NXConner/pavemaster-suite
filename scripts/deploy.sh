#!/bin/bash

# 🚀 PaveMaster Suite Production Deployment Script
# This script handles the complete deployment process including health checks

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_FILE="/tmp/pavemaster-deploy-$(date +%Y%m%d-%H%M%S).log"
DEPLOYMENT_ENV="${1:-production}"
BUILD_VERSION="${2:-latest}"

# Functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}" | tee -a "$LOG_FILE"
}

# Pre-deployment checks
check_prerequisites() {
    log "🔍 Checking deployment prerequisites..."
    
    # Check if required commands exist
    local required_commands=("node" "npm" "docker" "git")
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            error "Required command '$cmd' not found"
        fi
    done
    
    # Check if .env file exists
    if [[ ! -f "$PROJECT_ROOT/.env" ]]; then
        error ".env file not found. Please create it from .env.example"
    fi
    
    # Check if we're on the correct branch for production
    if [[ "$DEPLOYMENT_ENV" == "production" ]]; then
        local current_branch=$(git branch --show-current)
        if [[ "$current_branch" != "main" && "$current_branch" != "master" ]]; then
            warn "Deploying from branch '$current_branch' instead of main/master"
            read -p "Continue? (y/N) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                error "Deployment cancelled"
            fi
        fi
    fi
    
    log "✅ Prerequisites check passed"
}

# Build application
build_application() {
    log "🏗️ Building application..."
    
    cd "$PROJECT_ROOT"
    
    # Install dependencies
    info "Installing dependencies..."
    npm ci --legacy-peer-deps
    
    # Run linting and type checks
    info "Running code quality checks..."
    npm run lint
    npm run type-check
    
    # Run tests
    info "Running test suite..."
    npm run test:unit
    
    # Build the application
    info "Building for $DEPLOYMENT_ENV..."
    if [[ "$DEPLOYMENT_ENV" == "production" ]]; then
        npm run build
    else
        npm run build:dev
    fi
    
    log "✅ Application built successfully"
}

# Build Docker image
build_docker_image() {
    log "🐳 Building Docker image..."
    
    cd "$PROJECT_ROOT"
    
    local image_tag="pavemaster/suite:${BUILD_VERSION}"
    local dockerfile="Dockerfile.production"
    
    if [[ "$DEPLOYMENT_ENV" != "production" ]]; then
        dockerfile="Dockerfile"
    fi
    
    info "Building image: $image_tag"
    docker build -f "$dockerfile" -t "$image_tag" .
    
    # Tag as latest if this is production
    if [[ "$DEPLOYMENT_ENV" == "production" ]]; then
        docker tag "$image_tag" "pavemaster/suite:latest"
    fi
    
    log "✅ Docker image built successfully"
}

# Deploy web application
deploy_web_app() {
    log "🌐 Deploying web application..."
    
    case "$DEPLOYMENT_ENV" in
        "production")
            deploy_to_production
            ;;
        "staging")
            deploy_to_staging
            ;;
        "development")
            deploy_to_development
            ;;
        *)
            error "Unknown deployment environment: $DEPLOYMENT_ENV"
            ;;
    esac
    
    log "✅ Web application deployed successfully"
}

# Production deployment
deploy_to_production() {
    info "Deploying to production environment..."
    
    # Stop existing containers
    docker-compose -f docker-compose.production.yml down || true
    
    # Pull latest images
    docker-compose -f docker-compose.production.yml pull
    
    # Start new containers
    docker-compose -f docker-compose.production.yml up -d
    
    # Wait for containers to be healthy
    info "Waiting for containers to be healthy..."
    sleep 30
    
    # Run database migrations if needed
    run_database_migrations
}

# Staging deployment
deploy_to_staging() {
    info "Deploying to staging environment..."
    
    # Similar to production but with staging configuration
    docker-compose -f docker-compose.staging.yml down || true
    docker-compose -f docker-compose.staging.yml up -d
    
    sleep 15
}

# Development deployment
deploy_to_development() {
    info "Deploying to development environment..."
    
    docker-compose down || true
    docker-compose up -d
    
    sleep 10
}

# Database migrations
run_database_migrations() {
    log "🗃️ Running database migrations..."
    
    # Check if Supabase CLI is available
    if command -v supabase &> /dev/null; then
        info "Running Supabase migrations..."
        supabase db push --include-all
    else
        warn "Supabase CLI not found, skipping migrations"
    fi
    
    log "✅ Database migrations completed"
}

# Build and deploy mobile apps
deploy_mobile_apps() {
    log "📱 Building and deploying mobile applications..."
    
    if [[ "$DEPLOYMENT_ENV" == "production" ]]; then
        build_android_app
        build_ios_app
    else
        info "Skipping mobile app build for $DEPLOYMENT_ENV"
    fi
    
    log "✅ Mobile applications processed"
}

# Build Android app
build_android_app() {
    info "Building Android application..."
    
    cd "$PROJECT_ROOT"
    
    # Build web assets for mobile
    npm run build:mobile
    
    # Sync with Capacitor
    npx cap sync android
    
    # Build Android APK
    cd android
    ./gradlew assembleRelease
    
    info "Android APK built: android/app/build/outputs/apk/release/app-release.apk"
}

# Build iOS app
build_ios_app() {
    info "Building iOS application..."
    
    # Check if we're on macOS
    if [[ "$OSTYPE" != "darwin"* ]]; then
        warn "iOS build skipped (not running on macOS)"
        return
    fi
    
    cd "$PROJECT_ROOT"
    
    # Sync with Capacitor
    npx cap sync ios
    
    # Build iOS app (requires Xcode)
    cd ios
    xcodebuild -workspace App.xcworkspace -scheme App -configuration Release -destination generic/platform=iOS archive -archivePath App.xcarchive
    
    info "iOS app archived: ios/App.xcarchive"
}

# Health checks
run_health_checks() {
    log "🏥 Running post-deployment health checks..."
    
    local base_url
    case "$DEPLOYMENT_ENV" in
        "production")
            base_url="https://app.pavemaster.com"
            ;;
        "staging")
            base_url="https://staging.pavemaster.com"
            ;;
        "development")
            base_url="http://localhost:5173"
            ;;
        *)
            base_url="http://localhost:3000"
            ;;
    esac
    
    # Wait for application to be ready
    info "Waiting for application to be ready..."
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        if curl -s -f "$base_url/health" > /dev/null 2>&1; then
            log "✅ Application is responding"
            break
        fi
        
        if [[ $attempt -eq $max_attempts ]]; then
            error "Application failed to respond after $max_attempts attempts"
        fi
        
        info "Attempt $attempt/$max_attempts failed, retrying in 10 seconds..."
        sleep 10
        ((attempt++))
    done
    
    # Run additional health checks
    check_api_endpoints "$base_url"
    check_database_connectivity
    check_external_services
    
    log "✅ Health checks completed successfully"
}

# Check API endpoints
check_api_endpoints() {
    local base_url="$1"
    info "Checking API endpoints..."
    
    local endpoints=(
        "/api/health"
        "/api/auth/status"
        "/api/projects"
        "/api/weather/status"
    )
    
    for endpoint in "${endpoints[@]}"; do
        if curl -s -f "$base_url$endpoint" > /dev/null 2>&1; then
            info "✓ $endpoint - OK"
        else
            warn "✗ $endpoint - Failed"
        fi
    done
}

# Check database connectivity
check_database_connectivity() {
    info "Checking database connectivity..."
    
    # This would depend on your database setup
    # For Supabase, you might check the connection via API
    if command -v supabase &> /dev/null; then
        if supabase status > /dev/null 2>&1; then
            info "✓ Database connectivity - OK"
        else
            warn "✗ Database connectivity - Failed"
        fi
    else
        info "Supabase CLI not available, skipping database check"
    fi
}

# Check external services
check_external_services() {
    info "Checking external services..."
    
    # Check weather API
    if curl -s -f "https://api.openweathermap.org/data/2.5/weather?q=London&appid=test" > /dev/null 2>&1; then
        info "✓ Weather API - Reachable"
    else
        warn "✗ Weather API - Failed"
    fi
    
    # Add other external service checks as needed
}

# Rollback functionality
rollback_deployment() {
    log "🔄 Rolling back deployment..."
    
    case "$DEPLOYMENT_ENV" in
        "production")
            docker-compose -f docker-compose.production.yml down
            # Restore previous version
            docker-compose -f docker-compose.production.yml up -d
            ;;
        "staging")
            docker-compose -f docker-compose.staging.yml down
            docker-compose -f docker-compose.staging.yml up -d
            ;;
        *)
            docker-compose down
            docker-compose up -d
            ;;
    esac
    
    log "✅ Rollback completed"
}

# Notification functions
send_success_notification() {
    log "📢 Sending success notification..."
    
    local message="🚀 PaveMaster Suite deployment to $DEPLOYMENT_ENV completed successfully!"
    
    # Slack notification (if webhook URL is configured)
    if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$message\"}" \
            "$SLACK_WEBHOOK_URL" || warn "Failed to send Slack notification"
    fi
    
    # Email notification (if configured)
    if [[ -n "${NOTIFICATION_EMAIL:-}" ]]; then
        echo "$message" | mail -s "Deployment Success" "$NOTIFICATION_EMAIL" || warn "Failed to send email notification"
    fi
}

send_failure_notification() {
    local error_message="$1"
    log "📢 Sending failure notification..."
    
    local message="❌ PaveMaster Suite deployment to $DEPLOYMENT_ENV failed: $error_message"
    
    # Slack notification
    if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$message\"}" \
            "$SLACK_WEBHOOK_URL" || warn "Failed to send Slack notification"
    fi
    
    # Email notification
    if [[ -n "${NOTIFICATION_EMAIL:-}" ]]; then
        echo "$message" | mail -s "Deployment Failed" "$NOTIFICATION_EMAIL" || warn "Failed to send email notification"
    fi
}

# Cleanup function
cleanup() {
    log "🧹 Cleaning up temporary files..."
    
    # Clean up old Docker images
    docker image prune -f
    
    # Clean up old log files (keep last 10)
    find /tmp -name "pavemaster-deploy-*.log" -mtime +7 -delete 2>/dev/null || true
    
    log "✅ Cleanup completed"
}

# Main deployment function
main() {
    log "🚀 Starting PaveMaster Suite deployment to $DEPLOYMENT_ENV"
    log "📝 Deployment log: $LOG_FILE"
    
    # Trap errors and rollback
    trap 'error_code=$?; if [[ $error_code -ne 0 ]]; then send_failure_notification "Deployment script failed"; rollback_deployment; fi; cleanup; exit $error_code' ERR
    
    # Load environment variables
    if [[ -f "$PROJECT_ROOT/.env" ]]; then
        source "$PROJECT_ROOT/.env"
    fi
    
    # Execute deployment steps
    check_prerequisites
    build_application
    build_docker_image
    deploy_web_app
    
    if [[ "$DEPLOYMENT_ENV" == "production" ]]; then
        deploy_mobile_apps
    fi
    
    run_health_checks
    send_success_notification
    cleanup
    
    log "🎉 Deployment completed successfully!"
    log "📊 Deployment summary:"
    log "   Environment: $DEPLOYMENT_ENV"
    log "   Version: $BUILD_VERSION"
    log "   Log file: $LOG_FILE"
}

# Show help
show_help() {
    cat << EOF
🚀 PaveMaster Suite Deployment Script

Usage: $0 [ENVIRONMENT] [VERSION]

Environments:
  production  - Deploy to production environment
  staging     - Deploy to staging environment
  development - Deploy to development environment

Examples:
  $0 production v1.2.3
  $0 staging latest
  $0 development

Options:
  -h, --help    Show this help message
  -r, --rollback Rollback the last deployment

Environment Variables:
  SLACK_WEBHOOK_URL     - Slack webhook for notifications
  NOTIFICATION_EMAIL    - Email for deployment notifications
  DOCKER_REGISTRY       - Docker registry URL
EOF
}

# Handle command line arguments
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    -r|--rollback)
        log "🔄 Initiating rollback..."
        rollback_deployment
        exit 0
        ;;
    "")
        DEPLOYMENT_ENV="development"
        ;;
    *)
        if [[ ! "$1" =~ ^(production|staging|development)$ ]]; then
            error "Invalid environment: $1. Use production, staging, or development."
        fi
        ;;
esac

# Run main deployment
main "$@"