#!/bin/bash

# PaveMaster Suite - Automated Setup Script
# This script sets up the entire project from scratch

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
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

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Print banner
print_banner() {
    echo ""
    echo "██████╗  █████╗ ██╗   ██╗███████╗███╗   ███╗ █████╗ ███████╗████████╗███████╗██████╗ "
    echo "██╔══██╗██╔══██╗██║   ██║██╔════╝████╗ ████║██╔══██╗██╔════╝╚══██╔══╝██╔════╝██╔══██╗"
    echo "██████╔╝███████║██║   ██║█████╗  ██╔████╔██║███████║███████╗   ██║   █████╗  ██████╔╝"
    echo "██╔═══╝ ██╔══██║╚██╗ ██╔╝██╔══╝  ██║╚██╔╝██║██╔══██║╚════██║   ██║   ██╔══╝  ██╔══██╗"
    echo "██║     ██║  ██║ ╚████╔╝ ███████╗██║ ╚═╝ ██║██║  ██║███████║   ██║   ███████╗██║  ██║"
    echo "╚═╝     ╚═╝  ╚═╝  ╚═══╝  ╚══════╝╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝"
    echo ""
    echo "🚀 PaveMaster Suite - Automated Setup Script"
    echo "AI-Assisted Pavement Analysis and Performance Tracking System"
    echo ""
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    local missing_deps=()
    
    if ! command_exists node; then
        missing_deps+=("Node.js (v18+)")
    else
        local node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$node_version" -lt 18 ]; then
            missing_deps+=("Node.js v18+ (current: $(node -v))")
        fi
    fi
    
    if ! command_exists npm; then
        missing_deps+=("npm")
    fi
    
    if ! command_exists git; then
        missing_deps+=("git")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "Missing prerequisites:"
        for dep in "${missing_deps[@]}"; do
            echo "  - $dep"
        done
        echo ""
        log_info "Please install the missing prerequisites and run this script again."
        echo ""
        log_info "Installation guides:"
        echo "  Node.js: https://nodejs.org/"
        echo "  Git: https://git-scm.com/"
        exit 1
    fi
    
    log_success "All prerequisites met!"
}

# Install dependencies
install_dependencies() {
    log_info "Installing Node.js dependencies..."
    
    if [ -f "package-lock.json" ]; then
        log_info "Found package-lock.json, using npm ci for faster, reliable installation..."
        npm ci --legacy-peer-deps
    else
        log_info "Installing dependencies with npm install..."
        npm install --legacy-peer-deps
    fi
    
    log_success "Dependencies installed successfully!"
}

# Setup environment
setup_environment() {
    log_info "Setting up environment configuration..."
    
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            log_success "Created .env file from template"
            
            log_warning "⚠️  IMPORTANT: Please update the .env file with your actual configuration:"
            echo ""
            echo "  1. Supabase Project URL and API Keys"
            echo "  2. Database connection details"
            echo "  3. External API keys (Weather, Maps, etc.)"
            echo "  4. Security keys and secrets"
            echo ""
            echo "  Edit .env file: nano .env"
            echo ""
        else
            log_error ".env.example not found. Cannot create environment file."
            exit 1
        fi
    else
        log_info ".env file already exists, skipping creation"
    fi
}

# Build project
build_project() {
    log_info "Building the project..."
    
    if npm run type-check; then
        log_success "TypeScript compilation successful!"
    else
        log_error "TypeScript compilation failed. Please fix the errors and try again."
        exit 1
    fi
    
    if npm run build; then
        log_success "Production build completed successfully!"
        
        # Show build stats
        if [ -d "dist" ]; then
            local build_size=$(du -sh dist 2>/dev/null | cut -f1)
            log_info "Build output size: $build_size"
        fi
    else
        log_error "Build failed. Please check the errors above."
        exit 1
    fi
}

# Run linting
run_linting() {
    log_info "Running code quality checks..."
    
    if npm run lint 2>/dev/null; then
        log_success "Code quality checks passed!"
    else
        log_warning "Some linting issues found. Running auto-fix..."
        if npm run lint -- --fix 2>/dev/null; then
            log_success "Auto-fix completed successfully!"
        else
            log_warning "Some linting issues require manual fixing"
            log_info "Run 'npm run lint' to see remaining issues"
        fi
    fi
}

# Setup database (if needed)
setup_database() {
    log_info "Database setup information..."
    echo ""
    echo "📋 Database Setup Steps:"
    echo ""
    echo "1. Create a Supabase project at https://supabase.com"
    echo "2. Copy your project URL and anon key to the .env file"
    echo "3. Run the SQL migration scripts in supabase/migrations/"
    echo "4. Set up Row Level Security (RLS) policies"
    echo ""
    echo "📁 Migration files location: supabase/migrations/"
    echo "🔧 Configuration file: supabase/config.toml"
    echo ""
}

# Create initial admin user info
create_admin_info() {
    log_info "Initial setup information..."
    echo ""
    echo "🔐 Default Admin Access:"
    echo ""
    echo "After setting up your Supabase project:"
    echo "1. Go to /auth to create your admin account"
    echo "2. The first user registered will have admin privileges"
    echo "3. Configure additional users through the admin panel"
    echo ""
}

# Show next steps
show_next_steps() {
    echo ""
    log_success "🎉 Setup completed successfully!"
    echo ""
    echo "📋 Next Steps:"
    echo ""
    echo "1. 📝 Configure your environment:"
    echo "   nano .env"
    echo ""
    echo "2. 🗄️  Set up your Supabase database:"
    echo "   - Create project at https://supabase.com"
    echo "   - Run migration scripts"
    echo "   - Update .env with your credentials"
    echo ""
    echo "3. 🚀 Start the development server:"
    echo "   npm run dev"
    echo ""
    echo "4. 🌐 Open your browser:"
    echo "   http://localhost:5173"
    echo ""
    echo "5. 📱 Build for production:"
    echo "   npm run build"
    echo ""
    echo "6. 🧪 Run tests:"
    echo "   npm run test:all"
    echo ""
    echo "📚 Additional Resources:"
    echo "   - Documentation: docs/"
    echo "   - Deployment Guide: DEPLOYMENT_README.md"
    echo "   - Troubleshooting: docs/TROUBLESHOOTING_GUIDE.md"
    echo ""
    
    if [ -f ".env" ]; then
        log_warning "⚠️  Remember to update your .env file with actual credentials before starting!"
    fi
}

# Performance check
check_performance() {
    log_info "Running performance checks..."
    
    if [ -d "dist" ]; then
        local main_bundle=$(find dist/assets -name "index-*.js" | head -1)
        if [ -f "$main_bundle" ]; then
            local bundle_size=$(stat -f%z "$main_bundle" 2>/dev/null || stat -c%s "$main_bundle" 2>/dev/null || echo "0")
            local bundle_size_kb=$((bundle_size / 1024))
            
            if [ "$bundle_size_kb" -lt 500 ]; then
                log_success "Bundle size optimized: ${bundle_size_kb}KB"
            elif [ "$bundle_size_kb" -lt 1000 ]; then
                log_warning "Bundle size: ${bundle_size_kb}KB (consider further optimization)"
            else
                log_warning "Large bundle size: ${bundle_size_kb}KB (optimization recommended)"
            fi
        fi
    fi
}

# Create desktop shortcut (optional)
create_shortcuts() {
    if command_exists code; then
        log_info "VS Code detected. You can open the project with:"
        echo "  code ."
        echo ""
    fi
    
    log_info "Quick commands:"
    echo "  npm run dev          # Start development server"
    echo "  npm run build        # Build for production"
    echo "  npm run lint         # Run code quality checks"
    echo "  npm run test:all     # Run all tests"
    echo ""
}

# Error handling
handle_error() {
    log_error "Setup failed on line $1"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "  1. Check your internet connection"
    echo "  2. Ensure you have sufficient disk space"
    echo "  3. Try running with sudo if permission errors occur"
    echo "  4. Check the error message above for specific issues"
    echo ""
    echo "📞 Need help? Check docs/TROUBLESHOOTING_GUIDE.md"
    exit 1
}

# Main execution
main() {
    # Set error handler
    trap 'handle_error $LINENO' ERR
    
    print_banner
    
    log_info "Starting PaveMaster Suite setup..."
    echo ""
    
    check_prerequisites
    install_dependencies
    setup_environment
    run_linting
    build_project
    check_performance
    setup_database
    create_admin_info
    create_shortcuts
    show_next_steps
    
    log_success "PaveMaster Suite setup completed! 🎉"
}

# Check if script is being run directly
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    main "$@"
fi