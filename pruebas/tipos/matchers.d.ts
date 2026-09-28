import "vitest";

/**
 * Matcher de accesibilidad de `jest-axe` sobre las aserciones de Vitest, para
 * poder escribir `expect(resultado).toHaveNoViolations()`.
 */
declare module "vitest" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- `T` lo impone la firma original que se aumenta
  interface Assertion<T = unknown> {
    toHaveNoViolations: () => void;
  }
}
