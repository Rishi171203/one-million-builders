import { test, expect } from "@playwright/test";

// Public, no-login flows only — these make no database writes, so they're safe
// to run against the live Supabase project. (Authenticated register→save E2E is
// deferred until a separate test Supabase project exists.)
test.describe("haus — public flows", () => {
  test("homepage loads with the hero + primary CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/buy a home with/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /get started/i }).first()).toBeVisible();
  });

  test("Register takes a visitor to the login page", async ({ page }) => {
    // Warm up the /login route first so dev-mode compilation doesn't eat into
    // the click's retry window, then come back and click for real.
    await page.goto("/login");
    await page.goto("/");
    const register = page.getByRole("button", { name: /^register$/i }).first();
    await expect(register).toBeVisible();
    // Retry the click until SPA navigation registers (covers React hydration
    // timing in dev — the onClick handler may attach a beat after the button paints).
    await expect(async () => {
      await register.click();
      await expect(page).toHaveURL(/\/login/, { timeout: 3000 });
    }).toPass({ timeout: 25_000 });
  });

  test("the advisor is gated — a logged-out visitor is redirected to login", async ({ page }) => {
    await page.goto("/advisor");
    await expect(page).toHaveURL(/\/login/);
  });

  test("login page shows the Log in / Register tabs and an email field", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("tab", { name: /log in/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /register/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });
});
