import { existsSync, readdirSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { raiz } from "../helpers/proyecto";

/**
 * RNF-10 y constitución 2-3: el dominio no importa componentes visuales, APIs
 * de Next.js ni lee el entorno directamente. Se comprueba sobre el código
 * fuente, no solo sobre los módulos ya importados por las pruebas.
 */

const EXTENSIONES = [".ts", ".tsx"];
const IMPORTACIONES_PROHIBIDAS = [
  /from\s+["']react["']/,
  /from\s+["']react-dom/,
  /from\s+["']next\//,
  /require\(\s*["']next\//,
  /from\s+["']@\/app\//,
  /from\s+["']\.\.\/app\//,
  /process\.env/,
];

function fuentesDe(raizDirectorio: string): string[] {
  if (!existsSync(raizDirectorio)) {
    return [];
  }

  return readdirSync(raizDirectorio, { withFileTypes: true }).flatMap((entrada) => {
    const ruta = join(raizDirectorio, entrada.name);

    if (entrada.isDirectory()) {
      return fuentesDe(ruta);
    }

    return EXTENSIONES.includes(extname(entrada.name)) ? [ruta] : [];
  });
}

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

  it("mantiene el dominio libre de interfaz, de Next.js y del entorno", () => {
    const fuentes = fuentesDe(`${raiz}dominio`);

    expect(fuentes.length, "no hay fuentes de dominio que comprobar").toBeGreaterThan(
      0,
    );

    for (const fuente of fuentes) {
      const contenido = readFileSync(fuente, "utf8");

      for (const prohibido of IMPORTACIONES_PROHIBIDAS) {
        expect(
          contenido,
          `${fuente.replace(raiz, "")} incumple ${prohibido}`,
        ).not.toMatch(prohibido);
      }
    }
  });

  it("detecta una importación prohibida, para que la comprobación no sea vacua", () => {
    const ejemplo = [
      'import { useState } from "react";',
      'import { renderToString } from "react-dom/server";',
      'import { NextResponse } from "next/server";',
      'const cabeceras = require("next/headers");',
      'import { Inicio } from "@/app/inicio";',
      'import { layout } from "../app/layout";',
      "const url = process.env.NEXT_PUBLIC_URL;",
    ].join("\n");

    for (const prohibido of IMPORTACIONES_PROHIBIDAS) {
      expect(prohibido.test(ejemplo), `${prohibido} no detecta el ejemplo`).toBe(
        true,
      );
    }

    expect(IMPORTACIONES_PROHIBIDAS).toHaveLength(7);
  });
});
