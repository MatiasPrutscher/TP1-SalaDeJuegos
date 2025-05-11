import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';

interface Resultado {
  id: number;
  usuario_id: number;
  puntos?: number;
  nivel?: number;
  cartas_acertadas?: number;
  pokemons_adivinados?: number;
  enemigos_destruidos?: number;
  nivel_alcanzado?: number;
  jugador?: string;
}

type Tablas =
  | 'partidas_ahorcado'
  | 'partidas_mayor_menor'
  | 'partidas_galati'
  | 'partidas_pokedexpedia';

@Injectable({ providedIn: 'root' })
export class ResultadosService {
  constructor(private authService: AuthService) {}

  // Función para obtener los 10 mejores resultados de partidas_ahorcado
  private async obtenerResultadosAhorcado(): Promise<Resultado[]> {
    const columnas = 'id, usuario_id, puntos, nivel';
    const { data, error } = await this.authService.supabase
      .from('partidas_ahorcado')
      .select(columnas)
      .order('puntos', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error al obtener partidas_ahorcado:', error.message);
      throw error;
    }

    if (!data) {
      return [];
    }

    return this.mapearResultados(data);
  }

  // Función para obtener los 10 mejores resultados de partidas_mayor_menor
  private async obtenerResultadosMayorMenor(): Promise<Resultado[]> {
    const columnas = 'id, usuario_id, cartas_acertadas';
    const { data, error } = await this.authService.supabase
      .from('partidas_mayor_menor')
      .select(columnas)
      .order('cartas_acertadas', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error al obtener partidas_mayor_menor:', error.message);
      throw error;
    }

    if (!data) {
      return [];
    }

    return this.mapearResultados(data);
  }

  // Función para obtener los 10 mejores resultados de partidas_galati
  private async obtenerResultadosGalati(): Promise<Resultado[]> {
    const columnas = 'id, usuario_id, puntos, nivel_alcanzado, enemigos_destruidos';
    const { data, error } = await this.authService.supabase
      .from('partidas_galati')
      .select(columnas)
      .order('puntos', { ascending: false })
      .limit(10); 

    if (error) {
      console.error('Error al obtener partidas_galati:', error.message);
      throw error;
    }

    if (!data) {
      return [];
    }

    return this.mapearResultados(data);
  }

  // Función para obtener los 10 mejores resultados de partidas_pokedexpedia
  private async obtenerResultadosPokedexpedia(): Promise<Resultado[]> {
    const columnas = 'id, usuario_id, puntos, pokemons_adivinados';
    const { data, error } = await this.authService.supabase
      .from('partidas_pokedexpedia')
      .select(columnas)
      .order('puntos', { ascending: false })
      .limit(10); 

    if (error) {
      console.error('Error al obtener partidas_pokedexpedia:', error.message);
      throw error;
    }

    if (!data) {
      return [];
    }

    return this.mapearResultados(data);
  }

  // Función para mapear los resultados y reemplazar usuario_id con el nombre del jugador
  private async mapearResultados(data: Resultado[]): Promise<Resultado[]> {
    return Promise.all(
      data.map(async (row) => {
        let nombre: string;
        try {
          nombre = await this.authService.obtenerNombreUsuario(row.usuario_id);
        } catch {
          nombre = 'Desconocido';
        }
        return { ...row, jugador: nombre };
      })
    );
  }

  // Función general para obtener todos los resultados
  async obtenerTodos(): Promise<Record<Tablas, Resultado[]>> {
    const resultados: Partial<Record<Tablas, Resultado[]>> = {};

    try {
      resultados.partidas_ahorcado = await this.obtenerResultadosAhorcado();
    } catch {
      resultados.partidas_ahorcado = [];
    }

    try {
      resultados.partidas_mayor_menor = await this.obtenerResultadosMayorMenor();
    } catch {
      resultados.partidas_mayor_menor = [];
    }

    try {
      resultados.partidas_galati = await this.obtenerResultadosGalati();
    } catch {
      resultados.partidas_galati = [];
    }

    try {
      resultados.partidas_pokedexpedia = await this.obtenerResultadosPokedexpedia();
    } catch {
      resultados.partidas_pokedexpedia = [];
    }

    return resultados as Record<Tablas, Resultado[]>;
  }
}
