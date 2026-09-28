import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";

/**
 * RNF-5: cada icono y cada acción necesita texto y operación accesible.
 * Este archivo contiene un componente deliberadamente inaccesible para
 * demostrar que la comprobación de accesibilidad detecta los fallos y no pasa
 * siempre por alto nada.
 */
function InterfazInaccesible() {
  return (
    <section>
      <h2>
        <span aria-hidden="true">⚠</span>
      </h2>
      <button type="button">
        <span aria-hidden="true">✕</span>
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- la imagen sin alt forma parte de la accesibilidad que se quiere demostrar */}
      <img src="/imagen.png" />
    </section>
  );
}

describe("comprobación de accesibilidad", () => {
  it("detecta acciones e imágenes sin texto alternativo", async () => {
    const { container } = render(<InterfazInaccesible />);

    const resultado = await axe(container);

    const identificadores = resultado.violations.map(
      (violacion) => violacion.id,
    );
    expect(identificadores).toContain("button-name");
    expect(identificadores).toContain("image-alt");
    expect(resultado).not.toHaveNoViolations();
  });

  it("señala cada incumplimiento con su explicación en el informe", async () => {
    const { container } = render(<InterfazInaccesible />);

    const resultado = await axe(container);

    const botonSinNombre = resultado.violations.find(
      (violacion) => violacion.id === "button-name",
    );
    expect(botonSinNombre?.help).toBeTruthy();
    expect(botonSinNombre?.nodes.length).toBeGreaterThan(0);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
