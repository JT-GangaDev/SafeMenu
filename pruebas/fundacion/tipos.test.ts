import { describe, expect, it } from "vitest";
import { leerTexto, leerTsConfig } from "../helpers/proyecto";

/** T-001 y RNF-4: TypeScript estricto y metadatos de Next.js configurados. */
describe("configuración de TypeScript y Next.js", () => {
  const tsConfig = leerTsConfig();

  it("activa el modo estricto", () => {
    expect(tsConfig.compilerOptions.strict).toBe(true);
    expect(tsConfig.compilerOptions.noEmit).toBe(true);
  });

  it("resuelve el alias `@/*` a la raíz del proyecto", () => {
    expect(tsConfig.compilerOptions.paths?.["@/*"]).toEqual(["./*"]);
  });

  it("compila JSX con el runtime automático de React", () => {
    expect(tsConfig.compilerOptions.jsx).toBe("react-jsx");
  });

  it("incluye los archivos TypeScript de todo el proyecto", () => {
    expect(tsConfig.include).toContain("**/*.ts");
    expect(tsConfig.include).toContain("**/*.tsx");
    expect(tsConfig.exclude).toContain("node_modules");
  });

  it("no redefine reglas estrictas que Next.js ya cubre", () => {
    const nextConfig = leerTexto("next.config.ts");
    expect(nextConfig).not.toContain("typescript.ignoreBuildErrors");
    expect(nextConfig).not.toContain("eslint.ignoreDuringBuilds");
  });
});
