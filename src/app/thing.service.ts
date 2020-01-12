import { Thing } from './shared/models/thing';
import { environment } from './../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

@Injectable()
export class ThingService {
  // endpoint = 'https://portal.monica-cloud.eu/cop/api/';
  // endpoint = 'https://portal.monica-cloud.eu/cop/api/';
  constructor(private http: HttpClient) { }

  getThingById(id){
    let url = environment.apiUrl + 'things/' + id;
    return this.http.get(url); 
  }

  getThingsWithObservations(id){
    return this.http.get(environment.apiUrl + 'thingsWithObservation/' + id);
  }
  
  getCameras(){
    let url = environment.apiUrl + 'things?thingType=Camera';
    return this.http.get(url); 
  }

  getCameras2(){
    return this.http.get(environment.apiUrl + 'things?thingType=Camera')
      .map(res => Thing.fromJSONArray(res))
  }

  getSoundHeatMap(){
    // return Observable
    // .interval(5000)
    // .mergeMap(() => {
      return this.http.get(environment.apiUrl + 'SoundHeatMapImageInfo');
    // });
    
  }

  getSoundLevels(){
    return this.http.get(environment.apiUrl + 'thingsWithObservation?thingType=Soundmeter'); 
    // return this.http.get('http://localhost:8080/random'); 
  }
  getSoundLevels2(){
    return this.http.get(environment.apiUrl + 'thingsWithObservation?thingType=Soundmeter')
      .map(res => Thing.fromJSONArray(res))
  }

  getCsvFile(exportSettings){
    return this.http.post(environment.apiUrl + 'ExportCsvFile', exportSettings);
  }

  getAutoupdateSound(){
    return Observable
    .interval(60000)
    .mergeMap(() => {
      return this.http.get(environment.apiUrl + 'thingsWithObservation/19'); 
      // return this.http.get('http://localhost:8080/random'); 
      });
  }
  // getSoundValue(d){
  //   try{
  //     let obs = JSON.parse(d[0].observations[0].observationResult); 
  //     console.log(obs.result)
  //     console.log(d[0].name, obs.result.value[0].values[0]);
  //     return d[0].name, obs.result.value[0].values[0]; 
  //   }
  //   catch(e){
  //     console.log('Error in getSoundValue', e); 
  //   }
  // }
  calcSoundLevel(value){
    if(value < 120){
      return "LOW";
    } else if(value > 120 && value < 1000){
      return "MEDIUM";
    } else {
      return "HIGH";
    }
  }

  getFeedback(){
    return this.http.get(environment.apiUrl + 'publicfeedbackAVG');
  }

  getTemperature(){
    return this.http.get(environment.apiUrl + 'thingsWithObservation?thingType=Temperature'); 
  }

  getThingWithObservationById(id){
    return this.http.get(environment.apiUrl + 'thingsWithObservation/' + id); 
  }

  getWindSpeed(){
    return this.http.get(environment.apiUrl + 'thingsWithObservation?thingType=Windspeed'); 
  }
  readWindValue(observationResult){
    let d = JSON.parse(observationResult); 
    console.log('WIND obs', d); 
    return 0; 
  }

  getHeatMap(){
    return this.http.get(environment.apiUrl + 'thingsWithObservation?thingType=SoundHeatmap'); 
  }
  getHeatMapById(id){
    return this.http.get(environment.apiUrl + 'thingsWithObservation/' + id); 
  }
  
  getSoundmeterAggregate(){
    return this.http.get(environment.apiUrl + 'thingsWithObservation?thingType=SoundmeterAggregate'); 
  }

  // Gate count
  getAggregate(){
    let url = environment.apiUrl + 'thingsWithObservation?thingType=Aggregate';
    return this.http.get(url);
  }
}
