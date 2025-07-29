# 🚀 Pavement Performance Suite - Deployment Script

# Strict mode for better error handling
Set-StrictMode -Version Latest

# Logging Function
function Write-DeploymentLog {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        
        [Parameter(Mandatory=$false)]
        [ValidateSet('Info', 'Warning', 'Error')]
        [string]$Level = 'Info'
    )

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"

    switch ($Level) {
        'Info' { Write-Host $logMessage -ForegroundColor Green }
        'Warning' { Write-Host $logMessage -ForegroundColor Yellow }
        'Error' { Write-Host $logMessage -ForegroundColor Red }
    }

    # Log to file
    Add-Content -Path "deployment.log" -Value $logMessage
}

# Validate Prerequisites
function Test-DeploymentPrerequisites {
    $prerequisites = @{
        "Docker" = { Get-Command docker -ErrorAction SilentlyContinue }
        "Kubernetes" = { Get-Command kubectl -ErrorAction SilentlyContinue }
        "Git" = { Get-Command git -ErrorAction SilentlyContinue }
    }

    $missingPrerequisites = @()

    foreach ($prereq in $prerequisites.Keys) {
        if (-not (& $prerequisites[$prereq])) {
            $missingPrerequisites += $prereq
        }
    }

    if ($missingPrerequisites.Count -gt 0) {
        Write-DeploymentLog "Missing prerequisites: $($missingPrerequisites -join ', ')" -Level Error
        return $false
    }

    return $true
}

# Build Docker Images
function Build-DockerImages {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Version
    )

    try {
        Write-DeploymentLog "Building Docker images for version $Version"
        
        # Frontend Image
        docker build -t pavemaster-frontend:$Version ./frontend
        
        # Backend Image
        docker build -t pavemaster-backend:$Version ./backend
        
        # Database Migration Image
        docker build -t pavemaster-migrations:$Version ./migrations

        Write-DeploymentLog "Docker images built successfully" -Level Info
    }
    catch {
        Write-DeploymentLog "Docker image build failed: $_" -Level Error
        throw
    }
}

# Run Comprehensive Tests
function Invoke-DeploymentTests {
    try {
        Write-DeploymentLog "Running deployment test suite"
        
        # Unit Tests
        npm test
        
        # Integration Tests
        docker-compose -f docker-compose.test.yml up --abort-on-container-exit
        
        # Performance Tests
        python performance/load_testing/performance_test.py

        Write-DeploymentLog "All tests passed successfully" -Level Info
    }
    catch {
        Write-DeploymentLog "Deployment tests failed: $_" -Level Error
        throw
    }
}

# Deploy to Kubernetes
function Deploy-ToKubernetes {
    param(
        [Parameter(Mandatory=$true)]
        [ValidateSet('staging', 'production')]
        [string]$Environment
    )

    try {
        Write-DeploymentLog "Deploying to $Environment environment"
        
        # Set Kubernetes context
        kubectl config use-context $Environment
        
        # Apply Kubernetes manifests
        kubectl apply -f k8s/namespaces/$Environment
        kubectl apply -f k8s/deployments/$Environment
        kubectl apply -f k8s/services/$Environment
        
        # Run database migrations
        kubectl apply -f k8s/jobs/database-migration.yml
        
        # Verify deployment
        $deploymentStatus = kubectl rollout status deployment/pavemaster-frontend
        $deploymentStatus += kubectl rollout status deployment/pavemaster-backend
        
        Write-DeploymentLog "Deployment to $Environment completed: $deploymentStatus" -Level Info
    }
    catch {
        Write-DeploymentLog "Kubernetes deployment failed: $_" -Level Error
        throw
    }
}

# Rollback Deployment
function Rollback-Deployment {
    param(
        [Parameter(Mandatory=$true)]
        [ValidateSet('staging', 'production')]
        [string]$Environment
    )

    try {
        Write-DeploymentLog "Initiating rollback for $Environment"
        
        # Rollback frontend
        kubectl rollout undo deployment/pavemaster-frontend -n $Environment
        
        # Rollback backend
        kubectl rollout undo deployment/pavemaster-backend -n $Environment
        
        Write-DeploymentLog "Rollback completed successfully" -Level Info
    }
    catch {
        Write-DeploymentLog "Rollback failed: $_" -Level Error
        throw
    }
}

# Main Deployment Function
function Start-Deployment {
    param(
        [Parameter(Mandatory=$false)]
        [ValidateSet('staging', 'production')]
        [string]$Environment = 'staging',
        
        [Parameter(Mandatory=$false)]
        [string]$Version = (Get-Date -Format "yyyyMMdd-HHmmss")
    )

    try {
        # Validate Prerequisites
        if (-not (Test-DeploymentPrerequisites)) {
            throw "Deployment prerequisites not met"
        }

        # Build Docker Images
        Build-DockerImages -Version $Version

        # Run Tests
        Invoke-DeploymentTests

        # Deploy to Kubernetes
        Deploy-ToKubernetes -Environment $Environment

        Write-DeploymentLog "Deployment completed successfully" -Level Info
    }
    catch {
        Write-DeploymentLog "Deployment failed: $_" -Level Error
        
        # Attempt Rollback
        try {
            Rollback-Deployment -Environment $Environment
        }
        catch {
            Write-DeploymentLog "Rollback failed: $_" -Level Error
        }
    }
}

# Execute Deployment
Start-Deployment