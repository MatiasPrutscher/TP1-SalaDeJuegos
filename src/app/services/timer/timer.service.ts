import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TimerService {
  private tiempoRestante = new BehaviorSubject<number>(60); // Tiempo inicial
  tiempoRestante$ = this.tiempoRestante.asObservable(); // Observable para suscribirse al tiempo restante
  private temporizador: Subscription | null = null;

  iniciarTemporizador(duracion: number = 60): void {
    this.tiempoRestante.next(duracion); // Reinicia el tiempo
    this.detenerTemporizador(); // Detiene cualquier temporizador previo

    this.temporizador = interval(1000).subscribe(() => {
      const tiempoActual = this.tiempoRestante.value;
      if (tiempoActual > 0) {
        this.tiempoRestante.next(tiempoActual - 1); // Disminuye el tiempo
      } else {
        this.detenerTemporizador(); // Detiene el temporizador cuando llega a 0
      }
    });
  }

  detenerTemporizador(): void {
    if (this.temporizador) {
      this.temporizador.unsubscribe();
      this.temporizador = null;
    }
  }
}
