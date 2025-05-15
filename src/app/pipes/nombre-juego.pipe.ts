import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nombreJuego'
})
export class NombreJuegoPipe implements PipeTransform {
  transform(value: string): string {
    switch (value) {
      case 'partidas_ahorcado':
        return 'Ahorcado';
      case 'partidas_mayor_menor':
        return 'Mayor o Menor';
      case 'partidas_galati':
        return 'Galati';
      case 'partidas_pokedexpedia':
        return '¿Quien es ese pokémon?';
      default:
        return value;
    }
  }
}
