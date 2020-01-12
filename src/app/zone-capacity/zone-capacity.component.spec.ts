import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ZoneCapacityComponent } from './zone-capacity.component';

describe('ZoneCapacityComponent', () => {
  let component: ZoneCapacityComponent;
  let fixture: ComponentFixture<ZoneCapacityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ZoneCapacityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ZoneCapacityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
