import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokedexpediaComponent } from './pokedexpedia.component';

describe('PokedexpediaComponent', () => {
  let component: PokedexpediaComponent;
  let fixture: ComponentFixture<PokedexpediaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokedexpediaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokedexpediaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
