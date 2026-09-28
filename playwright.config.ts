import { defineConfig, devices } from "@playwright/test";

/**
 * Configuración de las pruebas de extremo a extremo (T-003).
 *
 * - `testDir`: las pruebas viven en `pruebas/e2e` y usan el sufijo `.spec.ts`,
 *   que Vitest no recoge.
 * - `webServer`: se compila y arranca la aplicación real, no el servidor de
 *   desarrollo, para que la comprobación se parezca a producción.
 * - `PLAYWRIGHT_CHANNEL`: si el equipo no puede descargar el Chromium
 *   empaquetado, se puede usar el navegador ya instalado con
 *   `PLAYWRIGHT_CHANNEL=chrome npm run test:e2e`.
 */
export default defineConfig({
  testDir: "pruebas/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    locale: "es-ES",
    timezoneId: "Europe/Madrid",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        channel: process.env.PLAYWRIGHT_CHANNEL,
      },
    },
  ],
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
