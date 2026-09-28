import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";
import { Indicador } from "./fixtures/Indicador";

/**
 * Comprueba que el arnés de pruebas de componentes (T-003) permite renderizar,
 * consultar por rol, interactuar y auditar la accesibilidad.
 */
describe("pruebas de componentes", () => {
  it("renderiza el texto visible en español", () => {
    render(<Indicador />);

    expect(
      screen.getByRole("heading", { name: "Alérgenos pendientes de confirmar" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("No quedan alérgenos pendientes de confirmar."),
    ).toBeInTheDocument();
  });

  it("responde a la interacción del usuario", async () => {
    const usuario = userEvent.setup();
    render(<Indicador />);

    await usuario.click(
      screen.getByRole("button", { name: "Marcar otro alérgeno pendiente" }),
    );

    expect(
      screen.getByText("Quedan 1 alérgenos pendientes de confirmar."),
    ).toBeInTheDocument();
  });

  it("parte del número de pendientes recibido", () => {
    render(<Indicador iniciales={3} />);

    expect(
      screen.getByText("Quedan 3 alérgenos pendientes de confirmar."),
    ).toBeInTheDocument();
  });

  it("no presenta violaciones de accesibilidad", async () => {
    const { container } = render(<Indicador />);

    const resultado = await axe(container);

    expect(resultado).toHaveNoViolations();
  });
});
