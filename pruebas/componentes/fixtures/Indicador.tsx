"use client";

import { useState } from "react";

/**
 * Componente de ejemplo para comprobar el arnés de pruebas de componentes
 * (T-003). Sigue RNF-5: la información se transmite con texto, no solo con
 * color, y cada acción tiene un nombre accesible.
 */
export interface IndicadorProps {
  iniciales?: number;
}

export function Indicador({ iniciales = 0 }: IndicadorProps) {
  const [pendientes, setPendientes] = useState(iniciales);

  return (
    <section aria-labelledby="titulo-indicador">
      <h2 id="titulo-indicador">Alérgenos pendientes de confirmar</h2>
      <p role="status">
        {pendientes === 0
          ? "No quedan alérgenos pendientes de confirmar."
          : `Quedan ${pendientes} alérgenos pendientes de confirmar.`}
      </p>
      <button
        type="button"
        onClick={() => setPendientes((actual) => actual + 1)}
      >
        Marcar otro alérgeno pendiente
      </button>
    </section>
  );
}
