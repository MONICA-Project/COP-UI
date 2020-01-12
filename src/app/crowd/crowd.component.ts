import { AuthGuard } from 'app/auth-guard.service';
import { PersonService } from './../person.service';
import { environment } from './../../environments/environment';
import { WeatherService } from './../weather.service';
import { ZoneService } from './../zone.service';
import { Subscription } from 'rxjs/Subscription';
import { IncidentService } from 'app/incident.service';
import { ThingService } from 'app/thing.service';
import { Component, OnInit } from '@angular/core';
import { Filter } from 'app/map/map.component';
const signalR = require("@aspnet/signalr");

@Component({
  selector: 'crowd',
  templateUrl: './crowd.component.html',
  styleUrls: ['./crowd.component.css']
})
export class CrowdComponent implements OnInit {
  subscriptions: Array<Subscription> = new Array<Subscription>();
  connection;
  connection2;
  zones;
  totalVisitors;
  totalZone;
  activeStaff;
  gatecounts = [];

  selFilters = [
    Filter.Zone,
    Filter.Sensors,
    Filter.Monica,
    Filter.Guards,
  ];

  // overview_1 = {
  //   icon: "ti-user",
  //   icon_color: "icon-warning",
  //   title: "TOTAL VISITORS",
  //   value_str: '-',
  //   time: new Date().toLocaleString(),
  //   small_icon: "ti-time",
  //   enabled: true
  // }

  overview_1 = {
    icon: "ti-user",
    icon_color: "icon-info",
    title: "GATE COUNT CAMS",
    value_str: '3',
    time: new Date().toLocaleString(),
    small_icon: "ti-time",
    enabled: true
  }

  overview_2 = {
    icon: "ti-camera",
    icon_color: "icon-success",
    title: "ACTIVE CAMERAS",
    value_str: '-',
    time: new Date().toLocaleString(),
    small_icon: "ti-time",
    enabled: true
  }

  overview_3 = {
    icon: "ti-user",
    icon_color: "icon-warning",
    title: "CROWD COUNT CAMS",
    value_str: '4',
    time: new Date().toLocaleString(),
    small_icon: "ti-time",
    enabled: true
  }

  overview_4 = {
    icon: "ti-alert",
    icon_color: "icon-danger",
    title: "SECURITY ALERTS",
    value_str: null,
    time: new Date().toLocaleString(),
    small_icon: "ti-time",
    enabled: true
  }

  constructor(private thingService: ThingService,
    private incidentService: IncidentService,
    private zoneService: ZoneService,
    private personService: PersonService,
    private authGuard: AuthGuard) { }

  ngOnInit() {
    this.getIncidentPositions();
    this.updatesIncident();
    this.getZones();
    this.updateZones();
    this.activeCameras();
    this.getGateCounts();
    this.updateGateCount();
    this.authGuard.checkLogin();
  }

  getGateCounts() {
    this.thingService.getAggregate().subscribe(data => {
      let d: any = data;
      for (var i = d.length - 1; i >= 0; i--){
        if(d[i].observations.length > 0 && d[i].observations[0].observationResult){
          let obs = JSON.parse(d[i].observations[0].observationResult);
          this.gatecounts.push({
            id: d[i].id,
            icon: "ti-shift-right-alt",
            icon_color: "icon-success",
            title: d[i].name,
            value_str: obs.result.sum,
            value_in: obs.result.entries,
            value_out: obs.result.exits,
            value_total: obs.result.sum,
            time: new Date(d[i].observations[0].phenomenTime).toLocaleString(),
            small_icon: "ti-time",
            enabled: true
          })
        }
      }
      let gateCountCams = d.length > 0 ? d.length - 1: 0;
      this.overview_1.value_str = gateCountCams + ""; 
      this.overview_3.value_str = 7 + "";
      // this.calcTotal();
    }, error => {
      console.log('Error getting gate counts', error);
    })
  }

  updateGateCount() {
    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(environment.signalRUrl)
        .configureLogging(signalR.LogLevel.Information)
        .build();
      this.connection.start().catch(err => {
        console.log("Reconnect to update gate count", err.toString());
      });
      this.connection.on("PeopleGateCounting", (message) => {
        let msgJson = JSON.parse(message);
        let gc = this.findGateCount(msgJson.thingid);
        if (gc) {
          gc.value_str = Math.round(msgJson.result.sum);
          gc.value_in = Math.round(msgJson.result.entries);
          gc.value_out = Math.abs(Math.round(msgJson.result.exits));
          gc.value_total = Math.round(msgJson.result.sum);

          gc.time = new Date(msgJson.timestamp).toLocaleString();
        }
        // this.calcTotal();
        
      });
    } catch (e) {
      console.log("gate count update error", e);
    }
  }

  findGateCount(id) {
    for (let i = 0; i < this.gatecounts.length; i++) {
      if (this.gatecounts[i].id == id) {
        return this.gatecounts[i];
      }
    }
    return null;
  }

  getZones() {
    let sub = this.zoneService.getZones().subscribe(data => {
      this.zones = data;
    });
    this.subscriptions.push(sub);
  }

  updateZones() {
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
        for (let i = 0; i < this.zones.length; i++) {
          if (this.zones[i].id == msgJson.zoneid) {
            this.zones[i].peoplecount = msgJson.peoplecount;
            this.zones[i].timestamp = msgJson.timestamp;
          }
        }
        // this.calcTotal();
        this.activeCameras();
      });
    } catch (e) {
      console.log("sound chart error", e);
    }
  }

  calcTotal() {
    let total = 0;
    for (let i = 0; i < this.gatecounts.length; i++) {
      let gc = this.gatecounts[i];
      let count = parseInt(gc.value_total);
      if (!isNaN(count) && gc.id != 359) {
        total += count;
      }
    }
    this.overview_1.value_str = total + '';
    this.overview_1.time = new Date().toLocaleString();
  }

  activeCameras() {
    let activerCameras = 0;
    if (this.zones) {
      for (let i = 0; i < this.zones.length; i++) {
        if (this.zones[i].peoplecount != null) {
          activerCameras++;
        }
      }
      this.overview_2.value_str = activerCameras + '/' + this.zones.length;
      this.overview_2.time = new Date().toLocaleString();
    }
  }

  getIncidentPositions() {
    let subI = this.incidentService.getIncidents('', 'ONGOING', '', 0).subscribe(data => {
      let d: any = data;
      this.overview_4.value_str = d.length + "";
      this.overview_4.time = new Date().toLocaleString();
    }, error => {
      console.log("error", error);
    });
    this.subscriptions.push(subI);
  }

  updatesIncident() {
    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(environment.signalRUrl)
        .configureLogging(signalR.LogLevel.Information)
        .build();
      this.connection.start().catch(err => {
        console.log("error", err.toString());
      });

      this.connection.on("Incidents", (message) => {
        this.getIncidentPositions();
      });
    } catch (e) {
      console.log('updatesIncident error', e);
      // stop connection
      this.connection.stop().catch(err => {
        console.log("Stop error", err.toString());
      });
    }
  }

  ngOnDestroy(): void {
    // console.log('Unsubscribe to all');
    for (let i = 0; i < this.subscriptions.length; i++) {
      this.subscriptions[i].unsubscribe();
    }
  }
}
