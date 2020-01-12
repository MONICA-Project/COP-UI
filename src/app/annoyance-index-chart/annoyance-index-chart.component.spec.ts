import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnoyanceIndexChartComponent } from './annoyance-index-chart.component';

describe('AnnoyanceIndexChartComponent', () => {
  let component: AnnoyanceIndexChartComponent;
  let fixture: ComponentFixture<AnnoyanceIndexChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnnoyanceIndexChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnoyanceIndexChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
