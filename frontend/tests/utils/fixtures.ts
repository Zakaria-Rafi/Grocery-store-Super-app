import { test as base } from "@playwright/test";
import type { Page } from "@playwright/test";

// Déclarer le type pour les fixtures personnalisées
type CustomFixtures = {
  authenticatedPage: Page;
};

// Étendre le test avec les fixtures typées
export const test = base.extend<CustomFixtures>({
  // Setup authentification par défaut
  authenticatedPage: async ({ page }, use) => {
    // Intercepter les requêtes d'API
    await page.route("**/api/auth/me", (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          id: 1,
          firstName: "User",
          lastName: "Doe",
          email: "user.doe@gmail.com",
          role: "user",
          // autres propriétés...
        }),
      });
    });

    // Ajouter le token d'authentification
    await page.context().addCookies([
      {
        name: "auth.token",
        value: "1234567890",
        domain: "localhost",
        path: "/",
      },
    ]);

    // D'abord naviguer vers la page
    await page.goto("/");

    // Ensuite accéder au localStorage
    await page.evaluate(() => {
      window.localStorage.setItem(
        "auth:user",
        JSON.stringify({
          id: 1,
          email: "user.doe@gmail.com",
          name: "User Doe",
        }),
      );
    });

    await use(page);
  },
});

export { expect } from "@playwright/test";
