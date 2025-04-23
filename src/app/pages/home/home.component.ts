import { Component } from '@angular/core';
import { AppComponent } from '../../app.component';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  juegos = [
    {
      nombre: 'Ahorcado',
      descripcion: 'Pon a prueba tu vocabulario adivinando palabras.',
      imagen: '../../assets/ahorcado.png'
    },
    {
      nombre: 'Mayor o Menor',
      descripcion: 'Adivina si el próximo número será mayor o menor.',
      imagen: '../../../assets/mayor-menor.png'
    },
    {
      nombre: 'Preguntados',
      descripcion: 'Responde preguntas y demuestra tus conocimientos.',
      imagen: '../../../assets/preguntados.webp'
    },
    {
      nombre: 'Juego Propio',
      descripcion: 'Un juego único diseñado por mí.',
      imagen: '../../../assets/juego-propio.png'
    }
  ];

  constructor(private appComponent: AppComponent) {}

  toggleSidebar() {
    this.appComponent.toggleSidebar();
  }
}
