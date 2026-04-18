param(
  [string]$ProjectId = "your-firebase-project-id",
  [string]$SourceBackend = "studio",
  [string]$SourceLocation = "us-central1",
  [string]$TargetBackend = "studio-asia",
  [string]$TargetLocation = "asia-southeast1",
  [string]$SourceBuildId = "",
  [string]$RolloutPrefix = "sync",
  [int]$PollSeconds = 5,
  [int]$MaxPollCount = 120
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Invoke-AppHostingApi {
  param(
    [Parameter(Mandatory = $true)][string]$Method,
    [Parameter(Mandatory = $true)][string]$Uri,
    [object]$Body = $null
  )

  $token = gcloud auth print-access-token
  if (-not $token) {
    throw "Failed to get gcloud access token. Run 'gcloud auth login' first."
  }

  $headers = @{ Authorization = "Bearer $token" }
  if ($null -eq $Body) {
    return Invoke-RestMethod -Method $Method -Headers $headers -Uri $Uri
  }

  return Invoke-RestMethod -Method $Method -Headers $headers -Uri $Uri -ContentType "application/json" -Body ($Body | ConvertTo-Json -Depth 100)
}

function Wait-Operation {
  param(
    [Parameter(Mandatory = $true)][string]$ProjectId,
    [Parameter(Mandatory = $true)][string]$Location,
    [Parameter(Mandatory = $true)][string]$OperationName,
    [int]$PollSeconds = 5,
    [int]$MaxPollCount = 120
  )

  for ($i = 0; $i -lt $MaxPollCount; $i++) {
    Start-Sleep -Seconds $PollSeconds
    $op = Invoke-AppHostingApi -Method GET -Uri "https://firebaseapphosting.googleapis.com/v1beta/$OperationName"
    if ($op.done -eq $true) {
      if ($op.error) {
        $errorJson = $op.error | ConvertTo-Json -Compress
        throw "Operation failed: $errorJson"
      }
      return $op
    }
  }

  throw "Timed out waiting for operation '$OperationName'."
}

function Resolve-SourceBuildId {
  param(
    [Parameter(Mandatory = $true)][string]$ProjectId,
    [Parameter(Mandatory = $true)][string]$SourceLocation,
    [Parameter(Mandatory = $true)][string]$SourceBackend
  )

  $rolloutsUri = "https://firebaseapphosting.googleapis.com/v1beta/projects/$ProjectId/locations/$SourceLocation/backends/$SourceBackend/rollouts?pageSize=50"
  $rollouts = Invoke-AppHostingApi -Method GET -Uri $rolloutsUri
  if (-not $rollouts.rollouts) {
    throw "No rollouts found for source backend '$SourceBackend'."
  }

  $latest = $rollouts.rollouts |
    Sort-Object -Property createTime -Descending |
    Where-Object { $_.state -eq "SUCCEEDED" -and $_.build } |
    Select-Object -First 1

  if (-not $latest) {
    throw "No successful rollout with build reference found for '$SourceBackend'."
  }

  $segments = [string]$latest.build -split "/"
  return $segments[-1]
}

$effectiveSourceBuildId = $SourceBuildId
if ([string]::IsNullOrWhiteSpace($effectiveSourceBuildId)) {
  $effectiveSourceBuildId = Resolve-SourceBuildId -ProjectId $ProjectId -SourceLocation $SourceLocation -SourceBackend $SourceBackend
}

Write-Host "Using source build: $effectiveSourceBuildId"

$sourceBuildUri = "https://firebaseapphosting.googleapis.com/v1beta/projects/$ProjectId/locations/$SourceLocation/backends/$SourceBackend/builds/$effectiveSourceBuildId"
$sourceBuild = Invoke-AppHostingApi -Method GET -Uri $sourceBuildUri

if (-not $sourceBuild.image) {
  throw "Source build '$effectiveSourceBuildId' does not include a container image."
}

$runtimeEnv = @()
foreach ($envItem in $sourceBuild.config.env) {
  if ($envItem.availability -contains "RUNTIME") {
    $runtimeEnv += $envItem
  }
}

if ($runtimeEnv.Count -eq 0) {
  throw "No runtime env entries found in source build '$effectiveSourceBuildId'."
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$targetBuildId = "$RolloutPrefix-$timestamp-build"
$targetRolloutId = "$RolloutPrefix-$timestamp-rollout"

$createBuildUri = "https://firebaseapphosting.googleapis.com/v1beta/projects/$ProjectId/locations/$TargetLocation/backends/$TargetBackend/builds?buildId=$targetBuildId"
$createBuildBody = @{
  source = @{
    container = @{
      image = $sourceBuild.image
    }
  }
  config = @{
    runConfig = $sourceBuild.config.runConfig
    env = $runtimeEnv
  }
  labels = @{
    "deployment-tool" = "manual-sync-script"
    "source-backend" = $SourceBackend
    "source-build" = $effectiveSourceBuildId
  }
}

$buildOperation = Invoke-AppHostingApi -Method POST -Uri $createBuildUri -Body $createBuildBody
Write-Host "Creating target build '$targetBuildId'..."
Wait-Operation -ProjectId $ProjectId -Location $TargetLocation -OperationName $buildOperation.name -PollSeconds $PollSeconds -MaxPollCount $MaxPollCount | Out-Null
Write-Host "Target build ready."

$createRolloutUri = "https://firebaseapphosting.googleapis.com/v1beta/projects/$ProjectId/locations/$TargetLocation/backends/$TargetBackend/rollouts?rolloutId=$targetRolloutId"
$createRolloutBody = @{
  build = "projects/$ProjectId/locations/$TargetLocation/backends/$TargetBackend/builds/$targetBuildId"
}

$rolloutOperation = Invoke-AppHostingApi -Method POST -Uri $createRolloutUri -Body $createRolloutBody
Write-Host "Creating target rollout '$targetRolloutId'..."
Wait-Operation -ProjectId $ProjectId -Location $TargetLocation -OperationName $rolloutOperation.name -PollSeconds $PollSeconds -MaxPollCount $MaxPollCount | Out-Null

$targetRolloutUri = "https://firebaseapphosting.googleapis.com/v1beta/projects/$ProjectId/locations/$TargetLocation/backends/$TargetBackend/rollouts/$targetRolloutId"
$targetRollout = Invoke-AppHostingApi -Method GET -Uri $targetRolloutUri

Write-Host "Target rollout state: $($targetRollout.state)"
Write-Host "Target rollout: $($targetRollout.name)"

if ($targetRollout.state -ne "SUCCEEDED") {
  throw "Target rollout did not succeed (state=$($targetRollout.state))."
}

Write-Host "Sync complete."

