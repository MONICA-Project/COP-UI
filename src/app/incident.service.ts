import { environment } from 'environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

@Injectable()
export class IncidentService {
  // endpoint = 'https://portal.monica-cloud.eu/cop/api/';
  // endpoint = 'https://portal.monica-cloud.eu/cop/api/';
  constructor(private http: HttpClient) { }

  // getIncidents(type, status) {
  //   let url = environment.apiUrl + 'incidents?type=' + type + '&status=' + status;
  //   return this.http.get(encodeURI(url));
  // }

  getIncidents(type, status, take, skip) {
    let url = environment.apiUrl + 'incidents?type=' + type + '&status=' + status + '&take=' + take + '&skip=' + skip;
    return this.http.get(encodeURI(url));
  }

  getIncidentById(id){
    let url = environment.apiUrl + 'incident/' + id;
    return this.http.get(url); 
  }

  updateIncident(updatedIncident){
    // console.log("Incident to update", updatedIncident);
    let url = environment.apiUrl + 'incident/' + updatedIncident.incidentid;
    return this.http.put(encodeURI(url), updatedIncident); 
  }

  // SOUND ALERTS
  getSoundIncidents(type){
    let url = environment.apiUrl + 'proacousticfeedback?feedbackType=' + type;//Low%20freq%20distortion%20';
    return this.http.get(encodeURI(url)); 
  }

  getSoundFeedbackTypes(){
    let url = environment.apiUrl + 'proacousticfeedbacktypes'; 
    return this.http.get(url); 
  }

  createWindIncident(pos, time, desc, value){
    let inc = {
      "description": desc,
      "type": "Wind",
      "position": JSON.stringify(pos),
      "prio": 3,
      "status": "ONGOING",
      "probability": 80,
      "interventionplan": "",
      "incidenttime": time,
      "wbid": value,
      "telephone": ""
    }; 
    return this.http.post(environment.apiUrl + 'incident', inc); 
  }
  getMedia(media, mediaType){
    return this.http.get(environment.apiUrl + 'media?media=' + media + '&mediaType=' + mediaType); 
  }

  getImage(media: string, mediaType:string): Observable<Blob> {
    let imageUrl = environment.apiUrl + 'media?media=' + media + '&mediaType=' + mediaType;
    return this.http.get(imageUrl, { responseType: 'blob' });
  }
  
}
