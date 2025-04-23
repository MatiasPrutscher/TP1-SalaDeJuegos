import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SidebarService } from '../../services/sidebar.service';
import { AppComponent } from '../../app.component';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-home',
imports: [],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  isSidebarCollapsed = false;
  userName: string = 'Invitado'; // Valor por defecto

  constructor(
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
    this.cdr.detectChanges(); // Fuerza la detección de cambios
  }

  juegos = [
    {
      nombre: 'Ahorcado',
      descripcion: 'Pon a prueba tu vocabulario adivinando palabras.',
      imagen: '../../assets/ahorcado.png',
    },
    {
      nombre: 'Mayor o Menor',
      descripcion: 'Adivina si el próximo número será mayor o menor.',
      imagen: '../../../assets/mayor-menor.png',
    },
    {
      nombre: 'Preguntados',
      descripcion: 'Responde preguntas y demuestra tus conocimientos.',
      imagen: '../../../assets/preguntados.webp',
    },
    {
      nombre: 'Juego Propio',
      descripcion: 'Un juego único diseñado por mí.',
      imagen: '../../../assets/juego-propio.png',
    },
  ];
}
