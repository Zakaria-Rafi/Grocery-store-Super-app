import { test, expect } from "./utils/fixtures";
import type { Route } from "@playwright/test";

test.describe("Products Catalog", () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    // Intercepter et simuler les requêtes
    await page.route("**/api/products*", (route: Route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([
          {
            id: 1,
            name: "Test Product",
            price: 10,
            stock: 5,
            ean: "1234567890123",
            category: "Test Category",
            status: "active",
            catalogStatus: "active",
            stockStatus: "active",
          },
        ]),
      });
    });

    await page.route("**/api/products/barcode/3274080005003", (route: Route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          message: "Barcode generated",
        }),
      });
    });

    await page.route("**/api/products/*", (route: Route) => {
      if (route.request().method() === "PATCH") {
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            id: 1,
            name: "Test Product",
            price: 10,
            stock: 10,
            ean: "1234567890123",
            category: "Test Category",
            status: "active",
            catalogStatus: "active",
            stockStatus: "active",
          }),
        });
      }
    });

    // Simuler l'authentification
    await page.context().addCookies([{ name: "auth.token", value: "1234567890", domain: "localhost", path: "/" }]);

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

    // Visiter la page
    await page.goto("/products");

    // Attendre que la table soit visible
    await expect(page.locator("table")).toBeVisible();
  });

  test.describe("Table Display and Sorting", () => {
    test("should display all table headers correctly", async ({ authenticatedPage: page }) => {
      // Vérifier les en-têtes
      await expect(page.locator("th").nth(0)).toBeVisible();
      await expect(page.locator("th").nth(1)).toBeVisible();
      await expect(page.locator("th").nth(2)).toBeVisible();
      await expect(page.locator("th").nth(3)).toBeVisible();
      await expect(page.locator("th").nth(4)).toBeVisible();
      await expect(page.locator("th").nth(5)).toBeVisible();
      await expect(page.locator("th").nth(6)).toBeVisible();
      await expect(page.locator("th").nth(7)).toBeVisible();
      await expect(page.locator("th").nth(8)).toBeVisible();
    });

    test("should sort columns when clicking headers", async ({ authenticatedPage: page }) => {
      // Test tri par nom
      await page.locator("th").getByText("Name").click();
      await page.locator("th").getByText("Name").click();

      // Test tri par stock
      await page.locator("th").getByText("Stock").first().click();
      await page.locator("th").getByText("Stock").first().click();

      // Test tri par catalogue status
      await page.locator("th").getByText("Catalog Status").first().click();
      await page.locator("th").getByText("Catalog Status").first().click();
    });
  });

  test.describe("Product Filtering", () => {
    test("should open filter modal and apply filters", async ({ authenticatedPage: page }) => {
      // Ouvrir la modal de filtre
      await page.getByRole("button", { name: "Filter" }).click();

      // 1️⃣ Sélectionner l'input et taper un mot-clé
      const searchInput = page.getByPlaceholder("Search a product...");
      await expect(searchInput).toBeVisible();
      await searchInput.click();
      await searchInput.fill("test");

      // 2️⃣ Attendre que la liste des suggestions apparaisse
      const suggestionsList = page.locator("div.absolute.w-full.mt-1.bg-white.border.rounded-md.shadow-lg.z-50");
      await expect(suggestionsList).toBeVisible({ timeout: 5000 });

      // 3️⃣ Sélectionner une suggestion spécifique
      await suggestionsList.getByText("Test Product").click();

      // 4️⃣ Vérifier que l'input contient bien la valeur sélectionnée
      await expect(searchInput).toHaveValue("Test Product");

      // 5️⃣ Appliquer le filtre
      await page.getByRole("button", { name: "Filter" }).click();
    });
  });

  test.describe("Product Actions", () => {
    test("should show barcode modal", async ({ authenticatedPage: page }) => {
      await page.locator("a[data-id='Barcode']").click();
    });

    test("should update product details", async ({ authenticatedPage: page }) => {
      await page.locator("tbody tr").first().locator("button").last().click();

      // Tester la modal de modification
      const dialog = page.locator('[role="dialog"]');
      await dialog.locator('input[type="number"]').first().clear();
      await dialog.locator('input[type="number"]').first().fill("10");
      await dialog.getByRole("button", { name: "Save" }).click();
    });

    test("should add a new product", async ({ authenticatedPage: page }) => {
      await page.getByRole("button", { name: "Add Product" }).click();

      // Tester la modal d'ajout
      const dialog = page.locator('[role="dialog"]');
      await dialog.getByRole("button", { name: "Enter manually" }).click();

      // Entrer un code EAN
      await dialog.locator("input").fill("3274080005003");
      await dialog.getByRole("button", { name: "Search" }).click();
    });
  });

  test.describe("Status Display", () => {
    test("should show correct status based on stock and price", async ({ authenticatedPage: page }) => {
      const firstRow = page.locator("tbody tr").first();

      await expect(firstRow.locator("td").getByText("Actif")).toHaveClass(/text-green-500/);
      await expect(firstRow.locator("td").getByText("In stock")).toBeVisible();
    });
  });

  // ... autres groupes de tests
});
