# ==============================================================================
# mcp-state Installer for Windows PowerShell
# Usage: irm https://raw.githubusercontent.com/JohnnytheShark/mcp-state/main/install.ps1 | iex
# ==============================================================================

$ErrorActionPreference = "Stop"

$Repo = "JohnnytheShark/mcp-state"
$GitHubApi = "https://api.github.com/repos/$Repo/releases/latest"

Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "  mcp-state Installer (Windows PowerShell)" -ForegroundColor Cyan
Write-Host "===========================================================" -ForegroundColor Cyan

# 1. Architecture Check
$Arch = $env:PROCESSOR_ARCHITECTURE
if ($Arch -ne "AMD64" -and $Arch -ne "ARM64") {
    Write-Warning "Unsupported processor architecture: $Arch. Defaulting to x86_64."
}
$Target = "x86_64-pc-windows-msvc"

# 2. Get Latest Tag
Write-Host "[+] Querying GitHub for latest release..." -ForegroundColor Green
$Tag = "v0.2.0"
try {
    $ReleaseInfo = Invoke-RestMethod -Uri $GitHubApi -Headers @{ "User-Agent" = "mcp-state-installer" }
    if ($ReleaseInfo.tag_name) {
        $Tag = $ReleaseInfo.tag_name
    }
} catch {
    Write-Warning "Could not fetch release tag from GitHub API, fallback to $Tag"
}

$ArchiveName = "mcp-state-$Tag-$Target"
$DownloadUrl = "https://github.com/$Repo/releases/download/$Tag/$ArchiveName.zip"
$InstallDir = Join-Path $HOME ".mcp-state\bin"
$TempZip = Join-Path $env:TEMP "$ArchiveName.zip"
$TempExtract = Join-Path $env:TEMP $ArchiveName

Write-Host "[+] Downloading $ArchiveName.zip ($Tag)..." -ForegroundColor Green
Invoke-WebRequest -Uri $DownloadUrl -OutFile $TempZip -UseBasicParsing

Write-Host "[+] Extracting archive..." -ForegroundColor Green
if (Test-Path $TempExtract) {
    Remove-Item -Recurse -Force $TempExtract
}
Expand-Archive -Path $TempZip -DestinationPath $env:TEMP -Force

if (-not (Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
}

$ExtractedBinary = Join-Path $TempExtract "mcp-state.exe"
if (-not (Test-Path $ExtractedBinary)) {
    $ExtractedBinary = Join-Path (Join-Path $env:TEMP $ArchiveName) "mcp-state.exe"
}

Copy-Item -Path $ExtractedBinary -Destination (Join-Path $InstallDir "mcp-state.exe") -Force

# Clean up
Remove-Item -Force $TempZip -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force $TempExtract -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "  ✓ Successfully installed mcp-state to: $InstallDir\mcp-state.exe" -ForegroundColor Green
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host ""

# 3. Check and Update User PATH
$UserPath = [Environment]::GetEnvironmentVariable("Path", [EnvironmentVariableTarget]::User)
if ($UserPath -notlike "*$InstallDir*") {
    Write-Host "[+] Adding $InstallDir to your User PATH..." -ForegroundColor Yellow
    [Environment]::SetEnvironmentVariable("Path", "$UserPath;$InstallDir", [EnvironmentVariableTarget]::User)
    $env:Path = "$env:Path;$InstallDir"
    Write-Host "[+] PATH updated. Please restart your terminal if needed." -ForegroundColor Green
}

Write-Host "Run 'mcp-state' to get started!" -ForegroundColor Cyan
