# 🎨 Actualización de Logo y Branding - Juego Impostor

## 📋 Cambios Realizados

### 1. **Nuevos Logos Creados**

#### `src/assets/icon/logo-impostor.svg` (Principal)
- Logo vectorial profesional con dos personajes
- **Impostor** (izquierda): Personaje con máscara blanca y traje oscuro, con aura roja
- **Detective** (derecha): Personaje vigilante con intensidad, traje militar verde
- Fondo neón con gradientes púrpura y azul
- Línea divisoria con efecto neón pulsante

**Dimensiones**: 512x512px (escalable)
**Uso**: Pantalla principal, lobby, game-over

#### `src/assets/icon/app-icon.svg`
- Logo alternativo más simple con 3 jugadores
- Ideal para iconos de aplicación más pequeños

### 2. **Componente Compartido**

Se creó un componente reutilizable: `AppLogoComponent`
- **Ubicación**: `src/app/shared/components/app-logo.component.ts`
- **Uso en templates**:

```html
<app-logo size="lg" [animated]="true"></app-logo>
```

**Tamaños disponibles**:
- `lg`: 280x280px (pantallas principales)
- `md`: 200x200px (pantallas intermedias)
- `sm`: 120x120px (headers, modales)

### 3. **Pantallas Actualizadas**

✅ **Home Page** (`src/app/pages/home/home.component.html`)
- Logo principal con animación float
- Tamaño: `lg` con brillo neón

✅ **Lobby Page** (`src/app/pages/lobby/lobby.component.html`)
- Logo en header de sala
- Tamaño: `md`

✅ **Game Over Page** (`src/app/pages/game-over/game-over.component.html`)
- Logo con animación pulse-scale
- Destaca el resultado de la partida

### 4. **Animaciones Globales Agregadas**

Se agregaron las siguientes animaciones al archivo `src/global.scss`:

| Animación | Duración | Efecto |
|-----------|----------|--------|
| `float` | 3s | Movimiento vertical suave |
| `glow` | 2.5s | Brillo neón pulsante |
| `pulse-scale` | 2s | Escala y opacidad |
| `neon-flicker` | Variable | Parpadeo de neón |

### 5. **Estilos Mejorados**

- **Filtros SVG**: Drop-shadow con colores neón (púrpura y cian)
- **Transiciones suaves**: 0.3s ease en transform y filter
- **Hover effects**: Escala 1.08x con aumento de brillo

### 6. **Configuración Actualizada**

#### `capacitor.config.ts`
- App ID: `com.juegoimpostor.app`
- App Name: `Juego Impostor`
- Splash Screen: 2000ms con fondo oscuro
- Status Bar: Estilo DARK

#### `src/index.html`
- Título: "Juego Impostor - ¿Quién es el Impostor?"
- Favicon: Logo en `assets/icon/favicon.png`
- Meta tags de PWA y redes sociales

## 🚀 Próximos Pasos

### Generar PNGs desde SVG

Para usar en App Store y Play Store, convierte los SVGs a PNG:

```bash
# Instalación de herramientas (macOS)
brew install imagemagick librsvg

# Generar múltiples tamaños
convert -density 300 src/assets/icon/logo-impostor.svg -resize 192x192 android/app/src/main/res/mipmap-mdpi/ic_launcher.png
convert -density 300 src/assets/icon/logo-impostor.svg -resize 384x384 android/app/src/main/res/mipmap-hdpi/ic_launcher.png
convert -density 300 src/assets/icon/logo-impostor.svg -resize 512x512 android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
```

O usar herramientas online:
- [CloudConvert](https://cloudconvert.com/)
- [SVG to PNG Converter](https://svgtopng.com/)
- [Figma](https://figma.com/)

### Tamaños Recomendados

| Plataforma | Tamaño | Ruta |
|-----------|--------|------|
| **Android** | 192x192 | `android/app/src/main/res/mipmap-*/ic_launcher.png` |
| **iOS** | 1024x1024 | `ios/App/App/Assets.xcassets/AppIcon.appiconset/` |
| **Web/PWA** | 192x192, 512x512 | `src/assets/icon/` |
| **App Store** | 1024x1024 | Manifest de App Store |

### Actualizar Share Button (Opcional)

Si la app tiene funcionalidad de compartir, usa el logo:

```typescript
// En componentes que compartan la app
const logoUrl = 'https://tudominio.com/assets/icon/logo-impostor.svg';
// O referencia local en capacitor
```

## 📱 Testing en Dispositivos

```bash
# Web
npm start
# Accede a http://localhost:4200

# Android
npm run build
ionic cap build android
# Abre en Android Studio

# iOS
npm run build
ionic cap build ios
# Abre en Xcode
```

## 🎨 Personalización Futura

### Cambiar Colores del Logo
Edita `src/assets/icon/logo-impostor.svg` y busca:
- Gradientes: `#8B5CF6` (púrpura), `#0EA5E9` (cian), `#FF6B35` (naranja)
- Tonos de piel: `#E8B4A0`, `#D49A7E`
- Cabello: `#3D2817`, `#1F1410`

### Agregar Logo a Otras Pantallas
1. Importa `SharedModule` en el módulo del componente
2. Usa el tag: `<app-logo size="md"></app-logo>`

## ✨ Características del Logo

- ✅ Diseño profesional y moderno
- ✅ Colores neón con contraste alto
- ✅ Escalable (SVG vectorial)
- ✅ Animaciones fluidas
- ✅ Responsive en todas las pantallas
- ✅ Compatible con dark mode
- ✅ Accesible (alt text, contraste)
- ✅ Rápido de cargar

---

**Última actualización**: 20 de abril de 2026
