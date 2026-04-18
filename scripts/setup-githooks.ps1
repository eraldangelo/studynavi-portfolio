param(
  [switch]$Force
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$hooksPath = Join-Path $repoRoot ".githooks"
$prePush = Join-Path $hooksPath "pre-push"

if (-not (Test-Path $prePush)) {
  throw "Missing hook script: $prePush"
}

if ($Force -or -not (Get-Command git -ErrorAction SilentlyContinue)) {
  if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    throw "git is not available in PATH."
  }
}

git config core.hooksPath .githooks
if ($LASTEXITCODE -ne 0) {
  throw "Failed to set core.hooksPath"
}

Write-Host "Git hooks configured: core.hooksPath=.githooks"
Write-Host "Pre-push hook: .githooks/pre-push"
