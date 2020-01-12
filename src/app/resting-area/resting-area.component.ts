import { Subscription } from 'rxjs/Subscription';
import { Router } from '@angular/router';
import { ThingService } from 'app/thing.service';
import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
const signalR = require("@aspnet/signalr");
import { environment } from './../../environments/environment';

@Component({
  selector: 'app-resting-area',
  templateUrl: './resting-area.component.html',
  styleUrls: ['./resting-area.component.css']
})
export class RestingAreaComponent implements OnInit {
  options: any;
  chart: any;
  soundLevelLimitA = 102;
  valsA;
  seriesA = [];
  subscriptions: Array<Subscription> = new Array<Subscription>();
  connection;
  constructor(private thingService:ThingService, private router: Router) { 
    this.options = {
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
          value: this.soundLevelLimitA,
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
        name: 'Measured',
        data: [] //[5.34, 25.36, 31, 38.99, 55.76, 41.79, 42.77, 19.38, 13.22, 23.45]
      }]
    };
  }
  
  ngOnInit() {
    let sub = this.thingService.getSoundmeterAggregate().subscribe(data => { 
      let d:any = data; 
      console.log('getSoundmeterAggregate', d);
      for(let i = 0; i<d.length; i++){
        let a = d[i];
        let n:String = a.name;
        if(n.toLocaleLowerCase().includes('resting_area')){
          
          // this.stages = d;
          let obs = a.observations[0];
          if(obs){
            let valsJson = JSON.parse(obs.observationResult);
            console.log('RESTING', valsJson.result);
            this.valsA = valsJson.result;
            if(this.chart){
              console.log('setupChart A', this.valsA);
              var date = moment(this.valsA.timestamp); //new Date(gObj.DateString);
              var dateUtc = date.add(date.utcOffset(), 'minutes').utc().valueOf(); //date.getTime();
              let t = { name: date.format("HH:mm:ss"), x: dateUtc, y: this.valsA.laeq_level };
              console.log('T', t);
              // let tCrit = { name: date.format("HH:mm:ss"), x: dateUtc, y: this.valsA.laeq_critical_point };
        
              this.setChartSoundLimit(this.chart, this.valsA.laeq_limit);
              this.seriesA.push(t);
              // this.seriesACritical.push(tCrit);
              this.chart.series[0].setData(this.seriesA, false);
              // this.chart.series[1].setData(this.seriesACritical, false);
              this.chart.redraw();
            }
          }
        }
      }
      console.log('getSoundmeterAggregate', data);
    }, error => { 
      console.log('getSoundmeterAggregate error', error);
    });
    this.subscriptions.push(sub)

    this.updateChart();
  }

  

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
        console.log('REST UPD', msgJson);
        if(msgJson.result){
          let SLM = msgJson.result.SLM;
          let measurement = msgJson.result.measurement;
          let measurement_type = msgJson.result.measurement_type;
          
          if(SLM == this.valsA.SLM){
            this.valsA.laeq_limit = msgJson.result.laeq_limit;
            this.valsA.timestamp = msgJson.result.timestamp;
            this.valsA.exposure_remaining = msgJson.result.exposure_remaining;
            this.updateChartA(msgJson.result);
            console.log("AGGR SIGNALR REST", measurement_type, SLM);
            // console.log("AGGR SIGNALR", msgJson);
            // if(measurement_type == 'LAeq'){
            //   this.updateChartA(msgJson.result);
            // } else if(measurement_type == 'LCeq'){
            //   this.updateChartC(msgJson.result);
            // }
          }
        }
        // Push to series array for each chart
      });
    } catch (e) {
      console.log("sound chart error", e);
    }
  }

  downloadData(){
    this.router.navigate(['/download'], { queryParams: { metername: 'Thing'+this.valsA.SLM } });
  }

  saveInstance(chartInstance) {
    this.chart = chartInstance;
    if(this.valsA){
      console.log('setupChart A', this.valsA);
      var date = moment(this.valsA.timestamp); //new Date(gObj.DateString);
      var dateUtc = date.add(date.utcOffset(), 'minutes').utc().valueOf(); //date.getTime();
      let t = { name: date.format("HH:mm:ss"), x: dateUtc, y: this.valsA.laeq_level };
      console.log('T', t);
      // let tCrit = { name: date.format("HH:mm:ss"), x: dateUtc, y: this.valsA.laeq_critical_point };

      this.setChartSoundLimit(this.chart, this.valsA.laeq_limit);
      this.seriesA.push(t);
      // this.seriesACritical.push(tCrit);
      this.chart.series[0].setData(this.seriesA, false);
      // this.chart.series[1].setData(this.seriesACritical, false);
      this.chart.redraw();
    }
  }

  updateChartA(updResult){
    if(this.chart){
      // Console A
      var date = moment(updResult.timestamp); //new Date(gObj.DateString);
      var dateUtc = date.add(date.utcOffset(), 'minutes').utc().valueOf(); //date.getTime();
      // this.seriesAConsole.push({ name: date.format("HH:mm:ss"), x: dateUtc, y: updResult.laeq_sound_console });
      // this.seriesACritical.push({ name: date.format("HH:mm:ss"), x: dateUtc, y: updResult.laeq_critical_point });
      let t = { name: date.format("HH:mm:ss"), x: dateUtc, y: this.valsA.laeq_level };
      
      this.seriesA.push(t);
      this.chart.series[0].setData(this.seriesA, false);
      // this.chart2.series[1].setData(this.seriesACritical, false);
      this.setChartSoundLimit(this.chart, updResult.laeq_limit);
      this.chart.redraw();
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

  ngOnDestroy(): void {
    // Unsubscribe to all
    for (let i = 0; i < this.subscriptions.length; i++) {
      this.subscriptions[i].unsubscribe();
    }
  }
}
