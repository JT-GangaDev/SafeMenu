import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { toHaveNoViolations } from "jest-axe";
import { afterEach, expect } from "vitest";

// `jest-axe` entrega un objeto de matchers, no un matcher suelto.
expect.extend(toHaveNoViolations);

// Vitest no activa los globales de la interfaz, así que la limpieza del DOM
// entre pruebas se registra a mano.
afterEach(() => {
  cleanup();
});
