import { ThingService } from 'app/thing.service';
import { Subscription } from 'rxjs/Subscription';
import { Component, OnInit } from '@angular/core';
import { environment } from './../../environments/environment';
const signalR = require("@aspnet/signalr");

@Component({
  selector: 'app-neighbour',
  templateUrl: './neighbour.component.html',
  styleUrls: ['./neighbour.component.css']
})
export class NeighbourComponent implements OnInit {
  neighbours = []; // [{name:'Stage 1', id:100, results:[]}, {name:'Stage 2', id:101}, {name:'Stage 3', id:102}]; //
  subscriptions: Array<Subscription> = new Array<Subscription>();
  connection;

  point_overview = [
    {name: 'Neighbour 1', text1: 'Exceeding : Yes', text2:'Exceed : 3 dB', color:'point-red'},
    {name: 'Neighbour 2', text1: 'Exceeding : No', text2:'Headroom : 2 dB', color:'point-yellow'},
    {name: 'Neighbour 3', text1: 'Exceeding : No', text2:'Headroom : 5 dB', color:'point-green'}
  ];

  Neighbour_1_Laeq_measured:any = {
    "result": {
      "SLM": "MONICA0002_000504",
      "area": "neighbour_1",
      "timestamp": "2019-05-30T12:10:56Z",
      "laeq": 63.55469199097624,
      "laeq_limit_current": 80,
      "laeq_limit_min": 90,
      "measurement": "neighbour",
      "measurement_type": "LAeq"
    }
  }
  Neighbour_1_Oct_measured:any = {
    "result": {
      "SLM": "MONICA0002_000504",
      "area": "neighbour_1",
      "measured": {
        "lc_1K": 44.55712464107973,
        "lc_2K": 40.528962283927676,
        "lc_4K": 44.55712464107973,
        "lc_125": 33.076547827265294,
        "lc_250": 38.245780585325335,
        "lc_500": 41.864996538698065
      },
      "limits_current": {
        "lc_125": 55.0,
        "lc_250": 55.0,
        "lc_500": 55.0,
        "lc_1000": 55.0,
        "lc_2000": 55.0,
        "lc_4000": 55.0
      },
      "limits_min": {
        "lc_125": 65.0,
        "lc_250": 65.0,
        "lc_500": 65.0,
        "lc_1000": 65.0,
        "lc_2000": 65.0,
        "lc_4000": 65.0
      },
      "timestamp": "2019-05-30T08:16:08Z",
      "measurement_type": "Octave",
      "measurement": "neighbour"
    }
  }
  Contribution_stage_1:any = {
    "result": {
      "SLM": "MONICA0008_000320",
      "area": "stage_1",
      "neighbour_1": {
        "laeq": 13.2352323,
        "lc_1K": 14.55712464107973,
        "lc_2K": 10.528962283927676,
        "lc_4K": 13.076547827265294,
        "lc_125": 13.076547827265294,
        "lc_250": 18.245780585325335,
        "lc_500": 11.864996538698065
      },
      "neighbour_2": {
        "laeq": 23.2352323,
        "lc_1K": 24.55712464107973,
        "lc_2K": 20.528962283927676,
        "lc_4K": 23.076547827265294,
        "lc_125": 13.076547827265294,
        "lc_250": 18.245780585325335,
        "lc_500": 21.864996538698065
      },
      "neighbour_3": {
        "laeq": 23.2352323,
        "lc_1K": 44.55712464107973,
        "lc_2K": 40.528962283927676,
        "lc_4K": 23.076547827265294,
        "lc_125": 33.076547827265294,
        "lc_250": 38.245780585325335,
        "lc_500": 41.864996538698065
      },
      "timestamp": "2019-05-30T08:16:08Z",
      "measurement_type": "Contribution",
      "measurement": "neighbour"
    }
  }

  Contribution_stage_2:any = {
    "result": {
      "SLM": "MONICA0010_000349",
      "area": "stage_2",
      "neighbour_1": {
        "laeq": 23.2352323,
        "lc_1K": 24.55712464107973,
        "lc_2K": 20.528962283927676,
        "lc_4K": 23.076547827265294,
        "lc_125": 23.076547827265294,
        "lc_250": 28.245780585325335,
        "lc_500": 21.864996538698065
      },
      "neighbour_2": {
        "laeq": 23.2352323,
        "lc_1K": 24.55712464107973,
        "lc_2K": 20.528962283927676,
        "lc_4K": 23.076547827265294,
        "lc_125": 23.076547827265294,
        "lc_250": 28.245780585325335,
        "lc_500": 21.864996538698065
      },
      "neighbour_3": {
        "laeq": 33.2352323,
        "lc_1K": 34.55712464107973,
        "lc_2K": 30.528962283927676,
        "lc_4K": 33.076547827265294,
        "lc_125": 33.076547827265294,
        "lc_250": 38.245780585325335,
        "lc_500": 31.864996538698065
      },
      "timestamp": "2019-05-30T08:16:08Z",
      "measurement_type": "Contribution",
      "measurement": "neighbour"
    }
  }

  Contribution_stage_3:any = {
    "result": {
      "SLM": "MONICA0009_000415",
      "area": "stage_3",
      "neighbour_1": {
        "laeq": 33.2352323,
        "lc_1K": 34.55712464107973,
        "lc_2K": 30.528962283927676,
        "lc_4K": 33.076547827265294,
        "lc_125": 33.076547827265294,
        "lc_250": 38.245780585325335,
        "lc_500": 31.864996538698065
      },
      "neighbour_2": {
        "laeq": 23.2352323,
        "lc_1K": 24.55712464107973,
        "lc_2K": 20.528962283927676,
        "lc_4K": 23.076547827265294,
        "lc_125": 13.076547827265294,
        "lc_250": 18.245780585325335,
        "lc_500": 21.864996538698065
      },
      "neighbour_3": {
        "laeq": 23.2352323,
        "lc_1K": 44.55712464107973,
        "lc_2K": 40.528962283927676,
        "lc_4K": 23.076547827265294,
        "lc_125": 33.076547827265294,
        "lc_250": 38.245780585325335,
        "lc_500": 41.864996538698065
      },
      "timestamp": "2019-05-30T08:16:08Z",
      "measurement_type": "Contribution",
      "measurement": "neighbour"
    }
  }
  contributionStage1;
  contributionStage2;
  contributionStage3;

  constructor(private thingService:ThingService){}
  ngOnInit(){
    // let n1 = {
    //   name:this.Neighbour_1_Laeq_measured.result.area, 
    //   id:this.Neighbour_1_Laeq_measured.result.SLM, 
    //   results:[this.Neighbour_1_Laeq_measured, this.Neighbour_1_Oct_measured, this.Contribution_stage_1, this.Contribution_stage_2, this.Contribution_stage_3]};

    // this.neighbours.push(n1);

    let sub = this.thingService.getSoundmeterAggregate().subscribe(data => { 
      let d:any = data; 
      console.log('getSoundmeterAggregate', d);
      for(let i = 0; i<d.length; i++){
        let a = d[i];
        let n:String = a.name.toLocaleLowerCase();
        let obs = a.observations[0];
          if(obs && obs.observationResult){
            let valsJson = JSON.parse(obs.observationResult);
            if(n.includes('neighbours') && n.includes('contribution')){
              if(n.toLocaleLowerCase().includes('stage1')){
                this.contributionStage1 = valsJson;
              } else if(n.toLocaleLowerCase().includes('stage2')){
                this.contributionStage2 = valsJson;
              } else if(n.toLocaleLowerCase().includes('stage3')){
                this.contributionStage3 = valsJson;
              }
              // this.stages = d;
              console.log('neighbours contribution', a);
            }  else if(n.includes('neighbours') && n.includes('octave')){
              // this.contributionStage2 = valsJson;
              // console.log('neighbours octave', a);
              this.handleStage(valsJson);
            } else if(n.includes('neighbours') && (n.includes('laeq') || n.includes('lαeq'))) {
              // this.contributionStage3 = valsJson;
              // console.log('neighbours laeq', a);
              this.handleStage(valsJson);
            }
            // console.log('neighbours', valsJson);
            // this.handleStage(valsJson);
          }
      }

      for(let i = 0; i<this.neighbours.length; i++){
        this.neighbours[i].results.push(this.contributionStage1);
        this.neighbours[i].results.push(this.contributionStage2);
        this.neighbours[i].results.push(this.contributionStage3);
      }

      console.log('contributionStage1', this.contributionStage1);
      console.log('contributionStage2', this.contributionStage2);
      console.log('contributionStage3', this.contributionStage3);

      console.log('GROUPED BY NEIGHBOUR', this.neighbours);
      console.log('getSoundmeterAggregate', data);
    }, error => { 
      console.log('getSoundmeterAggregate error', error);
    });

    // this.updateNeighbour(); 
  }

  updateNeighbour() {
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
          if(measurement == "neighbour"){
            // console.log('UPDATE NEIGHBOUR', measurement);
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

  handleStage(valsJson){
    if(valsJson.result){
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
        this.neighbours.push(storedStage);
      }
    }
  }

  hasMeasurementType(arr, valsJson){
    for(let i = 0; i<arr.length; i++){
      let mt = arr[i].result.measurement_type; // Has no results
      console.log('hasMeasurementType', mt);
      if(valsJson.result.measurement_type == mt){
        return true;
      }
    }
    false;
  }

  getStage(name){
    for(let i=0; i<this.neighbours.length; i++){
      if(this.neighbours[i].name == name){
        return this.neighbours[i];
      }
    }
    return null; 
  }

}
