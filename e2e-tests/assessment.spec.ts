import { test, expect } from '@playwright/test';

test.describe('Assessment Flow E2E', () => {
    test.use({
        extraHTTPHeaders: {
            'x-e2e-test': 'true',
        },
    });

    test('utilizatorul poate parcurge și finaliza un test complet', async ({ page }) => {
        // 1. Deschide direct pagina de evaluare pentru categoria 1
        await page.goto('/assessment/1');

        // 2. Așteaptă încărcarea întrebărilor și a antetului
        await expect(page.getByText(/Întrebarea 1 din/i)).toBeVisible({ timeout: 10000 });

        // 3. Verifică faptul că butonul de Next este inițial dezactivat
        const nextButton = page.getByRole('button', { name: /Următoarea Întrebare|Finalizează Testul/i });
        await expect(nextButton).toBeDisabled();

        // 4. Parcurge toate cele 10 întrebări
        for (let i = 0; i < 10; i++) {
            // Selectează prima opțiune disponibilă
            await page.locator('label').first().click();
            await expect(nextButton).toBeEnabled();

            // Click pe următorul pas
            await nextButton.click();
        }

        // 5. Verifică ecranul final de rezultat
        await expect(page.getByText(/Test Finalizat cu Succes!|Evaluare Finalizată/i)).toBeVisible({ timeout: 5000 });
        await expect(page.getByText(/Mastery Score/i)).toBeVisible();
    });

    test('navigarea înainte și înapoi funcționează corect', async ({ page }) => {
        await page.goto('/assessment/1');

        await expect(page.getByText(/Întrebarea 1 din/i)).toBeVisible({ timeout: 10000 });

        // Butonul Înapoi trebuie să fie dezactivat la întrebarea 1
        const prevButton = page.getByRole('button', { name: /Înapoi/i });
        await expect(prevButton).toBeDisabled();

        // Selectează o opțiune și mergi la întrebarea 2
        await page.locator('label').first().click();
        await page.getByRole('button', { name: /Următoarea Întrebare/i }).click();

        await expect(page.getByText(/Întrebarea 2 din/i)).toBeVisible();
        await expect(prevButton).toBeEnabled();

        // Revino la întrebarea 1
        await prevButton.click();
        await expect(page.getByText(/Întrebarea 1 din/i)).toBeVisible();
        await expect(prevButton).toBeDisabled();
    });
});