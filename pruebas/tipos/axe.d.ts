/**
 * Tipos mínimos de `jest-axe` para no depender de `@types/jest-axe`, que
 * arrastra `@types/jest` y choca con Vitest.
 *
 * Este archivo es ambiental a propósito: `jest-axe` no incluye tipos, así que
 * hay que declarar el módulo entero, no aumentarlo.
 */
declare module "jest-axe" {
  export interface NodoDeViolacion {
    html: string;
    target: string[];
  }

  export interface Violacion {
    id: string;
    impact: string | null;
    help: string;
    description: string;
    nodes: NodoDeViolacion[];
  }

  export interface ResultadoDeAuditoria {
    violations: Violacion[];
    passes: unknown[];
    incomplete: unknown[];
    inapplicable: unknown[];
  }

  export function axe(
    contexto?: Element | Document | string,
    opciones?: unknown,
  ): Promise<ResultadoDeAuditoria>;

  /**
   * `jest-axe` no exporta el matcher suelto sino un objeto de matchers, tal y
   * como espera `expect.extend`.
   */
  export const toHaveNoViolations: {
    toHaveNoViolations(received: ResultadoDeAuditoria): {
      pass: boolean;
      message: () => string;
      actual: Violacion[];
    };
  };
}
