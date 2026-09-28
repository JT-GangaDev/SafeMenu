# `dominio/categorias`

Orden, visibilidad y eliminación de categorías de la carta.

## Responsabilidades

- Crear, renombrar, ordenar, ocultar y restaurar categorías.
- Normalizar el nombre y rechazar duplicados dentro del restaurante.
- Impedir el borrado permanente de una categoría ya publicada: se oculta
  (CA-RF4-06, CE-16).

## Reglas

- Los nombres tienen entre 1 y 50 caracteres y no pueden ser solo espacios
  (CE-22).
- Al restaurar una categoría no se muestran los platos que sigan ocultos
  (CA-RF11-04).
- Las reglas van aquí; el acceso a la base de datos, en `infraestructura/`.
