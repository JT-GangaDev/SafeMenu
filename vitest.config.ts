import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Configuración mínima de T-001. T-003 ampliará el.include con pruebas de
// componentes (jsdom) y E2E, y añadirá los proveedores falsos de infraestructura.
export default defineConfig({
  test: {
    environment: "node",
    include: ["pruebas/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
});
