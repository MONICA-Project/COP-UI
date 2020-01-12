import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RestingAreaComponent } from './resting-area.component';

describe('RestingAreaComponent', () => {
  let component: RestingAreaComponent;
  let fixture: ComponentFixture<RestingAreaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RestingAreaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RestingAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
