import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AudienceChartsComponent } from './audience-charts.component';

describe('AudienceChartsComponent', () => {
  let component: AudienceChartsComponent;
  let fixture: ComponentFixture<AudienceChartsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AudienceChartsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AudienceChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
