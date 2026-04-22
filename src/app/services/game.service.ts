import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  GameRoom,
  Player,
  PlayerRole,
  GameStatus,
  Character,
  VotingResult,
} from '../models/game.types';
import { ERROR_MESSAGES } from '../shared/constants/error-messages';
import { FirebaseService } from './firebase.service';
import { CharacterService } from './character.service';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private currentRoom$ = new BehaviorSubject<GameRoom | null>(null);
  private currentPlayer$ = new BehaviorSubject<Player | null>(null);
  private gameStatus$ = new BehaviorSubject<GameStatus>('waiting');
  private activeListeners: Map<string, () => void> = new Map();

  constructor(
    private firebaseService: FirebaseService,
    private characterService: CharacterService
  ) {}

  /**
   * Crear una nueva sala de juego
   */
  async createGameRoom(hostId: string, hostName: string): Promise<GameRoom> {
    const code = this.generateRoomCode();
    const roomId = this.generateRoomId();
    const now = Date.now();

    const room: GameRoom = {
      id: roomId,
      code,
      hostId,
      players: {
        [hostId]: {
          id: hostId,
          name: hostName,
          role: 'character',
          hasVoted: false,
          swappedCharacters: 0,
        },
      },
      minPlayers: 3,
      maxPlayers: 10,
      status: 'waiting',
      availableCharacters: this.characterService.getCharacters(),
      usedCharacters: [],
      createdAt: now,
      updatedAt: now,
    };

    await this.firebaseService.saveGameRoom(room);
    this.currentRoom$.next(room);
    return room;
  }

  /**
   * Unirse a una sala existente
   */
  async joinGameRoom(code: string, playerId: string, playerName: string): Promise<GameRoom> {
    const room = await this.firebaseService.getGameRoomByCode(code);
    if (!room) {
      throw new Error(ERROR_MESSAGES.ROOM_NOT_FOUND);
    }

    if (Object.keys(room.players).length >= room.maxPlayers) {
      throw new Error(ERROR_MESSAGES.ROOM_FULL);
    }

    if (room.status !== 'waiting') {
      throw new Error(ERROR_MESSAGES.ROOM_ALREADY_STARTED);
    }

    const newPlayer: Player = {
      id: playerId,
      name: playerName,
      role: 'character',
      hasVoted: false,
      swappedCharacters: 0,
    };

    room.players[playerId] = newPlayer;
    room.updatedAt = Date.now();
    await this.firebaseService.saveGameRoom(room);
    this.currentRoom$.next(room);
    return room;
  }

  /**
   * Iniciar el juego (asignar roles y un personaje único para todos)
   */
  async startGame(roomId: string): Promise<void> {
    const room = await this.firebaseService.getGameRoom(roomId);
    if (!room) {
      throw new Error(ERROR_MESSAGES.ROOM_NOT_FOUND);
    }

    // Inicializar arrays si no existen
    if (!room.usedCharacters) {
      room.usedCharacters = [];
    }
    if (!room.availableCharacters) {
      room.availableCharacters = [];
    }

    const playerIds = Object.keys(room.players);
    if (playerIds.length < room.minPlayers) {
      throw new Error(ERROR_MESSAGES.INSUFFICIENT_PLAYERS(room.minPlayers));
    }

    // Seleccionar UN SOLO personaje para todos los jugadores normales
    const sharedCharacter = this.assignCharacter(room);
    if (!sharedCharacter) {
      throw new Error(ERROR_MESSAGES.NO_CHARACTERS_AVAILABLE);
    }

    room.usedCharacters.push(sharedCharacter.id);

    // Asignar roles - todos reciben el MISMO personaje
    const impostorIndex = Math.floor(Math.random() * playerIds.length);
    playerIds.forEach((playerId, index) => {
      const role: PlayerRole = index === impostorIndex ? 'impostor' : 'character';
      room.players[playerId].role = role;
      room.players[playerId].swappedCharacters = 0;
      room.players[playerId].hasVoted = false;

      // Asignar el mismo personaje a todos los no-impostores
      if (role === 'character') {
        room.players[playerId].character = sharedCharacter;
      }
    });

    room.status = 'in_progress';
    room.updatedAt = Date.now();
    await this.firebaseService.saveGameRoom(room);
    this.currentRoom$.next(room);
    this.gameStatus$.next('in_progress');
  }

  /**
   * Cambiar personaje para TODOS los jugadores (no solo uno)
   * Cuando alguien solicita un cambio, se cambia el personaje compartido para todos
   */
  async swapCharacter(roomId: string, playerId: string): Promise<Character | null> {
    const room = await this.firebaseService.getGameRoom(roomId);
    if (!room) {
      throw new Error(ERROR_MESSAGES.ROOM_NOT_FOUND);
    }

    const player = room.players[playerId];
    if (!player || player.role !== 'character') {
      throw new Error(ERROR_MESSAGES.INVALID_PLAYER);
    }

    // Inicializar usedCharacters si no existe
    if (!room.usedCharacters) {
      room.usedCharacters = [];
    }

    // Verificar límite de cambios (global, no por jugador)
    // Contar cambios totales del juego (máximo 3 para toda la sesión)
    let totalSwaps = 0;
    Object.values(room.players).forEach((p) => {
      totalSwaps += p.swappedCharacters;
    });

    if (totalSwaps >= 3) {
      throw new Error(ERROR_MESSAGES.MAX_CHARACTER_SWAPS_REACHED);
    }

    // Remover personaje actual de personajes usados
    if (player.character) {
      room.usedCharacters = room.usedCharacters.filter(
        (id) => id !== player.character!.id
      );
    }

    // Asignar nuevo personaje
    const newCharacter = this.assignCharacter(room);
    if (!newCharacter) {
      throw new Error(ERROR_MESSAGES.NO_MORE_CHARACTERS);
    }

    // Actualizar personaje para TODOS los jugadores normales
    Object.values(room.players).forEach((p) => {
      if (p.role === 'character') {
        p.character = newCharacter;
        p.swappedCharacters += 1;
      }
    });

    room.usedCharacters.push(newCharacter.id);
    room.updatedAt = Date.now();
    await this.firebaseService.saveGameRoom(room);
    this.currentRoom$.next(room);
    return newCharacter;
  }

  /**
   * Registrar voto de un jugador
   */
  async registerVote(roomId: string, voterId: string, votedFor: string): Promise<void> {
    const room = await this.firebaseService.getGameRoom(roomId);
    if (!room) {
      throw new Error(ERROR_MESSAGES.ROOM_NOT_FOUND);
    }

    const voter = room.players[voterId];
    if (!voter) {
      throw new Error(ERROR_MESSAGES.VOTER_NOT_FOUND);
    }

    voter.hasVoted = true;
    voter.votedFor = votedFor;
    room.updatedAt = Date.now();
    await this.firebaseService.saveGameRoom(room);
    this.currentRoom$.next(room);
  }

  /**
   * Finalizar votación y calcular resultado
   */
  async finishVoting(roomId: string): Promise<VotingResult | null> {
    const room = await this.firebaseService.getGameRoom(roomId);
    if (!room) {
      throw new Error(ERROR_MESSAGES.ROOM_NOT_FOUND);
    }

    // Contar votos
    const voteCounts = new Map<string, number>();
    const playerVotes: Array<{ voterId: string; votedFor: string }> = [];

    Object.entries(room.players).forEach(([playerId, player]) => {
      if (player.votedFor) {
        voteCounts.set(player.votedFor, (voteCounts.get(player.votedFor) || 0) + 1);
        playerVotes.push({ voterId: playerId, votedFor: player.votedFor });
      }
    });

    // Encontrar el jugador con más votos
    let votedOutPlayerId = '';
    let maxVotes = 0;

    voteCounts.forEach((votes, playerId) => {
      if (votes > maxVotes) {
        maxVotes = votes;
        votedOutPlayerId = playerId;
      }
    });

    if (!votedOutPlayerId) {
      return null;
    }

    const votedOutPlayer = room.players[votedOutPlayerId];
    const wasImpostor = votedOutPlayer.role === 'impostor';

    const result: VotingResult = {
      votedOutPlayerId,
      votedOutPlayer,
      wasImpostor,
      votes: Object.entries(room.players).reduce(
        (acc, [id, player]) => {
          if (player.votedFor) {
            acc[id] = player.votedFor;
          }
          return acc;
        },
        {} as Record<string, string>
      ),
      playerVotes,
    };

    // Marcar que la votación ha terminado para que todos los clientes muestren los resultados
    room.votingFinished = true;
    room.updatedAt = Date.now();
    await this.firebaseService.saveGameRoom(room);
    this.currentRoom$.next(room);

    // Procesar la ronda de votación (eliminar jugador, verificar si juego termina, etc)
    await this.processVotingRound(roomId);

    return result;
  }

  /**
   * Reiniciar juego (volver a waiting)
   */
  async resetGame(roomId: string): Promise<void> {
    const room = await this.firebaseService.getGameRoom(roomId);
    if (!room) {
      throw new Error(ERROR_MESSAGES.ROOM_NOT_FOUND);
    }

    // Reset todos los jugadores
    Object.values(room.players).forEach((player) => {
      player.role = 'character';
      player.character = undefined;
      player.hasVoted = false;
      player.votedFor = undefined;
      player.swappedCharacters = 0;
    });

    room.status = 'waiting';
    room.usedCharacters = [];
    room.updatedAt = Date.now();
    await this.firebaseService.saveGameRoom(room);
    this.currentRoom$.next(room);
    this.gameStatus$.next('waiting');
  }

  /**
   * Escuchar cambios en la sala (con gestión de listeners)
   */
  onRoomUpdate(roomId: string): Observable<GameRoom | null> {
    // Si ya hay un listener activo para esta sala, no crear uno nuevo
    if (!this.activeListeners.has(roomId)) {
      const unsubscribe = this.firebaseService.onRoomChange(roomId, (room) => {
        this.currentRoom$.next(room);
      });

      // Guardar la función de desuscripción
      this.activeListeners.set(roomId, () => {
        unsubscribe();
        this.activeListeners.delete(roomId);
      });
    }

    return this.currentRoom$.asObservable();
  }

  /**
   * Obtener observables
   */
  getCurrentRoom(): Observable<GameRoom | null> {
    return this.currentRoom$.asObservable();
  }

  getCurrentPlayer(): Observable<Player | null> {
    return this.currentPlayer$.asObservable();
  }

  getGameStatus(): Observable<GameStatus> {
    return this.gameStatus$.asObservable();
  }

  /**
   * Asignar personaje a un jugador (privado)
   */
  private assignCharacter(room: GameRoom): Character | null {
    // Validar que las propiedades existan
    const usedCharacterIds = room.usedCharacters || [];
    const availableChars = room.availableCharacters || [];

    const availableCharacters = availableChars.filter(
      (char) => !usedCharacterIds.includes(char.id)
    );

    if (availableCharacters.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * availableCharacters.length);
    return availableCharacters[randomIndex];
  }

  /**
   * Generar código de sala único (6 dígitos)
   */
  private generateRoomCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Generar ID de sala único
   */
  private generateRoomId(): string {
    return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Comenzar fase de pistas después de asignar roles
   */
  async startCluesPhase(roomId: string): Promise<void> {
    const room = await this.firebaseService.getGameRoom(roomId);
    if (!room) {
      throw new Error(ERROR_MESSAGES.ROOM_NOT_FOUND);
    }

    const playerIds = Object.keys(room.players);

    // Crear orden aleatoria de turnos
    room.playerTurnOrder = playerIds.sort(() => Math.random() - 0.5);

    // Asignar número de turno a cada jugador
    playerIds.forEach((playerId, index) => {
      room.players[playerId].turnNumber = index + 1;
      room.players[playerId].clue = undefined;
      room.players[playerId].voteCount = 0;
    });

    room.gamePhase = 'clues';
    room.currentTurn = 0;
    room.status = 'clues';
    room.updatedAt = Date.now();
    await this.firebaseService.saveGameRoom(room);
    this.currentRoom$.next(room);
    this.gameStatus$.next('clues');
  }

  /**
   * Registrar una pista dada por un jugador
   */
  async submitClue(roomId: string, playerId: string, clue: string): Promise<void> {
    if (!clue || clue.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.EMPTY_CLUE);
    }

    const room = await this.firebaseService.getGameRoom(roomId);
    if (!room) {
      throw new Error(ERROR_MESSAGES.ROOM_NOT_FOUND);
    }

    const player = room.players[playerId];
    if (!player) {
      throw new Error(ERROR_MESSAGES.PLAYER_NOT_FOUND);
    }

    player.clue = clue.trim();
    player.clueGivenAt = Date.now();
    room.updatedAt = Date.now();
    await this.firebaseService.saveGameRoom(room);
    this.currentRoom$.next(room);
  }

  /**
   * Pasar al siguiente turno
   */
  async nextTurn(roomId: string): Promise<void> {
    const room = await this.firebaseService.getGameRoom(roomId);
    if (!room) {
      throw new Error(ERROR_MESSAGES.ROOM_NOT_FOUND);
    }

    if (!room.playerTurnOrder) {
      throw new Error(ERROR_MESSAGES.TURN_ORDER_NOT_SET);
    }

    const nextTurnIndex = (room.currentTurn || 0) + 1;

    // Si ya dieron pista todos, ir a votación
    if (nextTurnIndex >= room.playerTurnOrder.length) {
      await this.startVotingPhase(roomId);
      return;
    }

    room.currentTurn = nextTurnIndex;
    room.updatedAt = Date.now();
    await this.firebaseService.saveGameRoom(room);
    this.currentRoom$.next(room);
  }

  /**
   * Iniciar la fase de votación con timer de 30 segundos
   */
  async startVotingPhase(roomId: string): Promise<void> {
    const room = await this.firebaseService.getGameRoom(roomId);
    if (!room) {
      throw new Error(ERROR_MESSAGES.ROOM_NOT_FOUND);
    }

    // Resetear votos y contadores
    const voteCounts: Record<string, number> = {};
    Object.values(room.players).forEach((player) => {
      player.hasVoted = false;
      player.votedFor = undefined;
      player.voteCount = 0;
      voteCounts[player.id] = 0; // Inicializar conteo de votos para cada jugador
    });

    room.gamePhase = 'voting';
    room.status = 'voting';
    room.votingStartTime = Date.now();
    room.votingTimeLimit = 30000; // 30 segundos
    room.voteCounts = voteCounts;
    room.votingFinished = false; // Resetear el flag
    room.updatedAt = Date.now();
    await this.firebaseService.saveGameRoom(room);
    this.currentRoom$.next(room);
    this.gameStatus$.next('voting');
  }

  /**
   * Actualizar contador de votos en tiempo real
   */
  async updateVoteCount(roomId: string): Promise<void> {
    const room = await this.firebaseService.getGameRoom(roomId);
    if (!room) {
      throw new Error(ERROR_MESSAGES.ROOM_NOT_FOUND);
    }

    // Calcular votos por jugador
    const voteCounts = new Map<string, number>();

    Object.values(room.players).forEach((player) => {
      if (player.votedFor) {
        voteCounts.set(player.votedFor, (voteCounts.get(player.votedFor) || 0) + 1);
      }
    });

    // Actualizar contadores en los jugadores
    Object.entries(room.players).forEach(([playerId]) => {
      room.players[playerId].voteCount = voteCounts.get(playerId) || 0;
    });

    // Convertir Map a objeto
    room.voteCounts = {};
    voteCounts.forEach((value, key) => {
      room.voteCounts![key] = value;
    });

    room.updatedAt = Date.now();
    await this.firebaseService.saveGameRoom(room);
    this.currentRoom$.next(room);
  }

  /**
   * Obtener tiempo restante de votación
   */
  getVotingTimeRemaining(room: GameRoom | null): number {
    if (!room || !room.votingStartTime || !room.votingTimeLimit) {
      return 0;
    }

    const elapsed = Date.now() - room.votingStartTime;
    const remaining = Math.max(0, room.votingTimeLimit - elapsed);
    return remaining;
  }

  /**
   * Verificar si la votación ha expirado
   */
  isVotingExpired(room: GameRoom | null): boolean {
    if (!room || room.status !== 'voting') {
      return false;
    }

    return this.getVotingTimeRemaining(room) <= 0;
  }

  /**
   * Obtener datos actualizados de la sala (helper method)
   */
  async getRoomData(roomId: string): Promise<GameRoom | null> {
    return this.firebaseService.getGameRoom(roomId);
  }

  /**
   * Actualizar sala en Firebase
   */
  private async updateRoom(roomId: string, room: GameRoom): Promise<void> {
    return this.firebaseService.saveGameRoom(room);
  }

  /**
   * Obtener jugadores activos (no eliminados y no en pausa)
   */
  getActivePlayers(room: GameRoom | null): Player[] {
    if (!room) return [];
    return Object.values(room.players).filter((p) => !p.eliminated);
  }

  /**
   * Obtener jugadores eliminados
   */
  getEliminatedPlayers(room: GameRoom | null): Player[] {
    if (!room) return [];
    return Object.values(room.players).filter((p) => p.eliminated);
  }

  /**
   * Obtener el jugador con más votos
   */
  getVoteWinner(room: GameRoom | null): string | null {
    if (!room || !room.voteCounts) return null;
    let winner: string | null = null;
    let maxVotes = 0;
    for (const [playerId, votes] of Object.entries(room.voteCounts)) {
      if (votes > maxVotes) {
        maxVotes = votes;
        winner = playerId;
      }
    }
    return winner;
  }

  /**
   * Eliminar un jugador de la partida
   */
  async eliminatePlayer(roomId: string, playerId: string): Promise<void> {
    const room = await this.getRoomData(roomId);
    if (!room || !room.players[playerId]) return;

    room.players[playerId].eliminated = true;
    room.lastEliminatedId = playerId;
    room.updatedAt = Date.now();
    await this.updateRoom(roomId, room);
  }

  /**
   * Determinar si el juego terminó (impostor eliminado o solo 1 jugador activo)
   */
  isGameOver(room: GameRoom | null): boolean {
    if (!room) return false;
    const activePlayers = this.getActivePlayers(room);
    if (activePlayers.length === 0) return true;

    const impostor = activePlayers.find((p) => p.role === 'impostor');
    const characters = activePlayers.filter((p) => p.role === 'character');

    // Juego termina si: impostor fue eliminado O no hay personajes activos
    return !impostor || characters.length === 0;
  }

  /**
   * Determinar el rol ganador
   */
  determineWinner(room: GameRoom | null): PlayerRole | null {
    if (!room) return null;
    const activePlayers = this.getActivePlayers(room);

    if (activePlayers.length === 0) return null;

    const impostor = activePlayers.find((p) => p.role === 'impostor');
    const characters = activePlayers.filter((p) => p.role === 'character');

    // Si el impostor fue eliminado, ganan los personajes
    if (!impostor) return 'character';

    // Si no hay personajes, gana el impostor
    if (characters.length === 0) return 'impostor';

    return null; // El juego aún continúa
  }

  /**
   * Procesar una ronda de votación completa
   */
  async processVotingRound(roomId: string): Promise<{ gameOver: boolean; winner?: PlayerRole }> {
    const room = await this.getRoomData(roomId);
    if (!room) return { gameOver: true };

    // Encontrar el jugador con más votos
    const votedOutId = this.getVoteWinner(room);
    if (!votedOutId) return { gameOver: false };

    // Eliminar al jugador más votado
    await this.eliminatePlayer(roomId, votedOutId);

    // Actualizar la sala después de eliminar
    const updatedRoom = await this.getRoomData(roomId);
    if (!updatedRoom) return { gameOver: true };

    // Verificar si el juego terminó
    const winner = this.determineWinner(updatedRoom);
    if (winner) {
      updatedRoom.status = 'finished';
      updatedRoom.winnerRole = winner;
      await this.updateRoom(roomId, updatedRoom);
      return { gameOver: true, winner };
    }

    // El juego continúa: volver a la fase de pistas
    updatedRoom.gamePhase = 'clues';
    updatedRoom.currentTurn = 0;
    updatedRoom.roundNumber = (updatedRoom.roundNumber || 1) + 1;

    // Resetear votos
    updatedRoom.voteCounts = {};
    Object.keys(updatedRoom.players).forEach((id) => {
      updatedRoom.players[id].hasVoted = false;
      updatedRoom.voteCounts![id] = 0;
    });

    // Resetear pistas para la nueva ronda
    Object.values(updatedRoom.players).forEach((p) => {
      p.clue = undefined;
      p.clueGivenAt = undefined;
    });

    updatedRoom.status = 'in_progress';
    await this.updateRoom(roomId, updatedRoom);

    return { gameOver: false };
  }
}
