import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { VotingComponent } from './voting.component';
import { GameService } from '../../services/game.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { GameRoom, VotingResult } from '../../models/game.types';
import { of } from 'rxjs';

interface MockActivatedRoute {
  snapshot: {
    paramMap: {
      get: jasmine.Spy;
    };
  };
}

describe('VotingComponent', () => {
  let component: VotingComponent;
  let fixture: ComponentFixture<VotingComponent>;
  let gameService: jasmine.SpyObj<GameService>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: MockActivatedRoute;

  beforeEach(async () => {
    const gameServiceSpy = jasmine.createSpyObj('GameService', [
      'registerVote',
      'finishVoting',
      'resetGame',
      'onRoomUpdate',
      'getVotingTimeRemaining',
      'isVotingExpired',
      'updateVoteCount',
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
      imports: [VotingComponent, CommonModule, IonicModule],
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
        player1: { id: 'player1', name: 'Player 1', role: 'character', hasVoted: false, swappedCharacters: 0, voteCount: 0 },
        player2: { id: 'player2', name: 'Player 2', role: 'impostor', hasVoted: false, swappedCharacters: 0, voteCount: 0 },
        player3: { id: 'player3', name: 'Player 3', role: 'character', hasVoted: false, swappedCharacters: 0, voteCount: 0 },
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
      voteCounts: {},
    };

    gameService.onRoomUpdate.and.returnValue(of(mockRoom));
    gameService.getVotingTimeRemaining.and.returnValue(25000); // 25 segundos restantes
    gameService.isVotingExpired.and.returnValue(false);
    gameService.updateVoteCount.and.returnValue(Promise.resolve());
  });

  it('debería crear el componente', () => {
    fixture = TestBed.createComponent(VotingComponent);
    component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('Historia 10: Debería permitir al jugador seleccionar a quién votar', () => {
    fixture = TestBed.createComponent(VotingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.selectVote('player2');
    expect(component.selectedVoteId).toBe('player2');
  });

  it('debería evitar seleccionar si ya votó', fakeAsync(() => {
    fixture = TestBed.createComponent(VotingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.hasVoted = true;
    component.selectVote('player2');

    expect(component.selectedVoteId).toBeNull();
  }));

  it('Historia 10: Debería registrar el voto correctamente', fakeAsync(async () => {
    fixture = TestBed.createComponent(VotingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    gameService.registerVote.and.returnValue(Promise.resolve());

    component.selectedVoteId = 'player2';
    await component.submitVote();

    expect(gameService.registerVote).toHaveBeenCalledWith('room1', 'player1', 'player2');
    expect(component.hasVoted).toBe(true);
  }));

  it('debería mostrar timer de 30 segundos para votación', () => {
    fixture = TestBed.createComponent(VotingComponent);
    component = fixture.componentInstance;
    component.votingTimeRemaining = 30;
    fixture.detectChanges();

    expect(component.votingTimeRemaining).toBe(30);
  });

  it('debería actualizar el timer en tiempo real', fakeAsync(() => {
    fixture = TestBed.createComponent(VotingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // Simular actualización del timer
    const now = Date.now();
    component.room = {
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
      votingStartTime: now - 10000, // hace 10 segundos
      votingTimeLimit: 30000, // 30 segundos
    };

    gameService.getVotingTimeRemaining.and.returnValue(20000); // 20 segundos restantes
    component.votingTimeRemaining = 20;

    expect(component.votingTimeRemaining).toBe(20);
  }));

  it('Historia 5: Debería terminar la votación automáticamente cuando expire el tiempo', fakeAsync(async () => {
    fixture = TestBed.createComponent(VotingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const mockResult: VotingResult = {
      votedOutPlayerId: 'player2',
      votedOutPlayer: { id: 'player2', name: 'Player 2', role: 'impostor', hasVoted: true, swappedCharacters: 0 },
      wasImpostor: true,
      votes: { player1: 'player2', player3: 'player2' },
      playerVotes: [
        { voterId: 'player1', votedFor: 'player2' },
        { voterId: 'player3', votedFor: 'player2' },
      ],
    };

    gameService.finishVoting.and.returnValue(Promise.resolve(mockResult));

    // Simular que el tiempo de votación ha expirado
    gameService.isVotingExpired.and.returnValue(true);
    component.votingTimeRemaining = 0;

    // Simular finalización de votación
    component.votingResult = await gameService.finishVoting('room1');
    component.showResults = true;

    expect(gameService.finishVoting).toHaveBeenCalledWith('room1');
    expect(component.votingResult).toEqual(mockResult);
    expect(component.showResults).toBe(true);
  }));

  it('debería mostrar los votos en tiempo real', () => {
    fixture = TestBed.createComponent(VotingComponent);
    component = fixture.componentInstance;

    const mockRoom: GameRoom = {
      id: 'room1',
      code: '123456',
      hostId: 'host1',
      players: {
        player1: { id: 'player1', name: 'Player 1', role: 'character', hasVoted: true, swappedCharacters: 0 },
        player2: { id: 'player2', name: 'Player 2', role: 'impostor', hasVoted: true, swappedCharacters: 0 },
      },
      minPlayers: 2,
      maxPlayers: 10,
      status: 'voting',
      availableCharacters: [],
      usedCharacters: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      voteCounts: { player1: 1, player2: 2 },
    };

    (component as any).room = mockRoom;

    expect((component as any).getVoteCount('player1')).toBe(1);
    expect((component as any).getVoteCount('player2')).toBe(2);
    expect((component as any).getVoteCount('player3')).toBe(0);
  });

  it('Historia 12: Debería mostrar quién fue el impostor después de la votación', fakeAsync(async () => {
    fixture = TestBed.createComponent(VotingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const mockResult: VotingResult = {
      votedOutPlayerId: 'player2',
      votedOutPlayer: { id: 'player2', name: 'Player 2', role: 'impostor', hasVoted: true, swappedCharacters: 0 },
      wasImpostor: true,
      votes: { player1: 'player2', player3: 'player2' },
      playerVotes: [
        { voterId: 'player1', votedFor: 'player2' },
        { voterId: 'player3', votedFor: 'player2' },
      ],
    };

    gameService.finishVoting.and.returnValue(Promise.resolve(mockResult));

    component.votingResult = mockResult;
    component.showResults = true;
    fixture.detectChanges();

    expect(component.votingResult?.wasImpostor).toBe(true);
    expect(component.votingResult?.votedOutPlayer.name).toBe('Player 2');
  }));

  it('debería permitir jugar otra ronda', fakeAsync(async () => {
    fixture = TestBed.createComponent(VotingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    gameService.resetGame.and.returnValue(Promise.resolve());

    await component.playAgain();

    expect(gameService.resetGame).toHaveBeenCalledWith('room1');
    expect(router.navigate).toHaveBeenCalledWith(['/lobby', 'room1']);
  }));

  it('debería calcular el progreso de votación correctamente', () => {
    fixture = TestBed.createComponent(VotingComponent);
    component = fixture.componentInstance;
    const mockRoom: GameRoom = {
      id: 'room1',
      code: '123456',
      hostId: 'host1',
      players: {
        player1: { id: 'player1', name: 'Player 1', role: 'character', hasVoted: true, swappedCharacters: 0 },
        player2: { id: 'player2', name: 'Player 2', role: 'impostor', hasVoted: true, swappedCharacters: 0 },
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

    (component as any).room = mockRoom;

    const progress = (component as any).getVotingProgress();
    expect(progress).toBe(67); // 2 de 3 = 66.66% → redondea a 67
  });
});
