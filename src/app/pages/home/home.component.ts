import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomeComponent {
  showCreateForm = false;
  showJoinForm = false;
  hostName = '';
  playerName = '';
  joinCode = '';
  selectedAvatar = '🌟';
  isLoading = false;
  error = '';

  // Lista de avatares disponibles (emojis)
  avatars = ['🦊', '🐴', '🦁', '🐸', '🦉', '🐙', '🐬', '🐍', '🐳', '🦋'];

  constructor(private gameService: GameService, private router: Router) {}

  /**
   * Seleccionar avatar
   */
  selectAvatar(avatar: string) {
    this.selectedAvatar = avatar;
  }

  /**
   * Mostrar formulario para crear sala
   */
  showCreateSala() {
    this.showCreateForm = true;
    this.showJoinForm = false;
    this.error = '';
    this.selectedAvatar = this.avatars[0];
  }

  /**
   * Mostrar formulario para unirse a sala
   */
  showJoinSala() {
    this.showJoinForm = true;
    this.showCreateForm = false;
    this.error = '';
    this.selectedAvatar = this.avatars[0];
  }

  /**
   * Cancelar formularios
   */
  cancel() {
    this.showCreateForm = false;
    this.showJoinForm = false;
    this.hostName = '';
    this.playerName = '';
    this.joinCode = '';
    this.error = '';
  }

  /**
   * Crear una nueva sala
   */
  async createSala() {
    if (!this.hostName.trim()) {
      this.error = 'Por favor ingresa tu nombre';
      return;
    }

    this.isLoading = true;
    this.error = '';

    try {
      const hostId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const room = await this.gameService.createGameRoom(hostId, this.hostName);

      // Guardar el ID actual del jugador en sesión (usar sessionStorage o un BehaviorSubject)
      sessionStorage.setItem('currentPlayerId', hostId);
      sessionStorage.setItem('currentRoomId', room.id);

      this.router.navigate(['/lobby', room.id]);
    } catch (error) {
      console.error('Error creating room:', error);
      this.error = 'Error al crear la sala. Por favor intenta de nuevo.';
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Unirse a una sala existente
   */
  async joinSala() {
    if (!this.playerName.trim()) {
      this.error = 'Por favor ingresa tu nombre';
      return;
    }

    if (!this.joinCode.trim()) {
      this.error = 'Por favor ingresa el código de la sala';
      return;
    }

    this.isLoading = true;
    this.error = '';

    try {
      const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const room = await this.gameService.joinGameRoom(
        this.joinCode.toUpperCase(),
        playerId,
        this.playerName
      );

      sessionStorage.setItem('currentPlayerId', playerId);
      sessionStorage.setItem('currentRoomId', room.id);

      this.router.navigate(['/lobby', room.id]);
    } catch (error) {
      console.error('Error joining room:', error);
      if (error instanceof Error) {
        this.error = error.message;
      } else {
        this.error = 'Error al unirse a la sala. Por favor verifica el código.';
      }
    } finally {
      this.isLoading = false;
    }
  }
}
