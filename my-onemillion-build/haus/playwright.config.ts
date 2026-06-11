import { defineConfig, devices } from "@playwright/test";

// E2E config. Chromium only (per the course testing guidance). Reuses the
// already-running dev server on :3000 if there is one, else starts `npm run dev`.
export default defineConfig({
  testDir: "./tests/e2e",
  // Run serially: in dev the single Next server compiles routes on-demand, so
  // parallel tests starve each other and the heavy homepage hydrates slowly.
  fullyParallel: false,
  workers: 1,
  retries: 1,
  reporter: [["list"]],
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
