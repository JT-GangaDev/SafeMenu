/**
 * T-006. Doble del generador de QR.
 *
 * Devuelve un PNG de 1x1 válido y siempre el mismo, para que T-046 y T-047
 * puedan comprobar la descarga, la impresión y el reintento de `CE-21` sin
 * depender de un servicio real.
 */

/** Los ocho bytes con los que empieza todo archivo PNG. */
export const FIRMA_PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const PNG_UN_PIXEL =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

export type EscenarioQr = "correcto" | "fallo";

export interface EntradaQr {
  readonly direccion: string;
}

export interface ResultadoQr {
  readonly png: Uint8Array;
}

export interface QrDePrueba {
  generar(entrada: EntradaQr): Promise<ResultadoQr>;
  readonly llamadas: EntradaQr[];
}

export function crearQrDePrueba(opciones: { escenario?: EscenarioQr } = {}): QrDePrueba {
  const escenario = opciones.escenario ?? "correcto";
  const llamadas: EntradaQr[] = [];
  const png = Uint8Array.from(atob(PNG_UN_PIXEL), (caracter) => caracter.charCodeAt(0));

  return {
    async generar(entrada: EntradaQr): Promise<ResultadoQr> {
      llamadas.push({ direccion: entrada.direccion });

      if (entrada.direccion.trim() === "") {
        throw new Error("La dirección del código QR no puede estar vacía.");
      }

      if (escenario === "fallo") {
        throw new Error("No se pudo generar el código QR.");
      }

      return { png: Uint8Array.from(png) };
    },
    llamadas,
  };
}
