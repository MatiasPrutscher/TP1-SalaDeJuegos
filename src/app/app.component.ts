import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { YoutubeService } from './services/youtube/youtube.service';
import { SidebarService } from './services/sidebar/sidebar.service';
import { AuthService } from './services/auth/auth.service';
import { RouterModule, Router } from '@angular/router';
import { UserService } from './services/user/user.service';
import { FormsModule } from '@angular/forms';
import { ChatComponent } from './pages/chat/chat.component';

@Component({
  selector: 'app-root',
  imports: [RouterModule, FormsModule, ChatComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  plegado: boolean = true; 
  isCollapsed = false;
  public currentVolume: number = 50; // Volumen inicial (50%)
  public songTitle: string = 'Cargando canción...'; 
  isLoggedIn: boolean = false;

  constructor(
    private youtubeService: YoutubeService,
    private sidebarService: SidebarService,
    private authService: AuthService,
    private router: Router,
    private userService: UserService,
    private cdr: ChangeDetectorRef 
  ) {
    this.sidebarService.isCollapsed$.subscribe(
      (state) => (this.isCollapsed = state)
    );
  }

  async ngOnInit(): Promise<void> {
    console.log('Estado inicial de isLoggedIn:', this.isLoggedIn);
    await this.youtubeService.initializePlayer();
    await this.youtubeService.setVolume(this.currentVolume);

    const videoId = '4xDzrJKXOOY'; // ID del video
    this.youtubeService.getVideoTitle(videoId).subscribe(
      (response: any) => {
        console.log('Respuesta de la API:', response);
        if (response.items && response.items.length > 0) {
          this.songTitle = response.items[0].snippet.title;
        } else {
          this.songTitle = 'No se encontró el título';
        }
      },
      (error) => {
        console.error('Error al obtener el título del video:', error);
        this.songTitle = 'Error al cargar canción';
      }
    );

    // Se subscribe al estado de inicio de sesión
    this.authService.isLoggedIn$.subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
    });

    // Verifica la sesión al cargar la aplicación
    this.authService.getSession();

    const session = await this.authService.getSession();
    this.isLoggedIn = !!session;
    this.cdr.detectChanges(); // Fuerza la detección de cambios
    console.log('Estado final de isLoggedIn en el onInit:', this.isLoggedIn);
  }

  async playMusic(): Promise<void> {
    await this.youtubeService.play();
  }

  async pauseMusic(): Promise<void> {
    await this.youtubeService.pause();
  }

  async increaseVolume(): Promise<void> {
    if (this.currentVolume < 100) {
      this.currentVolume += 5;
      await this.youtubeService.setVolume(this.currentVolume);
    }
  }

  async decreaseVolume(): Promise<void> {
    if (this.currentVolume > 0) {
      this.currentVolume -= 5;
      await this.youtubeService.setVolume(this.currentVolume);
    }
  }

  toggleSidebar() {
    this.sidebarService.toggleSidebar();
  }

  async logout(): Promise<void> {
    try {
      await this.authService.logout(); // Cierra la sesión
      console.log('Sesión cerrada exitosamente.');
      this.isLoggedIn = false; // Actualiza el estado de inicio de sesión
      this.cdr.detectChanges(); // Fuerza la detección de cambios
      this.userService.updateUserName('Invitado'); // Actualiza el nombre del usuario
      this.router.navigate(['/']); // Redirige al Home
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
    console.log('Estado de isLoggedIn en logout:', this.isLoggedIn);
  }
}
