import { test, expect } from '@playwright/test';

test.describe('Propose Feature E2E', () => {
    test.use({
        extraHTTPHeaders: {
            'x-e2e-test': 'true',
        },
    });

    test('student can propose a new question', async ({ page }) => {
        // Navigate directly to propose page (proxy.ts allows this due to x-e2e-test)
        await page.goto('/propose');
        
        await expect(page.getByRole('heading', { name: /Propune o Întrebare/i })).toBeVisible();

        const uniqueString = `Test Q ${Date.now()}`;

        // Select the first real category (index 1)
        await page.locator('select').selectOption({ index: 1 });

        // Select Difficulty
        await page.getByText('Mediu').click();

        // Fill Question text
        await page.getByPlaceholder('Scrie textul întrebării...').fill(`This is an e2e test question: ${uniqueString}`);

        // Fill Options
        await page.getByPlaceholder('Opțiunea 1').fill('Răspuns A');
        await page.getByPlaceholder('Opțiunea 2').fill('Răspuns B');
        await page.getByPlaceholder('Opțiunea 3').fill('Răspuns C');
        await page.getByPlaceholder('Opțiunea 4').fill('Răspuns D');

        // Click the third option as correct (radio button)
        await page.locator('input[name="correctOption"]').nth(2).click();

        // Submit
        await page.getByRole('button', { name: /Trimite spre aprobare/i }).click();

        // Verify success message
        await expect(page.getByText('Întrebarea a fost propusă cu succes și așteaptă aprobarea!')).toBeVisible({ timeout: 10000 });
    });
});
