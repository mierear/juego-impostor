import { Injectable } from '@angular/core';
import { Character } from '../models/game.types';

@Injectable({
  providedIn: 'root',
})
export class CharacterService {
  /**
   * Base de datos de personajes públicos muy conocidos con emojis
   */
  private characters: Character[] = [
    // Películas clásicas
    {
      id: 'char_001',
      name: 'Darth Vader',
      image: '🖤',
    },
    {
      id: 'char_002',
      name: 'Sherlock Holmes',
      image: '🔍',
    },
    {
      id: 'char_003',
      name: 'Wonder Woman',
      image: '🦸‍♀️',
    },
    {
      id: 'char_004',
      name: 'Batman',
      image: '🦇',
    },
    {
      id: 'char_005',
      name: 'Superman',
      image: '🦸',
    },

    // Personajes clásicos
    {
      id: 'char_006',
      name: 'Mickey Mouse',
      image: '🐭',
    },
    {
      id: 'char_007',
      name: 'Homer Simpson',
      image: '🍩',
    },
    {
      id: 'char_008',
      name: 'SpongeBob',
      image: '🧽',
    },
    {
      id: 'char_009',
      name: 'Shrek',
      image: '👹',
    },
    {
      id: 'char_010',
      name: 'Pikachu',
      image: '⚡',
    },

    // Superhéroes Marvel
    {
      id: 'char_011',
      name: 'Iron Man',
      image: '🤖',
    },
    {
      id: 'char_012',
      name: 'Capitán América',
      image: '🛡️',
    },
    {
      id: 'char_013',
      name: 'Thor',
      image: '⚒️',
    },
    {
      id: 'char_014',
      name: 'Viuda Negra',
      image: '🕷️',
    },
    {
      id: 'char_015',
      name: 'Hulk',
      image: '💪',
    },

    // Superhéroes DC
    {
      id: 'char_016',
      name: 'Flash',
      image: '⚡',
    },
    {
      id: 'char_017',
      name: 'Aquaman',
      image: '🌊',
    },
    {
      id: 'char_018',
      name: 'Green Lantern',
      image: '💚',
    },
    {
      id: 'char_019',
      name: 'Cyborg',
      image: '🤖',
    },

    // Personajes de videojuegos
    {
      id: 'char_020',
      name: 'Mario',
      image: '🍄',
    },
    {
      id: 'char_021',
      name: 'Sonic',
      image: '🔵',
    },
    {
      id: 'char_022',
      name: 'Donkey Kong',
      image: '🦍',
    },
    {
      id: 'char_023',
      name: 'Zelda',
      image: '🗡️',
    },
    {
      id: 'char_024',
      name: 'Pac-Man',
      image: '👾',
    },

    // Personajes animados
    {
      id: 'char_025',
      name: 'Bugs Bunny',
      image: '🐰',
    },
    {
      id: 'char_026',
      name: 'Roadrunner',
      image: '🏃',
    },
    {
      id: 'char_027',
      name: 'Tom & Jerry',
      image: '🐹',
    },
    {
      id: 'char_028',
      name: 'Goku',
      image: '👊',
    },
    {
      id: 'char_029',
      name: 'Naruto',
      image: '🌪️',
    },
  ];

  /**
   * Obtener lista de personajes disponibles
   */
  getCharacters(): Character[] {
    return [...this.characters];
  }

  /**
   * Obtener un personaje por ID
   */
  getCharacterById(id: string): Character | undefined {
    return this.characters.find((char) => char.id === id);
  }

  /**
   * Obtener personajes aleatorios (excluyendo los especificados)
   */
  getRandomCharacters(count: number, excludeIds: string[] = []): Character[] {
    const available = this.characters.filter((char) => !excludeIds.includes(char.id));

    const result: Character[] = [];
    for (let i = 0; i < count && available.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * available.length);
      result.push(available[randomIndex]);
      available.splice(randomIndex, 1);
    }

    return result;
  }

  /**
   * Obtener un personaje aleatorio (excluyendo los especificados)
   */
  getRandomCharacter(excludeIds: string[] = []): Character | undefined {
    const available = this.characters.filter((char) => !excludeIds.includes(char.id));
    if (available.length === 0) return undefined;
    return available[Math.floor(Math.random() * available.length)];
  }
}
