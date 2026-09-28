import { fileURLToPath } from "node:url";
import { defineConfig, defineProject } from "vitest/config";

const alias = {
  "@": fileURLToPath(new URL("./", import.meta.url)),
};

// Configuración del arnés de pruebas (T-003).
//
// Dos proyectos, para mantener la constitución 3 y el RNF-10:
// - `dominio`: pruebas de dominio, entorno e integración, sin DOM.
// - `componentes`: pruebas de interfaz y accesibilidad, con jsdom.
//
// Las pruebas de extremo a extremo se ejecutan aparte con `npm run test:e2e`.
export default defineConfig({
  // JSX automático sin añadir `@vitejs/plugin-react` como dependencia.
  esbuild: { jsx: "automatic" },
  test: {
    projects: [
      defineProject({
        test: {
          name: "dominio",
          environment: "node",
          include: ["pruebas/**/*.test.ts"],
        },
        resolve: { alias },
      }),
      defineProject({
        test: {
          name: "componentes",
          environment: "jsdom",
          include: ["pruebas/**/*.test.tsx"],
          setupFiles: ["pruebas/componentes/preparacion.ts"],
        },
        resolve: { alias },
      }),
    ],
  },
  resolve: { alias },
});
