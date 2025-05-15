import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ResultadosService } from '../../services/resultados/resultados.service';
import { CommonModule } from '@angular/common';
import { NombreJuegoPipe } from '../../pipes/nombre-juego.pipe';

@Component({
  selector: 'app-resultados',
  imports: [CommonModule, NombreJuegoPipe],
  templateUrl: './resultados.component.html',
  styleUrls: ['./resultados.component.css'],
})
export class ResultadosComponent implements OnInit {
  resultados: any = {};
  cargando: boolean = true;

  constructor(
    private resultadosService: ResultadosService,
    private cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit(): Promise<void> {
    console.log('ngOnInit: Iniciando la carga de resultados...');
    await this.cargarResultados();
    this.cargando = false;
    console.log('ngOnInit: Finalizó la carga de resultados. Estado de cargando:', this.cargando);
    this.cdr.detectChanges(); 
  }

  async cargarResultados(): Promise<void> {
    try {
      console.log('cargarResultados: Llamando al servicio para obtener los resultados...');
      this.resultados = await this.resultadosService.obtenerTodos();
      console.log('cargarResultados: Resultados obtenidos:', this.resultados);
      this.cargando = false; 
      console.log('cargarResultados: Estado de cargando:', this.cargando);
    } catch (error) {
      console.error('cargarResultados: Error al cargar los resultados:', error);
      this.cargando = false;
    }
  }
}
