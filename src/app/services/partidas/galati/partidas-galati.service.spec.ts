import { TestBed } from '@angular/core/testing';

import { PartidasGalatiService } from './partidas-galati.service';

describe('PartidasGalatiService', () => {
  let service: PartidasGalatiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PartidasGalatiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
