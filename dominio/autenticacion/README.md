# `dominio/autenticacion`

Reglas de sesión, acceso y aislamiento entre restaurantes.

## Responsabilidades

- Alta de cuenta con un único restaurante, todo en una transacción.
- Bloqueo del panel hasta verificar el correo y reenvío de enlaces caducados
  (CE-13, CE-18).
- Cierre de sesión, caducidad por inactividad de 30 minutos y revocación de
  sesiones al recuperar la contraseña.
- Obtención del `restaurante_id` desde la sesión: nunca se acepta como autoridad
  del cliente (CE-28).
- Mensajes genéricos para duplicados, recuperación y credenciales inválidas, sin
  revelar si una cuenta existe (CE-11, CE-14).

## Reglas

- Nada de secretos en el cliente: las credenciales viven en el servidor
  (RNF-2).
- El dominio define las reglas; el proveedor de autenticación y sus políticas se
  conectan en `infraestructura/`.
