
import { Subscription } from 'rxjs/Subscription';
import { ThingService } from 'app/thing.service';
import { Component, OnInit, Input, isDevMode } from '@angular/core';
import { environment } from 'environments/environment';
const signalR = require("@aspnet/signalr");

@Component({
  selector: 'lxeq-chart',
  templateUrl: './lxeq-chart.component.html',
  styleUrls: ['./lxeq-chart.component.css']
})
export class LxeqChartComponent implements OnInit {
  @Input('id') id;
  @Input('slider') slider: boolean = true;
  options2: any;
  chart2: any;
  soundLevelLimit = 0;
  chartDataLAeq = [];
  chartDataLCeq = [];
  chart2Sublabel;
  meterName;
  isReady: boolean = false;
  subscriptions: Array<Subscription> = new Array<Subscription>();
  connection;
  // signalrEndpoint = 'https://portal.monica-cloud.eu/cop/hub/signalR/wearableupdate';
  loaderUrl = "/assets/img/loader.svg";
  avg5min; 

  constructor(private thingService: ThingService) { 
    if (!isDevMode())
      this.loaderUrl = environment.baseUrl + '/assets/img/loader.svg'; //'/DOM/cop/ui/assets/img/loader.svg';

    // LCeq chart
    this.options2 = {
      chart: {
        // backgroundColor: '#f4f3ef',
        backgroundColor:'rgba(255, 255, 255, 0.0)',
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

  create5MinAvg(result){
    if(result.valueType == 'Avg5minLAeq'){
      if(result.response.value.length > 0){
        this.avg5min = result.response.value[0];
        console.log('AVG 5 MIN',this.avg5min); 
      }
    }
  }

  saveInstance2(chartInstance) {
    this.chart2 = chartInstance;
    this.setChartSoundLimit(this.chart2, this.soundLevelLimit);
    this.setupChart();
    this.updateChart();
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
    this.setChartSoundLimit(this.chart2, event.from);
  }

  ngOnInit() {
    console.log('Meter ID LXeq', this.id);
    this.soundLevelLimit = this.getStoredSoundLimit();
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
          // this.createOctaveSpectra(msgJson, false);
          this.createLAeq(msgJson, false);
          this.createLCeq(msgJson, false);
        }
      });
    } catch (e) {
      console.log("sound chart error", e);
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
            this.create5MinAvg(obsRes.result); 
            // this.createOctaveSpectra(obsRes.result, false);
            this.createLAeq(obsRes.result, false);
            this.createLCeq(obsRes.result, false);
          }
        }
      }
      this.isReady = true;
    }, error => {
      console.log("error getting sound data for chart ", error);
    });
    this.subscriptions.push(subT);
  }

  buildChart2() {
    if (this.chart2) {
      this.chart2.setTitle({ text: this.meterName + 'LAeq & LCeq' });
      this.chart2.setSubtitle({ text: this.chart2Sublabel });
      this.chart2.series[0].setData(this.chartDataLAeq, false);
      this.chart2.series[1].setData(this.chartDataLCeq, false);
      this.chart2.redraw();
      // this.chart2.reflow(); 
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
}
