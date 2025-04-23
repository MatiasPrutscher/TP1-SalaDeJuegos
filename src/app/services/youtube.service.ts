import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class YoutubeService {
  private apiKey = 'AIzaSyDOwk6IU3iMEJ5GwBNyyPX0KBljKwViuc8'; // Reemplaza con tu clave de API de YouTube
  private apiUrl = 'https://www.googleapis.com/youtube/v3/videos';
  public iframe: HTMLIFrameElement | null = null;

  constructor(private http: HttpClient) {}

  async initializePlayer(): Promise<void> {
    if (!this.iframe) {
      this.iframe = document.createElement('iframe');
      this.iframe.src = 'https://www.youtube.com/embed/4xDzrJKXOOY?enablejsapi=1&loop=1&playlist=4xDzrJKXOOY';
      this.iframe.style.display = 'none';
      this.iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      document.body.appendChild(this.iframe);

      // Esperar a que el iframe esté completamente cargado
      await new Promise<void>((resolve) => {
        this.iframe!.onload = () => {
          console.log('YouTube iframe cargado correctamente.');
          resolve();
        };
      });
    }
  }

  getVideoTitle(videoId: string): Observable<any> {
    const url = `${this.apiUrl}?id=${videoId}&part=snippet&key=${this.apiKey}`;
    return this.http.get(url);
  }

  async play(): Promise<void> {
    if (!this.iframe) {
      await this.initializePlayer();
    }
    this.iframe?.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
  }

  async pause(): Promise<void> {
    if (!this.iframe) {
      await this.initializePlayer();
    }
    this.iframe?.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
  }

  async setVolume(volume: number): Promise<void> {
    if (!this.iframe) {
      await this.initializePlayer();
    }
    this.iframe?.contentWindow?.postMessage(`{"event":"command","func":"setVolume","args":[${volume}]}`, '*');
  }
}
