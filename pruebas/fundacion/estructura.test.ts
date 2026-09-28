import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { raiz } from "../helpers/proyecto";

/**
 * T-001: App Router con TypeScript en la raíz del proyecto, sin `src/` y sin
 * Tailwind, tal y como fija `docs/plan.md` §2 y §3.
 */
describe("estructura del proyecto", () => {
  it("contiene el enrutado del App Router en la raíz", () => {
    expect(existsSync(`${raiz}app`)).toBe(true);
    expect(existsSync(`${raiz}app/layout.tsx`)).toBe(true);
    expect(existsSync(`${raiz}app/page.tsx`)).toBe(true);
    expect(existsSync(`${raiz}app/globals.css`)).toBe(true);
  });

  it("no usa el enrutado de páginas ni la carpeta `src`", () => {
    expect(existsSync(`${raiz}app/pages`)).toBe(false);
    expect(existsSync(`${raiz}pages`)).toBe(false);
    expect(existsSync(`${raiz}src`)).toBe(false);
  });

  it("mantiene la configuración de Next.js, ESLint, Vitest y Playwright", () => {
    expect(existsSync(`${raiz}next.config.ts`)).toBe(true);
    expect(existsSync(`${raiz}eslint.config.mjs`)).toBe(true);
    expect(existsSync(`${raiz}tsconfig.json`)).toBe(true);
    expect(existsSync(`${raiz}vitest.config.ts`)).toBe(true);
    expect(existsSync(`${raiz}playwright.config.ts`)).toBe(true);
  });

  it("contiene las carpetas de pruebas de componentes y de extremo a extremo", () => {
    expect(existsSync(`${raiz}pruebas/componentes`)).toBe(true);
    expect(existsSync(`${raiz}pruebas/e2e`)).toBe(true);
    expect(existsSync(`${raiz}pruebas/componentes/preparacion.ts`)).toBe(true);
  });

  it("usa CSS Modules y variables propias en lugar de Tailwind", () => {
    expect(existsSync(`${raiz}tailwind.config.ts`)).toBe(false);
    expect(existsSync(`${raiz}tailwind.config.js`)).toBe(false);
    expect(existsSync(`${raiz}postcss.config.mjs`)).toBe(false);
  });

  it("ignora entornos, dependencias y artefactos de compilación", () => {
    const ignorados = readFileSync(`${raiz}.gitignore`, "utf8");
    for (const patron of ["/node_modules", "/.next/", ".env*", "/coverage"]) {
      expect(ignorados, `falta ${patron} en .gitignore`).toContain(patron);
    }
  });

  it("ignora los artefactos de Playwright y de cobertura", () => {
    const ignorados = readFileSync(`${raiz}.gitignore`, "utf8");
    for (const patron of [
      "/playwright-report/",
      "/test-results/",
      "/blob-report/",
      "/playwright/.cache/",
    ]) {
      expect(ignorados, `falta ${patron} en .gitignore`).toContain(patron);
    }
  });
});
