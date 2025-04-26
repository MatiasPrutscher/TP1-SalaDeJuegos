import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  // Usuarios para el inicio rápido
  quickUsers = [
    { email: 'test1@example.com', password: 'contraseña123' },
    { email: 'test2.@example.com', password: 'contraseña123' },
    { email: 'test3@example.com', password: 'contraseña123' },
  ];

  constructor(private authService: AuthService, private router: Router) {}

  async login() {
    try {
      console.log('Datos ingresados para login:', { email: this.email, password: this.password });

      if (!this.email) {
        this.errorMessage = 'Mail incorrecto';
        console.warn('El campo de correo electrónico está vacío o es inválido.');
        return;
      }

      if (!this.password) {
        this.errorMessage = 'Contraseña incorrecta';
        console.warn('El campo de contraseña está vacío o es inválido.');
        return;
      }

      await this.authService.iniciarSesion(this.email, this.password);
      console.log('Inicio de sesión exitoso. Redirigiendo al Home...');
      this.router.navigate(['']);
    } catch (error: any) {
      console.error('Error durante el inicio de sesión:', error.message);
      this.errorMessage = error.message || 'Error al iniciar sesión.';
    }
  }

  async quickLogin(user: { email: string; password: string }) {
    console.log('Inicio rápido con usuario:', user.email);
    this.email = user.email;
    this.password = user.password;
    await this.login();
  }
}
