import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { WordService } from '../../../services/words/words.service';
import { Router } from '@angular/router';
import { TimerService } from '../../../services/timer/timer.service'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ahorcado',
  imports: [CommonModule],
  templateUrl: './ahorcado.component.html',
  styleUrls: ['./ahorcado.component.css'],
})
export class AhorcadoComponent implements OnInit {
  tiempoTimer: number = 60; // Tiempo inicial configurable para pruebas
  palabraOculta: string = '';
  palabraMostrada: string[] = [];
  letrasDisponibles: string[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  letrasUsadas: Set<string> = new Set();
  intentosRestantes: number = 10;
  puntos: number = 0;
  multiplicador: number = 1;
  dificultad: number = 4;
  mensaje: string = '';
  jugando: boolean = true;
  puntosAcumulados: number = 0;
  nivelesCompletados: number = 0;
  tiempoRestante: number = this.tiempoTimer; // Tiempo inicial

  constructor(
    private wordService: WordService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public timerService: TimerService 
  ) {}

  ngOnInit(): void {
    this.timerService.tiempoRestante$.subscribe((tiempo) => {
      this.tiempoRestante = tiempo; 

      if (tiempo === 0 && this.jugando) {
        this.perder('tiempo'); 
      }
    });

    this.timerService.iniciarTemporizador(this.tiempoTimer); 
    this.iniciarJuego();
  }

  iniciarJuego(): void {
    this.intentosRestantes = 10;
    this.mensaje = '';
    this.jugando = true;
    this.letrasUsadas.clear();
    this.palabraMostrada = [];
    this.letrasDisponibles = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    this.puntos = 10; 
    this.tiempoRestante = this.tiempoTimer; 

    // Inicia el temporizador
    this.timerService.iniciarTemporizador(this.tiempoTimer);

    // Determina la longitud de la palabra según el nivel
    const baseLongitud = 4; // Longitud inicial de las palabras
    const incremento = Math.floor(this.nivelesCompletados / 2); // Incrementa cada 2 niveles completados
    this.dificultad = Math.min(baseLongitud + incremento, 13); // Máximo de 13 letras

    this.seleccionarPalabra();
  }

  async seleccionarPalabra(): Promise<void> {
    try {
      const palabras = await this.wordService.getRandomWord(this.dificultad);
      console.log('Palabra seleccionada:', palabras[0]);
      this.palabraOculta = palabras[0].toUpperCase();
      this.palabraMostrada = Array(this.palabraOculta.length).fill('_');
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error al obtener la palabra:', error);
      this.mensaje = 'Error al cargar la palabra. Intenta de nuevo.';
      this.jugando = false;
      this.cdr.detectChanges();
    }
  }

  letraSeleccionada(letra: string): void {
    if (!this.jugando || this.letrasUsadas.has(letra)) return;

    this.letrasUsadas.add(letra);

    const letraNormalizada = letra.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Elimina acentos
    const palabraNormalizada = this.palabraOculta.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Elimina acentos

    const indices = [];
    for (let i = 0; i < palabraNormalizada.length; i++) {
      if (palabraNormalizada[i] === letraNormalizada) {
        indices.push(i);
      }
    }

    if (indices.length > 0) {
      indices.forEach((i) => (this.palabraMostrada[i] = this.palabraOculta[i])); 
      if (!this.palabraMostrada.includes('_')) {
        this.ganar();
      }
    } else {
      this.intentosRestantes--;
      this.puntos = Math.max(0, this.puntos - 1); 
      if (this.intentosRestantes === 0) {
        this.perder('intentos');
      }
    }

    if (this.tiempoRestante === 0) {
      this.perder('tiempo');
    }
  }

  ganar(): void {
    this.jugando = false;
    this.mensaje = '¡Ganaste! ¿Quieres continuar o plantarte?';

  
    const puntosNivel = (this.puntos + this.tiempoRestante) * this.multiplicador;
    this.puntosAcumulados = (this.puntosAcumulados || 0) + puntosNivel;

    this.multiplicador++; 
    this.nivelesCompletados++; 

    this.timerService.detenerTemporizador();
  }

  perder(razon: 'tiempo' | 'intentos'): void {
    this.jugando = false; 

    if (razon === 'tiempo') {
      this.mensaje = '¡Perdiste! Se acabó el tiempo.';
    } else if (razon === 'intentos') {
      this.mensaje = '¡Perdiste! Te quedaste sin intentos.';
    }

    this.puntos = 0;
    this.multiplicador = 1;

    this.timerService.detenerTemporizador();
  }

  continuar(): void {
    this.iniciarJuego();
  }

  plantarse(): void {
    this.mensaje = `Te plantaste con ${this.puntosAcumulados} puntos.`;
    this.jugando = false;
  }

  volverAJugar(): void {
    this.puntosAcumulados = 0;
    this.puntos = 0;
    this.multiplicador = 1;
    this.nivelesCompletados = 0;
    this.iniciarJuego();
  }

  volverAlHome(): void {
    this.router.navigate(['/']);
  }
}
