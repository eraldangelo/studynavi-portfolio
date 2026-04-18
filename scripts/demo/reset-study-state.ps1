param(
  [switch]$Seed,
  [string]$OutputFile = "scripts/demo/study-wizard-demo-state.json",
  [switch]$CopySnippet
)

$ErrorActionPreference = "Stop"
$stateKey = "studyWizardState"

if ($Seed) {
  $demoState = @{
    savedStep = 7
    savedAnswers = @{
      studyDestination = "Australia"
      financialSponsor = "Yes"
      maritalStatus = "Married"
      visaAssistance = "Spouse/De Facto and Child/ren"
      numberOfChildren = "2"
      numberOfSchoolAgeChildren = "1"
      numberOfNonSchoolAgeChildren = "1"
      annualTuitionFee = "20000"
      programDuration = "2"
      paymentType = "1_semester"
      scholarshipType = "first_year_only"
      scholarshipPercentage = "20"
      schoolApplicationFee = "100"
      englishTestRequired = "true"
      ieltsPreparation = "No"
      requiredTBTest = "false"
    }
  }

  $json = $demoState | ConvertTo-Json -Depth 8
  $dir = Split-Path -Parent $OutputFile
  if ($dir -and -not (Test-Path $dir)) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
  }
  Set-Content -Path $OutputFile -Value $json -Encoding UTF8
  Write-Host "Demo state file written: $OutputFile"

  $snippet = "localStorage.setItem('$stateKey', JSON.stringify($json)); location.reload();"
} else {
  $snippet = "localStorage.removeItem('$stateKey'); location.reload();"
  Write-Host "Reset mode selected."
}

Write-Host ""
Write-Host "Run this in browser DevTools Console:"
Write-Host $snippet

if ($CopySnippet) {
  Set-Clipboard -Value $snippet
  Write-Host "Snippet copied to clipboard."
}
