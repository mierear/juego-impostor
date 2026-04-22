## Especificación

## Rol

Actua como un analista de software.

## Tarea

Generar una especificación para implementar después una funcionalidad.

## Contexto

- Una App Mobile Hibrida PWA Para jugar a encontrar al impostor.
- Cada jugador tiene:
  - Nombre,
  - Rol (Personaje o Impostor)

  El objetivo es que los jugadores determinen quien es el impostor. Al iniciar el juego, se sortean los roles aleatoriamente.
  Por cada juego, la app mostrara la imagen de un personaje publico mundial (Debe ser muy conocido), y siempre sera diferente. Solo uno de los jugadores sera impostor, los otros recibiran el nombre del personaje sorteado y nadie sabra quien es quien.
  Los jugadores pueden sortear un nuevo personaje si no conocen el que salio.
  Para jugar deben ser minimo 3 jugadores, máximo 10.

## Template de especificación

  Sigue el siguiente template para escribir el archivo de especificación specs/juego-impostor.spec.md:

  ````markdown
  # Especificación de la app

  ## Descripción del problema

   - Como {Rol}, quiero **{{objetivo}}** porque {razón}

  ## Descripción de la solución

    - enfoque simple para solucionar el problema, sin detalles técnicos

  ## Criterios de aceptación
    - [] criterio A
    - [] criterio B
    - [] criterio X

  ````

  ## Pasos a seguir

  1. **Define el problema**:
  - Describe claramente el problema (no mas de 11 historias de usuario)

  2. **Descripción general de la solución**:  
  - Enfoque más simple para la aplicación, su lógica y la infraestructura.

  3. **Criterios de aceptación**:  
  - [] formato EARS

## Checklist

- La salida debe ser un archivo markdown llamado specs/juego-impostor.spec.md
- La especificación con:
  - Descripción del problema
  - Descripción de la solución
  - Criterios de aceptación
