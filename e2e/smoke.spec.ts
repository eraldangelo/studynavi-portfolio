import { expect, test } from '@playwright/test';
import { baseAnswers, clearLocalStorage, setAuthenticated, setWizardState } from './helpers/wizard-fixtures';

test.beforeEach(async ({ page }) => {
  await clearLocalStorage(page);
});

test('redirects unauthenticated users to login', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/login\?next=%2F/);
  await expect(page.getByText('Please sign in to continue')).toBeVisible();
});

test('login page renders sign-in UI', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByText('Please sign in to continue')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
});

test('renders wizard payment details flow for Australia', async ({ page }) => {
  await setAuthenticated(page);
  await setWizardState(page, 7, { ...baseAnswers(), studyDestination: 'Australia' });
  await page.goto('/');
  await expect(page.getByText('Tuition Fee Details')).toBeVisible();
  await expect(page.getByText(/Dependent Biometrics/)).toBeVisible();
});

test('pdf review and download flow completes', async ({ page }) => {
  await setAuthenticated(page);
  await setWizardState(page, 11, { ...baseAnswers(), studyDestination: 'Australia' });
  await page.goto('/');

  await expect(page.getByText('Generating PDF Preview...')).toBeVisible();
  const closeChatButton = page.getByRole('button', { name: 'Close AI chatbot' });
  if (await closeChatButton.isVisible()) {
    await closeChatButton.click();
  }

  const downloadButton = page.getByTestId('download-pdf-button');
  await expect(downloadButton).toBeEnabled({ timeout: 120_000 });
  await downloadButton.click();
  await expect.poll(async () => {
    if (await page.getByText('Guide Downloaded').isVisible().catch(() => false)) {
      return 'complete';
    }
    const currentButton = page.getByTestId('download-pdf-button');
    const exists = await currentButton.count();
    if (exists === 0) return 'gone';
    return (await currentButton.isDisabled()) ? 'disabled' : 'enabled';
  }, { timeout: 90_000 }).not.toBe('enabled');

  const previewPerf = await page.evaluate(() => (globalThis as any).__studyNaviPdfPerf?.lastByPhase?.preview ?? null);
  expect(previewPerf).toBeTruthy();
  expect(previewPerf.totalMs).toBeLessThanOrEqual(75_000);
  expect(previewPerf.assetLoadMs).toBeLessThanOrEqual(60_000);

  const downloadPerf = await page.evaluate(() => (globalThis as any).__studyNaviPdfPerf?.lastByPhase?.download ?? null);
  expect(downloadPerf).toBeTruthy();
  expect(downloadPerf.reusedPreview).toBe(true);
  expect(downloadPerf.totalMs).toBeLessThanOrEqual(75_000);
});

test('payment type manual and deposit flows keep due values stable and non-negative', async ({ page }) => {
  await setAuthenticated(page);
  await setWizardState(page, 7, { ...baseAnswers(), studyDestination: 'Australia' });
  await page.goto('/');

  await expect(page.getByText('Tuition Fee Details')).toBeVisible();
  const paymentTypeTrigger = page.getByTestId('payment-type-select-trigger');
  const paymentDueAmount = page.getByTestId('payment-due-amount');

  await paymentTypeTrigger.click();
  await page.getByRole('option', { name: 'Manual (for trimester schools)' }).click();
  const manualInput = page.getByTestId('manual-payment-input');
  await expect(manualInput).toBeVisible();
  await manualInput.fill('12312');
  await expect(paymentDueAmount).toContainText('12,312.00');

  const schoolFeeInput = page.getByTestId('school-application-fee-input');
  await schoolFeeInput.fill('12000');
  await expect(paymentDueAmount).toContainText('12,312.00');

  await paymentTypeTrigger.click();
  await page.getByRole('option', { name: 'Tuition Fee Deposit Only' }).click();
  const depositInput = page.getByTestId('tuition-fee-deposit-input');
  await expect(depositInput).toBeVisible();
  await depositInput.fill('2500');

  await expect(paymentDueAmount).toContainText('2,500.00');
  await expect(paymentDueAmount).not.toContainText('-');
  const remainingAmount = page.getByTestId('payment-due-remaining-amount');
  await expect(remainingAmount).toBeVisible();
  await expect(remainingAmount).not.toContainText('-');
});
