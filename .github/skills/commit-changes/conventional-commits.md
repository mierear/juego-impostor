# Confirmaciones convencionales
- Mensajes de confirmación estructurados para indicar el tipo de cambio.

- Plantilla de sintaxis de mensaje:
```txt
‹type»[opcional scopel: ‹description>
[opcional body]
Lopcional footer]
```

# Tipos de cambio

'feat': nueva funcionalidad
'fix': corrección de errores
'test': agregar o corregir
"perf": mejoras en el rendimiento del código
'refactor|style": "limpieza de código
'docs": "cambios solo en la documentación
'chore| build|ci': Cambios en el proceso de compilación o en herramientas auxiliares"
o "CAMBIO IMPORTANTE")

### Descripción del mensaje
- Resumen conciso
del cambio.
- Se prioriza la gramática para ajustarse a 50 caracteres.
- Se añaden referencias a incidencias/tickets si procede.
### Cuerpo y pie de página
- Cuerpo: explicación detallada del cambio.
- Pie de página: referencias a incidencias o cambios importantes.
- Se prioriza la gramática para ajustarse a 72 caracteres.