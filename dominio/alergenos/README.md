# `dominio/alergenos`

Catálogo, valores, advertencias y reglas de alérgenos.

## Contenido

- `catalogo.ts`: los 14 códigos, sus etiquetas en español y los valores
  `presente` y `ausente`. Es la fuente de verdad: no se duplican en ninguna otra
  capa.
- `errores.ts`: errores de análisis, revisión y confirmación, con su mensaje en
  español y si permiten reintentar.

## Reglas

- Solo se persisten conjuntos de exactamente 14 valores validados; una clave
  repetida, ausente o adicional rechaza el resultado completo (CA-RF6-03).
- Un fallo o un tiempo de espera agotado nunca producen ausencia de alérgenos
  (CA-RF6-05, CE-5).
- La ausencia de alérgenos nunca se presenta como certificación (CA-RF12-06).
- Nada de aquí importa React, Next.js, el entorno o `infraestructura/`.
