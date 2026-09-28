import { afterEach, describe, expect, it } from "vitest";
import {
  ConfiguracionInvalidaError,
  obtenerConfiguracion,
  validarEntorno,
  variablesPublicas,
} from "../../infraestructura/configuracion/entorno";

/**
 * T-002 «Hecho cuando»: la aplicación valida las variables requeridas.
 * Cada comprobación cubre un caso de éxito, uno de error y uno de límite
 * conforme a la constitución 4.
 */
const entornoValido: Record<string, string> = {
  NEXT_PUBLIC_URL: "https://safemenu.example",
  SUPABASE_URL: "https://proyecto.supabase.co",
  SUPABASE_ANON_KEY: "clave-publica-anon",
  SUPABASE_SERVICE_ROLE_KEY: "clave-privilegiada-servidor",
  OPENAI_API_KEY: "clave-openai-servidor",
  OPENAI_MODEL: "gpt-4o-mini",
  SMTP_HOST: "smtp.example.com",
  SMTP_PORT: "587",
  SMTP_USER: "usuario-smtp",
  SMTP_PASSWORD: "clave-smtp",
  SMTP_FROM: "no-reply@safemenu.example",
};

describe("validación de variables de entorno", () => {
  describe("caso de éxito", () => {
    it("acepta un entorno completo y devuelve la configuración normalizada", () => {
      const configuracion = validarEntorno(entornoValido);

      expect(configuracion.urlPublica).toBe("https://safemenu.example");
      expect(configuracion.supabaseUrl).toBe("https://proyecto.supabase.co");
      expect(configuracion.supabaseAnonKey).toBe("clave-publica-anon");
      expect(configuracion.supabaseServiceRoleKey).toBe(
        "clave-privilegiada-servidor",
      );
      expect(configuracion.openaiApiKey).toBe("clave-openai-servidor");
      expect(configuracion.openaiModel).toBe("gpt-4o-mini");
      expect(configuracion.smtp).toEqual({
        host: "smtp.example.com",
        puerto: 587,
        usuario: "usuario-smtp",
        clave: "clave-smtp",
        remitente: "no-reply@safemenu.example",
      });
    });

    it("acepta un entorno sin SMTP, porque el correo se configura en Supabase", () => {
      const configuracion = validarEntorno(
        sinClaves(entornoValido, "SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD", "SMTP_FROM"),
      );

      expect(configuracion.smtp).toBeNull();
    });

    it("expone al cliente únicamente la dirección pública", () => {
      const publicas = variablesPublicas(entornoValido);

      expect(publicas).toEqual({ urlPublica: "https://safemenu.example" });
      expect(Object.keys(publicas)).toEqual(["urlPublica"]);
    });
  });

  describe("casos de error", () => {
    it("rechaza el entorno cuando falta una variable requerida y la nombra", () => {
      const error = capturarError(() =>
        validarEntorno(sinClaves(entornoValido, "OPENAI_API_KEY")),
      );

      expect(error).toBeInstanceOf(ConfiguracionInvalidaError);
      expect(error.variablesFaltantes).toEqual(["OPENAI_API_KEY"]);
      expect(error.message).toContain("OPENAI_API_KEY");
      expect(error.message).toContain("Faltan variables de entorno requeridas");
    });

    it("acumula todas las variables ausentes en un único error", () => {
      const error = capturarError(() => validarEntorno({}));

      expect(error.variablesFaltantes).toEqual([
        "NEXT_PUBLIC_URL",
        "SUPABASE_URL",
        "SUPABASE_ANON_KEY",
        "SUPABASE_SERVICE_ROLE_KEY",
        "OPENAI_API_KEY",
        "OPENAI_MODEL",
      ]);
    });

    it("nunca incluye el valor recibido en el mensaje de error", () => {
      const error = capturarError(() =>
        validarEntorno({ ...entornoValido, SUPABASE_URL: "no-es-una-url-secreta" }),
      );

      expect(error.message).toContain("SUPABASE_URL");
      expect(error.message).not.toContain("no-es-una-url-secreta");
    });

    it("rechaza una dirección pública sin protocolo", () => {
      const error = capturarError(() =>
        validarEntorno({ ...entornoValido, NEXT_PUBLIC_URL: "safemenu.example" }),
      );

      expect(error.message).toContain("NEXT_PUBLIC_URL");
      expect(error.message).toContain("https");
    });

    it("rechaza un modelo de IA vacío o solo con espacios", () => {
      const error = capturarError(() =>
        validarEntorno({ ...entornoValido, OPENAI_MODEL: "   " }),
      );

      expect(error.message).toContain("OPENAI_MODEL");
    });

    it("rechaza un puerto SMTP que no es un número", () => {
      const error = capturarError(() =>
        validarEntorno({ ...entornoValido, SMTP_PORT: "puerto" }),
      );

      expect(error.message).toContain("SMTP_PORT");
    });
  });

  describe("casos límite", () => {
    it("rechaza un puerto SMTP fuera del rango 1-65535 y acepta el límite", () => {
      const cero = capturarError(() =>
        validarEntorno({ ...entornoValido, SMTP_PORT: "0" }),
      );
      const limite = validarEntorno({ ...entornoValido, SMTP_PORT: "65535" });
      const excedido = capturarError(() =>
        validarEntorno({ ...entornoValido, SMTP_PORT: "65536" }),
      );

      expect(cero.message).toContain("SMTP_PORT");
      expect(limite.smtp?.puerto).toBe(65535);
      expect(excedido.message).toContain("SMTP_PORT");
    });

    it("normaliza la barra final de la dirección pública", () => {
      const configuracion = validarEntorno({
        ...entornoValido,
        NEXT_PUBLIC_URL: "https://safemenu.example/",
      });

      expect(configuracion.urlPublica).toBe("https://safemenu.example");
    });

    it("recorta los espacios sobrantes de los valores", () => {
      const configuracion = validarEntorno({
        ...entornoValido,
        OPENAI_MODEL: "  gpt-4o-mini  ",
      });

      expect(configuracion.openaiModel).toBe("gpt-4o-mini");
    });

    it("ignora variables desconocidas", () => {
      const configuracion = validarEntorno({
        ...entornoValido,
        VARIABLE_SIN_DOCUMENTAR: "lo que sea",
      });

      expect(configuracion.openaiModel).toBe("gpt-4o-mini");
    });

    it("rechaza un origen con ruta, porque el QR necesita un origen estable", () => {
      const error = capturarError(() =>
        validarEntorno({ ...entornoValido, NEXT_PUBLIC_URL: "https://safemenu.example/menu" }),
      );

      expect(error.message).toContain("NEXT_PUBLIC_URL");
    });
  });

  describe("acceso en memoria", () => {
    const claves = Object.keys(entornoValido);

    function limpiarEntornoReal() {
      for (const clave of claves) {
        delete process.env[clave];
      }
    }

    function definirEntornoReal() {
      for (const [clave, valor] of Object.entries(entornoValido)) {
        process.env[clave] = valor;
      }
    }

    afterEach(() => {
      limpiarEntornoReal();
    });

    it("falla en español cuando el entorno real está incompleto", () => {
      limpiarEntornoReal();

      const error = capturarError(() => obtenerConfiguracion());

      expect(error).toBeInstanceOf(ConfiguracionInvalidaError);
      expect(error.variablesFaltantes).toContain("OPENAI_API_KEY");
    });

    it("valida el entorno real una sola vez y reutiliza el resultado", () => {
      limpiarEntornoReal();
      definirEntornoReal();

      const primera = obtenerConfiguracion();
      process.env.OPENAI_MODEL = "otro-modelo";
      const segunda = obtenerConfiguracion();

      expect(segunda).toBe(primera);
      expect(primera.openaiModel).toBe("gpt-4o-mini");
    });
  });
});

function sinClaves(
  fuente: Record<string, string>,
  ...claves: string[]
): Record<string, string> {
  const copia = { ...fuente };
  for (const clave of claves) {
    delete copia[clave];
  }
  return copia;
}

function capturarError(accion: () => unknown): ConfiguracionInvalidaError {
  try {
    accion();
  } catch (error) {
    if (error instanceof ConfiguracionInvalidaError) {
      return error;
    }
    throw error;
  }
  throw new Error("se esperaba un ConfiguracionInvalidaError");
}
