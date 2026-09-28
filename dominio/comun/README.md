# `dominio/comun`

Vocabulario compartido por más de una parte del dominio.

## Contenido

- `estados.ts`: los seis estados del MVP y su código interno para la base de
  datos. Los estados de plato y los de restaurante se declaran por separado y no
  se solapan.

## Reglas

- Un valor nuevo solo entra aquí si lo usan al menos dos módulos del dominio.
- El valor que ve el restaurante va en español; el código interno va sin tildes
  ni espacios, porque se guarda en columnas y viaja en las respuestas de la API.
- Nada de aquí importa React, Next.js, el entorno o `infraestructura/`.
