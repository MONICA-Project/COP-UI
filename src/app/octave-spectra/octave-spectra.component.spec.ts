import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OctaveSpectraComponent } from './octave-spectra.component';

describe('OctaveSpectraComponent', () => {
  let component: OctaveSpectraComponent;
  let fixture: ComponentFixture<OctaveSpectraComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OctaveSpectraComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OctaveSpectraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
