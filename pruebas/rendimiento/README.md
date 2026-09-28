# `pruebas/rendimiento`

Primer contenido visible con datos representativos.

## Responsabilidades

- Medir el primer contenido visible con 100 platos y 10 categorías sobre una
  conexión 4G estable.
- Comprobar el objetivo de menos de 3 segundos en el percentil 95 de 100
  ejecuciones (RNF-6).
- Comprobar la disponibilidad desde fuera y distinguir un fallo técnico de un
  estado administrativo (RNF-7).

## Reglas

- Se ejecutan aparte de `npm run test`, porque consumen CPU y red.
- Informan de la medida y del umbral; no sustituyen a las pruebas funcionales.
- Los datos son representativos del MVP, no un caso mínimo.
