import { Component, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, interval } from 'rxjs';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { GameService } from '../../services/game.service';
import { GameRoom, Player, Character } from '../../models/game.types';

@Component({
  selector: 'app-game',
  templateUrl: 'game.component.html',
  styleUrls: ['game.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class GameComponent implements OnInit, OnDestroy {
  room: GameRoom | null = null;
  roomId = '';
  currentPlayerId = '';
  currentPlayer: Player | null = null;
  isImpostor = false;
  isLoading = false;
  error = '';
  gameTime = '5:00';
  private destroy$ = new Subject<void>();

  constructor(
    private gameService: GameService,
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
          this.currentPlayer = room.players[this.currentPlayerId] || null;
          this.isImpostor = this.currentPlayer?.role === 'impostor';
        }
      });

    // Actualizar timer cada segundo
    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateGameTime();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Actualizar el timer del juego
   */
  private updateGameTime() {
    // Lógica simple: decrementar tiempo cada segundo
    // En una app real, esto vendría del servidor
    const now = Math.floor(Date.now() / 1000);
    const startTime = parseInt(sessionStorage.getItem('gameStartTime') || '0');
    if (startTime === 0) {
      sessionStorage.setItem('gameStartTime', now.toString());
    }
    const elapsedSeconds = now - startTime;
    const remainingSeconds = Math.max(0, 300 - elapsedSeconds); // 5 minutos = 300 segundos
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    this.gameTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Cambiar personaje
   */
  async swapCharacter() {
    if (!this.room || !this.currentPlayer) {
      return;
    }

    this.isLoading = true;
    this.error = '';

    try {
      const newCharacter = await this.gameService.swapCharacter(
        this.roomId,
        this.currentPlayerId
      );

      if (!newCharacter) {
        this.error = 'No hay más personajes disponibles';
      }
    } catch (error) {
      console.error('Error swapping character:', error);
      if (error instanceof Error) {
        this.error = error.message;
      } else {
        this.error = 'Error al cambiar personaje';
      }
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Verificar si está disponible cambiar de personaje (global para todos)
   */
  canSwapCharacter(): boolean {
    if (!this.room || !this.currentPlayer || this.currentPlayer.role !== 'character') {
      return false;
    }
    // Contar cambios totales de la partida
    let totalSwaps = 0;
    Object.values(this.room.players).forEach((p) => {
      totalSwaps += p.swappedCharacters;
    });
    return totalSwaps < 3;
  }

  /**
   * Ir a votación
   */
  goToVoting() {
    this.router.navigate(['/voting', this.roomId]);
  }

  /**
   * Volver a inicio
   */
  goHome() {
    this.router.navigate(['/home']);
  }

  /**
   * Obtener información del jugador actual
   */
  get playerInfo(): { name: string; role: string; character?: Character } | null {
    if (!this.currentPlayer) return null;

    return {
      name: this.currentPlayer.name,
      role: this.isImpostor ? 'Impostor' : 'Personaje',
      character: this.currentPlayer.character,
    };
  }

  /**
   * Obtener cantidad de cambios restantes (global)
   */
  get swapsRemaining(): number {
    if (!this.room) return 0;
    let totalSwaps = 0;
    Object.values(this.room.players).forEach((p) => {
      totalSwaps += p.swappedCharacters;
    });
    return Math.max(0, 3 - totalSwaps);
  }
}
