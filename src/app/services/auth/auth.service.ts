import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private supabase: SupabaseClient;
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  private manejarError(accion: string, error: any): void {
    const mensaje = error?.message || 'Error desconocido';
    console.error(`Error al ${accion}:`, mensaje);
    throw new Error(mensaje);
  }

  private log(accion: string, datos: any): void {
    console.log(`Intentando ${accion} con:`, datos);
  }

  private async consultarUsuario(email: string, campos: string[]): Promise<any> {
    const { data, error } = await this.supabase
      .from('usuarios')
      .select(campos.join(','))
      .eq('email', email)
      .single();

    if (error) {
      this.manejarError('consultar usuario', error);
    }

    return data;
  }

  async crearCuenta(email: string, password: string, nombre: string, apellido: string, edad: number) {
    this.log('crear cuenta', { email, nombre, apellido, edad });

    const { data, error } = await this.supabase.auth.signUp({ email, password });
    if (error) this.manejarError('crear cuenta', error);

    const { error: dbError } = await this.supabase.from('usuarios').insert([
      { email, nombre, apellido, edad },
    ]);
    if (dbError) this.manejarError('guardar datos adicionales', dbError);

    console.log('Cuenta creada y datos adicionales guardados.');
    return data;
  }

  async iniciarSesion(email: string, password: string) {
    this.log('iniciar sesión', { email });

    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) this.manejarError('iniciar sesión', error);

    this.isLoggedInSubject.next(true);
    console.log('Inicio de sesión exitoso.');
    return data;
  }

  async logout(): Promise<void> {
    console.log('Cerrando sesión...');
    const { error } = await this.supabase.auth.signOut();
    if (error) this.manejarError('cerrar sesión', error);

    this.isLoggedInSubject.next(false);
    console.log('Sesión cerrada exitosamente.');
  }

  async getSession() {
    const { data, error } = await this.supabase.auth.getSession();
    if (error) {
      this.manejarError('obtener la sesión', error);
      this.isLoggedInSubject.next(false);
      return null;
    }

    const isLoggedIn = !!data.session;
    this.isLoggedInSubject.next(isLoggedIn);
    return data.session;
  }

  async getUserData(email: string) {
    this.log('obtener datos del usuario', { email });
    return await this.consultarUsuario(email, ['nombre']);
  }

  async getUserName(): Promise<string> {
    const session = await this.getSession();
    if (!session?.user?.email) {
      console.log('No hay sesión activa o el usuario no tiene email.');
      return 'Invitado';
    }

    const data = await this.consultarUsuario(session.user.email, ['nombre']);
    return data?.nombre || 'Invitado';
  }

  async verificarUsuario(email: string): Promise<boolean> {
    this.log('Verificando si el usuario ya está registrado con email:', {email});
    const { data, error } = await this.supabase
      .from('usuarios') 
      .select('email') 
      .eq('email', email) 
      .single(); 

    if (error) {
      if (error.code === 'PGRST116') {
        // Código de error cuando no se encuentra el registro
        console.log('El usuario no está registrado.');
        return false;
      }
      console.error('Error al verificar el usuario:', error.message);
      throw error;
    }
    console.log('El mail ya está registrado.');
    return !!data; // Devuelve true si se encontró un registro
  }
}