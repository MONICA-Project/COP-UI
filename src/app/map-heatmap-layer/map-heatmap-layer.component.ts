import { Component, OnInit, ViewChild } from '@angular/core';
import { HeatmapLayer } from '@ngui/map';

@Component({
  selector: 'map-heatmap-layer',
  templateUrl: './map-heatmap-layer.component.html',
  styleUrls: ['./map-heatmap-layer.component.css']
})
export class MapHeatmapLayerComponent implements OnInit {

  positions = [];
  
  @ViewChild(HeatmapLayer) heatmapLayer: HeatmapLayer;
  heatmap: google.maps.visualization.HeatmapLayer;
  map: google.maps.Map;
  points = [];

  ngOnInit() {
    this.heatmapLayer['initialized$'].subscribe(heatmap => {
      // this.points = [
      //   {location:new google.maps.LatLng(37.782551, -122.445368), weight: 90},
      //   {location:new google.maps.LatLng(37.782745, -122.444586), weight: 150},
      //   {location:new google.maps.LatLng(37.782842, -122.443688), weight: 100}
      // ];
      this.heatmap = heatmap;
      this.heatmap
      this.map = this.heatmap.getMap();
      // let gradient = [
      //   'rgba(0, 255, 255, 0)',
      //   'rgba(0, 255, 255, 1)',
      //   'rgba(0, 191, 255, 1)',
      //   'rgba(0, 127, 255, 1)',
      //   'rgba(0, 63, 255, 1)',
      //   'rgba(0, 0, 255, 1)',
      //   'rgba(0, 0, 223, 1)',
      //   'rgba(0, 0, 191, 1)',
      //   'rgba(0, 0, 159, 1)',
      //   'rgba(0, 0, 127, 1)',
      //   'rgba(63, 0, 91, 1)',
      //   'rgba(127, 0, 63, 1)',
      //   'rgba(191, 0, 31, 1)',
      //   'rgba(255, 0, 0, 1)'
      // ];
      // this.heatmap.set('gradient', gradient);
      this.heatmap.set('radius', 20);
      this.points =  this.createHeatmap();
     
      // console.log(p);
    });
    
    // let points = this.createHeatmap();
    // console.log(points); 

  }
  setStuff(){
    let gradient = [
      'rgba((255,255,255,1)',
      'rgba(255,21,0,1)'
    ];
    this.heatmap.set('gradient', gradient);
    this.heatmap.set('radius', 20);
    this.heatmap.set('dissipating', true);
  }
  createHeatmap() {
    let points = [];
    let rowNo = 0;
    let data = this.getData();
    let startLat = data.lat_0;
    let startLon = data.lon_0;
    let cellsize = data.cellsize;

    for (let i = 0; i < data.data.length; i++) {
      let row = data.data[i];
      let colNo = 0;
      for (let j = 0; j < row.length; j++) {
        let val = row[j];
        val -= 30;
        val *= (255/90);
        let loc = { 
          location: new google.maps.LatLng(startLat + (cellsize * rowNo), startLon + (cellsize * colNo)),
          weight: val 
        };
        points.push(loc);
        colNo++;
      }
      rowNo++;
    }
    
    return points;
  }

  getData(){
    return {
      "lat_0": 50.705007,
      "lon_0": 7.136951,
      "nrow": 33,
      "ncols": 17,
      "cellsize": 0.0005,
      "timeStamp": "2018-05-02T13:55:28.850112",
      "units": "Leq - A weighted",
      "data": [
        [
          66.46,
          66.91,
          67.35,
          67.79,
          68.2,
          68.57,
          68.91,
          69.18,
          69.38,
          69.5,
          69.53,
          69.46,
          69.31,
          69.08,
          68.78,
          68.42,
          68.03
        ],
        [
          66.74,
          67.22,
          67.7,
          68.16,
          68.61,
          69.03,
          69.41,
          69.71,
          69.94,
          70.08,
          70.11,
          70.03,
          69.86,
          69.6,
          69.26,
          68.87,
          68.43
        ],
        [
          67.01,
          67.52,
          68.04,
          68.55,
          69.04,
          69.51,
          69.93,
          70.28,
          70.54,
          70.69,
          70.73,
          70.64,
          70.44,
          70.14,
          69.76,
          69.32,
          68.84
        ],
        [
          67.28,
          67.83,
          68.39,
          68.94,
          69.49,
          70,
          70.47,
          70.87,
          71.17,
          71.35,
          71.4,
          71.3,
          71.06,
          70.72,
          70.29,
          69.8,
          69.27
        ],
        [
          67.55,
          68.13,
          68.73,
          69.34,
          69.94,
          70.52,
          71.05,
          71.51,
          71.86,
          72.07,
          72.12,
          72,
          71.73,
          71.33,
          70.84,
          70.28,
          69.69
        ],
        [
          67.81,
          68.43,
          69.08,
          69.74,
          70.4,
          71.05,
          71.65,
          72.18,
          72.6,
          72.85,
          72.91,
          72.77,
          72.44,
          71.98,
          71.41,
          70.78,
          70.13
        ],
        [
          68.06,
          68.72,
          69.42,
          70.13,
          70.86,
          71.59,
          72.29,
          72.91,
          73.4,
          73.7,
          73.77,
          73.6,
          73.22,
          72.66,
          72.01,
          71.29,
          70.56
        ],
        [
          68.3,
          69,
          69.74,
          70.52,
          71.33,
          72.15,
          72.95,
          73.68,
          74.27,
          74.65,
          74.74,
          74.53,
          74.05,
          73.39,
          72.62,
          71.81,
          71
        ],
        [
          68.52,
          69.27,
          70.06,
          70.9,
          71.79,
          72.71,
          73.63,
          74.5,
          75.23,
          75.71,
          75.82,
          75.55,
          74.96,
          74.16,
          73.26,
          72.33,
          71.42
        ],
        [
          68.72,
          69.51,
          70.36,
          71.26,
          72.24,
          73.27,
          74.34,
          75.38,
          76.29,
          76.91,
          77.06,
          76.7,
          75.95,
          74.96,
          73.9,
          72.84,
          71.83
        ],
        [
          68.91,
          69.73,
          70.63,
          71.6,
          72.66,
          73.82,
          75.05,
          76.31,
          77.47,
          78.29,
          78.5,
          78.01,
          77.02,
          75.79,
          74.54,
          73.33,
          72.22
        ],
        [
          69.07,
          69.92,
          70.86,
          71.9,
          73.05,
          74.33,
          75.75,
          77.27,
          78.77,
          79.92,
          80.23,
          79.52,
          78.17,
          76.64,
          75.15,
          73.79,
          72.57
        ],
        [
          69.2,
          70.09,
          71.07,
          72.16,
          73.39,
          74.79,
          76.4,
          78.23,
          80.2,
          81.89,
          82.39,
          81.28,
          79.38,
          77.45,
          75.71,
          74.19,
          72.87
        ],
        [
          69.3,
          70.21,
          71.22,
          72.36,
          73.66,
          75.18,
          76.97,
          79.12,
          81.69,
          84.34,
          85.26,
          83.31,
          80.59,
          78.18,
          76.19,
          74.52,
          73.11
        ],
        [
          69.37,
          70.3,
          71.33,
          72.5,
          73.86,
          75.45,
          77.39,
          79.83,
          83.09,
          87.39,
          89.51,
          85.52,
          81.63,
          78.75,
          76.54,
          74.76,
          73.28
        ],
        [
          69.41,
          70.34,
          71.39,
          72.58,
          73.96,
          75.6,
          77.61,
          80.24,
          84,
          90.51,
          97.28,
          87.28,
          82.26,
          79.06,
          76.73,
          74.88,
          73.36
        ],
        [
          69.41,
          70.34,
          71.39,
          72.58,
          73.96,
          75.6,
          77.62,
          80.25,
          84.01,
          90.54,
          97.45,
          87.29,
          82.26,
          79.07,
          76.73,
          74.88,
          73.36
        ],
        [
          69.37,
          70.3,
          71.33,
          72.51,
          73.86,
          75.45,
          77.39,
          79.84,
          83.11,
          87.44,
          89.59,
          85.55,
          81.64,
          78.76,
          76.54,
          74.76,
          73.28
        ],
        [
          69.3,
          70.21,
          71.23,
          72.37,
          73.67,
          75.18,
          76.97,
          79.13,
          81.72,
          84.38,
          85.31,
          83.35,
          80.6,
          78.19,
          76.2,
          74.53,
          73.11
        ],
        [
          69.2,
          70.09,
          71.07,
          72.16,
          73.4,
          74.8,
          76.41,
          78.24,
          80.22,
          81.93,
          82.43,
          81.31,
          79.4,
          77.46,
          75.72,
          74.2,
          72.87
        ],
        [
          69.07,
          69.93,
          70.87,
          71.91,
          73.06,
          74.34,
          75.76,
          77.29,
          78.79,
          79.95,
          80.26,
          79.55,
          78.19,
          76.65,
          75.16,
          73.8,
          72.57
        ],
        [
          68.91,
          69.73,
          70.63,
          71.61,
          72.67,
          73.83,
          75.06,
          76.33,
          77.49,
          78.32,
          78.53,
          78.04,
          77.03,
          75.81,
          74.55,
          73.34,
          72.22
        ],
        [
          68.73,
          69.51,
          70.36,
          71.27,
          72.25,
          73.28,
          74.35,
          75.4,
          76.31,
          76.93,
          77.08,
          76.72,
          75.96,
          74.98,
          73.91,
          72.85,
          71.84
        ],
        [
          68.52,
          69.27,
          70.06,
          70.91,
          71.8,
          72.72,
          73.65,
          74.52,
          75.25,
          75.72,
          75.84,
          75.57,
          74.97,
          74.17,
          73.27,
          72.34,
          71.43
        ],
        [
          68.3,
          69.01,
          69.75,
          70.53,
          71.34,
          72.16,
          72.96,
          73.69,
          74.29,
          74.66,
          74.75,
          74.54,
          74.06,
          73.4,
          72.63,
          71.82,
          71
        ],
        [
          68.06,
          68.73,
          69.42,
          70.14,
          70.87,
          71.6,
          72.3,
          72.92,
          73.41,
          73.72,
          73.79,
          73.62,
          73.23,
          72.68,
          72.02,
          71.3,
          70.57
        ],
        [
          67.81,
          68.44,
          69.08,
          69.74,
          70.41,
          71.05,
          71.66,
          72.2,
          72.61,
          72.86,
          72.92,
          72.78,
          72.46,
          71.99,
          71.42,
          70.79,
          70.13
        ],
        [
          67.55,
          68.14,
          68.74,
          69.34,
          69.95,
          70.52,
          71.06,
          71.52,
          71.87,
          72.08,
          72.13,
          72.01,
          71.74,
          71.34,
          70.85,
          70.29,
          69.7
        ],
        [
          67.29,
          67.84,
          68.39,
          68.95,
          69.49,
          70.01,
          70.48,
          70.88,
          71.18,
          71.36,
          71.41,
          71.31,
          71.07,
          70.73,
          70.3,
          69.8,
          69.27
        ],
        [
          67.02,
          67.53,
          68.05,
          68.56,
          69.05,
          69.52,
          69.93,
          70.29,
          70.55,
          70.7,
          70.74,
          70.65,
          70.45,
          70.15,
          69.77,
          69.33,
          68.85
        ],
        [
          66.74,
          67.22,
          67.7,
          68.17,
          68.62,
          69.04,
          69.41,
          69.72,
          69.95,
          70.09,
          70.12,
          70.04,
          69.87,
          69.6,
          69.27,
          68.87,
          68.44
        ],
        [
          120.47,
          180.91,
          190.36,
          88.79,
          68.2,
          68.58,
          68.92,
          69.19,
          69.39,
          69.51,
          69.54,
          69.47,
          69.32,
          69.09,
          68.79,
          68.43,
          68.04
        ],
        [
          66.19,
          66.61,
          67.02,
          67.42,
          67.8,
          68.14,
          68.44,
          68.69,
          68.87,
          68.97,
          69,
          68.94,
          68.8,
          68.59,
          68.32,
          68,
          67.65
        ]
      ]
    };
  }

  toggleHeatmap() {
    this.heatmap.setMap(this.heatmap.getMap() ? null : this.map);
  }

  changeGradient() {
    let gradient = [
      'rgba((255,255,255,1)',
      'rgba(255,21,0,1)'
    ];
    this.heatmap.set('gradient', this.heatmap.get('gradient') ? null : gradient);
  }

  changeRadius() {
    this.heatmap.set('radius', this.heatmap.get('radius') ? null : 20);
  }

  changeOpacity() {
    this.heatmap.set('opacity', this.heatmap.get('opacity') ? null : 0.2);
  }

  loadRandomPoints() {
    this.points = [];

    for (let i = 0 ; i < 9; i++) {
      this.addPoint();
    }
  }

  addPoint() {
    let randomLat = Math.random() * 0.0099 + 37.782551;
    let randomLng = Math.random() * 0.0099 + -122.445368;
    let latlng = new google.maps.LatLng(randomLat, randomLng);
    this.points.push(latlng);
  }

  onMapReady(map) {
    console.log('map', map);
    console.log('markers', map.markers);  // to get all markers as an array 
    this.positions.push(new google.maps.LatLng(40.748817, -73.985428));
  }
  onIdle(event) {
    console.log('map', event.target);
  }
  onMarkerInit(marker) {
    console.log('marker', marker);
  }
  onMapClick(event) {
    this.positions.push(event.latLng);
    event.target.panTo(event.latLng);
    console.log('Positions: ', this.positions);
  }

}
