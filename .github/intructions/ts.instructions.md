---
description: Mejores prácticas para escribir código TypeScript en el proyecto.
applyTo: '******'
---
# Buenas prácticas para código limpio
## Variables y nomenclatura
- Nombra las variables y funciones de forma descriptiva para mejorar la legibilidad.
- Usa constantes con nombre en lugar de números mágicos o cadenas de texto.

## Funciones y complejidad
- Mantén las funciones pequeñas y centradas en una sola tarea.
- Evita las estructuras anidadas para reducir la complejidad.
- Usa retornos anticipados para minimizar la indentación.

## Clases y módulos
- Evita la obsesión por los tipos primitivos definiéndolos.
- Prioriza la composición sobre la herencia.
- Minimiza las dependencias.
- Usa el patrón adaptador para desacoplarte de sistemas externos.
- Mantén un módulo (carpeta, etc.) compartido para utilidades y tipos comunes.

## Manejo de errores y comentarios
- Maneja los errores de forma adecuada con bloques try-catch y mensajes significativos.
- Escribe comentarios para explicar el "por qué" de la lógica compleja, no el
"qué".

## Principios generales
- Mantén la simplicidad y evita la sobreingeniería.
- Intenta aplicar el principio DRY (Don't Repeat Yourself) reutilizando código cuando sea posible.

## Directrices específicas de TypeScript
- Usa módulos ES ('import'/'export') en lugar de CommonJS.
- Prioriza las exportaciones con nombre sobre las exportaciones predeterminadas.
- Los nombres de archivo siguen el formato 'kebab-case' (patrón). (}.ts). Por ejemplo: 'user-login.service.ts'.
- Usa tipado estricto y evita usar 'any'.
- Declara los 'types' para las estructuras de datos en un archivo aparte.
- Usa 'as const' para valores constantes para inferir tipos literales.
- Define las 'interfaces' para el comportamiento del contrato de clase en un archivo aparte.
- Evita 'null' y 'undefined' siempre que sea posible; prefiere las propiedades opcionales.
- Aprovecha los tipos de utilidad de TypeScript (por ejemplo,
'Partial', 'Pick', 'Omit').
- Usa async/await; envuelve los awaits en try/catch con estructuras.
