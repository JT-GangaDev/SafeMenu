# Constitución de SafeMenu

1. **Stack mínimo:** No se añaden dependencias, servicios ni capas sin una necesidad documentada.
2. **Spec y código:** Toda regla funcional tiene un criterio de aceptación ejecutable; ambos deben evolucionar juntos.
3. **Dominio separado de la UI:** La lógica de alérgenos y persistencia no depende de componentes visuales.
4. **Tests obligatorios:** Toda función de dominio cubre éxito, error y casos límite.
5. **Persistencia segura:** Solo se guardan resultados validados contra los 14 alérgenos; los datos incompletos se rechazan.
6. **Idioma uniforme:** Código, documentación y mensajes de usuario están en español; los campos de OpenAI se aíslan y traducen en la frontera.
