import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class WeatherService {
  // endpoint = 'https://portal.monica-cloud.eu/cop/api/';
  constructor(private http: HttpClient) { }

  getWindSpeed(){
    
  }
  getWeather(){
    let url = 'https://samples.openweathermap.org/data/2.5/weather?q=London,uk&appid=b6907d289e10d714a6e88b30761fae22';
    return this.http.get(url); 
  }
}
