# `dominio/platos`

Versión, edición y transiciones de estado de los platos.

## Responsabilidades

- Nombre, descripción, categoría y precio en céntimos enteros.
- Versionado: un cambio de nombre o descripción crea una versión nueva e
  invalida el análisis y la confirmación anteriores; un cambio de precio,
  categoría u orden conserva la verificación vigente (CA-RF6-09, CA-RF7-05).
- Transiciones entre los estados `borrador`, `verificación pendiente`,
  `confirmado` y `oculto`, definidos en `dominio/comun/estados.ts`.
- Restauración de un plato oculto usando una versión verificable.

## Reglas

- Un plato publicado solo puede ocultarse, nunca eliminarse (CE-16).
- Un fallo de análisis no puede dejar el plato verificado ni publicar una carta
  parcial (CA-RF11-05, RNF-8).
