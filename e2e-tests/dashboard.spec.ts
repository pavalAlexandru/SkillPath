import { test, expect } from '@playwright/test';

test.describe('Dashboard Feature E2E', () => {
    test.use({
        extraHTTPHeaders: {
            'x-e2e-test': 'true',
        },
    });

    test('student can view dashboard and see mock data', async ({ page }) => {
        // Navigate directly to dashboard (proxy.ts allows this due to x-e2e-test)
        await page.goto('/dashboard');
        
        // Assert that the page loaded successfully
        await expect(page.getByRole('heading', { name: /Salut, E2E Student!/i })).toBeVisible();

        // Assert that the stats are loaded
        await expect(page.getByText('42')).toBeVisible(); // testsCompleted
        await expect(page.getByText('85%').first()).toBeVisible(); // averageScore
        await expect(page.getByText('2 of 5')).toBeVisible(); // categoriesPassed
    });
});
