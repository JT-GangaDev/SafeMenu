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

## Reglas obligatorias

1. No añadas dependencias, servicios ni capas sin una necesidad documentada en
   `plan.md` §2.
2. El código de `dominio/` y `infraestructura/` no importa componentes visuales
   ni APIs de Next.js.
3. Antes de implementar, escribe las pruebas de éxito, error y límite.
4. Solo se persisten resultados validados contra los 14 alérgenos.
5. Los mensajes visibles y la documentación están en español. Los campos
   externos de OpenAI se aíslan y traducen en la frontera.
6. Ejecuta `npm run test`, `npm run lint` y `npm run typecheck` antes de dar por
   terminada una tarea.
7. Marca la tarea en `task.md` solo cuando su apartado «Hecho cuando» se
   cumple, e indica los identificadores `RF`, `CA`, `CE` y `RNF` cubiertos.

## Estructura prevista

```text
app/            App Router: panel, menú público y rutas de servidor
dominio/        Reglas de alérgenos, categorías, platos y publicación
infraestructura/ Adaptadores de OpenAI, QR, correo y Supabase
pruebas/        Pruebas de dominio, integración, componentes y E2E
```
