import { expect, test } from "@playwright/test";

test.describe("flagship experience", () => {
  test("homepage loads with identity and navigation", async ({ page }) => {
    await page.goto("/de");
    await expect(page.locator("html")).toHaveAttribute("lang", "de");
    await expect(page.getByRole("heading", { name: /Michael Kalachin/i })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
    await expect(page.locator("canvas").first()).toBeAttached();
  });

  test("language switch preserves route", async ({ page }) => {
    await page.goto("/de/store");
    await page.getByRole("button", { name: "EN" }).click();
    await expect(page).toHaveURL(/\/en\/store/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("configurator grows the system and produces a brief", async ({ page }) => {
    await page.goto("/de/configurator");
    await page.getByRole("option", { name: "Interactive Experience" }).click();
    await page.getByRole("button", { name: "Weiter" }).click();
    await expect(page.getByText("Visuelle Richtung")).toBeVisible();
  });

  test("cart add and checkout demo complete", async ({ page }) => {
    await page.goto("/de/store/digital-foundation");
    await page.getByRole("button", { name: "In den Warenkorb" }).click();
    await expect(page.getByRole("dialog", { name: "Warenkorb" })).toBeVisible({ timeout: 8000 });
    await page.getByRole("link", { name: "Zur Kasse" }).click();
    await page.getByLabel("E-Mail").fill("michael@example.com");
    await page.getByLabel("Vollständiger Name").fill("Michael Kalachin");
    await page.getByLabel("Adresse").fill("Bahnhofstrasse 1");
    await page.getByLabel("Ort").fill("Zürich");
    await page.getByLabel("PLZ").fill("8001");
    await page.getByRole("button", { name: "Bestellung abschliessen" }).click();
    await expect(page).toHaveURL(/checkout\/success/);
    await expect(page.getByText("Bestellung bestätigt")).toBeVisible();
  });

  test("booking flow reaches confirmation", async ({ page }) => {
    await page.goto("/de/book");
    await page.getByRole("button", { name: /Discovery Call/ }).click();
    await page.getByRole("button", { name: "Termin bestätigen" }).click();
    const day = page.locator("button[data-day]:not([disabled])").first();
    await expect(day).toBeVisible();
    await day.click();
    await page.getByRole("button", { name: "Termin bestätigen" }).click();
    const slot = page.getByRole("option").first();
    await expect(slot).toBeVisible();
    await slot.click();
    await page.getByRole("button", { name: "Termin bestätigen" }).click();
    await page.getByLabel("Name").fill("Michael Kalachin");
    await page.getByLabel("E-Mail").fill("michael@example.com");
    await page.getByRole("button", { name: "Termin bestätigen" }).click();
    await expect(page.getByText("Termin bestätigt")).toBeVisible({ timeout: 8000 });
  });

  test("contact validation announces errors", async ({ page }) => {
    await page.goto("/de/contact");
    await page.getByRole("button", { name: "Nachricht senden" }).click();
    await expect(page.locator("[role=alert]").first()).toBeVisible();
  });

  test("mobile navigation overlay opens", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/de");
    await page.getByRole("button", { name: /Menü öffnen/ }).click();
    await expect(page.locator("#menu-overlay")).toBeVisible();
    await expect(page.getByRole("link", { name: "Konfigurator" })).toBeVisible();
  });
});
