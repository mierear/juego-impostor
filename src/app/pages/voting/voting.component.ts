import { Component, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, interval } from 'rxjs';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { GameService } from '../../services/game.service';
import { GameRoom, Player, VotingResult } from '../../models/game.types';

@Component({
  selector: 'app-voting',
  templateUrl: 'voting.component.html',
  styleUrls: ['voting.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class VotingComponent implements OnInit, OnDestroy {
  room: GameRoom | null = null;
  roomId = '';
  currentPlayerId = '';
  currentPlayer: Player | null = null;
  selectedVoteId: string | null = null;
  hasVoted = false;
  isLoading = false;
  error = '';
  votingResult: VotingResult | null = null;
  showResults = false;
  votingTimeRemaining = 30;
  private destroy$ = new Subject<void>();
  votingExpired = false;

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
          this.hasVoted = this.currentPlayer?.hasVoted || false;

          // Verificar si la votación ha terminado (desde Firebase)
          if (room.votingFinished && !this.showResults) {
            this.showVotingResults();
          }
        }
      });

    // Timer para votación (actualizar cada 100ms para más precisión)
    interval(100)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.room && this.room.status === 'voting') {
          const timeRemaining = this.gameService.getVotingTimeRemaining(this.room);
          this.votingTimeRemaining = Math.ceil(timeRemaining / 1000);

          // Si el tiempo se acabó y no ha mostrado resultados
          if (this.votingTimeRemaining <= 0 && !this.showResults) {
            this.votingExpired = true;
            this.finishVotingAutomatically();
          }
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Seleccionar a quién votar
   */
  selectVote(playerId: string) {
    if (!this.hasVoted && !this.votingExpired) {
      this.selectedVoteId = playerId;
    }
  }

  /**
   * Confirmar y enviar voto
   */
  async submitVote() {
    if (!this.selectedVoteId || this.hasVoted) {
      return;
    }

    this.isLoading = true;
    this.error = '';

    try {
      await this.gameService.registerVote(this.roomId, this.currentPlayerId, this.selectedVoteId);
      await this.gameService.updateVoteCount(this.roomId);
      this.hasVoted = true;

      // Esperar un poco y luego verificar si todos han votado
      setTimeout(() => {
        this.checkIfAllVoted();
      }, 500);
    } catch (error) {
      console.error('Error submitting vote:', error);
      if (error instanceof Error) {
        this.error = error.message;
      } else {
        this.error = 'Error al registrar el voto';
      }
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Verificar si todos han votado
   */
  private async checkIfAllVoted() {
    if (!this.room) return;

    const allPlayers = Object.values(this.room.players);
    const allVoted = allPlayers.every((p) => p.hasVoted);

    if (allVoted && !this.showResults) {
      // Solo llamar a finishVoting si no hemos mostrado resultados aún
      try {
        await this.gameService.finishVoting(this.roomId);
        // No hacer nada más aquí - esperar a que Firebase dispare la actualización con votingFinished
      } catch (error) {
        console.error('Error finishing voting:', error);
      }
    }
  }

  /**
   * Mostrar resultados de votación (se activa cuando votingFinished = true desde Firebase)
   */
  private async showVotingResults() {
    try {
      // Obtener los resultados finales
      const room = this.room;
      if (!room) return;

      // Construir el VotingResult basado en los datos de la sala
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

      if (votedOutPlayerId && room.players[votedOutPlayerId]) {
        const votedOutPlayer = room.players[votedOutPlayerId];
        const wasImpostor = votedOutPlayer.role === 'impostor';

        this.votingResult = {
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

        this.showResults = true;

        // Esperar a que el jugador vea los resultados
        setTimeout(async () => {
          // Si el juego terminó, ir a game-over
          if (room.status === 'finished') {
            setTimeout(() => {
              this.router.navigate(['/game-over', this.roomId]);
            }, 2000);
          }
          // Si continúa, volver a clues
          else if (room.gamePhase === 'clues') {
            setTimeout(() => {
              this.router.navigate(['/clues', this.roomId]);
            }, 2000);
          }
        }, 3000);
      }
    } catch (error) {
      console.error('Error showing voting results:', error);
    }
  }

  /**
   * Terminar votación automáticamente cuando se acabe el tiempo
   */
  private async finishVotingAutomatically() {
    if (this.showResults) return;

    try {
      await this.gameService.finishVoting(this.roomId);
      // No hacer nada más aquí - esperar a que Firebase dispare la actualización con votingFinished
    } catch (error) {
      console.error('Error finishing voting automatically:', error);
    }
  }

  /**
   * Jugar otra ronda
   */
  async playAgain() {
    try {
      await this.gameService.resetGame(this.roomId);
      this.router.navigate(['/lobby', this.roomId]);
    } catch (error) {
      console.error('Error restarting game:', error);
      this.error = 'Error al reiniciar el juego';
    }
  }

  /**
   * Volver a inicio
   */
  goHome() {
    this.router.navigate(['/home']);
  }

  /**
   * Obtener list de jugadores para votar (excluye el jugador actual)
   */
  get otherPlayers(): Player[] {
    if (!this.room) return [];
    return Object.values(this.room.players).filter(
      (p) => p.id !== this.currentPlayerId
    );
  }

  /**
   * Obtener el nombre del jugador votado
   */
  getPlayerName(playerId: string): string {
    if (!this.room) return '';
    return this.room.players[playerId]?.name || 'Desconocido';
  }

  /**
   * Obtener porcentaje de votación
   */
  getVotingProgress(): number {
    if (!this.room) return 0;
    const totalPlayers = Object.keys(this.room.players).length;
    const votedPlayers = Object.values(this.room.players).filter((p) => p.hasVoted).length;
    return Math.round((votedPlayers / totalPlayers) * 100);
  }

  /**
   * Obtener cantidad total de jugadores
   */
  getTotalPlayers(): number {
    if (!this.room) return 0;
    return Object.keys(this.room.players).length;
  }

  /**
   * Obtener conteo de votos para un jugador
   */
  getVoteCount(playerId: string): number {
    if (!this.room || !this.room.voteCounts) return 0;
    return this.room.voteCounts[playerId] || 0;
  }

  /**
   * Formatear el tiempo restante
   */
  getFormattedTime(): string {
    const seconds = this.votingTimeRemaining % 60;
    const ms = Math.round((this.votingTimeRemaining - Math.floor(this.votingTimeRemaining)) * 100);
    return `${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}s`;
  }

  /**
   * Obtener cantidad de jugadores que ya votaron
   */
  getVotedPlayersCount(): number {
    if (!this.room) return 0;
    return Object.values(this.room.players).filter((p) => p.hasVoted).length;
  }
}

