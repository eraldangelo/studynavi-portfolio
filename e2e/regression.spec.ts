import { expect, test } from '@playwright/test';
import { baseAnswers, clearLocalStorage, setAuthenticated, setWizardState } from './helpers/wizard-fixtures';

const destinationCases = [
  {
    name: 'Canada',
    answers: { ...baseAnswers(), studyDestination: 'Canada' },
    expectedRegex: /Spouse w\/ OWP/,
  },
  {
    name: 'New Zealand',
    answers: { ...baseAnswers(), studyDestination: 'New Zealand' },
    expectedRegex: /^\(School Age\)$/,
  },
  {
    name: 'Ireland',
    answers: {
      ...baseAnswers(),
      studyDestination: 'Ireland',
      maritalStatus: 'Never Married',
      visaAssistance: 'No',
      numberOfChildren: '0',
    },
    expectedRegex: null,
  },
] as const;

test.beforeEach(async ({ page }) => {
  await clearLocalStorage(page);
});

for (const item of destinationCases) {
  test(`renders wizard payment details flow for ${item.name}`, async ({ page }) => {
    await setAuthenticated(page);
    await setWizardState(page, 7, item.answers);
    await page.goto('/');

    await expect(page.getByText('Tuition Fee Details')).toBeVisible();
    if (item.expectedRegex) {
      await expect(page.getByText(item.expectedRegex)).toBeVisible();
    } else {
      await expect(page.getByText('Additional Fees for Dependents')).toHaveCount(0);
    }
  });
}

test('fees updater save path persists edited value', async ({ page }) => {
  await setAuthenticated(page);
  await page.goto('/fees-updater');

  await expect(page.getByText('Fees Updater')).toBeVisible();
  const editButton = page.getByTestId('fees-edit-button').first();
  await expect(editButton).toBeVisible();
  await editButton.click();

  const firstInput = page.locator('input[type="number"]').first();
  await expect(firstInput).toBeVisible();
  await firstInput.fill('999');

  let dialogMessage = '';
  page.once('dialog', async (dialog) => {
    dialogMessage = dialog.message();
    await dialog.accept();
  });
  await page.getByTestId('fees-save-button').first().click();
  await expect.poll(() => dialogMessage).toContain('saved successfully');

  await page.getByTestId('fees-edit-button').first().click();
  await expect(page.locator('input[type="number"]').first()).toHaveValue('999');
});
