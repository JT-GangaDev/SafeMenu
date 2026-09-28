import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Comprobación de humo del arnés E2E (T-003). Los flujos funcionales de la
 * especificación se cubrirán en las tareas T-022, T-030, T-038, T-047 y T-053.
 */
test("la portada se muestra en español y sin errores de accesibilidad", async ({
  page,
}) => {
  const respuesta = await page.goto("/");

  await expect(respuesta?.status()).toBe(200);
  await expect(page).toHaveTitle("SafeMenu");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("SafeMenu");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.getByText("código QR")).toBeVisible();
  await expect(page.getByText("Get started")).toHaveCount(0);
  await expect(page.getByText("Deploy now")).toHaveCount(0);

  // Si el código se guardara dos veces como UTF-8, el navegador mostraría
  // «MenÃºs» en lugar de «Menús». El marcador se construye con su código
  // Unicode para no escribir aquí el texto corrupto.
  const marcaDeCodificacion = `Men${String.fromCharCode(0xc3, 0xba)}s`;
  await expect(page.getByText(marcaDeCodificacion)).toHaveCount(0);

  const accesibilidad = await new AxeBuilder({ page }).analyze();
  expect(accesibilidad.violations).toEqual([]);
});

test("el servidor responde en la ruta raíz sin sesión", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("main")).toBeVisible();
  await expect(page.locator("h1")).toHaveCount(1);
});
