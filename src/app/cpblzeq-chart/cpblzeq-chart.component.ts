import { environment } from './../../environments/environment';
import { Subscription } from 'rxjs/Subscription';
import { ThingService } from 'app/thing.service';
import { Component, OnInit, Input, isDevMode } from '@angular/core';
const signalR = require("@aspnet/signalr");

@Component({
  selector: 'cpblzeq-chart',
  templateUrl: './cpblzeq-chart.component.html',
  styleUrls: ['./cpblzeq-chart.component.css']
})
export class CpblzeqChartComponent implements OnInit {
  @Input('id') id;
  @Input('soundmeters') soundmeters;
  // signalrEndpoint = 'https://portal.monica-cloud.eu/DOM/cop/hub/signalR/wearableupdate';
  options: any;
  options2: any;
  chart: any;
  chart2: any;

  isReady: boolean = false;
  meterName;
  chart1Sublabel;
  chart2Sublabel;
  chartDataLAeq = [];
  chartDataLCeq = [];
  chartDataCPBLZeq = []; //[45.36, 51, 53.45, 45.76, 41.79, 42.77, 38.99, 39.38, 73.22, 45.34, 48.77, 50.39, 45.54, 41.11, 39.98, 38.57, 37.02, 85.93, 30.52, 64.04, 20.8, 21.28, 19.5, 16.72, 15.62, 16.24, 14.71, 12.26, 10.45, 14.51, 15.14, 13.24, 10.47]; //[];
  chartDataCompareCPBLZeq = []; //[45.36, 51, 53.45, 45.76, 41.79, 42.77, 38.99, 39.38, 73.22, 45.34, 48.77, 50.39, 45.54, 41.11, 39.98, 38.57, 37.02, 85.93, 30.52, 64.04, 20.8, 21.28, 19.5, 16.72, 15.62, 16.24, 14.71, 12.26, 10.45, 14.51, 15.14, 13.24, 10.47]; //[];
  subscriptions: Array<Subscription> = new Array<Subscription>();
  connection;

  hasChart1 = false;
  hasChart2 = false;

  soundLevelLimit = 0;
  selectedMeterToCompare = 68;

  avg5min; 

  loaderUrl = "/assets/img/loader.svg";

  saveInstance(chartInstance) {
    this.chart = chartInstance;

    this.setChartSoundLimit(this.chart, this.soundLevelLimit);
    this.setupChart();
    this.updateChart();
  }

  saveInstance2(chartInstance) {
    this.chart2 = chartInstance;
    this.setChartSoundLimit(this.chart2, this.soundLevelLimit);
    // this.chart2.yAxis[0].addPlotLine({
    //   id: 'sound-limit',
    //   value: this.soundLevelLimit,
    //   color: 'red',
    //   dashStyle: 'shortdash',
    //   width: 2,
    //   label: {
    //     text: this.soundLevelLimit + ' db'
    //   }
    // });
  }

  constructor(private thingService: ThingService) {
    if (!isDevMode())
      this.loaderUrl = environment.baseUrl + '/assets/img/loader.svg';

    this.options = {
      chart: {
        backgroundColor: '#f4f3ef',
        type: 'column'
      },
      xAxis: {
        title: {
          text: 'Hz'
        },
        categories: [12.5, 16, 20, 25, 31.5, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150, 4000, 5000, 6300, 8000, 10000, 12500, 16000, 20000]
      },
      yAxis: {
        max:120,
        title: {
          text: ''
        },
        labels: {
          format: '{value} dB'
        },
        plotLines: [{
          id: 'sound-limit',
          value: this.soundLevelLimit,
          color: 'red',
          dashStyle: 'shortdash',
          width: 2,
          label: {
            text: ''
          }
        }]
      },
      tooltip: {
        headerFormat: '<b>{series.name}</b><br/>',
        pointFormat: '{point.x} Hz, {point.y} dB'
      },
      credits: {
        enabled: false
      },
      legend: {
        enabled: false
      },
      title: { text: '' },
      subtitle: {
        text: 'No data available'
      },
      series: [{
        name: '1/3 Octave spectra',
        color: '#68B3C8',
        data: [] //[45.36, 51, 53.45, 45.76, 41.79, 42.77, 38.99, 39.38, 73.22, 45.34, 48.77, 50.39, 45.54, 41.11, 39.98, 38.57, 37.02, 85.93, 30.52, 64.04, 20.8, 21.28, 19.5, 16.72, 15.62, 16.24, 14.71, 12.26, 10.45, 14.51, 15.14, 13.24, 10.47],
      }, 
      // {
      //   name: '1/3 Octave spectra compare',
      //   color: '#F3BB45',
      //   visible: true,
      //   data: [] //[45.36, 51, 53.45, 45.76, 41.79, 42.77, 38.99, 39.38, 73.22, 45.34, 48.77, 50.39, 45.54, 41.11, 39.98, 38.57, 37.02, 85.93, 30.52, 64.04, 20.8, 21.28, 19.5, 16.72, 15.62, 16.24, 14.71, 12.26, 10.45, 14.51, 15.14, 13.24, 10.47],
      // }
    ]
    };

    // LCeq chart
    this.options2 = {
      chart: {
        backgroundColor: '#f4f3ef',
        type: 'line'
      },
      title: { text: '' },
      subtitle: {
        text: 'No data available'
      },
      credits: {
        enabled: false
      },
      // legend: {
      //   enabled: false
      // },
      xAxis: {
        labels: {
          format: '{value} s'
        },
        allowDecimals: false,
        showLastLabel: true
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
          value: this.soundLevelLimit,
          color: 'red',
          dashStyle: 'shortdash',
          width: 2,
          label: {
            text: ''
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
        name: 'LAeq',
        data: []
      }, {
        color: '#F3BB45',
        name: 'LCeq',
        data: [] //[45.36, 51, 53.45, 45.76, 41.79, 42.77, 38.99, 39.38, 33.22, 45.34]
      }]
    };
  }

  getStoredSoundLimit() {
    console.log('Stored limit', this.id, localStorage.getItem(this.id + '_soundlimit'))
    let storedLimit = localStorage.getItem(this.id + '_soundlimit');
    if (storedLimit) {
      console.log('Found stored limit', storedLimit);
      return parseInt(storedLimit);
    }
    return 80;
  }

  setStoredSoundLimit(val) {
    localStorage.setItem(this.id + '_soundlimit', val.toString());
  }

  soundLimitFinish(event) {
    console.log('SOUND LIMIT FINISH', event.from);
    this.setStoredSoundLimit(event.from);
    this.setChartSoundLimit(this.chart, event.from);
    this.setChartSoundLimit(this.chart2, event.from);
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

  selectMeterToCompare(m) {
    console.log('Compare with', m);
    this.selectedMeterToCompare = m.id;
  }

  noSelection() {
    console.log('Unselect, show only one soundmeter');
    this.selectedMeterToCompare = null;
  }

  updateChart() {
    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(environment.signalRUrl)
        .configureLogging(signalR.LogLevel.Information)
        .build();

      this.connection.start().catch(err => {
        console.log("Reconnect to update sound", err.toString());
        // this.updatesIncident(); 
      });

      this.connection.on("SoundsensorUpdate", (message) => {
        let msgJson = JSON.parse(message);
        console.log("SOUND SIGNALR", msgJson);
        if (msgJson.thingid == this.id) {
          this.create5MinAvg(msgJson); 
          this.createOctaveSpectra(msgJson.result, false);
          this.createLAeq(msgJson.result, false);
          this.createLCeq(msgJson.result, false);

          // if (msgJson.valueType == "CPBLZeq") {
          //   // this.setupChart();
          //   // todo call build charts
          //   if(msgJson.response && msgJson.response.value &&  msgJson.response.value.length > 0){
          //     let vals = msgJson.response.value[0].values;
          //     console.log("NEW CPB data", vals[vals.length - 1]); 
          //     // console.log("NEW CPB time", msgJson.data.value[0].startTime, msgJson.data.value[0].endTime); 
          //     this.chart1Sublabel = "Start: " + new Date(msgJson.response.value[0].startTime).toLocaleString() + ", end: " + new Date(msgJson.response.value[0].endTime).toLocaleString();
          //     this.chartDataCPBLZeq = vals[vals.length - 1];
          //     this.buildChart1();
          //   } else {
          //     console.log('nope', msgJson); 
          //   }
          // } else {
          //   if (msgJson.response && msgJson.response.value && typeof msgJson.response.value[0] !== 'undefined') {
          //     // console.log("NEW LA or LA time", msgJson.data.value[0].startTime, msgJson.data.value[0].endTime);
          //     this.chart2Sublabel = "Start: " + new Date(msgJson.response.value[0].startTime).toLocaleString() + ", end: " + new Date(msgJson.response.value[0].endTime).toLocaleString() + ", duration: 10 s";
          //     if (msgJson.valueType == "LAeq") {
          //       // console.log("NEW LA or LA data", msgJson.data.value[0].values);
          //       this.chartDataLAeq = msgJson.response.value[0].values;
          //     }
          //     else {
          //       // console.log("NEW LC or LC data", msgJson.data.value[0].values);
          //       this.chartDataLCeq = msgJson.response.value[0].values;
          //     }
          //     this.buildChart2();
          //   }
          // }
        }
      });
    } catch (e) {
      console.log("sound chart error", e);
    }
  }

  buildChart1() {
    if (this.chart) {
      console.log('SOUND CHART BUILD')
      this.chart.setTitle({ text: this.meterName + '1/3 Octave spectra' });
      this.chart.setSubtitle({ text: this.chart1Sublabel });
      this.chart.series[0].setData(this.chartDataCPBLZeq, false);
      this.chart.redraw();
    }
  }

  buildCompareChart1() {
    if (this.chart) {
      console.log('Add compare series', this.chartDataCompareCPBLZeq);
      // this.chart.setTitle({ text: this.meterName + '1/3 Octave spectra'});
      // this.chart.setSubtitle({ text: this.chart1Sublabel });
      this.chart.series[1].setData(this.chartDataCompareCPBLZeq, false);
      this.chart.redraw();
    }
  }

  buildChart2() {
    if (this.chart2) {
      this.chart2.setTitle({ text: this.meterName + 'LAeq & LCeq' });
      this.chart2.setSubtitle({ text: this.chart2Sublabel });
      this.chart2.series[0].setData(this.chartDataLAeq, false);
      this.chart2.series[1].setData(this.chartDataLCeq, false);
      this.chart2.redraw();
    }
  }

  create5MinAvg(result){
    if(result.valueType == 'Avg5minLAeq'){
      if(result.response.value.length > 0){
        this.avg5min = result.response.value[0];
        console.log('AVG 5 MIN',this.avg5min); 
      }
    }
  }

  createOctaveSpectra(result, isCompare) {
    
    if (result.valueType == 'CPBLZeq') {
      
      if (result.response.value.length > 0) {
        
        let cpbleqValue = result.response.value[0];
        let chartData = cpbleqValue.values;
        
        this.chart1Sublabel = "Start: " + new Date(cpbleqValue.startTime).toLocaleString() + ", end: " + new Date(cpbleqValue.endTime).toLocaleString();
        if (chartData.length > 0) {
          console.log('SOUND CHART Found CPBLZeq' + this.id, chartData, this.chart1Sublabel); 
          console.log('SOUND CHART BUILD create', chartData)
          // if (isCompare) {
          //   this.chartDataCompareCPBLZeq = chartData[chartData.length - 1];
          //   this.buildCompareChart1();
          // } else {
            this.hasChart1 = true;
            this.chartDataCPBLZeq = chartData[chartData.length - 1];
            this.buildChart1();
          // }
        }
      } else {
        this.hasChart1 = false;
        console.log('No data for cpblzeq chart');
      }
    }
  }

  createLAeq(result, isCompare) {
    if (result.valueType == 'LCeq') {
      let LCeqValue = result.response.value[0];
      if (typeof LCeqValue !== 'undefined') {
        if (isCompare) {
          // TODO
        } else {
          this.chartDataLCeq = LCeqValue.values;
          // this.thing.dataLceq = LCeqData;
          this.chart2Sublabel = "Start: " + new Date(LCeqValue.startTime).toLocaleString() + ", end: "
            + new Date(LCeqValue.endTime).toLocaleString() + ", duration: 10 s";
          this.buildChart2();
        }
      }
    }
  }

  createLCeq(result, isCompare) {
    if (result.valueType == 'LAeq') {
      let LAeqValue = result.response.value[0];
      if (typeof LAeqValue !== 'undefined') {
        if (isCompare) {
          // TODO
        } else {
          this.chartDataLAeq = LAeqValue.values;
          this.buildChart2();
        }
      }
    }
  }

  setupCompareChart(){
    let subC = this.thingService.getThingsWithObservations(this.selectedMeterToCompare).subscribe(dataC => {
      let dc: any = dataC;
      if(dc.observations){
        for (let i = 0; i < dc.observations.length; i++) {
          let obs = dc.observations[i];
          let obsRes = JSON.parse(obs.observationResult);
          console.log('Sound compare', obsRes);
          if (obsRes.result) {
            this.createOctaveSpectra(obsRes.result, true);
            // this.createLAeq(obsRes.result, false);
            // this.createLCeq(obsRes.result, false);
          }
        }
      }
    });
    this.subscriptions.push(subC);
  }

  setupChart() {
    let subT = this.thingService.getThingsWithObservations(this.id).subscribe(data => {
      let d: any = data;
      let CPBLZeq = [];
      let LCeq = [];
      this.meterName = ''; // d.description + ' - ' + d.name + ': ';
      if (d.observations) {
        for (let i = 0; i < d.observations.length; i++) {
          let obs = d.observations[i];
          console.log('Sound', obs);
          if (obs.observationResult) {
            let obsRes = JSON.parse(obs.observationResult);

            if (obsRes.result) {
              this.create5MinAvg(obsRes.result);
              this.createOctaveSpectra(obsRes.result, false);
              this.createLAeq(obsRes.result, false);
              this.createLCeq(obsRes.result, false);
            }
          }
        }
      }

      // // Get compare values
      // if (this.selectedMeterToCompare){
      //   this.setupCompareChart(); 
      // }

      // console.log("chart data", d);
      this.isReady = true;
    }, error => {
      console.log("error getting sound data for chart ", error);
      this.isReady = true;
    });
    this.subscriptions.push(subT);
  }

  ngOnInit() {
    // Hide legend

    // this.chart.legend.update({
    //   enabled: false,
    // });

    this.soundLevelLimit = this.getStoredSoundLimit();

    // console.log('soundmeters', this.soundmeters);
    // console.log('chart comp', this.id);
  }

  ngOnDestroy(): void {
    // Unsubscribe to all
    for (let i = 0; i < this.subscriptions.length; i++) {
      this.subscriptions[i].unsubscribe();
    }
    // stop connection
    this.connection.stop().catch(err => {
      console.log("Stop error", err.toString());
    });
  }
}
