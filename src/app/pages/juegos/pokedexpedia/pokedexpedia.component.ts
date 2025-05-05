import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { PokeApiService } from '../../../services/pokeapi/pokeapi.service';
import { Router } from '@angular/router';
import { TimerService } from '../../../services/timer/timer.service';
import { Subscription } from 'rxjs';
import { PartidasPokedexpediaService } from '../../../services/partidas/pokedexpedia/partidas-pokedexpedia.service';

@Component({
  selector: 'app-pokedexpedia',
  imports: [],
  templateUrl: './pokedexpedia.component.html',
  styleUrls: ['./pokedexpedia.component.css'],
})
export class PokedexpediaComponent implements OnInit, OnDestroy {
  currentQuestion: any = null;
  score: number = 0;
  correctGuesses: number = 0;
  isGuessed: boolean = false;
  isGameOver: boolean = false;
  disabledOptions: string[] = [];
  tiempoRestante: number = 7; // Tiempo inicial en segundos
  private timerSubscription: Subscription | null = null;

  constructor(
    private pokeApiService: PokeApiService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private timerService: TimerService,
    private partidasPokedexpediaService: PartidasPokedexpediaService 
  ) {}

  ngOnInit(): void {
    this.resetGameState();
    this.subscribeToTimer();
    this.loadNextQuestion();
  }

  ngOnDestroy(): void {
    this.unsubscribeFromTimer();
  }

  resetGameState(): void {
    this.score = 0;
    this.correctGuesses = 0;
    this.isGuessed = false;
    this.isGameOver = false;
    this.disabledOptions = [];
    this.timerService.detenerTemporizador(); 
  }

  loadNextQuestion(): void {
    const randomId = Math.floor(Math.random() * 151) + 1;
    this.pokeApiService.getPokemon(randomId).subscribe(
      async (pokemon) => {
        this.currentQuestion = {
          image: pokemon.sprites.front_default,
          correctAnswer: pokemon.name,
          options: await this.generatePokemonOptions(pokemon.name),
        };
        this.isGuessed = false;
        this.disabledOptions = [];
        this.timerService.iniciarTemporizador(7); 
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error al obtener Pokémon:', error);
        this.handleErrorState();
      }
    );
  }

  subscribeToTimer(): void {
    this.timerSubscription = this.timerService.tiempoRestante$.subscribe((tiempo) => {
      this.tiempoRestante = tiempo;
      this.cdr.detectChanges(); 

      if (tiempo === 0 && !this.isGameOver) {
        this.handleTimeOut();
      }
    });
  }

  unsubscribeFromTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
    }
  }

  async generatePokemonOptions(correctName: string): Promise<string[]> {
    const options = new Set<string>([correctName]);
    while (options.size < 4) {
      const randomId = Math.floor(Math.random() * 151) + 1;
      try {
        const pokemon = await this.pokeApiService.getPokemon(randomId).toPromise();
        options.add(pokemon.name);
      } catch (error) {
        console.error('Error al obtener un Pokémon para las opciones:', error);
      }
    }
    return this.shuffleArray(Array.from(options));
  }

  shuffleArray(array: any[]): any[] {
    return array.sort(() => Math.random() - 0.5);
  }

  checkAnswer(selectedOption: string): void {
    if (selectedOption === this.currentQuestion.correctAnswer) {
      this.handleCorrectAnswer();
    } else {
      this.handleIncorrectAnswer(selectedOption);
    }
  }

  handleCorrectAnswer(): void {
    this.score += 100;
    this.correctGuesses++;
    this.isGuessed = true;
    this.timerService.detenerTemporizador();
  }

  handleIncorrectAnswer(selectedOption: string): void {
    this.score -= 100;
    this.disabledOptions.push(selectedOption);

    if (this.score <= -100) {
      this.score = 0;
      this.endGame();
    }
  }

  handleTimeOut(): void {
    this.score = 0; 
    this.endGame(); 
    this.cdr.detectChanges(); 
  }

  continuar(): void {
    this.loadNextQuestion();
  }

  plantarse(): void {
    this.isGameOver = true;
    this.timerService.detenerTemporizador(); 

    const resultado = 'Victoria';

    this.partidasPokedexpediaService
      .guardarPartida(this.score, this.correctGuesses, resultado)
      .then(() => {
        console.log('Partida guardada correctamente.');
      })
      .catch((error) => {
        console.error('Error al guardar la partida:', error);
      });
  }

  reiniciar(): void {
    this.resetGameState();
    this.loadNextQuestion();
  }

  endGame(): void {
    this.isGameOver = true;
    this.isGuessed = false;
    this.timerService.detenerTemporizador(); 

    const resultado = this.score > 0 ? 'Victoria' : 'Derrota';

    this.partidasPokedexpediaService
      .guardarPartida(this.score, this.correctGuesses, resultado)
      .then(() => {
        console.log('Partida guardada correctamente.');
      })
      .catch((error) => {
        console.error('Error al guardar la partida:', error);
      });
  }

  volverAlHome(): void {
    this.router.navigate(['/']);
  }

  handleErrorState(): void {
    this.currentQuestion = {
      image: '',
      correctAnswer: 'Error',
      options: [],
    };
    this.isGameOver = true;
    this.cdr.detectChanges();
  }
}
