import { test, expect } from "@playwright/test";

// Mobile QA — render the public pages at iPhone size, screenshot them, and
// assert there's no horizontal overflow (the classic "page scrolls sideways on
// a phone" bug). We use an iPhone-sized VIEWPORT on the Chromium engine (the
// iPhone device preset forces WebKit, which we don't install).
// reducedMotion: "reduce" makes our Reveal/whileInView sections render statically,
// so a full-page screenshot shows the TRUE layout (not mid-fade) — and verifies the
// accessibility path too.
test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3, reducedMotion: "reduce" });

async function noHorizontalOverflow(page: import("@playwright/test").Page) {
  return page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
}

test("homepage fits the phone (no sideways scroll)", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/buy a home with/i)).toBeVisible();
  await page.waitForTimeout(1500); // let entrance animations settle before the shot
  await page.screenshot({ path: "test-results/mobile-home.png", fullPage: true });
  expect(await noHorizontalOverflow(page)).toBe(true);
});

test("homepage mid-sections actually render on mobile", async ({ page }) => {
  await page.goto("/");
  // The middle sections (Reveal-wrapped) must render + be visible on a phone.
  for (const heading of [
    /A clear answer in three steps/i,
    /Homes like the one you want/i,
    /Honest by design/i,
    /Ready to find your answer\?/i,
  ]) {
    const el = page.getByText(heading).first();
    await el.scrollIntoViewIfNeeded();
    await expect(el).toBeVisible();
  }
  // Capture the "how it works" + slideshow area as a viewport shot.
  await page.getByText(/A clear answer in three steps/i).first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: "test-results/mobile-home-mid.png" });
});

test("login page fits the phone (no sideways scroll)", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByLabel(/email/i)).toBeVisible();
  await page.waitForTimeout(1500); // let the Reveal fade-in finish
  await page.screenshot({ path: "test-results/mobile-login.png", fullPage: true });
  expect(await noHorizontalOverflow(page)).toBe(true);
});
