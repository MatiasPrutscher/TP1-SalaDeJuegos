import { Component, OnInit } from '@angular/core';
import { YoutubeService } from './services/youtube.service';
import { SidebarService } from './services/sidebar.service';
import { AuthService } from './services/auth.service';
import { RouterModule, Router } from '@angular/router';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  imports: [RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  isCollapsed = false;
  public currentVolume: number = 50; // Volumen inicial (50%)
  public songTitle: string = 'Cargando canción...'; // Nombre de la canción
  isLoggedIn: boolean = false;

  constructor(
    private youtubeService: YoutubeService,
    private sidebarService: SidebarService,
    private authService: AuthService,
    private router: Router,
    private userService: UserService
  ) {
    this.sidebarService.isCollapsed$.subscribe(
      (state) => (this.isCollapsed = state)
    );
  }

  async ngOnInit(): Promise<void> {
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

    const session = this.authService.getSession();
this.isLoggedIn = !!session;
  }

  async playMusic(): Promise<void> {
    await this.youtubeService.play();
  }

  async pauseMusic(): Promise<void> {
    await this.youtubeService.pause();
  }

  async increaseVolume(): Promise<void> {
    if (this.currentVolume < 100) {
      this.currentVolume += 10;
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
      this.userService.updateUserName('Invitado'); // Actualiza el nombre del usuario
      this.router.navigate(['/']); // Redirige al Home
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}
