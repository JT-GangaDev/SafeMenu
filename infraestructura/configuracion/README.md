# `infraestructura/configuracion`

Lectura y validación de variables del servidor.

## Contenido

- `entorno.ts`: `obtenerConfiguracion()` y `variablesPublicas()`, la única vía
  para leer el entorno y la única para exponer datos al navegador.

## Reglas

- Fuera de este módulo no se usa `process.env`; lo comprueba
  `pruebas/entorno/secretos.test.ts`.
- `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY` y `SMTP_PASSWORD` nunca salen del
  servidor (RNF-2).
- `NEXT_PUBLIC_URL` es el único valor que llega al cliente, y solo a través de
  `variablesPublicas()`.
- El fallo de configuración se informa en español y nunca muestra el valor
  recibido ni los nombres de variables secretas en registros.
