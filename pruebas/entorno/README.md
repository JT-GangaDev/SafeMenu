# `pruebas/entorno`

Variables de entorno y secretos de servidor.

## Contenido

- `entorno.test.ts`: validación de variables requeridas, URL pública, SMTP y
  error en español sin mostrar valores.
- `secretos.test.ts`: comprueba que solo `infraestructura/configuracion/entorno.ts`
  usa `process.env` y que el cliente no expone claves.

## Reglas

- Ninguna prueba imprime ni compara valores de entorno reales.
- `.env.local` y `.env` no se versionan (`.gitignore`, RNF-2).
- Los mensajes de fallo están en español y describen la variable que falta sin
  revelar su valor.
