# Especificación de la primera funcionalidad — SafeMenu MVP

**Estado:** Especificación inicial  
**Objetivo:** Permitir que un restaurante publique un menú QR con alérgenos verificados y mantenerlo actualizado sin reimprimir el código QR.

## Contexto y objetivos

SafeMenu permite que un restaurante cree una carta digital, la comparta mediante un código QR y indique al comensal qué alérgenos se han identificado en cada plato. La necesidad principal es reducir el riesgo de que un comensal tome una decisión al realizar un pedido sin tener visibles los alérgenos de la comida.

El MVP debe permitir que un responsable de restaurante:

- Se registre e inicie sesión.
- Gestione un único restaurante, sus categorías y sus platos.
- Obtenga una propuesta de alérgenos mediante IA al crear un plato o cambiar su nombre o descripción.
- Revise y confirme manualmente esa propuesta antes de publicar el plato.
- Publique el menú explícitamente.
- Obtenga un código QR estable para acceder al menú publicado.
- Actualice automáticamente el menú público después de confirmar una edición.

Para el MVP, una cuenta administra un único restaurante, el restaurante tiene un único menú público y ese menú tiene un único código QR.

El conjunto de alérgenos del MVP es exactamente el siguiente:

1. Cereales con gluten.
2. Crustáceos.
3. Huevos.
4. Pescado.
5. Cacahuetes.
6. Soja.
7. Lácteos.
8. Frutos secos.
9. Apio.
10. Mostaza.
11. Sésamo.
12. Sulfitos.
13. Altramuz.
14. Moluscos.

La IA analiza conjuntamente el nombre y la descripción del plato. El resultado no se considera definitivo hasta que el restaurante lo revisa y lo confirma.

El sistema distingue los siguientes estados de un plato: borrador, verificación pendiente, confirmado y oculto. El menú distingue entre no publicado y publicado. Un resultado final publicable contiene exactamente 14 valores de presencia o ausencia; una advertencia de posible presencia es una señal de revisión y no un valor de alérgeno publicable.

## Usuarios

### Restaurante responsable

Es el usuario que se registra, inicia sesión y administra un único restaurante. Puede crear y editar categorías y platos, revisar resultados de IA, confirmar alérgenos y publicar el menú. Solo puede consultar y modificar la información de su propio restaurante.

### Comensal

Es el usuario final que escanea el código QR o visita el enlace público del menú. No necesita cuenta y solo puede consultar la versión publicada del menú.

## Historias de usuario

- **HU-1 — Registrarse e iniciar sesión:** Como restaurante responsable, quiero crear mi cuenta y acceder a mi panel para gestionar mi carta sin depender de un intermediario.
- **HU-2 — Gestionar la carta:** Como restaurante responsable, quiero crear y editar categorías y platos para mantener mi carta ordenada y actualizada.
- **HU-3 — Obtener una propuesta de alérgenos:** Como restaurante responsable, quiero que la IA analice conjuntamente el nombre y la descripción al guardar un plato para no tener que identificar manualmente los 14 alérgenos desde cero.
- **HU-4 — Revisar y confirmar:** Como restaurante responsable, quiero revisar y corregir la propuesta de la IA antes de publicarla para asumir el control de la información mostrada.
- **HU-5 — Publicar y compartir:** Como restaurante responsable, quiero publicar el menú y obtener un código QR para compartirlo con los comensales.
- **HU-6 — Consultar el menú:** Como comensal, quiero ver la carta y sus alérgenos al escanear el QR para elegir con información visible.
- **HU-7 — Mantener el menú actualizado:** Como restaurante responsable, quiero que una edición confirmada se refleje sin cambiar el QR para no tener que reimprimir las mesas.

## Requisitos funcionales

### RF-1. Registro de restaurante

El usuario debe poder registrar un restaurante mediante un correo, una contraseña y el nombre del restaurante. El MVP no exige datos empresariales adicionales. El acceso al panel requiere verificar el correo y el usuario debe poder recuperar su contraseña.

**Criterios de aceptación (EARS):**

- **CA-RF1-01 — Cuando** un usuario envíe datos de registro válidos, el sistema crea una cuenta y un único restaurante, envía la verificación del correo y mantiene el acceso al panel bloqueado hasta verificarla.
- **CA-RF1-02 — Cuando** un usuario complete la verificación de su correo, el sistema activa el acceso y muestra el panel de gestión.
- **CA-RF1-03 — Si** el correo ya está registrado, el sistema rechaza el registro, no crea un duplicado y muestra un mensaje genérico en español.
- **CA-RF1-04 — Si** falta un dato obligatorio o el correo no tiene un formato válido, el sistema rechaza el registro e indica qué debe corregirse.
- **CA-RF1-05 — Cuando** un usuario solicite reenviar la verificación, el sistema envía un nuevo enlace y no desactiva el enlace anterior todavía vigente.
- **CA-RF1-06 — Cuando** un usuario abra un enlace de verificación vigente por primera vez, el sistema lo invalida después de usarlo.
- **CA-RF1-07 — Si** un enlace de verificación ha caducado o ya se ha usado, el sistema muestra un mensaje en español y permite solicitar uno nuevo.
- **CA-RF1-08 — Cuando** un usuario solicite recuperar su contraseña con un correo registrado, el sistema envía instrucciones de recuperación en español.
- **CA-RF1-09 — Cuando** un usuario complete una recuperación vigente y confirme una contraseña nueva, el sistema la actualiza y cierra las sesiones existentes.
- **CA-RF1-10 — Si** la solicitud de recuperación no es válida, ha caducado o el enlace ya se ha usado, el sistema muestra un mensaje genérico y no revela información de otras cuentas.

### RF-2. Inicio y cierre de sesión

El usuario debe poder autenticarse para acceder a su restaurante y cerrar la sesión cuando termine. Una sesión sin actividad se cierra después de 30 minutos.

**Criterios de aceptación (EARS):**

- **CA-RF2-01 — Cuando** un usuario introduzca credenciales válidas y su correo esté verificado, el sistema le permite acceder únicamente a su restaurante.
- **CA-RF2-02 — Si** las credenciales no son válidas o el correo no está verificado, el sistema muestra un mensaje genérico en español y no permite acceder al panel.
- **CA-RF2-03 — Cuando** un usuario cierre sesión, el sistema elimina el acceso a su panel y exige autenticación para volver a entrar.
- **CA-RF2-04 — Si** una sesión permanece sin actividad durante 30 minutos, el sistema la cierra y dirige al usuario al inicio de sesión.
- **CA-RF2-05 — Cuando** el usuario complete una recuperación de contraseña, el sistema cierra las sesiones abiertas para proteger la cuenta.

### RF-3. Aislamiento entre restaurantes

Cada cuenta solo puede ver y modificar la información del restaurante que administra.

**Criterios de aceptación (EARS):**

- **CA-RF3-01 — Cuando** un usuario autenticado abra su panel, el sistema muestra únicamente las categorías, platos y datos de su restaurante.
- **CA-RF3-02 — Si** un usuario intenta consultar o modificar información de otro restaurante, el sistema deniega la operación sin revelar la existencia de esos datos.
- **CA-RF3-03 — Si** un usuario intenta añadir una categoría o un plato a otro restaurante, el sistema no guarda el cambio.

### RF-4. Gestión de categorías

El restaurante debe poder crear, editar, ordenar y ocultar las categorías de su carta. Los nombres de categoría tienen entre 1 y 50 caracteres y no pueden repetirse dentro del mismo restaurante.

**Criterios de aceptación (EARS):**

- **CA-RF4-01 — Cuando** un usuario guarde una categoría con un nombre válido, el sistema la incorpora a la carta de su restaurante.
- **CA-RF4-02 — Si** el nombre de una categoría está vacío, supera 50 caracteres o ya existe, el sistema rechaza el guardado e identifica el conflicto.
- **CA-RF4-03 — Cuando** un usuario cambie el orden de las categorías, el menú publicado respeta el nuevo orden.
- **CA-RF4-04 — Cuando** un usuario oculte una categoría, el sistema la retira de la siguiente versión pública del menú y conserva sus datos para poder volver a mostrarla.
- **CA-RF4-05 — Cuando** el usuario vuelva a mostrar una categoría, el sistema utiliza su última versión válida y no muestra platos que permanezcan ocultos.
- **CA-RF4-06 — Si** una categoría nunca se ha publicado, el sistema permite eliminarla de forma permanente después de una confirmación explícita.
- **CA-RF4-07 — Si** una categoría ya se ha publicado, el sistema no permite eliminarla de forma permanente y solo ofrece ocultarla.

### RF-5. Gestión de platos

El restaurante debe poder crear y editar el nombre, la descripción, el precio y la categoría de un plato, y ocultar platos. El nombre tiene entre 1 y 100 caracteres, la descripción entre 1 y 2000, el precio entre 0 y 999999,99 con dos decimales y la moneda del MVP es el euro.

**Criterios de aceptación (EARS):**

- **CA-RF5-01 — Cuando** un usuario guarde un plato con nombre, descripción, precio y categoría válidos, el sistema conserva el texto en borrador e inicia la verificación; tras un análisis utilizable, el plato pasa a verificación pendiente y, tras la revisión y confirmación explícitas, a confirmado.
- **CA-RF5-02 — Si** falta el nombre o la descripción, se superan sus límites, el precio no es válido o ya existe otro plato con el mismo nombre en la categoría, el sistema rechaza el guardado e identifica el conflicto.
- **CA-RF5-03 — Cuando** un usuario cambie el nombre o la descripción, el sistema inicia un análisis de alérgenos e invalida la confirmación anterior.
- **CA-RF5-04 — Cuando** un usuario cambie el precio, la categoría o el orden, el sistema conserva la verificación de alérgenos de la versión actual.
- **CA-RF5-05 — Cuando** un usuario edite un plato, el sistema conserva sus cambios y los somete al flujo de verificación correspondiente.
- **CA-RF5-06 — Si** un plato no tiene una categoría válida, el sistema no lo incluye en el menú público.
- **CA-RF5-07 — Cuando** un usuario oculte un plato, el sistema lo retira de la siguiente versión pública del menú y conserva sus datos para poder volver a mostrarlo.
- **CA-RF5-08 — Cuando** el usuario vuelva a mostrar un plato sin cambios de contenido, el sistema utiliza su última versión verificada; si cambian el nombre o la descripción, exige un nuevo análisis y una nueva confirmación.
- **CA-RF5-09 — Si** un plato nunca se ha publicado, el sistema permite eliminarlo de forma permanente después de una confirmación explícita.
- **CA-RF5-10 — Si** un plato ya se ha publicado, el sistema no permite eliminarlo de forma permanente y solo ofrece ocultarlo.

### RF-6. Análisis de alérgenos mediante IA

El sistema debe analizar conjuntamente el nombre y la descripción de un plato automáticamente al guardarlo por primera vez o al cambiar cualquiera de esos dos campos, sin exigir un botón adicional. El análisis no se activa por cambios de precio, categoría u orden.

**Criterios de aceptación (EARS):**

- **CA-RF6-01 — Cuando** se guarde por primera vez un plato o se cambien su nombre o descripción, el sistema solicita un análisis de sus 14 alérgenos.
- **CA-RF6-02 — Cuando** el análisis termine dentro del tiempo máximo de 10 segundos, el sistema muestra una propuesta con un valor de presencia o ausencia para cada uno de los 14 alérgenos.
- **CA-RF6-03 — Si** el resultado omite un alérgeno, contiene un alérgeno adicional, repite una clave o contiene un valor que no sea de presencia o ausencia, el sistema rechaza el resultado completo.
- **CA-RF6-04 — Si** el resultado no es utilizable, el sistema conserva el texto del plato en borrador, no guarda ese resultado como verificación y ofrece reintentar el análisis.
- **CA-RF6-05 — Si** el servicio de IA no responde en 10 segundos, el sistema interrumpe la espera, conserva el texto del plato en borrador y ofrece reintentar sin presentar ausencia de alérgenos.
- **CA-RF6-06 — Si** la descripción contiene una expresión ambigua sobre la presencia de un alérgeno, el sistema no la interpreta como ausencia, muestra una advertencia de posible presencia y exige resolver la ambigüedad y confirmar los valores finales antes de publicar.
- **CA-RF6-07 — Si** el nombre y la descripción contienen afirmaciones contradictorias, el sistema muestra una advertencia, exige resolverlas y confirmar los valores finales antes de publicar.
- **CA-RF6-08 — Si** el texto está en un idioma no admitido por el MVP, el sistema lo rechaza con un mensaje en español y no genera una verificación.
- **CA-RF6-09 — Cuando** se cambie el nombre o la descripción de un plato después de un análisis, el sistema invalida la propuesta anterior y exige un nuevo análisis antes de confirmar la edición.

### RF-7. Revisión y confirmación de alérgenos

La propuesta de la IA debe ser revisable y debe recibir una confirmación explícita del restaurante. La confirmación se asocia a la versión exacta del nombre, la descripción y los valores de alérgenos que el usuario revisó.

**Criterios de aceptación (EARS):**

- **CA-RF7-01 — Cuando** exista una propuesta válida, el sistema muestra los 14 alérgenos y permite al usuario corregir cualquier valor.
- **CA-RF7-02 — Cuando** exista una advertencia de posible presencia, el sistema identifica los alérgenos afectados y no permite publicar el plato hasta que el usuario determine los valores finales de esos alérgenos y confirme explícitamente esa versión.
- **CA-RF7-03 — Cuando** el usuario modifique un valor de la propuesta, el sistema exige una nueva confirmación antes de considerar el plato verificado.
- **CA-RF7-04 — Cuando** el usuario confirme la propuesta o sus correcciones, el sistema marca el conjunto de alérgenos como confirmado para esa versión del plato.
- **CA-RF7-05 — Si** cambian el nombre o la descripción del plato después de la confirmación, el sistema invalida la confirmación y exige un nuevo análisis y una nueva confirmación.
- **CA-RF7-06 — Si** el usuario intenta confirmar una versión que ya no es la versión actual, el sistema rechaza la confirmación y muestra que el contenido cambió.

### RF-8. Publicación explícita del menú

El menú debe permanecer oculto hasta que el restaurante lo publique de forma explícita. La primera publicación exige que todos los platos que se pretendan incluir inicialmente estén completos y confirmados. Después de la primera publicación, los borradores nuevos no bloquean la versión pública y permanecen ocultos hasta su confirmación.

**Criterios de aceptación (EARS):**

- **CA-RF8-01 — Cuando** un usuario solicite la primera publicación, el sistema comprueba que existe al menos un plato publicable y que todos los platos que se incluirán en esa publicación tienen sus datos y alérgenos confirmados.
- **CA-RF8-02 — Si** algún plato que se incluya en la primera publicación tiene datos incompletos, alérgenos sin confirmar o una advertencia no resuelta, el sistema bloquea la primera publicación e identifica los platos pendientes.
- **CA-RF8-03 — Cuando** la comprobación termine correctamente, el sistema publica la versión actual del menú y la hace accesible al comensal.
- **CA-RF8-04 — Cuando** se cree un plato después de la primera publicación, el sistema lo mantiene fuera de la versión pública hasta que sea confirmado; su estado no bloquea el menú ya publicado.
- **CA-RF8-05 — Si** un usuario solicite despublicar el menú, el sistema lo retira del acceso público y conserva la última versión guardada para una publicación posterior.
- **CA-RF8-06 — Si** no queda ningún plato visible, el sistema bloquea la publicación; si el menú se despublica, queda no disponible y nunca vacío.
- **CA-RF8-07 — Cuando** se guarde un borrador después de la primera publicación, el sistema no lo publica implícitamente.

### RF-9. Menú público

El comensal debe consultar la carta publicada sin necesidad de registrarse. La vista pública muestra siempre la última versión pública confirmada.

**Criterios de aceptación (EARS):**

- **CA-RF9-01 — Cuando** un comensal abra un código QR o enlace público válido, el sistema muestra el nombre del restaurante y los datos publicados de sus categorías, platos, precios y descripciones.
- **CA-RF9-02 — Cuando** se muestren los platos de un menú publicado, el sistema muestra un icono y un texto legible por cada alérgeno confirmado como presente.
- **CA-RF9-03 — Si** un alérgeno no está confirmado como presente, el sistema no muestra un icono que lo identifique como presente.
- **CA-RF9-04 — Cuando** un comensal abra un menú publicado, el sistema muestra el aviso: «La información se basa en el análisis asistido por IA y la confirmación del restaurante. Si tienes una alergia, consulta los ingredientes con el personal».
- **CA-RF9-05 — Cuando** un comensal abra el menú, el sistema no muestra borradores, datos de la cuenta ni información privada del restaurante.
- **CA-RF9-06 — Si** el menú no existe, no está publicado o el enlace no es válido, el sistema muestra un mensaje de indisponibilidad en español.
- **CA-RF9-07 — Si** el contenido no puede cargarse, el sistema muestra un mensaje en español de error o un aviso de falta de conexión y no presenta una versión parcial del menú como válida.

### RF-10. Dirección pública y código QR estables

El restaurante debe tener una dirección pública identificable y un único código QR asociado a su menú publicado. El identificador tiene entre 3 y 50 caracteres, utiliza únicamente letras minúsculas, números y guiones, y no puede ser un nombre reservado.

**Criterios de aceptación (EARS):**

- **CA-RF10-01 — Cuando** el usuario elija un identificador público antes de publicar, el sistema comprueba su formato, su disponibilidad y lo asocia a su restaurante.
- **CA-RF10-02 — Cuando** el menú se publique, el sistema fija la dirección pública y ofrece un único código QR que lleva a ese menú.
- **CA-RF10-03 — Cuando** el usuario solicite el QR, el sistema permite descargarlo como imagen PNG y abrir una vista preparada para imprimirlo.
- **CA-RF10-04 — Si** la generación del QR falla, el sistema mantiene publicado el menú, informa del fallo y permite reintentar la generación.
- **CA-RF10-05 — Si** el identificador ya se ha publicado, el sistema impide cambiarlo y mantiene válida la dirección anterior.
- **CA-RF10-06 — Cuando** un comensal escanee el código QR, el sistema abre la versión pública del menú sin solicitar una cuenta.
- **CA-RF10-07 — Cuando** se edite un plato, una categoría o un dato del menú, el sistema mantiene válidos la dirección pública y el mismo código QR.
- **CA-RF10-08 — Si** el menú no está publicado, el sistema no permite que el código QR se presente como disponible ni conduzca a una carta privada o incompleta.

### RF-11. Actualización automática del contenido

Después de la primera publicación, las ediciones guardadas y válidas de platos o categorías y los cambios de visibilidad de platos o categorías deben reflejarse automáticamente en el menú público sin cambiar la dirección ni el QR.

**Criterios de aceptación (EARS):**

- **CA-RF11-01 — Cuando** el restaurante confirme una edición de un plato ya publicado o guarde una edición válida de una categoría ya publicada, el sistema muestra la nueva versión en la siguiente visita al menú público.
- **CA-RF11-02 — Cuando** una edición esté pendiente de análisis o confirmación, el sistema conserva la última versión pública segura y no expone el borrador sin verificar.
- **CA-RF11-03 — Cuando** el restaurante oculte un plato o una categoría, el sistema lo retira de la siguiente visita al menú público sin eliminar sus datos.
- **CA-RF11-04 — Cuando** el restaurante vuelva a mostrar un plato o una categoría, el sistema restaura la última versión válida del elemento; si el elemento es un plato, solo se muestra una versión verificable y, si cambiaron el nombre o la descripción, exige un nuevo análisis y una nueva confirmación. Los platos que sigan ocultos no se muestran.
- **CA-RF11-05 — Si** el análisis de una edición falla, el sistema mantiene disponible la última versión pública confirmada y permite reintentar la verificación.
- **CA-RF11-06 — Cuando** una edición se confirme correctamente después de un fallo, el sistema sustituye la versión anterior y actualiza el menú público sin cambiar la dirección ni el QR.
- **CA-RF11-07 — Si** no queda ningún plato visible después de ocultar contenido, el sistema muestra un mensaje de menú no disponible y no presenta una carta vacía como válida.

### RF-12. Presentación segura de alérgenos

La información de alérgenos debe ser comprensible y no debe ocultar incertidumbre. Una advertencia de posible presencia es una etiqueta distinta de los iconos de alérgenos confirmados.

**Criterios de aceptación (EARS):**

- **CA-RF12-01 — Cuando** un plato esté publicado, el sistema muestra únicamente alérgenos confirmados para la versión visible de ese plato.
- **CA-RF12-02 — Cuando** un alérgeno esté marcado como presente, el sistema muestra un icono identificable y el nombre del alérgeno en español.
- **CA-RF12-03 — Cuando** exista una advertencia de posible presencia en la vista de revisión, el sistema muestra una etiqueta identificativa, no la presenta como ausencia y no permite usarla como resultado final publicable.
- **CA-RF12-04 — Cuando** el usuario resuelva una advertencia y confirme la versión, el sistema sustituye la etiqueta por iconos de los alérgenos presentes o por una indicación revisada de que no se ha detectado ninguno de los 14 alérgenos, sin presentarla como certificación de ausencia.
- **CA-RF12-05 — Si** la información solo puede identificarse mediante color, el sistema ofrece también una etiqueta textual.
- **CA-RF12-06 — Si** no se detecta ninguno de los 14 alérgenos en la propuesta confirmada, el sistema no presenta esa comprobación como una certificación de ausencia de alérgenos.

## Requisitos no funcionales

- **RNF-1. Persistencia segura:** Solo una versión final con exactamente los 14 alérgenos y valores de presencia o ausencia puede guardarse como verificación. Un resultado inválido o una advertencia no se guarda como resultado final.
- **RNF-2. Seguridad de la información:** Las contraseñas no deben mostrarse ni almacenarse de forma legible; las sesiones deben estar protegidas, cerrar el acceso al finalizar o caducar y cerrarse tras una recuperación de contraseña.
- **RNF-3. Privacidad:** El menú público debe mostrar únicamente la información comercial publicada; los datos de la cuenta y los borradores no pueden ser consultados por comensales.
- **RNF-4. Idioma y frontera:** La documentación, las instrucciones, los mensajes y los nombres visibles de alérgenos deben estar en español. Los campos externos de la IA se traducen y validan en la frontera del dominio.
- **RNF-5. Accesibilidad:** Los iconos de alérgenos deben tener texto asociado; las advertencias deben tener texto; las acciones principales deben poder identificarse y activarse sin depender únicamente del color.
- **RNF-6. Rendimiento:** En un dispositivo móvil de gama media, con conexión 4G estable y un menú de hasta 100 platos y 10 categorías, el primer contenido visible del menú debe aparecer en un máximo de 3 segundos en el percentil 95 de 100 ejecuciones.
- **RNF-7. Disponibilidad:** El menú publicado debe estar disponible al menos el 99,5 % de cada mes, medido desde fuera y excluyendo ventanas de mantenimiento comunicadas con al menos 48 horas de antelación y un máximo de 4 horas acumuladas. Los estados de indisponibilidad provocados por la gestión del restaurante no cuentan como incidentes de disponibilidad.
- **RNF-8. Recuperación:** Un fallo durante el análisis o la edición no debe alterar la última versión pública confirmada ni producir una versión pública parcial.
- **RNF-9. Trazabilidad y pruebas:** Cada RF debe estar asociado a criterios de aceptación y a pruebas de éxito, error y límite; cada caso de la sección de casos límite debe tener una prueba trazable.
- **RNF-10. Dominio separado de la UI:** La lógica de alérgenos, validación y persistencia debe poder verificarse sin renderizar la interfaz; las pruebas de interfaz no sustituyen las pruebas de dominio.

## Trazabilidad de pruebas

Cada criterio de aceptación debe quedar asociado a una prueba identificable. Cada criterio incluye su identificador `CA-RFx-yy`. Cada caso límite se ejecuta dentro de las pruebas indicadas para la fila de su requisito. La matriz mínima de cobertura es la siguiente:

| Requisito | Criterios de aceptación | Éxito | Error | Casos límite relacionados |
|---|---|---|---|---|
| RF-1 | CA-RF1-01, CA-RF1-02, CA-RF1-05, CA-RF1-06, CA-RF1-08, CA-RF1-09 → T-RF1-01; CA-RF1-03, CA-RF1-04, CA-RF1-07, CA-RF1-10 → T-RF1-02 | T-RF1-01: registro, verificación y recuperación válidos | T-RF1-02: correo duplicado, datos, enlace o recuperación inválidos | CE-11, CE-13, CE-14, CE-18, CE-19 |
| RF-2 | CA-RF2-01, CA-RF2-03, CA-RF2-04, CA-RF2-05 → T-RF2-01; CA-RF2-02 → T-RF2-02 | T-RF2-01: acceso verificado, cierre y recuperación de sesión | T-RF2-02: credenciales o verificación inválidas | CE-13, CE-14, CE-19 |
| RF-3 | CA-RF3-01 → T-RF3-01; CA-RF3-02, CA-RF3-03 → T-RF3-02 | T-RF3-01: acceso a datos propios | T-RF3-02: intento de acceso a otro restaurante | CE-28 |
| RF-4 | CA-RF4-01, CA-RF4-03, CA-RF4-04, CA-RF4-05, CA-RF4-06 → T-RF4-01; CA-RF4-02, CA-RF4-07 → T-RF4-02 | T-RF4-01: crear, ordenar, ocultar, restaurar y eliminar categorías no publicadas | T-RF4-02: nombre inválido o eliminación no permitida | CE-16, CE-22, CE-25 |
| RF-5 | CA-RF5-01, CA-RF5-03, CA-RF5-04, CA-RF5-05, CA-RF5-07, CA-RF5-08, CA-RF5-09 → T-RF5-01; CA-RF5-02, CA-RF5-06, CA-RF5-10 → T-RF5-02 | T-RF5-01: crear, editar, ocultar, restaurar y eliminar platos no publicados | T-RF5-02: datos o precio inválidos, nombre duplicado o eliminación no permitida | CE-10, CE-12, CE-16, CE-22, CE-24 |
| RF-6 | CA-RF6-01, CA-RF6-02 → T-RF6-01; CA-RF6-03, CA-RF6-04, CA-RF6-05, CA-RF6-06, CA-RF6-07, CA-RF6-08, CA-RF6-09 → T-RF6-02 | T-RF6-01: análisis completo de nombre y descripción | T-RF6-02: resultado inválido, tiempo de espera agotado, ambigüedad, contradicción, idioma no admitido o invalidación | CE-1, CE-2, CE-3, CE-4, CE-5, CE-23 |
| RF-7 | CA-RF7-01, CA-RF7-04 → T-RF7-01; CA-RF7-02, CA-RF7-03, CA-RF7-05, CA-RF7-06 → T-RF7-02 | T-RF7-01: corrección y confirmación de una versión | T-RF7-02: corrección, cambio de contenido, confirmación obsoleta o advertencia sin resolver | CE-3, CE-10, CE-24 |
| RF-8 | CA-RF8-01, CA-RF8-03, CA-RF8-04, CA-RF8-07 → T-RF8-01; CA-RF8-02, CA-RF8-05, CA-RF8-06 → T-RF8-02 | T-RF8-01: primera publicación y actualización válidas | T-RF8-02: publicación incompleta, despublicación o menú vacío | CE-8, CE-17, CE-26 |
| RF-9 | CA-RF9-01, CA-RF9-02, CA-RF9-03, CA-RF9-04, CA-RF9-05 → T-RF9-01; CA-RF9-06, CA-RF9-07 → T-RF9-02 | T-RF9-01: consulta pública, alérgenos confirmados y ausencia de falsos positivos | T-RF9-02: enlace, carga o contenido no disponible | CE-9, CE-27 |
| RF-10 | CA-RF10-01, CA-RF10-02, CA-RF10-03, CA-RF10-05, CA-RF10-06, CA-RF10-07 → T-RF10-01; CA-RF10-04, CA-RF10-08 → T-RF10-02 | T-RF10-01: identificador, QR y descarga válidos | T-RF10-02: conflicto, fallo de generación o menú no publicado | CE-9, CE-15, CE-20, CE-21, CE-26 |
| RF-11 | CA-RF11-01, CA-RF11-03, CA-RF11-04, CA-RF11-06 → T-RF11-01; CA-RF11-02, CA-RF11-05, CA-RF11-07 → T-RF11-02 | T-RF11-01: actualización y restauración automáticas | T-RF11-02: edición pendiente, fallo o menú vacío | CE-6, CE-7, CE-17, CE-25 |
| RF-12 | CA-RF12-01, CA-RF12-02, CA-RF12-04, CA-RF12-05 → T-RF12-01; CA-RF12-03, CA-RF12-06 → T-RF12-02 | T-RF12-01: iconos, etiquetas y aviso visibles | T-RF12-02: ausencia de certificación o advertencia no resuelta | CE-1, CE-2, CE-3, CE-10 |

## Casos límite

| ID | Situación | Comportamiento esperado |
|---|---|---|
| CE-1 | La descripción no contiene ninguno de los 14 alérgenos. | La IA puede devolver los 14 valores como ausencia; el restaurante debe revisar y confirmar el resultado, y no se presenta como certificación de seguridad. |
| CE-2 | La descripción contiene los 14 alérgenos. | Se muestran los 14 indicadores como presentes después de la confirmación. |
| CE-3 | La descripción usa expresiones ambiguas como «puede contener» o «según preparación». | El sistema muestra una advertencia de posible presencia, no la convierte en ausencia, exige resolver la ambigüedad y confirmar los valores finales antes de publicar. |
| CE-4 | La IA devuelve campos repetidos, incompletos o con valores no válidos. | Se rechaza todo el resultado, no se guarda como verificación, el texto del plato permanece en borrador y se permite reintentar. |
| CE-5 | La IA no responde o se interrumpe el análisis. | Se conserva el texto del plato en borrador, se informa del fallo, no se guarda una ausencia y no se publica el plato. |
| CE-6 | Se edita un plato que ya está publicado. | La última versión pública confirmada permanece disponible hasta que la nueva versión supere el análisis y la confirmación. |
| CE-7 | Se crea un plato nuevo después de publicar el menú. | El plato no aparece en el menú público hasta ser confirmado; después aparece automáticamente. |
| CE-8 | Se intenta publicar un menú sin platos publicables. | La publicación se rechaza y se informa de que falta al menos un plato válido y confirmado. |
| CE-9 | Se escanea el QR antes de publicar el menú. | Se muestra un mensaje de menú no disponible, sin exponer borradores ni datos privados. |
| CE-10 | El restaurante corrige manualmente un valor de la IA. | El valor corregido queda pendiente de confirmación y no sustituye al anterior hasta ser confirmado. |
| CE-11 | Se introduce un correo que ya pertenece a otra cuenta. | El registro se rechaza sin crear una segunda cuenta ni revelar información de la existente. |
| CE-12 | Una descripción contiene texto largo, acentos o caracteres especiales. | El sistema conserva el texto introducido y mantiene las mismas reglas de validación y análisis. |
| CE-13 | El usuario se registra pero no verifica su correo. | El sistema conserva la cuenta y el restaurante, pero bloquea el acceso al panel hasta completar la verificación. |
| CE-14 | El usuario intenta recuperar una contraseña con un correo no registrado o una solicitud caducada. | El sistema muestra un mensaje genérico y no revela información sobre otras cuentas. |
| CE-15 | El usuario intenta usar un identificador público que ya pertenece a otro restaurante. | El sistema rechaza el identificador y permite elegir otro antes de publicar. |
| CE-16 | El restaurante intenta eliminar de forma permanente una categoría o un plato que ya se han publicado. | El sistema rechaza la eliminación permanente y ofrece ocultarlos sin eliminar sus datos. |
| CE-17 | El restaurante oculta todos los platos de un menú publicado. | El sistema muestra un mensaje de menú no disponible y no presenta una carta vacía como válida. |
| CE-18 | El enlace de verificación se usa dos veces o ha caducado. | El segundo uso muestra un mensaje en español y permite solicitar un enlace nuevo. |
| CE-19 | El usuario completa una recuperación de contraseña. | La contraseña nueva se acepta, se cierran las sesiones existentes y el acceso posterior requiere la nueva contraseña. |
| CE-20 | El identificador público contiene caracteres no permitidos, un nombre reservado o ya está ocupado. | El sistema lo rechaza, explica el conflicto y permite elegir otro antes de la primera publicación. |
| CE-21 | La generación del QR falla. | El menú permanece publicado y el usuario recibe un error y una opción de reintento. |
| CE-22 | Una categoría contiene solo espacios, supera 50 caracteres o repite un nombre en el restaurante; un plato contiene solo espacios, supera sus límites o repite su nombre en la misma categoría. | El sistema rechaza el guardado e identifica el conflicto. |
| CE-23 | El nombre y la descripción usan negaciones, sinónimos, marcas o afirmaciones contradictorias. | El sistema muestra una advertencia de posible presencia, exige revisión manual y no deduce ni confirma automáticamente una ausencia. |
| CE-24 | Se edita el nombre o la descripción de un plato en dos sesiones antes de que termine un análisis. | El sistema invalida el análisis y la confirmación anteriores, conserva la última versión pública segura, analiza el contenido vigente y exige una nueva revisión y confirmación. |
| CE-25 | Se oculta una categoría que contiene platos publicados. | Sus platos se retiran de la vista pública y conservan sus datos. Al restaurar la categoría, solo vuelven a mostrarse los platos que siguen verificados y no estaban ocultos. |
| CE-26 | Se despublica un menú y luego se intenta acceder a su dirección o QR. | El sistema muestra un mensaje de menú no disponible y no expone la versión guardada. |
| CE-27 | El comensal abre el menú sin conexión o durante un fallo de carga. | El sistema muestra un estado de error o un aviso de falta de conexión, en español, y no presenta una carta parcial como válida. |
| CE-28 | Un usuario autenticado intenta consultar o modificar categorías, platos o datos de otro restaurante. | El sistema deniega la operación, no revela la existencia de esos datos y no guarda ningún cambio. |

## Fuera de alcance

- Gestionar varios restaurantes desde una misma cuenta.
- Gestionar varios menús o cartas para un mismo restaurante.
- Invitar empleados, definir permisos o roles, o crear una organización con varios responsables.
- Pedidos, pagos, reservas, reparto o programas de fidelización.
- Suscripciones de pago, planes o facturación.
- Alérgenos adicionales o grupos de alérgenos distintos de los 14 definidos.
- Diagnóstico médico, asesoramiento nutricional, certificación legal o garantía de ausencia de alérgenos.
- Análisis automático de fotografías, etiquetas, recetas de proveedores o fuentes externas.
- Aplicación móvil nativa, funcionamiento sin conexión o modo multiusuario simultáneo.
- Idiomas adicionales al español.
- Personalización avanzada de plantillas, dominios propios o campañas distintas por código QR.
- Códigos QR separados por mesa, sala, zona o campaña; el MVP utiliza un único código por menú.
- Analítica avanzada de escaneos, comparativas de rendimiento o campañas de marketing.
- Importación masiva, exportación de datos o integraciones con sistemas de gestión externos.

## Criterios de finalización

El MVP se considera terminado cuando:

- Un restaurante puede registrarse, verificar su correo, recuperar su contraseña, iniciar sesión y cerrar sesión.
- La cuenta administra un único restaurante, un único menú público y un único código QR.
- El acceso no verificado, las sesiones caducadas y las recuperaciones de contraseña tienen el comportamiento definido.
- Puede crear, editar, ordenar, ocultar y restaurar categorías y platos con los límites y formatos definidos.
- Un plato publicado o una categoría publicada no puede eliminarse de forma permanente; solo puede ocultarse. Un elemento que nunca se publicó puede eliminarse de forma permanente.
- La IA analiza el nombre y la descripción al crear un plato o cambiar esos campos, y no se activa por cambios de precio, categoría u orden.
- Cada resultado final válido cubre exactamente los 14 alérgenos; un resultado inválido no se guarda como verificación.
- Las expresiones ambiguas o contradictorias generan una advertencia y bloquean la publicación hasta que se determinen y confirmen los valores finales de los alérgenos afectados.
- La primera publicación es explícita; las ediciones confirmadas y los cambios de visibilidad posteriores se actualizan automáticamente.
- El usuario puede despublicar el menú sin perder la última versión guardada.
- El identificador público cumple el formato definido y queda fijo después de la primera publicación.
- El QR puede descargarse e imprimirse, no cambia durante la vida del menú y su generación se controla sin alterar la publicación si falla.
- El menú publicado muestra categorías, platos, precios, descripciones y el aviso para el comensal; cada plato muestra un icono y un nombre en español por cada alérgeno confirmado como presente en su versión visible.
- Las actualizaciones de contenido conservan la dirección pública y el mismo QR, por lo que no requieren reimprimirlo.
- Un fallo de IA, una edición pendiente o una carga pública incompleta no expone borradores ni sustituye la última versión pública segura.
- La matriz RF–criterio–prueba asocia cada criterio de aceptación de RF-1 a RF-12 con pruebas identificables y cubre los casos CE-1 a CE-28.
- La lógica de dominio se prueba sin interfaz y los campos externos de IA se traducen y validan en la frontera.
- Los mensajes, las indicaciones, la documentación y los nombres visibles de alérgenos están en español.

## Dudas abiertas

No quedan dudas abiertas para el alcance del MVP.
