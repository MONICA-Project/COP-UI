import { environment } from './../../environments/environment';
import { Subscription } from 'rxjs/Subscription';
import { ZoneService } from './../zone.service';
import { Component, OnInit } from '@angular/core';
const signalR = require("@aspnet/signalr");

@Component({
  selector: 'zone-capacity',
  templateUrl: './zone-capacity.component.html',
  styleUrls: ['./zone-capacity.component.css']
})
export class ZoneCapacityComponent implements OnInit {
  subscriptions: Array<Subscription> = new Array<Subscription>();
  constructor(private zoneService: ZoneService) { }
  zones;
  totalZone = {
    peoplecount:0,
    timestamp: new Date(),
    fill: 0,
    capacity: 0
  };
  connection;

  ngOnInit() {
    this.setup(); 
    this.updates();
  }

  setup(){
    let sub = this.zoneService.getZones().subscribe(data => {
      this.zones = data; 
      for (let z = 0; z < this.zones.length; z++) {
          // Total calculations
          this.totalZone.peoplecount = this.zones[z].peoplecount != null ? this.totalZone.peoplecount + this.zones[z].peoplecount : this.totalZone.peoplecount;
          this.totalZone.timestamp = new Date();
          this.totalZone.capacity = this.zones[z].capacity != null ? this.totalZone.capacity + this.zones[z].capacity : this.totalZone.capacity;
          this.totalZone.fill = this.getFill(this.totalZone.peoplecount, this.totalZone.capacity);

          // Zone
          this.zones[z].fill = this.getFill(this.zones[z].peoplecount, this.zones[z].capacity);
          this.zones[z].timestamp = new Date();
      }
    });
    this.subscriptions.push(sub); 
  }

  test(){
    // Use this to update values from signal R
    let latest = {"type":"peoplecountupdate","zoneid":8, "peoplecount": 1200, "timestamp": "2018-06-30T10:06:59"};
    this.updateZone(latest);
  }

  updates() {
    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(environment.signalRUrl)
        .configureLogging(signalR.LogLevel.Information)
        .build();

      this.connection.start().catch(err => {
        console.log("Reconnect to update zone", err.toString());
      });
      
      this.connection.on("ZoneUpdate", (message) => {
        let msgJson = JSON.parse(message);
          this.updateZone(msgJson);
          this.updateTotal(msgJson);
      });
    } catch (e) {
      console.log("sound chart error", e);
    }
  }

  updateZone(latest){
    for(let p = 0; p<this.zones.length; p++){
      if(this.zones[p].id == latest.zoneid){
        // // Update total
        // this.totalZone.peoplecount = this.zones[p].peoplecount != null ? this.totalZone.peoplecount + this.zones[p].peoplecount : this.totalZone.peoplecount;
        // this.totalZone.timestamp =  latest.timestamp;
        // this.totalZone.fill = this.getFill(this.totalZone.peoplecount,this.totalZone.capacity);

        // Update zone
        this.zones[p].peoplecount = latest.peoplecount;
        this.zones[p].timestamp = latest.timestamp;
        this.zones[p].fill = this.getFill(latest.peoplecount, this.zones[p].capacity);
      }
    }
  }

  updateTotal(updatedZone) {
    let totalCount = 0;
    for (let i = 0; i < this.zones.length; i++) {
      if (this.zones[i].id == updatedZone.zoneid) {
        totalCount = totalCount + updatedZone.peoplecount;
      } else {
        totalCount = totalCount + this.zones[i].peoplecount;
      }
      this.totalZone.peoplecount = totalCount;
      this.totalZone.fill = this.getFill(this.totalZone.peoplecount, this.totalZone.capacity);
    }
  }

  getProgressBarColor(fill){
    let c = ''; 
    if(fill){
      if(fill >= 0 && fill <63){
        c = 'progress-bar-success';
    } else if(fill >= 63 && fill <100){
        c = 'progress-bar-warning'
      } else if (fill >= 100){
        c = 'progress-bar-danger'
      }
    }
    return c;
  }

  

  showProgressBar(z){
    let show = true; 
    if(z.id == 1123){
      show = false;
    } else if(z.id == 1120){
      show = false; 
    }
    return show; 
  }

  getFill(count, capacity){
    let fill = 0; 
    if(capacity && count){
      fill = capacity > 0 ? Math.round((count / capacity) * 100) : 0; 
    }
    return fill;
    
  }

  ngOnDestroy(): void {
    // console.log('Unsubscribe to all');
    for(let i = 0; i < this.subscriptions.length; i++){
      this.subscriptions[i].unsubscribe();
    }

    // stop connection
    this.connection.stop().catch(err => {
      console.log("Stop error", err.toString());
    });
  }

}
