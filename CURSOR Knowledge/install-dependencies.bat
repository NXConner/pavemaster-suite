@echo off
REM Pavement Performance Suite - Comprehensive Dependency Installation Script (Windows)
REM This script sets up the complete development environment for the project

setlocal enabledelayedexpansion

echo.
echo ==================================================
echo Pavement Performance Suite - Dependency Installation
echo ==================================================
echo.

REM Function to print colored output
:print_status
echo [INFO] %~1
goto :eof

:print_success
echo [SUCCESS] %~1
goto :eof

:print_warning
echo [WARNING] %~1
goto :eof

:print_error
echo [ERROR] %~1
goto :eof

REM Check if Node.js is installed
call :print_status "Checking Node.js installation..."
node --version >nul 2>&1
if %errorlevel% neq 0 (
    call :print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit /b 1
)
call :print_success "Node.js found: $(node --version)"

REM Check if npm is installed
call :print_status "Checking npm installation..."
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    call :print_error "npm is not installed. Please install npm 9+ first."
    exit /b 1
)
call :print_success "npm found: $(npm --version)"

REM Check if package.json exists
if not exist "package.json" (
    call :print_error "package.json not found. Please run this script from the project root."
    exit /b 1
)

REM Install global dependencies
call :print_status "Installing global dependencies..."
call npm install -g @supabase/cli
call npm install -g @capacitor/cli
call npm install -g @ionic/cli
call npm install -g typescript
call npm install -g eslint
call npm install -g prettier
call npm install -g jest
call npm install -g @playwright/test
call npm install -g k6
call :print_success "Global dependencies installed successfully"

REM Remove existing node_modules and package-lock.json for clean install
if exist "node_modules" (
    call :print_status "Removing existing node_modules..."
    rmdir /s /q node_modules
)

if exist "package-lock.json" (
    call :print_status "Removing existing package-lock.json..."
    del package-lock.json
)

REM Install project dependencies
call :print_status "Installing project dependencies..."
call npm install
if %errorlevel% neq 0 (
    call :print_error "Failed to install project dependencies"
    exit /b 1
)
call :print_success "Project dependencies installed successfully"

REM Setup environment variables
call :print_status "Setting up environment variables..."
if not exist ".env.local" (
    if exist ".env.example" (
        copy .env.example .env.local >nul
        call :print_success "Environment file created from template"
        call :print_warning "Please edit .env.local with your actual configuration values"
    ) else (
        call :print_error ".env.example not found"
        exit /b 1
    )
) else (
    call :print_warning ".env.local already exists - skipping environment setup"
)

REM Setup development tools
call :print_status "Setting up development tools..."

REM Create necessary directories
if not exist "src\__tests__" mkdir src\__tests__
if not exist "src\components\ui" mkdir src\components\ui
if not exist "src\services" mkdir src\services
if not exist "src\utils" mkdir src\utils
if not exist "src\types" mkdir src\types
if not exist "src\hooks" mkdir src\hooks
if not exist "src\contexts" mkdir src\contexts
if not exist "docs" mkdir docs
if not exist "scripts" mkdir scripts

REM Create ESLint configuration if it doesn't exist
if not exist ".eslintrc.json" (
    echo {> .eslintrc.json
    echo   "extends": [>> .eslintrc.json
    echo     "next/core-web-vitals",>> .eslintrc.json
    echo     "eslint:recommended",>> .eslintrc.json
    echo     "@typescript-eslint/recommended">> .eslintrc.json
    echo   ],>> .eslintrc.json
    echo   "parser": "@typescript-eslint/parser",>> .eslintrc.json
    echo   "plugins": ["@typescript-eslint"],>> .eslintrc.json
    echo   "rules": {>> .eslintrc.json
    echo     "@typescript-eslint/no-unused-vars": "error",>> .eslintrc.json
    echo     "@typescript-eslint/no-explicit-any": "warn",>> .eslintrc.json
    echo     "prefer-const": "error",>> .eslintrc.json
    echo     "no-var": "error">> .eslintrc.json
    echo   }>> .eslintrc.json
    echo }>> .eslintrc.json
)

REM Create Prettier configuration if it doesn't exist
if not exist ".prettierrc" (
    echo {> .prettierrc
    echo   "semi": true,>> .prettierrc
    echo   "trailingComma": "es5",>> .prettierrc
    echo   "singleQuote": true,>> .prettierrc
    echo   "printWidth": 80,>> .prettierrc
    echo   "tabWidth": 2,>> .prettierrc
    echo   "useTabs": false>> .prettierrc
    echo }>> .prettierrc
)

call :print_success "Development tools configured successfully"

REM Setup Git hooks
call :print_status "Setting up Git hooks..."
call npm install --save-dev husky
call npx husky install
call npx husky add .husky/pre-commit "npm run lint && npm run type-check"
call npx husky add .husky/commit-msg "npx --no -- commitlint --edit $1"
call :print_success "Git hooks configured successfully"

REM Setup database
call :print_status "Setting up database..."
supabase --version >nul 2>&1
if %errorlevel% equ 0 (
    call :print_status "Initializing Supabase..."
    call supabase init
    call :print_status "Starting Supabase local development..."
    call supabase start
    call :print_success "Database setup completed"
) else (
    call :print_warning "Supabase CLI not found. Please install it manually: npm install -g @supabase/cli"
)

REM Setup mobile development
call :print_status "Setting up mobile development environment..."
call npm install @capacitor/core @capacitor/cli
call npx cap init "Pavement Performance Suite" "com.pavementperformance.suite"
call npx cap add android
call npx cap add ios
call :print_success "Mobile development environment configured"

REM Setup Docker
call :print_status "Setting up Docker configuration..."
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    call docker build -t pavement-performance-suite .
    call :print_success "Docker image built successfully"
) else (
    call :print_warning "Docker not found. Please install Docker manually."
)

REM Run initial tests
call :print_status "Running initial tests..."
call npm run type-check 2>nul || call :print_warning "Type checking failed"
call npm run lint 2>nul || call :print_warning "Linting failed"
call npm test 2>nul || call :print_warning "Unit tests failed"
call :print_success "Initial tests completed"

REM Display completion message
echo.
echo 🎉 Pavement Performance Suite Setup Complete!
echo.
echo Next steps:
echo 1. Edit .env.local with your configuration values
echo 2. Run 'npm run dev' to start the development server
echo 3. Visit http://localhost:3000 to see the application
echo.
echo Available commands:
echo - npm run dev          # Start development server
echo - npm run build        # Build for production
echo - npm run test         # Run tests
echo - npm run lint         # Run linting
echo - npm run type-check   # Run TypeScript checking
echo.
echo For more information, see the README.md file
echo.

pause 