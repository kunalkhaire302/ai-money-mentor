import { test, expect } from '@playwright/test';

const ROUTES = [
  '/',
  '/health-score',
  '/tax-wizard',
  '/fire-planner'
];

const COMPLIANCE_TEXT = "AI Analysis — Not Investment Advice. The information provided by AI";

test.describe("Compliance Guardrail Tests [CRITICAL]", () => {
    
  for (const route of ROUTES) {
    test(`Asserts SEBI compliance text is visible on route: ${route}`, async ({ page }) => {
      // Navigate to the route
      await page.goto(`http://localhost:3000${route}`);
      
      // Wait for layout to render
      await page.waitForLoadState("domcontentloaded");
      
      // Locate the footer and ensure it contains the disclaimer
      const complianceLocator = page.locator('footer').filter({ hasText: /AI Analysis — Not Investment Advice/i });
      
      // Assert that it is visible and present in the DOM
      await expect(complianceLocator.first()).toBeVisible({ timeout: 5000 });
    });
  }

});
