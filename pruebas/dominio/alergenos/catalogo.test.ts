import { describe, expect, it } from "vitest";
import { leerTexto } from "../../helpers/proyecto";
import {
  AVISO_SIN_ALERGENOS_DETECTADOS,
  CODIGOS_ALERGENO,
  ETIQUETAS_ALERGENO,
  VALORES_ALERGENO,
  etiquetaDe,
  esCodigoAlergeno,
  esValorAlergeno,
} from "@/dominio/alergenos/catalogo";

/**
 * T-004. Catálogo de 14 alérgenos (RF-6, RF-7, RF-12; RNF-1, RNF-4).
 *
 * La lista de `docs/plan.md` §5 es la especificación: si el catálogo y el plan
 * se separan, la validación de exactamente 14 valores dejaría de ser fiable.
 */

/**
 * Extrae la lista numerada de códigos de alérgenos de la sección 5 del plan.
 * Recibe el texto para poder comprobar que falla si la lista cambia.
 */
function codigosDelPlan(texto = leerTexto("docs/plan.md")): string[] {
  const seccion = texto.split("## 5. Modelo de datos")[1];

  if (seccion === undefined) {
    throw new Error("docs/plan.md no contiene la sección «5. Modelo de datos».");
  }

  return [...seccion.matchAll(/^\d+\.\s+`([a-z_]+)`\.$/gm)].map(
    (encontrado) => encontrado[1],
  );
}

/** Quita tildes para comparar sin depender de la ortografía. */
function sinTildes(texto: string): string {
  return texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

// «gluten» y «soja» también son palabras españolas válidas, así que no pueden
// usarse para detectar texto sin traducir.
const PALABRAS_SIN_TRADUCIR =
  /\b(allerg(?:y|ens?)|dairy|nuts?|shellfish|mustard|sesame|timeout|error|warning|present|absent|pending|confirmed|draft|hidden)\b/i;

describe("catálogo de alérgenos", () => {
  it("contiene exactamente los 14 códigos del plan, en el mismo orden", () => {
    expect(CODIGOS_ALERGENO).toHaveLength(14);
    expect([...CODIGOS_ALERGENO]).toEqual(codigosDelPlan());
  });

  it("falla si el plan y el catálogo se separan, para que la comparación no sea vacua", () => {
    const planAlterado = leerTexto("docs/plan.md").replace(
      "14. `moluscos`.",
      "14. `moluscos_beta`.",
    );

    expect(codigosDelPlan(planAlterado)).not.toEqual(codigosDelPlan());
  });

  it("no repite códigos y los escribe en minúsculas sin tildes", () => {
    expect(new Set(CODIGOS_ALERGENO).size).toBe(14);

    for (const codigo of CODIGOS_ALERGENO) {
      expect(codigo).toMatch(/^[a-z_]+$/);
      expect(codigo).toBe(codigo.toLowerCase());
      expect(codigo).not.toMatch(/[áéíóúñü]/u);
    }
  });

  it("asigna una etiqueta en español distinta a cada código", () => {
    const etiquetas = CODIGOS_ALERGENO.map((codigo) => ETIQUETAS_ALERGENO[codigo]);

    expect(etiquetas).toHaveLength(14);
    expect(new Set(etiquetas).size).toBe(14);

    for (const etiqueta of etiquetas) {
      expect(etiqueta).not.toBe("");
      expect(etiqueta).not.toMatch(PALABRAS_SIN_TRADUCIR);
    }
  });

  it("escribe los códigos sin tildes y las etiquetas con ellas", () => {
    expect(ETIQUETAS_ALERGENO.lacteos).toBe("Lácteos");
    expect(ETIQUETAS_ALERGENO.sesamo).toBe("Sésamo");
  });

  it("acepta los 14 códigos y rechaza los que no lo son", () => {
    for (const codigo of CODIGOS_ALERGENO) {
      expect(esCodigoAlergeno(codigo)).toBe(true);
    }

    for (const candidato of [
      "",
      "huevo",
      "HUEVOS",
      "Lácteos",
      "lacteos ",
      " lacteos",
      "huevos\n",
      "frutos secos",
      "moluscos_beta",
      "cereales-con-gluten",
    ]) {
      expect(
        esCodigoAlergeno(candidato),
        `no debería aceptar «${candidato}»`,
      ).toBe(false);
    }
  });

  it("devuelve la etiqueta del alérgeno o el propio código si no existe", () => {
    expect(etiquetaDe("cacahuetes")).toBe("Cacahuetes");
    expect(etiquetaDe("cacao")).toBe("cacao");
  });

  it("solo admite los valores presente y ausente", () => {
    expect(VALORES_ALERGENO).toEqual(["presente", "ausente"]);

    for (const valor of VALORES_ALERGENO) {
      expect(esValorAlergeno(valor)).toBe(true);
    }

    for (const candidato of [
      "",
      "PRESENTE",
      "Presente",
      "presente ",
      "posible",
      "ausente ",
      "desconocido",
      "1",
    ]) {
      expect(
        esValorAlergeno(candidato),
        `no debería aceptar «${candidato}»`,
      ).toBe(false);
    }
  });

  it("avisa de la ausencia de alérgenos sin presentarla como certificación", () => {
    expect(AVISO_SIN_ALERGENOS_DETECTADOS).toContain("No se ha detectado");
    expect(AVISO_SIN_ALERGENOS_DETECTADOS).toContain("14");

    // Cualquier mención a una garantía debe ir negada: el aviso explica qué se
    // ha revisado, pero no promete seguridad (CA-RF12-06).
    for (const frase of AVISO_SIN_ALERGENOS_DETECTADOS.split(".")) {
      if (!/[a-záéíóúñ]/iu.test(frase)) {
        continue;
      }
      for (const garantia of ["certific", "garantiz", "libre de", "seguro"]) {
        if (frase.toLowerCase().includes(garantia)) {
          expect(
            sinTildes(frase),
            `«${frase.trim()}» afirma una garantía sin negarla`,
          ).toMatch(/no\b/);
        }
      }
    }
  });

  it("detecta vocabulario sin traducir, para que esa comprobación no sea vacua", () => {
    expect(PALABRAS_SIN_TRADUCIR.test("gluten")).toBe(false);
    expect(PALABRAS_SIN_TRADUCIR.test("allergy")).toBe(true);
    expect(PALABRAS_SIN_TRADUCIR.test("Crustáceos")).toBe(false);
  });
});
