import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-registro',
  imports: [FormsModule],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css'],
})
export class RegistroComponent {
  email: string = '';
  password: string = '';
  nombre: string = '';
  apellido: string = '';
  edad: number | null = null;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  async register() {
    try {
      console.log('Datos ingresados para registro:', {
        email: this.email,
        password: this.password,
        nombre: this.nombre,
        apellido: this.apellido,
        edad: this.edad,
      });

      if (!this.email || !this.password || !this.nombre || !this.apellido || !this.edad) {
        this.errorMessage = 'Por favor, completa todos los campos.';
        console.warn('Campos incompletos en el formulario de registro.');
        return;
      }

      await this.authService.crearCuenta(this.email, this.password, this.nombre, this.apellido, this.edad);
      this.successMessage = 'Registro exitoso. Redirigiendo al Home...';
      console.log('Registro exitoso. Iniciando sesión automáticamente...');

      await this.authService.iniciarSesion(this.email, this.password);
      this.router.navigate(['/']);
    } catch (error: any) {
      console.error('Error durante el registro:', error.message);
      this.errorMessage = error.message || 'Ocurrió un error durante el registro.';
    }
  }
}
