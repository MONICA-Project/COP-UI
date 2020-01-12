import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LxeqChartComponent } from './lxeq-chart.component';

describe('LxeqChartComponent', () => {
  let component: LxeqChartComponent;
  let fixture: ComponentFixture<LxeqChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LxeqChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LxeqChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
