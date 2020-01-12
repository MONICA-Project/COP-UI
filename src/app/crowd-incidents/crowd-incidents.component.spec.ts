import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrowdIncidentsComponent } from './crowd-incidents.component';

describe('CrowdIncidentsComponent', () => {
  let component: CrowdIncidentsComponent;
  let fixture: ComponentFixture<CrowdIncidentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrowdIncidentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrowdIncidentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
