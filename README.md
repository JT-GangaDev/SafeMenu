# SafeMenu

Menús con alérgenos detectados por IA y publicados mediante un código QR.

## Documentación del proyecto

- `docs/constitucion.md`: principios de implementación.
- `plan.md`: decisiones técnicas, arquitectura y estrategia de pruebas.
- `task.md`: lista de tareas a ejecutar.
- `specs/001-SafeMenu-mvp/spec.md`: especificación funcional.

## Comandos

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Arranca el servidor de desarrollo en `http://localhost:3000`. |
| `npm run build` | Compila la aplicación para producción. |
| `npm run start` | Sirve la compilación de producción. |
| `npm run lint` | Ejecuta ESLint sobre el proyecto. |
| `npm run typecheck` | Comprueba los tipos con TypeScript sin emitir archivos. |
| `npm run test` | Ejecuta las pruebas de forma no interactiva. |
| `npm run test:watch` | Ejecuta las pruebas en modo continuo. |

## Convenciones

- Código, documentación y mensajes visibles en español.
- El dominio (`dominio/`) no importa componentes visuales.
- Las dependencias se añaden solo con una necesidad documentada en `plan.md`.
