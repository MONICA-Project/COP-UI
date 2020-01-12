import { environment } from './../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Response} from "@angular/http";
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import { Person } from 'app/shared/models/person';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/interval';

@Injectable()
export class PersonService {
  // endpoint = 'https://portal.monica-cloud.eu/cop/api/';
  // endpoint = 'https://portal.monica-cloud.eu/cop/api/';
  
  constructor(private http: HttpClient) { }

  test() {
    return Observable
        .interval(5000)
        .mergeMap(() => {
          return this.http.get('http://localhost:8080/random');
            //.map(res => Person.fromJSONArray(res))
        });
  }

  getAllPeople(){
    return this.http.get(environment.apiUrl + 'peoplewithwearables');
  }
  
  getPersonById(personId){
    return this.http.get(environment.apiUrl + 'person/' + personId);
  }
  getPersons(){
    
    return this.http.get(environment.apiUrl + 'persons')
      .map(res => Person.fromJSONArray(res))
  }

  getPoliceAutoUpdate(){
    return Observable
    .interval(10000)
    .mergeMap(() => {
      return this.http.get(environment.apiUrl + 'peoplewithwearables?role=POLICE');
    });
  }

  getParamedicAutoUpdate(){
    return Observable
    .interval(10000)
    .mergeMap(() => {
      return this.http.get(environment.apiUrl + 'peoplewithwearables?role=PARAMEDIC');
    });
  }

  // getCrewAutoUpdate(){
  //   return Observable
  //   .interval(10000)
  //   .mergeMap(() => {
  //     return this.http.get(environment.apiUrl + 'peoplewithwearables?role=Crew');
  //   });
  // }

  getPolice(){
    return this.http.get(environment.apiUrl + 'peoplewithwearables?role=POLICE');
  }

  getParametics(){
    return this.http.get(environment.apiUrl + 'peoplewithwearables?role=PARAMEDIC');
  }

  getCrew(){
    return this.http.get(environment.apiUrl + 'peoplewithwearables?role=CREW');
  }

  // getGuardAutoUpdate(){
  //   return Observable
  //   .interval(10000)
  //   .mergeMap(() => {
  //     return this.http.get(environment.apiUrl + 'peoplewithwearables?role=GUARD');
  //   });
  // }

  getGuard() {
    return this.http.get(environment.apiUrl + 'peoplewithwearables?role=GUARD');
  }

  getMonica(){
    return this.http.get(environment.apiUrl + 'peoplewithwearables?role=MONICA');
  }

  getFireman(){
    return this.http.get(environment.apiUrl + 'peoplewithwearables?role=FIREMEN');
  }

  getSecurity(){
    return this.http.get(environment.apiUrl + 'peoplewithwearables?role=SECURITY');
  }

  getPublicOrderOffice(){
    return this.http.get(environment.apiUrl + 'peoplewithwearables?role=PUBLIC%ORDER%20OFFICE');
  }

  sendMessage(personId, message){
    return this.http.post(environment.apiUrl + 'peoplewithwearables/' + personId + '/SendMessage', message);
  }

  updatePerson(personId, updatedObj){
    console.log('Do update role', updatedObj); 
    return this.http.put(environment.apiUrl + 'person/' + personId, updatedObj); 
  }

  apiLogin(email, pwd){
    let url = environment.apiUrl + 'login';
    return this.http.put(url, {"uid": email,  "pwd": pwd}).toPromise();
  }

  getPersonByWbId(wbid){
    return this.http.get(environment.apiUrl + 'wearables/getPerson/' + wbid); 
  }
}
