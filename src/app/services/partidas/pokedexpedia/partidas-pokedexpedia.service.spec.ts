import { TestBed } from '@angular/core/testing';

import { PartidasPokedexpediaService } from './partidas-pokedexpedia.service';

describe('PartidasPokedexpediaService', () => {
  let service: PartidasPokedexpediaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PartidasPokedexpediaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
