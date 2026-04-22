# Instrucciones para agentes

## Descripción general del producto

Juego Impostor es una PWA híbrida multijugador para dispositivos móviles.
Los jugadores adivinan quién es el impostor mediante votación y pistas.
La aplicación sincroniza jugadores en tiempo real usando Firebase.

## Implementación técnica

### Tecnologías utilizadas

- **Lenguaje**: TypeScript 5.6
- **Frontend**: Angular 20, Ionic 8
- **Base de datos**: Firebase Realtime Database
- **Nativo**: Capacitor 8.3 (Android/iOS)
- **Seguridad**: Firebase Authentication
- **Pruebas**: Jasmine + Karma
- **Linting**: ESLint + Angular ESLint

### Flujo de trabajo de desarrollo

```bash
# Configurar el proyecto
nvm use 22
npm install

# Compilar el proyecto
ionic build

# Ejecutar el proyecto (desarrollo web)
ionic serve

# Ejecutar en Android
npx cap sync android
open -a "Android Studio" android/

# Probar el proyecto
npm test -- --watch=false --browsers=ChromeHeadless

# Implementar (Android)
# Seleccionar dispositivo en Android Studio y presionar Run
```

### Estructura de carpetas

```texto
.
├── AGENTS.md               # Instrucciones para agentes IA
├── README.md               # Documentación principal
├── SETUP.md                # Instrucciones de setup
├── package.json            # Dependencias npm
├── tsconfig.json           # Configuración TypeScript
├── angular.json            # Configuración Angular
├── ionic.config.json       # Configuración Ionic
├── capacitor.config.ts     # Configuración Capacitor
├── src/
│   ├── app/
│   │   ├── models/         # Tipos e interfaces (Player, GameRoom, etc.)
│   │   ├── services/       # GameService, FirebaseService
│   │   └── pages/          # Componentes principales (Home, Lobby, Clues, Voting, GameOver)
│   ├── index.html          # Punto de entrada
│   └── main.ts             # Bootstrap de Angular
├── android/                # Proyecto Capacitor Android
├── www/                    # Build compilado (outputs)
└── specs/                  # Especificaciones del proyecto
```

## Arquitectura de la aplicación

### Flujo principal

1. **Home**: Crear o unirse a sala
2. **Lobby**: Esperar jugadores (3-10)
3. **Clues**: Ver personaje, dar pistas
4. **Voting**: Votar al impostor
5. **GameOver**: Ver resultados

### Modelos clave

- `Player`: Nombre, rol (impostor/personaje), votación, pistas
- `GameRoom`: Código, jugadores, estado, turnos
- `Character`: Nombre, imagen del personaje

## Configuración del entorno

- **Código**: Inglés únicamente
- **Documentación**: Español
- **Respuestas de chat**: Idioma del usuario
- **Terminal**: zsh (macOS)
- **Rama principal**: main
- **Node.js recomendado**: 22.22.2

## Puntos clave para desarrollo

- Todos los jugadores deben sincronizarse desde Firebase.
- La votación es simultánea (30 segundos máximo).
- El impostor no conoce el personaje sorteado.
- Firebase maneja estado centralizado.
- Capacitor permite compilar a Android/iOS.

## Comandos útiles

```bash
# Compilación
ionic build                           # Build optimizado
nvm use 22 && ionic build             # Asegurar Node.js v22
npx cap sync android                  # Sincronizar Android

# Desarrollo
ionic serve                           # Servidor local
npm test                             # Tests

# Android
open -a "Android Studio" android/    # Abrir Android Studio
npx cap open android                 # Alternativa
```

## Convenciones de código

- **Componentes**: Directorio por componente (template, style, spec, ts)
- **Servicios**: Gestión de lógica y Firebase
- **Modelos**: En `src/app/models/`
- **Observables**: RxJS con takeUntil para cleanup
- **Naming**: camelCase variables, PascalCase clases
