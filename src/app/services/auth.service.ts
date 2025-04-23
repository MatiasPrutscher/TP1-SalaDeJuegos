import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      'https://dqifizzwkvnblbmreaze.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxaWZpenp3a3ZuYmxibXJlYXplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0MjE0NzYsImV4cCI6MjA2MDk5NzQ3Nn0.7kvYG1dbLx-4pgseB-Rrr0q5DhyLYqiJcxSnYyIbgJc' 
    );
  }

  async crearCuenta(email: string, password: string, nombre: string, apellido: string, edad: number) {
    console.log('Intentando crear cuenta con:', { email, nombre, apellido, edad });

    const { data, error } = await this.supabase.auth.signUp({ email, password });

    if (error) {
      console.error('Error al crear cuenta:', error.message);
      throw error;
    }

    console.log('Cuenta creada en Supabase:', data);

    const { error: dbError } = await this.supabase.from('usuarios').insert([
      { email, nombre, apellido, edad },
    ]);

    if (dbError) {
      console.error('Error al guardar datos adicionales:', dbError.message);
      throw dbError;
    }

    console.log('Datos adicionales guardados en la base de datos.');
    return data;
  }

  async iniciarSesion(email: string, password: string) {
    console.log('Intentando iniciar sesión con:', { email });

    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error('Error al iniciar sesión:', error.message);
      throw error;
    }

    console.log('Inicio de sesión exitoso:', data);
    return data;
  }

  async logout(): Promise<void> {
    console.log('Cerrando sesión...');
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      console.error('Error al cerrar sesión:', error.message);
      throw error;
    }
    console.log('Sesión cerrada exitosamente.');
  }

  async getSession() {
    const { data, error } = await this.supabase.auth.getSession();
    if (error) {
      console.error('Error al obtener la sesión:', error.message);
      return null;
    }
    return data.session; 
  }

  async getUserData(email: string) {
    console.log('Obteniendo datos del usuario con email:', email);

    const { data, error } = await this.supabase
      .from('usuarios')
      .select('nombre')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Error al obtener los datos del usuario:', error.message);
      throw error;
    }

    console.log('Datos del usuario obtenidos:', data);
    return data;
  }

  async getUserName(): Promise<string> {
    const session = await this.getSession();
    if (!session || !session.user) {
      console.warn('No hay sesión activa.');
      return 'Invitado'; // Devuelve "Invitado" si no hay sesión
    }

    const email = session.user.email;
    const { data, error } = await this.supabase
      .from('usuarios')
      .select('nombre')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Error al obtener el nombre del usuario:', error.message);
      return 'Invitado'; // Devuelve "Invitado" si hay un error
    }

    return data.nombre || 'Invitado'; // Devuelve el nombre o "Invitado" si no está definido
  }
}