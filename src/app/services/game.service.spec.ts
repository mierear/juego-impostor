import { TestBed } from '@angular/core/testing';
import { GameService } from './game.service';
import { FirebaseService } from './firebase.service';
import { CharacterService } from './character.service';
import { GameRoom, Player, Character } from '../models/game.types';

describe('GameService - Pistas y Votación', () => {
  let service: GameService;
  let firebaseService: jasmine.SpyObj<FirebaseService>;
  let characterService: jasmine.SpyObj<CharacterService>;

  beforeEach(() => {
    const firebaseSpy = jasmine.createSpyObj('FirebaseService', [
      'saveGameRoom',
      'getGameRoom',
      'getGameRoomByCode',
      'onRoomChange',
    ]);
    const characterSpy = jasmine.createSpyObj('CharacterService', ['getCharacters']);

    TestBed.configureTestingModule({
      providers: [
        GameService,
        { provide: FirebaseService, useValue: firebaseSpy },
        { provide: CharacterService, useValue: characterSpy },
      ],
    });

    service = TestBed.inject(GameService);
    firebaseService = TestBed.inject(FirebaseService) as jasmine.SpyObj<FirebaseService>;
    characterService = TestBed.inject(CharacterService) as jasmine.SpyObj<CharacterService>;
  });

  describe('startCluesPhase', () => {
    it('debería iniciar la fase de pistas correctamente', async () => {
      const mockRoom: GameRoom = {
        id: 'room1',
        code: '123456',
        hostId: 'host1',
        players: {
          player1: { id: 'player1', name: 'Player 1', role: 'character', hasVoted: false, swappedCharacters: 0 },
          player2: { id: 'player2', name: 'Player 2', role: 'impostor', hasVoted: false, swappedCharacters: 0 },
        },
        minPlayers: 3,
        maxPlayers: 10,
        status: 'in_progress',
        availableCharacters: [],
        usedCharacters: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      firebaseService.getGameRoom.and.returnValue(Promise.resolve(mockRoom));
      firebaseService.saveGameRoom.and.returnValue(Promise.resolve());

      await service.startCluesPhase('room1');

      expect(firebaseService.saveGameRoom).toHaveBeenCalled();
      const savedRoom = firebaseService.saveGameRoom.calls.mostRecent().args[0] as GameRoom;
      expect(savedRoom.gamePhase).toBe('clues');
      expect(savedRoom.status).toBe('clues');
      expect(savedRoom.playerTurnOrder).toBeDefined();
      expect(savedRoom.playerTurnOrder!.length).toBe(2);
      expect(savedRoom.currentTurn).toBe(0);
    });

    it('debería asignar números de turno a los jugadores', async () => {
      const mockRoom: GameRoom = {
        id: 'room1',
        code: '123456',
        hostId: 'host1',
        players: {
          player1: { id: 'player1', name: 'Player 1', role: 'character', hasVoted: false, swappedCharacters: 0 },
          player2: { id: 'player2', name: 'Player 2', role: 'impostor', hasVoted: false, swappedCharacters: 0 },
          player3: { id: 'player3', name: 'Player 3', role: 'character', hasVoted: false, swappedCharacters: 0 },
        },
        minPlayers: 3,
        maxPlayers: 10,
        status: 'in_progress',
        availableCharacters: [],
        usedCharacters: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      firebaseService.getGameRoom.and.returnValue(Promise.resolve(mockRoom));
      firebaseService.saveGameRoom.and.returnValue(Promise.resolve());

      await service.startCluesPhase('room1');

      const savedRoom = firebaseService.saveGameRoom.calls.mostRecent().args[0] as GameRoom;

      savedRoom.playerTurnOrder!.forEach((playerId, index) => {
        expect(savedRoom.players[playerId].turnNumber).toBe(index + 1);
      });
    });
  });

  describe('submitClue', () => {
    it('debería rechazar pistas vacías', async () => {
      firebaseService.getGameRoom.and.returnValue(Promise.resolve({} as GameRoom));

      await expectAsync(service.submitClue('room1', 'player1', '')).toBeRejectedWithError(
        'La pista no puede estar vacía'
      );
      await expectAsync(service.submitClue('room1', 'player1', '   ')).toBeRejectedWithError(
        'La pista no puede estar vacía'
      );
    });

    it('debería guardar la pista del jugador', async () => {
      const mockRoom: GameRoom = {
        id: 'room1',
        code: '123456',
        hostId: 'host1',
        players: {
          player1: { id: 'player1', name: 'Player 1', role: 'character', hasVoted: false, swappedCharacters: 0 },
        },
        minPlayers: 3,
        maxPlayers: 10,
        status: 'clues',
        availableCharacters: [],
        usedCharacters: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      firebaseService.getGameRoom.and.returnValue(Promise.resolve(mockRoom));
      firebaseService.saveGameRoom.and.returnValue(Promise.resolve());

      await service.submitClue('room1', 'player1', 'Verde y Famoso');

      expect(firebaseService.saveGameRoom).toHaveBeenCalled();
      const savedRoom = firebaseService.saveGameRoom.calls.mostRecent().args[0] as GameRoom;
      expect(savedRoom.players['player1'].clue).toBe('Verde y Famoso');
      expect(savedRoom.players['player1'].clueGivenAt).toBeDefined();
    });
  });

  describe('startVotingPhase', () => {
    it('debería iniciar la fase de votación con configuración correcta', async () => {
      const mockRoom: GameRoom = {
        id: 'room1',
        code: '123456',
        hostId: 'host1',
        players: {
          player1: { id: 'player1', name: 'Player 1', role: 'character', hasVoted: true, swappedCharacters: 0 },
          player2: { id: 'player2', name: 'Player 2', role: 'impostor', hasVoted: true, swappedCharacters: 0 },
        },
        minPlayers: 3,
        maxPlayers: 10,
        status: 'clues',
        availableCharacters: [],
        usedCharacters: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      firebaseService.getGameRoom.and.returnValue(Promise.resolve(mockRoom));
      firebaseService.saveGameRoom.and.returnValue(Promise.resolve());

      await service.startVotingPhase('room1');

      const savedRoom = firebaseService.saveGameRoom.calls.mostRecent().args[0] as GameRoom;
      expect(savedRoom.gamePhase).toBe('voting');
      expect(savedRoom.status).toBe('voting');
      expect(savedRoom.votingStartTime).toBeDefined();
      expect(savedRoom.votingTimeLimit).toBe(30000);

      // Verificar que los votos fueron reseteados
      Object.values(savedRoom.players).forEach((player) => {
        expect(player.hasVoted).toBe(false);
        expect(player.votedFor).toBeUndefined();
        expect(player.voteCount).toBe(0);
      });
    });
  });

  describe('updateVoteCount', () => {
    it('debería contar los votos correctamente en tiempo real', async () => {
      const mockRoom: GameRoom = {
        id: 'room1',
        code: '123456',
        hostId: 'host1',
        players: {
          player1: { id: 'player1', name: 'Player 1', role: 'character', hasVoted: true, votedFor: 'player2', swappedCharacters: 0 },
          player2: { id: 'player2', name: 'Player 2', role: 'impostor', hasVoted: true, votedFor: 'player2', swappedCharacters: 0 },
          player3: { id: 'player3', name: 'Player 3', role: 'character', hasVoted: true, votedFor: 'player1', swappedCharacters: 0 },
        },
        minPlayers: 3,
        maxPlayers: 10,
        status: 'voting',
        availableCharacters: [],
        usedCharacters: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        votingStartTime: Date.now(),
        votingTimeLimit: 30000,
      };

      firebaseService.getGameRoom.and.returnValue(Promise.resolve(mockRoom));
      firebaseService.saveGameRoom.and.returnValue(Promise.resolve());

      await service.updateVoteCount('room1');

      const savedRoom = firebaseService.saveGameRoom.calls.mostRecent().args[0] as GameRoom;
      expect(savedRoom.players['player2'].voteCount).toBe(2);
      expect(savedRoom.players['player1'].voteCount).toBe(1);
      expect(savedRoom.voteCounts!['player2']).toBe(2);
      expect(savedRoom.voteCounts!['player1']).toBe(1);
    });
  });

  describe('getVotingTimeRemaining', () => {
    it('debería retornar el tiempo restante en votación', () => {
      const now = Date.now();
      const mockRoom: GameRoom = {
        id: 'room1',
        code: '123456',
        hostId: 'host1',
        players: {},
        minPlayers: 3,
        maxPlayers: 10,
        status: 'voting',
        availableCharacters: [],
        usedCharacters: [],
        createdAt: now,
        updatedAt: now,
        votingStartTime: now - 5000, // hace 5 segundos
        votingTimeLimit: 30000, // 30 segundos
      };

      const remaining = service.getVotingTimeRemaining(mockRoom);
      expect(remaining).toBeGreaterThan(24000);
      expect(remaining).toBeLessThanOrEqual(25000);
    });

    it('debería retornar 0 si el tiempo ha expirado', () => {
      const now = Date.now();
      const mockRoom: GameRoom = {
        id: 'room1',
        code: '123456',
        hostId: 'host1',
        players: {},
        minPlayers: 3,
        maxPlayers: 10,
        status: 'voting',
        availableCharacters: [],
        usedCharacters: [],
        createdAt: now,
        updatedAt: now,
        votingStartTime: now - 35000, // hace 35 segundos
        votingTimeLimit: 30000, // 30 segundos
      };

      const remaining = service.getVotingTimeRemaining(mockRoom);
      expect(remaining).toBe(0);
    });
  });

  describe('isVotingExpired', () => {
    it('debería retornar true si la votación ha expirado', () => {
      const now = Date.now();
      const mockRoom: GameRoom = {
        id: 'room1',
        code: '123456',
        hostId: 'host1',
        players: {},
        minPlayers: 3,
        maxPlayers: 10,
        status: 'voting',
        availableCharacters: [],
        usedCharacters: [],
        createdAt: now,
        updatedAt: now,
        votingStartTime: now - 35000,
        votingTimeLimit: 30000,
      };

      expect(service.isVotingExpired(mockRoom)).toBe(true);
    });

    it('debería retornar false si la votación aún está activa', () => {
      const now = Date.now();
      const mockRoom: GameRoom = {
        id: 'room1',
        code: '123456',
        hostId: 'host1',
        players: {},
        minPlayers: 3,
        maxPlayers: 10,
        status: 'voting',
        availableCharacters: [],
        usedCharacters: [],
        createdAt: now,
        updatedAt: now,
        votingStartTime: now - 5000,
        votingTimeLimit: 30000,
      };

      expect(service.isVotingExpired(mockRoom)).toBe(false);
    });

    it('debería retornar false si el status no es voting', () => {
      const now = Date.now();
      const mockRoom: GameRoom = {
        id: 'room1',
        code: '123456',
        hostId: 'host1',
        players: {},
        minPlayers: 3,
        maxPlayers: 10,
        status: 'finished',
        availableCharacters: [],
        usedCharacters: [],
        createdAt: now,
        updatedAt: now,
      };

      expect(service.isVotingExpired(mockRoom)).toBe(false);
    });
  });
});

describe('GameService - Especificación de Requisitos', () => {
  let service: GameService;
  let firebaseService: jasmine.SpyObj<FirebaseService>;
  let characterService: jasmine.SpyObj<CharacterService>;

  beforeEach(() => {
    const firebaseSpy = jasmine.createSpyObj('FirebaseService', [
      'saveGameRoom',
      'getGameRoom',
      'getGameRoomByCode',
      'onRoomChange',
    ]);
    const characterSpy = jasmine.createSpyObj('CharacterService', ['getCharacters']);

    TestBed.configureTestingModule({
      providers: [
        GameService,
        { provide: FirebaseService, useValue: firebaseSpy },
        { provide: CharacterService, useValue: characterSpy },
      ],
    });

    service = TestBed.inject(GameService);
    firebaseService = TestBed.inject(FirebaseService) as jasmine.SpyObj<FirebaseService>;
    characterService = TestBed.inject(CharacterService) as jasmine.SpyObj<CharacterService>;
  });

  it('Historia 6: Debería asignar exactamente 1 impostor y N-1 personajes normales', async () => {
    const characters: Character[] = [
      { id: 'char1', name: 'Batman', image: '🦇' },
    ];

    const mockRoom: GameRoom = {
      id: 'room1',
      code: '123456',
      hostId: 'host1',
      players: {
        player1: { id: 'player1', name: 'Player 1', role: 'character', hasVoted: false, swappedCharacters: 0 },
        player2: { id: 'player2', name: 'Player 2', role: 'character', hasVoted: false, swappedCharacters: 0 },
        player3: { id: 'player3', name: 'Player 3', role: 'character', hasVoted: false, swappedCharacters: 0 },
      },
      minPlayers: 3,
      maxPlayers: 10,
      status: 'waiting',
      availableCharacters: characters,
      usedCharacters: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    characterService.getCharacters.and.returnValue(characters);
    firebaseService.getGameRoom.and.returnValue(Promise.resolve(mockRoom));
    firebaseService.saveGameRoom.and.returnValue(Promise.resolve());

    await service.startGame('room1');

    const savedRoom = firebaseService.saveGameRoom.calls.mostRecent().args[0] as GameRoom;
    const impostorCount = Object.values(savedRoom.players).filter((p) => p.role === 'impostor').length;
    const characterCount = Object.values(savedRoom.players).filter((p) => p.role === 'character').length;

    expect(impostorCount).toBe(1);
    expect(characterCount).toBe(2);
  });

  it('Historia 6: Todos los personajes normales deben conocer el MISMO personaje', async () => {
    const characters: Character[] = [
      { id: 'char1', name: 'Batman', image: '🦇' },
    ];

    const mockRoom: GameRoom = {
      id: 'room1',
      code: '123456',
      hostId: 'host1',
      players: {
        player1: { id: 'player1', name: 'Player 1', role: 'character', hasVoted: false, swappedCharacters: 0 },
        player2: { id: 'player2', name: 'Player 2', role: 'character', hasVoted: false, swappedCharacters: 0 },
        player3: { id: 'player3', name: 'Player 3', role: 'character', hasVoted: false, swappedCharacters: 0 },
      },
      minPlayers: 3,
      maxPlayers: 10,
      status: 'waiting',
      availableCharacters: characters,
      usedCharacters: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    characterService.getCharacters.and.returnValue(characters);
    firebaseService.getGameRoom.and.returnValue(Promise.resolve(mockRoom));
    firebaseService.saveGameRoom.and.returnValue(Promise.resolve());

    await service.startGame('room1');

    const savedRoom = firebaseService.saveGameRoom.calls.mostRecent().args[0] as GameRoom;
    const normalPlayers = Object.values(savedRoom.players).filter((p) => p.role === 'character');

    const firstCharacterId = normalPlayers[0].character?.id;
    normalPlayers.forEach((player) => {
      expect(player.character?.id).toBe(firstCharacterId);
    });
  });

  it('Historia 5: Debería requerir al menos 3 jugadores para iniciar', async () => {
    const mockRoom: GameRoom = {
      id: 'room1',
      code: '123456',
      hostId: 'host1',
      players: {
        player1: { id: 'player1', name: 'Player 1', role: 'character', hasVoted: false, swappedCharacters: 0 },
        player2: { id: 'player2', name: 'Player 2', role: 'character', hasVoted: false, swappedCharacters: 0 },
      },
      minPlayers: 3,
      maxPlayers: 10,
      status: 'waiting',
      availableCharacters: [],
      usedCharacters: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    firebaseService.getGameRoom.and.returnValue(Promise.resolve(mockRoom));

    await expectAsync(service.startGame('room1')).toBeRejectedWithError('Se requieren al menos 3 jugadores');
  });
});

describe('GameService - Eliminación y Fin del Juego', () => {
  let service: GameService;
  let firebaseService: jasmine.SpyObj<FirebaseService>;
  let characterService: jasmine.SpyObj<CharacterService>;

  beforeEach(() => {
    const firebaseSpy = jasmine.createSpyObj('FirebaseService', [
      'saveGameRoom',
      'getGameRoom',
      'getGameRoomByCode',
      'onRoomChange',
    ]);
    const characterSpy = jasmine.createSpyObj('CharacterService', ['getCharacters']);

    TestBed.configureTestingModule({
      providers: [
        GameService,
        { provide: FirebaseService, useValue: firebaseSpy },
        { provide: CharacterService, useValue: characterSpy },
      ],
    });

    service = TestBed.inject(GameService);
    firebaseService = TestBed.inject(FirebaseService) as jasmine.SpyObj<FirebaseService>;
    characterService = TestBed.inject(CharacterService) as jasmine.SpyObj<CharacterService>;
  });

  it('debería obtener jugadores activos (no eliminados)', () => {
    const mockRoom: GameRoom = {
      id: 'room1',
      code: '123456',
      hostId: 'host1',
      players: {
        player1: { id: 'player1', name: 'Player 1', role: 'character', hasVoted: false, swappedCharacters: 0 },
        player2: { id: 'player2', name: 'Player 2', role: 'impostor', hasVoted: false, swappedCharacters: 0, eliminated: true },
        player3: { id: 'player3', name: 'Player 3', role: 'character', hasVoted: false, swappedCharacters: 0 },
      },
      minPlayers: 3,
      maxPlayers: 10,
      status: 'voting',
      availableCharacters: [],
      usedCharacters: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const activePlayers = service.getActivePlayers(mockRoom);
    expect(activePlayers.length).toBe(2);
    expect(activePlayers.every((p) => !p.eliminated)).toBe(true);
  });

  it('debería obtener jugadores eliminados', () => {
    const mockRoom: GameRoom = {
      id: 'room1',
      code: '123456',
      hostId: 'host1',
      players: {
        player1: { id: 'player1', name: 'Player 1', role: 'character', hasVoted: false, swappedCharacters: 0 },
        player2: { id: 'player2', name: 'Player 2', role: 'impostor', hasVoted: false, swappedCharacters: 0, eliminated: true },
        player3: { id: 'player3', name: 'Player 3', role: 'character', hasVoted: false, swappedCharacters: 0, eliminated: true },
      },
      minPlayers: 3,
      maxPlayers: 10,
      status: 'voting',
      availableCharacters: [],
      usedCharacters: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const eliminatedPlayers = service.getEliminatedPlayers(mockRoom);
    expect(eliminatedPlayers.length).toBe(2);
    expect(eliminatedPlayers.every((p) => p.eliminated)).toBe(true);
  });

  it('debería encontrar el jugador con más votos', () => {
    const mockRoom: GameRoom = {
      id: 'room1',
      code: '123456',
      hostId: 'host1',
      players: {
        player1: { id: 'player1', name: 'Player 1', role: 'character', hasVoted: true, swappedCharacters: 0 },
        player2: { id: 'player2', name: 'Player 2', role: 'impostor', hasVoted: true, swappedCharacters: 0 },
        player3: { id: 'player3', name: 'Player 3', role: 'character', hasVoted: true, swappedCharacters: 0 },
      },
      minPlayers: 3,
      maxPlayers: 10,
      status: 'voting',
      availableCharacters: [],
      usedCharacters: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      voteCounts: { player1: 2, player2: 1, player3: 0 },
    };

    const winner = service.getVoteWinner(mockRoom);
    expect(winner).toBe('player1');
  });

  it('debería determinar que el juego terminó si el impostor fue eliminado', () => {
    const mockRoom: GameRoom = {
      id: 'room1',
      code: '123456',
      hostId: 'host1',
      players: {
        player1: { id: 'player1', name: 'Player 1', role: 'character', hasVoted: false, swappedCharacters: 0 },
        player2: { id: 'player2', name: 'Player 2', role: 'impostor', hasVoted: false, swappedCharacters: 0, eliminated: true },
        player3: { id: 'player3', name: 'Player 3', role: 'character', hasVoted: false, swappedCharacters: 0 },
      },
      minPlayers: 3,
      maxPlayers: 10,
      status: 'voting',
      availableCharacters: [],
      usedCharacters: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const gameOver = service.isGameOver(mockRoom);
    expect(gameOver).toBe(true);
  });

  it('debería determinar que ganan los personajes si el impostor fue eliminado', () => {
    const mockRoom: GameRoom = {
      id: 'room1',
      code: '123456',
      hostId: 'host1',
      players: {
        player1: { id: 'player1', name: 'Player 1', role: 'character', hasVoted: false, swappedCharacters: 0 },
        player2: { id: 'player2', name: 'Player 2', role: 'impostor', hasVoted: false, swappedCharacters: 0, eliminated: true },
        player3: { id: 'player3', name: 'Player 3', role: 'character', hasVoted: false, swappedCharacters: 0 },
      },
      minPlayers: 3,
      maxPlayers: 10,
      status: 'voting',
      availableCharacters: [],
      usedCharacters: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const winner = service.determineWinner(mockRoom);
    expect(winner).toBe('character');
  });

  it('debería determinar que gana el impostor si no hay personajes', () => {
    const mockRoom: GameRoom = {
      id: 'room1',
      code: '123456',
      hostId: 'host1',
      players: {
        player1: { id: 'player1', name: 'Player 1', role: 'character', hasVoted: false, swappedCharacters: 0, eliminated: true },
        player2: { id: 'player2', name: 'Player 2', role: 'impostor', hasVoted: false, swappedCharacters: 0 },
        player3: { id: 'player3', name: 'Player 3', role: 'character', hasVoted: false, swappedCharacters: 0, eliminated: true },
      },
      minPlayers: 3,
      maxPlayers: 10,
      status: 'voting',
      availableCharacters: [],
      usedCharacters: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const winner = service.determineWinner(mockRoom);
    expect(winner).toBe('impostor');
  });

  it('debería marcar un jugador como eliminado', async () => {
    const mockRoom: GameRoom = {
      id: 'room1',
      code: '123456',
      hostId: 'host1',
      players: {
        player1: { id: 'player1', name: 'Player 1', role: 'character', hasVoted: false, swappedCharacters: 0 },
        player2: { id: 'player2', name: 'Player 2', role: 'impostor', hasVoted: false, swappedCharacters: 0 },
        player3: { id: 'player3', name: 'Player 3', role: 'character', hasVoted: false, swappedCharacters: 0 },
      },
      minPlayers: 3,
      maxPlayers: 10,
      status: 'voting',
      availableCharacters: [],
      usedCharacters: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    firebaseService.getGameRoom.and.returnValue(Promise.resolve(mockRoom));
    firebaseService.saveGameRoom.and.returnValue(Promise.resolve());

    await service.eliminatePlayer('room1', 'player1');

    expect(firebaseService.saveGameRoom).toHaveBeenCalled();
    const savedRoom = firebaseService.saveGameRoom.calls.mostRecent().args[0] as GameRoom;
    expect(savedRoom.players['player1'].eliminated).toBe(true);
    expect(savedRoom.lastEliminatedId).toBe('player1');
  });
});
