#!/bin/bash

# PaveMaster Suite Deployment Script
# Usage: ./scripts/deploy.sh [environment] [options]
# Environments: development, staging, production
# Options: --dry-run, --rollback, --force, --skip-tests

set -euo pipefail

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BUILD_DIR="$PROJECT_ROOT/dist"
BACKUP_DIR="$PROJECT_ROOT/backups"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT=""
DRY_RUN=false
ROLLBACK=false
FORCE=false
SKIP_TESTS=false
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Help function
show_help() {
    cat << EOF
PaveMaster Suite Deployment Script

Usage: $0 [environment] [options]

Environments:
    development     Deploy to development environment
    staging         Deploy to staging environment  
    production      Deploy to production environment

Options:
    --dry-run       Show what would be deployed without executing
    --rollback      Rollback to previous deployment
    --force         Force deployment without confirmations
    --skip-tests    Skip running tests before deployment
    --help          Show this help message

Examples:
    $0 staging                          # Deploy to staging
    $0 production --dry-run             # Dry run for production
    $0 production --rollback            # Rollback production
    $0 staging --force --skip-tests     # Force deploy to staging without tests

EOF
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            development|staging|production)
                ENVIRONMENT="$1"
                shift
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --rollback)
                ROLLBACK=true
                shift
                ;;
            --force)
                FORCE=true
                shift
                ;;
            --skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

# Validate environment
validate_environment() {
    if [[ -z "$ENVIRONMENT" ]]; then
        error "Environment is required"
        show_help
        exit 1
    fi

    case $ENVIRONMENT in
        development|staging|production)
            log "Deploying to $ENVIRONMENT environment"
            ;;
        *)
            error "Invalid environment: $ENVIRONMENT"
            exit 1
            ;;
    esac
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."

    # Check if required tools are installed
    local required_tools=("node" "npm" "git" "curl")
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            error "$tool is required but not installed"
            exit 1
        fi
    done

    # Check Node.js version
    local node_version=$(node --version | cut -d'v' -f2)
    local required_version="18.0.0"
    if ! node -p "process.exit(require('semver').gte('$node_version', '$required_version') ? 0 : 1)" 2>/dev/null; then
        error "Node.js version $required_version or higher is required (current: $node_version)"
        exit 1
    fi

    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        error "This script must be run from within a git repository"
        exit 1
    fi

    # Check for uncommitted changes in production
    if [[ "$ENVIRONMENT" == "production" ]] && [[ "$FORCE" == false ]]; then
        if ! git diff-index --quiet HEAD --; then
            error "Uncommitted changes detected. Commit or stash changes before production deployment"
            exit 1
        fi
    fi

    success "Prerequisites check passed"
}

# Load environment configuration
load_environment_config() {
    log "Loading environment configuration for $ENVIRONMENT..."

    case $ENVIRONMENT in
        development)
            export VITE_APP_ENV="development"
            export NODE_ENV="development"
            DEPLOY_TARGET="localhost"
            ;;
        staging)
            export VITE_APP_ENV="staging"
            export NODE_ENV="production"
            DEPLOY_TARGET="staging.pavemaster.com"
            ;;
        production)
            export VITE_APP_ENV="production"
            export NODE_ENV="production"
            DEPLOY_TARGET="app.pavemaster.com"
            ;;
    esac

    # Load environment-specific variables from .env files
    local env_file="$PROJECT_ROOT/.env.$ENVIRONMENT"
    if [[ -f "$env_file" ]]; then
        log "Loading environment variables from $env_file"
        set -a
        source "$env_file"
        set +a
    else
        warning "Environment file $env_file not found"
    fi

    success "Environment configuration loaded"
}

# Run tests
run_tests() {
    if [[ "$SKIP_TESTS" == true ]]; then
        warning "Skipping tests as requested"
        return 0
    fi

    log "Running tests..."

    # Install dependencies if needed
    if [[ ! -d "$PROJECT_ROOT/node_modules" ]]; then
        log "Installing dependencies..."
        cd "$PROJECT_ROOT"
        npm ci
    fi

    # Run linting
    log "Running ESLint..."
    npm run lint

    # Run type checking
    log "Running TypeScript type check..."
    npm run type-check || npx tsc --noEmit

    # Run unit tests
    log "Running unit tests..."
    npm run test:unit || npm test

    # Run build test
    log "Running build test..."
    npm run build

    success "All tests passed"
}

# Create backup
create_backup() {
    if [[ "$ENVIRONMENT" == "production" ]] || [[ "$ENVIRONMENT" == "staging" ]]; then
        log "Creating backup..."

        mkdir -p "$BACKUP_DIR"
        
        # Backup current deployment
        local backup_name="backup_${ENVIRONMENT}_${TIMESTAMP}"
        local backup_path="$BACKUP_DIR/$backup_name"
        
        if [[ -d "$BUILD_DIR" ]]; then
            cp -r "$BUILD_DIR" "$backup_path"
            log "Backup created: $backup_path"
        fi

        # Keep only last 10 backups
        find "$BACKUP_DIR" -maxdepth 1 -type d -name "backup_${ENVIRONMENT}_*" | \
            sort | head -n -10 | xargs rm -rf

        success "Backup completed"
    fi
}

# Build application
build_application() {
    log "Building application for $ENVIRONMENT..."

    cd "$PROJECT_ROOT"

    # Clean previous build
    rm -rf "$BUILD_DIR"

    # Install dependencies
    log "Installing dependencies..."
    npm ci --production=false

    # Set build metadata
    export VITE_APP_VERSION=$(node -p "require('./package.json').version")
    export VITE_BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    export VITE_GIT_COMMIT=$(git rev-parse HEAD)

    # Build the application
    log "Building with Vite..."
    npm run build

    # Verify build output
    if [[ ! -d "$BUILD_DIR" ]]; then
        error "Build failed - output directory not found"
        exit 1
    fi

    if [[ ! -f "$BUILD_DIR/index.html" ]]; then
        error "Build failed - index.html not found"
        exit 1
    fi

    # Calculate build size
    local build_size=$(du -sh "$BUILD_DIR" | cut -f1)
    log "Build completed successfully (size: $build_size)"

    success "Application built successfully"
}

# Deploy to environment
deploy_application() {
    log "Deploying to $ENVIRONMENT environment..."

    if [[ "$DRY_RUN" == true ]]; then
        log "DRY RUN - Would deploy to $DEPLOY_TARGET"
        log "Build directory: $BUILD_DIR"
        log "Environment: $ENVIRONMENT"
        return 0
    fi

    case $ENVIRONMENT in
        development)
            deploy_development
            ;;
        staging)
            deploy_staging
            ;;
        production)
            deploy_production
            ;;
    esac

    success "Deployment completed"
}

# Development deployment
deploy_development() {
    log "Starting development server..."
    cd "$PROJECT_ROOT"
    npm run dev &
    local dev_pid=$!
    
    # Wait for server to start
    sleep 5
    
    # Check if server is running
    if curl -s http://localhost:5173 > /dev/null; then
        success "Development server started (PID: $dev_pid)"
        log "Application available at: http://localhost:5173"
    else
        error "Failed to start development server"
        kill $dev_pid 2>/dev/null || true
        exit 1
    fi
}

# Staging deployment
deploy_staging() {
    log "Deploying to staging server..."
    
    # This would typically deploy to a staging server
    # For now, we'll simulate with local preview
    cd "$PROJECT_ROOT"
    
    # Start preview server
    npm run preview &
    local preview_pid=$!
    
    # Wait for server to start
    sleep 3
    
    # Health check
    if health_check "http://localhost:4173"; then
        success "Staging deployment successful (PID: $preview_pid)"
        log "Staging URL: http://localhost:4173"
    else
        error "Staging deployment failed health check"
        kill $preview_pid 2>/dev/null || true
        exit 1
    fi
}

# Production deployment
deploy_production() {
    if [[ "$FORCE" == false ]]; then
        warning "You are about to deploy to PRODUCTION"
        read -p "Are you sure you want to continue? (yes/no): " -r
        if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
            log "Production deployment cancelled"
            exit 0
        fi
    fi

    log "Deploying to production..."
    
    # Production deployment would typically involve:
    # 1. Upload to CDN/Object Storage
    # 2. Update load balancer configuration
    # 3. Database migrations
    # 4. Cache invalidation
    # 5. Health checks
    
    # For demonstration, we'll use a local production preview
    cd "$PROJECT_ROOT"
    
    # Start production preview
    npm run preview -- --host 0.0.0.0 --port 3000 &
    local prod_pid=$!
    
    # Wait for server to start
    sleep 5
    
    # Comprehensive health check
    if health_check "http://localhost:3000"; then
        success "Production deployment successful (PID: $prod_pid)"
        log "Production URL: http://localhost:3000"
        
        # Send deployment notification
        send_deployment_notification
    else
        error "Production deployment failed health check"
        kill $prod_pid 2>/dev/null || true
        exit 1
    fi
}

# Health check function
health_check() {
    local url=$1
    local max_attempts=10
    local attempt=1

    log "Performing health check for $url..."

    while [[ $attempt -le $max_attempts ]]; do
        if curl -s -f "$url" > /dev/null; then
            success "Health check passed (attempt $attempt)"
            return 0
        fi
        
        log "Health check attempt $attempt failed, retrying..."
        sleep 3
        ((attempt++))
    done

    error "Health check failed after $max_attempts attempts"
    return 1
}

# Send deployment notification
send_deployment_notification() {
    local version=$(node -p "require('./package.json').version")
    local commit=$(git rev-parse --short HEAD)
    
    log "Sending deployment notification..."
    
    # This would typically send notifications via:
    # - Slack webhook
    # - Email
    # - Discord
    # - Teams
    
    cat << EOF > "/tmp/deployment_notification.json"
{
    "environment": "$ENVIRONMENT",
    "version": "$version",
    "commit": "$commit",
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "deployer": "$(git config user.name)",
    "status": "success"
}
EOF

    # Simulate notification sending
    log "Deployment notification prepared: /tmp/deployment_notification.json"
}

# Rollback function
perform_rollback() {
    log "Performing rollback for $ENVIRONMENT..."

    local latest_backup=$(find "$BACKUP_DIR" -maxdepth 1 -type d -name "backup_${ENVIRONMENT}_*" | sort | tail -1)
    
    if [[ -z "$latest_backup" ]]; then
        error "No backup found for $ENVIRONMENT"
        exit 1
    fi

    log "Rolling back to: $latest_backup"
    
    if [[ "$DRY_RUN" == false ]]; then
        # Remove current deployment
        rm -rf "$BUILD_DIR"
        
        # Restore from backup
        cp -r "$latest_backup" "$BUILD_DIR"
        
        # Redeploy
        deploy_application
    fi

    success "Rollback completed"
}

# Cleanup function
cleanup() {
    log "Performing cleanup..."
    
    # Remove temporary files
    rm -f /tmp/deployment_notification.json
    
    # Clean up old build artifacts
    find "$PROJECT_ROOT" -name "*.log" -mtime +7 -delete 2>/dev/null || true
    
    success "Cleanup completed"
}

# Main deployment flow
main() {
    log "Starting PaveMaster Suite deployment..."
    log "Timestamp: $TIMESTAMP"

    parse_args "$@"
    validate_environment
    check_prerequisites
    load_environment_config

    if [[ "$ROLLBACK" == true ]]; then
        perform_rollback
    else
        run_tests
        create_backup
        build_application
        deploy_application
    fi

    cleanup

    success "Deployment process completed successfully!"
    log "Environment: $ENVIRONMENT"
    log "Timestamp: $TIMESTAMP"
    
    if [[ "$DRY_RUN" == false ]] && [[ "$ROLLBACK" == false ]]; then
        log "Application is now live!"
    fi
}

# Error handling
trap 'error "Deployment failed. Check the logs for details."; exit 1' ERR

# Run main function
main "$@"