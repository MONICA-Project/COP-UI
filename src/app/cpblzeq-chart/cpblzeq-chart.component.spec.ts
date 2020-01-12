import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CpblzeqChartComponent } from './cpblzeq-chart.component';

describe('CpblzeqChartComponent', () => {
  let component: CpblzeqChartComponent;
  let fixture: ComponentFixture<CpblzeqChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CpblzeqChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CpblzeqChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
