import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GameService } from '../../services/game.service';
import { GameRoom, Player } from '../../models/game.types';

@Component({
  selector: 'app-game-over',
  templateUrl: 'game-over.component.html',
  styleUrls: ['game-over.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class GameOverComponent implements OnInit, OnDestroy {
  room: GameRoom | null = null;
  roomId = '';
  currentPlayerId = '';
  impostor: Player | null = null;
  winnerRole: string | null = null;
  isHost = false;

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

    this.gameService
      .onRoomUpdate(this.roomId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((room) => {
        if (room) {
          this.room = room;
          this.isHost = room.hostId === this.currentPlayerId;
          this.winnerRole = room.winnerRole || null;

          // Encontrar al impostor
          this.impostor =
            Object.values(room.players).find((p) => p.role === 'impostor') || null;
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Reiniciar el juego en la misma sala y sortear nuevamente un personaje y un impostor
   */
  async restartGame() {
    if (!this.roomId) return;

    try {
      // Usar el servicio para reiniciar completamente la partida
      await this.gameService.resetGame(this.roomId);

      // Esperar a que la sala se actualice, luego iniciar los clues
      setTimeout(async () => {
        try {
          await this.gameService.startCluesPhase(this.roomId);
          // Navegar a la pantalla de pistas
          this.router.navigate(['/clues', this.roomId]);
        } catch (error) {
          console.error('Error iniciando clues:', error);
        }
      }, 500);
    } catch (error) {
      console.error('Error al reiniciar el juego:', error);
    }
  }

  /**
   * Volver a inicio
   */
  goHome() {
    this.router.navigate(['/home']);
  }

  /**
   * Obtener si el jugador actual ganó
   */
  get currentPlayerWon(): boolean {
    if (!this.room || !this.winnerRole) return false;
    const currentPlayer = this.room.players[this.currentPlayerId];
    return currentPlayer?.role === this.winnerRole;
  }

  /**
   * Obtener clase CSS para el resultado
   */
  get resultClass(): string {
    return this.currentPlayerWon ? 'win' : 'lose';
  }

  /**
   * Obtener título del resultado
   */
  get resultTitle(): string {
    if (!this.room || !this.winnerRole) return 'Juego Finalizado';
    return this.currentPlayerWon ? '¡Ganaste!' : '¡Perdiste!';
  }

  /**
   * Obtener cantidad de jugadores activos (no eliminados)
   */
  getActivePlayers(): number {
    if (!this.room) return 0;
    return Object.values(this.room.players).filter((p) => !p.eliminated).length;
  }
}
