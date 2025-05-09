import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { Observable, from, of } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';

interface BasicInfo {
  name: string;
  sprite: string;
}

@Injectable({ providedIn: 'root' })
export class PokeApiService {
  private supabase: SupabaseClient;
  private cache = new Map<number, Observable<BasicInfo | null>>();

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  getPokemonBasicInfo(id: number): Observable<BasicInfo | null> {
    if (this.cache.has(id)) {
      return this.cache.get(id)!;
    }

    const request$ = from(
      this.supabase
        .from('pokedex')
        .select('nombre, imagen_url')
        .eq('id_pokedex', id)
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error || !data) {
          console.error(`Error al leer id=${id} de pokedex:`, error);
          return null;
        }
        const row = data as any;
        return {
          name: row.nombre as string,
          sprite: row.imagen_url as string
        };
      }),
      catchError(err => {
        console.error(`Error en Supabase para id=${id}:`, err);
        return of(null);
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.cache.set(id, request$);
    return request$;
  }

  getPokemon(id: number): Observable<any> {
    return this.getPokemonBasicInfo(id);
  }
}
