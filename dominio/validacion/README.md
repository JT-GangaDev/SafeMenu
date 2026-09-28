# `dominio/validacion`

Contratos de entrada y salida del dominio.

## Responsabilidades

- Validar longitudes y formatos antes de escribir: nombres, descripciones,
  precios en céntimos, identificador público y correos (CE-22, CE-20).
- Validar que un conjunto de alérgenos tenga exactamente los 14 códigos con
  valores `presente` o `ausente` (RNF-1).
- Normalizar texto para comparar: minúsculas sin tildes, espacios colapsados.
- Devolver errores en español con el código del catálogo, nunca con el valor
  recibido.

## Reglas

- Una validación rechazada explica qué falla, sin incluir secretos ni datos
  privados.
- Un resultado incompleto se rechaza entero: no se guarda parcialmente.
