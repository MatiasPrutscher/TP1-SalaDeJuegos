import { Injectable } from '@angular/core';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { AuthService } from '../../auth/auth.service'; 

@Injectable({
  providedIn: 'root',
})
export class PartidasMayorMenorService {
  private supabase: SupabaseClient;

  constructor(private authService: AuthService) {
    this.supabase = this.authService['supabase'];
  }

  async guardarPartida(cartasAcertadas: number): Promise<void> {
    try {
      const usuarioId = await this.authService.obtenerIdUsuario(); 
      const { data, error } = await this.supabase
        .from('partidas_mayor_menor')
        .insert([
          {
            usuario_id: usuarioId,
            cartas_acertadas: cartasAcertadas,
          },
        ]);

      if (error) {
        console.error('Error al guardar la partida:', error);
        throw error;
      }

      console.log('Partida guardada:', data);
    } catch (error) {
      console.error('Error inesperado al guardar la partida:', error);
      throw error;
    }
  }
}
