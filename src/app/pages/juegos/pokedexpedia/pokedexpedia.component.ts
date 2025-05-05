import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { PokeApiService } from '../../../services/pokeapi/pokeapi.service';
import { Router } from '@angular/router';
import { TimerService } from '../../../services/timer/timer.service';
import { Subscription } from 'rxjs';
import { PartidasPokedexpediaService } from '../../../services/partidas/pokedexpedia/partidas-pokedexpedia.service';

const INITIAL_TIME = 7;
const POKEMON_GENERATIONS = {
  GEN_1: { min: 1, max: 151 },
  GEN_2_3: { min: 1, max: 386 },
  GEN_9: { min: 1, max: 1025 },
};
const PENALTY_EASY = 100;
const PENALTY_INTERMEDIATE = 200;
const PENALTY_HARD = 300;
const POINTS_EASY = 100;
const POINTS_INTERMEDIATE = 150;
const POINTS_HARD = 200;

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
  tiempoRestante: number = INITIAL_TIME; 
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
    const randomId = this.getRandomPokemonId();

    this.pokeApiService.getPokemon(randomId).subscribe(
      async (pokemon) => {
        this.setupQuestion(pokemon);
      },
      (error) => this.handleApiError(error, 'loadNextQuestion')
    );
  }

  private getRandomPokemonId(): number {
    const { min, max } = this.getPokemonIdRange();
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private async setupQuestion(pokemon: any): Promise<void> {
    this.currentQuestion = {
      image: pokemon.sprites.front_default,
      correctAnswer: pokemon.name,
      options: await this.generatePokemonOptions(pokemon.name),
    };
    this.isGuessed = false;
    this.disabledOptions = [];
    this.cdr.detectChanges(); 
    this.timerService.iniciarTemporizador(INITIAL_TIME); 
  }

  subscribeToTimer(): void {
    this.timerSubscription = this.timerService.tiempoRestante$.subscribe((tiempo) => {
      this.tiempoRestante = tiempo;
      this.cdr.detectChanges();

      if (tiempo === 0 && !this.isGameOver && this.currentQuestion) { 
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
    const { min, max } = this.getPokemonIdRange();
    const options = new Set<string>([correctName]);

    while (options.size < 4) {
      const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
      try {
        const pokemon = await this.pokeApiService.getPokemon(randomId).toPromise();
        options.add(pokemon.name);
      } catch (error) {
        this.handleApiError(error, 'obtener un Pokémon para las opciones');
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
    let points: number;

    if (this.correctGuesses >= 10) {
      points = POINTS_HARD; 
    } else if (this.correctGuesses >= 5) {
      points = POINTS_INTERMEDIATE; 
    } else {
      points = POINTS_EASY; 
    }

    this.score += points;
    this.correctGuesses++;
    this.isGuessed = true;
    this.timerService.detenerTemporizador();
  }

  handleIncorrectAnswer(selectedOption: string): void {
    let penalty: number;

    if (this.correctGuesses >= 10) {
      penalty = PENALTY_HARD; 
    } else if (this.correctGuesses >= 5) {
      penalty = PENALTY_INTERMEDIATE; 
    } else {
      penalty = PENALTY_EASY; 
    }

    this.score -= penalty;
    this.disabledOptions.push(selectedOption);

    if (this.score <= -1) {
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
        this.handleApiError(error, 'guardar la partida');
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
        this.handleApiError(error, 'guardar la partida');
      });
  }

  volverAlHome(): void {
    this.router.navigate(['/']);
  }

  private handleErrorState(): void {
    this.isGameOver = true;
    this.cdr.detectChanges();
  }

  private getPokemonIdRange(): { min: number; max: number } {
    if (this.correctGuesses >= 10) {
      return POKEMON_GENERATIONS.GEN_9;
    } else if (this.correctGuesses >= 5) {
      return POKEMON_GENERATIONS.GEN_2_3;
    } else {
      return POKEMON_GENERATIONS.GEN_1;
    }
  }

  private handleApiError(error: any, context: string): void {
    console.error(`Error en ${context}:`, error);
    this.handleErrorState();
  }

  get playerLevel(): string {
    if (this.correctGuesses >= 10) {
      return 'Difícil';
    } else if (this.correctGuesses >= 5) {
      return 'Intermedio';
    } else {
      return 'Fácil';
    }
  }
}
