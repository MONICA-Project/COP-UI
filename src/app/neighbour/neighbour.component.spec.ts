import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NeighbourComponent } from './neighbour.component';

describe('NeighbourComponent', () => {
  let component: NeighbourComponent;
  let fixture: ComponentFixture<NeighbourComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NeighbourComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NeighbourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
