import { test, expect } from '@playwright/test';

test.describe('Assessment Flow E2E', () => {
    test('utilizatorul poate parcurge și finaliza un test complet', async ({ page }) => {
        // 1. Deschide direct pagina de evaluare pentru categoria 1 (sau 'surprise')
        await page.goto('/assessment/1');

        // 2. Așteaptă încărcarea întrebărilor și a antetului
        await expect(page.getByText(/Întrebarea 1 din/i)).toBeVisible({ timeout: 10000 });

        // 3. Verifică faptul că butonul de Next este inițial dezactivat dacă nu s-a selectat nicio opțiune
        const nextButton = page.getByRole('button', { name: /Următoarea Întrebare|Finalizează Testul/i });
        await expect(nextButton).toBeDisabled();

        // 4. Parcurge toate cele 10 întrebări ale testului
        const totalQuestions = 10;
        for (let i = 0; i < totalQuestions; i++) {
            // Verifică că suntem la întrebarea corectă
            await expect(page.getByText(new RegExp(`Întrebarea ${i + 1} din ${totalQuestions}`, 'i'))).toBeVisible();

            // Selectează prima opțiune de răspuns disponibilă
            const firstOption = page.locator('label').first();
            await firstOption.click();

            // Butonul de avansare devine activ
            await expect(nextButton).toBeEnabled();

            // Click pe butonul de avansare sau finalizare
            await nextButton.click();
        }

        // 5. Verifică randarea ecranului de rezultat
        await expect(page.getByRole('heading', { name: /Rezultat Evaluare/i })).toBeVisible({ timeout: 5000 });
        await expect(page.getByText(/PROMOVAT|NECESITĂ REVIZUIRE/i)).toBeVisible();
        await expect(page.getByRole('link', { name: /Înapoi la Dashboard/i })).toBeVisible();
    });

    test('navigarea înainte și înapoi funcționează corect', async ({ page }) => {
        await page.goto('/assessment/1');

        // La prima întrebare, butonul Înapoi trebuie să fie dezactivat
        const backButton = page.getByRole('button', { name: /Înapoi/i });
        await expect(backButton).toBeDisabled({ timeout: 10000 });

        // Selectează o opțiune și trece la întrebarea 2
        await page.locator('label').first().click();
        const nextButton = page.getByRole('button', { name: /Următoarea Întrebare/i });
        await nextButton.click();

        // Verifică că s-a ajuns la întrebarea 2 și butonul Înapoi este activ
        await expect(page.getByText(/Întrebarea 2 din/i)).toBeVisible();
        await expect(backButton).toBeEnabled();

        // Dă click pe Înapoi și verifică revenirea la întrebarea 1
        await backButton.click();
        await expect(page.getByText(/Întrebarea 1 din/i)).toBeVisible();
    });
});