import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { test, expect } from '@playwright/test';

const appUrl = pathToFileURL(path.resolve(process.cwd(), 'dist', 'classmates.html')).href;

async function openLanding(page) {
  await page.goto(appUrl);
  await expect(page.locator('#landing')).toHaveClass(/active/);
  await expect(page.locator('#landing .landing-title')).toHaveText('Classmates');
}

async function openPupilHome(page) {
  await openLanding(page);

  // The home screen is an internal screen state, so switch directly for card coverage.
  await page.evaluate(() => window.showScreen('home'));

  await expect(page.locator('#home')).toHaveClass(/active/);
  await expect(page.locator('#home .home-brand-school')).toHaveText('South Lodge Primary');
}

test('landing page shows the school name and teacher entry point', async ({ page }) => {
  await openLanding(page);

  await expect(page.locator('#landing .landing-school')).toContainText('South Lodge');
  await expect(page.getByRole('button', { name: 'Staff Access' })).toBeVisible();
});

test('staff access button opens the teacher login area', async ({ page }) => {
  await openLanding(page);

  await page.getByRole('button', { name: 'Staff Access' }).click();

  await expect(page.locator('#staffModal')).toHaveClass(/show/);
  await expect(page.getByRole('heading', { name: 'Staff Access' })).toBeVisible();
  await expect(page.locator('#staffPwd')).toBeVisible();
});

test('pupil home screen shows visible game cards', async ({ page }) => {
  await openPupilHome(page);

  const visibleCardCount = await page.locator('#home .subject-card').evaluateAll((cards) =>
    cards.filter((card) => {
      const element = /** @type {HTMLElement} */ (card);
      return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
    }).length
  );

  expect(visibleCardCount).toBeGreaterThanOrEqual(5);
  await expect(page.locator('#home .subject-card').filter({ hasText: 'Spelling' }).first()).toBeVisible();
  await expect(page.locator('#home .subject-card').filter({ hasText: 'Maths' }).first()).toBeVisible();
  await expect(page.locator('#home .subject-card').filter({ hasText: 'Times Tables' }).first()).toBeVisible();
});
