import { Router } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Filter } from 'app/map/map.component';
import { HeatmapLayer } from '@ngui/map';
import { ZoneService } from 'app/zone.service';
import { Subscription } from 'rxjs';
declare var google: any;
import * as moment from 'moment';
import 'moment/locale/fr';

@Component({
  moduleId: module.id,
  selector: 'maps-cmp',
  templateUrl: 'maps.component.html'
})

export class MapsComponent implements OnInit {
  selFilters = [Filter.SoundHeatMap, Filter.Stages, Filter.Sensors];
  subscriptions: Array<Subscription> = new Array<Subscription>();
  showDiv = true;
  overview_1 = {
    icon: "ti-user",
    icon_color: "icon-success",
    title: "No. Track users",
    value_str: '-',
    time: new Date().toLocaleString(),
    small_icon: "ti-time",
    enabled: true
  }

  overview_2 = {
    icon: "ti-control-shuffle",
    icon_color: "icon-danger",
    title: "No. Tracks",
    value_str: '-',
    time: new Date().toLocaleString(),
    small_icon: "ti-time",
    enabled: true
  }

  overview_3 = {
    icon: "ti-microphone",
    icon_color: "icon-warning",
    title: "Last Glob. Leq",
    value_str: '-',
    time: new Date().toLocaleString(),
    small_icon: "ti-time",
    enabled: true
  }
  
  overview_4 = {
    icon: "ti-face-smile",
    icon_color: "icon-info",
    title: "Last Pleas.",
    value_str: '-',
    time: new Date().toLocaleString(),
    small_icon: "ti-time",
    enabled: true
  }

  noiseCapture;
  constructor(private zoneService:ZoneService){
    this.noiseCapture = "";
  }

  ngOnInit(){
    this.getSoundPathOverview();
    setInterval(() => {
      this.getSoundPathOverview();
    }, 60000);
  }

  getSoundPathOverview(){
    let sub = this.zoneService.getsoundPathsMeta().subscribe(data => {
      let d: any = data;
      if(d){
        this.overview_1.value_str = d.numberOfUsers + "";
        this.overview_1.time = new Date(d.timestamp).toLocaleString();
  
        this.overview_2.value_str = d.numberOfTracks + "";
        this.overview_2.time = new Date(d.timestamp).toLocaleString(); // moment.utc(d.timestamp).format('DD/MM/YYYY, HH:mm');
  
        this.overview_3.value_str = Math.round(d.lastLeqMean) + " dB";
        this.overview_3.time = new Date(d.timestamp).toLocaleString();
  
        this.overview_4.value_str = d.lastPleasentness ? d.lastPleasentness + " %" : "-";
        this.overview_4.time = new Date(d.timestamp).toLocaleString();
      }
    }, error => {
      console.log('Error getting sound path meta data', error);
    }); 
    this.subscriptions.push(sub); 
  }

  ngOnDestroy(): void {
    // Unsubscribe to all
    for (let i = 0; i < this.subscriptions.length; i++) {
      this.subscriptions[i].unsubscribe();
    }
  }
  
}
