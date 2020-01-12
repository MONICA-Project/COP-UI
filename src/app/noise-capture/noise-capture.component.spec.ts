import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoiseCaptureComponent } from './noise-capture.component';

describe('NoiseCaptureComponent', () => {
  let component: NoiseCaptureComponent;
  let fixture: ComponentFixture<NoiseCaptureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NoiseCaptureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoiseCaptureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
