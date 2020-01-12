import { environment } from './../../environments/environment';
import { IncidentService } from './../incident.service';
import { Component, OnInit, Input } from '@angular/core';
import { ThingService } from 'app/thing.service';
const signalR = require("@aspnet/signalr");

@Component({
  selector: 'wind-speed',
  templateUrl: './wind-speed.component.html',
  styleUrls: ['./wind-speed.component.css']
})
export class WindSpeedComponent implements OnInit {
  @Input('values') values: any;
  // signalrEndpoint = 'https://portal.monica-cloud.eu/DOM/cop/hub/signalR/wearableupdate';
  connection;
  // msVal = 3.3390016936067135;
  bftVal; // = this.convertToBftScale(this.msVal);
  bftClass ; //= this.getBftColor(this.bftVal);
  windStrength = [
    'Windstille, Flaute', 
    'Leiser Zug', 
    'Leichte Brise', 
    'Schwache Brise', 
    'Mäßige Brise', 
    'Frische Brise, Frischer Wind',
    'Starker Wind',
    'Steifer Wind',
    'Stürmischer Wind',
    'Sturm',
    'Schwerer Sturm',
    'Orkanartiger Sturm',
    'Orkan'
  ];
  valText = this.windStrength[this.bftVal];
  valueWithUnit: (value: number) => string;

  constructor(private incidentService:IncidentService, private thingService:ThingService) {}

  randomVal(){
    this.values.value = Math.random() * 50;
    this.values.timestamp = new Date(); 
    this.setup();
  }

  
  updateWindspeed(){
      try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(environment.signalRUrl)
        .configureLogging(signalR.LogLevel.Information)
        .build();

      this.connection.start().catch(err => {
        console.log("Reconnect to update windspeed" + this.values.id, err.toString());
      });
      
      this.connection.on("WindUpdate", (message) => {
        let msgJson = JSON.parse(message);
        console.log('WIND SIGNALR', msgJson); 
        if(msgJson.thingid == this.values.id){
          this.values.value = msgJson.value;
          this.values.timestamp = msgJson.timestamp;
          this.setup();
        }
      });
    } catch (e) {
      console.log("sound chart error", e);
    }
  }
  
  getBftColor(bftVal){
    if(bftVal < 6){
      return 'green';
    } else if(bftVal >= 6 && bftVal < 8){
      return 'yellow';
    } else if(bftVal >= 8 && bftVal < 10){
      return 'orange';
    } else if(bftVal >= 10 && bftVal < 11){
      return 'red';
    } else if(bftVal >= 11){
      return 'darkred';
    }
  }

  convertToBftScale(meterPerSecond){
    if(meterPerSecond < 0.5){
      return 0;
    } else if(meterPerSecond > 0.5 && meterPerSecond <= 1.5){
      return 1;
    } else if(meterPerSecond > 1.5 && meterPerSecond <= 3.3){
      return 2;
    } else if(meterPerSecond > 3.3 && meterPerSecond <= 5.5){
      return 3;
    } else if(meterPerSecond > 5.5 && meterPerSecond <= 7.9){
      return 4;
    } else if(meterPerSecond > 7.9 && meterPerSecond <= 10.7){
      return 5;
    } else if(meterPerSecond > 10.7 && meterPerSecond <= 13.8){
      return 6;
    } else if(meterPerSecond > 13.8 && meterPerSecond <= 17.1){
      return 7;
    } else if(meterPerSecond > 17.1 && meterPerSecond <= 20.7){
      return 8;
    } else if(meterPerSecond > 20.7 && meterPerSecond <= 24.4){
      return 9;
    } else if(meterPerSecond > 24.4 && meterPerSecond <= 28.4){
      return 10;
    } else if(meterPerSecond > 28.4 && meterPerSecond <= 32.6){
      return 11;
    } else if(meterPerSecond > 32.7){
      return 12;
    }
  }

  setup(){
    this.bftVal = this.convertToBftScale(this.values.value);
    let overLimit = this.checkLimits(this.bftVal);
    if(!overLimit) this.clearStoredAlerts(); 
    this.valText = this.windStrength[this.bftVal]; 
    this.bftClass = this.getBftColor(this.bftVal);
  } 
  ngOnInit() {
    this.valueWithUnit = function(value: number): string {
      return `${Math.round(value)} Bft`;
    };
  
    console.log('WIND VALUES', this.values); 
    // this.msVal = this.values.value;
    this.setup(); 
    this.updateWindspeed(); 
  }

  checkLimits(bft) {
    let foundLimit;
    for (let i = 0; i < this.values.limits.length; i++) {
      let lm = this.values.limits[i];
      if (bft >= lm.limit ) {
        foundLimit = lm; 
      } 
    }
    if(foundLimit && !this.checkAlert(foundLimit.message)){
      // console.log('WIND ALERT!', foundLimit);
      this.createAlert(foundLimit.message);
    }
    return foundLimit; 
  }

  checkAlert(msg){
    let al = localStorage.getItem('created_wind_alert_' + this.values.id);
    if(al && al == msg){
      // console.log('Already created wind alert', al);
      return true;
    } else {
      // console.log('Wind Alert not created yet', al);
      return false; 
    }
  }

  createAlert(message){
    console.log('CREATE WIND alert with msg', this.bftVal, message); 
    localStorage.setItem('created_wind_alert_' + this.values.id, message);
    // Create wind alert
    let position = [[[this.values.lat],[this.values.lon]]]; 
    this.incidentService.createWindIncident(position, this.values.timestamp, message, this.bftVal + ' Bft').subscribe(resp => {
      // console.log('Created wind alert', resp);
      return true;
    }, error => {
      console.log('Error creating wind alert', error);
      return false; 
    });
  }

  clearStoredAlerts() {
    // console.log('Removing localstorage wind alerts'); 
    localStorage.removeItem('created_wind_alert_' + this.values.id);
  }
}
