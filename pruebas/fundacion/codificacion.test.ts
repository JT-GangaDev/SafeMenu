import { existsSync, readdirSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * El texto de la aplicación está en español, así que un archivo UTF-8
 * doblemente codificado ("MenÃºs" en lugar de "Menús") es un fallo visible
 * para el usuario. Esta prueba lo detecta antes de que llegue a producción.
 */

const EXTENSIONES = [".ts", ".tsx", ".css", ".mjs"];
const ARCHIVOS_DE_RAIZ = [
  "next.config.ts",
  "eslint.config.mjs",
  "vitest.config.ts",
  "playwright.config.ts",
];
const CARPETAS = ["app", "dominio", "infraestructura"];

// «Ã», «Â» y «â» solo aparecen en español cuando el archivo se ha guardado dos
// veces como UTF-8, así que basta con buscar su primer carácter.
const INICIOS_SOSPECHOSOS = [0x00c3, 0x00c2, 0x00e2].map((codigo) =>
  String.fromCharCode(codigo),
);

function listar(raiz: string): string[] {
  if (!existsSync(raiz)) {
    return [];
  }

  return readdirSync(raiz, { withFileTypes: true }).flatMap((entrada) => {
    const ruta = join(raiz, entrada.name);

    if (entrada.isDirectory()) {
      return listar(ruta);
    }

    return EXTENSIONES.includes(extname(entrada.name)) ? [ruta] : [];
  });
}

function archivosVigilados(): string[] {
  return [
    ...ARCHIVOS_DE_RAIZ.filter((nombre) => existsSync(nombre)),
    ...CARPETAS.flatMap((carpeta) => listar(carpeta)),
  ];
}

function doblementeCodificado(contenido: string): boolean {
  return INICIOS_SOSPECHOSOS.some((inicio) => contenido.includes(inicio));
}

describe("codificación del código de la aplicación", () => {
  it("no guarda texto doblemente codificado", () => {
    const sospechosos = archivosVigilados().filter((archivo) =>
      doblementeCodificado(readFileSync(archivo, "utf8")),
    );

    expect(sospechosos).toEqual([]);
  });

  it("reconoce el texto doblemente codificado", () => {
    const correcto = "Menús con alérgenos";
    const malGuardado = Buffer.from(correcto, "utf8").toString("latin1");

    expect(doblementeCodificado(malGuardado)).toBe(true);
    expect(doblementeCodificado(correcto)).toBe(false);
    expect(archivosVigilados().length).toBeGreaterThan(0);
  });
});
