/**
 * T-002. Variables de entorno y secretos de servidor.
 *
 * - `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY` y `SMTP_PASSWORD` solo se
 *   leen aquí, en el servidor (RNF-2).
 * - `NEXT_PUBLIC_URL` es la única variable expuesta al navegador y se entrega
 *   únicamente a través de `variablesPublicas`.
 * - Los mensajes de error están en español y nunca incluyen el valor recibido.
 */

export interface ConfiguracionSmtp {
  host: string;
  puerto: number;
  usuario: string;
  clave: string;
  remitente: string;
}

export interface VariablesServidor {
  urlPublica: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
  openaiApiKey: string;
  openaiModel: string;
  smtp: ConfiguracionSmtp | null;
}

export type FuenteEntorno = Record<string, string | undefined>;

export class ConfiguracionInvalidaError extends Error {
  readonly variablesFaltantes: string[];
  readonly variablesInvalidas: string[];

  constructor(faltantes: string[], invalidas: string[]) {
    const partes: string[] = [];
    if (faltantes.length > 0) {
      partes.push(
        `Faltan variables de entorno requeridas: ${faltantes.join(", ")}.`,
      );
    }
    if (invalidas.length > 0) {
      partes.push(
        `Las variables de entorno no son válidas: ${invalidas.join(", ")}.`,
      );
    }
    partes.push(
      "Copia .env.example a .env.local y completa los valores. Consulta la sección de variables de docs/plan.md.",
    );
    super(partes.join(" "));
    this.name = "ConfiguracionInvalidaError";
    this.variablesFaltantes = faltantes;
    this.variablesInvalidas = invalidas;
  }
}

const variablesRequeridas = [
  "NEXT_PUBLIC_URL",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "OPENAI_API_KEY",
  "OPENAI_MODEL",
] as const;

const variablesSmtp = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASSWORD",
  "SMTP_FROM",
] as const;

function recortar(valor: string | undefined): string {
  return (valor ?? "").trim();
}

function esOrigenHttps(valor: string): boolean {
  if (!/^https?:\/\//i.test(valor)) {
    return false;
  }
  try {
    const url = new URL(valor);
    return url.pathname === "/" && url.search === "" && url.hash === "";
  } catch {
    return false;
  }
}

function normalizarOrigen(valor: string): string {
  return valor.replace(/\/+$/, "");
}

/** Falla si el módulo se importa desde el navegador. */
export function asegurarEjecucionEnServidor(): void {
  if (typeof window !== "undefined") {
    throw new Error(
      "La configuración de entorno solo puede usarse en el servidor.",
    );
  }
}

export function validarEntorno(fuente: FuenteEntorno): VariablesServidor {
  const faltantes: string[] = [];
  const invalidas: string[] = [];

  for (const variable of variablesRequeridas) {
    if (recortar(fuente[variable]) === "") {
      faltantes.push(variable);
    }
  }

  const urlPublica = normalizarOrigen(recortar(fuente.NEXT_PUBLIC_URL));
  if (faltantes.length === 0 && !esOrigenHttps(urlPublica)) {
    invalidas.push(
      "NEXT_PUBLIC_URL (debe ser un origen https:// sin ruta, por ejemplo https://safemenu.example)",
    );
  }

  const supabaseUrl = normalizarOrigen(recortar(fuente.SUPABASE_URL));
  if (faltantes.length === 0 && !esOrigenHttps(supabaseUrl)) {
    invalidas.push(
      "SUPABASE_URL (debe ser un origen https:// sin ruta, por ejemplo https://proyecto.supabase.co)",
    );
  }

  const smtp = leerSmtp(fuente, invalidas);

  if (faltantes.length > 0 || invalidas.length > 0) {
    throw new ConfiguracionInvalidaError(faltantes, invalidas);
  }

  return {
    urlPublica,
    supabaseUrl,
    supabaseAnonKey: recortar(fuente.SUPABASE_ANON_KEY),
    supabaseServiceRoleKey: recortar(fuente.SUPABASE_SERVICE_ROLE_KEY),
    openaiApiKey: recortar(fuente.OPENAI_API_KEY),
    openaiModel: recortar(fuente.OPENAI_MODEL),
    smtp,
  };
}

function leerSmtp(
  fuente: FuenteEntorno,
  invalidas: string[],
): ConfiguracionSmtp | null {
  const presentes = variablesSmtp.filter(
    (variable) => recortar(fuente[variable]) !== "",
  );

  if (presentes.length === 0) {
    return null;
  }

  if (presentes.length < variablesSmtp.length) {
    invalidas.push(
      "SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM (la configuración de correo está incompleta; rellénala toda o déjala vacía)",
    );
    return null;
  }

  const puerto = Number.parseInt(recortar(fuente.SMTP_PORT), 10);
  if (!Number.isInteger(puerto) || puerto < 1 || puerto > 65535) {
    invalidas.push("SMTP_PORT (debe ser un número entero entre 1 y 65535)");
    return null;
  }

  return {
    host: recortar(fuente.SMTP_HOST),
    puerto,
    usuario: recortar(fuente.SMTP_USER),
    clave: recortar(fuente.SMTP_PASSWORD),
    remitente: recortar(fuente.SMTP_FROM),
  };
}

let configuracionEnMemoria: VariablesServidor | null = null;

/** Configuración del servidor, validada una sola vez por proceso. */
export function obtenerConfiguracion(): VariablesServidor {
  asegurarEjecucionEnServidor();
  if (configuracionEnMemoria === null) {
    configuracionEnMemoria = validarEntorno(process.env);
  }
  return configuracionEnMemoria;
}

/** Única vía de acceso a datos expuestos al navegador. */
export function variablesPublicas(
  fuente: FuenteEntorno = process.env,
): { urlPublica: string } {
  const urlPublica = normalizarOrigen(recortar(fuente.NEXT_PUBLIC_URL));
  if (urlPublica === "") {
    throw new ConfiguracionInvalidaError(["NEXT_PUBLIC_URL"], []);
  }
  return { urlPublica };
}
