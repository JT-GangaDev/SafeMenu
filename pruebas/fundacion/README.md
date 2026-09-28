# `pruebas/fundacion`

Pruebas de la base del proyecto: arnés, estructura, codificación y aislamiento.

## Contenido

- `arnes.test.ts`: proyectos de Vitest y configuración de Playwright.
- `estructura.test.ts`: App Router en la raíz, sin `src/` ni Tailwind.
- `capas.test.ts`: el árbol de `docs/plan.md` §3 coincide con el disco y cada
  capa respeta sus dependencias.
- `codificacion.test.ts`: ningún archivo se guarda dos veces como UTF-8.
- `aislamiento.test.ts`: el dominio no importa interfaz, Next.js ni entorno.
- `dependencias.test.ts`, `idioma.test.ts`, `paquetes.test.ts` y `tipos.test.ts`.

## Reglas

- Se ejecutan en el proyecto `dominio` de Vitest, en Node y sin DOM.
- Toda comprobación tiene una prueba que demuestra que falla cuando debe, para
  no pasar sin comprobar nada.
