import { describe, expect, it } from "vitest";
import { crearQrDePrueba, FIRMA_PNG } from "./qr";

const PUBLICO = "https://safemenu.example/m/casa-pepa";

function firma(png: Uint8Array): number[] {
  return [...png.slice(0, FIRMA_PNG.length)];
}

describe("doble de QR", () => {
  it("devuelve una imagen PNG que empieza por su firma", async () => {
    const qr = crearQrDePrueba();

    const { png } = await qr.generar({ direccion: PUBLICO });

    expect(png).toBeInstanceOf(Uint8Array);
    expect(firma(png)).toEqual([...FIRMA_PNG]);
    expect(png.byteLength).toBeGreaterThan(FIRMA_PNG.length);
  });

  it("devuelve siempre la misma imagen para la misma dirección", async () => {
    const primera = await crearQrDePrueba().generar({ direccion: PUBLICO });
    const segunda = await crearQrDePrueba().generar({ direccion: PUBLICO });

    expect(Array.from(primera.png)).toEqual(Array.from(segunda.png));
  });

  it("registra las llamadas para comprobar que el QR no cambia", async () => {
    const qr = crearQrDePrueba();

    await qr.generar({ direccion: PUBLICO });
    await qr.generar({ direccion: PUBLICO });

    expect(qr.llamadas).toEqual([{ direccion: PUBLICO }, { direccion: PUBLICO }]);
  });

  it("falla en español cuando la generación falla", async () => {
    const qr = crearQrDePrueba({ escenario: "fallo" });

    await expect(qr.generar({ direccion: PUBLICO })).rejects.toThrowError(
      "No se pudo generar el código QR.",
    );
  });

  it("deja constancia del intento aunque la generación falle", async () => {
    const qr = crearQrDePrueba({ escenario: "fallo" });

    await expect(qr.generar({ direccion: PUBLICO })).rejects.toThrowError();

    expect(qr.llamadas).toEqual([{ direccion: PUBLICO }]);
  });

  it("rechaza una dirección vacía con un error en español", async () => {
    const qr = crearQrDePrueba();

    await expect(qr.generar({ direccion: "  " })).rejects.toThrowError(
      "La dirección del código QR no puede estar vacía.",
    );
  });

  it("falla siempre con el escenario de fallo y nunca con el correcto, para que la comprobación no sea vacía", async () => {
    const correcto = await crearQrDePrueba().generar({ direccion: PUBLICO });
    const fallo = crearQrDePrueba({ escenario: "fallo" });

    expect(correcto.png.byteLength).toBeGreaterThan(0);
    await expect(fallo.generar({ direccion: PUBLICO })).rejects.toThrowError();
  });
});
