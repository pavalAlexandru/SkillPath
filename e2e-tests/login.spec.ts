// import { expect, test } from '@playwright/test';
//
// async function mockAuthFlow(page: any, role: 'Student' | 'Mentor') {
//   await page.route('**/auth/v1/token**', async (route) => {
//     await route.fulfill({
//       status: 200,
//       contentType: 'application/json',
//       body: JSON.stringify({
//         access_token: 'mock-access-token',
//         refresh_token: 'mock-refresh-token',
//         user: {
//           id: role === 'Student' ? 'student-123' : 'mentor-123',
//           email: role === 'Student' ? 'student@skillpath.ro' : 'mentor@skillpath.ro',
//         },
//       }),
//     });
//   });
//
//   await page.route('**/rest/v1/profiles**', async (route) => {
//     await route.fulfill({
//       status: 200,
//       contentType: 'application/json',
//       body: JSON.stringify([
//         { id: role === 'Student' ? 'student-123' : 'mentor-123', role },
//       ]),
//     });
//   });
// }
//
// test('login page renders the sign-in form', async ({ page }) => {
//   await page.goto('/login');
//
//   await expect(page.getByRole('heading', { name: /autentificare skillpath/i })).toBeVisible();
//   await expect(page.getByLabel('Email')).toBeVisible();
//   await expect(page.getByLabel('Parolă')).toBeVisible();
// });
//
// test('student login form submits the entered credentials', async ({ page }) => {
//   await mockAuthFlow(page, 'Student');
//
//   await page.goto('/login');
//   await page.getByLabel('Email').fill('student@skillpath.ro');
//   await page.getByLabel('Parolă').fill('secret123');
//   await page.getByRole('button', { name: /conectare/i }).click();
//
//   await expect(page).toHaveURL(/\/login\?.*email=student%40skillpath\.ro.*password=secret123/i);
// });
//
// test('mentor login form submits the entered credentials', async ({ page }) => {
//   await mockAuthFlow(page, 'Mentor');
//
//   await page.goto('/login');
//   await page.getByLabel('Email').fill('mentor@skillpath.ro');
//   await page.getByLabel('Parolă').fill('mentor-pass');
//   await page.getByRole('button', { name: /conectare/i }).click();
//
//   await expect(page).toHaveURL(/\/login\?.*email=mentor%40skillpath\.ro.*password=mentor-pass/i);
// });

import { test, expect } from "@playwright/test";

test.describe("Login Flow", () => {
  test("Student should be redirected to /dashboard on successful login", async ({
    page,
  }) => {
    // 1. Go to the login page
    await page.goto("/login");

    // 2. Fill in the student credentials (use your actual test DB credentials)
    await page.fill('input[type="email"]', "student@skillpath.ro");
    await page.fill(
      'input[type="password"]',
      process.env.TEST_USER_PASSWORD as string,
    );

    // 3. Click the login button
    await page.click('button:has-text("Conectare")');

    // 4. Assert that the app securely routed them to the dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test("Mentor should be redirected to /questions on successful login", async ({
    page,
  }) => {
    // 1. Go to the login page
    await page.goto("/login");

    // 2. Fill in the mentor credentials (use your actual test DB credentials)
    await page.fill('input[type="email"]', "mentor@skillpath.ro");
    await page.fill(
      'input[type="password"]',
      process.env.TEST_USER_PASSWORD as string,
    );

    // 3. Click the login button
    await page.click('button:has-text("Conectare")');

    // 4. Assert that the app securely routed them to the mentor questions view
    await expect(page).toHaveURL(/.*\/questions/);
  });
});
