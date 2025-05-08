import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { SidebarService } from '../../services/sidebar/sidebar.service';
import { AppComponent } from '../../app.component';
import { AuthService } from '../../services/auth/auth.service';
import { UserService } from '../../services/user/user.service';
import { Navigation } from '@angular/router';
@Component({
  selector: 'app-home',
imports: [],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  isSidebarCollapsed = false;
  userName: string = 'Invitado'; // Valor por defecto

  juegos = [
    {
      nombre: 'Ahorcado',
      descripcion: 'Pon a prueba tu vocabulario adivinando palabras.',
      imagen: '../../assets/ahorcado.png',
      navigator: '/juegos/ahorcado', // Ruta del juego
    },
    {
      nombre: 'Mayor o Menor',
      descripcion: 'Adivina si el próximo número será mayor o menor.',
      imagen: '../../../assets/mayor-menor.png',
      navigator: '/juegos/mayor-menor', // Ruta del juego
    },
    {
      nombre: '¿Quien es ese pokémon?',
      descripcion: 'Demuestra que eres un maestro pokémon.',
      imagen: '../../../assets/pokedexpedia.png',
      navigator: '/juegos/pokedexpedia', // Ruta del juego
    },
    {
      nombre: 'Galati',
      descripcion: 'Un juego único diseñado por mí.',
      imagen: '../../../assets/juego-propio.png',
      navigator: '/juegos/galati', // Ruta del juego
    },
  ];

  constructor(
    private router: Router,
    private appComponent: AppComponent,
    private sidebarService: SidebarService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private userService: UserService
  ) {}

  toggleSidebar() {
    this.appComponent.toggleSidebar();
  }

  async ngOnInit(): Promise<void> {
    this.sidebarService.isCollapsed$.subscribe(
      (state) => (this.isSidebarCollapsed = state)
    );

    this.userService.userName$.subscribe((name) => {
      this.userName = name;
      this.cdr.detectChanges(); 
    });

    try {
      this.userName = await this.authService.getUserName(); // Obtiene el nombre del usuario
    } catch (error) {
      console.error('Error al obtener el nombre del usuario:', error);
      this.userName = 'Invitado'; // Si hay un error, muestra "Invitado"
    }
    this.cdr.detectChanges(); // Fuerza la detección de cambios
  }

  async updateUserName(): Promise<void> {
    this.userName = await this.authService.getUserName();
    this.cdr.detectChanges(); 
  }

  irAJuego(ruta: string): void {
    this.router.navigate([ruta]);
  }
}
