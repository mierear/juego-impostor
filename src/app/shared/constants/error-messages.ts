/**
 * Mensajes de error centralizados
 * Evita duplicar strings hardcodeados en toda la aplicación
 */

export const ERROR_MESSAGES = {
  ROOM_NOT_FOUND: 'Sala no encontrada',
  ROOM_FULL: 'La sala está llena',
  ROOM_ALREADY_STARTED: 'La sala ya ha iniciado',
  INSUFFICIENT_PLAYERS: (minPlayers: number) =>
    `Se requieren al menos ${minPlayers} jugadores`,
  NO_CHARACTERS_AVAILABLE: 'No hay personajes disponibles',
  NO_MORE_CHARACTERS: 'No hay más personajes disponibles',
  MAX_CHARACTER_SWAPS_REACHED:
    'Se alcanzó el máximo de cambios de personaje para esta partida',
  INVALID_PLAYER: 'Jugador no válido',
  VOTER_NOT_FOUND: 'Votante no encontrado',
  PLAYER_NOT_FOUND: 'Jugador no encontrado',
  EMPTY_CLUE: 'La pista no puede estar vacía',
  TURN_ORDER_NOT_SET: 'Orden de turnos no configurada',
  CONNECTION_ERROR: 'Error de conexión',
  INVALID_OPERATION: 'Operación no válida',
} as const;
