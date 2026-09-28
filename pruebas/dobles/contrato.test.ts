import { describe, expect, it } from "vitest";
import { CLAVES_EXTERNAS, TRADUCCION_CLAVES } from "./contrato";
import { CODIGOS_ALERGENO } from "../../dominio/alergenos/catalogo";

describe("contrato de los dobles de prueba", () => {
  it("relaciona las 14 claves externas con los 14 códigos del dominio", () => {
    expect(CLAVES_EXTERNAS).toHaveLength(14);
    expect(Object.keys(TRADUCCION_CLAVES)).toHaveLength(14);
  });

  it("no repite ninguna clave externa", () => {
    expect(new Set(CLAVES_EXTERNAS).size).toBe(CLAVES_EXTERNAS.length);
  });

  it("cubre todos los códigos de alérgenos, ni uno más ni uno menos", () => {
    const traducidos = Object.values(TRADUCCION_CLAVES);

    expect(traducidos.sort()).toEqual([...CODIGOS_ALERGENO].sort());
  });

  it("mantiene el mismo orden que el catálogo, para que la comparación sea estable", () => {
    const enOrdenDeCatalogo = CLAVES_EXTERNAS.map(
      (clave) => TRADUCCION_CLAVES[clave],
    );

    expect(enOrdenDeCatalogo).toEqual([...CODIGOS_ALERGENO]);
  });

  it("no traduce una clave externa que no esté en la tabla", () => {
    const candidatas: string[] = [...CLAVES_EXTERNAS, "pepinos"];

    expect(
      candidatas.filter((clave) => clave in TRADUCCION_CLAVES),
    ).toEqual([...CLAVES_EXTERNAS]);
  });
});
