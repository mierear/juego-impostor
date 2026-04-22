import { Component, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { GameService } from '../../services/game.service';
import { GameRoom } from '../../models/game.types';
import { FirebaseService } from '../../services/firebase.service';

@Component({
  selector: 'app-lobby',
  templateUrl: 'lobby.component.html',
  styleUrls: ['lobby.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LobbyComponent implements OnInit, OnDestroy {
  room: GameRoom | null = null;
  roomId = '';
  currentPlayerId = '';
  isHost = false;
  isLoading = false;
  error = '';
  private destroy$ = new Subject<void>();

  constructor(
    private gameService: GameService,
    private firebaseService: FirebaseService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.roomId = this.route.snapshot.paramMap.get('id') || '';
    this.currentPlayerId = sessionStorage.getItem('currentPlayerId') || '';

    if (!this.roomId || !this.currentPlayerId) {
      this.router.navigate(['/home']);
      return;
    }

    // Escuchar cambios en la sala
    this.gameService
      .onRoomUpdate(this.roomId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((room) => {
        this.room = room;
        if (room) {
          this.isHost = room.hostId === this.currentPlayerId;

          // Si el juego ha iniciado, navegar automáticamente a la pantalla de juego
          if (room.status === 'in_progress') {
            this.router.navigate(['/game', this.roomId]);
          }
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Copiar código de sala al portapapeles
   */
  copyRoomCode() {
    if (this.room) {
      navigator.clipboard.writeText(this.room.code);
      // Aquí podrías mostrar un toast de confirmación
    }
  }

  /**
   * Iniciar el juego (solo host)
   */
  async startGame() {
    if (!this.isHost || !this.room) {
      return;
    }

    const playerCount = Object.keys(this.room.players).length;
    if (playerCount < this.room.minPlayers) {
      this.error = `Se requieren al menos ${this.room.minPlayers} jugadores (actual: ${playerCount})`;
      return;
    }

    this.isLoading = true;
    this.error = '';

    try {
      await this.gameService.startGame(this.roomId);
      // Iniciar la fase de pistas
      await this.gameService.startCluesPhase(this.roomId);
      this.router.navigate(['/clues', this.roomId]);
    } catch (error) {
      console.error('Error starting game:', error);
      if (error instanceof Error) {
        this.error = error.message;
      } else {
        this.error = 'Error al iniciar el juego';
      }
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Volver a inicio
   */
  goHome() {
    this.router.navigate(['/home']);
  }

  /**
   * Obtener lista de nombres de jugadores
   */
  get playerNames(): string[] {
    if (!this.room) return [];
    return Object.values(this.room.players).map((p) => p.name);
  }

  /**
   * Obtener cantidad de jugadores
   */
  get playerCount(): number {
    return this.room ? Object.keys(this.room.players).length : 0;
  }
}
