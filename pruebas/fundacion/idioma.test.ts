import { describe, expect, it } from "vitest";
import { leerTexto } from "../helpers/proyecto";

/** RNF-4: la documentación y los mensajes visibles están en español. */
describe("idioma de la interfaz y la documentación", () => {
  const layout = leerTexto("app/layout.tsx");
  const pagina = leerTexto("app/page.tsx");

  it("declara el español como idioma del documento", () => {
    expect(layout).toMatch(/<html[^>]*lang="es"/);
  });

  it("no incluye la portada en inglés de create-next-app", () => {
    for (const textoIngles of [
      "Get started",
      "Deploy now",
      "Learn more",
      "Create Next App",
      "Edit src/app/page.tsx",
    ]) {
      expect(pagina, `texto en inglés pendiente: ${textoIngles}`).not.toContain(textoIngles);
      expect(layout, `texto en inglés pendiente: ${textoIngles}`).not.toContain(textoIngles);
    }
  });

  it("titula la aplicación en español", () => {
    expect(layout).toContain("SafeMenu");
    expect(layout).not.toMatch(/title:\s*"Create Next App"/);
  });

  it("documenta el proyecto en español", () => {
    const agentes = leerTexto("AGENTS.md");
    expect(agentes).toContain("npm run test");
    expect(agentes).toContain("npm run lint");
    expect(agentes).toContain("npm run build");
  });
});
