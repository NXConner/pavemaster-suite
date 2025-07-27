#!/bin/bash

# PaveMaster Suite - Dependency Installation Script
# Ensures consistent development environment setup

set -e  # Exit on any error

echo "🏗️  PaveMaster Suite - Installing Dependencies"
echo "================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if ! npx semver -r ">=18.0.0" "$NODE_VERSION" &> /dev/null; then
    echo "❌ Node.js version $NODE_VERSION is not supported."
    echo "Please upgrade to Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $NODE_VERSION"

# Check package manager preference
if command -v bun &> /dev/null; then
    PACKAGE_MANAGER="bun"
    echo "✅ Using Bun package manager"
elif command -v pnpm &> /dev/null; then
    PACKAGE_MANAGER="pnpm"
    echo "✅ Using PNPM package manager"
elif command -v yarn &> /dev/null; then
    PACKAGE_MANAGER="yarn"
    echo "✅ Using Yarn package manager"
else
    PACKAGE_MANAGER="npm"
    echo "✅ Using NPM package manager"
fi

# Install dependencies
echo "📦 Installing project dependencies..."
case $PACKAGE_MANAGER in
    "bun")
        bun install
        ;;
    "pnpm")
        pnpm install
        ;;
    "yarn")
        yarn install --frozen-lockfile
        ;;
    "npm")
        npm ci
        ;;
esac

# Setup environment file
if [ ! -f ".env" ]; then
    echo "📋 Creating environment file..."
    cp .env.example .env
    echo "✅ Created .env file from template"
    echo "⚠️  Please update .env with your actual configuration values"
else
    echo "✅ Environment file already exists"
fi

# Setup Git hooks (if Husky is configured)
if [ -f "package.json" ] && grep -q "husky" package.json; then
    echo "🪝 Setting up Git hooks..."
    npx husky install
    echo "✅ Git hooks configured"
fi

# Check for Supabase CLI
if ! command -v supabase &> /dev/null; then
    echo "🔍 Supabase CLI not found - installing..."
    case $PACKAGE_MANAGER in
        "bun")
            bun add -g supabase
            ;;
        "pnpm")
            pnpm add -g supabase
            ;;
        "yarn")
            yarn global add supabase
            ;;
        "npm")
            npm install -g supabase
            ;;
    esac
    echo "✅ Supabase CLI installed"
else
    echo "✅ Supabase CLI already available"
fi

# Generate types from Supabase (if logged in)
if supabase status &> /dev/null; then
    echo "🔄 Generating Supabase types..."
    supabase gen types typescript --local > src/integrations/supabase/types.ts
    echo "✅ Supabase types generated"
else
    echo "⚠️  Supabase not connected - run 'supabase login' and 'supabase start' to generate types"
fi

echo ""
echo "🎉 Installation completed successfully!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your configuration"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Visit http://localhost:5173 to view the application"
echo ""
echo "For more information, see README.md"