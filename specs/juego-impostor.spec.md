# Especificación de la app - Juego Impostor

## Descripción del problema

### Historia 1: Como jugador, quiero **acceder a la aplicación sin complicaciones** porque necesito empezar a jugar rápidamente.
**Razón**: La experiencia del usuario debe ser fluida y sin barreras de entrada.

### Historia 2: Como anfitrión del juego, quiero **crear una sala de juego con un código único** porque necesito que otros jugadores puedan unirse.
**Razón**: Necesito una forma sencilla de invitar a otros jugadores a mi sesión de juego.

### Historia 3: Como jugador, quiero **unirme a una sala existente usando un código** porque deseo jugar con mis amigos.
**Razón**: Debo poder acceder al juego sin necesidad de estar en la misma red local.

### Historia 4: Como anfitrión, quiero **definir el número de jugadores mínimo (3) y máximo (10)** porque necesito validar que hay suficientes participantes.
**Razón**: El juego requiere al menos 3 jugadores y no soporta más de 10 por limitaciones lógicas.

### Historia 5: Como jugador, quiero **ingresar mi nombre antes de empezar** porque quiero ser identificado en el juego.
**Razón**: Cada participante debe tener una identidad única dentro de la sesión.

### Historia 6: Como sistema, quiero **asignar roles y personajes aleatoriamente (1 Impostor, N-1 Personajes)** porque el sistema debe asignar a solo una persona el rol de impostor y a TODOS los demás exactamente el MISMO personaje.
**Razón**: La distribución aleatoria garantiza que nadie conoce quién es el impostor de antemano, y todos los jugadores normales deben conocer el mismo personaje para poder identificar si otros mienten sobre su rol.

### Historia 7: Como jugador conocedor del personaje, quiero **ver el nombre del personaje sorteado** porque necesito identificar quién es.
**Razón**: Los jugadores que no son impostores reciben esta información para jugar estratégicamente.

### Historia 8: Como impostor, quiero **ver un texto que diga 'Impostor', Junto con una pista sobre quien es el personaje (no debe ser nada evidente) ** porque debo descubrir quien es el personaje escuchando la pista que cada usuario entrega en su turno mas la pista inicial que me da el sistema.
**Razón**: El impostor no debe saber el nombre para incrementar la dificultad y la diversión.

### Historia 9: Como jugador, quiero **sortear un nuevo personaje si no reconozco el actual** porque necesito un personaje que conozca.
**Razón**: Si el personaje sorteado es poco conocido, el jugador puede pedir otro más reconocible.
Al sortear un nuevo personaje, se debe sortear nuevamente el impostor.

### Historia 10: Como jugador, quiero **participar en una ronda de votación para identificar al impostor** porque ese es el objetivo del juego.
**Razón**: Los jugadores necesitan deliberar y votar para encontrar quién está engañando.

### Historia 11: Como jugador, quiero **entregar una pista en mi turno, de manera verbal, la cual sera analizada por los jugadores** porque con esa pista determinaran si soy o no un impostor.
**Razón**: Los jugadores necesitan analizar las pistas para pensar en sus sospechosos.

### Historia 12: Como Sistema, quiero **despues de cada juego, pedir que voten** porque necesitamos ir eliminando jugadores. Si el eliminado no era el impostor, el juego sigue.
**Razón**: Los jugadores necesitan ir descartando sospechosos.

---

## Descripción de la solución

### Arquitectura General

La aplicación será una **PWA Híbrida** con las siguientes características:

1. **Pantalla de Inicio**
   - Botones para "Crear Sala" o "Unirse a Sala"
   - Verificación de conexión (local o remota)

2. **Gestión de Salas**
   - Al crear: generar código único de 6 dígitos
   - Al unirse: ingresar código y nombre de jugador
   - Validar número mínimo (3) y máximo (10) de jugadores

3. **Asignación de Roles**
   - Sistema aleatorio que designa 1 impostor y N-1 personajes
   - Base de datos de personajes públicos mundiales con imágenes
   - Cada sesión usa personajes únicos (sin repetir en el mismo juego)

4. **Pantalla Principal del Juego**
   - **Para Personajes**: Muestra imagen + nombre del personaje
   - **Para Impostor**: Muestra solo la imagen sin nombre y una pista de quien es el personaje (no muy explicita)
   - Al final debe aparecer un botón que diga 'Volver a jugar'. Este boton reinicia el juego en la misma sala y sortea nuevamente un personaje y un impostor.
   - Cada personaje tiene un numero, que representa su turno, en el cual debera entregar al grupo una palabra a modo de pista, la cual sera usada por el impostor para deducir que personaje es y le permitira al resto del grupo juzgarlo.

5. **Ronda de Votación**
   - Todos los jugadores votan por quién es el impostor
   - El impostor también vota
   - Mostrar resultado: ¿Quién fue el impostor? ¿Lo adivinaron?
   - La ronda de votación dura 30 segundos.
   - El sistema muestra el numero de votos que va recibiendo caga jugador en tiempo real.
   - El jugador mas botado sera eliminado. Si es el impostor, el juego termina.

6. **Infraestructura Técnica Simple**
   - Estado sincronizado entre jugadores (WebSocket o polling)
   - Almacenamiento local de datos de la sesión
   - La aplicación se conecta con Firebase Realtime Database mediante el mejor plugin disponible. En esta base guardaremos el id del juego, el personaje actual (al actualizar, se debe actualizar en la base), los jugadores asociados junto con su nombre y su rol (personaje/impostor). Debe ser porible que otras personas jueguen otras sesiones en otros lugares y paises.

---

## Criterios de aceptación

### Gestión de Usuarios y Salas
- [ ] El usuario puede crear una sala y recibe un código único de 6 dígitos
- [ ] El usuario puede unirse a una sala existente ingresando código y nombre
- [ ] La aplicación valida que haya mínimo 3 jugadores antes de iniciar
- [ ] La aplicación previene que se unan más de 10 jugadores a una sala
- [ ] El anfitrión puede ver la lista de jugadores conectados en tiempo real

### Asignación de Roles
- [ ] Al iniciar el juego, se asignan roles aleatoriamente (1 impostor, N-1 personajes)
- [ ] El impostor no conoce el nombre del personaje sorteado
- [ ] El impostor recibe una pista del personaje
- [ ] Los demás jugadores ven el nombre + imagen del personaje
- [ ] Cada personaje es único dentro de la misma sesión

### Sistema de Personajes
- [ ] Se muestra una imagen de un personaje público muy conocido
- [ ] El usuario puede solicitar un nuevo personaje máximo 2-3 veces
- [ ] Los personajes sorteados no se repiten en la misma partida

### Dinámica de Juego
- [ ] Todos los jugadores pueden participar en una ronda de votación
- [ ] Solo se puede votar por personajes activos (no eliminados)
- [ ] Se muestra quién votó por quién en tiempo real
- [ ] Al finalizar la votación, si el mas votado es el impostor, se revela y el juego termina. en caso contrario, se elimina el usuario mas botado y el juego continua una ronda mas.

### Experiencia de Usuario
- [ ] La interfaz es responsiva y funciona en móvil y desktop
- [ ] La aplicación funciona offline con sincronización al conectar
- [ ] Los cambios de estado se reflejan en tiempo real para todos los jugadores
- [ ] La navegación es intuitiva y clara

### Validación Técnica
- [ ] No hay errores de consola en el navegador
- [ ] La aplicación se puede instalar como PWA
- [ ] Los datos de la sesión se persisten correctamente
- [ ] La sincronización entre jugadores funciona sin lag notable

