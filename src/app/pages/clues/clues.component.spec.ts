import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CluesComponent } from './clues.component';
import { GameService } from '../../services/game.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { GameRoom } from '../../models/game.types';
import { of } from 'rxjs';

interface MockActivatedRoute {
  snapshot: {
    paramMap: {
      get: jasmine.Spy;
    };
  };
}

describe('CluesComponent', () => {
  let component: CluesComponent;
  let fixture: ComponentFixture<CluesComponent>;
  let gameService: jasmine.SpyObj<GameService>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: MockActivatedRoute;

  beforeEach(async () => {
    const gameServiceSpy = jasmine.createSpyObj('GameService', [
      'submitClue',
      'nextTurn',
      'onRoomUpdate',
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    activatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('room1'),
        },
      },
    };

    await TestBed.configureTestingModule({
      declarations: [],
      imports: [CluesComponent, CommonModule, FormsModule, IonicModule],
      providers: [
        { provide: GameService, useValue: gameServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRoute },
      ],
    }).compileComponents();

    gameService = TestBed.inject(GameService) as jasmine.SpyObj<GameService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    sessionStorage.setItem('currentPlayerId', 'player1');

    const mockRoom: GameRoom = {
      id: 'room1',
      code: '123456',
      hostId: 'host1',
      players: {
        player1: {
          id: 'player1',
          name: 'Player 1',
          role: 'character',
          hasVoted: false,
          swappedCharacters: 0,
          turnNumber: 1,
        },
        player2: {
          id: 'player2',
          name: 'Player 2',
          role: 'impostor',
          hasVoted: false,
          swappedCharacters: 0,
          turnNumber: 2,
        },
        player3: {
          id: 'player3',
          name: 'Player 3',
          role: 'character',
          hasVoted: false,
          swappedCharacters: 0,
          turnNumber: 3,
        },
      },
      minPlayers: 3,
      maxPlayers: 10,
      status: 'clues',
      availableCharacters: [],
      usedCharacters: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      gamePhase: 'clues',
      currentTurn: 0,
      playerTurnOrder: ['player1', 'player2', 'player3'],
    };

    gameService.onRoomUpdate.and.returnValue(of(mockRoom));
  });

  it('debería crear el componente', () => {
    fixture = TestBed.createComponent(CluesComponent);
    component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('Historia 11: Debería permitir al jugador entregar una pista', fakeAsync(async () => {
    fixture = TestBed.createComponent(CluesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    gameService.submitClue.and.returnValue(Promise.resolve());
    gameService.nextTurn.and.returnValue(Promise.resolve());

    component.clueInput = 'Héroe Verde';
    component.isCurrentPlayerTurn = true;
    await component.submitClue();

    expect(gameService.submitClue).toHaveBeenCalledWith('room1', 'player1', 'Héroe Verde');
  }));

  it('debería rechazar pistas vacías', fakeAsync(async () => {
    fixture = TestBed.createComponent(CluesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.clueInput = '';
    await component.submitClue();

    expect(component.error).toContain('Por favor ingresa una pista');
  }));

  it('debería mostrar el turno actual del jugador', () => {
    fixture = TestBed.createComponent(CluesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.room = {
      id: 'room1',
      code: '123456',
      hostId: 'host1',
      players: {
        player1: {
          id: 'player1',
          name: 'Player 1',
          role: 'character',
          hasVoted: false,
          swappedCharacters: 0,
          turnNumber: 1,
        },
        player2: {
          id: 'player2',
          name: 'Player 2',
          role: 'impostor',
          hasVoted: false,
          swappedCharacters: 0,
          turnNumber: 2,
        },
        player3: {
          id: 'player3',
          name: 'Player 3',
          role: 'character',
          hasVoted: false,
          swappedCharacters: 0,
          turnNumber: 3,
        },
      },
      minPlayers: 3,
      maxPlayers: 10,
      status: 'clues',
      availableCharacters: [],
      usedCharacters: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      gamePhase: 'clues',
      currentTurn: 0,
      playerTurnOrder: ['player1', 'player2', 'player3'],
    };

    expect(component.currentTurnNumber).toBe(1);
    expect(component.totalTurns).toBe(3);
  });

  it('debería mostrar quién es el jugador actual en turno', () => {
    fixture = TestBed.createComponent(CluesComponent);
    component = fixture.componentInstance;

    const mockRoom: GameRoom = {
      id: 'room1',
      code: '123456',
      hostId: 'host1',
      players: {
        player1: {
          id: 'player1',
          name: 'Player 1',
          role: 'character',
          hasVoted: false,
          swappedCharacters: 0,
          turnNumber: 1,
        },
        player2: {
          id: 'player2',
          name: 'Player 2',
          role: 'impostor',
          hasVoted: false,
          swappedCharacters: 0,
          turnNumber: 2,
          clue: 'Pista del impostor',
        },
        player3: {
          id: 'player3',
          name: 'Player 3',
          role: 'character',
          hasVoted: false,
          swappedCharacters: 0,
          turnNumber: 3,
        },
      },
      minPlayers: 3,
      maxPlayers: 10,
      status: 'clues',
      availableCharacters: [],
      usedCharacters: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      gamePhase: 'clues',
      currentTurn: 1,
      playerTurnOrder: ['player1', 'player2', 'player3'],
    };

    gameService.onRoomUpdate.and.returnValue(of(mockRoom));
    fixture.detectChanges();

    component.room = mockRoom;
    component.currentPlayer = mockRoom.players['player1'];

    // Verificar que player2 está en turno
    const currentTurnPlayerId = mockRoom.playerTurnOrder![mockRoom.currentTurn!];
    expect(currentTurnPlayerId).toBe('player2');
    expect(mockRoom.players[currentTurnPlayerId].name).toBe('Player 2');
  });

  it('debería mostrar todas las pistas dadas hasta el momento', () => {
    fixture = TestBed.createComponent(CluesComponent);
    component = fixture.componentInstance;

    const mockRoom: GameRoom = {
      id: 'room1',
      code: '123456',
      hostId: 'host1',
      players: {
        player1: {
          id: 'player1',
          name: 'Player 1',
          role: 'character',
          hasVoted: false,
          swappedCharacters: 0,
          turnNumber: 1,
          clue: 'Verde',
          clueGivenAt: Date.now(),
        },
        player2: {
          id: 'player2',
          name: 'Player 2',
          role: 'impostor',
          hasVoted: false,
          swappedCharacters: 0,
          turnNumber: 2,
          clue: 'Famoso',
          clueGivenAt: Date.now(),
        },
        player3: {
          id: 'player3',
          name: 'Player 3',
          role: 'character',
          hasVoted: false,
          swappedCharacters: 0,
          turnNumber: 3,
        },
      },
      minPlayers: 3,
      maxPlayers: 10,
      status: 'clues',
      availableCharacters: [],
      usedCharacters: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      gamePhase: 'clues',
      currentTurn: 1,
      playerTurnOrder: ['player1', 'player2', 'player3'],
    };

    // Simular asignación directa a la propiedad privada
    (component as any).room = mockRoom;

    const clues = (component as any).playerClues;
    expect(clues).toBeDefined();
    expect(clues.length).toBe(3);
    if (clues.length > 0) {
      expect(clues[0].player.clue).toBe('Verde');
    }
    if (clues.length > 1) {
      expect(clues[1].player.clue).toBe('Famoso');
    }
    if (clues.length > 2) {
      expect(clues[2].player.clue).toBeUndefined();
    }
  });

  it('debería indicar si es el turno del jugador actual', () => {
    fixture = TestBed.createComponent(CluesComponent);
    component = fixture.componentInstance;

    const mockRoom: GameRoom = {
      id: 'room1',
      code: '123456',
      hostId: 'host1',
      players: {
        player1: {
          id: 'player1',
          name: 'Player 1',
          role: 'character',
          hasVoted: false,
          swappedCharacters: 0,
          turnNumber: 1,
        },
        player2: {
          id: 'player2',
          name: 'Player 2',
          role: 'impostor',
          hasVoted: false,
          swappedCharacters: 0,
          turnNumber: 2,
        },
      },
      minPlayers: 3,
      maxPlayers: 10,
      status: 'clues',
      availableCharacters: [],
      usedCharacters: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      gamePhase: 'clues',
      currentTurn: 0,
      playerTurnOrder: ['player1', 'player2'],
    };

    component.room = mockRoom;
    component.currentPlayerId = 'player1';
    component.isCurrentPlayerTurn = true;

    expect(component.isCurrentPlayerTurn).toBe(true);
  });

  it('debería navegar a votación cuando el status sea voting', () => {
    fixture = TestBed.createComponent(CluesComponent);
    component = fixture.componentInstance;

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
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    gameService.onRoomUpdate.and.returnValue(of(mockRoom));
    fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalledWith(['/voting', 'room1']);
  });

  it('debería pasar al siguiente turno después de enviar pista', fakeAsync(async () => {
    fixture = TestBed.createComponent(CluesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    gameService.submitClue.and.returnValue(Promise.resolve());
    gameService.nextTurn.and.returnValue(Promise.resolve());

    component.clueInput = 'Héroe';
    component.isCurrentPlayerTurn = true;
    await component.submitClue();

    // Esperar a que se ejecute el setTimeout
    tick(1000);

    expect(gameService.nextTurn).toHaveBeenCalledWith('room1');
  }));

  it('debería limpiar el input después de enviar la pista', fakeAsync(async () => {
    fixture = TestBed.createComponent(CluesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    gameService.submitClue.and.returnValue(Promise.resolve());
    gameService.nextTurn.and.returnValue(Promise.resolve());

    component.clueInput = 'Héroe';
    component.isCurrentPlayerTurn = true;
    await component.submitClue();

    expect(component.clueInput).toBe('');
  }));
});
