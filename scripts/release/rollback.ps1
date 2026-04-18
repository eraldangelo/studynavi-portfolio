param(
  [Parameter(Mandatory = $true)]
  [string]$TargetCommit,
  [switch]$Apply,
  [switch]$SkipPush
)

$ErrorActionPreference = "Stop"

function Invoke-OrPrint {
  param([string]$Command)
  if ($Apply) {
    Write-Host "RUN  $Command"
    iex $Command
    if ($LASTEXITCODE -ne 0) {
      throw "Command failed: $Command"
    }
  } else {
    Write-Host "PLAN $Command"
  }
}

Write-Host "Rollback helper"
Write-Host "Target commit: $TargetCommit"
Write-Host "Apply mode: $Apply"

Invoke-OrPrint "git fetch origin"
Invoke-OrPrint "git checkout main"
Invoke-OrPrint "git pull --ff-only origin main"
Invoke-OrPrint "git revert --no-edit $TargetCommit"

if (-not $SkipPush) {
  Invoke-OrPrint "git push origin main"
}

if ($Apply) {
  Write-Host "Rollback completed."
} else {
  Write-Host "Dry run complete. Re-run with -Apply to execute."
}
