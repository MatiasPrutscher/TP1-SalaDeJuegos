import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { AuthService } from '../auth/auth.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MensajesService {
  private supabase: SupabaseClient;
  private mensajesSubject = new BehaviorSubject<any[]>([]);
  mensajes$ = this.mensajesSubject.asObservable();

  constructor(private authService: AuthService) {
    this.supabase = (this.authService as any).supabase;
    this.obtenerMensajes();
    this.suscribirseMensajes();
  }

  async enviarMensaje(mensaje: string): Promise<void> {
    const usuarioId = await this.authService.obtenerIdUsuario();
    const { error } = await this.supabase
      .from('mensajes_chat')
      .insert([{ usuario_id: usuarioId, mensaje }]);

    if (error) {
      console.error('Error al enviar el mensaje:', error);
      throw error;
    }
  }

  async obtenerMensajes(): Promise<void> {
    const { data, error } = await this.supabase
      .from('mensajes_chat')
      .select('*, usuarios(nombre)')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error al obtener los mensajes:', error);
      throw error;
    }

    this.mensajesSubject.next(data || []);
  }

  private suscribirseMensajes(): void {
    this.supabase
      .channel('mensajes-chat-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensajes_chat',
        },
        async (payload) => {
          if (payload.new) {
            const { data: mensajeCompleto, error } = await this.supabase
              .from('mensajes_chat')
              .select(`
                id,
                mensaje,
                created_at,
                usuario_id,
                usuarios (
                  nombre
                )
              `)
              .eq('id', payload.new['id'])
              .single();

            if (error) {
              console.error('Error al obtener los datos relacionados del mensaje:', error);
              return;
            }
            this.mensajesSubject.next([...this.mensajesSubject.value, mensajeCompleto]);
          }
        }
      )
      .subscribe((status) => {
        console.log('Estado de la suscripción:', status);
      });
  }
}