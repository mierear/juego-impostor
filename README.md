# Juego Impostor - Aplicación Ionic Angular

Una aplicación móvil moderna desarrollada con **Ionic Framework** y **Angular**, con soporte para iOS y Android mediante **Capacitor**.

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js 20.19+ o 22.12+ (actualmente recomendado: v22.22.2)
- npm 10.9.7 o superior
- iOS: macOS con Xcode (opcional)
- Android: Android Studio (opcional)

### Instalación y Ejecución

```bash
# Asegurar Node.js correcto con nvm (recomendado)
nvm use 22

# Instalar dependencias
npm install

# Ejecutar en navegador
npm start

# O usando ionic serve
ionic serve

# Ejecutar pruebas unitarias
npm test -- --watch=false --browsers=ChromeHeadless
```

La aplicación estará disponible en `http://localhost:4200`

## ✨ Características v0.1.0

### Gestión de Salas de Juego
- ✅ Crear sala con código único de 6 dígitos
- ✅ Unirse a sala existente con código
- ✅ Validación de límite de jugadores (3-10)
- ✅ Lista en tiempo real de jugadores conectados

### Sistema de Roles y Personajes
- ✅ Asignación aleatoria: 1 Impostor, N-1 Personajes
- ✅ Los personajes ven el nombre del personaje sorteado
- ✅ El impostor ve "Impostor" + pista del personaje
- ✅ Posibilidad de cambiar personaje (máximo 2-3 veces)
- ✅ Re-sorteo de impostor al cambiar personaje

### Fase de Pistas (Historia 11)
- ✅ Sistema de turnos: cada jugador da una pista
- ✅ Registro de pistas con timestamp
- ✅ Historial visible de todas las pistas
- ✅ Validación de longitud máxima de pista (50 caracteres)
- ✅ Avance automático de turnos

### Fase de Votación (Historia 10, 12)
- ✅ Duración: 30 segundos por ronda
- ✅ Conteo de votos en tiempo real
- ✅ Visualización de votos recibidos por jugador
- ✅ Resultado: eliminación del más votado (si no es impostor)
- ✅ Soporte para múltiples rondas de votación

### Sistema de Fin de Juego
- ✅ Pantalla de resultados con ganador
- ✅ Reveal del impostor
- ✅ Mostrar personaje oculto (si ganaron los personajes)
- ✅ Indicador de victoria/derrota para cada jugador
- ✅ Opción de reiniciar juego en la misma sala
- ✅ Opción de volver a inicio

### Infraestructura Técnica
- ✅ Firebase Realtime Database para sincronización
- ✅ Sincronización en tiempo real entre jugadores
- ✅ Manejo de conexión offline/online
- ✅ PWA (Progressive Web App) ready
- ✅ Angular 20+ con componentes standalone

## 📱 Desarrollo

### Crear una Nueva Página

```bash
ionic generate page pages/nombre-pagina
```

### Crear un Nuevo Servicio

```bash
ionic generate service services/nombre-servicio
```

### Pruebas Unitarias

```bash
# Ejecutar pruebas una sola vez
npm test -- --watch=false --browsers=ChromeHeadless

# Ejecutar pruebas con watch (recomendado para desarrollo)
npm test

# Ejecutar pruebas de un archivo específico
npm test -- --include='**/game.service.spec.ts'
```

**Cobertura de Pruebas (v0.1.0)**
- 48 test cases totales
- GameService: Eliminación, fin del juego, determinación de ganador
- VotingComponent: Conteo de votos, temporizador
- CuesComponent: Validación de pistas, turnos
- LobbyComponent: Gestión de jugadores, cambio de rol

### Compilar para Producción

```bash
npm run build
# O
ionic build
```

## 🔧 Compilación Nativa

### Agregar Plataformas

```bash
# Android
npx cap add android

# iOS
npx cap add ios
```

### Compilar y Sincronizar

```bash
# Compilar el proyecto web
npm run build

# Sincronizar cambios con apps nativas
npx cap sync

# Abrir en IDE nativo
npx cap open android
npx cap open ios
```

## 🧪 Testing

```bash
# Ejecutar pruebas unitarias
npm test

# Ejecutar linter
npm run lint
```

## 📂 Estructura del Proyecto

```
src/
├── app/
│   ├── tab1/              # Primera pestaña
│   ├── tab2/              # Segunda pestaña
│   ├── tab3/              # Tercera pestaña
│   ├── tabs/              # Contenedor de pestañas
│   ├── explore-container/ # Componente compartido
│   ├── app.component.*    # Componente raíz
│   ├── app.module.ts      # Módulo principal
│   └── app-routing.module.ts
├── assets/                # Imágenes y recursos
├── environments/          # Configuración por entorno
├── theme/                 # Estilos globales
└── main.ts               # Punto de entrada
```

## 🎨 Personalización

### Variables de Tema

Edita `src/theme/variables.scss` para personalizar colores y estilos globales.

### Configuración de Capacitor

Edita `capacitor.config.ts` para configurar:
- Nombre de la aplicación
- ID del paquete
- Plugins nativos
- Configuración específica de plataforma

## 📚 Recursos

- [Documentación de Ionic](https://ionicframework.com/docs)
- [Documentación de Angular](https://angular.io/docs)
- [Documentación de Capacitor](https://capacitorjs.com/docs)

## 🤝 Contribución

Este proyecto utiliza Git para control de versiones. Los cambios iniciales se han confirmado automáticamente.

## 📝 Licencia

Este proyecto está creado con Ionic Framework.

---

**Desarrollado con ❤️ usando Ionic y Angular**
