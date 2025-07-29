#!/bin/bash

# PaveMaster Suite Deployment Script
# This script handles deployment to staging and production environments

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if required tools are installed
    command -v docker >/dev/null 2>&1 || { log_error "Docker is required but not installed. Aborting."; exit 1; }
    command -v npm >/dev/null 2>&1 || { log_error "npm is required but not installed. Aborting."; exit 1; }
    
    # Check if required environment variables are set
    if [ "$ENVIRONMENT" = "production" ]; then
        [ -z "$SUPABASE_PROJECT_ID" ] && { log_error "SUPABASE_PROJECT_ID is required for production deployment. Aborting."; exit 1; }
        [ -z "$SUPABASE_API_KEY" ] && { log_error "SUPABASE_API_KEY is required for production deployment. Aborting."; exit 1; }
    fi
    
    log_success "Prerequisites check passed"
}

# Build application
build_application() {
    log_info "Building application..."
    
    # Install dependencies
    npm ci --only=production
    
    # Run build
    npm run build
    
    # Verify build output
    if [ ! -d "dist" ]; then
        log_error "Build failed - dist directory not found"
        exit 1
    fi
    
    log_success "Application built successfully"
}

# Run tests
run_tests() {
    log_info "Running tests..."
    
    # Run unit tests
    npm run test:unit || { log_error "Unit tests failed"; exit 1; }
    
    # Run integration tests
    npm run test:integration || { log_error "Integration tests failed"; exit 1; }
    
    # Run end-to-end tests for staging/production
    if [ "$ENVIRONMENT" != "development" ]; then
        npm run test:e2e || { log_error "E2E tests failed"; exit 1; }
    fi
    
    log_success "All tests passed"
}

# Build Docker image
build_docker_image() {
    log_info "Building Docker image..."
    
    local tag="pavemaster-suite:${ENVIRONMENT}-$(date +%Y%m%d-%H%M%S)"
    
    docker build -t "$tag" .
    docker tag "$tag" "pavemaster-suite:${ENVIRONMENT}-latest"
    
    echo "$tag" > .docker-tag
    log_success "Docker image built: $tag"
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        # Create backup before migrations
        log_info "Creating database backup..."
        # Add backup logic here
        
        # Run migrations with extra caution
        log_warning "Running production migrations - this may take a while..."
        # Add migration logic here
    else
        # Run migrations for staging
        log_info "Running staging migrations..."
        # Add migration logic here
    fi
    
    log_success "Database migrations completed"
}

# Deploy application
deploy_application() {
    log_info "Deploying application to $ENVIRONMENT..."
    
    local image_tag=$(cat .docker-tag)
    
    case $ENVIRONMENT in
        "staging")
            log_info "Deploying to staging environment..."
            # Add staging deployment logic here
            # This might include:
            # - Pushing to staging registry
            # - Updating Kubernetes manifests
            # - Rolling deployment
            ;;
        "production")
            log_info "Deploying to production environment..."
            # Add production deployment logic here
            # This might include:
            # - Blue-green deployment
            # - Rolling updates with health checks
            # - CDN cache invalidation
            ;;
        *)
            log_error "Unknown environment: $ENVIRONMENT"
            exit 1
            ;;
    esac
    
    log_success "Application deployed to $ENVIRONMENT"
}

# Run smoke tests
run_smoke_tests() {
    log_info "Running smoke tests for $ENVIRONMENT..."
    
    case $ENVIRONMENT in
        "staging")
            npm run test:smoke:staging || { log_error "Staging smoke tests failed"; exit 1; }
            ;;
        "production")
            npm run test:smoke:production || { log_error "Production smoke tests failed"; exit 1; }
            ;;
    esac
    
    log_success "Smoke tests passed"
}

# Rollback function
rollback() {
    log_warning "Rolling back deployment..."
    
    # Add rollback logic here
    # This might include:
    # - Reverting to previous Docker image
    # - Rolling back database migrations
    # - Clearing caches
    
    log_success "Rollback completed"
}

# Cleanup function
cleanup() {
    log_info "Cleaning up..."
    
    # Remove temporary files
    [ -f ".docker-tag" ] && rm .docker-tag
    
    # Clean up old Docker images (keep last 5)
    docker images "pavemaster-suite" --format "table {{.Tag}}\t{{.CreatedAt}}" | tail -n +6 | awk '{print $1}' | xargs -r docker rmi "pavemaster-suite:" || true
    
    log_success "Cleanup completed"
}

# Main deployment function
main() {
    local start_time=$(date +%s)
    
    log_info "Starting deployment to $ENVIRONMENT environment..."
    log_info "Deployment started at $(date)"
    
    # Trap errors and run cleanup
    trap 'log_error "Deployment failed"; cleanup; exit 1' ERR
    trap cleanup EXIT
    
    # Deployment steps
    check_prerequisites
    build_application
    run_tests
    build_docker_image
    run_migrations
    deploy_application
    run_smoke_tests
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    log_success "Deployment completed successfully in ${duration} seconds"
    log_success "Deployment finished at $(date)"
}

# Script usage
usage() {
    echo "Usage: $0 <environment>"
    echo "Environments: staging, production"
    echo ""
    echo "Environment variables:"
    echo "  SUPABASE_PROJECT_ID  - Required for production"
    echo "  SUPABASE_API_KEY     - Required for production"
    echo "  DOCKER_REGISTRY      - Docker registry URL (optional)"
    echo ""
    echo "Examples:"
    echo "  $0 staging"
    echo "  $0 production"
}

# Parse command line arguments
if [ $# -eq 0 ]; then
    usage
    exit 1
fi

ENVIRONMENT=$1

case $ENVIRONMENT in
    "staging"|"production")
        main
        ;;
    "rollback")
        rollback
        ;;
    *)
        log_error "Invalid environment: $ENVIRONMENT"
        usage
        exit 1
        ;;
esac