import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GalatiComponent } from './galati.component';

describe('GalatiComponent', () => {
  let component: GalatiComponent;
  let fixture: ComponentFixture<GalatiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GalatiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GalatiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
