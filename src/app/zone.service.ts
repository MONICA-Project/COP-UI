import { environment } from './../environments/environment';
import { Injectable, isDevMode } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class ZoneService {
  // endpoint = 'https://portal.monica-cloud.eu/cop/api/';
  // endpoint = 'https://portal.monica-cloud.eu/cop/api/';
  baseUrl = '';
  constructor(private http: HttpClient) { 
    if (!isDevMode())
      this.baseUrl = environment.baseUrl;
  }

  getAllZones(){
    let url = environment.apiUrl + 'zones';
    return this.http.get(url);
  }
  
  getEvent(){
    let url = environment.apiUrl + 'event';
    return this.http.get(url);
  }
  getZoneById(id) {
    let url = environment.apiUrl + 'zone/' + id;
    return this.http.get(url);
  }
  getTotalZone(){
    let url = environment.apiUrl + 'zones?zoneType=Event%20Area';
    return this.http.get(url);
  }
  getZones(){
    let url = environment.apiUrl + 'zones?zoneType=Zone';
    return this.http.get(url);
  }
  getBeerStands() {
    let url = environment.apiUrl + 'zones?zoneType=Beer%20Stand';
    return this.http.get(url);
  }

  getToilets() {
    let url = environment.apiUrl + 'zones?zoneType=Toilets';
    return this.http.get(url);
  }

  getHandicapToilets() {
    let url = environment.apiUrl + 'zones?zoneType=Handicapp%20Toilet';
    return this.http.get(url);
  }

  getStages() {
    let url = environment.apiUrl + 'zones?zoneType=Stage';
    return this.http.get(url);
  }

  getEntrance(){
    let url = environment.apiUrl + 'zones?zoneType=Entrance';
    return this.http.get(url); 
  }

  getCommandCenter() {
    let url = environment.apiUrl + 'zones?zoneType=Command%20Center';
    return this.http.get(url);
  }

  getEmergencyExit() {
    let url = environment.apiUrl + 'zones?zoneType=Emergency%20Exit';
    return this.http.get(url);
  }

  getFirstAidPoint() {
    let url = environment.apiUrl + 'zones?zoneType=First%20Aid%20Point';
    return this.http.get(url);
  }

  getCocktailStand() {
    let url = environment.apiUrl + 'zones?zoneType=Cocktail%20Stand';
    return this.http.get(url);
  }

  getRides() {
    let url = environment.apiUrl + 'zones?zoneType=Ride';
    return this.http.get(url);
  }

  getFastFood() {
    let url = environment.apiUrl + 'zones?zoneType=Fast%20Food';
    return this.http.get(url);
  }

  getRestaurants() {
    let url = environment.apiUrl + 'zones?zoneType=Restaurant';
    return this.http.get(url);
  }

  getAttractions() {
    let url = environment.apiUrl + 'zones?zoneType=Attraction';
    return this.http.get(url);
  }

  getShops() {
    let url = environment.apiUrl + 'zones?zoneType=Shop';
    return this.http.get(url);
  }

  getATM() {
    let url = environment.apiUrl + 'zones?zoneType=ATM';
    return this.http.get(url);
  }

  getCrowdHeatmap(zoneId){
    let url = environment.apiUrl + 'ZonePeopleHeatMapImageInfo/' + zoneId;
    return this.http.get(url); 
  }

  getQuietZones(){
    let url = environment.apiUrl + 'zones?zoneType=Quiet%20Zone';
    return this.http.get(url); 
  }
  
  getEventMapPolyZone(){
    let url = environment.apiUrl + 'zones?zoneType=EventMapPoly';
    return this.http.get(url); 
  }

  getEventMapCircleZone(){
    let url = environment.apiUrl + 'zones?zoneType=EventMapCircle';
    return this.http.get(url); 
  }

  getSoundPaths(){
    return this.http.get(this.baseUrl + '/assets/track.geojson'); 
  }

  getsoundPathsMeta(){
    return this.http.get(environment.apiUrl + 'noiseCapture'); 
  }

  // getZone(){
  //   let url = environment.apiUrl + 'zones?zoneType=Zone';
  //   this.http.get(url); 
  // }

  test(){
    let circles = [
      {
        "id": 0,
        "name": "MICHELS-HURTMANN",
        "description": "Ringwerfen",
        "metadata": "4",
        "type": "EventMapCircle",
        "capacity": null,
        "peoplecount": null,
        "boundingPolygon": [
          [
            50.742392,7.154575
          ]
        ]
      }, {
        "id": 0,
        "name": "WOLTER",
        "description": "Klass. Kinderkarusel",
        "metadata": "6",
        "type": "EventMapCircle",
        "capacity": null,
        "peoplecount": null,
        "boundingPolygon": [
          [
            50.742466,7.154433
          ]
        ]
      }, {
        "id": 0,
        "name": "SCHLEIFER",
        "description": "Nostalgiegeschäf",
        "metadata": "6",
        "type": "EventMapCircle",
        "capacity": null,
        "peoplecount": null,
        "boundingPolygon": [
          [
            50.742567,7.154258
          ]
        ]
      }, {
        "id": 0,
        "name": 'HANSTEIN "COMMANDER"',
        "description": "Shake",
        "metadata": "10",
        "type": "EventMapCircle",
        "capacity": null,
        "peoplecount": null,
        "boundingPolygon": [
          [
            50.74280,7.15557
          ]
        ]
      }, {
        "id": 0,
        "name": 'HANSTEIN',
        "description": "Wellenflieger",
        "metadata": "10",
        "type": "EventMapCircle",
        "capacity": null,
        "peoplecount": null,
        "boundingPolygon": [
          [
            50.74346,7.156126
          ]
        ]
      }, {
        "id": 0,
        "name": 'KINZLER "BREAKDANCE"',
        "description": "Breakdance",
        "metadata": "9",
        "type": "EventMapCircle",
        "capacity": null,
        "peoplecount": null,
        "boundingPolygon": [
          [
            50.743674,7.155390
          ]
        ]
      }, {
        "id": 0,
        "name": 'FRITZ',
        "description": "Ausschank",
        "metadata": "2",
        "type": "EventMapCircle",
        "capacity": null,
        "peoplecount": null,
        "boundingPolygon": [
          [
            50.743606,7.156349
          ]
        ]
      }, {
        "id": 0,
        "name": 'PETTER',
        "description": "Veg. Imbiss",
        "metadata": "2",
        "type": "EventMapCircle",
        "capacity": null,
        "peoplecount": null,
        "boundingPolygon": [
          [
            50.744137,7.155938
          ]
        ]
      }, {
        "id": 0,
        "name": 'MARKMANN "OCTOPUSSY"',
        "description": "Polyp",
        "metadata": "9",
        "type": "EventMapCircle",
        "capacity": null,
        "peoplecount": null,
        "boundingPolygon": [
          [
            50.744220,7.155176
          ]
        ]
      }, {
        "id": 0,
        "name": 'MEESS',
        "description": "Mini-Kettenflieger",
        "metadata": "4",
        "type": "EventMapCircle",
        "capacity": null,
        "peoplecount": null,
        "boundingPolygon": [
          [
            50.744136,7.154031
          ]
        ]
      }, {
        "id": 0,
        "name": 'HARDT',
        "description": "Ringwerfen",
        "metadata": "2",
        "type": "EventMapCircle",
        "capacity": null,
        "peoplecount": null,
        "boundingPolygon": [
          [
            50.744201,7.153947
          ]
        ]
      }, {
        "id": 0,
        "name": 'SCHLEIFER "FAHRT INS PARADIES"',
        "description": "Nostalgiegeschäf",
        "metadata": "7",
        "type": "EventMapCircle",
        "capacity": null,
        "peoplecount": null,
        "boundingPolygon": [
          [
            50744918,7.153991
          ]
        ]
      }
  ]

};
  
}
