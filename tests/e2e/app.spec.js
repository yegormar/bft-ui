import { test, expect } from '@playwright/test';
import { selectors, navigateTo } from './helpers/selectors';

test.describe('App', () => {
  test('loads and shows home page', async ({ page }) => {
    await navigateTo(page, '/');
    await expect(page.locator(selectors.layout)).toBeVisible();
    await expect(page.locator(selectors.pageHome)).toBeVisible();
    await expect(page.locator(selectors.homeHeroTitle)).toContainText('Built for Tomorrow');
  });

  test('navigates from Home to About', async ({ page }) => {
    await navigateTo(page, '/');
    await page.click(selectors.navAbout);
    await expect(page.locator(selectors.pageAbout)).toBeVisible();
    await expect(page.locator(selectors.aboutContent)).toContainText('about page');
  });
});
