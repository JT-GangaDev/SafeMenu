import { describe, expect, it } from "vitest";
import { leerPaquete } from "../helpers/proyecto";

/**
 * T-001 «Hecho cuando»: el proyecto arranca con `npm run dev` y existe un
 * script de compilación, lint y pruebas.
 */
describe("scripts de npm", () => {
  const { scripts } = leerPaquete();

  it("expone los scripts de desarrollo, compilación, arranque, lint y pruebas", () => {
    for (const script of ["dev", "build", "start", "lint", "test", "typecheck"]) {
      expect(scripts, `falta el script ${script}`).toHaveProperty(script);
      expect(typeof scripts[script]).toBe("string");
    }
  });

  it("arranca el servidor de desarrollo con Next.js", () => {
    expect(scripts.dev).toBe("next dev");
  });

  it("compila la aplicación con Next.js", () => {
    expect(scripts.build).toBe("next build");
  });

  it("usa ESLint directamente porque `next lint` se eliminó en Next 16", () => {
    expect(scripts.lint).toMatch(/^eslint/);
    expect(scripts.lint).not.toContain("next lint");
  });

  it("ejecuta las pruebas de forma no interactiva", () => {
    expect(scripts.test).toContain("vitest");
    expect(scripts.test).toContain("run");
  });

  it("comprueba los tipos sin emitir archivos", () => {
    expect(scripts.typecheck).toContain("tsc");
    expect(scripts.typecheck).toContain("--noEmit");
  });
});
