import { Router } from '@angular/router';
import { IncidentService } from './../incident.service';
import { ThingService } from 'app/thing.service';
import { Subscription } from 'rxjs/Subscription';
import { Component, OnInit, Input } from '@angular/core';
import { environment } from './../../environments/environment';
import * as moment from 'moment';
const signalR = require("@aspnet/signalr");

@Component({
  selector: 'neighbour-charts',
  templateUrl: './neighbour-charts.component.html',
  styleUrls: ['./neighbour-charts.component.css']
})
export class NeighbourChartsComponent implements OnInit {
  @Input('obj') obj;
  options: any;
  options2: any;
  chart: any;
  chart2: any;
  soundLevelLimitA = 102;
  soundLevelLimitA_2 = 90;
  soundLevelLimit125 = 118;
  soundLevelLimit125_2 = 90;

  // OVERALL
  valuesOverall;
  seriesOverallMeasured = [];
  seriesOverallStage1 = [];
  seriesOverallStege2 = [];
  seriesOverallStage3 = [];
  exceedingsOverall = [];

  // Octave Bands
  valuesOctaveBands; // measured inside
  selectedValuesOctaveBands = {measured:'', stage1:'', stage2:'', stage3:'', currentLimit:'', minLimit:''};
  // seriesOctaveMeasured = [];
  valuesStage1;
  valuesStage2;
  valuesStage3;
  seriesOctaveMeasure = {'F125':[], 'F250':[], 'F500':[], 'F1000':[], 'F2000':[], 'F4000':[]};
  seriesOctaveStage1 = {'F125':[], 'F250':[], 'F500':[], 'F1000':[], 'F2000':[], 'F4000':[]};
  seriesOctaveStage2 = {'F125':[], 'F250':[], 'F500':[], 'F1000':[], 'F2000':[], 'F4000':[]};
  seriesOctaveStage3 = {'F125':[], 'F250':[], 'F500':[], 'F1000':[], 'F2000':[], 'F4000':[]};
  exceedingsOctave = [];
  selectedFrequency = '125 Hz';
  frequencies = [
    {value: '125', viewValue: '125 Hz'},
    {value: '250', viewValue: '250 Hz'},
    {value: '500', viewValue: '500 Hz'},
    {value: '1000', viewValue: '1000 Hz'},
    {value: '2000', viewValue: '2000 Hz'},
    {value: '4000', viewValue: '4000 Hz'},
  ]

  subscriptions: Array<Subscription> = new Array<Subscription>();
  connection;

  constructor(private thingService: ThingService, private incidentService:IncidentService, private router: Router) {
    // dBA
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
        max: 120,
        title: {
          text: ''
        },
        labels: {
          format: '{value} dB'
        },
        plotLines: [{
          id: 'limits_current',
          value: this.soundLevelLimitA,
          color: 'red',
          dashStyle: 'shortdash',
          width: 2,
          label: {
            text: 'Limit'
          }
        }, {
          id: 'limits_min',
          value: this.soundLevelLimitA_2,
          color: 'black',
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
        data: [] // [5.34, 25.36, 31, 38.99, 55.76, 41.79, 42.77, 19.38, 13.22, 23.45]
      }, {
        color: '#F3BB45',
        name: 'Contribution Stage 1',
        data: [] // [5.36, 51, 53.45, 45.76, 61.79, 42.77, 38.99, 39.38, 33.22, 45.34]
      }, {
        color: '#7AC29A',
        name: 'Contribution Stage 2',
        data: [] // [42.77, 38.99, 5.36, 51, 53.45, 39.38, 33.22, 45.34, 45.76, 61.79]
      }, {
        color: '#FFB4A0',
        name: 'Contribution Stage 3',
        data: [] // [61.79, 42.77, 38.99, 39.38, 33.22, 45.34, 5.36, 51, 53.45, 45.76]
      }]
    };
    // 125 HZ
    this.options2 = {
      chart: {
        backgroundColor: '#ffffff',
        type: 'line'
      },
      title: { text: '125 HZ' },
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
        max: 120,
        title: {
          text: ''
        },
        labels: {
          format: '{value} dB'
        },
        plotLines: [{
          id: 'limits_current',
          value: this.soundLevelLimitA,
          color: 'red',
          dashStyle: 'shortdash',
          width: 2,
          label: {
            text: 'Limit'
          }
        }, {
          id: 'limits_min',
          value: this.soundLevelLimitA_2,
          color: 'black',
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
        data: [] // [35.34, 25.36, 31, 38.99, 45.76, 41.79, 42.77, 19.38, 13.22, 23.45]
      }, {
        color: '#F3BB45',
        name: 'Contribution Stage 1',
        data: [] // [45.36, 51, 53.45, 45.76, 41.79, 42.77, 38.99, 39.38, 33.22, 45.34]
      }, {
        color: '#7AC29A',
        name: 'Contribution Stage 2',
        data: [] // [42.77, 38.99, 5.36, 51, 53.45, 39.38, 33.22, 45.34, 45.76, 61.79]
      }, {
        color: '#FFB4A0',
        name: 'Contribution Stage 3',
        data: [] // [61.79, 42.77, 38.99, 39.38, 33.22, 45.34, 5.36, 51, 53.45, 45.76]
      }]
    };
  }

  ngOnInit() {
    for (let i = 0; i < this.obj.results.length; i++) {
      let a = this.obj.results[i];
      if (a.result) {
        let measType: string = a.result.measurement_type;
        if (measType.toLocaleLowerCase() == 'laeq') {
          console.log(this.obj.name, 'FOUND LAeq');
          this.valuesOverall = a.result;
        } else if (measType.toLocaleLowerCase() == 'octave') {
          console.log(this.obj.name, 'FOUND octave');
          this.valuesOctaveBands = a.result;
        } else if (measType.toLocaleLowerCase() == 'contribution') {
          console.log(this.obj.name, 'FOUND contribution');
          let ar: string = a.result.area;
          if (ar.toLocaleLowerCase() == "stage_1") {
            this.valuesStage1 = a.result[this.obj.name];
            this.valuesStage1.timestamp = a.result.timestamp;
          } else if (ar.toLocaleLowerCase() == "stage_2") {
            this.valuesStage2 = a.result[this.obj.name];
            this.valuesStage2.timestamp = a.result.timestamp;
          } else if (ar.toLocaleLowerCase() == "stage_3") {
            this.valuesStage3 = a.result[this.obj.name];
            this.valuesStage3.timestamp = a.result.timestamp;
          }
        }
      }
    }
    console.log('valuesOverall', this.valuesOverall);
    console.log('valuesOctaveBands', this.valuesOctaveBands);
    console.log('valuesStage1', this.valuesStage1);
    console.log('valuesStage2', this.valuesStage2);
    console.log('valuesStage3', this.valuesStage3);

    this.setupOctaveSeries(this.valuesOctaveBands);
    this.setupOctaveContribution(); 
    this.setupselectedValuesOctaveBands(this.valuesOctaveBands);
    this.getIncidents();
    this.update(); 
  }

  update() {
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
          let measurement = msgJson.result.measurement ? msgJson.result.measurement: msgJson.result.measurment;
          let measurement_type:string = msgJson.result.measurement_type;
          console.log('SIGNALR AGGR', measurement_type, msgJson, measurement, measurement_type);
          if(SLM == this.obj.id && measurement == "neighbour"){
            console.log('NEIGH UPDATE', measurement_type, msgJson);
            if(measurement_type.toLocaleLowerCase().includes('laeq')){
              // console.log('UPDATE OVERALL LAeq');
              this.valuesOverall = msgJson.result;
              this.updatelaeq(msgJson.result);
            } else if(measurement_type.toLocaleLowerCase().includes('octave')) {
              console.log('UPDATE OVERALL octave');
              this.doUpdateOctave(msgJson);
            }
          }
          // Stage 1 update
          if(SLM == "MONICA0008_000320" && measurement == "neighbour"){
            console.log('UPDATE OVERALL contribution STAGE 1');
            this.doUpdateContributionStage1(msgJson);
          } 
          // Stage 2 update
          if(SLM == "MONICA0010_000349" && measurement == "neighbour"){
            console.log('UPDATE OVERALL contribution STAGE 2');
            this.doUpdateContributionStage2(msgJson);
          }
          // Stage 3 update
          if(SLM == "MONICA0009_000415" && measurement == "neighbour"){
            console.log('UPDATE OVERALL contribution STAGE 3');
            this.doUpdateContributionStage3(msgJson);
          }
        }
        // Push to series array for each chart
      });
    } catch (e) {
      console.log("sound chart error", e);
    }
  }

  
  doUpdateContributionStage1(msgJson){
    this.valuesStage1 = msgJson.result[this.obj.name];
    this.valuesStage1.timestamp = msgJson.result.timestamp;

    this.setupContribution(); 
    this.setupOctaveContribution();
    this.updateContributionChart2();
    this.updateOverallContributionChart();
  }
  doUpdateContributionStage2(msgJson){

    this.valuesStage2 = msgJson.result[this.obj.name];
    this.valuesStage2.timestamp = msgJson.result.timestamp;

    this.setupContribution(); 
    this.setupOctaveContribution();
    this.updateContributionChart2();
    this.updateOverallContributionChart();
  }
  doUpdateContributionStage3(msgJson){
    this.valuesStage3 = msgJson.result[this.obj.name];
    this.valuesStage3.timestamp = msgJson.result.timestamp;

    this.setupContribution(); 
    this.setupOctaveContribution();
    this.updateContributionChart2();
    this.updateOverallContributionChart();
  }

  doUpdateOctave(msgJson){
    this.valuesOctaveBands = msgJson.result;
    this.setupOctaveSeries(msgJson.result);
    this.setupselectedValuesOctaveBands(msgJson.result);
    this.updateOctaveChart2(msgJson.result);
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
          console.log('SOUND INC', intp);
          if(intp && intp.result && intp.result.microphoneID == this.obj.id && intp.result.microphoneType == 'LAeq'){
            this.exceedingsOverall.push(intp.result);
          } else if(intp && intp.result && intp.result.microphoneID == this.obj.id && intp.result.microphoneType == 'CPBLZeq'){
            this.exceedingsOctave.push()
          }
        }
      }
    }, error => { 
      console.log('SOUND INC error', error);
    });
    this.subscriptions.push(sub);
  }

  onChangeFreq(newValue){
    this.selectedFrequency = newValue;
    this.updateContributionChart2();
    this.updateOctaveChart2(this.valuesOctaveBands)
    this.setupselectedValuesOctaveBands(this.valuesOctaveBands);
    this.setupContribution();
  }

  getSeriesBySelectedFrequency(arr){
    if(this.selectedFrequency.includes("125")){
      return arr.F125;
    } else if(this.selectedFrequency.includes("250")){
      return arr.F250;
    } else if(this.selectedFrequency.includes("500")){
      return arr.F500;
    } else if(this.selectedFrequency.includes("1000")){
      return arr.F1000;
    } else if(this.selectedFrequency.includes("2000")){
      return arr.F2000;
    } else if(this.selectedFrequency.includes("4000")){
      return arr.F4000;
    }
    return []; 
  }

  getValueBySelectedFrequency(from, valuesByFrequency){
    console.log('getValueBySelectedFrequency', from, valuesByFrequency, this.selectedFrequency)
    if(valuesByFrequency && this.selectedFrequency.includes("125")){
      return valuesByFrequency.lc_125;
    } else if(this.selectedFrequency.includes("250")){
      return valuesByFrequency.lc_250;
    } else if(this.selectedFrequency.includes("500")){
      return valuesByFrequency.lc_500;
    } else if(this.selectedFrequency.includes("1000")){
      return valuesByFrequency.lc_1K;
    } else if(this.selectedFrequency.includes("2000")){
      return valuesByFrequency.lc_2K;
    } else if(this.selectedFrequency.includes("4000")){
      return valuesByFrequency.lc_4K;
    }
    return null; 
  }

  // For realtime labels update this.valuesOctaveBands.measured
  setupselectedValuesOctaveBands(vals){
    if (vals) {
      let freqValMeas = this.getValueBySelectedFrequency('freqValMeas', vals.measured);
      this.selectedValuesOctaveBands.measured = freqValMeas;

      // limits
      let freqValCurr = this.getValueBySelectedFrequency('freqValCurr setupselectedValuesOctaveBands', vals.measured.limits_current);
      this.selectedValuesOctaveBands.currentLimit = freqValCurr;
      let freqValMin = this.getValueBySelectedFrequency('freqValMin setupselectedValuesOctaveBands', vals.measured.limits_min);
      this.selectedValuesOctaveBands.minLimit = freqValMin;
    } 
    // if(this.valuesOctaveBands){
    //   let freqValMeas = this.getValueBySelectedFrequency('freqValMeas', this.valuesOctaveBands.measured);
    //   this.selectedValuesOctaveBands.measured = freqValMeas;

    //   // limits
    // let freqValCurr = this.getValueBySelectedFrequency('freqValCurr setupselectedValuesOctaveBands', this.valuesOctaveBands.measured.limits_current);
    // this.selectedValuesOctaveBands.currentLimit = freqValCurr;
    // let freqValMin = this.getValueBySelectedFrequency('freqValMin setupselectedValuesOctaveBands', this.valuesOctaveBands.measured.limits_min);
    // this.selectedValuesOctaveBands.minLimit = freqValMin;
    // } 
  }

  setupContribution(){
    let freqValSt1 = this.getValueBySelectedFrequency('freqValSt1', this.valuesStage1);
    this.selectedValuesOctaveBands.stage1 = freqValSt1;

    let freqValSt2 = this.getValueBySelectedFrequency('freqValSt2', this.valuesStage2);
    this.selectedValuesOctaveBands.stage2 = freqValSt2;

    let freqValSt3 = this.getValueBySelectedFrequency('freqValSt3', this.valuesStage3);
    this.selectedValuesOctaveBands.stage3 = freqValSt3;

  }

// this.valuesOctaveBands.measured
  // updateOctaveSeries(values){
  //   // Measured
  //   if(values){
  //     var date = moment(this.valuesOctaveBands.timestamp);
  //     var dateUtc = date.add(date.utcOffset(), 'minutes').utc().valueOf();
      
  //     this.seriesOctaveMeasure.F125.push({ name: date.format("HH:mm:ss"), x: dateUtc, y: values.lc_125 });
  //     this.seriesOctaveMeasure.F250.push({ name: date.format("HH:mm:ss"), x: dateUtc, y: values.lc_250 });
  //     this.seriesOctaveMeasure.F500.push({ name: date.format("HH:mm:ss"), x: dateUtc, y: values.lc_500 });
  //     this.seriesOctaveMeasure.F1000.push({ name: date.format("HH:mm:ss"), x: dateUtc, y: values.lc_1K });
  //     this.seriesOctaveMeasure.F2000.push({ name: date.format("HH:mm:ss"), x: dateUtc, y: values.lc_2K });
  //     this.seriesOctaveMeasure.F4000.push({ name: date.format("HH:mm:ss"), x: dateUtc, y: values.lc_4K });
  //     console.log('seriesOctaveMeasure', this.seriesOctaveMeasure);
  //   }
  // }

  // Need timestamp and values
  setupOctaveSeries(values){
    if(values){
      var date = moment(values.timestamp);
      var dateUtc = date.add(date.utcOffset(), 'minutes').utc().valueOf();
      
      this.seriesOctaveMeasure.F125.push({ name: date.format("HH:mm:ss"), x: dateUtc, y: values.measured.lc_125 });
      this.seriesOctaveMeasure.F250.push({ name: date.format("HH:mm:ss"), x: dateUtc, y: values.measured.lc_250 });
      this.seriesOctaveMeasure.F500.push({ name: date.format("HH:mm:ss"), x: dateUtc, y: values.measured.lc_500 });
      this.seriesOctaveMeasure.F1000.push({ name: date.format("HH:mm:ss"), x: dateUtc, y: values.measured.lc_1K });
      this.seriesOctaveMeasure.F2000.push({ name: date.format("HH:mm:ss"), x: dateUtc, y: values.measured.lc_2K });
      this.seriesOctaveMeasure.F4000.push({ name: date.format("HH:mm:ss"), x: dateUtc, y: values.measured.lc_4K });
      console.log('seriesOctaveMeasure', this.seriesOctaveMeasure);
    }
    // if(this.valuesOctaveBands){
    //   var date = moment(this.valuesOctaveBands.timestamp);
    //   var dateUtc = date.add(date.utcOffset(), 'minutes').utc().valueOf();
      
    //   this.seriesOctaveMeasure.F125.push({ name: date.format("HH:mm:ss"), x: dateUtc, y: this.valuesOctaveBands.measured.lc_125 });
    //   this.seriesOctaveMeasure.F250.push({ name: date.format("HH:mm:ss"), x: dateUtc, y: this.valuesOctaveBands.measured.lc_250 });
    //   this.seriesOctaveMeasure.F500.push({ name: date.format("HH:mm:ss"), x: dateUtc, y: this.valuesOctaveBands.measured.lc_500 });
    //   this.seriesOctaveMeasure.F1000.push({ name: date.format("HH:mm:ss"), x: dateUtc, y: this.valuesOctaveBands.measured.lc_1K });
    //   this.seriesOctaveMeasure.F2000.push({ name: date.format("HH:mm:ss"), x: dateUtc, y: this.valuesOctaveBands.measured.lc_2K });
    //   this.seriesOctaveMeasure.F4000.push({ name: date.format("HH:mm:ss"), x: dateUtc, y: this.valuesOctaveBands.measured.lc_4K });
    //   console.log('seriesOctaveMeasure', this.seriesOctaveMeasure);
    // }
  }

  setupOctaveContribution() {
    // contribution stage 1
    if (this.valuesStage1) {
      let dateStage1 = moment(this.valuesStage1.timestamp);
      var dateUtcS1 = dateStage1.add(dateStage1.utcOffset(), 'minutes').utc().valueOf();
      this.seriesOctaveStage1.F125.push({ name: dateStage1.format("HH:mm:ss"), x: dateUtcS1, y: this.valuesStage1.lc_125 });
      this.seriesOctaveStage1.F250.push({ name: dateStage1.format("HH:mm:ss"), x: dateUtcS1, y: this.valuesStage1.lc_250 });
      this.seriesOctaveStage1.F500.push({ name: dateStage1.format("HH:mm:ss"), x: dateUtcS1, y: this.valuesStage1.lc_500 });
      this.seriesOctaveStage1.F1000.push({ name: dateStage1.format("HH:mm:ss"), x: dateUtcS1, y: this.valuesStage1.lc_1K });
      this.seriesOctaveStage1.F2000.push({ name: dateStage1.format("HH:mm:ss"), x: dateUtcS1, y: this.valuesStage1.lc_2K });
      this.seriesOctaveStage1.F4000.push({ name: dateStage1.format("HH:mm:ss"), x: dateUtcS1, y: this.valuesStage1.lc_4K });

      console.log('seriesOctaveStage1', this.seriesOctaveStage1);
    }

    // contribution stage 2
    if (this.valuesStage2) {
      let dateStage2 = moment(this.valuesStage2.timestamp);
      var dateUtcS2 = dateStage2.add(dateStage2.utcOffset(), 'minutes').utc().valueOf();
      this.seriesOctaveStage2.F125.push({ name: dateStage2.format("HH:mm:ss"), x: dateUtcS2, y: this.valuesStage2.lc_125 });
      this.seriesOctaveStage2.F250.push({ name: dateStage2.format("HH:mm:ss"), x: dateUtcS2, y: this.valuesStage2.lc_250 });
      this.seriesOctaveStage2.F500.push({ name: dateStage2.format("HH:mm:ss"), x: dateUtcS2, y: this.valuesStage2.lc_500 });
      this.seriesOctaveStage2.F1000.push({ name: dateStage2.format("HH:mm:ss"), x: dateUtcS2, y: this.valuesStage2.lc_1K });
      this.seriesOctaveStage2.F2000.push({ name: dateStage2.format("HH:mm:ss"), x: dateUtcS2, y: this.valuesStage2.lc_2K });
      this.seriesOctaveStage2.F4000.push({ name: dateStage2.format("HH:mm:ss"), x: dateUtcS2, y: this.valuesStage2.lc_4K });


      console.log('seriesOctaveStage2', this.seriesOctaveStage2);
    }

    // contribution stage 3
    if (this.valuesStage3) {
      let dateStage3 = moment(this.valuesStage3.timestamp);
      var dateUtcS3 = dateStage3.add(dateStage3.utcOffset(), 'minutes').utc().valueOf();
      this.seriesOctaveStage3.F125.push({ name: dateStage3.format("HH:mm:ss"), x: dateUtcS3, y: this.valuesStage3.lc_125 });
      this.seriesOctaveStage3.F250.push({ name: dateStage3.format("HH:mm:ss"), x: dateUtcS3, y: this.valuesStage3.lc_250 });
      this.seriesOctaveStage3.F500.push({ name: dateStage3.format("HH:mm:ss"), x: dateUtcS3, y: this.valuesStage3.lc_500 });
      this.seriesOctaveStage3.F1000.push({ name: dateStage3.format("HH:mm:ss"), x: dateUtcS3, y: this.valuesStage3.lc_1K });
      this.seriesOctaveStage3.F2000.push({ name: dateStage3.format("HH:mm:ss"), x: dateUtcS3, y: this.valuesStage3.lc_2K });
      this.seriesOctaveStage3.F4000.push({ name: dateStage3.format("HH:mm:ss"), x: dateUtcS3, y: this.valuesStage3.lc_4K });
      console.log('seriesOctaveStage3', this.seriesOctaveStage3);
    }

  }

  saveInstance(chartInstance) {
    this.chart = chartInstance;
    if(this.valuesOverall){
      this.updatelaeq(this.valuesOverall);
      this.updateOverallContributionChart();
    }
  }

  updatelaeq(vals){
    console.log('setupChart overall', vals);
    var date = moment(vals.timestamp); //new Date(gObj.DateString);
    var dateUtc = date.add(date.utcOffset(), 'minutes').utc().valueOf(); //date.getTime();
    this.setChartSoundLimit(this.chart, vals.laeq_limit_current, vals.laeq_limit_min);
    // MEASURED
    let meas = { name: date.format("HH:mm:ss"), x: dateUtc, y: vals.laeq };
    this.seriesOverallMeasured.push(meas);
    this.chart.series[0].setData(this.seriesOverallMeasured, false);
    this.chart.redraw();
  }

  updateOverallContributionChart(){
    // CONTRIBUTION STAGE 1
    let dateStage1 = moment(this.valuesStage1.timestamp);
    var dateUtcS1 = dateStage1.add(dateStage1.utcOffset(), 'minutes').utc().valueOf();
    let st1 = { name: dateStage1.format("HH:mm:ss"), x: dateUtcS1, y: this.valuesStage1.laeq };
    this.seriesOverallStage1.push(st1);
    this.chart.series[1].setData(this.seriesOverallStage1, false);

    // CONTRIBUTION STAGE 2
    let dateStage2 = moment(this.valuesStage2.timestamp);
    var dateUtcS2 = dateStage2.add(dateStage2.utcOffset(), 'minutes').utc().valueOf();
    let st2 = { name: dateStage2.format("HH:mm:ss"), x: dateUtcS2, y: this.valuesStage2.laeq };
    this.seriesOverallStege2.push(st2);
    this.chart.series[2].setData(this.seriesOverallStege2, false);

    // CONTRIBUTION STAGE 3
    let dateStage3 = moment(this.valuesStage3.timestamp);
    var dateUtcS3 = dateStage3.add(dateStage3.utcOffset(), 'minutes').utc().valueOf();
    let st3 = { name: dateStage3.format("HH:mm:ss"), x: dateUtcS3, y: this.valuesStage3.laeq };
    this.seriesOverallStage3.push(st3);
    this.chart.series[3].setData(this.seriesOverallStage3, false);

    this.chart.redraw();
  }

  saveInstance2(chartInstance) {
    this.chart2 = chartInstance;
    if(this.valuesOctaveBands){
      this.updateOctaveChart2(this.valuesOctaveBands);
      this.updateContributionChart2();
    }
  }

  // Update this.seriesOctaveMeasure and call updateOctaveChart2
  updateOctaveChart2(vals){
    if(this.chart2){
      console.log('setupChart octave', vals);
      this.chart2.setTitle({ text: this.selectedFrequency });
      let freqValCurr = this.getValueBySelectedFrequency('freqValCurr updateChart2', vals.measured.limits_current);
      let freqValMin = this.getValueBySelectedFrequency('freqValMin updateChart2', vals.measured.limits_min);
      this.setChartSoundLimit(this.chart2, freqValCurr, freqValMin);
  
      // MEASURED
      let arrMeas = this.getSeriesBySelectedFrequency(this.seriesOctaveMeasure);
      console.log('arrMeas', arrMeas);
      this.chart2.series[0].setData(arrMeas, false);
      this.chart2.redraw();
    }
    

    // console.log('setupChart octave', this.valuesOctaveBands);
    // this.chart2.setTitle({ text: this.selectedFrequency });
    // console.log('GAH', this.valuesOctaveBands);
    // let freqValCurr = this.getValueBySelectedFrequency('freqValCurr updateChart2', this.valuesOctaveBands.measured.limits_current);
    // let freqValMin = this.getValueBySelectedFrequency('freqValMin updateChart2', this.valuesOctaveBands.measured.limits_min);
    // this.setChartSoundLimit(this.chart2, freqValCurr, freqValMin);

    // // MEASURED
    // let arrMeas = this.getSeriesBySelectedFrequency(this.seriesOctaveMeasure);
    // console.log('arrMeas', arrMeas);
    // this.chart2.series[0].setData(arrMeas, false);
    // this.chart2.redraw();
  }

  updateContributionChart2() {
    // // CONTRIBUTION STAGE 1
    let arrSt1 = this.getSeriesBySelectedFrequency(this.seriesOctaveStage1);
    this.chart2.series[1].setData(arrSt1, false);

    // // CONTRIBUTION STAGE 2
    let arrSt2 = this.getSeriesBySelectedFrequency(this.seriesOctaveStage2);
    this.chart2.series[2].setData(arrSt2, false);

    // // CONTRIBUTION STAGE 3
    let arrSt3 = this.getSeriesBySelectedFrequency(this.seriesOctaveStage3);
    this.chart2.series[3].setData(arrSt3, false);

    this.chart2.redraw();
  }

  setChartSoundLimit(chart, curr, min) {
    chart.yAxis[0].removePlotLine('limits_current');
    chart.yAxis[0].addPlotLine({
      id: 'limits_current',
      value: curr,
      color: 'red',
      dashStyle: 'shortdash',
      width: 2,
      label: {
        text: curr + ' db'
      }
    });
    chart.yAxis[0].removePlotLine('limits_min');
    chart.yAxis[0].addPlotLine({
      id: 'limits_min',
      value: min,
      color: 'black',
      dashStyle: 'shortdash',
      width: 2,
      label: {
        text: min + ' db'
      }
    });
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
