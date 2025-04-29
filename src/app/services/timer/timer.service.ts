import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TimerService {
  private tiempoRestanteSubject = new BehaviorSubject<number>(0);
  tiempoRestante$ = this.tiempoRestanteSubject.asObservable();
  private intervalo: Subscription | null = null;

  iniciarTemporizador(segundos: number): void {
    this.tiempoRestanteSubject.next(segundos);

    if (this.intervalo) {
      this.intervalo.unsubscribe();
    }

    this.intervalo = interval(1000).subscribe(() => {
      const tiempoActual = this.tiempoRestanteSubject.value;
      if (tiempoActual > 0) {
        this.tiempoRestanteSubject.next(tiempoActual - 1);
      } else {
        this.detenerTemporizador();
      }
    });
  }

  detenerTemporizador(): void {
    if (this.intervalo) {
      this.intervalo.unsubscribe();
      this.intervalo = null;
    }
  }
}
