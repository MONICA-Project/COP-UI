import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { ThingService } from 'app/thing.service';

@Component({
  selector: 'app-sound-details',
  templateUrl: './sound-details.component.html',
  styleUrls: ['./sound-details.component.css']
})
export class SoundDetailsComponent implements OnInit {
  map;
  meter; 
  id: number;
  private sub: any;
  event = {
    center: {lat: 53.554132, lng: 9.971055},
    zoom: 19,
    scrollwheel: false
  };
  marker = {
    position: {},
    label: "",
    visible: false
  };

  constructor(private route: ActivatedRoute, private thingService: ThingService) { }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.id = +params['id']; // (+) converts string 'id' to a number
      console.log('Meter id', this.id); 
      
      // In a real app: dispatch action to load the details here.
   });
  }

  setupMeter(){
    let subT = this.thingService.getThingsWithObservations(this.id).subscribe(data => {
      this.meter = data;
      console.log('Sound meter', this.meter); 
      this.event.center.lat = this.meter.lat;
      this.event.center.lng = this.meter.lon;
      
      this.marker.position = new google.maps.LatLng(this.meter.lat, this.meter.lon);
      this.marker.visible = true; 

      this.map.panTo(this.event.center);
    }, error => {
      console.log('Error getting meter by id', error); 
    });
  }

  onMapReady(map) {
    this.map = map;
    this.setupMeter();
  }

  onIdle(event) {
    // console.log('map', event.target);
  }

  onMapClick(event) {
    // this.positions.push(event.latLng);
    // event.target.panTo(event.latLng);
    // console.log('Positions: ', this.positions);
  }
}
