import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  getDatabase,
  Database,
  ref,
  set,
  get,
  update,
  remove,
  onValue,
  Unsubscribe,
  DatabaseReference,
} from 'firebase/database';
import { GameRoom, GameState, Player } from '../models/game.types';
import { environment } from '../../environments/environment';

/**
 * Configuración de Firebase obtenida del environment
 */
const FIREBASE_CONFIG = environment.firebase;

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private database: Database;
  private listeners: Map<string, Unsubscribe> = new Map();

  constructor() {
    const app = initializeApp(FIREBASE_CONFIG);
    this.database = getDatabase(app);
  }

  /**
   * Guardar o actualizar una sala de juego
   */
  async saveGameRoom(room: GameRoom): Promise<void> {
    try {
      const roomRef = ref(this.database, `rooms/${room.id}`);
      await set(roomRef, room);
    } catch (error) {
      console.error('Error saving game room:', error);
      throw error;
    }
  }

  /**
   * Obtener una sala de juego por ID
   */
  async getGameRoom(roomId: string): Promise<GameRoom | null> {
    try {
      const roomRef = ref(this.database, `rooms/${roomId}`);
      const snapshot = await get(roomRef);
      return snapshot.exists() ? (snapshot.val() as GameRoom) : null;
    } catch (error) {
      console.error('Error getting game room:', error);
      throw error;
    }
  }

  /**
   * Obtener una sala por código
   */
  async getGameRoomByCode(code: string): Promise<GameRoom | null> {
    try {
      const roomsRef = ref(this.database, 'rooms');
      const snapshot = await get(roomsRef);
      if (!snapshot.exists()) return null;

      const rooms = snapshot.val() as Record<string, GameRoom>;
      const room = Object.values(rooms).find((r) => r.code === code);
      return room || null;
    } catch (error) {
      console.error('Error getting game room by code:', error);
      throw error;
    }
  }

  /**
   * Escuchar cambios en una sala en tiempo real
   */
  onRoomChange(
    roomId: string,
    callback: (room: GameRoom | null) => void
  ): Unsubscribe {
    const roomRef = ref(this.database, `rooms/${roomId}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      callback(snapshot.exists() ? (snapshot.val() as GameRoom) : null);
    });

    this.listeners.set(`room_${roomId}`, unsubscribe);
    return unsubscribe;
  }

  /**
   * Actualizar un jugador en una sala
   */
  async updatePlayer(
    roomId: string,
    playerId: string,
    player: Partial<Player>
  ): Promise<void> {
    try {
      const playerRef = ref(this.database, `rooms/${roomId}/players/${playerId}`);
      await update(playerRef, player);
    } catch (error) {
      console.error('Error updating player:', error);
      throw error;
    }
  }

  /**
   * Actualizar el estado del juego
   */
  async updateGameState(roomId: string, state: Partial<GameState>): Promise<void> {
    try {
      const stateRef = ref(this.database, `gameState/${roomId}`);
      await update(stateRef, state);
    } catch (error) {
      console.error('Error updating game state:', error);
      throw error;
    }
  }

  /**
   * Eliminar una sala
   */
  async deleteRoom(roomId: string): Promise<void> {
    try {
      const roomRef = ref(this.database, `rooms/${roomId}`);
      await remove(roomRef);

      // Desuscribir listeners
      const listenerId = `room_${roomId}`;
      if (this.listeners.has(listenerId)) {
        this.listeners.get(listenerId)?.();
        this.listeners.delete(listenerId);
      }
    } catch (error) {
      console.error('Error deleting room:', error);
      throw error;
    }
  }

  /**
   * Limpiar todos los listeners
   */
  cleanup(): void {
    this.listeners.forEach((unsubscribe) => unsubscribe());
    this.listeners.clear();
  }

  /**
   * Obtener una referencia a la base de datos
   */
  getDatabase(): Database {
    return this.database;
  }
}
