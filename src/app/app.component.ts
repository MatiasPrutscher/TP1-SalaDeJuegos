import { Component, OnInit } from '@angular/core';
import { YoutubeService } from './services/youtube.service';
import { SidebarService } from './services/sidebar.service';
import { RouterModule } from '@angular/router';

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

  constructor(
    private youtubeService: YoutubeService,
    private sidebarService: SidebarService
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
      this.currentVolume -= 10;
      await this.youtubeService.setVolume(this.currentVolume);
    }
  }

  toggleSidebar() {
    this.sidebarService.toggleSidebar();
  }
}
