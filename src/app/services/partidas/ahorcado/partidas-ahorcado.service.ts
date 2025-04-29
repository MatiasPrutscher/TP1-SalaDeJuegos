import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { AuthService } from '../../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class PartidasAhorcadoService {
  private supabase: SupabaseClient;

  constructor(private authService: AuthService) {
    this.supabase = this.authService['supabase'];
  }

  async guardarPartida(puntos: number, nivel: number, resultado: 'Victoria' | 'Derrota'): Promise<void> {

    const usuarioId = await this.authService.obtenerIdUsuario();

    const partida = {
      usuario_id: usuarioId, 
      puntos,
      nivel,
      resultado,
    };

    const { data, error } = await this.supabase
      .from('partidas_ahorcado')
      .insert([partida]);

    if (error) {
      console.error('Error al guardar la partida:', error.message);
      throw error;
    }

    console.log('Partida guardada:', data);
  }
}
