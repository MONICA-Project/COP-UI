import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'overview-card',
  templateUrl: './overview-card.component.html',
  styleUrls: ['./overview-card.component.css']
})
export class OverviewCardComponent implements OnInit {
  @Input('values') values: any;
  constructor() { }

  ngOnInit() {
  }

}
