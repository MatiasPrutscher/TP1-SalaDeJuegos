import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { AuthService } from '../../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class PartidasGalatiService {
  private supabase: SupabaseClient;

  constructor(private authService: AuthService) {
    this.supabase = this.authService['supabase'];
  }

  async guardarPartida(
    puntos: number,
    nivelAlcanzado: number,
    enemigosDestruidos: number,
    disparosRealizados?: number,
    precision?: number
  ): Promise<void> {
    try {
      const usuarioId = await this.authService.obtenerIdUsuario();

      const partida = {
        usuario_id: usuarioId,
        puntos,
        nivel_alcanzado: nivelAlcanzado,
        enemigos_destruidos: enemigosDestruidos,
        disparos_realizados: disparosRealizados,
        precision,
      };

      const { data, error } = await this.supabase
        .from('partidas_galati')
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
