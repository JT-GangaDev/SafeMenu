# Plan de implementación — SafeMenu MVP

## 1. Fuentes y principios

El plan se basa en:

- `docs/constitucion.md`.
- `specs/001-SafeMenu-mvp/spec.md`.

Se respetarán sus reglas:

1. No añadir dependencias, servicios o capas sin una necesidad documentada.
2. Cada regla funcional tendrá un criterio de aceptación ejecutable y trazable.
3. La lógica de alérgenos y persistencia estará separada de la UI.
4. Cada función de dominio tendrá pruebas de éxito, error y casos límite.
5. Solo se guardarán resultados validados contra exactamente los 14 alérgenos.
6. El código, la documentación y los mensajes de usuario estarán en español. Los campos externos de OpenAI se aislarán y traducirán en la frontera.
7. El MVP tendrá un único restaurante por cuenta, un único menú público y un único código QR.

El alcance no incluye pedidos, pagos, reservas, reparto, suscripciones, múltiples restaurantes, múltiples menús, roles, empleados, aplicación nativa, funcionamiento sin conexión, alérgenos adicionales ni integración con sistemas externos.

## 2. Decisiones técnicas

| Área | Decisión | Justificación | Alternativa descartada |
|---|---|---|---|
| Aplicación | Next.js con App Router y TypeScript | Un único despliegue para panel, API y menú público; permite el renderizado del contenido público en servidor | React SPA y Express separados: más configuración, despliegue y duplicación de contratos |
| Base de datos | Supabase PostgreSQL | El dominio es relacional, necesita restricciones, transacciones, versiones y instantáneas coherentes | Firebase o una base documental: peores ajustes para relaciones, restricciones y consultas de publicación |
| Autenticación | Supabase Auth | Proporciona verificación de correo, recuperación de contraseña y sesiones sin implementar autenticación propia | Implementación propia de contraseñas y credenciales: más superficie de seguridad y mantenimiento |
| Validación | Zod en las fronteras HTTP y OpenAI | Permite reutilizar el mismo esquema para entradas externas y respuestas no confiables | Validadores manuales dispersos: más riesgo de divergencias |
| IA | OpenAI Structured Outputs mediante un adaptador propio | Es la fuente de la propuesta de alérgenos y permite exigir un formato estricto | Analizador por palabras clave o reglas locales: no cubre de forma fiable ambigüedades, sinónimos y contradicciones |
| QR | Librería `qrcode` en servidor | Genera un PNG estable, descargable e imprimible | Servicio externo de QR: añade coste, disponibilidad y dependencia; generación solo en cliente: descarga menos fiable |
| Estilos | CSS Modules y variables propias | Suficiente para el MVP y evita una dependencia de estilos adicional | Tailwind y librería de componentes: se posponen hasta que el diseño justifique su adopción |
| Ejecución de IA | Llamada síncrona con tiempo de espera de 10 segundos | Cumple el flujo definido sin introducir colas ni procesos en segundo plano | Redis, colas y procesos en segundo plano: innecesarios para el MVP |
| Tests | Vitest, Testing Library, Playwright y axe | Cubre dominio, componentes, flujos de navegador y accesibilidad | Jest y Cypress: menos alineación con el stack TypeScript/Next.js y menor cobertura multiplataforma |

No se utilizarán ORM, cola, Redis, analítica, servicio de QR externo ni librería de componentes mientras no exista una necesidad del producto.

## 3. Arquitectura propuesta

```text
app/
  (autenticacion)/       Registro, verificación, inicio de sesión y recuperación
  panel/                 Panel privado del restaurante
  m/[slug]/              Menú público
  api/                   Operaciones de servidor y rutas públicas

dominio/
  alergenos/             Catálogo, valores, advertencias y reglas
  categorias/            Orden, visibilidad y eliminación
  comun/                 Estados y tipos compartidos por platos y restaurantes
  platos/              Versión, edición y transiciones de estado
  publicacion/           Elegibilidad, publicación e instantáneas
  autenticacion/         Reglas de sesión y acceso
  validacion/            Contratos de entrada y salida

infraestructura/
  configuracion/         Lectura y validación de variables del servidor
  openai/                Adaptador de Structured Outputs
  qr/                    Generación de PNG
  correo/                Configuración de correo en español
  supabase/              Cliente, migraciones y políticas

pruebas/
  fundacion/             Arnés, estructura, codificación y aislamiento
  helpers/               Utilidades compartidas por las pruebas
  tipos/                 Declaraciones de tipos de terceros
  entorno/               Variables de entorno y secretos de servidor
  dominio/               Reglas del dominio sin renderizar interfaz
  integracion/           Adaptadores, base de datos y correo
  componentes/           Componentes y accesibilidad, con sus fixtures
  e2e/                   Flujos completos en el navegador
  rendimiento/           Primer contenido visible con datos representativos
```

El código de dominio no importará componentes visuales. Los adaptadores de OpenAI, QR, correo y Supabase implementarán interfaces definidas por el dominio.

El árbol de arriba es la especificación de la estructura: `pruebas/fundacion/capas.test.ts` falla si una carpeta declarada no existe, si aparece una carpeta que el plan no declara o si `dominio/` o `infraestructura/` importan lo que les corresponde a otras capas. Las rutas de `app/` se crean en la tarea que las implemente. Cada carpeta de las tres capas lleva un `README.md` con su responsabilidad, para que quede documentada y git la registre.

## 4. Variables y configuración

```text
NEXT_PUBLIC_URL
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
OPENAI_MODEL
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASSWORD
SMTP_FROM
```

- `SUPABASE_SERVICE_ROLE_KEY` y `OPENAI_API_KEY` solo estarán disponibles en el servidor.
- `OPENAI_MODEL` será configurable para no acoplar el dominio a un único nombre de modelo.
- `NEXT_PUBLIC_URL` será la base usada para construir la dirección pública y el QR.
- SMTP se configurará en Supabase para garantizar la entrega de verificación y recuperación.

### Decisiones de despliegue pendientes de confirmar

- El proveedor de hosting no queda fijado; deberá soportar ejecución en servidor, variables secretas, pruebas E2E y conexión segura con Supabase y OpenAI.
- El proveedor SMTP concreto se configurará durante la integración; los mensajes y las plantillas serán siempre en español.
- `OPENAI_MODEL` se elegirá entre los modelos disponibles que admitan Structured Outputs; el adaptador no dependerá de un nombre fijo.
- La ruta pública se fija en `/m/[slug]` para mantener estable el QR después de la primera publicación.

## 5. Modelo de datos

### `restaurantes` — RF-1, RF-3, RF-8, RF-10

- `id`.
- `propietario_id` vinculado a la cuenta autenticada.
- `nombre`.
- `slug` único, inmutable después de la primera publicación.
- `estado`: no publicado o publicado.
- `version_publica_actual`.
- fechas de creación y publicación.

### `categorias` — RF-4, RF-11

- `id` y `restaurante_id`.
- `nombre` y `nombre_normalizado`.
- `orden`.
- `visible`.
- `version`.
- fecha de creación y actualización.

Restricciones:

- Una cuenta administra un único restaurante.
- El nombre tiene entre 1 y 50 caracteres.
- No se repite dentro del restaurante.
- Una categoría publicada no se elimina permanentemente; se oculta.

### `platos` y `versiones_platos` — RF-5, RF-6, RF-7, RF-11, RF-12

- `id`, `restaurante_id` y `categoria_id`.
- `nombre` de 1 a 100 caracteres.
- `descripcion` de 1 a 2000 caracteres.
- `precio_centavos` entero entre 0 y 99999999.
- `estado`: borrador, verificación pendiente, confirmado u oculto.
- `version_actual`.
- Relación con la última versión pública segura.

Cada versión inmutable almacenará los datos utilizados por un análisis o una confirmación: nombre, descripción, categoría y precio.

Un cambio de nombre o descripción crea una versión nueva e invalida el análisis y la confirmación anteriores. Un cambio de precio, categoría u orden conserva la verificación de alérgenos de la versión vigente.

### `evaluaciones_alergenos` y `valores_alergenos` — RF-6, RF-7, RF-12, RNF-1

- `id`, `version_plato_id`, estado y fecha.
- Advertencias separadas de los valores de alérgenos.
- `confirmado_por` y `confirmado_at` cuando corresponda.
- Exactamente 14 valores, uno por cada código permitido.

Los códigos de dominio serán:

1. `cereales_con_gluten`.
2. `crustaceos`.
3. `huevos`.
4. `pescado`.
5. `cacahuetes`.
6. `soja`.
7. `lacteos`.
8. `frutos_secos`.
9. `apio`.
10. `mostaza`.
11. `sesamo`.
12. `sulfitos`.
13. `altramuz`.
14. `moluscos`.

Una respuesta con una clave repetida, ausente o adicional, o con un valor que no sea `presente` o `ausente`, se rechazará completa. Las advertencias no se guardarán como resultado final publicable.

La única fuente de verdad de este vocabulario es `dominio/alergenos/catalogo.ts`: los códigos, sus etiquetas en español y los valores `presente` y `ausente`. Los estados de plato y restaurante, con su código interno sin espacios ni tildes para la base de datos, están en `dominio/comun/estados.ts`. Los errores de análisis, revisión y confirmación, con su mensaje en español, están en `dominio/alergenos/errores.ts`.

### `publicaciones` — RF-8, RF-9, RF-10, RF-11

- `id`, `restaurante_id` y `version`.
- `instantanea` JSONB inmutable con categorías, platos, precios, descripciones y alérgenos confirmados.
- `activa`.
- `publicada_at`.

La vista pública leerá únicamente la instantánea activa. Las ediciones confirmadas y los cambios de visibilidad posteriores generarán una nueva instantánea válida sin cambiar el `slug` ni el QR.

## 6. Reglas de dominio

### Identidad y aislamiento — RF-1, RF-2, RF-3

- El registro crea la cuenta y un único restaurante en una transacción.
- El panel permanece bloqueado hasta verificar el correo.
- Los mensajes de duplicado, recuperación y credenciales inválidas serán genéricos.
- El cierre de sesión eliminará el acceso al panel.
- Una sesión sin actividad durante 30 minutos se cerrará.
- Una recuperación de contraseña invalidará las sesiones existentes.
- El `restaurante_id` se obtendrá de la sesión, nunca se aceptará como autoridad del cliente.
- Las políticas RLS bloquearán lecturas y escrituras entre restaurantes.

### Categorías y platos — RF-4, RF-5

- Las categorías podrán crearse, editarse, ordenarse, ocultarse, restaurarse y eliminarse solo antes de su primera publicación.
- Los precios se validarán como euros con dos decimales usando céntimos enteros.
- No se podrá publicar un plato sin categoría válida.
- Los platos publicados solo podrán ocultarse.
- Al restaurar un plato se usará una versión verificable; si cambiaron el nombre o la descripción, se exigirá nuevo análisis y confirmación.
- Al restaurar una categoría no se mostrarán los platos que permanezcan ocultos.

### IA y revisión — RF-6, RF-7

- El análisis se activará al guardar por primera vez un plato o al cambiar su nombre o descripción.
- No se activará por cambios de precio, categoría u orden.
- La entrada del modelo será el nombre y la descripción conjuntamente.
- El adaptador traducirá los campos externos de OpenAI al vocabulario de dominio.
- El tiempo de espera será de 10 segundos.
- Un tiempo de espera o error no producirá ausencia de alérgenos.
- Las expresiones ambiguas o contradictorias generarán advertencias y bloquearán la publicación hasta determinar y confirmar los valores finales.
- La confirmación se asociará a la versión exacta que revisó el usuario.
- Una confirmación de una versión obsoleta se rechazará.

### Publicación y QR — RF-8, RF-9, RF-10

- La primera publicación validará que exista al menos un plato publicable y que todos los incluidos estén completos, confirmados y sin advertencias sin resolver.
- Los borradores creados después de la primera publicación no bloquearán el menú público.
- Despublicar conservará la última instantánea para una publicación posterior, pero la ocultará al público.
- Si no queda ningún plato visible, el menú se bloqueará o quedará no disponible, nunca vacío.
- El identificador público se validará con el formato de 3 a 50 caracteres, minúsculas, números y guiones.
- Los nombres reservados y duplicados se rechazarán.
- La dirección pública será estable y no se cambiará después de publicar.
- El QR se generará desde la dirección estable y podrá descargarse como PNG.
- Un fallo de generación no deshará la publicación y permitirá reintentar.

### Actualización y presentación — RF-11, RF-12

- Una edición confirmada o un cambio de visibilidad se reflejará automáticamente en la siguiente instantánea pública.
- Una edición pendiente no sustituirá la última versión pública segura.
- Un fallo de análisis o de confirmación no producirá una carta parcial.
- El menú público no mostrará borradores, cuentas ni datos privados.
- Solo se mostrarán iconos de alérgenos confirmados como presentes.
- Las advertencias se mostrarán únicamente en la vista de revisión hasta ser resueltas.
- La ausencia de todos los alérgenos no se presentará como certificación.
- Cada icono tendrá texto en español; ninguna acción dependerá exclusivamente del color.

## 7. Fases de implementación

### Fase 0 — Fundación — RNF-1, RNF-4, RNF-9, RNF-10

- Inicializar Next.js, TypeScript, lint, formateo y scripts de pruebas.
- Configurar Supabase, migraciones, políticas RLS y entornos.
- Definir el catálogo de 14 alérgenos, estados, errores y mensajes en español.
- Crear datos de prueba y proveedores falsos de OpenAI, QR y correo.
- Configurar cobertura y trazabilidad de `CA` y `CE`.

### Fase 1 — Identidad y aislamiento — RF-1, RF-2, RF-3

- Implementar registro, verificación, reenvío y recuperación.
- Configurar plantillas de correo en español y SMTP.
- Implementar inicio y cierre de sesión, tiempo de inactividad y revocación de sesiones.
- Crear capa de intermediación y políticas RLS.
- Añadir pruebas de aislamiento y mensajes genéricos.

### Fase 2 — Gestión de la carta — RF-4, RF-5

- Implementar migraciones de categorías, platos y versiones.
- Implementar validaciones de longitud, precio, unicidad y categoría.
- Implementar orden, visibilidad, restauración y eliminación condicionada.
- Añadir estados y control de concurrencia por versión.

### Fase 3 — IA y revisión — RF-6, RF-7

- Implementar el contrato del adaptador OpenAI.
- Implementar esquema estructurado y traducción de campos.
- Implementar tiempo de espera, errores, reintento, advertencias e idioma no admitido.
- Implementar la vista de revisión de los 14 valores.
- Implementar confirmación explícita y rechazo de versiones obsoletas.

### Fase 4 — Publicación y vista pública — RF-8, RF-9, RF-10

- Implementar elegibilidad de publicación y creación de instantáneas.
- Implementar publicación, despublicación y retención de la última instantánea.
- Crear la ruta pública `/m/[slug]`.
- Implementar carga útil pública sin datos privados.
- Implementar QR PNG, descarga, vista de impresión y reintento.
- Añadir estados de no publicado, enlace inválido y error de carga.

### Fase 5 — Sincronización y presentación — RF-11, RF-12

- Actualizar la instantánea pública tras cambios válidos.
- Mantener respaldo seguro durante análisis, edición o fallo.
- Implementar restauración de versiones válidas y filtrado de ocultos.
- Implementar iconos, texto, advertencias y accesibilidad.
- Medir rendimiento y disponibilidad desde fuera.

### Fase 6 — Calidad y entrega — Todos los RF y RNF

- Ejecutar la matriz de aceptación completa.
- Ejecutar pruebas de seguridad, rendimiento, recuperación y accesibilidad.
- Verificar cobertura de dominio, componentes, integración y E2E.
- Revisar mensajes, documentación, secretos y configuración de producción.
- Preparar despliegue, migraciones, variables de entorno y reversión.

## 8. Cobertura de requisitos funcionales

| RF | Criterios de aceptación | Casos límite | Parte responsable |
|---|---|---|---|
| RF-1 | CA-RF1-01 a CA-RF1-10 | CE-11, CE-13, CE-14, CE-18, CE-19 | Autenticación, correo, restaurante |
| RF-2 | CA-RF2-01 a CA-RF2-05 | CE-13, CE-14, CE-19 | Sesiones y capa de intermediación |
| RF-3 | CA-RF3-01 a CA-RF3-03 | CE-28 | RLS y autorización |
| RF-4 | CA-RF4-01 a CA-RF4-07 | CE-16, CE-22, CE-25 | Categorías y publicación |
| RF-5 | CA-RF5-01 a CA-RF5-10 | CE-10, CE-12, CE-16, CE-22, CE-24 | Platos y versiones |
| RF-6 | CA-RF6-01 a CA-RF6-09 | CE-1 a CE-5, CE-23 | Adaptador OpenAI y validación |
| RF-7 | CA-RF7-01 a CA-RF7-06 | CE-3, CE-10, CE-24 | Revisión y confirmación |
| RF-8 | CA-RF8-01 a CA-RF8-07 | CE-8, CE-17, CE-26 | Publicación y instantáneas |
| RF-9 | CA-RF9-01 a CA-RF9-07 | CE-9, CE-27 | Ruta pública y carga útil |
| RF-10 | CA-RF10-01 a CA-RF10-08 | CE-9, CE-15, CE-20, CE-21, CE-26 | Slug, URL y QR |
| RF-11 | CA-RF11-01 a CA-RF11-07 | CE-6, CE-7, CE-17, CE-25 | Proyección pública y respaldo |
| RF-12 | CA-RF12-01 a CA-RF12-06 | CE-1, CE-2, CE-3, CE-10 | Presentación y accesibilidad |

## 9. Estrategia de pruebas

### 9.1 Pruebas de dominio

- Catálogo fijo de 14 alérgenos.
- Rechazo de claves duplicadas, ausentes, adicionales o con valores inválidos.
- Transiciones de estado de platos.
- Confirmación de versión actual y rechazo de versiones obsoletas.
- Validación de precios, límites, nombres, categorías y slug.
- Publicación con datos incompletos, sin platos o con advertencias.
- Restauración de versiones válidas y filtrado de platos ocultos.
- Proyección de instantáneas y respaldo seguro.

Cada función de dominio tendrá al menos un caso de éxito, uno de error y uno de límite, conforme a la constitución.

### 9.2 Pruebas del adaptador OpenAI — RF-6, RF-7

- Ejemplo de respuesta válida con exactamente 14 valores.
- Respuesta con campos repetidos, incompletos, adicionales o no booleanos.
- Tiempo de espera de 10 segundos.
- Error HTTP, respuesta vacía y JSON inválido.
- Ambiguidad, contradicción y texto en idioma no admitido.
- Traducción de campos externos al vocabulario de dominio.
- Verificación de que el cliente nunca accede directamente a la clave de OpenAI.

### 9.3 Pruebas de persistencia e integración

- RLS y aislamiento entre restaurantes.
- Unicidad de categorías, platos y slugs.
- Transacción de alta de restaurante.
- Versionado e invalidación de confirmaciones.
- Creación atómica de instantáneas.
- Respaldo de la última instantánea pública confirmada.
- Recuperación de contraseña y revocación de sesiones.
- Proveedores simulados de QR y correo.

### 9.4 Pruebas de componentes y accesibilidad

- Formularios y mensajes en español.
- Estados de carga, error, tiempo de espera y reintento.
- Revisión y corrección de alérgenos.
- Etiquetas de advertencia separadas de los iconos.
- Texto asociado a cada icono.
- Acciones identificables y activables sin depender solo del color.
- Ausencia de borradores y datos privados en la vista pública.

### 9.5 Pruebas E2E

Playwright cubrirá los flujos de todos los `CA`:

- registro, verificación, recuperación e inicio de sesión;
- aislamiento entre restaurantes;
- gestión de categorías y platos;
- análisis válido, inválido, ambiguo y con tiempo de espera;
- confirmación, corrección y confirmación obsoleta;
- publicación, despublicación y menú vacío;
- QR, URL estable y escaneo público;
- edición concurrente, fallo de IA y restauración;
- ausencia de conexión y error de carga.

Las pruebas viven en `pruebas/e2e/**/*.spec.ts` y arrancan la aplicación ya
compilada (`npm run build && npm run start`) contra `http://localhost:3000`. El
navegador por defecto es el Chromium de Playwright; si el equipo no puede
descargarlo, `PLAYWRIGHT_CHANNEL=chrome` o `edge` reutiliza el navegador del
sistema sin cambiar la configuración versionada. Vitest se organiza en dos
proyectos, `dominio` y `componentes`, para poder comprobar las reglas sin
renderizar interfaz. **RNF-9, RNF-10**.

### 9.6 Pruebas no funcionales

- Rendimiento: 100 platos, 10 categorías, 4G estable y primer contenido visible en menos de 3 segundos en percentil 95 de 100 ejecuciones. **RNF-6**.
- Disponibilidad: comprobación externa, sonda de disponibilidad y objetivo mensual del 99,5 %, excluyendo mantenimientos comunicados y estados provocados por la gestión del restaurante. **RNF-7**.
- Recuperación: fallo de IA, edición o carga no altera la última instantánea segura. **RNF-8**.
- Seguridad: RLS, gestión de secretos, sesiones, limitación de intentos, XSS, CSRF y exposición accidental de datos privados. **RNF-2, RNF-3**.
- Trazabilidad: cada `CA-RF` y cada `CE-1` a `CE-28` enlazará con al menos una prueba. **RNF-9**.
- Separación: las reglas de alérgenos, validación y persistencia se probarán sin renderizar UI. **RNF-10**.

## 10. Requisitos no funcionales

- **RNF-1:** la persistencia se hará después de validar el conjunto exacto de 14 alérgenos; los resultados inválidos no se guardarán como verificación.
- **RNF-2:** contraseñas, sesiones y credenciales будут gestionados por el proveedor de autenticación y nunca se expondrán en registros.
- **RNF-3:** la vista pública solo leerá instantáneas publicadas.
- **RNF-4:** la UI, documentación, errores y nombres visibles estarán en español; el DTO de OpenAI vivirá solo en infraestructura.
- **RNF-5:** iconos, advertencias y acciones tendrán texto y operación accesible.
- **RNF-6:** se medirá el primer contenido visible con datos representativos.
- **RNF-7:** se monitorizará la disponibilidad desde fuera y se distinguirán errores técnicos de estados administrativos.
- **RNF-8:** las publicaciones y instantáneas se crearán de forma transaccional y atómica.
- **RNF-9:** la matriz `RF–CA–CE–prueba` será parte de la CI.
- **RNF-10:** el dominio no dependerá de la UI y tendrá cobertura de éxito, error y límites.

## 11. Definición de terminado

- Los 12 RF están implementados y cubiertos por criterios de aceptación.
- Los CE-1 a CE-28 tienen pruebas trazables.
- No se persisten respuestas incompletas, ambiguas o contradictorias como confirmación final.
- El menú público no expone borradores ni información privada.
- La dirección pública y el QR permanecen estables.
- Las ediciones válidas se actualizan automáticamente después de la primera publicación.
- Los mensajes, documentación y código están en español.
- Se han ejecutado pruebas de dominio, integración, componentes, E2E, seguridad, rendimiento y recuperación.
- No se han añadido funcionalidades fuera del alcance.
