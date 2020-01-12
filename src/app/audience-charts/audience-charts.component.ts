import { IncidentService } from 'app/incident.service';
import { Router } from '@angular/router';
import { environment } from './../../environments/environment';
import { Subscription } from 'rxjs/Subscription';
import { ThingService } from 'app/thing.service';
import { Component, OnInit, Input } from '@angular/core';
const signalR = require("@aspnet/signalr");
import * as moment from 'moment';

@Component({
  selector: 'audience-charts',
  templateUrl: './audience-charts.component.html',
  styleUrls: ['./audience-charts.component.css']
})
export class AudienceChartsComponent implements OnInit {
  @Input('obj') obj; 
  options: any;
  options2: any;
  chart: any;
  chart2: any;
  valuesA;//= {soundLevelLimit:0, criticalPoint:0, console:0};
  seriesAConsole = [];
  seriesACritical = [];
  valuesC;// = {soundLevelLimit:0, criticalPoint:0, console:0};
  seriesCConsole = [];
  seriesCCritical = [];
  exceedings = []; 
  // soundLevelLimitA;
  // soundLevelLimitC;
  subscriptions: Array<Subscription> = new Array<Subscription>();
  connection;

  constructor(private thingService: ThingService, private incidentService:IncidentService, private router: Router) { 
    // dBC
    this.options = {
      chart: {
        backgroundColor: '#ffffff',
        type: 'line'
      },
      title: { text: 'dBC' },
      subtitle: {
        text: ''
        // text: 'No data available'
      },
      credits: {
        enabled: false
      },
      // legend: {
      //   enabled: false
      // },
      xAxis: {
        type: 'datetime'
        // labels: {
        //   format: '{value} s'
        // },
        // allowDecimals: false,
        // showLastLabel: true
      },
      yAxis: {
        min: 0,
        max:120,
        title: {
          text: ''
        },
        labels: {
          format: '{value} dB'
        },
        plotLines: [{
          id: 'sound-limit',
          value: 0,
          color: 'red',
          dashStyle: 'shortdash',
          width: 2,
          label: {
            text: 'Limit'
          }
        }]
      },
      tooltip: {
        // headerFormat: '<b>{series.name}</b><br/>',
        // pointFormat: '{point.y} dB',
        crosshairs: true,
        shared: true,
        valueSuffix: ' dB'
      },
      series: [{
        color: '#68B3C8',
        name: 'At Sound engineer’s console',
        data: [], //[5.34, 25.36, 31, 38.99, 55.76, 41.79, 42.77, 19.38, 13.22, 23.45]
      }, {
        color: '#F3BB45',
        name: 'At most critical point in audience (location)',
        data: [], //[5.36, 51, 53.45, 45.76, 61.79, 42.77, 38.99, 39.38, 33.22, 45.34]
      }]
    };
    // dBA
    this.options2 = {
      chart: {
        backgroundColor: '#ffffff',
        type: 'line'
      },
      title: { text: 'dBA' },
      subtitle: {
        text: ''
        // text: 'No data available'
      },
      credits: {
        enabled: false
      },
      // legend: {
      //   enabled: false
      // },
      xAxis: {
        type: 'datetime'
        // labels: {
        //   format: '{value} s'
        // },
        // allowDecimals: false,
        // showLastLabel: true
      },
      yAxis: {
        min: 0,
        max:120,
        title: {
          text: ''
        },
        labels: {
          format: '{value} dB'
        },
        plotLines: [{
          id: 'sound-limit',
          value: 0,
          color: 'red',
          dashStyle: 'shortdash',
          width: 2,
          label: {
            text: 'Limit'
          }
        }]
      },
      tooltip: {
        // headerFormat: '<b>{series.name}</b><br/>',
        // pointFormat: '{point.y} dB',
        crosshairs: true,
        shared: true,
        valueSuffix: ' dB'
      },
      series: [{
        color: '#68B3C8',
        name: 'At Sound engineer’s console',
        data: [], //[35.34, 25.36, 31, 38.99, 45.76, 41.79, 42.77, 19.38, 13.22, 23.45]
      }, {
        color: '#F3BB45',
        name: 'At most critical point in audience (location)',
        data: [], //[45.36, 51, 53.45, 45.76, 41.79, 42.77, 38.99, 39.38, 33.22, 45.34]
      }]
    };
  }

  
  ngOnInit() {
    for (let i = 0; i < this.obj.results.length; i++) {
      let a = this.obj.results[i];
      if (a.result.measurement_type == 'LAeq') {
        console.log(this.obj.name, 'FOUND LAeq');
        this.valuesA = a.result;
      } else if (a.result.measurement_type == 'LCeq') {
        console.log(this.obj.name, 'FOUND LCeq');
        this.valuesC = a.result;
      }
      // console.log('AUDIO', a.result.measurement_type);
    }
    this.updateChart(); 
    this.updatesIncident();
    this.getIncidents();
  }

  saveInstance(chartInstance) {
    this.chart = chartInstance;
    if(this.valuesC){
      console.log('setupChart C', this.valuesC);
      var date = moment(this.valuesC.timestamp); //new Date(gObj.DateString);
      var dateUtc = date.add(date.utcOffset(), 'minutes').utc().valueOf(); //date.getTime();
      let tCons = { name: date.format("HH:mm:ss"), x: dateUtc, y: this.valuesC.lceq_sound_console };
      let tCrit = { name: date.format("HH:mm:ss"), x: dateUtc, y: this.valuesC.lceq_critical_point };

      this.setChartSoundLimit(this.chart, this.valuesC.lceq_limit);
      this.seriesCConsole.push(tCons);
      this.seriesCCritical.push(tCrit);
      this.chart.series[0].setData(this.seriesCConsole, false);
      this.chart.series[1].setData(this.seriesCCritical, false);
      this.chart.redraw();
    }
    
  }

  saveInstance2(chartInstance) {
    this.chart2 = chartInstance;
    if(this.valuesA){
      console.log('setupChart A', this.valuesA);
      var date = moment(this.valuesA.timestamp); //new Date(gObj.DateString);
      var dateUtc = date.add(date.utcOffset(), 'minutes').utc().valueOf(); //date.getTime();
      let tCons = { name: date.format("HH:mm:ss"), x: dateUtc, y: this.valuesA.laeq_sound_console };
      let tCrit = { name: date.format("HH:mm:ss"), x: dateUtc, y: this.valuesA.laeq_critical_point };

      this.setChartSoundLimit(this.chart2, this.valuesA.laeq_limit);
      this.seriesAConsole.push(tCons);
      this.seriesACritical.push(tCrit);
      this.chart2.series[0].setData(this.seriesAConsole, false);
      this.chart2.series[1].setData(this.seriesACritical, false);
      this.chart2.redraw();
    }
  }

  setChartSoundLimit(chart, val) {
    chart.yAxis[0].removePlotLine('sound-limit');
    chart.yAxis[0].addPlotLine({
      id: 'sound-limit',
      value: val,
      color: 'red',
      dashStyle: 'shortdash',
      width: 2,
      label: {
        text: val + ' db'
      }
    });
  }

  getIncidents(){
    // Sound incidents
    let sub = this.incidentService.getIncidents('SoundIncident', 'ONGOING', null, 0).subscribe(data => { 
      // console.log('SOUND INC', data);
      let d:any = data; 
      for (var i = d.length - 1; i >= 0; i--)
      {
        if(d[i].interventionplan){
          let intp = JSON.parse(d[i].interventionplan);
          // console.log('SOUND INC', intp.result.microphoneID, this.obj.id);
          if(intp && intp.result && intp.result.microphoneID == this.obj.id){
            this.exceedings.push(intp.result);
          }
        }
      }
    }, error => { 
      console.log('SOUND INC error', error);
    });
    this.subscriptions.push(sub);
  }

  // TODO
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
        console.log("SIGNALR INCIDENT", msgJson);
        
        // // TEST
        // let msgJson = {
        //   "type": "SoundIncident",
        //   "incidentid": 2037,
        //   "status": "ONGOING",
        //   "interventionplan": "{\"phenomenonTime\":\"2019-05-30T09:50:54Z\",\"result\":{\"ALERT\":\"The sound must be reduced in the neighbour area measured with LAeq microphone\",\"microphoneID\":\"MONICA0010_000349\",\"microphoneType\":\"LAeq\",\"timestamp\":\"2019-05-30T09:50:54Z\"},\"resultTime\":\"2019-05-30T09:51:10.803663+00:00\"}",
        //   "prio": 4,
        //   "timestamp": "2019-05-30T09:51:10.8277419+00:00"
        //  }
        // this.exceedings.unshift(ex1); 7// TEMP!

        if(msgJson.interventionplan){
          let intp = JSON.parse(msgJson.interventionplan);
          // console.log('SOUND INC', intp.result.microphoneID, this.obj.id);
          if(intp && intp.result && intp.result.microphoneID == this.obj.id){
            this.exceedings.unshift(intp.result);
          }
        }
      });
    } catch (e) {
      console.log('updatesIncident error', e);
      // stop connection
      this.connection.stop().catch(err => {
        console.log("Stop error", err.toString());
      });
    }
  }

  updateChartA(updResult){
    if(this.chart2){
      // Console A
      var date = moment(updResult.timestamp); //new Date(gObj.DateString);
      var dateUtc = date.add(date.utcOffset(), 'minutes').utc().valueOf(); //date.getTime();
      this.seriesAConsole.push({ name: date.format("HH:mm:ss"), x: dateUtc, y: updResult.laeq_sound_console });
      this.seriesACritical.push({ name: date.format("HH:mm:ss"), x: dateUtc, y: updResult.laeq_critical_point });
      this.chart2.series[0].setData(this.seriesAConsole, false);
      this.chart2.series[1].setData(this.seriesACritical, false);
      this.setChartSoundLimit(this.chart2, updResult.laeq_limit);
      this.chart2.redraw();
    }
  }

  updateChartC(updResult){
    if(this.chart2){
      // Console A
      var date = moment(updResult.timestamp); //new Date(gObj.DateString);
      var dateUtc = date.add(date.utcOffset(), 'minutes').utc().valueOf(); //date.getTime();
      this.seriesCConsole.push({ name: date.format("HH:mm:ss"), x: dateUtc, y: updResult.lceq_sound_console });
      this.seriesCCritical.push({ name: date.format("HH:mm:ss"), x: dateUtc, y: updResult.lceq_critical_point });
      this.chart.series[0].setData(this.seriesCConsole, false);
      this.chart.series[1].setData(this.seriesCCritical, false);
      this.setChartSoundLimit(this.chart, updResult.lceq_limit);
      this.chart.redraw();
    }
  }
  // TODO
  updateChart() {
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
          if(SLM == this.obj.id && measurement == "audience"){
            
            if(measurement_type == 'LAeq' && msgJson.result){
              console.log("AGGR SIGNALR UPdATE LA", msgJson.result);
              this.valuesA.laeq_sound_console = msgJson.result.laeq_sound_console;
              this.valuesA.laeq_critical_point = msgJson.result.laeq_critical_point;
              this.valuesA.timestamp = msgJson.result.timestamp;
              this.updateChartA(msgJson.result);
            } else if(measurement_type == 'LCeq' && msgJson.result){
              console.log("AGGR SIGNALR UPdATE LC", msgJson.result);
              console.log('GAH', msgJson.result.lceq_sound_console, msgJson.result.lceq_critical_point, msgJson.result.lceq_critical_point);
              this.valuesC.lceq_sound_console = msgJson.result.lceq_sound_console;
              this.valuesC.lceq_critical_point = msgJson.result.lceq_critical_point;
              this.valuesC.timestamp = msgJson.result.timestamp;
              this.updateChartC(msgJson.result);
            }
          }
        }
        // Push to series array for each chart
      });
    } catch (e) {
      console.log("sound chart error", e);
    }
  }

  downloadData(){
    this.router.navigate(['/download'], { queryParams: { metername: 'Thing'+this.obj.id } });
  }

  ngOnDestroy(): void {
    // Unsubscribe to all
    for (let i = 0; i < this.subscriptions.length; i++) {
      this.subscriptions[i].unsubscribe();
    }
  }

}
