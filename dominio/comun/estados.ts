/**
 * T-004. Estados de platos y restaurantes (RF-7, RF-8, RF-12; RNF-1, RNF-4).
 *
 * El estado es el valor que ve y elige el restaurante, en español. El código
 * interno, sin espacios ni tildes, es el que se guarda en la base de datos y
 * el que viaja en las respuestas de la API, para no depender de literales con
 * acentos en las consultas.
 */

/** Estados posibles de un plato (`docs/plan.md` §5). */
export const ESTADOS_PLATO = [
  "borrador",
  "verificación pendiente",
  "confirmado",
  "oculto",
] as const;

/** Estados posibles de un restaurante (`docs/plan.md` §5). */
export const ESTADOS_RESTAURANTE = ["no publicado", "publicado"] as const;

export type Estado = (typeof ESTADOS_PLATO)[number] | (typeof ESTADOS_RESTAURANTE)[number];
export type EstadoPlato = (typeof ESTADOS_PLATO)[number];
export type EstadoRestaurante = (typeof ESTADOS_RESTAURANTE)[number];

/** Los seis estados del dominio, en el orden del criterio de T-004. */
export const ESTADOS = [
  ...ESTADOS_PLATO,
  ...ESTADOS_RESTAURANTE,
] as const;

/** Código interno de cada estado. */
const CODIGO_POR_ESTADO = {
  borrador: "borrador",
  "verificación pendiente": "verificacion_pendiente",
  confirmado: "confirmado",
  oculto: "oculto",
  "no publicado": "no_publicado",
  publicado: "publicado",
} as const satisfies Record<Estado, string>;

/** Estado de dominio de cada código interno. */
export const ESTADO_POR_CODIGO = {
  borrador: "borrador",
  verificacion_pendiente: "verificación pendiente",
  confirmado: "confirmado",
  oculto: "oculto",
  no_publicado: "no publicado",
  publicado: "publicado",
} as const satisfies Record<(typeof CODIGO_POR_ESTADO)[Estado], Estado>;

const ESTADOS_VALIDOS: ReadonlySet<string> = new Set<string>(ESTADOS);
const ESTADOS_PLATO_VALIDOS: ReadonlySet<string> = new Set<string>(ESTADOS_PLATO);
const ESTADOS_RESTAURANTE_VALIDOS: ReadonlySet<string> =
  new Set<string>(ESTADOS_RESTAURANTE);

/** Indica si el valor es cualquiera de los seis estados del dominio. */
export function esEstado(valor: string): valor is Estado {
  return ESTADOS_VALIDOS.has(valor);
}

/** Indica si el valor es un estado de plato. */
export function esEstadoPlato(valor: string): valor is EstadoPlato {
  return ESTADOS_PLATO_VALIDOS.has(valor);
}

/** Indica si el valor es un estado de restaurante. */
export function esEstadoRestaurante(valor: string): valor is EstadoRestaurante {
  return ESTADOS_RESTAURANTE_VALIDOS.has(valor);
}

/** Código interno con el que se persiste el estado. */
export function codigoDeEstado(estado: Estado): string {
  return CODIGO_POR_ESTADO[estado];
}

/**
 * Estado de dominio a partir del código interno. Devuelve `null` si el código
 * no existe, para que un dato inesperado se detecte en la frontera en lugar de
 * guardarse como un estado cualquiera.
 */
export function estadoDesdeCodigo(codigo: string): Estado | null {
  if (Object.hasOwn(ESTADO_POR_CODIGO, codigo)) {
    return ESTADO_POR_CODIGO[codigo as keyof typeof ESTADO_POR_CODIGO];
  }

  return null;
}
