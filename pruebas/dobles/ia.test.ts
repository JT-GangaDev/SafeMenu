import { describe, expect, it } from "vitest";
import { CLAVES_EXTERNAS, CAMPOS_EXTERNOS } from "./contrato";
import {
  crearIaDePrueba,
  ESCENARIOS_IA,
  textoAnalisisValido,
  textoSinAlergenos,
  textoConTodosLosAlergenos,
} from "./ia";

const ENTRADA = {
  nombre: "Patatas bravas",
  descripcion: "Patata frita con pimentón y sal. Puede contener trazas de sulfitos.",
};

function cuerpo(texto: string): Record<string, unknown> {
  return JSON.parse(texto) as Record<string, unknown>;
}

describe("doble de IA", () => {
  it("devuelve los 14 alérgenos cuando el escenario es válido", async () => {
    const ia = crearIaDePrueba({ escenario: "valida" });

    const respuesta = await ia.analizar(ENTRADA);
    const carga = cuerpo(respuesta.texto) as Record<string, unknown>;
    const alergenos = carga[CAMPOS_EXTERNOS.alergenos] as Record<string, unknown>;

    expect(respuesta.estado).toBe(200);
    expect(Object.keys(alergenos)).toHaveLength(14);
    expect(
      Object.values(alergenos).filter(
        (valor) => valor !== "present" && valor !== "absent",
      ),
    ).toEqual([]);
  });

  it("entrega el texto crudo, porque una clave repetida se pierde al parsear", async () => {
    const ia = crearIaDePrueba({ escenario: "clave_repetida" });

    const respuesta = await ia.analizar(ENTRADA);
    const apariciones = respuesta.texto.split('"eggs"').length - 1;

    expect(apariciones).toBe(2);
    expect(
      Object.keys(cuerpo(respuesta.texto)[CAMPOS_EXTERNOS.alergenos] as object),
    ).toHaveLength(14);
  });

  it("omite un alérgeno cuando el escenario lo pide", async () => {
    const ia = crearIaDePrueba({ escenario: "clave_ausente" });

    const respuesta = await ia.analizar(ENTRADA);
    const alergenos = cuerpo(respuesta.texto)[CAMPOS_EXTERNOS.alergenos] as Record<string, unknown>;

    expect(Object.keys(alergenos)).toHaveLength(13);
    expect(respuesta.texto).not.toContain('"molluscs"');
  });

  it("añade un alérgeno que no está permitido", async () => {
    const ia = crearIaDePrueba({ escenario: "clave_adicional" });

    const respuesta = await ia.analizar(ENTRADA);
    const alergenos = cuerpo(respuesta.texto)[CAMPOS_EXTERNOS.alergenos] as Record<string, unknown>;

    expect(Object.keys(alergenos)).toHaveLength(15);
    expect(Object.keys(alergenos)).toContain("pepinos");
  });

  it("devuelve un valor que no es presencia ni ausencia", async () => {
    const ia = crearIaDePrueba({ escenario: "valor_invalido" });

    const respuesta = await ia.analizar(ENTRADA);
    const alergenos = cuerpo(respuesta.texto)[CAMPOS_EXTERNOS.alergenos] as Record<string, unknown>;

    expect(alergenos.eggs).toBe("maybe");
  });

  it("devuelve una respuesta vacía o un texto que no es JSON", async () => {
    const vacia = await crearIaDePrueba({ escenario: "respuesta_vacia" }).analizar(ENTRADA);
    const rota = await crearIaDePrueba({ escenario: "json_invalido" }).analizar(ENTRADA);

    expect(vacia.texto).toBe("");
    expect(() => cuerpo(rota.texto)).toThrowError();
  });

  it("devuelve un estado de error del servicio", async () => {
    const respuesta = await crearIaDePrueba({ escenario: "error_http" }).analizar(ENTRADA);

    expect(respuesta.estado).toBe(500);
  });

  it("falla como una caída de conexión cuando no hay red", async () => {
    const ia = crearIaDePrueba({ escenario: "error_red" });

    await expect(ia.analizar(ENTRADA)).rejects.toThrowError(
      "No hay conexión con el servicio de IA.",
    );
  });

  it("añade advertencias sin tocar los 14 valores", async () => {
    const ambigua = await crearIaDePrueba({ escenario: "advertencia_ambigua" }).analizar(ENTRADA);
    const contradictoria = await crearIaDePrueba({ escenario: "advertencia_contradictoria" }).analizar(ENTRADA);

    for (const respuesta of [ambigua, contradictoria]) {
      const carga = cuerpo(respuesta.texto);
      const advertencias = carga[CAMPOS_EXTERNOS.advertencias] as string[];

      expect(Object.keys(carga[CAMPOS_EXTERNOS.alergenos] as object)).toHaveLength(14);
      expect(advertencias.length).toBeGreaterThan(0);
      expect(advertencias[0]).toMatch(/[áéíóúñ]/u);
    }

    expect(
      (cuerpo(ambigua.texto)[CAMPOS_EXTERNOS.advertencias] as string[])[0],
    ).toContain("puede contener");
  });

  it("devuelve un plato en un idioma no admitido", async () => {
    const ia = crearIaDePrueba({ escenario: "texto_en_ingles" });

    const respuesta = await ia.analizar({
      nombre: "Fried potatoes",
      descripcion: "Potatoes fried with paprika. May contain traces of sulphites.",
    });
    const carga = cuerpo(respuesta.texto);

    expect(carga[CAMPOS_EXTERNOS.idioma]).toBe("en");
    expect(carga[CAMPOS_EXTERNOS.advertencias] as string[]).toHaveLength(1);
  });

  it("recibe el nombre y la descripción juntos y registra las llamadas", async () => {
    const ia = crearIaDePrueba();

    await ia.analizar(ENTRADA);
    await ia.analizar({ nombre: "Lentejas", descripcion: "Lentejas con verduras." });

    expect(ia.llamadas).toEqual([
      ENTRADA,
      { nombre: "Lentejas", descripcion: "Lentejas con verduras." },
    ]);
  });

  it("rechaza un escenario desconocido con un error en español", () => {
    expect(() => crearIaDePrueba({ escenario: "ausencias" as never })).toThrowError(
      "El escenario de IA desconocido no está previsto: ausencias",
    );
  });

  it("cubre todos los escenarios declarados, para que la comprobación no sea vacía", async () => {
    expect(ESCENARIOS_IA.length).toBeGreaterThan(0);
    expect(new Set(ESCENARIOS_IA).size).toBe(ESCENARIOS_IA.length);

    const respuestas = new Set<string>();

    for (const escenario of ESCENARIOS_IA) {
      respuestas.add(
        await crearIaDePrueba({ escenario })
          .analizar(ENTRADA)
          .then(
            (respuesta) => `${respuesta.estado}:${respuesta.texto}`,
            (error: Error) => `fallo:${error.message}`,
          ),
      );
    }

    expect(respuestas.size).toBe(ESCENARIOS_IA.length);
  });

  it("construye cargas válidas a partir del catálogo", () => {
    const porDefecto = textoAnalisisValido();
    const modificado = textoAnalisisValido({ huevos: "presente" });
    const sinAlergenos = cuerpo(textoSinAlergenos());
    const conTodos = cuerpo(textoConTodosLosAlergenos());

    expect(Object.keys(cuerpo(modificado)[CAMPOS_EXTERNOS.alergenos] as object)).toEqual(
      CLAVES_EXTERNAS,
    );
    expect(
      (cuerpo(modificado)[CAMPOS_EXTERNOS.alergenos] as Record<string, unknown>).eggs,
    ).toBe("present");
    expect(
      (cuerpo(porDefecto)[CAMPOS_EXTERNOS.alergenos] as Record<string, unknown>).eggs,
    ).toBe("absent");
    expect(Object.values(sinAlergenos[CAMPOS_EXTERNOS.alergenos] as object)).toEqual(
      Array<string>(14).fill("absent"),
    );
    expect(Object.values(conTodos[CAMPOS_EXTERNOS.alergenos] as object)).toEqual(
      Array<string>(14).fill("present"),
    );
  });
});
