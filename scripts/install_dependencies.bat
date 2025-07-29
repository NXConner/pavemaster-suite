@echo off
setlocal EnableDelayedExpansion

REM PaveMaster Suite - Dependency Installation Script (Windows)
REM Ensures consistent development environment setup

echo 🏗️  PaveMaster Suite - Installing Dependencies
echo ================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is required but not installed.
    echo Please install Node.js 18+ from https://nodejs.org/
    exit /b 1
)

REM Get Node.js version
for /f "tokens=1 delims=v" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js version: %NODE_VERSION%

REM Check for package managers
bun --version >nul 2>&1
if not errorlevel 1 (
    set PACKAGE_MANAGER=bun
    echo ✅ Using Bun package manager
    goto :install
)

pnpm --version >nul 2>&1
if not errorlevel 1 (
    set PACKAGE_MANAGER=pnpm
    echo ✅ Using PNPM package manager
    goto :install
)

yarn --version >nul 2>&1
if not errorlevel 1 (
    set PACKAGE_MANAGER=yarn
    echo ✅ Using Yarn package manager
    goto :install
)

set PACKAGE_MANAGER=npm
echo ✅ Using NPM package manager

:install
REM Install dependencies
echo 📦 Installing project dependencies...
if "%PACKAGE_MANAGER%"=="bun" (
    bun install
) else if "%PACKAGE_MANAGER%"=="pnpm" (
    pnpm install
) else if "%PACKAGE_MANAGER%"=="yarn" (
    yarn install --frozen-lockfile
) else (
    npm ci
)

REM Setup environment file
if not exist ".env" (
    echo 📋 Creating environment file...
    copy .env.example .env
    echo ✅ Created .env file from template
    echo ⚠️  Please update .env with your actual configuration values
) else (
    echo ✅ Environment file already exists
)

REM Setup Git hooks (if Husky is configured)
findstr /c:"husky" package.json >nul 2>&1
if not errorlevel 1 (
    echo 🪝 Setting up Git hooks...
    npx husky install
    echo ✅ Git hooks configured
)

REM Check for Supabase CLI
supabase --version >nul 2>&1
if errorlevel 1 (
    echo 🔍 Supabase CLI not found - installing...
    npm install -g supabase
    echo ✅ Supabase CLI installed
) else (
    echo ✅ Supabase CLI already available
)

echo.
echo 🎉 Installation completed successfully!
echo.
echo Next steps:
echo 1. Update .env file with your configuration
echo 2. Run 'npm run dev' to start the development server
echo 3. Visit http://localhost:5173 to view the application
echo.
echo For more information, see README.md

pause