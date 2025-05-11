import { Injectable } from '@angular/core';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { AuthService } from '../../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class PartidasPokedexpediaService {
  private supabase: SupabaseClient;

  constructor(private authService: AuthService) {
    this.supabase = this.authService['supabase'];
  }

  async guardarPartida(
    puntos: number,
    pokemonsAdivinados: number,
    resultado: 'Clasico' | 'Muerte Subita'
  ): Promise<void> {
    try {
      const usuarioId = await this.authService.obtenerIdUsuario();

      const partida = {
        usuario_id: usuarioId,
        puntos,
        resultado,
        pokemons_adivinados: pokemonsAdivinados,
      };

      const { data, error } = await this.supabase
        .from('partidas_pokedexpedia')
        .insert([partida]);

      if (error) {
        console.error('Error al guardar la partida:', error.message);
        throw error;
      }

      console.log('Partida guardada:', data);
    } catch (error) {
      console.error('Error inesperado al guardar la partida:', error);
      throw error;
    }
  }
}
