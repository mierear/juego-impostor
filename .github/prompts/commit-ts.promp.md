---
name: commit
description: Confirma cambios pendientes
agent: agent
model: GPT-4.o
tools:['execute','read']
---
# Confirmar cambios
# Rol
Actuar como desarrollador de software

# Tarea
Confirmar los cambios pendientes.
Usar la terminal para ejecutar comandos de Git.

# Contexto
Usar la habilidad 'commit-changes' como referencia.

# Lista de verificación de salida:
- [] No hay cambios sin confirmar en la rama actual.
