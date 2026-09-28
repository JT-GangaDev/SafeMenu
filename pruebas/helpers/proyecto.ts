import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export interface Paquete {
  name: string;
  private: boolean;
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

export interface ConfiguracionTypeScript {
  compilerOptions: {
    strict?: boolean;
    noEmit?: boolean;
    jsx?: string;
    paths?: Record<string, string[]>;
  };
  include: string[];
  exclude: string[];
}

export const raiz = fileURLToPath(new URL("../../", import.meta.url));

export function leerPaquete(): Paquete {
  return JSON.parse(readFileSync(`${raiz}package.json`, "utf8")) as Paquete;
}

export function leerTsConfig(): ConfiguracionTypeScript {
  return JSON.parse(
    readFileSync(`${raiz}tsconfig.json`, "utf8"),
  ) as ConfiguracionTypeScript;
}

export function leerTexto(rutaRelativa: string): string {
  return readFileSync(`${raiz}${rutaRelativa}`, "utf8");
}
