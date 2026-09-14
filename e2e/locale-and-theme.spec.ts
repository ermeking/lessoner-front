import { test, expect } from "@playwright/test";

test.describe("locale routing", () => {
  test("redirects / to a locale-prefixed path", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/(ru|ky|en)\/?$/);
  });

  test("honours Accept-Language for the initial redirect", async ({
    browser,
  }) => {
    const context = await browser.newContext({ locale: "ru-RU" });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page).toHaveURL(/\/ru\/?$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "ru");
    await context.close();
  });

  test("switching language keeps the current path", async ({ page }) => {
    await page.goto("/ru/dev/fonts");
    await page.getByRole("link", { name: "en" }).click();
    await expect(page).toHaveURL(/\/en\/dev\/fonts$/);
  });
});

test.describe("theme", () => {
  test("toggling theme updates the page and survives a reload", async ({
    page,
  }) => {
    await page.goto("/ru");
    const toggle = page.getByRole("button", { name: "Переключить тему" });
    const isDark = () =>
      page.locator("html").evaluate((el) => el.classList.contains("dark"));

    const initialIsDark = await isDark();

    await toggle.click();
    await expect.poll(isDark).toBe(!initialIsDark);

    await page.reload();
    await expect.poll(isDark).toBe(!initialIsDark);
  });
});
