# `infraestructura/correo`

Envío de correo en español para verificación y recuperación.

## Responsabilidades

- Plantillas de verificación de correo y de recuperación de contraseña, siempre
  en español (RNF-4).
- Envío con la configuración SMTP de `obtenerConfiguracion()`, con remitente
  desde `SMTP_FROM`.
- Mensajes genéricos: el comensal no puede saber si una cuenta existe
  (CE-11, CE-14).
- Un enlace usado dos veces o caducado muestra un mensaje en español y permite
  pedir uno nuevo (CE-18).

## Reglas

- `SMTP_PASSWORD` solo se lee en el servidor y nunca se registra.
- El enlace de un solo uso se valida en el servidor, no en el cliente.
- SMTP se configura en Supabase para garantizar la entrega (plan §4).
