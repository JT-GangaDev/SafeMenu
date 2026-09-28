# `pruebas/dominio`

Reglas del dominio sin renderizar interfaz.

## Contenido

- `alergenos/`: catálogo de 14 códigos, valores y errores.
- `comun/`: estados de platos y restaurantes y su código interno.

## Reglas

- Se ejecutan en el proyecto `dominio` de Vitest, en Node y sin DOM: es la
  demostración de RNF-10.
- Cada función probada cubre éxito, error y casos límite.
- El dominio no se simula: se importa directamente, para detectar cualquier
  dependencia prohibida.
