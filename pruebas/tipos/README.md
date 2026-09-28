# `pruebas/tipos`

Declaraciones de tipos de librerías que no los incluyen.

## Contenido

- `axe.d.ts`: tipos mínimos de `jest-axe` como declaración ambiental.
- `matchers.d.ts`: aumento de `Assertion` de Vitest con `toHaveNoViolations`.

## Reglas

- Aquí no se describen tipos de negocio: el dominio los declara en su módulo.
- Solo se declara lo que hace falta; si un paquete tipa bien, no se copia nada.
- Un paquete que exige `@types/jest` no se instala: choca con Vitest.
