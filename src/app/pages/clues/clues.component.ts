import { Component, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, interval } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { GameService } from '../../services/game.service';
import { GameRoom, Player } from '../../models/game.types';

@Component({
  selector: 'app-clues',
  templateUrl: 'clues.component.html',
  styleUrls: ['clues.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CluesComponent implements OnInit, OnDestroy {
  room: GameRoom | null = null;
  roomId = '';
  currentPlayerId = '';
  currentPlayer: Player | null = null;
  isCurrentPlayerTurn = false;
  currentTurnPlayer: Player | null = null;
  clueInput = '';
  isLoading = false;
  error = '';
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

          // Determinar si es turno del jugador actual
          if (room.playerTurnOrder && room.currentTurn !== undefined) {
            const currentTurnPlayerId = room.playerTurnOrder[room.currentTurn];
            this.isCurrentPlayerTurn = currentTurnPlayerId === this.currentPlayerId;
            this.currentTurnPlayer = room.players[currentTurnPlayerId] || null;
          }

          // Si todos dieron pista, ir a votación
          if (room.status === 'voting') {
            this.router.navigate(['/voting', this.roomId]);
          }
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Enviar pista
   */
  async submitClue() {
    if (!this.clueInput.trim()) {
      this.error = 'Por favor ingresa una pista';
      return;
    }

    if (!this.isCurrentPlayerTurn) {
      this.error = 'No es tu turno';
      return;
    }

    this.isLoading = true;
    this.error = '';

    try {
      await this.gameService.submitClue(this.roomId, this.currentPlayerId, this.clueInput);
      this.clueInput = '';

      // Pasar al siguiente turno automáticamente
      setTimeout(async () => {
        await this.gameService.nextTurn(this.roomId);
      }, 1000);
    } catch (error) {
      console.error('Error submitting clue:', error);
      if (error instanceof Error) {
        this.error = error.message;
      } else {
        this.error = 'Error al enviar la pista';
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
   * Obtener lista de jugadores con sus pistas
   */
  get playerClues(): Array<{ player: Player; turnNumber: number }> {
    if (!this.room) return [];
    return Object.values(this.room.players)
      .map((p) => ({
        player: p,
        turnNumber: p.turnNumber || 0,
      }))
      .sort((a, b) => a.turnNumber - b.turnNumber);
  }

  /**
   * Obtener el turno actual (1-indexed)
   */
  get currentTurnNumber(): number {
    if (!this.room || this.room.currentTurn === undefined) return 0;
    return this.room.currentTurn + 1;
  }

  /**
   * Obtener el total de turnos
   */
  get totalTurns(): number {
    if (!this.room) return 0;
    return Object.keys(this.room.players).length;
  }
}
