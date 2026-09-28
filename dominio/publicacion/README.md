# `dominio/publicacion`

Elegibilidad, publicación e instantáneas del menú.

## Responsabilidades

- Decidir si un menú puede publicarse: al menos un plato publicable y todos los
  incluidos completos, confirmados y sin advertencias sin resolver
  (CA-RF8-01, CA-RF8-02).
- Crear instantáneas inmutables de forma transaccional y atómica (RNF-8).
- Despublicar conservando la última instantánea para una publicación posterior
  (CA-RF8-05).
- Mantener estable la dirección pública y el QR tras la primera publicación.

## Reglas

- Si no queda ningún plato visible, el menú se bloquea o queda no disponible,
  nunca vacío (CA-RF8-06, CE-17).
- Un fallo al generar el QR no deshace la publicación (CA-RF10-04, CE-21).
- La vista pública solo lee la instantánea activa: nunca borradores ni datos
  privados (RNF-3).
