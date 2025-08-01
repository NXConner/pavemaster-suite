# API Documentation Generation PowerShell Script for PaveMaster Suite
# Generates comprehensive API documentation with examples and interactive UI

param(
    [string]$DocsDir = "./docs/api",
    [switch]$Force = $false
)

Write-Host "📚 Generating API Documentation for PaveMaster Suite" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green

# Configuration
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupDir = "./docs/api-backups"

# Create directories if they don't exist
if (!(Test-Path $DocsDir)) {
    New-Item -ItemType Directory -Path $DocsDir -Force | Out-Null
}
if (!(Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

Write-Host "📁 Documentation Directory: $DocsDir" -ForegroundColor Cyan
Write-Host "🕒 Generation Time: $Timestamp" -ForegroundColor Cyan
Write-Host ""

# Backup existing documentation
if ((Test-Path $DocsDir) -and (Get-ChildItem $DocsDir -Force)) {
    Write-Host "💾 Backing up existing documentation..." -ForegroundColor Yellow
    $BackupPath = "$BackupDir/api-docs-backup-$Timestamp.zip"
    Compress-Archive -Path "$DocsDir/*" -DestinationPath $BackupPath -Force
    Write-Host "✅ Backup created: $BackupPath" -ForegroundColor Green
    Write-Host ""
}

# Check if required dependencies are installed
Write-Host "🔍 Checking dependencies..." -ForegroundColor Yellow

try {
    $null = npm list swagger-jsdoc 2>$null
} catch {
    Write-Host "📦 Installing swagger-jsdoc..." -ForegroundColor Cyan
    npm install swagger-jsdoc
}

try {
    $null = npm list js-yaml 2>$null
} catch {
    Write-Host "📦 Installing js-yaml..." -ForegroundColor Cyan
    npm install js-yaml
}

Write-Host "✅ Dependencies verified" -ForegroundColor Green
Write-Host ""

# Generate API documentation
Write-Host "🔧 Generating API documentation..." -ForegroundColor Cyan
try {
    node scripts/generate-api-docs.js
    Write-Host "✅ API documentation generated successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Error generating API documentation: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Validate generated files
Write-Host "🔍 Validating generated files..." -ForegroundColor Yellow

$RequiredFiles = @(
    "$DocsDir/openapi.json",
    "$DocsDir/openapi.yaml", 
    "$DocsDir/index.html"
)

foreach ($file in $RequiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ Missing: $file" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# Generate additional documentation files
Write-Host "📄 Generating additional documentation..." -ForegroundColor Cyan

# Create API usage examples
$UsageExamples = @"
# PaveMaster Suite API Usage Examples

## Authentication

### Login
``````bash
curl -X POST https://api.pavemaster.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@pavemaster.com", "password": "SecurePassword123!"}'
``````

### Use Bearer Token
``````bash
curl -X GET https://api.pavemaster.com/api/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
``````

## Projects

### Get All Projects
``````bash
curl -X GET "https://api.pavemaster.com/api/projects?status=in-progress&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
``````

### Create New Project
``````bash
curl -X POST https://api.pavemaster.com/api/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Main Street Resurfacing",
    "description": "Complete resurfacing of Main Street",
    "client_name": "City of Springfield",
    "start_date": "2024-03-01",
    "end_date": "2024-03-15",
    "budget": 250000.00
  }'
``````

## PowerShell Examples

### Using Invoke-RestMethod
``````powershell
# Login and get token
function Get-AuthToken {
    param($Email, $Password)
    
    $body = @{
        email = $Email
        password = $Password
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "https://api.pavemaster.com/api/auth/login" -Method POST -Body $body -ContentType "application/json"
    return $response.token
}

# Get projects with authentication
function Get-Projects {
    param($Token)
    
    $headers = @{
        Authorization = "Bearer $Token"
    }
    
    return Invoke-RestMethod -Uri "https://api.pavemaster.com/api/projects" -Headers $headers
}
``````

## JavaScript/TypeScript Examples

### Using Fetch API
``````typescript
// Login and get token
async function login(email: string, password: string) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    throw new Error('Login failed');
  }
  
  const data = await response.json();
  return data.token;
}
``````
"@

Set-Content -Path "$DocsDir/usage-examples.md" -Value $UsageExamples

# Create testing guide
$TestingGuide = @"
# API Testing Guide

## Testing Tools

### Postman Collection
Import the provided Postman collection for interactive API testing:
1. Download ``pavemaster-api.postman_collection.json``
2. Import into Postman
3. Set environment variables for base URL and authentication token

### PowerShell Testing
``````powershell
# Test API endpoints
.\scripts\test-api.ps1 -Endpoint "auth"
.\scripts\test-api.ps1 -Endpoint "projects"
``````

## Sample Data

### Test Users
- **Admin**: admin@pavemaster.com / AdminPass123!
- **Manager**: manager@pavemaster.com / ManagerPass123!
- **Crew**: crew@pavemaster.com / CrewPass123!

## Automated Testing

### Integration Tests
``````powershell
npm run test:api
``````

### Performance Tests
``````powershell
npm run test:performance
``````
"@

Set-Content -Path "$DocsDir/testing-guide.md" -Value $TestingGuide

Write-Host "✅ Additional documentation generated" -ForegroundColor Green
Write-Host ""

# Create deployment-ready package
Write-Host "📦 Creating deployment package..." -ForegroundColor Cyan

$PackageDir = "$DocsDir/deployment"
if (!(Test-Path $PackageDir)) {
    New-Item -ItemType Directory -Path $PackageDir -Force | Out-Null
}

# Copy all files to deployment directory
Copy-Item "$DocsDir/*.json" -Destination $PackageDir -Force -ErrorAction SilentlyContinue
Copy-Item "$DocsDir/*.yaml" -Destination $PackageDir -Force -ErrorAction SilentlyContinue
Copy-Item "$DocsDir/*.html" -Destination $PackageDir -Force -ErrorAction SilentlyContinue
Copy-Item "$DocsDir/*.md" -Destination $PackageDir -Force -ErrorAction SilentlyContinue

Write-Host "✅ Deployment package created: $PackageDir" -ForegroundColor Green
Write-Host ""

# Generate summary report
Write-Host "📊 Documentation Summary" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green
Write-Host "📁 Base Directory: $DocsDir" -ForegroundColor White
Write-Host "📄 OpenAPI Specification: openapi.json, openapi.yaml" -ForegroundColor White
Write-Host "🌐 Interactive Documentation: index.html" -ForegroundColor White
Write-Host "📖 Usage Examples: usage-examples.md" -ForegroundColor White
Write-Host "🧪 Testing Guide: testing-guide.md" -ForegroundColor White
Write-Host "📦 Deployment Package: $PackageDir" -ForegroundColor White
Write-Host ""

# File sizes
Write-Host "📏 File Sizes:" -ForegroundColor Cyan
Get-ChildItem "$DocsDir/*.json", "$DocsDir/*.yaml", "$DocsDir/*.html", "$DocsDir/*.md" -ErrorAction SilentlyContinue | ForEach-Object {
    $size = [math]::Round($_.Length / 1KB, 2)
    Write-Host "  $($_.Name): $size KB" -ForegroundColor White
}

Write-Host ""
Write-Host "🎉 API documentation generation completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Review generated documentation in $DocsDir" -ForegroundColor White
Write-Host "  2. Open index.html in browser for interactive documentation" -ForegroundColor White
Write-Host "  3. Test API endpoints using provided examples" -ForegroundColor White
Write-Host "  4. Deploy documentation to web server or documentation platform" -ForegroundColor White
Write-Host "  5. Share API documentation with development team and stakeholders" -ForegroundColor White