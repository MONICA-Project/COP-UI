import { Subscription } from 'rxjs/Subscription';
import { ThingService } from 'app/thing.service';
import { Component, OnInit } from '@angular/core';
import { environment } from './../../environments/environment';
const signalR = require("@aspnet/signalr");


@Component({
  selector: 'app-audience',
  templateUrl: './audience.component.html',
  styleUrls: ['./audience.component.css']
})
export class AudienceComponent implements OnInit {
  stages = []; // [{name:'Stage 1', id:100, results:[]}, {name:'Stage 2', id:101}, {name:'Stage 3', id:102}]; //
  subscriptions: Array<Subscription> = new Array<Subscription>();
  connection;
  constructor(private thingService:ThingService){}
  ngOnInit(){
    let sub = this.thingService.getSoundmeterAggregate().subscribe(data => { 
      let d:any = data; 
      
      for(let i = 0; i<d.length; i++){
        let a = d[i];
        let n:String = a.name;
        if(n.includes('audience') || n.includes('audinece')){
          console.log('audience getSoundmeterAggregate', a);
          // this.stages = d;
          let obs = a.observations[0];
          let valsJson = JSON.parse(obs.observationResult);
          this.handleStage(valsJson);
        }
      }
      console.log('GROUPED BY STAGE', this.stages);
      // console.log('getSoundmeterAggregate', data);
    }, error => { 
      console.log('getSoundmeterAggregate error', error);
    });

    // this.updateStages(); 
  }

  handleStage(valsJson){
    let stageName = valsJson.result.area;
    let storedStage = this.getStage(stageName);
    if(storedStage){
      // console.log('Found stored stage', storedStage);
      let hasMeas = this.hasMeasurementType(storedStage.results, valsJson);
      if(!hasMeas){
        storedStage.results.push(valsJson);
      }
      
      // console.log('hasMeasurementType', , valsJson);
    } else {
      // console.log('New stage');
      storedStage = {name:stageName, id:valsJson.result.SLM, results:[valsJson]};
      this.stages.push(storedStage);
    }
  }

  hasMeasurementType(arr, valsJson){
    for(let i = 0; i<arr.length; i++){
      let mt = arr[i].result.measurement_type;
      if(valsJson.result.measurement_type == mt){
        return true;
      }
    }
    false;
  }

  updateStages() {
    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(environment.signalRUrl)
        .configureLogging(signalR.LogLevel.Information)
        .build();

      this.connection.start().catch(err => {
        console.log("Reconnect to update aggr", err.toString());
      });

      this.connection.on("AggregateUpdate", (message) => {
        let msgJson = JSON.parse(message);
        
        if(msgJson.result){
          let SLM = msgJson.result.SLM;
          let measurement = msgJson.result.measurement;
          let measurement_type = msgJson.result.measurement_type;
          if(measurement == "audience"){
            // Look for stages that where missed before
            this.handleStage(msgJson);
          }
        }
        // Push to series array for each chart
      });
    } catch (e) {
      console.log("sound chart error", e);
    }
  }

  getStage(name){
    for(let i=0; i<this.stages.length; i++){
      if(this.stages[i].name == name){
        return this.stages[i];
      }
    }
    return null; 
  }
}
