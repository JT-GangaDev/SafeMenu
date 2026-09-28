/**
 * T-004. Catálogo único de los 14 alérgenos (RF-6, RF-7, RF-12; RNF-1, RNF-4).
 *
 * - Los códigos son los de `docs/plan.md` §5, en ese orden y sin tildes: son la
 *   clave de la base de datos y la clave de traducción de la respuesta de la IA.
 * - Las etiquetas son el nombre en español que ve el comensal (CA-RF12-02).
 * - Los valores admitidos son solo `presente` y `ausente` (CA-RF6-02, CA-RF6-03).
 * - La ausencia de alérgenos nunca se presenta como certificación (CA-RF12-06).
 *
 * Este módulo no importa nada: es la frontera de traducción de los campos
 * externos de OpenAI al vocabulario del dominio.
 */

/** Los 14 códigos, en el orden de `docs/plan.md` §5. */
export const CODIGOS_ALERGENO = [
  "cereales_con_gluten",
  "crustaceos",
  "huevos",
  "pescado",
  "cacahuetes",
  "soja",
  "lacteos",
  "frutos_secos",
  "apio",
  "mostaza",
  "sesamo",
  "sulfitos",
  "altramuz",
  "moluscos",
] as const;

export type CodigoAlergeno = (typeof CODIGOS_ALERGENO)[number];

/** Nombre en español de cada alérgeno (CA-RF12-02). */
export const ETIQUETAS_ALERGENO = {
  cereales_con_gluten: "Cereales con gluten",
  crustaceos: "Crustáceos",
  huevos: "Huevos",
  pescado: "Pescado",
  cacahuetes: "Cacahuetes",
  soja: "Soja",
  lacteos: "Lácteos",
  frutos_secos: "Frutos secos",
  apio: "Apio",
  mostaza: "Mostaza",
  sesamo: "Sésamo",
  sulfitos: "Sulfitos",
  altramuz: "Altramuz",
  moluscos: "Moluscos",
} as const satisfies Record<CodigoAlergeno, string>;

/** Valores admitidos para cada alérgeno. */
export const VALORES_ALERGENO = ["presente", "ausente"] as const;

export type ValorAlergeno = (typeof VALORES_ALERGENO)[number];

/**
 * Aviso para el caso en que la revisión no detecta ninguno de los 14
 * alérgenos. Informa de lo revisado sin prometer seguridad (CA-RF12-04,
 * CA-RF12-06, CE-1).
 */
export const AVISO_SIN_ALERGENOS_DETECTADOS =
  "No se ha detectado ninguno de los 14 alérgenos en la versión revisada por el restaurante. Esta revisión no es una certificación de ausencia de alérgenos.";

const CODIGOS: ReadonlySet<string> = new Set<string>(CODIGOS_ALERGENO);
const VALORES: ReadonlySet<string> = new Set<string>(VALORES_ALERGENO);

/**
 * Indica si el valor recibido es uno de los 14 códigos. No se recortan espacios
 * ni se aceptan mayúsculas: una clave ajena al catálogo invalida el resultado
 * completo (CA-RF6-03, CE-4).
 */
export function esCodigoAlergeno(valor: string): valor is CodigoAlergeno {
  return CODIGOS.has(valor);
}

/** Indica si el valor recibido es `presente` o `ausente` (CA-RF6-03). */
export function esValorAlergeno(valor: string): valor is ValorAlergeno {
  return VALORES.has(valor);
}

/**
 * Nombre en español del alérgeno. Si el código no está en el catálogo se
 * devuelve tal cual, para que un dato inesperado siga siendo visible en lugar
 * de desaparecer.
 */
export function etiquetaDe(codigo: string): string {
  if (esCodigoAlergeno(codigo)) {
    return ETIQUETAS_ALERGENO[codigo];
  }

  return codigo;
}
