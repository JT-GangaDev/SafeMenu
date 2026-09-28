# `pruebas/integracion`

Adaptadores, base de datos y correo.

## Responsabilidades

- Comprobar los adaptadores de OpenAI, QR, correo y Supabase contra la interfaz
  que define el dominio.
- Verificar restricciones reales de la base de datos: 14 valores por evaluación,
  claves únicas, rangos de precio y políticas RLS (CE-28).
- Confirmar que una instantánea se crea de forma atómica y transaccional
  (RNF-8).

## Reglas

- Se ejecutan contra dependencias falsas o un entorno de pruebas, nunca contra
  producción.
- Requieren credenciales de desarrollo; si faltan, se saltan dejando constancia
  del motivo, nunca se simula un aprobado.
