# `pruebas/dobles`

Proveedores de prueba falsos de IA, QR, correo y tiempo (T-006).

Las pruebas del dominio se ejecutan en Node, sin interfaz y sin red. Estos
dobles sustituyen a OpenAI, al generador de QR y a SMTP, y controlan el paso del
tiempo, para que T-022, T-038 y T-047 puedan comprobar los criterios de
aceptación sin llamar a ningún servicio real.

## Archivos

- `contrato.ts`: nombres de los campos externos, las 14 claves de la respuesta,
  la tabla que las traduce a códigos de `dominio/alergenos/` y el puerto
  `Reloj`.
- `ia.ts`: respuesta de IA como texto crudo y escenario a escenario.
- `qr.ts`: PNG de 1x1 válido y siempre el mismo.
- `correo.ts`: registro de lo que se habría enviado.
- `reloj.ts`: reloj virtual con `ahora`, `dormir` y `avanzar`.

## Escenarios de IA y criterios que permiten probar

| Escenario | Qué devuelve | Criterio |
|---|---|---|
| `valida` | Los 14 valores en clave externa | CA-RF6-02, CE-1, CE-2 |
| `clave_repetida` | Un código repetido en el texto | CA-RF6-03, CE-4 |
| `clave_ausente` | 13 códigos | CA-RF6-03 |
| `clave_adicional` | 15 códigos, uno no permitido | CA-RF6-03 |
| `valor_invalido` | Un valor que no es presencia ni ausencia | CA-RF6-03, CE-4 |
| `respuesta_vacia` | Texto vacío | CA-RF6-04 |
| `json_invalido` | Texto truncado | CA-RF6-04 |
| `error_http` | Estado 500 | CA-RF6-04, CE-5 |
| `error_red` | Rechaza la promesa | CE-5 |
| `advertencia_ambigua` | Aviso de posible presencia | CA-RF6-06, CE-3, CE-23 |
| `advertencia_contradictoria` | Aviso de contradicción | CA-RF6-07, CE-23 |
| `texto_en_ingles` | Idioma no admitido | CA-RF6-08 |

El tiempo de espera de 10 segundos se provoca con `reloj`: la prueba llama a
`avanzar(10_000)` mientras el adaptador espera (CA-RF6-05). El fallo de QR cubre
el reintento de CE-21 y CA-RF10-04, y el registro de correo permite comprobar
los mensajes de verificación y recuperación de CA-RF1-01 a CA-RF1-10.

## Reglas

- El doble de IA entrega el **texto crudo**, no un objeto parseado: una clave
  repetida desaparece en `JSON.parse` y `CA-RF6-03` exige rechazarla.
- Los nombres de los campos externos y la tabla de traducción están centralizados
  en `contrato.ts`. T-031 definirá el DTO definitivo y ese es el único archivo
  que tendrá que ajustar; `contrato.test.ts` falla si la tabla deja de ser una
  correspondencia uno a uno con los 14 códigos.
- Ningún escenario desconocido se responde por defecto: `crearIaDePrueba()`
  lanza un error en español, para que un doble nunca invente una ausencia de
  alérgenos.
- No se añaden dependencias: el PNG válido va incrustado y el reloj no usa
  `vi.useFakeTimers()`, porque es el código que se prueba el que debe consumir
  el puerto `Reloj` (T-020 y T-032).
- El doble de repositorio para Supabase no está aquí: todavía no existe el
  contrato de repositorio y llegará con T-011 a T-016.
