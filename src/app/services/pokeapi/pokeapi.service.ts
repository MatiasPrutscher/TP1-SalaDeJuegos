import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PokeApiService {
  private apiUrl = 'https://pokeapi.co/api/v2';
  private cache: Map<number, any> = new Map(); // Caché en memoria

  constructor(private http: HttpClient) {}

  // Obtener datos completos del Pokémon
  getPokemon(id: number): Observable<any> {
    if (this.cache.has(id)) {
      return of(this.cache.get(id)); // Retornar desde el caché si ya existe
    }

    return this.http.get(`${this.apiUrl}/pokemon/${id}`).pipe(
      map((data) => {
        this.cache.set(id, data); // Guardar en el caché
        return data;
      }),
      catchError((error) => {
        console.error(`Error al obtener el Pokémon con ID ${id}:`, error);
        return of(null); // Manejo de errores
      })
    );
  }

  // Obtener solo el nombre y el sprite del Pokémon
  getPokemonBasicInfo(id: number): Observable<any> {
    if (this.cache.has(id)) {
      const cachedData = this.cache.get(id);
      return of({
        name: cachedData.name,
        sprite: cachedData.sprites.other['official-artwork'].front_default || cachedData.sprites.front_default,
      });
    }

    return this.getPokemon(id).pipe(
      map((data) => ({
        name: data.name,
        sprite: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
      }))
    );
  }
}
