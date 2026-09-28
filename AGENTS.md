# AGENTS.md — SafeMenu

Guía para agentes que trabajan en este repositorio. Todo el texto de este
archivo, del código y de los mensajes visibles está en español.

## Comandos

- `npm run dev`: servidor de desarrollo en `http://localhost:3000`.
- `npm run build`: compilación para producción.
- `npm run lint`: ESLint (`next lint` ya no existe en Next 16).
- `npm run typecheck`: comprobación de tipos sin emitir archivos.
- `npm run test`: pruebas de forma no interactiva (Vitest).
- `npm run test:watch`: pruebas en modo continuo.
- `npm run env:check`: valida `.env.local` y `.env` e informa en español de lo
  que falta, sin mostrar valores.

## Variables de entorno

- Lee el entorno con `obtenerConfiguracion()` de
  `infraestructura/configuracion/entorno.ts`. No uses `process.env` en otro sitio:
  una prueba lo comprueba (`pruebas/entorno/secretos.test.ts`).
- `variablesPublicas()` es la única vía para obtener `NEXT_PUBLIC_URL` en el
  cliente. `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY` y `SMTP_PASSWORD` nunca
  salen del servidor.
- Copia `.env.example` a `.env.local` para trabajar en local.

## Reglas obligatorias

1. No añadas dependencias, servicios ni capas sin una necesidad documentada en
   `docs/plan.md` §2.
2. El código de `dominio/` y `infraestructura/` no importa componentes visuales
   ni APIs de Next.js.
3. Antes de implementar, escribe las pruebas de éxito, error y límite.
4. Solo se persisten resultados validados contra los 14 alérgenos.
5. Los mensajes visibles y la documentación están en español. Los campos
   externos de OpenAI se aíslan y traducen en la frontera.
6. Ejecuta `npm run test`, `npm run lint` y `npm run typecheck` antes de dar por
   terminada una tarea.
7. Los archivos de entorno reales (`.env.local`, `.env`) no se versionan ni se
   muestran en registros.
8. Marca la tarea en `docs/task.md` solo cuando su apartado «Hecho cuando» se
   cumple, e indica los identificadores `RF`, `CA`, `CE` y `RNF` cubiertos.

## Estructura prevista

```text
app/            App Router: panel, menú público y rutas de servidor
dominio/        Reglas de alérgenos, categorías, platos y publicación
infraestructura/ Adaptadores de OpenAI, QR, correo y Supabase
pruebas/        Pruebas de dominio, integración, componentes y E2E
```
