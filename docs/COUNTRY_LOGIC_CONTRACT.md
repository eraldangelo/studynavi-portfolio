# Country Logic Contract

Purpose: document stable business-logic expectations by destination and map them to automated checks.

## Australia

- Initial expenses include dependent split:
  - spouse/de facto visa (`dependentVisaFeeOver18`)
  - child visa (`dependentVisaFee`)
  - dependent biometrics (`dependentBiometricsFee`)
- Financial documents include:
  - one-year tuition
  - student/partner/child living costs
  - airfare per person

Regression coverage:
- `scripts/regression-tests.ts`
  - `Australia dependent fee split is preserved`

## New Zealand

- Initial expenses include dependent split:
  - spouse visa (`dependentVisaFeeOver18`)
  - school-age child visa (`dependentVisaFeeSchoolAge`)
  - non-school-age child visa (`dependentVisaFeeNonSchoolAge`)
- Financial documents:
  - NZ evidence model (no one-year tuition line in current calculator)
  - school-age/non-school-age cost split

Regression coverage:
- `scripts/regression-tests.ts`
  - `New Zealand school-age and non-school-age split is preserved`

## Canada

- Initial expenses include:
  - spouse OWP visa
  - child visitor visa (0-4)
  - child study permit (5+)
  - age-tier medical rows
  - family biometrics in main `biometricsFee` field
- Financial documents use combined cost-of-living tiers.

Regression coverage:
- `scripts/regression-tests.ts`
  - `Canada spouse/visitor/study permit and medical tier logic is preserved`
  - `Financial document models remain destination-specific`

## Ireland

- No dependent-fee rows in initial expenses.
- Medical and biometrics initial-fee fields remain zero.
- Financial documents rely on cost-of-living requirement baseline.

Regression coverage:
- `scripts/regression-tests.ts`
  - `Ireland keeps dependent and medical/biometrics fees at zero`
  - `Financial document models remain destination-specific`

## Wizard PDF Trigger Rules

- Review step is active only when:
  - not in non-genuine flow
  - `currentStep === effectiveTotalSteps`
- PDF preview starts only when:
  - review step active
  - rates loaded
  - exchange rates + payment details + financial documents are present
- Download button is disabled when:
  - downloading in progress, or
  - no `pdfUrl`

Regression coverage:
- `scripts/regression-tests.ts`
  - `Review-step rule stays tied to non-genuine flow and step index`
  - `PDF preview only starts when all review prerequisites are present`
  - `Download button disable rule remains consistent`
