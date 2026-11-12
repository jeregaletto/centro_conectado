import { defineConfig, devices } from "@playwright/test";

const PUERTO = Number(process.env.PUERTO_E2E ?? 3000);

/**
 * Los e2e corren contra el backend real (http://localhost:8080, perfil dev con datos de demo)
 * y contra la app ya compilada (`npm run build` antes). Ver README.
 * Un solo worker: los escenarios comparten la base de datos de demo.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  globalSetup: "./tests/e2e/global-setup.ts",
  use: {
    baseURL: `http://localhost:${PUERTO}`,
    locale: "es-AR",
    timezoneId: "America/Argentina/Buenos_Aires",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run start -- -p ${PUERTO}`,
    url: `http://localhost:${PUERTO}/login`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
