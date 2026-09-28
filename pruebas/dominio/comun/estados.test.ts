import { describe, expect, it } from "vitest";
import {
  ESTADO_POR_CODIGO,
  ESTADOS,
  ESTADOS_PLATO,
  ESTADOS_RESTAURANTE,
  codigoDeEstado,
  esEstadoPlato,
  esEstadoRestaurante,
  estadoDesdeCodigo,
} from "@/dominio/comun/estados";

/**
 * T-004. Estados del plato y del restaurante (RF-7, RF-8, RF-12; RNF-1, RNF-4).
 *
 * El valor de dominio es el que ve el restaurante, en español; el código
 * interno es el que se guarda en la base de datos, sin espacios ni tildes.
 */

const ESTADOS_ESPERADOS = [
  "borrador",
  "verificación pendiente",
  "confirmado",
  "oculto",
  "no publicado",
  "publicado",
];

describe("estados del dominio", () => {
  it("expone exactamente los seis estados, sin repetidos", () => {
    expect([...ESTADOS]).toEqual(ESTADOS_ESPERADOS);
    expect(new Set(ESTADOS).size).toBe(6);
  });

  it("reparte los estados entre platos y restaurantes sin solaparlos", () => {
    expect([...ESTADOS_PLATO]).toEqual([
      "borrador",
      "verificación pendiente",
      "confirmado",
      "oculto",
    ]);
    expect([...ESTADOS_RESTAURANTE]).toEqual(["no publicado", "publicado"]);

    const estadosRestaurante: readonly string[] = ESTADOS_RESTAURANTE;
    const solapados = ESTADOS_PLATO.filter((estado) =>
      estadosRestaurante.includes(estado),
    );
    expect(solapados).toEqual([]);
    expect(ESTADOS_PLATO.length + ESTADOS_RESTAURANTE.length).toBe(6);
  });

  it("distingue un estado de plato de uno de restaurante", () => {
    for (const estado of ESTADOS_PLATO) {
      expect(esEstadoPlato(estado)).toBe(true);
    }
    for (const estado of ESTADOS_RESTAURANTE) {
      expect(esEstadoRestaurante(estado)).toBe(true);
      expect(esEstadoPlato(estado)).toBe(false);
    }

    for (const candidato of [
      "",
      "Borrador",
      "borrador ",
      "publicado ",
      "verificacion pendiente",
      "verificación-pendiente",
    ]) {
      expect(
        esEstadoPlato(candidato) || esEstadoRestaurante(candidato),
        `no debería aceptar «${candidato}»`,
      ).toBe(false);
    }
  });

  it("escribe códigos internos sin espacios, tildes ni mayúsculas", () => {
    for (const estado of ESTADOS) {
      const codigo = codigoDeEstado(estado);

      expect(codigo).toMatch(/^[a-z_]+$/);
      expect(codigo).not.toMatch(/[áéíóúñü ]/u);
    }

    expect(codigoDeEstado("verificación pendiente")).toBe(
      "verificacion_pendiente",
    );
    expect(codigoDeEstado("no publicado")).toBe("no_publicado");
  });

  it("vuelve del código interno al estado sin perder información", () => {
    for (const estado of ESTADOS) {
      const codigo = codigoDeEstado(estado);
      expect(estadoDesdeCodigo(codigo)).toBe(estado);
      expect(ESTADO_POR_CODIGO[codigo as keyof typeof ESTADO_POR_CODIGO]).toBe(
        estado,
      );
    }
  });

  it("devuelve null ante un código desconocido, vacío o sin traducir", () => {
    for (const candidato of [
      "",
      "  ",
      "BORRADOR",
      "verificacion pendiente",
      "verificación_pendiente",
      "publicados",
      "oculto_menor",
      "confirmado ",
    ]) {
      expect(
        estadoDesdeCodigo(candidato),
        `no debería reconocer «${candidato}»`,
      ).toBeNull();
    }
  });

  it("reconoce el código interno de un estado sin espacios, que coincide con él", () => {
    for (const estado of ["borrador", "confirmado", "oculto", "publicado"] as const) {
      expect(codigoDeEstado(estado)).toBe(estado);
      expect(estadoDesdeCodigo(estado)).toBe(estado);
    }
  });

  it("falla si un estado no tiene código interno, para que la tabla sea completa", () => {
    const estados = ["borrador", "verificación pendiente"] as const;

    for (const estado of estados) {
      expect(
        Object.values(ESTADO_POR_CODIGO),
        `falta el código interno de «${estado}»`,
      ).toContain(estado);
    }

    expect(Object.keys(ESTADO_POR_CODIGO)).toHaveLength(6);
  });
});
