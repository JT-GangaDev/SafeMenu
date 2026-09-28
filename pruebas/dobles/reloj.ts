import type { Reloj } from "./contrato";

/** Reloj de prueba y el mando para avanzar el tiempo virtual. */
export interface RelojDePrueba {
  readonly reloj: Reloj;
  avanzar(milisegundos: number): void;
}

interface EsperaPendiente {
  readonly vencimiento: number;
  readonly resolver: () => void;
}

/**
 * T-006. Reloj controlado para probar el tiempo de espera de 10 segundos
 * (CA-RF6-05, CE-5) y la caducidad de sesión de 30 minutos, sin esperar de
 * verdad y sin `vi.useFakeTimers()` dentro del código que se prueba.
 */
export function crearRelojDePrueba(opciones: { ahora?: Date } = {}): RelojDePrueba {
  let actual = new Date(opciones.ahora ?? Date.now());
  let pendientes: EsperaPendiente[] = [];

  const dormir = (milisegundos: number): Promise<void> => {
    if (milisegundos < 0) {
      throw new Error("No se puede dormir un plazo negativo.");
    }

    if (milisegundos === 0) {
      return Promise.resolve();
    }

    return new Promise<void>((resolver) => {
      pendientes.push({ vencimiento: actual.getTime() + milisegundos, resolver });
    });
  };

  const avanzar = (milisegundos: number): void => {
    if (milisegundos < 0) {
      throw new Error("No se puede avanzar con un intervalo negativo.");
    }

    actual = new Date(actual.getTime() + milisegundos);
    const vencidas = pendientes.filter((espera) => espera.vencimiento <= actual.getTime());

    pendientes = pendientes.filter((espera) => espera.vencimiento > actual.getTime());

    for (const vencida of vencidas) {
      vencida.resolver();
    }
  };

  return {
    reloj: { ahora: () => new Date(actual.getTime()), dormir },
    avanzar,
  };
}
