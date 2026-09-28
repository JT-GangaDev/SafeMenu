# `pruebas/componentes`

Componentes y accesibilidad, con sus propios ayudantes.

## Contenido

- `preparacion.ts`: jest-dom, el matcher de axe y la limpieza del DOM.
- `fixtures/`: componentes mínimos usados como base de las pruebas.
- Pruebas de renderizado, interacción, textos en español y auditoría axe.

## Reglas

- Se ejecutan en el proyecto `componentes` de Vitest, con entorno jsdom.
- Sin `globals: true`: la limpieza se registra a mano en `preparacion.ts`.
- Toda acción debe ser identificable sin depender solo del color (RNF-5).
