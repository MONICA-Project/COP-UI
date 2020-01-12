import { Subscription } from 'rxjs/Subscription';
import { Component, OnInit, Input } from '@angular/core';
import { IncidentService } from 'app/incident.service';

@Component({
  selector: 'incident-details',
  templateUrl: './incident-details.component.html',
  styleUrls: ['./incident-details.component.css']
})
export class IncidentDetailsComponent implements OnInit {
  @Input("id") id;
  incident;
  subscriptions: Array<Subscription> = new Array<Subscription>();
  
  constructor(private incidentService: IncidentService) { }

  ngOnInit() {
    console.log("Selected id",this.id); 
    let subI = this.incidentService.getIncidentById(this.id).subscribe(data => {
      
      // this.incident.markers = [{title: 'Start', pos: new google.maps.LatLng(d.latStart, d.lonStart)},
      // {title: 'End', pos: new google.maps.LatLng(d.latEnd, d.lonEnd)}];
      let d:any = data;
      this.incident = d; 
      let interPlan = JSON.parse(d.interventionplan);
      this.incident.circles =[]; // [{title: 'Hello', pos: new google.maps.LatLng(40.565549, 22.995280)}]; 
      this.incident.center = ""; 
      let a = [];
      for(let i = 0; i<interPlan.recommendations.length; i++){
        let r = interPlan.recommendations[i];
        let lanLongSplit = r.latLon.split(',');
        let p = new google.maps.LatLng(lanLongSplit[0], lanLongSplit[1]);
        this.incident.center = p; 
        let c = {
          title: r.recommendation, 
          pos: p,
          radius: r.cellSize
        }
        this.incident.circles.push(c);
      }
    });
    this.subscriptions.push(subI);
  }
  
  ngOnDestroy(): void {
    // console.log('Unsubscribe to all');
    for(let i = 0; i < this.subscriptions.length; i++){
      this.subscriptions[i].unsubscribe();
    }
  }

  resolveIncident(incident){
    let updateIncident = {
      "incidentid": incident.incidentid,
      "description": incident.description,
      "type": incident.type,
      "position": incident.position,
      "prio": incident.prio,
      "status": "RESOLVED",
      "probability": incident.probability,
      "interventionplan":incident.interventionplan,
      "incidenttime": incident.incidenttime
    };
    console.log("Resolve incident", updateIncident);
    let sub = this.incidentService.updateIncident(updateIncident).subscribe(resp =>{
      console.log("INCIDENT WAS RESOLVED", resp);
    });
    this.subscriptions.push(sub);
  }

  dismissIncident(incident){
    let updateIncident = {
      "incidentid": incident.incidentid,
      "description": incident.description,
      "type": incident.type,
      "position": incident.position,
      "prio": incident.prio,
      "status": "DISMISSED",
      "probability": incident.probability,
      "interventionplan":incident.interventionplan,
      "incidenttime": incident.incidenttime
    };
    console.log("Resolve incident", updateIncident);
    let sub = this.incidentService.updateIncident(updateIncident).subscribe(resp =>{
      console.log("INCIDENT WAS DISMISSED", resp);
    });
    this.subscriptions.push(sub);
  }
}
