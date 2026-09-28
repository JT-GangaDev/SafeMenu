import { describe, expect, it } from "vitest";
import { leerPaquete } from "../helpers/proyecto";

/**
 * Constitución 1: no se añaden dependencias, servicios ni capas sin una
 * necesidad documentada en `plan.md` §2.
 */
describe("dependencias mínimas (constitución 1)", () => {
  const dependenciasPermitidas = ["next", "react", "react-dom"];

  const herramientasDePruebaPermitidas = [
    "@types/node",
    "@types/react",
    "@types/react-dom",
    "eslint",
    "eslint-config-next",
    "typescript",
    "vitest",
  ];

  const { dependencies, devDependencies } = leerPaquete();

  it("solo depende de Next.js y React", () => {
    expect(Object.keys(dependencies).sort()).toEqual([...dependenciasPermitidas].sort());
  });

  it("no introduce ORM, colas, Redis, analítica ni librerías de QR o componentes", () => {
    const prohibidas = [
      "prisma",
      "drizzle-orm",
      "typeorm",
      "sequelize",
      "bullmq",
      "bull",
      "ioredis",
      "redis",
      "qrcode",
      "satori",
      "posthog",
      "analytics",
      "@mui/material",
      "antd",
      "bootstrap",
      "tailwindcss",
    ];
    const instaladas = [...Object.keys(dependencies), ...Object.keys(devDependencies)];
    for (const paquete of prohibidas) {
      expect(instaladas, `dependencia no permitida: ${paquete}`).not.toContain(paquete);
    }
  });

  it("limita las herramientas de desarrollo a lint, tipos y pruebas", () => {
    const permitidas = herramientasDePruebaPermitidas.filter((herramienta) =>
      devDependencies[herramienta],
    );
    expect(Object.keys(devDependencies).sort()).toEqual(permitidas.sort());
  });

  it("mantiene el proyecto privado y sin versión publicable", () => {
    const paquete = leerPaquete();
    expect(paquete.private).toBe(true);
  });
});
