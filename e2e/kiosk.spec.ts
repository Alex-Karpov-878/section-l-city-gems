import { test, expect } from '@playwright/test';

test.describe('Section L Kiosk Full User Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    await page.evaluate(() => {
      try {
        window.localStorage.clear();
      } catch (error) {
        console.log('localStorage not available:', error);
      }
    });

    await page.reload();
  });

  test('should handle initial configuration and display gems', async ({
    page,
  }) => {
    await expect(page).toHaveURL('/config');
    await expect(
      page.getByRole('heading', { name: 'Kiosk Configuration' }),
    ).toBeVisible();

    await expect(
      page.getByRole('button', {
        name: 'Select Section L Asakusa East property',
      }),
    ).toBeVisible();
    await page
      .getByRole('button', { name: 'Select Section L Asakusa East property' })
      .click();

    await expect(page).toHaveURL('/properties/section-l-asakusa-east');
    await expect(page.getByRole('heading', { name: 'Asakusa' })).toBeVisible();
    await expect(page.getByText('Unlimited Coffee Bar')).toBeVisible(); // Check if a known gem is rendered
  });

  test('should filter gems by search and category', async ({ page }) => {
    // configure the property
    await page.goto('/config');
    await page
      .getByRole('button', { name: 'Select Section L Tsukiji property' })
      .click();
    await expect(page).toHaveURL('/properties/section-l-tsukiji');

    // 1. Search for a specific term
    await page
      .getByPlaceholder('Search for sushi, cafes, museums...')
      .fill('sushi');

    // Wait for debounce and UI update
    await expect(page.getByText('Shutoku Ganso')).toBeVisible();
    await expect(page.getByText('Turret Coffee')).not.toBeVisible();

    // 2. Filter by category
    await page.getByRole('button', { name: 'Food & Drink' }).click();

    // Check that only food items are visible
    const nonFoodItem = page.getByText('Ichifuji'); // This is a "Shopping" gem
    await expect(nonFoodItem).not.toBeVisible();

    // 3. Clear filters
    await page.getByPlaceholder('Search for sushi, cafes, museums...').fill('');
    await page.getByRole('button', { name: 'Food & Drink' }).click(); // Deselect
    await expect(page.getByText('Turret Coffee')).toBeVisible();
    await expect(page.getByText('Ichifuji')).toBeVisible();
  });

  test('should allow adding to favorites and sharing via QR code', async ({
    page,
  }) => {
    // Configure property
    await page.goto('/config');
    await page
      .getByRole('button', { name: 'Select Section L Kuramae property' })
      .click();
    await expect(page).toHaveURL('/properties/section-l-kuramae');

    // 1. Add a gem to favorites
    // Use testid to select the specific gem card (Koncent appears in multiple neighborhoods)
    const firstKoncentButton = page
      .getByTestId('gem-card-favorite-koncent')
      .first();
    await firstKoncentButton.click({ force: true });

    // 2. Verify it appears in the favorites list (favorites panel is only visible on lg+ screens)
    const favoritesPane = page.getByTestId('favorites-panel');

    // Check if the favorites panel is visible on this viewport (hidden on mobile)
    const isPanelVisible = await favoritesPane.isVisible();
    if (isPanelVisible) {
      await expect(
        favoritesPane.getByText('My List(1)', { exact: false }),
      ).toBeVisible();
      await expect(favoritesPane.getByText('Koncent')).toBeVisible();

      // 3. Verify QR code is visible
      await expect(
        favoritesPane.getByText('Scan to Take With You'),
      ).toBeVisible();

      // 4. Remove from favorites
      await favoritesPane.getByLabel('Remove Koncent from favorites').click();
      await expect(
        favoritesPane.getByText('My List(0)', { exact: false }),
      ).toBeVisible();
      await expect(favoritesPane.getByText('Your list is empty')).toBeVisible();
    } else {
      // On mobile, verify the gem was favorited by checking the button state changed
      await expect(firstKoncentButton).toHaveAttribute(
        'aria-label',
        'Remove Koncent from favorites',
      );
    }
  });

  test('should open and close the gem detail modal', async ({ page }) => {
    // Configure property
    await page.goto('/config');
    await page
      .getByRole('button', { name: 'Select Section L Hamamatsucho property' })
      .click();
    await expect(page).toHaveURL('/properties/section-l-hamamatsucho');

    // 1. Click a gem card
    await page.getByText('Eight Coffee').click();

    // 2. Modal appears and URL updates
    await expect(page).toHaveURL(/.*gem=eight-coffee/);
    await expect(
      page.getByRole('heading', { name: 'Eight Coffee' }),
    ).toBeVisible();

    // 3. Close the modal
    // Navigate back to close the modal (simulates browser back button)
    await page.goBack();

    // 4. Modal disappears and URL reverts
    await expect(page).toHaveURL('/properties/section-l-hamamatsucho');
    // Check that the modal is not visible
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('should allow staff to re-enter config mode', async ({ page }) => {
    // Configure property
    await page.goto('/config');
    await page
      .getByRole('button', { name: 'Select Section L Ginza East property' })
      .click();
    await expect(page).toHaveURL('/properties/section-l-ginza-east');

    // Perform the 5-tap gesture
    const logoContainer = page.getByTestId('logo-container');
    await logoContainer.click({ clickCount: 5, delay: 50 });

    // Verify redirect to config page
    await expect(page).toHaveURL('/config');
    await expect(
      page.getByRole('heading', { name: 'Kiosk Configuration' }),
    ).toBeVisible();
  });
});
