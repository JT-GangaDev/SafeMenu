# `pruebas/e2e`

Flujos completos en el navegador, con Playwright.

## Contenido

- `portada.spec.ts`: comprobación de humo, idioma español y accesibilidad con
  axe.
- El resto de flujos se añadirán con la tarea que implemente cada `CA` de
  navegador: T-022, T-030, T-038, T-047 y T-053.

## Reglas

- Compilan y arrancan la aplicación real con `npm run build && npm run start`.
- Usan el Chromium de Playwright; si no se puede descargar, se reutiliza el
  navegador del sistema con `PLAYWRIGHT_CHANNEL=chrome`.
- Los selectores nunca dependen del color ni de la posición en la pantalla.
