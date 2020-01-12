import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NeighbourChartsComponent } from './neighbour-charts.component';

describe('NeighbourChartsComponent', () => {
  let component: NeighbourChartsComponent;
  let fixture: ComponentFixture<NeighbourChartsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NeighbourChartsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NeighbourChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
