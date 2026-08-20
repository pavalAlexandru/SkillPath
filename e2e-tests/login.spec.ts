// import { expect, test, type Page } from "@playwright/test";
//
// type LoginMockResult = {
//   getTokenPayload: () => { email?: string; password?: string } | null;
//   wasProfileRequested: () => boolean;
// };
//
// async function mockAuthFlow(page: Page, role: "STUDENT" | "MENTOR"): Promise<LoginMockResult> {
//   const userId = role === "STUDENT" ? "student-123" : "mentor-123";
//   const email = role === "STUDENT" ? "student@skillpath.ro" : "mentor@skillpath.ro";
//
//   let tokenPayload: { email?: string; password?: string } | null = null;
//   let profileRequested = false;
//
//   await page.route("**/auth/v1/token**", async (route) => {
//     if (route.request().method() === 'OPTIONS') {
//       return route.continue();
//     }
//
//     try {
//       tokenPayload = route.request().postDataJSON();
//       console.log("Token payload intercepted:", tokenPayload);
//     } catch (e) {
//       console.log("Error parsing token payload:", e);
//     }
//
//     await route.fulfill({
//       status: 200,
//       contentType: "application/json",
//       headers: {
//         'Access-Control-Allow-Origin': '*',
//       },
//       body: JSON.stringify({
//         access_token: "mock-access-token",
//         refresh_token: "mock-refresh-token",
//         user: { id: userId, email },
//       }),
//     });
//   });
//
//   await page.route("**/rest/v1/profiles**", async (route) => {
//     if (route.request().method() === 'OPTIONS') {
//       return route.continue();
//     }
//
//     profileRequested = true;
//
//     await route.fulfill({
//       status: 200,
//       contentType: "application/json",
//       headers: {
//         'Access-Control-Allow-Origin': '*',
//       },
//       body: JSON.stringify([{ id: userId, role }]),
//     });
//   });
//
//   return {
//     getTokenPayload: () => tokenPayload,
//     wasProfileRequested: () => profileRequested,
//   };
// }
//
// test.describe("Login Flow", () => {
//   test("renders the sign-in form", async ({ page }) => {
//     await page.goto("/login");
//
//     await expect(page.getByRole("heading", { name: /autentificare skillpath/i })).toBeVisible();
//     await expect(page.getByLabel("Email")).toBeVisible();
//     await expect(page.getByLabel("Parolă")).toBeVisible();
//   });
//
//   test("student login submits credentials and fetches role", async ({ page }) => {
//     const authMock = await mockAuthFlow(page, "STUDENT");
//
//     await page.goto("/login");
//     await page.waitForTimeout(2000); // Wait for hydration
//     await page.getByLabel("Email").fill("student@skillpath.ro");
//     await page.getByLabel("Parolă").fill("secret123");
//     await page.getByRole("button", { name: /conectare/i }).click();
//
//     // Check if error message is displayed
//     const errorText = await page.locator('.text-rose-700').textContent({ timeout: 2000 }).catch(() => null);
//     if (errorText) console.log("Frontend Error:", errorText);
//
//     await expect.poll(() => authMock.getTokenPayload()?.email).toBe("student@skillpath.ro");
//     await expect.poll(() => authMock.getTokenPayload()?.password).toBe("secret123");
//     await expect.poll(() => authMock.wasProfileRequested()).toBeTruthy();
//   });
//
//   test("mentor login submits credentials and fetches role", async ({ page }) => {
//     const authMock = await mockAuthFlow(page, "MENTOR");
//
//     await page.goto("/login");
//     await page.waitForTimeout(2000); // Wait for hydration
//     await page.getByLabel("Email").fill("mentor@skillpath.ro");
//     await page.getByLabel("Parolă").fill("mentor-pass");
//     await page.getByRole("button", { name: /conectare/i }).click();
//
//     await expect.poll(() => authMock.getTokenPayload()?.email).toBe("mentor@skillpath.ro");
//     await expect.poll(() => authMock.getTokenPayload()?.password).toBe("mentor-pass");
//     await expect.poll(() => authMock.wasProfileRequested()).toBeTruthy();
//   });
// });
