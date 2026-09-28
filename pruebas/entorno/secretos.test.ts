import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { asegurarEjecucionEnServidor } from "../../infraestructura/configuracion/entorno";
import { raiz } from "../helpers/proyecto";

/**
 * T-002 «Hecho cuando»: ninguna clave de OpenAI o Supabase queda expuesta al
 * cliente. RNF-2: las credenciales se gestionan en el servidor y nunca se
 * exponen.
 *
 * Solo se inspecciona el código que Next.js puede enviar al navegador
 * (`app/`) y las capas de dominio e infraestructura. `scripts/` no se empaqueta
 * nunca y se ejecuta solo con Node en el servidor.
 */
const secretosDeServidor = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "OPENAI_API_KEY",
  "SMTP_PASSWORD",
];

const variablesPublicasPermitidas = ["NEXT_PUBLIC_URL"];

const carpetasInspeccionadas = ["app", "dominio", "infraestructura"];

const variablesDocumentadas = [
  "NEXT_PUBLIC_URL",
  "OPENAI_API_KEY",
  "OPENAI_MODEL",
  "SMTP_FROM",
  "SMTP_HOST",
  "SMTP_PASSWORD",
  "SMTP_PORT",
  "SMTP_USER",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_URL",
];

function archivosDeCodigo(carpeta: string): string[] {
  const ruta = join(raiz, carpeta);
  if (!existsSync(ruta)) {
    return [];
  }
  const encontrados: string[] = [];
  for (const entrada of readdirSync(ruta)) {
    const completa = join(ruta, entrada);
    if (statSync(completa).isDirectory()) {
      encontrados.push(...archivosDeCodigo(join(carpeta, entrada)));
      continue;
    }
    if (/\.tsx?$|\.mjs$/.test(entrada)) {
      encontrados.push(completa);
    }
  }
  return encontrados;
}

function contenidoDe(carpeta: string): { ruta: string; texto: string }[] {
  return archivosDeCodigo(carpeta).map((ruta) => ({
    ruta: ruta.slice(raiz.length).replace(/\\/g, "/"),
    texto: readFileSync(ruta, "utf8"),
  }));
}

describe("secretos de servidor", () => {
  it("solo permite leer secretos en el módulo de configuración del servidor", () => {
    const lecturasFueraDeServidor: string[] = [];

    for (const carpeta of carpetasInspeccionadas) {
      for (const { ruta, texto } of contenidoDe(carpeta)) {
        for (const secreto of secretosDeServidor) {
          if (
            new RegExp(`process\\.env\\.${secreto}\\b`).test(texto) &&
            ruta !== "infraestructura/configuracion/entorno.ts"
          ) {
            lecturasFueraDeServidor.push(`${ruta} lee ${secreto}`);
          }
        }
      }
    }

    expect(lecturasFueraDeServidor).toEqual([]);
  });

  it("limita las variables NEXT_PUBLIC a la dirección pública", () => {
    const publicoNoPermitido: string[] = [];

    for (const carpeta of carpetasInspeccionadas) {
      for (const { ruta, texto } of contenidoDe(carpeta)) {
        for (const coincidencia of texto.matchAll(
          /process\.env\.(NEXT_PUBLIC_[A-Z0-9_]+)/g,
        )) {
          if (!variablesPublicasPermitidas.includes(coincidencia[1])) {
            publicoNoPermitido.push(`${ruta} usa ${coincidencia[1]}`);
          }
        }
      }
    }

    expect(publicoNoPermitido).toEqual([]);
  });

  it("no permite importar el módulo de configuración desde el cliente", () => {
    const importacionesProhibidas: string[] = [];

    for (const { ruta, texto } of contenidoDe("app")) {
      if (/"use client"/.test(texto) && texto.includes("configuracion/entorno")) {
        importacionesProhibidas.push(ruta);
      }
    }

    expect(importacionesProhibidas).toEqual([]);
  });

  it("documenta en español y con marcadores las once variables de plan.md §4", () => {
    const ejemplo = readFileSync(join(raiz, ".env.example"), "utf8");
    const declaradas = [
      ...ejemplo.matchAll(/^([A-Z0-9_]+)=(.*)$/gm),
    ];

    for (const [, variable, valor] of declaradas) {
      if (valor.length > 0 && !valor.startsWith("<")) {
        throw new Error(
          `${variable} debe quedar vacía o con un marcador <...> en .env.example`,
        );
      }
    }

    expect(declaradas.map(([, variable]) => variable).sort()).toEqual(
      [...variablesDocumentadas].sort(),
    );
    expect(ejemplo).toContain("# Configuración de SafeMenu");
  });

  it("no versiona los archivos de entorno reales", () => {
    expect(readFileSync(join(raiz, ".gitignore"), "utf8")).toContain(".env*");
  });

  it("impide usar el módulo de configuración desde el cliente", () => {
    const original = Reflect.get(globalThis, "window");
    Reflect.set(globalThis, "window", {});

    try {
      expect(() => asegurarEjecucionEnServidor()).toThrow(
        /solo puede usarse en el servidor/,
      );
    } finally {
      if (original === undefined) {
        Reflect.deleteProperty(globalThis, "window");
      } else {
        Reflect.set(globalThis, "window", original);
      }
    }
  });

  it("permite usar el módulo de configuración en el servidor", () => {
    expect(() => asegurarEjecucionEnServidor()).not.toThrow();
  });
});
