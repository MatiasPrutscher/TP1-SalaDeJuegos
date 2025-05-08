import { Component, OnInit, NgZone } from '@angular/core';
import Phaser from 'phaser';

@Component({
  selector: 'app-galati',
  imports: [],
  templateUrl: './galati.component.html',
  styleUrls: ['./galati.component.css']
})
export class GalatiComponent implements OnInit {
  private game!: Phaser.Game;
  constructor(private ngZone: NgZone) {}

  // Inicializa el juego Phaser
  ngOnInit() {
    this.ngZone.runOutsideAngular(() => {
      this.game = new Phaser.Game({
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: 'game-container',
        physics: {
          default: 'arcade',
          arcade: { debug: false }
        },
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH
        },
        scene: [GalatiScene_WithLives]
      });
    });
  }
}

class GalatiScene_WithLives extends Phaser.Scene {
  // Parametros configurables
  private readonly escalaJugador = 0.05;
  private readonly velocidadDisparoY = -300;
  private readonly escalaDisparo = 0.07;
  private readonly escalaEnemigo = 0.1;
  private filasEnemigos = 3; 
  private columnasEnemigos = 5; 
  private readonly espacioEntreEnemigosX = 100;
  private readonly espacioEntreEnemigosY = 60;
  private readonly posicionInicialEnemigosY = 100;
  private duracionMovimientoEnemigos = 2000; 
  private readonly vidasIniciales = 3;
  private readonly incrementoPuntuacion = 10;
  private readonly velocidadDisparoEnemigoY = 200; 
  private readonly escalaDisparoEnemigo = 0.04; 
  private readonly escalaVida = 0.01;

  // Variables del juego
  private datosEnemigos: { sprite: Phaser.Physics.Arcade.Sprite, fila: number, columna: number }[] = [];
  private velocidadEnemigosX = 100;
  private desplazamientoY = 15;
  private margenX = 30;
  private debeDesplazar = false;
  private puedeDisparar = false;
  private grupoDisparos!: Phaser.Physics.Arcade.Group;
  private jugador!: Phaser.Physics.Arcade.Sprite;
  private disparosEnemigos!: Phaser.Physics.Arcade.Group;
  private eventoDisparosEnemigos!: Phaser.Time.TimerEvent;

  private vidas = this.vidasIniciales;
  private textoVidas!: Phaser.GameObjects.Text;
  private grupoVidas!: Phaser.GameObjects.Group;

  private puntuacion = 0;
  private textoPuntuacion!: Phaser.GameObjects.Text;

  private puntuacionNivel = 0; 

  // Variables para niveles
  private nivel = 1;
  private textoNivel!: Phaser.GameObjects.Text;
  private readonly incrementoVelocidadEnemigos = 50;
  private readonly decrementoDuracionMovimiento = 200;
  private nivelEnProgreso = true; 

  // Configura los parametros iniciales del juego
  constructor() {
    super({ key: 'GalatiScene_WithLives' });
  }

  // Carga los recursos necesarios para el juego
  preload() {
    this.load.image('vida', 'assets/galati/vida.png');
    this.load.image('nave', 'assets/galati/nave.png');
    this.load.image('disparo', 'assets/galati/disparo.png');
    this.load.image('enemigo', 'assets/galati/enemigo.png');
    this.load.image('disparoEnemigo', 'assets/galati/disparoEnemigo.png');
  }

  // Configura los elementos iniciales del juego
  create() {
    // Configuracion del jugador
    this.jugador = this.physics.add.sprite(400, 550, 'nave')
      .setScale(this.escalaJugador)
      .setCollideWorldBounds(true);

    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      this.jugador.x = p.x;
    });

    // Texto combinado de puntuacion y nivel
    this.textoVidas = this.add.text(10, 10, `Puntuación: ${this.puntuacion} | Nivel: ${this.nivel}`, {
      fontSize: '20px',
      color: '#fff'
    });

    // Crear grupo de imagenes para las vidas
    this.grupoVidas = this.add.group();
    this.actualizarVidasVisuales();

    // Configuracion de disparos
    this.grupoDisparos = this.physics.add.group();
    this.input.on('pointerdown', () => {
      if (!this.puedeDisparar) return;
      this.grupoDisparos.create(this.jugador.x, this.jugador.y - 20, 'disparo')
        .setVelocityY(this.velocidadDisparoY)
        .setScale(this.escalaDisparo);
    });

    // Crear enemigos
    this.crearEnemigos();

    // Crear grupo de disparos enemigos
    this.disparosEnemigos = this.physics.add.group();

    // Configurar disparos enemigos
    this.configurarDisparosEnemigos();
  }

  // Crea los enemigos en el juego
  private crearEnemigos() {
    const baseX = (this.scale.width - (this.columnasEnemigos - 1) * this.espacioEntreEnemigosX) / 2;

    for (let fila = 0; fila < this.filasEnemigos; fila++) {
      for (let columna = 0; columna < this.columnasEnemigos; columna++) {
        const x = Phaser.Math.Between(-100, this.scale.width + 100);
        const y = -50;

        const sprite = this.physics.add.sprite(x, y, 'enemigo')
          .setScale(this.escalaEnemigo)
          .setImmovable(true);

        this.datosEnemigos.push({ sprite, fila, columna });

        this.tweens.add({
          targets: sprite,
          x: baseX + columna * this.espacioEntreEnemigosX,
          y: this.posicionInicialEnemigosY + fila * this.espacioEntreEnemigosY,
          duration: this.duracionMovimientoEnemigos,
          ease: 'Sine.easeInOut',
          onComplete: () => {
            if (sprite && sprite.active) {
              sprite.setVelocityX(this.velocidadEnemigosX);
            }
          }
        });
      }
    }

    this.time.delayedCall(this.duracionMovimientoEnemigos + 100, () => {
      this.puedeDisparar = true;
    });

    this.configurarColisiones();
  }

  // Configura las colisiones entre los elementos del juego
  private configurarColisiones() {
    // Colision disparo-enemigo
    this.physics.add.overlap(
      this.grupoDisparos,
      this.datosEnemigos.map(d => d.sprite),
      (disparo, enemigo) => {
        disparo.destroy();
        enemigo.destroy();
        this.actualizarPuntuacion(this.incrementoPuntuacion);
      }
    );

    // Colision enemigo-jugador
    this.physics.add.overlap(
      this.datosEnemigos.map(d => d.sprite),
      this.jugador,
      (enemigo, jugador) => {
        enemigo.destroy();
        this.perderVida();
      }
    );
  }

  // Configura los disparos de los enemigos
  private configurarDisparosEnemigos() {
    this.eventoDisparosEnemigos = this.time.addEvent({
      delay: 1000, 
      callback: () => {
        const enemigo = Phaser.Utils.Array.GetRandom(this.datosEnemigos).sprite;
        if (enemigo.active) {
          const disparo = this.disparosEnemigos.create(enemigo.x, enemigo.y, 'disparoEnemigo')
            .setVelocityY(this.velocidadDisparoEnemigoY) 
            .setScale(this.escalaDisparoEnemigo); 

          this.physics.add.overlap(disparo, this.jugador, () => {
            disparo.destroy(); 
            this.perderVida(); 
          });
        }
      },
      loop: true
    });
  }

  // Actualiza la puntuacion del jugador
  private actualizarPuntuacion(puntos: number) {
    this.puntuacionNivel += puntos;
    this.textoVidas.setText(`Puntuación: ${this.puntuacion + this.puntuacionNivel} | Nivel: ${this.nivel}`);
  }

  // Avanza al siguiente nivel del juego
  private avanzarNivel() {
    this.nivel++;
    this.textoVidas.setText(`Puntuación: ${this.puntuacion} | Nivel: ${this.nivel}`);

    this.velocidadEnemigosX += this.incrementoVelocidadEnemigos;
    this.duracionMovimientoEnemigos = Math.max(500, this.duracionMovimientoEnemigos - this.decrementoDuracionMovimiento);

    if (this.nivel % 3 === 0) {
      this.filasEnemigos = Math.min(6, this.filasEnemigos + 1);
      this.columnasEnemigos = Math.min(8, this.columnasEnemigos + 1);
    }

    this.puntuacion += this.puntuacionNivel;
    this.puntuacionNivel = 0;
    this.textoVidas.setText(`Puntuación: ${this.puntuacion} | Nivel: ${this.nivel}`);

    this.datosEnemigos.forEach(dato => dato.sprite.destroy());
    this.datosEnemigos = [];
    this.crearEnemigos();
  }

  // Reduce la vida del jugador y maneja el estado del juego
  private perderVida() {
    this.vidas--;
    this.actualizarVidasVisuales();
    this.textoVidas.setText(`Puntuación: ${this.puntuacion} | Nivel: ${this.nivel}`);

    this.nivelEnProgreso = false;

    this.jugador.setTint(0xff0000);

    this.time.delayedCall(200, () => {
      this.jugador.setActive(false).setVisible(false);

      this.time.delayedCall(1000, () => {
        this.jugador.clearTint();
        this.jugador.setActive(true).setVisible(true);

        this.datosEnemigos.forEach(dato => {
          dato.sprite.destroy();
        });
        this.datosEnemigos = [];
        this.crearEnemigos();

        this.nivelEnProgreso = true;
      });
    });

    if (this.vidas <= 0) {
      this.mostrarGameOver();
    }
  }

  // Muestra la pantalla de "Game Over"
  private mostrarGameOver() {
    this.physics.pause();
    this.jugador.setVisible(false);

    if (this.eventoDisparosEnemigos) {
      this.eventoDisparosEnemigos.remove(false);
    }

    this.add.text(this.scale.width / 2, this.scale.height / 2, 'GAME OVER', {
      fontSize: '40px',
      color: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.datosEnemigos.forEach(dato => {
      dato.sprite.destroy();
    });
    this.datosEnemigos = [];
  }

  // Actualiza las vidas visuales en pantalla
  private actualizarVidasVisuales() {
    this.grupoVidas.clear(true, true);

    const startX = this.scale.width - 10 - this.vidas * 35;
    for (let i = 0; i < this.vidas; i++) {
      const vida = this.add.image(startX + i * 40, 20, 'vida')
        .setScale(this.escalaVida)
        .setScrollFactor(0);
      this.grupoVidas.add(vida);
    }
  }

  // Logica de actualizacion del juego en cada frame
  override update(): void {
    if (!this.nivelEnProgreso) {
      return;
    }

    this.disparosEnemigos.getChildren().forEach((disparo) => {
      const disparoSprite = disparo as Phaser.Physics.Arcade.Sprite; 
      if (disparoSprite.y > this.scale.height) {
        disparoSprite.destroy();
      }
    });

    const sprites = this.datosEnemigos.map(d => d.sprite).filter(s => s.active);
    if (!sprites.length) {
      this.avanzarNivel();
      return;
    }

    const xs = sprites.map(s => s.x);
    const izquierda = Math.min(...xs);
    const derecha = Math.max(...xs);
    const minX = this.margenX;
    const maxX = this.scale.width - this.margenX;

    if ((this.velocidadEnemigosX > 0 && derecha >= maxX) || (this.velocidadEnemigosX < 0 && izquierda <= minX)) {
      this.velocidadEnemigosX *= -1;
      this.debeDesplazar = true;
    }

    sprites.forEach(s => {
      s.setVelocityX(this.velocidadEnemigosX);
      if (this.debeDesplazar) {
        s.y += this.desplazamientoY;
      }
    });

    if (this.debeDesplazar) {
      this.debeDesplazar = false;
    }
  }
}