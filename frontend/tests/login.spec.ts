import { test, expect } from "@playwright/test";

test.describe("Login Page", () => {
  test.describe("Login", () => {
    test.describe("Bad credentials", () => {
      test("passes", async ({ page }) => {
        await page.goto("/login");

        // Intercepter la requête
        await page.route("**/api/auth/login", async (route) => {
          await route.fulfill({
            status: 401,
            body: JSON.stringify({
              message: "Invalid credentials",
            }),
          });
        });

        // Remplir le formulaire
        await page.locator('input[name="email"]').fill("alexandre.tressel@icloud.com");
        await page.locator('input[name="password"]').fill("badpassword");
        await page.locator('button[data-cy="login-button"]').click();

        // Vérifier l'affichage du message d'erreur
        await expect(page.locator('li[variant="destructive"]')).toBeVisible();
      });
    });

    test.describe("As a user must fail for not authorized", async () => {
      test("passes", async ({ page }) => {
        await page.goto("/login");

        // Intercepter la requête
        await page.route("**/api/auth/login", async (route) => {
          await route.fulfill({
            status: 200,
            body: JSON.stringify({
              access_token: "1234567890",
            }),
          });
        });

        // Intercepter la requête
        await page.route("**/api/auth/me", async (route) => {
          await route.fulfill({
            status: 200,
            body: JSON.stringify({
              id: 1,
              email: "alexandre.tressel@icloud.com",
              firstName: "Alexandre",
              lastName: "Tressel",
              role: "admin",
            }),
          });
        });

        // Intercepter la requête de login avec succès
        const loginResponsePromise = page.waitForResponse("**/api/auth/login");

        // Remplir le formulaire
        await page.locator('input[name="email"]').fill("alexandre.tressel@icloud.com");
        await page.locator('input[name="password"]').fill("password");
        await page.locator('button[data-cy="login-button"]').click();

        // Attendre la réponse de la requête
        await loginResponsePromise;

        // Attendre la requête de profil
        await page.waitForResponse("**/api/auth/me");
      });
    });
  });
});

test.describe("Reset password", () => {
  test("Send email", async ({ page }) => {
    await page.goto("/login");

    // Intercepter la requête
    await page.route("**/api/auth/forgot-password", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          message: "Email sent",
        }),
      });
    });

    await page.locator('p[class="text-sm text-blue-500 cursor-pointer hover:underline"]').click();
    await page.locator('input[name="email"]').nth(1).fill("alexandre.tressel@icloud.com");
    await page.locator('button[data-cy="send-reset-password-button"]').click();

    await page.waitForResponse("**/api/auth/forgot-password");
  });

  test("Reset form password", async ({ page }) => {
    await page.goto("/reset-password?token=1234567890");

    // Intercepter la requête
    await page.route("**/api/auth/reset-password", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          message: "Password reset",
        }),
      });
    });

    await page.locator('input[name="newPassword"]').fill("password");
    await page.locator('input[name="confirmPassword"]').focus();
    await expect(page.locator('p[role="alert"]')).toBeVisible();

    await page.locator('input[name="newPassword"]').clear();

    await page.locator('input[name="newPassword"]').fill("P@ssw0rd1233");
    await page.locator('input[name="confirmPassword"]').fill("P@ssw0rd1233");
    await page.locator('input[name="confirmPassword"]').focus();

    await page.locator('button[data-cy="reset-password-button"]').click();
    await expect(page.locator('p[role="alert"]')).not.toBeVisible();

    await page.waitForResponse("**/api/auth/reset-password");
  });
});
