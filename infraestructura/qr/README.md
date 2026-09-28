# `infraestructura/qr`

Generación del código QR en PNG.

## Responsabilidades

- Generar un único QR por menú a partir de la dirección pública estable
  (`NEXT_PUBLIC_URL` más `/m/[slug]`).
- Ofrecer descarga en PNG y una vista preparada para imprimir
  (CA-RF10-03).
- Informar del fallo y permitir reintentar sin deshacer la publicación
  (CA-RF10-04, CE-21).

## Reglas

- El QR no se presenta como disponible si el menú no está publicado
  (CA-RF10-08, CE-9).
- El mismo QR sigue siendo válido después de cualquier edición del menú
  (CA-RF10-07).
