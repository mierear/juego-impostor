---
name: commit-changes
description: >
  Aplica commit a los cambios pendientes.
---

# Habilidad para confirmar cambios
Cuando se te pida confirmar cambios, sigue estos pasos:
1. **Verifica si hay cambios sin confirmar**:
- Usa `git status` para ver si hay cambios sin confirmar.
2. **Agrupa los cambios**:
- Si se modificaron varios archivos, agrúpalos lógicamente si es posible.
- Define mensajes de confirmación significativos para cada grupo.
3. **Prepara los cambios**:
- Prepara los cambios usando `git add` para cada grupo de archivos.
4. **Confirma los cambios**:
- Usa `git commit -m "Mensaje de confirmación"` para confirmar los cambios.
- Confirma los cambios usando [Conventional Commit Messages](https://www.conventionalcommits.org/en/v1.0.0/) para mantener un historial de commits claro y consistente.