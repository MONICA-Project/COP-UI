import { environment } from './../../environments/environment';
import { ThingService } from 'app/thing.service';
import { Subscription } from 'rxjs/Subscription';
import { Component, OnInit, isDevMode, Input } from '@angular/core';
const signalR = require("@aspnet/signalr");

@Component({
  selector: 'octave-spectra',
  templateUrl: './octave-spectra.component.html',
  styleUrls: ['./octave-spectra.component.css']
})
export class OctaveSpectraComponent implements OnInit {
  @Input('id') id;
  @Input('soundmeters') soundmeters;
  // signalrEndpoint = 'https://portal.monica-cloud.eu/cop/hub/signalR/wearableupdate';
  options: any;
  // options2: any;
  chart: any;
  // chart2: any;

  isReady: boolean = false;
  meterName;
  chart1Sublabel;
  // chart2Sublabel;
  // chartDataLAeq = [];
  // chartDataLCeq = [];
  chartDataCPBLZeq = []; //[45.36, 51, 53.45, 45.76, 41.79, 42.77, 38.99, 39.38, 73.22, 45.34, 48.77, 50.39, 45.54, 41.11, 39.98, 38.57, 37.02, 85.93, 30.52, 64.04, 20.8, 21.28, 19.5, 16.72, 15.62, 16.24, 14.71, 12.26, 10.45, 14.51, 15.14, 13.24, 10.47]; //[];
  chartDataCompareCPBLZeq = []; //[45.36, 51, 53.45, 45.76, 41.79, 42.77, 38.99, 39.38, 73.22, 45.34, 48.77, 50.39, 45.54, 41.11, 39.98, 38.57, 37.02, 85.93, 30.52, 64.04, 20.8, 21.28, 19.5, 16.72, 15.62, 16.24, 14.71, 12.26, 10.45, 14.51, 15.14, 13.24, 10.47]; //[];
  subscriptions: Array<Subscription> = new Array<Subscription>();
  connection;

  hasChart1 = false;
  // hasChart2 = false;

  // soundLevelLimit = 0;
  selectedMeterToCompare = 68;

  avg5min; 
  loaderUrl = "/assets/img/loader.svg";

  constructor(private thingService: ThingService) { 
    if (!isDevMode())
      this.loaderUrl = environment.baseUrl + '/assets/img/loader.svg'; //'/DOM/cop/ui/assets/img/loader.svg';

    this.options = {
      chart: {
        // backgroundColor: '#f4f3ef',
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
        // plotLines: [{
        //   id: 'sound-limit',
        //   value: this.soundLevelLimit,
        //   color: 'red',
        //   dashStyle: 'shortdash',
        //   width: 2,
        //   label: {
        //     text: ''
        //   }
        // }]
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
          // this.create5MinAvg(msgJson); 
          this.createOctaveSpectra(msgJson, false);
        }
      });
    } catch (e) {
      console.log("sound chart error", e);
    }
  }

  saveInstance(chartInstance) {
    this.chart = chartInstance;

    // this.setChartSoundLimit(this.chart, this.soundLevelLimit);
    this.setupChart();
    this.updateChart();
  }
  ngOnInit() {
  }

  buildChart1() {
    if (this.chart) {
      this.chart.setTitle({ text: this.meterName + '1/3 Octave spectra' });
      this.chart.setSubtitle({ text: this.chart1Sublabel });
      this.chart.series[0].setData(this.chartDataCPBLZeq, false);
      this.chart.redraw();
    }
  }

  createOctaveSpectra(result, isCompare) {
    if (result.valueType == 'CPBLZeq') {
      if (result.response.value.length > 0) {
        let cpbleqValue = result.response.value[0];
        let chartData = cpbleqValue.values;
        console.log('Found CPBLZeq', cpbleqValue); 
        this.chart1Sublabel = "Start: " + new Date(cpbleqValue.startTime).toLocaleString() + ", end: " + new Date(cpbleqValue.endTime).toLocaleString();
        if (chartData.length > 0) {
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

  setupChart() {
    let subT = this.thingService.getThingsWithObservations(this.id).subscribe(data => {
      let d: any = data;
      let CPBLZeq = [];
      let LCeq = [];
      this.meterName = ''; // d.description + ' - ' + d.name + ': ';
      if (d.observations) {
        for (let i = 0; i < d.observations.length; i++) {
          let obs = d.observations[i];
          let obsRes = JSON.parse(obs.observationResult);
          console.log('Sound', obsRes);
          if (obsRes.result) {
            // this.create5MinAvg(obsRes.result); 
            this.createOctaveSpectra(obsRes.result, false);
          }
        }
      }
      this.isReady = true;
    }, error => {
      console.log("error getting sound data for chart ", error);
    });
    this.subscriptions.push(subT);
  }
}
