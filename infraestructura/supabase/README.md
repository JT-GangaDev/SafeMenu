# `infraestructura/supabase`

Cliente, migraciones y políticas de seguridad.

## Responsabilidades

- Cliente de servidor con credenciales de servicio para operaciones
  privilegiadas y credenciales de cliente para las políticas RLS.
- Migraciones del modelo de datos de `docs/plan.md` §5: `restaurantes`,
  `categorias`, `platos`, `versiones_platos`, `evaluaciones_alergenos`,
  `valores_alergenos` y `publicaciones`.
- Restricciones: exactamente 14 valores `presente`/`ausente` por evaluación,
  nombres únicos y rangos de precio.
- Políticas RLS que bloquean lecturas y escrituras entre restaurantes
  (CA-RF3-02, CA-RF3-03, CE-28).

## Reglas

- `SUPABASE_SERVICE_ROLE_KEY` no se usa desde el navegador (RNF-2).
- Las instantáneas se escriben en una transacción: nunca sustituyen a la
  anterior si fallan (RNF-8).
- El `restaurante_id` se toma de la sesión, nunca del cliente.
