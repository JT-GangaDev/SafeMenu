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
- `npm run test:e2e`: pruebas de extremo a extremo (Playwright). Compila y
  arranca la aplicación antes de ejecutarlas.
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
6. Ejecuta `npm run test`, `npm run test:e2e`, `npm run lint` y
   `npm run typecheck` antes de dar por terminada una tarea.
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

## Arnés de pruebas (T-003)

- Vitest usa dos proyectos en `vitest.config.ts`: `dominio` (entorno `node`,
  `pruebas/**/*.test.ts`) y `componentes` (entorno `jsdom`,
  `pruebas/**/*.test.tsx` con `pruebas/componentes/preparacion.ts`).
- No añadas `@vitejs/plugin-react`: el JSX se compila con
  `esbuild: { jsx: "automatic" }` en la raíz de `vitest.config.ts`.
- Sin `globals: true`, así que la limpieza del DOM se registra a mano con
  `afterEach(cleanup)` en `pruebas/componentes/preparacion.ts`.
- `jest-axe` no incluye tipos y `@types/jest-axe` arrastra `@types/jest`, que
  choca con Vitest. Los tipos están en `pruebas/tipos/axe.d.ts` (declaración
  ambiental) y `pruebas/tipos/matchers.d.ts` (aumento de `Assertion`).
- `jest-axe` exporta `toHaveNoViolations` como objeto de matchers, así que se
  registra con `expect.extend(toHaveNoViolations)`.
- Playwright usa `pruebas/e2e/**/*.spec.ts`, compila y arranca la aplicación con
  `npm run build && npm run start`, y no reutiliza el servidor si hay `CI`.
- Las pruebas E2E necesitan el Chromium de Playwright
  (`npx playwright install chromium`). Si no se puede descargar, usa el
  navegador del sistema con `$env:PLAYWRIGHT_CHANNEL="chrome"; npm run test:e2e`
  en PowerShell o `PLAYWRIGHT_CHANNEL=chrome npm run test:e2e` en bash.
- `pruebas/fundacion/codificacion.test.ts` falla si algún archivo de `app/`,
  `dominio/` o `infraestructura/` se guarda dos veces como UTF-8. No escribas
  texto corrupto ni lo compiles en los archivos: el texto en español va en
  UTF-8.
- `pruebas/fundacion/aislamiento.test.ts` escanea `dominio/**` y falla ante
  `react`, `react-dom`, `next/*`, `@/app/*` o `process.env`.

## Vocabulario del dominio (T-004)

- No dupliques los 14 alérgenos, los estados ni los mensajes de error: la fuente
  única es `dominio/alergenos/catalogo.ts` (códigos, etiquetas y valores
  `presente`/`ausente`), `dominio/comun/estados.ts` (los seis estados y su
  código interno) y `dominio/alergenos/errores.ts` (errores de análisis,
  revisión y confirmación).
- Los códigos van en minúsculas y sin tildes porque son clave de base de datos y
  de traducción; las etiquetas y los mensajes van con tildes porque se muestran.
- `pruebas/dominio/alergenos/catalogo.test.ts` extrae la lista de
  `docs/plan.md` §5 y la compara con el catálogo, así que cualquier cambio
  debe hacerse también en el plan.
