import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class WordService {
  private apiUrl = 'https://random-word-api.herokuapp.com/word';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene una palabra aleatoria
   * @param length Longitud mínima de la palabra.
   * @returns Promesa con la palabra aleatoria.
   */
  async getRandomWord(length: number): Promise<string[]> {
    const params = `?number=1&length=${length}&lang=es`;
    try {
      const response = await this.http.get<string[]>(`${this.apiUrl}${params}`).toPromise();

      // Filtra palabras no deseadas
      const filteredWords = response?.filter((word) => this.isValidWord(word)) || [];
      return filteredWords;
    } catch (error) {
      console.error('Error al obtener la palabra:', error);
      throw error;
    }
  }

  /**
   * Valida si una palabra es aceptable.
   * @param word Palabra a validar.
   * @returns `true` si la palabra es válida, `false` en caso contrario.
   */
  private isValidWord(word: string): boolean {
    // Rechaza palabras con números, espacios o signos de puntuación
    const invalidPattern = /[\d\s.,!?]/;
    return !invalidPattern.test(word);
  }
}
