/**
 * T-004. Errores de análisis, revisión y confirmación (RF-6, RF-7, RF-12;
 * RNF-4).
 *
 * - Los mensajes están en español y describen la acción que puede hacer el
 *   restaurante, nunca el detalle técnico del servicio.
 * - `reintentable` distingue los fallos del servicio, que se pueden repetir tal
 *   cual, de los que exigen revisar o confirmar antes de continuar
 *   (CA-RF6-04, CA-RF6-05, CA-RF7-02).
 * - Ningún fallo se presenta como ausencia de alérgenos (CE-5, CA-RF12-06).
 */

export interface ErrorAlergeno {
  /** Código estable, en minúsculas y sin tildes. */
  readonly codigo: string;
  /** Mensaje para el restaurante, en español. */
  readonly mensaje: string;
  /** Indica si tiene sentido ofrecer «reintentar» sin cambiar nada. */
  readonly reintentable: boolean;
}

export const ERRORES_ALERGENO = {
  resultado_invalido: {
    codigo: "resultado_invalido",
    mensaje:
      "El análisis de alérgenos no se ha podido utilizar. Vuelve a intentarlo para obtener un resultado nuevo.",
    reintentable: true,
  },
  tiempo_espera_agotado: {
    codigo: "tiempo_espera_agotado",
    mensaje:
      "El análisis de alérgenos ha tardado demasiado y se ha interrumpido. Vuelve a intentarlo.",
    reintentable: true,
  },
  servicio_no_disponible: {
    codigo: "servicio_no_disponible",
    mensaje:
      "El servicio de análisis de alérgenos no está disponible en este momento. Inténtalo de nuevo más tarde.",
    reintentable: true,
  },
  expresion_ambigua: {
    codigo: "expresion_ambigua",
    mensaje:
      "La descripción contiene una expresión ambigua sobre un alérgeno. Revísala y confirma los valores finales antes de publicar.",
    reintentable: false,
  },
  afirmacion_contradictoria: {
    codigo: "afirmacion_contradictoria",
    mensaje:
      "El nombre y la descripción del plato se contradicen sobre algún alérgeno. Revísalo y confirma los valores finales.",
    reintentable: false,
  },
  idioma_no_admitido: {
    codigo: "idioma_no_admitido",
    mensaje:
      "El nombre y la descripción del plato deben estar escritos en español para poder analizar los alérgenos.",
    reintentable: false,
  },
  analisis_invalido_por_edicion: {
    codigo: "analisis_invalido_por_edicion",
    mensaje:
      "El nombre o la descripción del plato han cambiado, así que el análisis anterior ya no es válido. Vuelve a analizar los alérgenos.",
    reintentable: false,
  },
  version_obsoleta: {
    codigo: "version_obsoleta",
    mensaje:
      "El contenido del plato ha cambiado desde tu última revisión. Vuelve a revisar y confirmar los alérgenos de la versión actual.",
    reintentable: false,
  },
  advertencia_sin_resolver: {
    codigo: "advertencia_sin_resolver",
    mensaje:
      "Quedan advertencias de posible presencia sin resolver. Confirma los valores de esos alérgenos antes de publicar el plato.",
    reintentable: false,
  },
  confirmacion_pendiente: {
    codigo: "confirmacion_pendiente",
    mensaje:
      "Los alérgenos corregidos están pendientes de confirmación. Confírmalos para poder considerar el plato verificado.",
    reintentable: false,
  },
} as const satisfies Record<string, ErrorAlergeno>;

export type CodigoErrorAlergeno = keyof typeof ERRORES_ALERGENO;

export const CODIGOS_ERROR_ALERGENO = Object.keys(
  ERRORES_ALERGENO,
) as CodigoErrorAlergeno[];

/** Mensaje en español del error indicado. */
export function mensajeDeError(codigo: CodigoErrorAlergeno): string {
  const error = ERRORES_ALERGENO[codigo];

  if (error === undefined) {
    throw new Error(
      `Se ha solicitado el error de SafeMenu desconocido «${codigo}».`,
    );
  }

  return error.mensaje;
}

/** Indica si el error permite reintentar sin cambios. */
export function reintentableDe(codigo: CodigoErrorAlergeno): boolean {
  return ERRORES_ALERGENO[codigo]?.reintentable ?? false;
}
