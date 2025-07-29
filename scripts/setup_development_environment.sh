#!/bin/bash

# 🚧 Pavement Performance Suite - Development Environment Setup Script

# Ensure script is run with bash
if [ "$BASH_VERSION" = '' ]; then
    echo "Please run with bash"
    exit 1
fi

# Color Output Utilities
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Logging Function
log() {
    echo -e "${GREEN}[PAVEMASTER SETUP]${NC} $1"
}

# Error Handling Function
error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Prerequisite Check
check_prerequisites() {
    log "Checking system prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed. Please install Node.js 18+ first."
    fi
    
    # Check pnpm
    if ! command -v pnpm &> /dev/null; then
        log "Installing pnpm..."
        npm install -g pnpm
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
    fi
    
    # Check Supabase CLI
    if ! command -v supabase &> /dev/null; then
        log "Installing Supabase CLI..."
        npm install -g supabase-cli
    fi
}

# Clone Repository
clone_repository() {
    log "Cloning Pavement Performance Suite repository..."
    git clone https://github.com/your-org/pavement-performance-suite.git || error "Repository cloning failed"
    cd pavement-performance-suite
}

# Install Dependencies
install_dependencies() {
    log "Installing project dependencies..."
    pnpm install || error "Dependency installation failed"
}

# Setup Environment Configuration
setup_environment() {
    log "Setting up environment configuration..."
    
    # Copy example environment file
    cp .env.example .env.local
    
    # Prompt for critical configuration
    read -p "Enter Supabase Project URL: " SUPABASE_URL
    read -p "Enter Supabase Anon Key: " SUPABASE_ANON_KEY
    
    # Update .env.local
    sed -i "s|NEXT_PUBLIC_SUPABASE_URL=.*|NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL|g" .env.local
    sed -i "s|NEXT_PUBLIC_SUPABASE_ANON_KEY=.*|NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY|g" .env.local
}

# Initialize Supabase
initialize_supabase() {
    log "Initializing Supabase local development..."
    supabase init || error "Supabase initialization failed"
    supabase start || error "Supabase local environment startup failed"
}

# Run Database Migrations
run_migrations() {
    log "Running database migrations..."
    pnpm supabase:migrate || error "Database migration failed"
}

# Seed Initial Data
seed_initial_data() {
    log "Seeding initial development data..."
    pnpm run seed:dev || error "Data seeding failed"
}

# Start Development Server
start_development() {
    log "Starting development server..."
    pnpm dev
}

# Main Execution
main() {
    clear
    echo -e "${YELLOW}🚧 Pavement Performance Suite - Development Environment Setup 🚧${NC}"
    
    check_prerequisites
    clone_repository
    install_dependencies
    setup_environment
    initialize_supabase
    run_migrations
    seed_initial_data
    
    log "Development environment setup complete!"
    start_development
}

# Run Main Function
main