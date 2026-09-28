# `infraestructura/openai`

Adaptador de Structured Outputs para el análisis de alérgenos.

## Responsabilidades

- Enviar nombre y descripción conjuntamente, con el modelo configurable en
  `OPENAI_MODEL`.
- Exigir el esquema estricto de 14 alérgenos y traducir sus campos al
  vocabulario de `dominio/alergenos/`.
- Interrumpir la espera a los 10 segundos y devolver un error controlado, nunca
  una ausencia de alérgenos (CA-RF6-05, CE-5).
- Traducir los campos externos al español antes de mostrarlos (RNF-4).

## Reglas

- Implementa la interfaz que define el dominio; el dominio no importa nada de
  aquí.
- La API key se lee con `obtenerConfiguracion()` y nunca se registra.
- Un texto en idioma no admitido se rechaza con mensaje en español
  (CA-RF6-08).
