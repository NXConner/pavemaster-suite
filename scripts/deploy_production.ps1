# Pavement Performance Suite - Production Deployment Script
# Version: 1.0.0
# Last Updated: 2024-01-15

param (
    [Parameter(Mandatory=$false)]
    [string]$Environment = "production",
    
    [Parameter(Mandatory=$false)]
    [string]$Version = (Get-Date -Format "yyyyMMdd-HHmmss"),
    
    [Parameter(Mandatory=$false)]
    [switch]$RollbackOnFailure = $true,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipPreflightChecks = $false
)

# Logging Configuration
$LogDir = ".\logs\deployments"
$LogFile = Join-Path $LogDir "deployment_$Version.log"
if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir | Out-Null }

# Logging Function
function Write-DeploymentLog {
    param(
        [Parameter(Mandatory=$true)][string]$Message,
        [Parameter(Mandatory=$false)][ValidateSet("INFO","WARN","ERROR","SUCCESS")][string]$Level = "INFO"
    )
    
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogMessage = "[$Timestamp] [$Level] $Message"
    
    Add-Content -Path $LogFile -Value $LogMessage
    
    switch ($Level) {
        "INFO" { Write-Host $LogMessage -ForegroundColor Cyan }
        "WARN" { Write-Host $LogMessage -ForegroundColor Yellow }
        "ERROR" { Write-Host $LogMessage -ForegroundColor Red }
        "SUCCESS" { Write-Host $LogMessage -ForegroundColor Green }
    }
}

# Preflight Checks
function Invoke-PreflightChecks {
    Write-DeploymentLog "Starting preflight checks..." -Level INFO
    
    # Check Docker
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-DeploymentLog "Docker is not installed!" -Level ERROR
        return $false
    }
    
    # Check Kubernetes
    if (-not (Get-Command kubectl -ErrorAction SilentlyContinue)) {
        Write-DeploymentLog "Kubernetes CLI (kubectl) is not installed!" -Level ERROR
        return $false
    }
    
    # Check environment variables
    $RequiredEnvVars = @(
        "SUPABASE_URL", 
        "SUPABASE_KEY", 
        "DATABASE_CONNECTION_STRING", 
        "JWT_SECRET"
    )
    
    foreach ($var in $RequiredEnvVars) {
        if ([string]::IsNullOrWhiteSpace($env:$var)) {
            Write-DeploymentLog "Missing required environment variable: $var" -Level ERROR
            return $false
        }
    }
    
    # Kubernetes cluster connectivity
    try {
        $clusterInfo = kubectl cluster-info
        Write-DeploymentLog "Kubernetes cluster connectivity verified" -Level SUCCESS
    } catch {
        Write-DeploymentLog "Unable to connect to Kubernetes cluster" -Level ERROR
        return $false
    }
    
    Write-DeploymentLog "All preflight checks passed successfully" -Level SUCCESS
    return $true
}

# Build Docker Images
function Build-DockerImages {
    param([string]$Version)
    
    Write-DeploymentLog "Building Docker images..." -Level INFO
    
    # Backend Image
    docker build -t pavemaster-backend:$Version ./backend
    if ($LASTEXITCODE -ne 0) {
        Write-DeploymentLog "Backend image build failed" -Level ERROR
        return $false
    }
    
    # Frontend Image
    docker build -t pavemaster-frontend:$Version ./frontend
    if ($LASTEXITCODE -ne 0) {
        Write-DeploymentLog "Frontend image build failed" -Level ERROR
        return $false
    }
    
    # ML Services Image
    docker build -t pavemaster-ml-services:$Version ./ml_services
    if ($LASTEXITCODE -ne 0) {
        Write-DeploymentLog "ML Services image build failed" -Level ERROR
        return $false
    }
    
    Write-DeploymentLog "Docker images built successfully" -Level SUCCESS
    return $true
}

# Run Comprehensive Tests
function Invoke-DeploymentTests {
    Write-DeploymentLog "Running comprehensive deployment tests..." -Level INFO
    
    # Unit Tests
    npm run test:unit
    if ($LASTEXITCODE -ne 0) {
        Write-DeploymentLog "Unit tests failed" -Level ERROR
        return $false
    }
    
    # Integration Tests
    npm run test:integration
    if ($LASTEXITCODE -ne 0) {
        Write-DeploymentLog "Integration tests failed" -Level ERROR
        return $false
    }
    
    # Performance Tests
    npm run test:performance
    if ($LASTEXITCODE -ne 0) {
        Write-DeploymentLog "Performance tests failed" -Level WARN
        # Performance test failures are warnings, not blockers
    }
    
    Write-DeploymentLog "Deployment tests completed successfully" -Level SUCCESS
    return $true
}

# Deploy to Kubernetes
function Deploy-ToKubernetes {
    param([string]$Version, [string]$Environment)
    
    Write-DeploymentLog "Deploying to Kubernetes..." -Level INFO
    
    # Apply Kubernetes manifests
    kubectl apply -f k8s/namespaces/$Environment/
    kubectl apply -f k8s/deployments/ -n $Environment
    
    # Update image versions
    kubectl set image deployments/backend backend=pavemaster-backend:$Version -n $Environment
    kubectl set image deployments/frontend frontend=pavemaster-frontend:$Version -n $Environment
    kubectl set image deployments/ml-services ml-services=pavemaster-ml-services:$Version -n $Environment
    
    # Verify rollout status
    $backendRollout = kubectl rollout status deployment/backend -n $Environment
    $frontendRollout = kubectl rollout status deployment/frontend -n $Environment
    $mlServicesRollout = kubectl rollout status deployment/ml-services -n $Environment
    
    if ($backendRollout -and $frontendRollout -and $mlServicesRollout) {
        Write-DeploymentLog "Kubernetes deployment successful" -Level SUCCESS
        return $true
    } else {
        Write-DeploymentLog "Kubernetes deployment failed" -Level ERROR
        return $false
    }
}

# Rollback Deployment
function Rollback-Deployment {
    param([string]$Environment)
    
    Write-DeploymentLog "Initiating deployment rollback..." -Level WARN
    
    # Rollback Kubernetes deployments
    kubectl rollout undo deployment/backend -n $Environment
    kubectl rollout undo deployment/frontend -n $Environment
    kubectl rollout undo deployment/ml-services -n $Environment
    
    Write-DeploymentLog "Deployment rolled back successfully" -Level SUCCESS
}

# Main Deployment Function
function Start-Deployment {
    try {
        # Preflight Checks
        if (-not $SkipPreflightChecks) {
            $preflightResult = Invoke-PreflightChecks
            if (-not $preflightResult) {
                throw "Preflight checks failed"
            }
        }
        
        # Build Docker Images
        $buildResult = Build-DockerImages -Version $Version
        if (-not $buildResult) {
            throw "Docker image build failed"
        }
        
        # Run Deployment Tests
        $testResult = Invoke-DeploymentTests
        if (-not $testResult) {
            throw "Deployment tests failed"
        }
        
        # Deploy to Kubernetes
        $deploymentResult = Deploy-ToKubernetes -Version $Version -Environment $Environment
        if (-not $deploymentResult) {
            throw "Kubernetes deployment failed"
        }
        
        Write-DeploymentLog "Deployment completed successfully" -Level SUCCESS
        return 0
    }
    catch {
        Write-DeploymentLog "Deployment failed: $_" -Level ERROR
        
        if ($RollbackOnFailure) {
            try {
                Rollback-Deployment -Environment $Environment
            }
            catch {
                Write-DeploymentLog "Rollback failed: $_" -Level ERROR
            }
        }
        
        return 1
    }
}

# Execute Deployment
$result = Start-Deployment
exit $result