# `pruebas/helpers`

Utilidades compartidas por las pruebas.

## Contenido

- `proyecto.ts`: raíz del proyecto, lectura de `package.json`, `tsconfig.json` y
  de cualquier archivo del repositorio.

## Reglas

- Solo lectura: los ayudantes no modifican nada.
- No dependen de React ni de servicios externos, para que sirvan en el proyecto
  `dominio` de Vitest.
- Los nombres y los mensajes de error están en español.
