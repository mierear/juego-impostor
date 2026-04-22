/**
 * Tipos y modelos para el juego Impostor
 */

/**
 * Rol del jugador en la partida
 */
export type PlayerRole = 'character' | 'impostor';

/**
 * Estados posibles de una partida
 */
export type GameStatus = 'waiting' | 'in_progress' | 'clues' | 'voting' | 'finished';

/**
 * Personaje del juego
 */
export interface Character {
  id: string;
  name: string;
  image: string; // URL de la imagen del personaje
}

/**
 * Jugador en la partida
 */
export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  character?: Character; // Presente solo para jugadores que no son impostores
  hasVoted: boolean;
  votedFor?: string; // ID del jugador al que votó
  swappedCharacters: number; // Contador de cambios de personaje solicitados
  turnNumber?: number; // Número de turno (orden en que dan pistas)
  clue?: string; // Pista que da el jugador
  clueGivenAt?: number; // Timestamp cuando dio la pista
  voteCount?: number; // Contador de votos recibidos (actualizado en tiempo real)
  eliminated?: boolean; // Si el jugador fue eliminado en una ronda anterior
}

/**
 * Sala de juego
 */
export interface GameRoom {
  id: string;
  code: string; // Código único de 6 dígitos
  hostId: string;
  players: Record<string, Player>; // Mapa de jugadores por ID
  minPlayers: number;
  maxPlayers: number;
  status: GameStatus;
  currentCharacterId?: string; // ID del personaje actual en pantalla
  availableCharacters: Character[];
  usedCharacters: string[]; // IDs de personajes ya utilizados en esta partida
  createdAt: number; // Timestamp
  updatedAt: number; // Timestamp
  gamePhase?: 'clues' | 'voting'; // Fase actual del juego
  currentTurn?: number; // Turno actual (quién está dando pista)
  votingStartTime?: number; // Timestamp cuando comenzó la votación
  votingTimeLimit?: number; // Tiempo límite de votación en ms (30000 para 30s)
  playerTurnOrder?: string[]; // Orden de turnos para pistas (IDs de jugadores)
  voteCounts?: Record<string, number>; // Contador de votos por jugador en tiempo real
  roundNumber?: number; // Número de ronda actual (comenzando en 1)
  lastEliminatedId?: string; // ID del jugador eliminado en la última ronda
  winnerRole?: PlayerRole; // Rol ganador cuando el juego termina (character|impostor)
  votingFinished?: boolean; // Indica que la votación ha terminado y los resultados están listos para mostrar
}

/**
 * Estado del juego para sincronización en tiempo real
 */
export interface GameState {
  room: GameRoom;
  currentPlayerId?: string;
  impostor?: Player; // Solo mostrado al finalizar la partida
  votes?: Record<string, string>; // Mapa de votante -> votado (IDs)
}

/**
 * Resultado de la votación
 */
export interface VotingResult {
  votedOutPlayerId: string;
  votedOutPlayer: Player;
  wasImpostor: boolean;
  votes: Record<string, string>; // Mapa de votante -> votado
  playerVotes: Array<{ voterId: string; votedFor: string }>; // Detalles de votos
}

/**
 * Artículos para solicitar cambio de personaje
 */
export interface CharacterSwapRequest {
  playerId: string;
  currentCharacterId: string;
  newCharacterId: string;
}
