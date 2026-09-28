# Tareas — SafeMenu MVP

**Estado:** Aprobado para implementación
**Fuentes:** `specs/001-SafeMenu-mvp/spec.md`, `plan.md`, `docs/constitucion.md`

## Convenciones

- Las tareas se ejecutan en el orden indicado.
- Una tarea no comienza hasta que sus dependencias están completadas.
- Cada tarea debe producir código, configuración o pruebas identificables.
- `RF` indica los requisitos funcionales cubiertos; `RNF` indica los requisitos no funcionales.
- `CA` y `CE` remiten a los identificadores de `spec.md`.
- Los identificadores `T-RFx-yy` son los de la matriz de pruebas de `spec.md`.
- Cada tarea tiene un resultado verificable en `Hecho cuando:`.

## Bloque 0 — Fundación

- [x] **T-001 — Inicializar la aplicación Next.js con App Router y TypeScript.**
  - RF: transversal (soporta RF-1–RF-12); RNF: RNF-4, RNF-9, RNF-10.
  - Depende de: —
  - Hecho cuando: el proyecto arranca con `npm run dev` y existe un script de compilación, lint y pruebas.

- [ ] **T-002 — Configurar las variables de entorno y los secretos de servidor.**
  - RF: transversal (soporta RF-1–RF-12); RNF: RNF-2, RNF-4.
  - Depende de: T-001.
  - Hecho cuando: existe `.env.example`, la aplicación valida las variables requeridas y ninguna clave de OpenAI o Supabase queda expuesta al cliente.

- [ ] **T-003 — Configurar Vitest, Testing Library, Playwright y las comprobaciones de accesibilidad.**
  - RF: transversal (soporta RF-1–RF-12); RNF: RNF-5, RNF-9, RNF-10.
  - Depende de: T-001.
  - Hecho cuando: las pruebas unitarias, de componentes y E2E se ejecutan mediante comandos documentados.

- [ ] **T-004 — Definir el catálogo de 14 alérgenos, estados y errores en español.**
  - RF: RF-6, RF-7, RF-12; RNF: RNF-1, RNF-4.
  - Depende de: T-001.
  - Hecho cuando: existe una constante única con exactamente los 14 códigos y estados `borrador`, `verificación pendiente`, `confirmado`, `oculto`, `no publicado` y `publicado`.

- [ ] **T-005 — Crear la estructura de dominio, infraestructura y pruebas.**
  - RF: transversal (soporta RF-1–RF-12); RNF: RNF-10.
  - Depende de: T-001.
  - Hecho cuando: el dominio no importa componentes visuales y las carpetas de `dominio`, `infraestructura` y `pruebas` están creadas.

- [ ] **T-006 — Crear proveedores de prueba falsos para IA, QR, correo y tiempo.**
  - RF: RF-1, RF-6, RF-10; RNF: RNF-9, RNF-10.
  - Depende de: T-003, T-004.
  - Hecho cuando: las pruebas pueden ejecutar el dominio sin llamar a OpenAI, Supabase, SMTP ni servicios de QR reales.

## Bloque 1 — Base de datos, migraciones y aislamiento

- [ ] **T-007 — Configurar el cliente Supabase y el ejecutor de migraciones.**
  - RF: transversal (soporta RF-1–RF-12); RNF: RNF-2, RNF-3, RNF-8.
  - Depende de: T-002.
  - Hecho cuando: las migraciones se aplican en un entorno de desarrollo y el cliente de servidor no usa credenciales de cliente para operaciones privilegiadas.

- [ ] **T-008 — Crear la tabla `restaurantes` y sus restricciones de propietario.**
  - RF: RF-1, RF-3, RF-8, RF-10; CA: CA-RF1-01, CA-RF3-01; CE: CE-28.
  - Depende de: T-007, T-004.
  - Hecho cuando: cada restaurante tiene propietario, nombre, `slug` único, estado y versión pública inicial.

- [ ] **T-009 — Crear la tabla `categorias` con orden, visibilidad y unicidad.**
  - RF: RF-4, RF-11; CA: CA-RF4-01, CA-RF4-02, CA-RF4-03, CA-RF4-04, CA-RF4-05, CA-RF4-06, CA-RF4-07; CE: CE-16, CE-22, CE-25.
  - Depende de: T-008, T-004.
  - Hecho cuando: el esquema impide nombres duplicados, conserva el orden y permite ocultar, restaurar y eliminar según el estado de publicación.

- [ ] **T-010 — Crear `platos` y `versiones_platos` con historial inmutable.**
  - RF: RF-5, RF-6, RF-7, RF-11; CA: CA-RF5-01, CA-RF5-02, CA-RF5-03, CA-RF5-04, CA-RF5-05, CA-RF5-06, CA-RF5-07, CA-RF5-08, CA-RF5-09, CA-RF5-10; CE: CE-10, CE-12, CE-16, CE-24.
  - Depende de: T-009, T-004.
  - Hecho cuando: cada cambio de nombre o descripción crea una versión, el precio se guarda en céntimos y la versión actual se puede invalidar sin perder la versión pública segura.

- [ ] **T-011 — Crear `evaluaciones_alergenos` y `valores_alergenos`.**
  - RF: RF-6, RF-7, RF-12; RNF: RNF-1; CA: CA-RF6-02, CA-RF6-03, CA-RF6-04, CA-RF7-01, CA-RF7-02, CA-RF7-03, CA-RF7-04; CE: CE-1, CE-2, CE-3, CE-4, CE-10, CE-23.
  - Depende de: T-010, T-004.
  - Hecho cuando: la base de datos solo admite exactamente 14 valores `presente`/`ausente` y mantiene las advertencias separadas de los valores publicables.

- [ ] **T-012 — Crear `publicaciones` e instantáneas públicas inmutables.**
  - RF: RF-8, RF-9, RF-10, RF-11; CA: CA-RF8-01, CA-RF8-03, CA-RF8-04, CA-RF8-05, CA-RF8-07, CA-RF10-05, CA-RF11-01, CA-RF11-02; CE: CE-6, CE-7, CE-8, CE-17, CE-26; RNF: RNF-8.
  - Depende de: T-009, T-010, T-011.
  - Hecho cuando: una publicación conserva su instantánea, solo una queda activa y el menú público no lee borradores.

- [ ] **T-013 — Implementar políticas RLS para aislamiento entre restaurantes.**
  - RF: RF-3; CA: CA-RF3-01, CA-RF3-02, CA-RF3-03; CE: CE-28; RNF: RNF-2, RNF-3.
  - Depende de: T-008, T-009, T-010, T-011, T-012.
  - Hecho cuando: un usuario no puede leer ni escribir categorías, platos, evaluaciones o publicaciones de otro restaurante.

- [ ] **T-014 — Crear pruebas de integración de restricciones y RLS.**
  - RF: RF-1, RF-3, RF-4, RF-5, RF-6, RF-7, RF-8, RF-9, RF-10, RF-11; RNF: RNF-2, RNF-3, RNF-8, RNF-9.
  - Depende de: T-012, T-013.
  - Hecho cuando: las pruebas cubren claves duplicadas, rangos de precio, nombres, slugs, exactamente 14 alérgenos, instantáneas atómicas y aislamiento entre cuentas.

## Bloque 2 — Registro, autenticación y recuperación

- [ ] **T-015 — Implementar los esquemas de validación de registro, inicio de sesión y recuperación.**
  - RF: RF-1, RF-2; CA: CA-RF1-03, CA-RF1-04, CA-RF2-02; CE: CE-11, CE-14; RNF: RNF-4.
  - Depende de: T-002, T-004.
  - Hecho cuando: los datos inválidos se rechazan con mensajes en español y los errores no revelan si una cuenta existe.

- [ ] **T-016 — Implementar el registro transaccional de cuenta y restaurante.**
  - RF: RF-1; CA: CA-RF1-01, CA-RF1-03, CA-RF1-04; CE: CE-11, CE-13.
  - Depende de: T-008, T-013, T-015.
  - Hecho cuando: un registro válido crea una cuenta y un único restaurante, envía la verificación y bloquea el panel hasta verificarla.

- [ ] **T-017 — Implementar la verificación de correo y el reenvío de enlaces.**
  - RF: RF-1; CA: CA-RF1-02, CA-RF1-05, CA-RF1-06, CA-RF1-07; CE: CE-13, CE-18.
  - Depende de: T-016.
  - Hecho cuando: el primer uso del enlace habilita el panel, los usos posteriores o caducados fallan y el reenvío genera un enlace nuevo.

- [ ] **T-018 — Implementar la recuperación de contraseña y el cierre de sesiones existentes.**
  - RF: RF-1, RF-2; CA: CA-RF1-08, CA-RF1-09, CA-RF1-10, CA-RF2-05; CE: CE-14, CE-19; RNF: RNF-2.
  - Depende de: T-017.
  - Hecho cuando: una recuperación válida cambia la contraseña, invalida las sesiones abiertas y las solicitudes inválidas no revelan información de cuentas.

- [ ] **T-019 — Implementar inicio de sesión, cierre de sesión y bloqueo por correo no verificado.**
  - RF: RF-2; CA: CA-RF2-01, CA-RF2-02, CA-RF2-03; CE: CE-13.
  - Depende de: T-016, T-017, T-018.
  - Hecho cuando: solo un usuario verificado accede a su restaurante, el cierre elimina el acceso y los errores son genéricos y en español.

- [ ] **T-020 — Implementar el cierre por inactividad de 30 minutos.**
  - RF: RF-2; CA: CA-RF2-04; RNF: RNF-2.
  - Depende de: T-019.
  - Hecho cuando: una sesión sin actividad durante 30 minutos se invalida y el usuario vuelve a la pantalla de inicio de sesión.

- [ ] **T-021 — Construir las pantallas de registro, verificación, recuperación e inicio de sesión.**
  - RF: RF-1, RF-2; CA: CA-RF1-01, CA-RF1-02, CA-RF1-05, CA-RF1-08, CA-RF2-01, CA-RF2-02; RNF: RNF-4, RNF-5.
  - Depende de: T-016, T-017, T-018, T-019.
  - Hecho cuando: todos los formularios muestran estados de carga, éxito, error y mensajes en español sin exponer información privada.

- [ ] **T-022 — Crear pruebas de autenticación y aislamiento de sesión.**
  - RF: RF-1, RF-2, RF-3; CA: CA-RF1-01, CA-RF1-02, CA-RF1-05, CA-RF1-06, CA-RF1-08, CA-RF1-09, CA-RF2-01, CA-RF2-03, CA-RF2-04, CA-RF2-05, CA-RF3-01, CA-RF3-02, CA-RF3-03; CE: CE-11, CE-13, CE-14, CE-18, CE-19, CE-28; Pruebas: T-RF1-01, T-RF1-02, T-RF2-01, T-RF2-02, T-RF3-01, T-RF3-02.
  - Depende de: T-013, T-017, T-018, T-019, T-020, T-021.
  - Hecho cuando: las pruebas automatizadas cubren registro, verificación, recuperación, acceso, cierre, caducidad y aislamiento entre restaurantes.

## Bloque 3 — Gestión de categorías y platos

- [ ] **T-023 — Implementar la validación de nombres de categorías.**
  - RF: RF-4; CA: CA-RF4-01, CA-RF4-02; CE: CE-22.
  - Depende de: T-004, T-009.
  - Hecho cuando: se rechazan nombres vacíos, con más de 50 caracteres, con espacios únicamente o duplicados normalizados.

- [ ] **T-024 — Implementar crear, editar y ordenar categorías.**
  - RF: RF-4; CA: CA-RF4-01, CA-RF4-03; CE: CE-22.
  - Depende de: T-013, T-023.
  - Hecho cuando: una categoría válida se guarda en el restaurante autenticado y un cambio de orden se conserva correctamente.

- [ ] **T-025 — Implementar ocultar, restaurar y eliminar categorías.**
  - RF: RF-4, RF-11; CA: CA-RF4-04, CA-RF4-05, CA-RF4-06, CA-RF4-07; CE: CE-16, CE-25.
  - Depende de: T-024, T-012.
  - Hecho cuando: las categorías publicadas solo se ocultan, las no publicadas se pueden eliminar tras confirmación y al restaurar no aparecen platos ocultos.

- [ ] **T-026 — Construir la interfaz de gestión de categorías.**
  - RF: RF-4; CA: CA-RF4-01, CA-RF4-02, CA-RF4-03, CA-RF4-04, CA-RF4-05, CA-RF4-06, CA-RF4-07; RNF: RNF-4, RNF-5.
  - Depende de: T-021, T-024, T-025.
  - Hecho cuando: el panel permite crear, editar, ordenar, ocultar, restaurar y eliminar con confirmación y mensajes en español.

- [ ] **T-027 — Implementar la validación de platos.**
  - RF: RF-5; CA: CA-RF5-01, CA-RF5-02, CA-RF5-06; CE: CE-10, CE-12, CE-22.
  - Depende de: T-004, T-010.
  - Hecho cuando: se validan nombre, descripción, precio en euros con céntimos, categoría y unicidad dentro de la categoría.

- [ ] **T-028 — Implementar el versionado y ciclo de estados de los platos.**
  - RF: RF-5, RF-6, RF-7, RF-11; CA: CA-RF5-03, CA-RF5-04, CA-RF5-05, CA-RF5-07, CA-RF5-08, CA-RF5-09, CA-RF5-10, CA-RF6-01, CA-RF6-09, CA-RF7-05; CE: CE-16, CE-24.
  - Depende de: T-010, T-011, T-027.
  - Hecho cuando: los cambios de nombre o descripción invalidan la verificación, los cambios de precio o categoría la conservan y los estados publicado y no publicado se reflejan correctamente.

- [ ] **T-029 — Construir el formulario de gestión de platos sin botón de análisis adicional.**
  - RF: RF-5, RF-6; CA: CA-RF5-01, CA-RF5-02, CA-RF5-04, CA-RF5-05, CA-RF5-07, CA-RF5-08; RNF: RNF-4, RNF-5.
  - Depende de: T-021, T-027, T-028.
  - Hecho cuando: guardar un plato inicia automáticamente el flujo correspondiente y la interfaz muestra los estados del plato sin exigir una acción adicional de análisis.

- [ ] **T-030 — Crear pruebas de dominio, integración e interfaz de categorías y platos.**
  - RF: RF-4, RF-5, RF-6; CA: CA-RF4-01, CA-RF4-02, CA-RF4-03, CA-RF4-04, CA-RF4-05, CA-RF4-06, CA-RF4-07, CA-RF5-01, CA-RF5-02, CA-RF5-03, CA-RF5-04, CA-RF5-05, CA-RF5-07, CA-RF5-08, CA-RF5-09, CA-RF5-10; CE: CE-10, CE-12, CE-16, CE-22, CE-24, CE-25; Pruebas: T-RF4-01, T-RF4-02, T-RF5-01, T-RF5-02.
  - Depende de: T-025, T-026, T-028, T-029.
  - Hecho cuando: cada función de gestión cubierta tiene pruebas de éxito, error y límite sin depender de la interfaz.

## Bloque 4 — Análisis con IA y revisión

- [ ] **T-031 — Definir el contrato Structured Outputs y el DTO interno de alérgenos.**
  - RF: RF-6; CA: CA-RF6-01, CA-RF6-02; RNF: RNF-4.
  - Depende de: T-004, T-005.
  - Hecho cuando: los campos externos de OpenAI están aislados y traducidos a un tipo de dominio en español.

- [ ] **T-032 — Implementar el adaptador de OpenAI en el servidor con tiempo de espera de 10 segundos.**
  - RF: RF-6; CA: CA-RF6-02, CA-RF6-04, CA-RF6-05; CE: CE-5; RNF: RNF-2.
  - Depende de: T-002, T-031.
  - Hecho cuando: la llamada usa variables de servidor, interrumpe la espera al superar 10 segundos y devuelve un error controlado sin convertirlo en ausencia de alérgenos.

- [ ] **T-033 — Implementar la validación estricta de exactamente 14 alérgenos.**
  - RF: RF-6; CA: CA-RF6-03, CA-RF6-04, CA-RF6-09; CE: CE-1, CE-2, CE-4, CE-23; RNF: RNF-1.
  - Depende de: T-004, T-031.
  - Hecho cuando: claves repetidas, ausentes, adicionales o con valores no permitidos provocan el rechazo completo del resultado.

- [ ] **T-034 — Implementar advertencias por ambigüedad, contradicción e idioma no admitido.**
  - RF: RF-6; CA: CA-RF6-06, CA-RF6-07, CA-RF6-08; CE: CE-3, CE-23.
  - Depende de: T-032, T-033.
  - Hecho cuando: una posible presencia nunca se convierte en ausencia, las contradicciones exigen revisión y el idioma no admitido se rechaza en español.

- [ ] **T-035 — Implementar el disparador automático, la invalidación y el reintento del análisis.**
  - RF: RF-6, RF-11; CA: CA-RF6-01, CA-RF6-04, CA-RF6-05, CA-RF6-09, CA-RF11-05; CE: CE-5, CE-24.
  - Depende de: T-028, T-032, T-033, T-034.
  - Hecho cuando: el análisis se ejecuta al crear o cambiar nombre/descripción, no por precio, categoría u orden, y permite reintentar sin perder el borrador.

- [ ] **T-036 — Implementar la corrección y confirmación explícita de una versión.**
  - RF: RF-7; CA: CA-RF7-01, CA-RF7-02, CA-RF7-03, CA-RF7-04, CA-RF7-05, CA-RF7-06; CE: CE-3, CE-10, CE-24; RNF: RNF-1.
  - Depende de: T-011, T-033, T-035.
  - Hecho cuando: solo se confirma un conjunto válido de 14 valores asociado a la versión actual y las confirmaciones obsoletas se rechazan.

- [ ] **T-037 — Construir la vista de revisión de los 14 alérgenos.**
  - RF: RF-7, RF-12; CA: CA-RF7-01, CA-RF7-02, CA-RF7-03, CA-RF7-04, CA-RF12-03; RNF: RNF-4, RNF-5.
  - Depende de: T-036.
  - Hecho cuando: el usuario puede corregir valores, ver advertencias separadas, confirmar explícitamente y recibir un mensaje si la versión cambió.

- [ ] **T-038 — Crear pruebas del adaptador de IA y del flujo de revisión.**
  - RF: RF-6, RF-7; CA: CA-RF6-01, CA-RF6-02, CA-RF6-03, CA-RF6-04, CA-RF6-05, CA-RF6-06, CA-RF6-07, CA-RF6-08, CA-RF6-09, CA-RF7-01, CA-RF7-02, CA-RF7-03, CA-RF7-04, CA-RF7-05, CA-RF7-06; CE: CE-1, CE-2, CE-3, CE-4, CE-5, CE-10, CE-23, CE-24; Pruebas: T-RF6-01, T-RF6-02, T-RF7-01, T-RF7-02.
  - Depende de: T-032, T-033, T-034, T-035, T-036, T-037.
  - Hecho cuando: las pruebas cubren respuesta válida, inválida, ambigua, contradictoria, idioma no admitido, error, tiempo de espera agotado y confirmación obsoleta.

## Bloque 5 — Publicación, menú público y QR

- [ ] **T-039 — Implementar el identificador público estable.**
  - RF: RF-10; CA: CA-RF10-01, CA-RF10-05; CE: CE-15, CE-20.
  - Depende de: T-008, T-009.
  - Hecho cuando: se validan 3–50 caracteres en minúsculas, números y guiones, nombres reservados y disponibilidad, y el valor queda bloqueado tras publicar.

- [ ] **T-040 — Implementar las reglas de elegibilidad de la primera publicación.**
  - RF: RF-8; CA: CA-RF8-01, CA-RF8-02, CA-RF8-06; CE: CE-8, CE-17.
  - Depende de: T-011, T-012, T-036.
  - Hecho cuando: la publicación se rechaza si no hay platos publicables, hay datos incompletos, confirmaciones ausentes o advertencias sin resolver.

- [ ] **T-041 — Implementar la construcción atómica de instantáneas públicas.**
  - RF: RF-8, RF-9, RF-11; CA: CA-RF8-03, CA-RF8-04, CA-RF8-07, CA-RF9-01, CA-RF9-05, CA-RF11-01, CA-RF11-02; CE: CE-6, CE-7, CE-27; RNF: RNF-8.
  - Depende de: T-012, T-040.
  - Hecho cuando: una instantánea contiene solo categorías, platos y alérgenos confirmados, se crea en una transacción y nunca sustituye a la anterior si falla.

- [ ] **T-042 — Implementar publicar y despublicar conservando la última versión.**
  - RF: RF-8, RF-11; CA: CA-RF8-03, CA-RF8-05, CA-RF8-06; CE: CE-17, CE-26.
  - Depende de: T-041.
  - Hecho cuando: despublicar retira el acceso público sin borrar la instantánea y un menú sin platos visibles nunca se presenta como carta válida.

- [ ] **T-043 — Construir las acciones de publicación en el panel.**
  - RF: RF-8; CA: CA-RF8-01, CA-RF8-02, CA-RF8-03, CA-RF8-04, CA-RF8-05, CA-RF8-06, CA-RF8-07; RNF: RNF-4, RNF-5.
  - Depende de: T-040, T-042.
  - Hecho cuando: el panel muestra los platos pendientes, exige confirmación explícita y comunica el resultado de publicar, despublicar o reintentar.

- [ ] **T-044 — Crear la ruta pública `/m/[slug]` y la carga útil segura.**
  - RF: RF-9; CA: CA-RF9-01, CA-RF9-02, CA-RF9-03, CA-RF9-04, CA-RF9-05; RNF: RNF-3.
  - Depende de: T-013, T-039, T-041.
  - Hecho cuando: un visitante sin cuenta ve únicamente la instantánea activa y nunca datos de cuenta, borradores o información privada.

- [ ] **T-045 — Implementar los estados de menú inexistente, no publicado y error de carga.**
  - RF: RF-9; CA: CA-RF9-06, CA-RF9-07; CE: CE-9, CE-27.
  - Depende de: T-044.
  - Hecho cuando: enlaces inválidos, menús no publicados, falta de conexión y fallos muestran mensajes en español sin presentar una carta parcial como válida.

- [ ] **T-046 — Implementar la generación, descarga e impresión del QR.**
  - RF: RF-10; CA: CA-RF10-02, CA-RF10-03, CA-RF10-04, CA-RF10-06, CA-RF10-07, CA-RF10-08; CE: CE-9, CE-21; RNF: RNF-2.
  - Depende de: T-032, T-039, T-042.
  - Hecho cuando: el QR apunta a la dirección estable, se descarga como PNG, ofrece vista de impresión y permite reintentar sin deshacer la publicación.

- [ ] **T-047 — Crear pruebas de publicación, menú público y QR.**
  - RF: RF-8, RF-9, RF-10; CA: CA-RF8-01, CA-RF8-02, CA-RF8-03, CA-RF8-04, CA-RF8-05, CA-RF8-06, CA-RF8-07, CA-RF9-01, CA-RF9-02, CA-RF9-03, CA-RF9-04, CA-RF9-05, CA-RF9-06, CA-RF9-07, CA-RF10-01, CA-RF10-02, CA-RF10-03, CA-RF10-04, CA-RF10-05, CA-RF10-06, CA-RF10-07, CA-RF10-08; CE: CE-8, CE-9, CE-15, CE-17, CE-20, CE-21, CE-26, CE-27; Pruebas: T-RF8-01, T-RF8-02, T-RF9-01, T-RF9-02, T-RF10-01, T-RF10-02.
  - Depende de: T-039, T-040, T-041, T-042, T-043, T-044, T-045, T-046.
  - Hecho cuando: las pruebas cubren publicación completa e incompleta, menú vacío, despublicación, datos privados, enlaces inválidos, QR estable y fallo de generación.

## Bloque 6 — Actualización automática, presentación y accesibilidad

- [ ] **T-048 — Actualizar la instantánea tras ediciones confirmadas y cambios de visibilidad.**
  - RF: RF-11; CA: CA-RF11-01, CA-RF11-03, CA-RF11-04, CA-RF11-06; CE: CE-6, CE-7, CE-25; RNF: RNF-8.
  - Depende de: T-041, T-042.
  - Hecho cuando: la siguiente visita pública muestra la edición válida más reciente sin cambiar la dirección ni el QR.

- [ ] **T-049 — Mantener el respaldo público seguro ante ediciones pendientes o fallidas.**
  - RF: RF-11; CA: CA-RF11-02, CA-RF11-05, CA-RF11-07; CE: CE-6, CE-17; RNF: RNF-8.
  - Depende de: T-035, T-041.
  - Hecho cuando: un fallo de análisis o confirmación no sustituye la última instantánea pública y el usuario puede reintentar.

- [ ] **T-050 — Implementar restauración de categorías y platos con filtrado de ocultos.**
  - RF: RF-4, RF-5, RF-11; CA: CA-RF4-05, CA-RF5-08, CA-RF11-04; CE: CE-24, CE-25.
  - Depende de: T-025, T-028, T-048.
  - Hecho cuando: se restaura la última versión verificable y no reaparecen platos ocultos ni contenido que requiera un análisis nuevo.

- [ ] **T-051 — Implementar la presentación pública de alérgenos confirmados.**
  - RF: RF-12; CA: CA-RF12-01, CA-RF12-02, CA-RF12-03, CA-RF12-04, CA-RF12-06; CE: CE-1, CE-2, CE-3, CE-10; RNF: RNF-5.
  - Depende de: T-044, T-045.
  - Hecho cuando: solo aparecen iconos de alérgenos confirmados como presentes, con nombre en español, y la ausencia no se presenta como certificación.

- [ ] **T-052 — Revisar idioma y accesibilidad de panel y menú público.**
  - RF: RF-9, RF-12; CA: CA-RF9-04, CA-RF12-02, CA-RF12-05; RNF: RNF-4, RNF-5.
  - Depende de: T-021, T-043, T-044, T-051.
  - Hecho cuando: todos los mensajes visibles están en español, cada icono y advertencia tiene texto y las acciones funcionan sin depender solo del color.

- [ ] **T-053 — Crear pruebas E2E de actualización, restauración y presentación.**
  - RF: RF-11, RF-12; CA: CA-RF11-01, CA-RF11-02, CA-RF11-03, CA-RF11-04, CA-RF11-05, CA-RF11-06, CA-RF11-07, CA-RF12-01, CA-RF12-02, CA-RF12-03, CA-RF12-04, CA-RF12-05, CA-RF12-06; CE: CE-6, CE-7, CE-17, CE-25, CE-27; Pruebas: T-RF11-01, T-RF11-02, T-RF12-01, T-RF12-02.
  - Depende de: T-048, T-049, T-050, T-051, T-052.
  - Hecho cuando: los flujos E2E demuestran que una edición pendiente no se publica, una edición confirmada sí se actualiza y los alérgenos se presentan correctamente.

## Bloque 7 — Calidad, trazabilidad y entrega

- [ ] **T-054 — Completar la matriz `RF–CA–CE–prueba`.**
  - RF: RF-1, RF-2, RF-3, RF-4, RF-5, RF-6, RF-7, RF-8, RF-9, RF-10, RF-11, RF-12; RNF: RNF-9.
  - Depende de: T-022, T-030, T-038, T-047, T-053.
  - Hecho cuando: cada `CA-RF1-01` a `CA-RF12-06` y cada `CE-1` a `CE-28` tiene al menos una prueba identificada y ejecutable.

- [ ] **T-055 — Configurar la CI con pruebas de dominio, componentes, integración y E2E.**
  - RF: transversal (RF-1–RF-12); RNF: RNF-9, RNF-10.
  - Depende de: T-003, T-054.
  - Hecho cuando: la CI ejecuta todas las pruebas definidas y falla si alguna prueba de aceptación trazable no se ejecuta correctamente.

- [ ] **T-056 — Añadir pruebas de seguridad, secretos, sesiones y RLS.**
  - RF: RF-1, RF-2, RF-3; RNF: RNF-2, RNF-3; CE: CE-28.
  - Depende de: T-013, T-022, T-055.
  - Hecho cuando: las pruebas verifican que no se exponen contraseñas, claves, sesiones, datos privados ni operaciones de otros restaurantes.

- [ ] **T-057 — Medir el rendimiento del menú público.**
  - RF: RF-9; RNF: RNF-6.
  - Depende de: T-044, T-053.
  - Hecho cuando: con 100 platos, 10 categorías, dispositivo móvil de gama media y 4G, el primer contenido visible aparece en menos de 3 segundos en el percentil 95 de 100 ejecuciones.

- [ ] **T-058 — Preparar el despliegue y la configuración de entornos externos.**
  - RF: RF-1, RF-2, RF-8, RF-9, RF-10; RNF: RNF-2, RNF-3, RNF-7.
  - Depende de: T-002, T-044, T-046.
  - Hecho cuando: el despliegue aplica migraciones, utiliza SMTP, un modelo con Structured Outputs, secretos de servidor y una URL pública estable.

- [ ] **T-059 — Verificar recuperación, atomicidad y reversión de publicaciones.**
  - RF: RF-6, RF-8, RF-11; RNF: RNF-8; CE: CE-5, CE-6, CE-8, CE-17, CE-26.
  - Depende de: T-041, T-049, T-055.
  - Hecho cuando: un fallo en cualquier paso conserva la última instantánea pública confirmada y existe un procedimiento de reversión documentado.

- [ ] **T-060 — Configurar la comprobación externa de disponibilidad.**
  - RF: RF-9; RNF: RNF-7.
  - Depende de: T-044, T-058.
  - Hecho cuando: existe una comprobación externa que mide la disponibilidad del menú publicado y distingue los estados administrativos de los incidentes técnicos.

- [ ] **T-061 — Ejecutar la aceptación final y revisar el idioma.**
  - RF: RF-1, RF-2, RF-3, RF-4, RF-5, RF-6, RF-7, RF-8, RF-9, RF-10, RF-11, RF-12; RNF: RNF-1, RNF-2, RNF-3, RNF-4, RNF-5, RNF-6, RNF-7, RNF-8, RNF-9, RNF-10.
  - Depende de: T-054, T-055, T-056, T-057, T-058, T-059, T-060.
  - Hecho cuando: todos los RF están implementados, CE-1 a CE-28 tienen evidencia, la lógica de dominio funciona sin UI y no se han añadido funcionalidades fuera de alcance.
