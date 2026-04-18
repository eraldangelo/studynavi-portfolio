# StudyNavi Application Blueprint

This is the deep architecture and business-logic document.  
Use `docs/README.md` for setup/deploy/test entry points.

## 1. Project Overview

**StudyNavi** is an internal web application designed for education consultants. Its primary purpose is to streamline the creation of personalized study plans for prospective international students. The application functions as a multi-step wizard, gathering detailed information about a student's academic background, financial situation, and study preferences. Based on these inputs, it generates a comprehensive computation sheet and a checklist of required documents, which can be exported as a PDF.

The tool ensures consistency, accuracy, and efficiency in the consultation process, providing students with a clear and detailed "Study Plan."
Production deployment is handled via **Firebase App Hosting**.

---

## 2. Core Features

### 2.1. Multi-Step Wizard (`StudyWizard`)
The core of the application is a step-by-step wizard that guides the consultant through a series of questions.
- **State Persistence:** The wizard's state (current step and answers) is automatically saved to `localStorage`, allowing consultants to resume a session even after closing the browser.
- **Navigation:** Users can navigate to previous steps. The "Next" button is enabled only when the required fields in the current step are addressed (validation is currently permissive).
- **Progressive Disclosure:** The UI is dynamic, showing or hiding questions based on previous answers. For example, the "Bringing Dependents" card only appears if the student's marital status is not 'Never Married' and the destination is not Ireland.

### 2.2. Information Gathering
The wizard is composed of several steps, each focusing on a specific area:
- **Step 1: Destination & Pre-Check:** Select study destination, and answer pre-qualifying questions about visa refusal history.
- **Step 2: Financial Sponsorship:** Determine if the student has a financial sponsor.
- **Step 3: Family & Dependents:** Collect marital status and details about dependents (spouse, children).
- **Step 4: English Proficiency:** Gather details on English test results or plans.
- **Step 5: Education & Work History:** Capture the student's highest educational attainment and relevant work/business experience.
- **Step 6-8: School, Program & Financials:** Input target school, program details, and financial information like tuition fees and scholarships to generate cost estimates.
- **Step 9-10: Documents & Visa Process:** Display a checklist of required documents and visualize the visa application workflow.
- **Step 11: Review & Generate:** A final review step that presents the complete computation sheet.

### 2.3. Dynamic Financial Calculations
- **Real-Time Exchange Rates:** The application fetches exchange rates from an external API and uses them to convert all costs into the destination country's currency and PHP.
- **Cost Estimation:** It calculates:
    - Total tuition fees (with and without scholarships).
    - Initial payment due to the school (e.g., first semester, deposit).
    - Ancillary costs like insurance, visa fees, medical exams, and biometrics.
    - Total initial cash-out required.
    - Estimated funds required for the "Evidence of Funds" (Show Money) visa requirement.

### 2.4. Modal System for Information & Alerts
The application uses a standardized, two-type modal system to provide critical information without cluttering the main UI.
- **Type 1 (Action-Required):** Features footer buttons (e.g., "Acknowledge," "Proceed/Cancel") and no top-close button. Used for critical acknowledgments and decisions.
- **Type 2 (Informational):** Features a single "stoplight" close button in the top-left corner and no footer buttons. Used for displaying supplementary information.

### 2.5. PDF Generation (`jsPDF`)
- The final computation sheet can be downloaded as a professional, well-formatted PDF.
- The system draws structured PDF content directly via `jsPDF` component helpers under `src/lib/pdf/components`.
- The paper size dynamically changes from A4 to Legal format if the computation sheet includes details for dependents, to ensure content fits properly.
- Performance safeguards:
  - destination-specific asset promise caching
  - fingerprinted preview caching and preview-to-download reuse
  - non-blocking preview refresh (old preview stays visible while new preview builds)
  - timing instrumentation for asset load/build/blob/download phases

---

## 3. Technology Stack

- **Framework:** **Next.js 16** with the **App Router** (Turbopack default).
- **Language:** **TypeScript**.
- **Runtime:** **Node.js 20** (Docker base image for build and runtime).
- **Hosting/Deployment:** **Firebase App Hosting** with `apphosting.yaml` configuration.
- **UI Components:** **ShadCN UI**, providing a foundation of accessible and composable components like `Card`, `Dialog` (for modals), `Select`, `Input`, etc.
- **Styling:** **Tailwind CSS** for utility-first styling. A global stylesheet (`globals.css`) defines the application's color theme using HSL CSS variables.
- **State Management:** A combination of React hooks. A global, `localStorage`-backed store is implemented using `useSyncExternalStore` to manage the wizard's state across sessions.
- **AI/Server Actions:** **Genkit** is intended for generating a personalized checklist, though it currently returns a static fallback. This is implemented via a Next.js Server Action in `src/ai/flows/`.
- **Form Handling:** Controlled components using `useState` and `useEffect` hooks within the main `useStudyWizard` hook.
- **Linting:** **ESLint 9** with flat config in `eslint.config.mjs` (run via `npm run lint`).

---

## 4. Code Architecture & Principles

### 4.1. Component-Based Structure
The UI is broken down into modular React components, primarily located in `src/components/`.
- **Wizard Steps:** Each step in the wizard has a dedicated component (e.g., `SchoolAndProgramCard.tsx`, `FinancialDocumentsCard.tsx`).
- **UI Primitives:** Low-level UI elements reside in `src/components/ui/` (from ShadCN).
- **Common Components:** Reusable components like `InfoModal.tsx` are in `src/components/common/`.

### 4.2. Centralized Logic (`useStudyWizard` Hook)
The core business logic, state management, and side effects for the wizard are encapsulated within the `useStudyWizard` custom hook (`src/hooks/study/use-study-wizard.ts`). This hook acts as the single source of truth for the wizard's state.

### 4.3. Data & Configuration
- **Constants:** Questions, steps, and core wizard mappings are defined in `src/lib/core/constants.ts`.
- **Modal Content:** Modal text/configuration is stored in `src/lib/modals/content/` (with typed exports and JSON-backed content where applicable). This separation of content from component logic makes text updates safer and simpler.
  - Country JSON content is now split into grouped files under:
    - `src/lib/modals/content/australia/`
    - `src/lib/modals/content/canada/`
    - `src/lib/modals/content/new-zealand/`
  This keeps each modal content file below the line-length limit and reduces merge conflicts.
- **Business Rules:** Country-specific rules (e.g., program categories, financial calculations) are separated into files within `src/lib/` and `src/services/`, promoting modularity.

### 4.4. Styling
- **Theming:** Colors are managed via CSS variables in `globals.css`, making it easy to adjust the application's theme. The primary colors are blue (`#004097`), yellow (`#eab308`), and white/light-gray backgrounds.
- **Utility-First:** Tailwind CSS is used for most styling, avoiding the need for custom CSS files for individual components.

---

## 5. Financial Logic Structure

- Main orchestration is in `use-study-wizard` (`src/hooks/study/use-study-wizard.ts`), which composes financial outputs from destination-specific services.
- Destination computations are intentionally explicit per destination (`src/services/financials/*`) and rely on runtime fee providers (`src/services/fees/*`).
- Firestore-backed fee assumptions:
  - calculator paths expect stable `fees/*` document shapes
  - fees updater/backup scripts assume this same contract
- Regression protection exists for:
  - destination-specific invariants
  - payment-type behavior
  - deterministic golden-value outputs
  - review/PDF trigger guardrails

## 6. PDF Generation Structure

- Main PDF and non-genuine PDF generation are separated in `src/lib/pdf/generator/*`.
- Worker-enabled generation (`src/components/study/wizard/pdf/*`) is primary, with fallback paths preserved for resilience.
- Preview and download share fingerprint/cache logic to avoid duplicate generation cost.
- Trigger invariants are enforced around review-step readiness, exchange-rate readiness, and required computed outputs.

---

## Additions & Recent Enhancements

### Non-Genuine Recommendation Flow (Step 6)
- The Non-Genuine Recommendation card was updated to a responsive two-column layout on md+ screens while remaining single-column on mobile. The `briefInfo` textarea spans both columns.
- The UI now supports multiple recommendation sets (up to 2). Data is stored in an array `nonGenuineRecommendations` and validated such that each entry needs `recommendedSchool`, `recommendedProgram`, and `briefInfo` (>= 150 chars) to enable the final download.
- The wizard hook performs a migration from legacy single `recommended*` fields into the new `nonGenuineRecommendations` array when loading saved answers.

### Server-side AI Brief Generator
A server API route was added at `src/app/api/ai/brief-info/route.ts` which calls an AI provider server-side and returns generated brief descriptions. The implementation uses OpenAI Responses (model `gpt-5-mini`).
The server route reads a single environment variable, `OPENAI_API_KEY`, from `.env.local`. Keys must not be exposed to the client (no `NEXT_PUBLIC_` prefix).

### Types & Hook Changes
`src/hooks/study/use-study-wizard.ts` includes default `nonGenuineRecommendations` in `initialAnswers` and runs a migration when loading older saved data.

### Operational Notes
- Restart the dev server after adding or rotating `OPENAI_API_KEY` in `.env.local`.
- Production hosting uses Firebase App Hosting rollouts; keep `apphosting.yaml` and Firebase project values aligned before deployment.
- Runtime failures for API/PDF paths emit `[runtime-alert]` logs (including client-forwarded PDF failures via `/api/runtime-alert`) for log-based monitoring.
- Actionable monitoring templates for PDF/API spike alerts are maintained in `firebase/monitoring/`.
- The PDF generator currently does not embed multiple recommendation sets -- this is an extension point under `src/lib/pdf/generator.ts`.
- Run `npm run verify:smoke` before commit/push for the full gate (core verification + browser smoke).
- Optional local maintenance command: `npm run doctor` (env + secrets + endpoint sanity).
- `npm run verify` executes the core non-browser checks:
  - `typecheck`
  - `lint`
  - `check:secrets` (credential/private-key guard)
  - `test:regression` (country invariants + payment-type invariants + deterministic golden values)
  - `build`
  - modal ID/content validation (`check:modals`)
  - file-length policy validation (`check:file-lengths`)
- GitHub `Quality Gate` and `Firebase App Hosting Rollout` should pass before relying on a production rollout.
- `E2E Regression` workflow runs deeper browser checks nightly and on `release-*` tags.
- ADR records for key architecture choices are tracked under `docs/adr/`.
- Dependabot, label sync, and stale-item automation are configured under `.github/`.
- Smoke includes PDF performance budget assertions and preview-reuse checks.
- See `docs/RELEASE_RUNBOOK.md`, `docs/INCIDENT_RUNBOOK.md`, and `docs/COUNTRY_LOGIC_CONTRACT.md` for operating procedures and logic expectations.

---

## 7. Business-Critical Logic Areas (Modify with Care)

- Destination-specific computations:
  - AU/CA/NZ/IE logic is intentionally separated; avoid "generic" merges that blur destination-specific rules.
- Wizard validation and step invariants:
  - review-step activation, non-genuine branching, and prerequisite gating directly affect PDF behavior.
- Payment-due and scholarship math:
  - clamping/source-of-truth behavior is regression-protected and business-visible.
- Firestore fee configuration assumptions:
  - `fees/*` schema changes require coordinated updates across services, updater scripts, and regression fixtures.
- PDF trigger and generation flow:
  - preview/download reuse and worker fallback must preserve current output semantics.

## 8. Known Limitations / Future Extensions

- Non-genuine PDF currently keeps the existing constrained output format; richer multi-recommendation body rendering is an explicit extension point.
- Validation is intentionally permissive in selected wizard areas; any tightening should be paired with regression updates and staged rollout checks.
- Destination logic is intentionally duplicated in places to reduce cross-destination coupling; cleanup should prioritize auditability over abstraction.
- AI checklist/brief generation paths include fallback behavior; output quality can be improved, but fail-safe behavior must remain stable for consultants.


