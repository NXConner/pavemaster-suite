# Pavement Performance Suite - Security Setup and Hardening Script
# Version: 1.0.0
# Last Updated: 2024-01-15

param (
    [Parameter(Mandatory=$false)]
    [switch]$HardenSystem = $true,
    
    [Parameter(Mandatory=$false)]
    [switch]$ConfigureFirewall = $true,
    
    [Parameter(Mandatory=$false)]
    [switch]$SetupEncryption = $true,
    
    [Parameter(Mandatory=$false)]
    [switch]$ConfigureAuditLogging = $true
)

# Logging Configuration
$LogDir = ".\logs\security_setup"
$LogFile = Join-Path $LogDir "security_setup_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir | Out-Null }

# Logging Function
function Write-SecurityLog {
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

# System Hardening Function
function Invoke-SystemHardening {
    Write-SecurityLog "Initiating system hardening..." -Level INFO
    
    # Disable unnecessary services
    $ServicesToDisable = @(
        "Remote Registry",
        "Server",
        "Remote Desktop Services",
        "Telnet"
    )
    
    foreach ($Service in $ServicesToDisable) {
        try {
            Stop-Service -Name $Service -Force
            Set-Service -Name $Service -StartupType Disabled
            Write-SecurityLog "Disabled service: $Service" -Level INFO
        }
        catch {
            Write-SecurityLog "Failed to disable service: $Service" -Level WARN
        }
    }
    
    # Update Windows Defender
    Start-Process "C:\Program Files\Windows Defender\MpCmdRun.exe" -ArgumentList "-SignatureUpdate" -Wait
    Write-SecurityLog "Updated Windows Defender signatures" -Level INFO
    
    # Enable Windows Firewall
    netsh advfirewall set allprofiles state on
    Write-SecurityLog "Enabled Windows Firewall" -Level SUCCESS
}

# Firewall Configuration Function
function Configure-Firewall {
    Write-SecurityLog "Configuring advanced firewall rules..." -Level INFO
    
    # Block inbound connections by default
    netsh advfirewall set allprofiles firewallpolicy blockinbound,allowoutbound
    
    # Allow specific necessary inbound ports
    $AllowedInboundPorts = @(
        @{Port=443; Protocol="TCP"; Name="HTTPS"},
        @{Port=80; Protocol="TCP"; Name="HTTP"},
        @{Port=22; Protocol="TCP"; Name="SSH"}
    )
    
    foreach ($PortConfig in $AllowedInboundPorts) {
        netsh advfirewall firewall add rule `
            name="Allow $($PortConfig.Name) Inbound" `
            dir=in `
            action=allow `
            protocol=$($PortConfig.Protocol) `
            localport=$($PortConfig.Port)
        
        Write-SecurityLog "Allowed inbound port: $($PortConfig.Port) ($($PortConfig.Name))" -Level INFO
    }
    
    Write-SecurityLog "Firewall configuration completed" -Level SUCCESS
}

# Encryption Setup Function
function Setup-Encryption {
    Write-SecurityLog "Configuring system-wide encryption..." -Level INFO
    
    # BitLocker Drive Encryption
    $SystemDrive = $env:SystemDrive
    try {
        Enable-BitLocker -MountPoint $SystemDrive -EncryptionMethod XtsAes256 -UsedSpaceOnly
        Write-SecurityLog "Enabled BitLocker encryption for system drive" -Level SUCCESS
    }
    catch {
        Write-SecurityLog "Failed to enable BitLocker" -Level ERROR
    }
    
    # Configure Windows Encryption Settings
    # Note: Requires administrative privileges
    try {
        # Enable device encryption
        Start-Process "powershell" -ArgumentList "Start-Process 'ms-settings:deviceencryption' -Verb RunAs" -Wait
        Write-SecurityLog "Initiated device encryption configuration" -Level INFO
    }
    catch {
        Write-SecurityLog "Failed to configure device encryption" -Level WARN
    }
}

# Audit Logging Configuration
function Configure-AuditLogging {
    Write-SecurityLog "Configuring comprehensive audit logging..." -Level INFO
    
    # Enable advanced audit policy
    auditpol /set /category:"Account Logon" /success:enable /failure:enable
    auditpol /set /category:"Account Management" /success:enable /failure:enable
    auditpol /set /category:"Logon/Logoff" /success:enable /failure:enable
    auditpol /set /category:"Object Access" /success:enable /failure:enable
    auditpol /set /category:"Policy Change" /success:enable /failure:enable
    auditpol /set /category:"Privilege Use" /success:enable /failure:enable
    auditpol /set /category:"System" /success:enable /failure:enable
    
    Write-SecurityLog "Configured comprehensive audit logging" -Level SUCCESS
    
    # Configure log size and retention
    wevtutil sl Security /ms:268435456 /r:4 # 256MB log size, 4 archived logs
    wevtutil sl System /ms:268435456 /r:4
    wevtutil sl Application /ms:268435456 /r:4
    
    Write-SecurityLog "Configured log size and retention" -Level INFO
}

# Main Security Setup Function
function Start-SecuritySetup {
    try {
        Write-SecurityLog "Starting comprehensive security setup..." -Level INFO
        
        if ($HardenSystem) {
            Invoke-SystemHardening
        }
        
        if ($ConfigureFirewall) {
            Configure-Firewall
        }
        
        if ($SetupEncryption) {
            Setup-Encryption
        }
        
        if ($ConfigureAuditLogging) {
            Configure-AuditLogging
        }
        
        Write-SecurityLog "Security setup completed successfully" -Level SUCCESS
        return 0
    }
    catch {
        Write-SecurityLog "Security setup failed: $_" -Level ERROR
        return 1
    }
}

# Execute Security Setup
$result = Start-SecuritySetup
exit $result