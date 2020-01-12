import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css']
})
export class TimelineComponent implements OnInit {
  imgUrl = 'https://picsum.photos/200/300/?random'; 
  constructor() { }

  ngOnInit() {
  }

  reloadImg(){
    this.imgUrl = 'https://picsum.photos/200/300/?random&'+ Math.random() + '';
  }
  // getSoundHeatmapLink(){
  //   // return 'https://testherokuforsoundmap.herokuapp.com/maps/latestPicture';
  //   return 'https://picsum.photos/200/300/?random';
  // }
}
