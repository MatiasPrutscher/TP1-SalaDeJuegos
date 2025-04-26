import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class YoutubeService {
  private apiKey = environment.youtubeApiKey; // Clave de API desde environment
  private apiUrl = 'https://www.googleapis.com/youtube/v3/videos';
  private iframeUrl = 'https://www.youtube.com/embed/4xDzrJKXOOY?enablejsapi=1&loop=1&playlist=4xDzrJKXOOY';
  public iframe: HTMLIFrameElement | null = null;

  constructor(private http: HttpClient) {}

  // Inicializa el iframe si no está ya inicializado
  private async ensurePlayerInitialized(): Promise<void> {
    if (!this.iframe) {
      this.iframe = document.createElement('iframe');
      this.iframe.src = this.iframeUrl;
      this.iframe.style.display = 'none';
      this.iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      document.body.appendChild(this.iframe);

      // Espera a que el iframe esté completamente cargado
      await new Promise<void>((resolve, reject) => {
        this.iframe!.onload = () => {
          console.log('YouTube iframe cargado correctamente.');
          resolve();
        };
        this.iframe!.onerror = () => {
          console.error('Error al cargar el iframe de YouTube.');
          reject(new Error('Error al cargar el iframe de YouTube.'));
        };
      });
    }
  }

  // Envía un comando al iframe
  private async sendCommandToIframe(command: string, args: any[] = []): Promise<void> {
    await this.ensurePlayerInitialized();
    this.iframe?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func: command, args }),
      '*'
    );
  }

  // Obtiene el título de un video de YouTube
  getVideoTitle(videoId: string): Observable<any> {
    const url = `${this.apiUrl}?id=${videoId}&part=snippet&key=${this.apiKey}`;
    return this.http.get(url);
  }

  // Reproduce el video
  async play(): Promise<void> {
    await this.sendCommandToIframe('playVideo');
  }

  // Pausa el video
  async pause(): Promise<void> {
    await this.sendCommandToIframe('pauseVideo');
  }

  // Ajusta el volumen del video
  async setVolume(volume: number): Promise<void> {
    await this.sendCommandToIframe('setVolume', [volume]);
  }

  // Inicializa el reproductor
  initializePlayer(): Promise<void> {
    return this.ensurePlayerInitialized();
  }
}
