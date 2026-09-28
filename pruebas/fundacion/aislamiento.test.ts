import { describe, expect, it } from "vitest";
import { raiz } from "../helpers/proyecto";

/**
 * RNF-10 (parcial en T-001): las pruebas se ejecutan en Node, sin DOM ni
 * React, que es la base para verificar el dominio sin renderizar interfaz.
 */
describe("aislamiento del dominio frente a la interfaz", () => {
  it("ejecuta las pruebas en un entorno de Node sin DOM", () => {
    expect(typeof document).toBe("undefined");
    expect(typeof window).toBe("undefined");
  });

  it("importa módulos TypeScript sin React ni componentes visuales", async () => {
    const modulo = await import("../helpers/proyecto");
    expect(typeof modulo.leerPaquete).toBe("function");
    expect(modulo.leerPaquete().name.length).toBeGreaterThan(0);
  });

  it("resuelve el alias `@/*` que usará el dominio en T-005", async () => {
    const modulo = await import("@/pruebas/helpers/proyecto");
    expect(typeof modulo.leerTsConfig).toBe("function");
    expect(modulo.leerTsConfig().compilerOptions.strict).toBe(true);
  });

  it("resuelve la raíz del proyecto de forma independiente del sistema de archivos", () => {
    expect(raiz).toMatch(/SafeMenu[\\/]$/);
  });
});
