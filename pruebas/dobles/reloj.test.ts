import { describe, expect, it } from "vitest";
import { crearRelojDePrueba } from "./reloj";

const INICIO = new Date("2026-01-01T10:00:00.000Z");

describe("doble de reloj", () => {
  it("no deja avanzar el tiempo por sí solo", () => {
    const { reloj } = crearRelojDePrueba({ ahora: INICIO });

    expect(reloj.ahora()).toEqual(INICIO);
  });

  it("avanza el tiempo cuando la prueba lo ordena", () => {
    const { reloj, avanzar } = crearRelojDePrueba({ ahora: INICIO });

    avanzar(90_000);

    expect(reloj.ahora()).toEqual(new Date("2026-01-01T10:01:30.000Z"));
  });

  it("devuelve una copia de la fecha para que nadie la modifique por fuera", () => {
    const { reloj, avanzar } = crearRelojDePrueba({ ahora: INICIO });

    const primera = reloj.ahora();
    primera.setUTCFullYear(2030);

    avanzar(1000);

    expect(reloj.ahora()).toEqual(new Date("2026-01-01T10:00:01.000Z"));
  });

  it("rechaza un plazo negativo con un error en español", () => {
    const { reloj } = crearRelojDePrueba({ ahora: INICIO });

    expect(() => reloj.dormir(-1)).toThrowError(
      "No se puede dormir un plazo negativo.",
    );
  });

  it("resuelve sin esperar cuando el plazo es cero", async () => {
    const { reloj } = crearRelojDePrueba({ ahora: INICIO });

    await reloj.dormir(0);

    expect(reloj.ahora()).toEqual(INICIO);
  });

  it("no resuelve la espera hasta que vence el plazo", async () => {
    const { reloj, avanzar } = crearRelojDePrueba({ ahora: INICIO });
    let resuelta = false;

    const espera = reloj.dormir(10_000).then(() => {
      resuelta = true;
    });

    avanzar(9_999);
    await Promise.resolve();

    expect(resuelta).toBe(false);

    avanzar(1);
    await espera;

    expect(resuelta).toBe(true);
  });

  it("resuelve en orden cuando vencen varias esperas a la vez", async () => {
    const { reloj, avanzar } = crearRelojDePrueba({ ahora: INICIO });
    const orden: string[] = [];

    const corta = reloj.dormir(1000).then(() => orden.push("corta"));
    const larga = reloj.dormir(5000).then(() => orden.push("larga"));

    avanzar(5000);
    await Promise.all([corta, larga]);

    expect(orden).toEqual(["corta", "larga"]);
  });

  it("usa la hora actual real cuando la prueba no indica un inicio", () => {
    const antes = Date.now();
    const { reloj } = crearRelojDePrueba();
    const despues = Date.now();

    const marca = reloj.ahora().getTime();

    expect(marca).toBeGreaterThanOrEqual(antes);
    expect(marca).toBeLessThanOrEqual(despues);
  });

  it("detecta los dos intervalos inválidos, para que la comprobación no sea vacía", () => {
    const { reloj, avanzar } = crearRelojDePrueba({ ahora: INICIO });
    const problemas: string[] = [];

    for (const accion of [() => reloj.dormir(-1), () => avanzar(-1)]) {
      try {
        accion();
      } catch (problema) {
        problemas.push((problema as Error).message);
      }
    }

    expect(problemas).toEqual([
      "No se puede dormir un plazo negativo.",
      "No se puede avanzar con un intervalo negativo.",
    ]);
  });
});
