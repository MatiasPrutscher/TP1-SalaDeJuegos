import { Component, OnInit, ChangeDetectorRef, inject, OnDestroy } from '@angular/core';
import { PokeApiService } from '../../../services/pokeapi/pokeapi.service';
import { Router } from '@angular/router';
import { TimerService } from '../../../services/timer/timer.service';
import { Subscription } from 'rxjs';
import { PartidasPokedexpediaService } from '../../../services/partidas/pokedexpedia/partidas-pokedexpedia.service';

//parametros de la partida
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

const SD_TIME = 5;
const SD_TOTAL_POKEMON = 1025;
const SD_POINTS_PER_CORRECT = 100;

// Resultado ahora guarda el modo de la partida
type GameMode = 'Clasico' | 'Muerte Subita';

@Component({
  selector: 'app-pokedexpedia',
  imports: [],
  templateUrl: './pokedexpedia.component.html',
  styleUrls: ['./pokedexpedia.component.css'],
})
export class PokedexpediaComponent implements OnInit, OnDestroy {
  private pokeApiService = inject(PokeApiService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private timerService = inject(TimerService);
  private partidasPokedexpediaService = inject(PartidasPokedexpediaService);

  // Game state
  currentQuestion: any = null;
  score: number = 0;
  correctGuesses: number = 0;
  isGuessed: boolean = false;
  isGameOver: boolean = false;
  disabledOptions: string[] = [];
  tiempoRestante: number = INITIAL_TIME;
  private timerSubscription: Subscription | null = null;
  highestScore: number = 0;

  // Sleccion de modo
  suddenDeathMode: boolean | null = null; 

  ngOnInit(): void {}
  ngOnDestroy(): void { this.unsubscribeFromTimer(); }

  selectMode(sudden: boolean): void {
    this.suddenDeathMode = sudden;
    this.resetGameState();
    this.subscribeToTimer();
    this.loadNextQuestion();
  }

  resetGameState(): void {
    this.score = 0;
    this.correctGuesses = 0;
    this.highestScore = 0;
    this.isGuessed = false;
    this.isGameOver = false;
    this.disabledOptions = [];
    this.timerService.detenerTemporizador();
    this.currentQuestion = null;
  }

  loadNextQuestion(): void {
    if (this.suddenDeathMode === null) return;
    const randomId = this.getRandomPokemonId();
    this.pokeApiService.getPokemon(randomId).subscribe(
      async (pokemon) => this.setupQuestion(pokemon),
      (error) => this.handleApiError(error, 'loadNextQuestion')
    );
  }

  private getRandomPokemonId(): number {
    if (this.suddenDeathMode) return Math.floor(Math.random() * SD_TOTAL_POKEMON) + 1;
    const { min, max } = this.getPokemonIdRange();
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private async setupQuestion(pokemon: any): Promise<void> {
    this.currentQuestion = { image: pokemon.sprite, correctAnswer: pokemon.name, options: await this.generatePokemonOptions(pokemon.name) };
    this.isGuessed = false;
    this.disabledOptions = [];
    this.cdr.detectChanges();
    const time = this.suddenDeathMode ? SD_TIME : INITIAL_TIME;
    this.timerService.iniciarTemporizador(time);
  }

  subscribeToTimer(): void {
    this.timerSubscription = this.timerService.tiempoRestante$.subscribe((t) => {
      this.tiempoRestante = t;
      this.cdr.detectChanges();
      if (t === 0 && !this.isGameOver && this.currentQuestion) this.handleTimeOut();
    });
  }

  unsubscribeFromTimer(): void { this.timerSubscription?.unsubscribe(); this.timerSubscription = null; }

  private async generatePokemonOptions(correctName: string): Promise<string[]> {
    const options = new Set<string>([correctName]);
    const minId = this.suddenDeathMode ? 1 : this.getPokemonIdRange().min;
    const maxId = this.suddenDeathMode ? SD_TOTAL_POKEMON : this.getPokemonIdRange().max;
    while (options.size < 4) {
      const id = Math.floor(Math.random() * (maxId - minId + 1)) + minId;
      try { const poke = await this.pokeApiService.getPokemon(id).toPromise(); options.add(poke.name); }
      catch {/* ignore */}
    }
    return Array.from(options).sort(() => Math.random() - 0.5);
  }

  checkAnswer(option: string): void { option === this.currentQuestion.correctAnswer ? this.handleCorrectAnswer() : this.handleIncorrectAnswer(option); }

  private handleCorrectAnswer(): void {
    this.timerService.detenerTemporizador();
    if (this.suddenDeathMode) {
      this.score += SD_POINTS_PER_CORRECT;
      this.correctGuesses++;
      this.isGuessed = true;
      if (this.score > this.highestScore) this.highestScore = this.score;
      setTimeout(() => this.loadNextQuestion(), 1000);
    } else {
      let p = this.correctGuesses >= 10 ? POINTS_HARD : this.correctGuesses >= 5 ? POINTS_INTERMEDIATE : POINTS_EASY;
      this.score += p;
      this.correctGuesses++;
      this.isGuessed = true;
      if (this.score > this.highestScore) this.highestScore = this.score;
    }
  }

  private handleIncorrectAnswer(option: string): void {
    this.timerService.detenerTemporizador();
    if (this.suddenDeathMode) {
      this.endGame();
    } else {
      let pen = this.correctGuesses >= 10 ? PENALTY_HARD : this.correctGuesses >= 5 ? PENALTY_INTERMEDIATE : PENALTY_EASY;
      this.score -= pen;
      this.disabledOptions.push(option);
      if (this.score < 0) { this.score = 0; this.endGame(); }
    }
  }

  private handleTimeOut(): void { this.timerService.detenerTemporizador(); this.endGame(); this.cdr.detectChanges(); }

  continuar(): void { if (!this.suddenDeathMode) this.loadNextQuestion(); }

  plantarse(): void {
    this.isGameOver = true;
    this.timerService.detenerTemporizador();
    // siempre clasico en plantarse
    this.persistResult();
  }

  reiniciar(): void { this.resetGameState(); this.subscribeToTimer(); this.loadNextQuestion(); }

  private endGame(): void {
    this.isGameOver = true;
    this.isGuessed = false;
    this.timerService.detenerTemporizador();
    this.persistResult();
  }

  private persistResult(): void {
    const modo: GameMode = this.suddenDeathMode ? 'Muerte Subita' : 'Clasico';
    this.partidasPokedexpediaService.guardarPartida(this.highestScore, this.correctGuesses, modo);
  }

  volverAlHome(): void { this.router.navigate(['/']); }

  private getPokemonIdRange(): { min: number; max: number } {
    if (this.correctGuesses >= 10) return POKEMON_GENERATIONS.GEN_9;
    if (this.correctGuesses >= 5) return POKEMON_GENERATIONS.GEN_2_3;
    return POKEMON_GENERATIONS.GEN_1;
  }

  private handleApiError(error: any, ctx: string) { console.error(`Error en ${ctx}:`, error); this.isGameOver = true; this.cdr.detectChanges(); }

  get playerLevel(): string {
    if (this.suddenDeathMode === null) return '';
    if (this.suddenDeathMode) return 'Muerte Súbita';
    return this.correctGuesses >= 10 ? 'Difícil' : this.correctGuesses >= 5 ? 'Intermedio' : 'Fácil';
  }
}