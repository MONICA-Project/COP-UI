import { environment } from './../../environments/environment';
import { Subscription } from 'rxjs/Subscription';
import { IncidentService } from 'app/incident.service';
import { Component, OnInit, isDevMode } from '@angular/core';
import { Incident } from 'app/shared/models/incident';
import { DomSanitizer } from '@angular/platform-browser';
import { SafeResourceUrl } from '@angular/platform-browser/src/security/dom_sanitization_service';
import { PagerService } from 'app/pager.service';
const signalR = require("@aspnet/signalr");
import * as moment from 'moment';
import 'moment/locale/fr';

@Component({
  selector: 'crowd-incidents',
  templateUrl: './crowd-incidents.component.html',
  styleUrls: ['./crowd-incidents.component.css']
})
export class CrowdIncidentsComponent implements OnInit {
  subscriptions: Array<Subscription> = new Array<Subscription>();
  incidents = [];
  connection;
  imageBlobUrl: string;
  videoUrl: SafeResourceUrl;
  blobs: string[] = [];
  videos: SafeResourceUrl[] = [];
  audios: SafeResourceUrl[] = [];
  totalIncidents;
  pages;
  baseUrl = '';
  loader = true; 

  // array of all items to be paged
  private allItems: any[];

  // pager object
  pager: any = {};

  // paged items
  pagedItems: any[];

  // signalrEndpoint = 'https://portal.monica-cloud.eu/DOM/cop/hub/signalR/wearableupdate';
  constructor(private incidentService: IncidentService, private sanitizer: DomSanitizer, private pagerService: PagerService) { 
    if (!isDevMode())
      this.baseUrl = environment.baseUrl;
  }

  ngOnInit() {
    // this.countAllIncidents();
    // this.getIncidentPositions();
    this.updatesIncident();
  }

  test() {
    // let i = { "type": "statusupdate", "incidentid": 14, "status": "BOO!", "prio": 4, "timestamp": "2018-06-30T10:06:59" }
    // this.updateStatusIncident(i);

    var audio = new Audio();
    audio.src = this.baseUrl + '/assets/test.mp3';
    audio.load();
    audio.play();
  }

  createImageFromBlob(image: Blob, index) {
    let reader = new FileReader();
    reader.addEventListener("load", () => {
      this.blobs[index] = (reader.result);
      console.log('Done reading image');
    }, false);
    if (image) {
      reader.readAsDataURL(image);
      console.log('Done readAsDataURL');
    }
  }
  countAllIncidents() {
    let subI = this.incidentService.getIncidents('', 'ONGOING', '', 0).subscribe(data => {
      let d: any = data;
      // set items to json response
      this.allItems = d;
      // initialize to page 1
      this.setPage(1);
    });
  }
  setPage(page: number) {
    if (page < 1 || page > this.pager.totalPages) {
      return;
    }

    // get pager object from service
    this.pager = this.pagerService.getPager(this.allItems.length, page);

    // get current page of items
    this.getIncidentPositions(this.pager.startIndex, this.pager.endIndex + 1); //this.allItems.slice(this.pager.startIndex, this.pager.endIndex + 1);
  }

  getIncidentPositions(skip, take) {
    this.loader = true; 
    let subI = this.incidentService.getIncidents('', 'ONGOING', take, skip).subscribe(data => {
      let d: any = data;
      this.incidents = d;
      let inc = new Incident();
      
      for (let i = 0; i < this.incidents.length; i++) {
        let incident = this.incidents[i];
        this.incidents[i].index = i;
        this.incidents[i].incidenttime = moment.utc(incident.incidenttime);
        if (incident.type == "FieldReport" && incident.additionalMedia != null && incident.mediaType != null) {
          if (incident.mediaType == "picture") {
            this.incidents[i].imageIsLoading = true;
            this.incidentService.getImage(incident.additionalMedia, incident.mediaType).subscribe(data => {
              this.createImageFromBlob(data, i);
              this.incidents[i].imageIsLoading = false;
            }, error => {
              console.log('Error getting media', error);
              this.incidents[i].imageIsLoading = false;
            })
          } else if (incident.mediaType == "video") {
            this.incidentService.getImage(incident.additionalMedia, incident.mediaType).subscribe(data => {
              let url = URL.createObjectURL(data);
              this.videos[i] = this.sanitizer.bypassSecurityTrustUrl(url);
            }, error => {
              console.log('Error getting media', error);
            });
          } else if(incident.mediaType == "audio"){
            this.incidentService.getImage(incident.additionalMedia, incident.mediaType).subscribe(data => {
              let url = URL.createObjectURL(data);
              this.audios[i] = this.sanitizer.bypassSecurityTrustUrl(url);
            }, error => {
              console.log('Error getting media', error);
            })
          }
        }

        let pos = JSON.parse(this.incidents[i].position);
        if (pos[0].length == 2) {
          this.incidents[i].latLng = new google.maps.LatLng(parseFloat(pos[0][0]), parseFloat(pos[0][1]));
          this.incidents[i].isPoint = true;
        } else {
          this.incidents[i].isPoint = false;
        }

        this.loader = false;
      }
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
        let msgJson = JSON.parse(message);
        if (msgJson.type == "statusupdate") {
          this.updateStatusIncident(msgJson);
        } else if (msgJson.type == "newincident") {
          this.addNewIncident(msgJson.incidentid);
        }
      });
    } catch (e) {
      if (typeof (this.connection) != 'undefined') {
        // stop connection
        this.connection.stop().catch(err => {
          console.log("Stop error", err.toString());
        });
      }
    }
  }

  updateStatusIncident(incidentObj) {
    for (let i = 0; i < this.incidents.length; i++) {
      if (incidentObj.incidentid === this.incidents[i].incidentid) {
        this.incidents[i].status = incidentObj.status;
        this.incidents[i].prio = incidentObj.prio;
      }
    }
  }

  addNewIncident(id) {
    let sub = this.incidentService.getIncidentById(id).subscribe(data => {
      this.incidents.push([data]);
    }, error => {
      console.log("error", error);
    });
    this.subscriptions.push(sub);
  }

  ngOnDestroy(): void {
    // console.log('Unsubscribe to all');
    for (let i = 0; i < this.subscriptions.length; i++) {
      this.subscriptions[i].unsubscribe();
    }

    if (typeof (this.connection) != 'undefined') {
      // stop connection
      this.connection.stop().catch(err => {
        console.log("Stop error", err.toString());
      });
    }
  }

  resolveAll() {
    for (let i = 0; i < this.incidents.length; i++) {
      this.resolveIncident(this.incidents[i]);
    }
  }

  dismissAll() {
    for (let i = 0; i < this.incidents.length; i++) {
      this.dismissIncident(this.incidents[i]);
    }
  }

  resolveIncident(incident) {
    let updateIncident = {
      "incidentid": incident.incidentid,
      "description": incident.description,
      "type": incident.type,
      "position": incident.position,
      "prio": incident.prio,
      "status": "RESOLVED",
      "probability": incident.probability,
      "interventionplan": incident.interventionplan,
      "incidenttime": incident.incidenttime
    };
    console.log("Resolve incident", updateIncident);
    let sub = this.incidentService.updateIncident(updateIncident).subscribe(resp => {
      console.log("INCIDENT WAS RESOLVED", resp);
    });
    this.subscriptions.push(sub);
  }

  dismissIncident(incident) {
    let updateIncident = {
      "incidentid": incident.incidentid,
      "description": incident.description,
      "type": incident.type,
      "position": incident.position,
      "prio": incident.prio,
      "status": "DISMISSED",
      "probability": incident.probability,
      "interventionplan": incident.interventionplan,
      "incidenttime": incident.incidenttime
    };
    console.log("Resolve incident", updateIncident);
    let sub = this.incidentService.updateIncident(updateIncident).subscribe(resp => {
      console.log("INCIDENT WAS DISMISSED", resp);
    });
    this.subscriptions.push(sub);
  }

  getPosition(positionStr) {
    let latLng;
    let pos = JSON.parse(positionStr);
    // console.log('pos', pos);
    if (pos.length == 2)
      latLng = new google.maps.LatLng(pos[0][0], pos[0][1]);
    return latLng; //new google.maps.LatLng(45.092869, 7.664130);//pos[0][0] //
  }

  getLon(positionStr) {
    let pos = JSON.parse(positionStr);
    return pos[0][1] //new google.maps.LatLng(45.092869, 7.664130);
  }

  getLabelColor(status) {
    if (status == "ONGOING") {
      return 'label-danger';
    } else if (status == "DISMISSED") {
      return 'label-warning';
    } else if (status == "RESOLVED") {
      return 'label-success';
    }
  }

  map;
  centerTest;
  onMapReady(map) {
    this.map = map;
    this.centerTest = new google.maps.LatLng(45.092869, 7.664130);
    this.countAllIncidents();
  }

  reload() {
    this.countAllIncidents();
  }

  onIdle(event) { }

  onMapClick(event) { }
}
