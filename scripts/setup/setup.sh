#!/bin/bash

# ISAC-OS Project Setup Script
# This script sets up the development environment for ISAC-OS

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "\n${BLUE}=====================================${NC}"
    echo -e "${BLUE} $1${NC}"
    echo -e "${BLUE}=====================================${NC}\n"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Node.js version
check_node_version() {
    print_status "Checking Node.js version..."
    
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    REQUIRED_VERSION="18.0.0"
    
    if ! node -e "process.exit(require('semver').gte('${NODE_VERSION}', '${REQUIRED_VERSION}'))" 2>/dev/null; then
        print_error "Node.js version ${NODE_VERSION} is not supported. Please install Node.js ${REQUIRED_VERSION} or higher."
        exit 1
    fi
    
    print_success "Node.js version ${NODE_VERSION} is supported"
}

# Check pnpm installation
check_pnpm() {
    print_status "Checking pnpm installation..."
    
    if ! command_exists pnpm; then
        print_warning "pnpm is not installed. Installing pnpm..."
        npm install -g pnpm
        
        if [ $? -eq 0 ]; then
            print_success "pnpm installed successfully"
        else
            print_error "Failed to install pnpm"
            exit 1
        fi
    else
        print_success "pnpm is already installed"
    fi
}

# Install dependencies
install_dependencies() {
    print_header "Installing Dependencies"
    
    print_status "Installing workspace dependencies..."
    pnpm install
    
    if [ $? -eq 0 ]; then
        print_success "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
}

# Setup environment files
setup_environment() {
    print_header "Setting Up Environment"
    
    # Create .env.local from .env.example if it doesn't exist
    if [ ! -f ".env.local" ] && [ -f ".env.example" ]; then
        print_status "Creating .env.local from .env.example..."
        cp .env.example .env.local
        print_success ".env.local created"
        print_warning "Please update .env.local with your actual configuration values"
    fi
    
    # Create environment files for apps
    for app_dir in apps/*/; do
        if [ -d "$app_dir" ]; then
            app_name=$(basename "$app_dir")
            env_example="$app_dir.env.example"
            env_local="$app_dir.env.local"
            
            if [ -f "$env_example" ] && [ ! -f "$env_local" ]; then
                print_status "Creating environment file for $app_name..."
                cp "$env_example" "$env_local"
                print_success "Environment file created for $app_name"
            fi
        fi
    done
}

# Setup Git hooks
setup_git_hooks() {
    print_header "Setting Up Git Hooks"
    
    if [ -d ".git" ]; then
        print_status "Setting up Git hooks..."
        
        # Create pre-commit hook
        cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Run linting and type checking before commit
echo "Running pre-commit checks..."

# Lint staged files
pnpm lint:staged

# Type check
pnpm type-check

if [ $? -ne 0 ]; then
    echo "Pre-commit checks failed. Commit aborted."
    exit 1
fi
EOF
        
        chmod +x .git/hooks/pre-commit
        print_success "Git hooks set up successfully"
    else
        print_warning "Not a Git repository. Skipping Git hooks setup."
    fi
}

# Build packages
build_packages() {
    print_header "Building Packages"
    
    print_status "Building shared packages..."
    pnpm build:packages
    
    if [ $? -eq 0 ]; then
        print_success "Packages built successfully"
    else
        print_warning "Some packages failed to build. You may need to fix errors and run 'pnpm build:packages' manually."
    fi
}

# Setup database (if needed)
setup_database() {
    print_header "Database Setup"
    
    if [ -f "prisma/schema.prisma" ] || [ -f "supabase/migrations" ]; then
        print_status "Database setup detected..."
        
        # Prisma setup
        if [ -f "prisma/schema.prisma" ]; then
            print_status "Setting up Prisma..."
            pnpm prisma generate
            print_success "Prisma client generated"
        fi
        
        # Supabase setup
        if [ -d "supabase" ]; then
            print_status "Supabase configuration detected"
            print_warning "Please ensure Supabase is configured and running"
        fi
    else
        print_status "No database setup required"
    fi
}

# Verify installation
verify_installation() {
    print_header "Verifying Installation"
    
    print_status "Running health checks..."
    
    # Check if main commands work
    if pnpm --version >/dev/null 2>&1; then
        print_success "pnpm is working"
    else
        print_error "pnpm is not working properly"
    fi
    
    # Check if build commands exist
    if pnpm run --help | grep -q "build"; then
        print_success "Build scripts are available"
    else
        print_warning "Build scripts may not be properly configured"
    fi
    
    # Check TypeScript
    if command_exists tsc; then
        print_success "TypeScript is available"
    else
        print_warning "TypeScript may not be properly installed"
    fi
}

# Print next steps
print_next_steps() {
    print_header "Setup Complete!"
    
    echo -e "${GREEN}🎉 ISAC-OS development environment is ready!${NC}\n"
    
    echo -e "${BLUE}Next steps:${NC}"
    echo -e "  1. Review and update .env.local with your configuration"
    echo -e "  2. Start the development server:"
    echo -e "     ${YELLOW}pnpm dev${NC}"
    echo -e "  3. Open your browser to http://localhost:3000"
    echo -e "  4. Start developing! 🚀\n"
    
    echo -e "${BLUE}Useful commands:${NC}"
    echo -e "  ${YELLOW}pnpm dev${NC}          - Start development server"
    echo -e "  ${YELLOW}pnpm build${NC}        - Build for production"
    echo -e "  ${YELLOW}pnpm test${NC}         - Run tests"
    echo -e "  ${YELLOW}pnpm lint${NC}         - Lint code"
    echo -e "  ${YELLOW}pnpm type-check${NC}   - Type check"
    echo -e "  ${YELLOW}pnpm storybook${NC}    - Start Storybook\n"
    
    echo -e "${BLUE}Documentation:${NC}"
    echo -e "  📚 Project docs: ./docs/"
    echo -e "  🏗️  Architecture: ./PROJECT_STRUCTURE.md"
    echo -e "  🎨 Design system: ./ui/README.md\n"
}

# Main execution
main() {
    print_header "ISAC-OS Setup"
    
    check_node_version
    check_pnpm
    install_dependencies
    setup_environment
    setup_git_hooks
    build_packages
    setup_database
    verify_installation
    print_next_steps
}

# Show usage if help is requested
if [[ "$1" == "--help" || "$1" == "-h" ]]; then
    echo "ISAC-OS Setup Script"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --help, -h     Show this help message"
    echo "  --skip-build   Skip building packages"
    echo "  --skip-hooks   Skip setting up Git hooks"
    echo ""
    echo "This script will:"
    echo "  ✓ Check Node.js version (18+)"
    echo "  ✓ Install pnpm if not present"
    echo "  ✓ Install all dependencies"
    echo "  ✓ Set up environment files"
    echo "  ✓ Configure Git hooks"
    echo "  ✓ Build shared packages"
    echo "  ✓ Set up database (if applicable)"
    echo "  ✓ Verify installation"
    exit 0
fi

# Parse arguments
SKIP_BUILD=false
SKIP_HOOKS=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --skip-hooks)
            SKIP_HOOKS=true
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Run main setup
main