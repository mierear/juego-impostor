/**
 * Configuración de Firebase para el proyecto
 *
 * ⚠️ IMPORTANTE: Esta es una configuración de ejemplo.
 * Debes reemplazar estos valores con tus propias credenciales de Firebase.
 *
 * Pasos para obtener tu configuración:
 * 1. Ve a la consola de Firebase: https://console.firebase.google.com
 * 2. Crea un nuevo proyecto o selecciona uno existente
 * 3. Ve a Project Settings (Configuración del proyecto)
 * 4. Copia la configuración que aparece bajo "firebaseConfig"
 * 5. Reemplaza los valores aquí
 *
 * El Realtime Database debe estar habilitado en tu proyecto Firebase.
 */

export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyCstlRp-dsQ0jfgNJ2og4ZlntGqBkM9q2o",
    authDomain: "juego-impostor-c17a0.firebaseapp.com",
    projectId: 'juego-impostor-c17a0',
    storageBucket: "juego-impostor-c17a0.firebasestorage.app",
    messagingSenderId: "81700895511",
    appId: "1:81700895511:web:90b3fbd14ac97c4ec71552",
    databaseURL: 'https://juego-impostor-c17a0-default-rtdb.firebaseio.com',
  },
};

/**
 * Ejemplo de cómo debería verse:
 *
 * export const environment = {
 *   production: false,
 *   firebase: {
 *     apiKey: "AIzaSyC_1234567890abcdefghijklmnop",
 *     authDomain: "juego-impostor.firebaseapp.com",
 *     projectId: "juego-impostor-12345",
 *     storageBucket: "juego-impostor-12345.appspot.com",
 *     messagingSenderId: "123456789012",
 *     appId: "1:123456789012:web:abc1234567890def",
 *     databaseURL: "https://juego-impostor-12345.firebaseio.com"
 *   }
 * };
 */
