# Guía de Configuración - Juego Impostor

## Configuración de Firebase

La aplicación requiere Firebase Realtime Database para funcionar correctamente. Sigue estos pasos para configurarlo:

### 1. Crear un proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Haz clic en "Crear proyecto"
3. Ingresa un nombre para tu proyecto (ej: "juego-impostor")
4. Sigue los pasos de configuración

### 2. Habilitar Realtime Database

1. En la consola de Firebase, ve a "Realtime Database" (en el menú izquierdo bajo "Build")
2. Haz clic en "Crear base de datos"
3. Selecciona la ubicación más cercana a tu región
4. **Importante**: Selecciona "Comenzar en modo de prueba" para desarrollo inicial
   - Nota: **No uses esto en producción**. Configura reglas de seguridad adecuadas antes de publicar.

### 3. Obtener configuración de Firebase

1. Ve a "Configuración del proyecto" (ícono de engranaje en la esquina superior)
2. Desplázate hacia abajo hasta "Tus aplicaciones"
3. Selecciona tu aplicación web (si no existe, crea una)
4. Copia la configuración que aparece

### 4. Configurar la aplicación

1. Abre el archivo `src/environments/environment.ts`
2. Reemplaza los valores `YOUR_*` con los datos obtenidos de Firebase:

```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyC_...",           // Reemplaza con tu apiKey
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto-id",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abc...",
    databaseURL: "https://tu-proyecto.firebaseio.com"
  }
};
```

3. Haz lo mismo con `src/environments/environment.prod.ts` para producción

### 5. Reglas de seguridad (Desarrollo)

En la consola de Firebase, ve a "Realtime Database" → "Reglas" y configura:

```json
{
  "rules": {
    "rooms": {
      ".read": true,
      ".write": true
    },
    "gameState": {
      ".read": true,
      ".write": true
    }
  }
}
```

⚠️ **IMPORTANTE**: Estas son reglas muy permisivas solo para desarrollo. 
Para producción, implementa autenticación y reglas de seguridad adecuadas.

## Instalar dependencias

```bash
npm install
```

## Ejecutar la aplicación

Desarrollo:
```bash
npm start
```

Compilación:
```bash
npm run build
```

Pruebas:
```bash
npm test
```

## Estructura del proyecto

```
src/
├── app/
│   ├── models/
│   │   └── game.types.ts          # Tipos e interfaces
│   ├── services/
│   │   ├── firebase.service.ts    # Conexión con Firebase
│   │   ├── game.service.ts        # Lógica del juego
│   │   └── character.service.ts   # Gestión de personajes
│   ├── pages/
│   │   ├── home/                  # Pantalla de inicio
│   │   ├── lobby/                 # Sala de espera
│   │   ├── game/                  # Pantalla del juego
│   │   └── voting/                # Votación
│   ├── shared/
│   │   └── shared.module.ts       # Módulo compartido
│   └── app-routing.module.ts      # Enrutamiento
└── environments/
    ├── environment.ts             # Configuración desarrollo
    ├── environment.prod.ts        # Configuración producción
    └── firebase.config.ts         # Referencia Firebase
```

## Características

✅ Crear salas de juego con códigos únicos  
✅ Unirse a salas existentes  
✅ Asignación aleatoria de roles (impostor/personajes)  
✅ Sistema de votación en tiempo real  
✅ Sincronización multi-jugador con Firebase  
✅ Soporte para PWA (instalable)  
✅ Interfaz responsiva (móvil y desktop)  

## Limitaciones conocidas

- Máximo 10 jugadores por sala
- Máximo 3 cambios de personaje por jugador
- Los personajes se usan de forma aleatoria de la base de datos
- La aplicación requiere conexión a internet para Firebase

## Solución de problemas

### Error: "Firebase config not found"
- Verifica que hayas completado la configuración en `environment.ts`
- Asegúrate de haber reemplazado todos los valores `YOUR_*`

### Error: "Sala no encontrada"
- Verifica que el código de sala sea correcto
- Asegúrate de que la sala no haya caducado

### No se sincroniza con otros jugadores
- Verifica tu conexión a internet
- Confirma que Firebase Realtime Database esté habilitada
- Revisa la consola del navegador para errores

## Contacto y soporte

Para más información o reportar problemas, consulta los documentos de especificación:
- `specs/juego-impostor.spec.md` - Especificación técnica
- `juego-impostor.code.prompt.md` - Pautas de código
