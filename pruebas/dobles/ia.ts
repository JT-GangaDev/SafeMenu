import type { CodigoAlergeno, ValorAlergeno } from "../../dominio/alergenos/catalogo";
import { CLAVES_EXTERNAS, CAMPOS_EXTERNOS, TRADUCCION_CLAVES } from "./contrato";

/**
 * T-006. Doble del servicio de IA.
 *
 * Devuelve el texto crudo de la respuesta, no un objeto ya parseado: una clave
 * repetida se pierde en `JSON.parse` y `CA-RF6-03` exige rechazarla. T-032
 * consumirá este doble para probar la traducción, el rechazo y el tiempo de
 * espera de 10 segundos (CE-4, CE-5).
 */

export const ESCENARIOS_IA = [
  "valida",
  "clave_repetida",
  "clave_ausente",
  "clave_adicional",
  "valor_invalido",
  "respuesta_vacia",
  "json_invalido",
  "error_http",
  "error_red",
  "advertencia_ambigua",
  "advertencia_contradictoria",
  "texto_en_ingles",
] as const;

export type EscenarioIa = (typeof ESCENARIOS_IA)[number];

export interface EntradaAnalisis {
  readonly nombre: string;
  readonly descripcion: string;
}

export interface RespuestaIa {
  readonly estado: number;
  readonly texto: string;
}

export interface IaDePrueba {
  analizar(entrada: EntradaAnalisis): Promise<RespuestaIa>;
  readonly llamadas: EntradaAnalisis[];
}

const CLAVE_EGGS = `"eggs":"absent"`;
const CLAVE_MOLLUSCS = `"molluscs":"absent"`;

/** El valor externo no coincide con el del dominio: es otra frontera. */
const VALOR_EXTERNO: Record<ValorAlergeno, string> = {
  presente: "present",
  ausente: "absent",
};

/** Respuesta bien formada con los 14 valores, en clave externa. */
function carga(cambios: Partial<Record<CodigoAlergeno, ValorAlergeno>> = {}): string {
  const valores: Record<string, string> = {};

  for (const clave of CLAVES_EXTERNAS) {
    valores[clave] = VALOR_EXTERNO[cambios[TRADUCCION_CLAVES[clave]] ?? "ausente"];
  }

  return JSON.stringify({
    [CAMPOS_EXTERNOS.alergenos]: valores,
    [CAMPOS_EXTERNOS.advertencias]: [],
    [CAMPOS_EXTERNOS.idioma]: "es",
  });
}

/** Carga válida de un análisis, con los valores que indique la prueba. */
export function textoAnalisisValido(
  cambios: Partial<Record<CodigoAlergeno, ValorAlergeno>> = {},
): string {
  return carga(cambios);
}

/** CE-1: la descripción no contiene ninguno de los 14 alérgenos. */
export function textoSinAlergenos(): string {
  return carga();
}

/** CE-2: la descripción contiene los 14 alérgenos. */
export function textoConTodosLosAlergenos(): string {
  const todos: Partial<Record<CodigoAlergeno, ValorAlergeno>> = {};

  for (const codigo of Object.values(TRADUCCION_CLAVES)) {
    todos[codigo] = "presente";
  }

  return carga(todos);
}

function conAdvertencia(advertencia: string): string {
  return carga().replace('"warnings":[]', `"warnings":["${advertencia}"]`);
}

const TEXTOS: Record<EscenarioIa, string> = {
  valida: carga(),
  clave_repetida: carga().replace(CLAVE_EGGS, `${CLAVE_EGGS},"eggs":"present"`),
  clave_ausente: carga().replace(`,${CLAVE_MOLLUSCS}`, ""),
  clave_adicional: carga().replace(
    CLAVE_MOLLUSCS,
    `${CLAVE_MOLLUSCS},"pepinos":"present"`,
  ),
  valor_invalido: carga().replace(CLAVE_EGGS, '"eggs":"maybe"'),
  respuesta_vacia: "",
  json_invalido: '{"allergens": {"eggs":',
  error_http: "",
  error_red: "",
  advertencia_ambigua: conAdvertencia(
    "La descripción indica que puede contener trazas de sulfitos.",
  ),
  advertencia_contradictoria: conAdvertencia(
    "El nombre y la descripción se contradicen sobre los huevos.",
  ),
  texto_en_ingles: carga()
    .replace('"warnings":[]', '"warnings":["El texto del plato está en un idioma no admitido."]')
    .replace('"language":"es"', '"language":"en"'),
};

export function crearIaDePrueba(
  opciones: { escenario?: EscenarioIa } = {},
): IaDePrueba {
  const escenario = opciones.escenario ?? "valida";
  const llamadas: EntradaAnalisis[] = [];

  if (!(escenario in TEXTOS)) {
    throw new Error(
      `El escenario de IA desconocido no está previsto: ${String(escenario)}`,
    );
  }

  return {
    async analizar(entrada: EntradaAnalisis): Promise<RespuestaIa> {
      llamadas.push({ nombre: entrada.nombre, descripcion: entrada.descripcion });

      if (escenario === "error_red") {
        throw new Error("No hay conexión con el servicio de IA.");
      }

      return {
        estado: escenario === "error_http" ? 500 : 200,
        texto: TEXTOS[escenario],
      };
    },
    llamadas,
  };
}
