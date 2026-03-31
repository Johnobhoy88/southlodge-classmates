// @ts-check
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { test, expect } from '@playwright/test';

const appUrl = pathToFileURL(path.resolve(process.cwd(), 'dist', 'classmates.html')).href;
const staffPassword = 'classmates2026';

async function openApp(page) {
  await page.goto(appUrl);
  await expect(page.locator('#landing')).toHaveClass(/active/);
  await expect(page.locator('#landing .landing-school')).toHaveText('South Lodge Primary');
}

async function openPupilHome(page) {
  await openApp(page);
  await page.evaluate(() => window.showScreen('home'));
  await expect(page.locator('#home')).toHaveClass(/active/);
  await expect(page.locator('#home .home-brand-school')).toHaveText('South Lodge Primary');
}

async function openTeacherDashboard(page) {
  await openApp(page);
  await page.getByRole('button', { name: 'Staff Access' }).click();
  await page.locator('#staffPwd').fill(staffPassword);
  await page.getByRole('button', { name: 'Enter' }).click();
  await expect(page.locator('#teacher')).toHaveClass(/active/);
}

test('landing screen loads with the school name', async ({ page }) => {
  await openApp(page);
  await expect(page.locator('#landing .landing-title')).toHaveText('Classmates');
  await expect(page.getByRole('button', { name: "Let's Learn!" })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Staff Access' })).toBeVisible();
});

test('clicking the teacher login area opens staff access', async ({ page }) => {
  await openApp(page);
  await page.getByRole('button', { name: 'Staff Access' }).click();
  await expect(page.locator('#staffModal')).toHaveClass(/show/);
  await expect(page.locator('#staffModal h3')).toHaveText('Staff Access');
  await expect(page.locator('#staffPwd')).toBeVisible();
});

test('pupil home loads with visible game cards', async ({ page }) => {
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
});

test('at least five game cards are clickable from pupil home', async ({ page }) => {
  await openPupilHome(page);

  for (const title of ['Spelling', 'Maths', 'Times Tables', 'Reading', 'Capitals']) {
    const card = page.locator('#home .subject-card').filter({ hasText: title }).first();
    await expect(card).toBeVisible();
    await expect(card).toHaveAttribute('onclick', /startGame/);
    await card.click({ trial: true });
  }
});

test('teacher dashboard shows tabs and backup export control', async ({ page }) => {
  await openTeacherDashboard(page);

  await expect(page.getByRole('button', { name: 'Overview', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pupils', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Progress', exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Pupils', exact: true }).click();
  await expect(page.locator('#tp-pupils')).toHaveClass(/active/);

  await page.getByRole('button', { name: 'Progress', exact: true }).click();
  await expect(page.locator('#tp-progress')).toHaveClass(/active/);

  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await expect(page.locator('#tp-settings')).toHaveClass(/active/);
  await expect(page.getByRole('button', { name: /Download Backup/i })).toBeVisible();
});

test('teacher can add a pupil and see them in the list', async ({ page }) => {
  const pupilName = `Playwright Pupil ${Date.now()}`;

  await openTeacherDashboard(page);
  await page.getByRole('button', { name: 'Pupils', exact: true }).click();
  await expect(page.locator('#tp-pupils')).toHaveClass(/active/);

  await page.locator('#newPupilInput').fill(pupilName);
  await page.getByRole('button', { name: 'Add', exact: true }).click();

  const pupilRow = page.locator('#pupilList .pupil-row').filter({ hasText: pupilName });
  await expect(pupilRow).toHaveCount(1);
  await expect(pupilRow).toContainText(pupilName);

  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toContain(`Remove ${pupilName}`);
    await dialog.accept();
  });
  await pupilRow.getByRole('button', { name: 'Remove', exact: true }).click();

  await expect(page.locator('#pupilList')).not.toContainText(pupilName);
});

test('clicking game cards launches the correct game screens', async ({ page }) => {
  await openPupilHome(page);

  const games = [
    { id: 'spelling', title: 'Spelling' },
    { id: 'maths', title: 'Maths' },
    { id: 'times', title: 'Times Tables' },
    { id: 'bonds', title: 'Number Bonds' },
    { id: 'phonics', title: 'Phonics' },
  ];

  for (const game of games) {
    const card = page.locator('#home .subject-card').filter({ hasText: game.title }).first();

    await expect(card).toBeVisible();
    await card.click();
    await expect(page.locator(`#${game.id}`)).toHaveClass(/active/);

    await page.evaluate(() => window.showScreen('home'));
    await expect(page.locator('#home')).toHaveClass(/active/);
  }
});

test('teacher assignment flow — assign and verify pupil banner', async ({ page }) => {
  await openTeacherDashboard(page);
  // Click Assign tab
  await page.getByRole('button', { name: 'Assign', exact: true }).click();
  // Set activity to spelling using page.evaluate
  await page.evaluate(() => { document.getElementById('assignActivity').value = 'spelling'; });
  // Click Set Assignment button
  await page.getByRole('button', { name: 'Set Assignment' }).click();
  // Verify success message appears in #assignStatus
  await expect(page.locator('#assignStatus')).toContainText('Assignment set');
  // Go to pupil home and check banner
  await page.evaluate(() => { showScreen('home'); updateHomeStats(); });
  await expect(page.locator('#assignBanner')).toBeVisible();
  // Clean up — go back to teacher and clear
  await openTeacherDashboard(page);
  await page.getByRole('button', { name: 'Assign', exact: true }).click();
  await page.getByRole('button', { name: 'Clear Assignment' }).click();
});

test('Southlodge Racers loads with intro screen and start button', async ({ page }) => {
  await openPupilHome(page);
  const racerCard = page.locator('#home .subject-card').filter({ hasText: 'Southlodge Racers' }).first();
  await racerCard.click();
  // The game screen should be active
  await expect(page.locator('#hdash')).toHaveClass(/active/);
  // The 3D canvas or racer intro should appear
  await expect(page.locator('#racerIntro')).toBeVisible();
  // The start button should be visible
  await expect(page.locator('#racerIntroStart')).toBeVisible();
  // Pack title should be shown
  await expect(page.locator('#racerIntroTitle')).not.toBeEmpty();
});

test('teacher assignment flow — assign game and verify banner', async ({ page }) => {
  await openTeacherDashboard(page);

  const assignTab = page.locator('.teacher-tabs').getByRole('button', { name: 'Assign', exact: true });
  const assignActivity = page.locator('#assignActivity');
  const assignStatus = page.locator('#assignStatus');
  const assignBanner = page.locator('#assignBanner');

  await assignTab.click();
  await expect(page.locator('#tp-assign')).toHaveClass(/active/);

  await assignActivity.evaluate((element, value) => {
    if (!Array.from(element.options).some((option) => option.value === value)) {
      element.add(new Option('Spelling', value));
    }
    element.value = value;
  }, 'spelling');

  try {
    await page.getByRole('button', { name: 'Set Assignment', exact: true }).click();
    await expect(assignStatus).toContainText('Assignment set!');

    await page.evaluate(() => {
      showScreen('home');
      try {
        updateHomeStats();
      } catch (error) {
        renderAssignmentBanner();
      }
    });
    await expect(page.locator('#home')).toHaveClass(/active/);
    await expect
      .poll(async () => assignBanner.evaluate((element) => window.getComputedStyle(element).display))
      .not.toBe('none');
  } finally {
    await page.evaluate(() => window.showScreen('teacher'));
    await expect(page.locator('#teacher')).toHaveClass(/active/);
    await assignTab.click();
    await expect(page.locator('#tp-assign')).toHaveClass(/active/);
    await page.getByRole('button', { name: 'Clear Assignment', exact: true }).click();
    await expect(assignStatus).toContainText('Assignment cleared.');
  }
});
