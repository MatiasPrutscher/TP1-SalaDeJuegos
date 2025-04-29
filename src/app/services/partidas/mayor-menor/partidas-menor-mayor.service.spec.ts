import { TestBed } from '@angular/core/testing';

import { PartidasMenorMayorService } from './partidas-menor-mayor.service';

describe('PartidasMenorMayorService', () => {
  let service: PartidasMenorMayorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PartidasMenorMayorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
