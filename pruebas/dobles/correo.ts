/**
 * T-006. Doble del servicio de correo.
 *
 * Guarda lo que se habría enviado y no se conecta a SMTP. T-017, T-018 y
 * T-022 lo usarán para comprobar que la verificación y la recuperación se
 * piden en español y sin revelar si una cuenta existe.
 */

export const PLANTILLAS_CORREO = [
  "verificacion_correo",
  "recuperacion_contrasena",
] as const;

export type PlantillaCorreo = (typeof PLANTILLAS_CORREO)[number];

export type EscenarioCorreo = "correcto" | "fallo";

export interface MensajeCorreo {
  readonly destinatario: string;
  readonly plantilla: PlantillaCorreo;
  readonly asunto: string;
  readonly cuerpo: string;
  readonly enlace: string;
}

export interface CorreoDePrueba {
  enviar(mensaje: MensajeCorreo): Promise<void>;
  readonly enviados: MensajeCorreo[];
  ultimoEnvio(): MensajeCorreo | null;
}

export function crearCorreoDePrueba(
  opciones: { escenario?: EscenarioCorreo } = {},
): CorreoDePrueba {
  const escenario = opciones.escenario ?? "correcto";
  const enviados: MensajeCorreo[] = [];

  return {
    async enviar(mensaje: MensajeCorreo): Promise<void> {
      if (mensaje.destinatario.trim() === "") {
        throw new Error("El destinatario del correo no puede estar vacío.");
      }

      if (escenario === "fallo") {
        throw new Error("No se pudo enviar el correo.");
      }

      enviados.push({ ...mensaje });
    },
    enviados,
    ultimoEnvio(): MensajeCorreo | null {
      return enviados.at(-1) ?? null;
    },
  };
}
