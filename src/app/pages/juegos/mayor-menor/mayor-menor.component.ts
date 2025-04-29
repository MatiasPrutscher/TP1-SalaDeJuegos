import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CartasService } from '../../../services/cartas/cartas.service';
import { TimerService } from '../../../services/timer/timer.service';
import { PartidasMayorMenorService } from '../../../services/partidas/mayor-menor/partidas-menor-mayor.service';
import { Subscription } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-mayor-menor',
  imports: [RouterLink],
  templateUrl: './mayor-menor.component.html',
  styleUrls: ['./mayor-menor.component.css'],
})
export class MayorMenorComponent implements OnInit, OnDestroy {
  deckId = '';
  cartaActual: any = null;
  cartaSiguiente: any = null;
  aciertos = 0;
  mensaje = '';
  jugando = true;
  motivoPerdida = '';
  tiempoRestante = 5;
  private timerSubscription: Subscription | null = null;

  constructor(
    private cartasService: CartasService,
    private cdr: ChangeDetectorRef,
    private timerService: TimerService,
    private partidasService: PartidasMayorMenorService
  ) {}

  ngOnInit(): void {
    this.iniciarJuego();
  }

  iniciarTemporizador(): void {
    this.timerService.iniciarTemporizador(5);
    this.timerSubscription = this.timerService.tiempoRestante$.subscribe((tiempo) => {
      this.tiempoRestante = tiempo;

      this.cdr.detectChanges();

      if (tiempo === 0) {
        this.terminarJuego('Se acabó el tiempo');
      }
    });
  }

  detenerTemporizador(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
    }
    this.timerService.detenerTemporizador();
  }

  async iniciarJuego(): Promise<void> {
    this.resetEstado();
    const deckResp = await this.cartasService.crearBaraja().toPromise();
    this.deckId = deckResp.deck_id;

    const initResp = await this.cartasService.sacarCartas(this.deckId, 1).toPromise();
    this.cartaActual = initResp.cards[0];

    await this.cargarSiguienteCarta();
    this.iniciarTemporizador();
  }

  private async cargarSiguienteCarta(): Promise<void> {
    let data;
    do {
      data = await this.cartasService.sacarCartas(this.deckId, 1).toPromise();
      this.cartaSiguiente = data.cards[0];
    } while (this.cartaSiguiente.value === this.cartaActual.value);
  }

  async adivinar(mayor: boolean): Promise<void> {
    if (!this.jugando || !this.cartaActual || !this.cartaSiguiente) return;

    const valAct = this.obtenerValorNumerico(this.cartaActual.value);
    const valSig = this.obtenerValorNumerico(this.cartaSiguiente.value);
    const acierto = mayor ? valSig > valAct : valSig < valAct;

    if (acierto) {
      this.aciertos++;
      this.cartaActual = this.cartaSiguiente;
      await this.cargarSiguienteCarta();
      this.iniciarTemporizador();
    } else {
      this.terminarJuego('Erraste la carta');
    }
  }

  async terminarJuego(motivo: string): Promise<void> {
    this.jugando = false;
    this.mensaje = `¡Perdiste! Aciertos: ${this.aciertos}`;
    this.detenerTemporizador();

    try {
      console.log('Intentando guardar la partida...');
      await this.partidasService.guardarPartida(this.aciertos);
      console.log('Partida guardada con éxito.');
    } catch (error) {
      console.error('Error al registrar la partida:', error);
    }
  }

  obtenerValorNumerico(val: string): number {
    const mapeo: Record<string, number> = {
      ACE: 1,
      JACK: 11,
      QUEEN: 12,
      KING: 13,
    };
    return mapeo[val] || parseInt(val, 10) || 0;
  }

  private resetEstado(): void {
    this.deckId = '';
    this.cartaActual = null;
    this.cartaSiguiente = null;
    this.aciertos = 0;
    this.mensaje = '';
    this.jugando = true;
    this.motivoPerdida = '';
  }

  ngOnDestroy(): void {
    this.detenerTemporizador();
  }
}