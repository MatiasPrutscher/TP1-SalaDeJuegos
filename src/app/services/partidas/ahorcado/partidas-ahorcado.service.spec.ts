import { TestBed } from '@angular/core/testing';

import { PartidasAhorcadoService } from './partidas-ahorcado.service';

describe('PartidasAhorcadoService', () => {
  let service: PartidasAhorcadoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PartidasAhorcadoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
