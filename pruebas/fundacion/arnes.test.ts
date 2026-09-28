import { describe, expect, it } from "vitest";
import configuracionPlaywright from "../../playwright.config";
import configuracionVitest from "../../vitest.config";

/**
 * T-003 «Hecho cuando»: las pruebas unitarias, de componentes y E2E se
 * ejecutan mediante comandos documentados. Esta prueba comprueba que el arnés
 * está configurado, no que un archivo exista.
 */
interface ProyectoVitest {
  test?: {
    name?: string;
    environment?: string;
    include?: string[];
    setupFiles?: string[];
  };
}

interface ConfiguracionVitest {
  test?: { projects?: ProyectoVitest[] };
  resolve?: { alias?: Record<string, string> };
  esbuild?: { jsx?: string };
}

interface ConfiguracionPlaywright {
  testDir?: string;
  use?: { baseURL?: string; locale?: string; trace?: string };
  webServer?: { command?: string; url?: string; reuseExistingServer?: boolean };
  projects?: { name?: string }[];
}

const vitest = configuracionVitest as ConfiguracionVitest;
const playwright = configuracionPlaywright as ConfiguracionPlaywright;

function proyecto(nombre: string): ProyectoVitest {
  const encontrado = vitest.test?.projects?.find(
    (configurado) => configurado.test?.name === nombre,
  );
  expect(encontrado, `falta el proyecto ${nombre} en vitest.config.ts`).toBeDefined();
  return encontrado as ProyectoVitest;
}

describe("arnés de pruebas unitarias y de componentes", () => {
  it("separa el proyecto de dominio, sin DOM, del de componentes, con jsdom", () => {
    expect(proyecto("dominio").test?.environment).toBe("node");
    expect(proyecto("componentes").test?.environment).toBe("jsdom");
  });

  it("reparte los archivos de prueba por extensión y no los mezcla", () => {
    expect(proyecto("dominio").test?.include).toEqual(["pruebas/**/*.test.ts"]);
    expect(proyecto("componentes").test?.include).toEqual([
      "pruebas/**/*.test.tsx",
    ]);
  });

  it("prepara los matchers de accesibilidad y de DOM en los componentes", () => {
    expect(proyecto("componentes").test?.setupFiles).toEqual([
      "pruebas/componentes/preparacion.ts",
    ]);
  });

  it("mantiene el alias `@` para que dominio y pruebas usen la misma raíz", () => {
    expect(vitest.resolve?.alias?.["@"]).toBeDefined();
  });

  it("compila JSX sin dependencias adicionales", () => {
    expect(vitest.esbuild?.jsx).toBe("automatic");
  });
});

describe("arnés de pruebas de extremo a extremo", () => {
  it("apunta a la carpeta de pruebas E2E y a la aplicación local", () => {
    expect(playwright.testDir).toBe("pruebas/e2e");
    expect(playwright.use?.baseURL).toBe("http://localhost:3000");
  });

  it("levanta la aplicación compilada y reutiliza el servidor local", () => {
    expect(playwright.webServer?.command).toContain("npm run build");
    expect(playwright.webServer?.command).toContain("npm run start");
    expect(playwright.webServer?.url).toBe("http://localhost:3000");
    expect(playwright.webServer?.reuseExistingServer).toBe(!process.env.CI);
  });

  it("navega en español para comprobar los mensajes esperados en español", () => {
    expect(playwright.use?.locale).toBe("es-ES");
  });

  it("degrada a Chromium para no multiplicar el peso de la instalación", () => {
    expect(playwright.projects?.map((configurado) => configurado.name)).toEqual([
      "chromium",
    ]);
  });
});
