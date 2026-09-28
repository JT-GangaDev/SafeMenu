import type { CodigoAlergeno } from "../../dominio/alergenos/catalogo";

/**
 * T-006. Vocabulario externo de la respuesta de OpenAI y puertos de los dobles.
 *
 * RNF-4 mantiene el DTO fuera del dominio y de la aplicación: solo se usa en
 * `infraestructura/openai/` y aquí. T-031 definirá el DTO definitivo y
 * ajustará este archivo; es el único punto que hay que tocar, porque los
 * escenarios se generan a partir del catálogo.
 */

/** Nombres de los campos de la respuesta externa. Provisional hasta T-031. */
export const CAMPOS_EXTERNOS = {
  alergenos: "allergens",
  advertencias: "warnings",
  idioma: "language",
} as const;

/** Las 14 claves externas, en el mismo orden que `CODIGOS_ALERGENO`. */
export const CLAVES_EXTERNAS = [
  "cereals",
  "crustaceans",
  "eggs",
  "fish",
  "peanuts",
  "soy",
  "milk",
  "tree_nuts",
  "celery",
  "mustard",
  "sesame",
  "sulfites",
  "lupin",
  "molluscs",
] as const;

export type ClaveExterna = (typeof CLAVES_EXTERNAS)[number];

/**
 * Traducción de la frontera: clave externa a código de alérgeno. T-031
 * comprobará que sigue siendo una correspondencia uno a uno.
 */
export const TRADUCCION_CLAVES: Record<ClaveExterna, CodigoAlergeno> = {
  cereals: "cereales_con_gluten",
  crustaceans: "crustaceos",
  eggs: "huevos",
  fish: "pescado",
  peanuts: "cacahuetes",
  soy: "soja",
  milk: "lacteos",
  tree_nuts: "frutos_secos",
  celery: "apio",
  mustard: "mostaza",
  sesame: "sesamo",
  sulfites: "sulfitos",
  lupin: "altramuz",
  molluscs: "moluscos",
};

/** Reloj que consumirán el tiempo de espera de T-032 y la sesión de T-020. */
export interface Reloj {
  ahora(): Date;
  dormir(milisegundos: number): Promise<void>;
}
