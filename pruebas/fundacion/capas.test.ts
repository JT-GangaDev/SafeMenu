import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { leerTexto, raiz } from "../helpers/proyecto";

/**
 * T-005. Estructura de las capas `dominio`, `infraestructura` y `pruebas`.
 *
 * El árbol de `docs/plan.md` §3 es la especificación de la estructura. Estas
 * pruebas fallan si el disco se aleja de él en cualquier sentido: una carpeta
 * declarada que no existe o una carpeta creada que nadie ha documentado.
 */

const CAPAS = ["dominio", "infraestructura", "pruebas"] as const;
const EXTENSIONES = [".ts", ".tsx"];

/** Carpetas de primera capa que declara el árbol de `docs/plan.md` §3. */
function carpetasDelPlan(texto = leerTexto("docs/plan.md")): string[] {
  const seccion = texto.split("## 3. Arquitectura propuesta")[1];

  if (seccion === undefined) {
    throw new Error("docs/plan.md no contiene la sección «3. Arquitectura propuesta».");
  }

  const bloque = seccion.split("```")[1];

  if (bloque === undefined) {
    throw new Error("El árbol de `docs/plan.md` §3 no está en un bloque de código.");
  }

  const carpetas: string[] = [];
  let capaActual: string | null = null;

  for (const linea of bloque.split(/\r?\n/)) {
    const cabecera = /^([a-z-]+)\/$/.exec(linea);

    if (cabecera !== null) {
      capaActual = cabecera[1] ?? null;
      continue;
    }

    const hija = /^ {2}(\S+\/)(?:\s{2,}(.*))?$/.exec(linea);

    if (hija !== null && capaActual !== null && (CAPAS as readonly string[]).includes(capaActual)) {
      const nombre = (hija[1] as string).replace(/\/$/, "");
      carpetas.push(`${capaActual}/${nombre}`);
    }
  }

  return carpetas;
}

/** Carpetas de primera capa que existen ahora en el disco. */
function carpetasEnDisco(capa: string): string[] {
  const raizCapa = join(raiz, capa);

  if (!existsSync(raizCapa)) {
    return [];
  }

  return readdirSync(raizCapa, { withFileTypes: true })
    .filter((entrada) => entrada.isDirectory())
    .map((entrada) => `${capa}/${entrada.name}`);
}

function fuentesDe(directorio: string): string[] {
  if (!existsSync(directorio)) {
    return [];
  }

  return readdirSync(directorio, { withFileTypes: true }).flatMap((entrada) => {
    const ruta = join(directorio, entrada.name);

    if (entrada.isDirectory()) {
      return fuentesDe(ruta);
    }

    return EXTENSIONES.includes(extname(entrada.name)) ? [ruta] : [];
  });
}

/** Detecta texto guardado dos veces como UTF-8, que se ve corrupto en pantalla. */
function contieneTextoCorrupto(texto: string): boolean {
  return [0x00c3, 0x00c2, 0x00e2]
    .map((codigo) => String.fromCharCode(codigo))
    .some((inicio) => texto.includes(inicio));
}

const IMPORTACIONES_PROHIBIDAS_EN_DOMINIO = [
  /from\s+["']react["']/,
  /from\s+["']react-dom/,
  /from\s+["']next\//,
  /from\s+["']@\/app\//,
  /from\s+["']\.\.\/app\//,
  /from\s+["']@\/infraestructura\//,
  /from\s+["']\.\.\/infraestructura\//,
  /process\.env/,
];

const IMPORTACIONES_PROHIBIDAS_EN_INFRAESTRUCTURA = [
  /from\s+["']@\/app\//,
  /from\s+["']\.\.\/app\//,
];

describe("estructura de las capas del proyecto", () => {
  const declaradas = carpetasDelPlan();

  it("declara en el plan las tres capas y sus carpetas", () => {
    expect(declaradas.length).toBeGreaterThanOrEqual(20);

    for (const capa of CAPAS) {
      expect(declaradas.some((carpeta) => carpeta.startsWith(`${capa}/`))).toBe(
        true,
      );
    }
  });

  it("detecta un árbol alterado, para que la comparación con el disco no sea vacua", () => {
    const planAlterado = leerTexto("docs/plan.md").replace(
      "  integracion/",
      "  integracion_inexistente/",
    );

    expect(carpetasDelPlan(planAlterado)).not.toEqual(declaradas);
  });

  it("lee el árbol con los mismos saltos de línea de Windows o de Unix", () => {
    const conWindows = leerTexto("docs/plan.md").split("\n").join("\r\n");

    expect(carpetasDelPlan(conWindows)).toEqual(declaradas);
  });

  it("crea todas las carpetas que declara el plan", () => {
    expect(declaradas.length, "el plan no declara ninguna carpeta").toBeGreaterThan(0);

    for (const carpeta of declaradas) {
      expect(
        existsSync(join(raiz, carpeta)),
        `falta la carpeta ${carpeta} declarada en docs/plan.md §3`,
      ).toBe(true);
    }
  });

  it("no crea carpetas de capa que el plan no declara", () => {
    const existentes = CAPAS.flatMap((capa) => carpetasEnDisco(capa));

    expect(existentes.length, "no hay carpetas de capa en el disco").toBeGreaterThan(0);

    for (const capa of CAPAS) {
      const noDeclaradas = carpetasEnDisco(capa).filter(
        (carpeta) => !declaradas.includes(carpeta),
      );

      expect(
        noDeclaradas,
        `añade ${noDeclaradas.join(", ")} a docs/plan.md §3 o bórralas`,
      ).toEqual([]);
    }
  });

  it("documenta en español cada carpeta de capa con un README", () => {
    expect(declaradas.length, "el plan no declara ninguna carpeta").toBeGreaterThan(0);

    for (const carpeta of declaradas) {
      const ruta = join(raiz, carpeta, "README.md");

      expect(
        existsSync(ruta),
        `${carpeta} necesita un README.md para que git la registre`,
      ).toBe(true);

      const contenido = readFileSync(ruta, "utf8");

      expect(contenido, `${carpeta}/README.md está vacío`).toContain("#");
      expect(contenido.trim().length, `${carpeta}/README.md es demasiado corto`)
        .toBeGreaterThan(120);
      expect(contieneTextoCorrupto(contenido), `${carpeta}/README.md`).toBe(
        false,
      );
    }
  });

  it("detecta texto corrupto y un árbol alterado, para que la comprobación no sea vacua", () => {
    const malGuardado = Buffer.from("Menús", "utf8").toString("latin1");

    expect(malGuardado).not.toBe("Menús");
    expect(contieneTextoCorrupto(malGuardado)).toBe(true);
    expect(contieneTextoCorrupto("Menús con alérgenos")).toBe(false);
    expect(carpetasDelPlan(leerTexto("docs/plan.md")).length).toBeGreaterThan(0);
  });

  it("mantiene el dominio libre de interfaz, de entorno y de infraestructura", () => {
    const fuentes = fuentesDe(join(raiz, "dominio"));

    expect(fuentes.length, "no hay fuentes de dominio que comprobar").toBeGreaterThan(0);

    for (const fuente of fuentes) {
      const contenido = readFileSync(fuente, "utf8");

      for (const prohibido of IMPORTACIONES_PROHIBIDAS_EN_DOMINIO) {
        expect(
          contenido,
          `${fuente.replace(raiz, "")} incumple ${prohibido}`,
        ).not.toMatch(prohibido);
      }
    }
  });

  it("mantiene los adaptadores independientes de las rutas de la aplicación", () => {
    const fuentes = fuentesDe(join(raiz, "infraestructura"));

    expect(fuentes.length, "no hay adaptadores que comprobar").toBeGreaterThan(0);

    for (const fuente of fuentes) {
      const contenido = readFileSync(fuente, "utf8");

      for (const prohibido of IMPORTACIONES_PROHIBIDAS_EN_INFRAESTRUCTURA) {
        expect(
          contenido,
          `${fuente.replace(raiz, "")} incumple ${prohibido}`,
        ).not.toMatch(prohibido);
      }
    }
  });

  it("detecta una dependencia prohibida, para que la comprobación no sea vacua", () => {
    const ejemplos = [
      'import { useState } from "react";',
      'import { render } from "react-dom/server";',
      'import { cookies } from "next/headers";',
      'import { inicio } from "@/app/page";',
      'import { layout } from "../app/layout";',
      'import { entorno } from "@/infraestructura/configuracion/entorno";',
      'import { generar } from "../infraestructura/qr";',
      "const url = process.env.NEXT_PUBLIC_URL;",
    ];

    for (const prohibido of IMPORTACIONES_PROHIBIDAS_EN_DOMINIO) {
      expect(
        ejemplos.some((ejemplo) => prohibido.test(ejemplo)),
        `${prohibido} no detecta ningún ejemplo`,
      ).toBe(true);
    }

    for (const prohibido of IMPORTACIONES_PROHIBIDAS_EN_INFRAESTRUCTURA) {
      expect(
        ejemplos.some((ejemplo) => prohibido.test(ejemplo)),
        `${prohibido} no detecta ningún ejemplo`,
      ).toBe(true);
    }
  });

  it("deja el árbol completo en el disco", () => {
    for (const capa of CAPAS) {
      expect(statSync(join(raiz, capa)).isDirectory(), `falta ${capa}`).toBe(true);
    }
  });
});
