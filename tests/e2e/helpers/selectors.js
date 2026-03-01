/**
 * E2E helpers: stable data-testid selectors and small flows.
 * Prefer data-testid over text or CSS class selectors.
 */

export const selectors = {
  layout: '[data-testid="layout"]',
  header: '[data-testid="header"]',
  navHome: '[data-testid="nav-home"]',
  navAbout: '[data-testid="nav-about"]',
  pageHome: '[data-testid="page-home"]',
  pageAbout: '[data-testid="page-about"]',
  homeHeroTitle: '[data-testid="home-hero-title"]',
  aboutContent: '[data-testid="about-content"]',
};

export async function navigateTo(page, path) {
  await page.goto(path);
}
