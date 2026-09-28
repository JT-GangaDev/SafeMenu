import { describe, expect, it } from "vitest";
import {
  CODIGOS_ERROR_ALERGENO,
  ERRORES_ALERGENO,
  mensajeDeError,
  reintentableDe,
} from "@/dominio/alergenos/errores";

/**
 * T-004. Errores de análisis, revisión y confirmación (RF-6, RF-7, RF-12;
 * RNF-4). La constitución exige español en los mensajes y que los campos
 * externos de OpenAI se traduzcan en la frontera.
 */

const ERRORES_QUE_OFRECEN_REINTENTO = [
  "resultado_invalido",
  "tiempo_espera_agotado",
  "servicio_no_disponible",
] as const;

const CAMPOS_EXTERNOS = [
  "allergens",
  "allergen",
  "openai",
  "prompt",
  "timeout",
  "response",
  "json",
];

/** Quita tildes para comparar la acción esperada sin depender de la ortografía. */
function sinTildes(texto: string): string {
  return texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

describe("errores de alérgenos", () => {
  it("cubre los casos de error de análisis, revisión y confirmación", () => {
    expect([...CODIGOS_ERROR_ALERGENO].sort()).toEqual(
      [
        "advertencia_sin_resolver",
        "afirmacion_contradictoria",
        "analisis_invalido_por_edicion",
        "confirmacion_pendiente",
        "expresion_ambigua",
        "idioma_no_admitido",
        "resultado_invalido",
        "servicio_no_disponible",
        "tiempo_espera_agotado",
        "version_obsoleta",
      ].sort(),
    );
  });

  it("escribe cada mensaje en español, con mayúscula inicial y punto final", () => {
    for (const [codigo, error] of Object.entries(ERRORES_ALERGENO)) {
      expect(error.codigo, `${codigo} no declara su código`).toBe(codigo);
      expect(error.mensaje.length, `${codigo} tiene el mensaje vacío`).toBeGreaterThan(
        20,
      );
      expect(error.mensaje[0], `${codigo} no empieza en mayúscula`).toBe(
        error.mensaje[0]?.toUpperCase(),
      );
      expect(error.mensaje.endsWith("."), `${codigo} no termina en punto`).toBe(
        true,
      );
    }
  });

  it("no filtra campos externos de OpenAI ni detalles técnicos", () => {
    for (const [codigo, error] of Object.entries(ERRORES_ALERGENO)) {
      const mensaje = error.mensaje.toLowerCase();

      for (const campo of CAMPOS_EXTERNOS) {
        expect(mensaje, `${codigo} menciona «${campo}»`).not.toContain(campo);
      }
    }
  });

  it("solo ofrece reintento cuando el fallo es del servicio", () => {
    const reintentables: readonly string[] = ERRORES_QUE_OFRECEN_REINTENTO;

    for (const codigo of ERRORES_QUE_OFRECEN_REINTENTO) {
      expect(
        reintentableDe(codigo),
        `${codigo} debería permitir reintentar`,
      ).toBe(true);
    }

    for (const codigo of CODIGOS_ERROR_ALERGENO) {
      if (reintentables.includes(codigo)) {
        continue;
      }
      expect(
        reintentableDe(codigo),
        `${codigo} no debería ofrecer reintento automático`,
      ).toBe(false);
    }
  });

  it("propone una acción concreta en los errores que dependen del restaurante", () => {
    const acciones = [
      ["expresion_ambigua", "revis"],
      ["afirmacion_contradictoria", "revis"],
      ["idioma_no_admitido", "espanol"],
      ["advertencia_sin_resolver", "confirm"],
      ["confirmacion_pendiente", "confirm"],
      ["version_obsoleta", "cambiado"],
      ["analisis_invalido_por_edicion", "cambiado"],
    ] as const;

    for (const [codigo, accion] of acciones) {
      expect(
        sinTildes(mensajeDeError(codigo)),
        `«${codigo}» no indica la acción esperada`,
      ).toContain(accion);
    }
  });

  it("no presenta un fallo del análisis como ausencia de alérgenos", () => {
    for (const codigo of CODIGOS_ERROR_ALERGENO) {
      const mensaje = sinTildes(mensajeDeError(codigo));
      expect(mensaje, `${codigo} habla de ausencia`).not.toContain("ausencia de");
      expect(mensaje, `${codigo} declara ausencia`).not.toContain("sin alergenos");
    }
  });

  it("devuelve el mensaje del código conocido y falla con el desconocido", () => {
    expect(mensajeDeError("version_obsoleta")).toBe(
      ERRORES_ALERGENO.version_obsoleta.mensaje,
    );
    expect(() => mensajeDeError("inexistente" as never)).toThrow(
      /error de SafeMenu desconocido/i,
    );
  });
});
