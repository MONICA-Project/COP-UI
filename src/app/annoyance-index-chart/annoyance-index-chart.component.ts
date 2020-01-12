import { ThingService } from 'app/thing.service';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'annoyance-index-chart',
  templateUrl: './annoyance-index-chart.component.html',
  styleUrls: ['./annoyance-index-chart.component.css']
})
export class AnnoyanceIndexChartComponent implements OnInit {
  @Input('id') id;
  options: any;
  chart: any;
  testData = [2, 3, 4, 5, 2, 2, 2, 1, 1, 1, 1, 4, 4, 4, 4, 4, 4, 5];
  constructor(private thingService: ThingService) { 
    // LCeq chart
    this.options = {
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
      legend: {
        enabled: false
      },
      xAxis: {
        labels: {
          format: '{value}'
        },
        allowDecimals: false,
        showLastLabel: true
      },
      yAxis: {
        min: 0,
        max:10,
        title: {
          text: ''
        },
        labels: {
          format: '{value}'
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
        // headerFormat: '<b>{series.name}</b><br/>',
        // pointFormat: '{point.y} dB',
        crosshairs: true,
        shared: true,
        valueSuffix: ''
      },
      series: [{
        color: '#68B3C8',
        name: 'Annoyance Index',
        data: this.testData
      }]
    };
  }

  ngOnInit() {
  }

  saveInstance(chartInstance) {
    this.chart = chartInstance;
  }

  buildChart() {
    if (this.chart) {
      this.chart.setTitle({ text: 'Annoyance index' });
      this.chart.setSubtitle({ text: 'Last 30 minutes' });
      this.chart.series[0].setData(this.testData, false);
      this.chart.redraw();
    }
  }

  test(){
    if(this.testData.length > 30){
      this.testData.splice(0,1);
    }
    
    this.testData.push(Math.round(Math.random()*10));
    this.buildChart(); 
    console.log('TEST', this.testData);
  }
}
