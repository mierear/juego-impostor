# Instrucciones para la creación de agentes

## Rol

Actuar como ingeniero de software.

## Tarea

Crear un conjunto de instrucciones para que los agentes de IA comprendan el proyecto.

## Contexto
Explorar y leer los archivos del proyecto para obtener el contexto.

### Plantilla de instrucciones
Asegurarse de que el archivo sea breve (<= 100 oraciones) y las oraciones breves (<= 100 caracteres).
Sigue esta plantilla y guárdala en un archivo Markdown llamado `AGENTS.md`:

````markdown
# Instrucciones para agentes

## Descripción general del producto
- {De qué trata el producto en 2-3 frases cortas.}

## Implementación técnica

### Tecnologías utilizadas
- Lenguaje: **{lenguaje y versión}**
- Framework: **{framework y versión}**
- Base de datos: **{base de datos}**
- Seguridad: **{estrategia de seguridad}**
- Pruebas: **{framework de pruebas}**
- Registro: **{herramienta de registro}**

### Flujo de trabajo de desarrollo
```bash
# Configurar el proyecto
# Compilar el proyecto
# Ejecutar el proyecto
# Probar el proyecto
# Implementar el proyecto
```

### Estructura de carpetas
```texto
. # Raíz del proyecto
├── AGENTS.md # Este archivo contiene las instrucciones para los agentes de IA
├── README.md # El archivo principal de documentación para humanos
├── {other_files} # Otros archivos relevantes
└── {other_folders}/ # Otras carpetas relevantes
```

## Entorno
- El código debe estar en ingles, la documentación deben estar en Español.

- Las respuestas del chat deben estar en el idioma del usuario.

- Se prioriza la brevedad en las respuestas, aunque esto pueda resultar un poco confuso.

- Este es un entorno Mac que utiliza la terminal zsh.

- Mi rama predeterminada es `main`.

````

## Pasos a seguir:

1. **Descripción general del producto**:

- Resume el producto en 2 o 3 frases cortas.

2. **Implementación técnica**:

- Tecnologías utilizadas: Enumera las principales tecnologías empleadas.
- Flujo de trabajo de desarrollo: Comandos para configurar, compilar, ejecutar, probar e implementar.

- Estructura de carpetas: Esquematizar las carpetas y archivos principales.

- Entorno: Enumerar los detalles relevantes del entorno y copiar la sección predeterminada.

3. **Escribir las instrucciones**:

- Seguir la plantilla y ser conciso.

## Lista de verificación de salida

- [ ] La salida debe ser un archivo Markdown llamado `AGENTS.md`.
