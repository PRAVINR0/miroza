const { test, expect } = require('@playwright/test');
const {injectAxe, checkA11y} = require('@axe-core/playwright');

test('Accessibility audit: homepage', async ({ page }) => {
  await page.goto('/');
  await injectAxe(page);
  // check main landmarks and run axe; will throw on violations
  await checkA11y(page, 'main', {
    detailedReport: true
  });
});

test('Accessibility audit: article page', async ({ page }) => {
  await page.goto('/articles/article-1.html');
  await injectAxe(page);
  await checkA11y(page, 'main', { detailedReport: true });
});
