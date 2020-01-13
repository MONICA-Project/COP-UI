import { IncidentService } from 'app/incident.service';
import { Observable } from 'rxjs/Observable';
import { ThingService } from './../thing.service';
import { ZoneService } from './../zone.service';
import { CrowdComponent } from './../crowd/crowd.component';
import { Component, OnInit, Input, isDevMode, ViewChild } from '@angular/core';
import { PersonService } from 'app/person.service';
import { Subscription } from 'rxjs/Subscription';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { PlatformLocation } from '@angular/common';
import { HeatmapLayer } from '@ngui/map';
const Highcharts = require('highcharts');
const signalR = require("@aspnet/signalr");
import {} from '@types/googlemaps';
import { environment } from 'environments/environment';
import * as moment from 'moment';
import MarkerClusterer from '@google/markerclusterer';

@Component({
  selector: 'map-cop',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, OnDestroy {
  @Input('pre_selected_filters') preSelectedFilters;
  @Input('id') id: string;
  baseUrl = '';
  autoOn = true;
  selectedMarker;
  selectedPolygon;
  person;
  thing = null;
  soundPath; 
  zone;
  event = {
    center: {lat: 53.554132, lng: 9.971055},
    zoom: 16,
    scrollwheel: false
  };
  soundHeatMap;
  incident;
  connection;
  connection2;

  markerSize = [22, 22];
  markerPinSize = [40, 40];

  marker = {
    display: true,
    lat: null,
    lng: null,
    id: null,
    name: null,
    type: null,
    orgType: null
  };

  polygon = {
    id: null,
    type: null
  }

  hasSelected = false;
  filters;
  positions = [];
  zones = [];
  circles = [];
  labelMarkers = [];
  test;
  zonePositions = [
    {
      "id": "Zone_A",
      "type": "Zone",
      // "paths": [[
      //   { lat: 50.709983, lng: 7.146993 },
      //   { lat: 50.709276, lng: 7.148108 },
      //   { lat: 50.710751, lng: 7.150909 },
      //   { lat: 50.711566, lng: 7.148838 }
      // ]]
      "paths": [
        [50.71182315536206, 7.14008109913636],
        [50.71334558337807, 7.141668746037646],
        [50.7133103980295, 7.143613379800884],
        [50.71226229877776, 7.144817495750752],
        [50.71142933111545, 7.144380577766361],
        [50.7109772712284, 7.141523932599785],
        [50.71182315536206, 7.14008109913636]
      ]
    },
    {
      "id": "Zone_B",
      "type": "Zone",
      "paths": [
        [50.709983, 7.146993],
        [50.709276, 7.148108],
        [50.710751, 7.150909],
        [50.711566, 7.148838]
      ]
    },
    {
      "id": "Zone_C",
      "type": "Zone",
      // "paths": [[
      //   { lat: 50.706761, lng: 7.146350 },
      //   { lat: 50.706302, lng: 7.148245},
      //   { lat: 50.707933, lng: 7.148502 }
      // ]]
      "paths": [
        [50.706761, 7.146350],
        [50.706302, 7.148245],
        [50.707933, 7.148502]
      ]
    }
  ]

  // charts
  historicChartOptions: any;
  historicChart:any;

  soundMeterOptions: any;
  soundMeterchart: any;

  @ViewChild(HeatmapLayer) heatmapLayer: HeatmapLayer;
  heatmap: google.maps.visualization.HeatmapLayer;
  map: google.maps.Map;
  heatMapOverlay: google.maps.GroundOverlay;
  bounds = { north: 55.674531, south: 55.673326, east:12.568821 , west:  12.564993 };

  points = [];
  constructor(private zoneService: ZoneService, private personService: PersonService,
    private thingService: ThingService, private incidentService: IncidentService, private platformLocation: PlatformLocation) {
    if (!isDevMode())
      this.baseUrl = environment.baseUrl;
  }

  subscriptions: Array<Subscription> = new Array<Subscription>();

  ngOnInit() {
    this.setupFilters();
  }

  ngOnDestroy(): void {
    // console.log('Unsubscribe to all');
    for (let i = 0; i < this.subscriptions.length; i++) {
      this.subscriptions[i].unsubscribe();
    }

    // stop connection incidents
    if(this.connection){
      this.connection.stop().catch(err => {
        console.log("Stop error", err.toString());
      });
    }

    // stop connection person update
    if(this.connection2){
      this.connection2.stop().catch(err => {
        console.log("Stop error", err.toString());
      });
    }
  }

   /**********************************
   * SETUP POSITIONS, UPDATES AND ZONES (POLYGONS)
  ************************************/

  panToEventCenter(){
    if(this.event.center){
      let l:any = this.event.center; 
      this.map.panTo(l);
    }
  }

  setupEvent(){
    // Hamburg winterdom coords 53.553860, 9.968248
    this.zoneService.getEvent().subscribe(data =>{
      // console.log('GOT EVENT', data); 
      let d: any = data;
      if(data){
        this.event.center.lat = d.lat
        this.event.center.lng = d.lon;
        this.event.zoom = d.zoom; 
        // d.location =  new google.maps.LatLng(d.lat, d.lon);
        // this.event = d;
        // this.map.setCenter(d.location);
        this.map.panTo(this.event.center);
        // console.log('EVENT', d); 
      }
    }, error => {
      console.log('error event', error);
    });
  }

  getThingPositions() {
    let subC = this.thingService.getCameras().subscribe(data => {
      // console.log('Camera', data);
      this.setupThingPositions(data)
    }, error => {
      console.log('Error getting cameras');
    });
    this.subscriptions.push(subC);

    // let sub =  this.thingService.getWindSpeed().subscribe(data => {
    //   console.log('Wind meters', data); 
    //   this.setupThingPositions(data);
    // }, error => {
    //   console.log('Error getting wind meters');
    // });
    // this.subscriptions.push(sub);

    // let subT =  this.thingService.getTemperature().subscribe(data => {
    //   console.log('Temperature meters', data); 
    //   this.setupThingPositions(data);
    // }, error => {
    //   console.log('Error getting temperature meters');
    // });
    // this.subscriptions.push(subT);
  }

  getSoundPositions() {
    let subC = this.thingService.getSoundLevels().subscribe(data => {
      // console.log('Sound', data);
      let d: any = data;
      this.setupThingPositions(d);
    }, error => {
      console.log("error", error);
    });
    this.subscriptions.push(subC);
  }

  // SECURITY INCIDENTS
  getIncidentPositions() {
    let subI = this.incidentService.getIncidents('', 'ONGOING', '', 0).subscribe(data => {
      let d: any = data;
      
      this.setupIncidentPositions(d);
    }, error => {
      console.log("error", error);
    });
    this.subscriptions.push(subI);
  }

  updatesIncident() {
    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(environment.signalRUrl)
        .configureLogging(signalR.LogLevel.Information)
        .build();
      this.connection.start().catch(err => {
        console.log("error", err.toString());
        // this.updatesIncident(); 
      });

      this.connection.on("Incidents", (message) => {
        let msgJson = JSON.parse(message);
        // console.log("SIGNALR INCIDENT", msgJson);
        if (msgJson.status == "ONGOING" || msgJson.status == "RESOLVED") {
          let sub = this.incidentService.getIncidentById(msgJson.incidentid).subscribe(data => {
            let d: any = data; 
            if(msgJson.status == "ONGOING"){
              this.setupIncidentPositions([data]);
            } else {
              this.removePosition(msgJson.incidentid, d.type);
            }
          }, error => {
            console.log("error", error);
          });
          this.subscriptions.push(sub);
        }
      });

      // this.connection.onclose((error) => {
      //   console.log("DISCONNECTED", error); 
      // }); 
    } catch (e) {

      console.log('updatesIncident error', e);
      // stop connection
      this.connection.stop().catch(err => {
        console.log("Stop error", err.toString());
      });
    }
  }

  // SOUND FEEDBACK INCIDENTS
  getSoundIncidentPositions() {
    let subT = this.incidentService.getSoundFeedbackTypes().subscribe(types => {
      // console.log('Feedback types', types); 
      let t: any = types;
      for(let i = 0; i<t.length; i++){
        // console.log('Feedback type', t[i]); 
        let subI = this.incidentService.getSoundIncidents(t[i].feedbackTypeName).subscribe(data => {
          // console.log('Sound Incidents:' + t[i].feedbackTypeName, data);
          let d: any = data;
          this.setupSoundIncidentPositions(d);
        }, error => {
          console.log("error", error);
        });
        this.subscriptions.push(subI);
      }
    }); 
    this.subscriptions.push(subT);
  }

  updatesSoundIncident() {
    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(environment.signalRUrl)
        .configureLogging(signalR.LogLevel.Information)
        .build();
      this.connection.start().catch(err => {
        console.log("error", err.toString());
      });

      this.connection.on("SoundIncidents", (message) => {
        let msgJson = JSON.parse(message);
        console.log("SIGNALR SOUND FEEDBACK", msgJson);
        this.getSoundIncidentPositions(); // TODO should get one feedback by id instead of all
      });
    } catch (e) {
      console.log('updatesIncident error', e);
      // stop connection
      this.connection.stop().catch(err => {
        console.log("Stop error", err.toString());
      });
    }
  }

  getPeoplePositions() {
    let subPu = this.personService.getAllPeople().subscribe(data => {
      console.log('ALL PEOPLE', data); 
      this.setupPersonPositions(data);
    }, error => {
      console.log("error", error);
    });
    this.subscriptions.push(subPu);
  }

  updatesPeople() {
    try {
      this.connection2 = new signalR.HubConnectionBuilder()
        .withUrl(environment.signalRUrl)
        .configureLogging(signalR.LogLevel.Information)
        .build();
      this.connection2.start().catch(err => {
        console.log("error", err.toString());
      });

      this.connection2.on("peoplewithwearablesUpdate", (message) => {
        let msgJson = JSON.parse(message);
        console.log("PEOPLE SIGNALR", msgJson);
        if (msgJson.status == "posupdate" || msgJson.type == "posupdate" ) {
          this.updatePeoplePosition(msgJson);
        }
      });

      // this.connection2.onclose((error) => {
      //   console.log("DISCONNECTED", error); 
      // }); 
    } catch (e) {
      console.log('updatesIncident error', e);
      // stop connection
      this.connection2.stop().catch(err => {
        console.log("Stop error", err.toString());
      });
    }
  }

  updatePeoplePosition(updatedPos){
    for(let p = 0; p<this.positions.length; p++){
      if(updatedPos.peopleid == this.positions[p].id && this.positions[p].orgType == "PERSON"){
        this.positions[p].position = new google.maps.LatLng(updatedPos.lat, updatedPos.lon);
      }
    }
  }

  /**********************************
   * DETAIL INFO (RIGHT COL)
  ************************************/
  showInfo() {
    this.hasSelected = true;
  }

  hideInfo() {
    this.hasSelected = false;
    if (this.selectedMarker && typeof this.selectedMarker.nguiMapComponent !== 'undefined')
      this.selectedMarker.nguiMapComponent.closeInfoWindow('iw');
  }

  clearSelected() {
    this.person = null;
    this.thing = null;
    this.zone = null;
    this.soundHeatMap = null;
    this.incident = null;
  }

  reloadSoundHeatMap() {
    let sub = this.thingService.getSoundHeatMap().subscribe(data => {
      // console.log(data);
      let d: any = data;
      this.soundHeatMap = d;
      this.soundHeatMap.markers = [{ title: 'Start', pos: new google.maps.LatLng(d.latStart, d.lonStart) },
      { title: 'End', pos: new google.maps.LatLng(d.latEnd, d.lonEnd) }];

    }, error => {
      console.log("error", error);
    });
    this.subscriptions.push(sub);
  }


// HISTORIC TEMPERATURE CHART
  savehistoricChartInstance(chartInstance) {
    this.historicChart = chartInstance;
  }

  windInfo(tempObj) {
    // Get current temperature
    let sub = this.thingService.getThingWithObservationById(tempObj.id).subscribe(data => {
      // console.log('WIND CURRENT', data);
      let d: any = data; 
      if(d.observations && d.observations.length > 0){
        let obs = d.observations[0] ? JSON.parse(d.observations[0].observationResult) : null;
        // console.log('WIND', obs); 
        this.thing.value = obs.result;
        this.thing.unit = ' m/s';
        this.thing.timestamp = obs.phenomenonTime;
      }
    }, error => {
      console.log('error getting current wind', error); 
    })
    this.subscriptions.push(sub); 

    // Get historic temperature data
    let wind = [];
    // let wind = [
    //   [1246406400000, 3],
    //   [1246492800000, 4],
    //   [1246579200000, 7],
    //   [1246665600000, 7],
    //   [1246752000000, 8],
    //   [1246838400000, 5],
    //   [1246924800000, 5],
    //   [1247011200000, 5],
    //   [1247097600000, 3],
    //   [1247184000000, 2],
    //   [1247270400000, 3],
    //   [1247356800000, 6],
    //   [1247443200000, 7],
    //   [1247529600000, 8],
    //   [1247616000000, 7],
    //   [1247702400000, 3],
    //   [1247788800000, 8],
    //   [1247875200000, 1],
    //   [1247961600000, 2],
    //   [1248048000000, 4],
    //   [1248134400000, 7],
    //   [1248220800000, 7],
    //   [1248307200000, 6],
    //   [1248393600000, 3],
    //   [1248480000000, 3],
    //   [1248566400000, 8],
    //   [1248652800000, 2],
    //   [1248739200000, 8],
    //   [1248825600000, 4],
    //   [1248912000000, 5],
    //   [1248998400000, 6]
    // ];
    if(wind.length > 0)
      this.setupHistoricChart(wind, '', 'Wind (Beaufort) today');
  }

  temperatureInfo(tempObj) {
    // Get current temperature
    let sub = this.thingService.getThingWithObservationById(tempObj.id).subscribe(data => {
      // console.log('TEMPERATURE CURRENT', data);
      let d: any = data; 
      if(d.observations && d.observations.length > 0){
        let obs = d.observations[0] ? JSON.parse(d.observations[0].observationResult) : null;
        // console.log('TEMPERATURE', obs); 
        this.thing.value = obs.result
        this.thing.unit = ' °C';
        this.thing.timestamp = obs.phenomenonTime;
      }
    }, error => {
      console.log('error getting current temperature', error); 
    })
    this.subscriptions.push(sub); 

    // Get historic temperature data
    let averages = [];
    // let averages = [
    //   [1246406400000, 21.5],
    //   [1246492800000, 22.1],
    //   [1246579200000, 23],
    //   [1246665600000, 23.8],
    //   [1246752000000, 21.4],
    //   [1246838400000, 21.3],
    //   [1246924800000, 18.3],
    //   [1247011200000, 15.4],
    //   [1247097600000, 16.4],
    //   [1247184000000, 17.7],
    //   [1247270400000, 17.5],
    //   [1247356800000, 17.6],
    //   [1247443200000, 17.7],
    //   [1247529600000, 16.8],
    //   [1247616000000, 17.7],
    //   [1247702400000, 16.3],
    //   [1247788800000, 17.8],
    //   [1247875200000, 18.1],
    //   [1247961600000, 17.2],
    //   [1248048000000, 14.4],
    //   [1248134400000, 13.7],
    //   [1248220800000, 15.7],
    //   [1248307200000, 14.6],
    //   [1248393600000, 15.3],
    //   [1248480000000, 15.3],
    //   [1248566400000, 15.8],
    //   [1248652800000, 15.2],
    //   [1248739200000, 14.8],
    //   [1248825600000, 14.4],
    //   [1248912000000, 15],
    //   [1248998400000, 13.6]
    // ];
    if(averages.length > 0)
      this.setupHistoricChart(averages, '°C', 'Temperature today');
  }

  setupHistoricChart(data, unit, name){
    this.historicChartOptions = {
      chart:{
        height: '200px'
      },
      title: {
        text: name,
        style: {
          "fontSize": "12px"
        }
      },
      xAxis: {
        type: 'datetime'
      },
      yAxis: {
        title: {
          text: null
        },
        labels: {
          format: '{value} ' + unit
        }
      },
      credits:{
        enabled:false
      },
      tooltip: {
        crosshairs: true,
        shared: true,
        valueSuffix: '' + unit
      },
      legend: {
        enabled:false
      },
      series: [{
        color: '#F3BB45',
        name: name,
        data: data,
        marker: {
          radius: 2,
          // fillColor: 'white',
          // lineWidth: 2,
          // lineColor: Highcharts.getOptions().colors[0]
        }
      }]
    }
  }

// SOUND LEVELS CHART
  saveSoundMeterChartInstance(chartInstance) {
    this.soundMeterchart = chartInstance;
    this.soundMeterchart.setTitle({ text: 'LAeq and LCeq' });
    this.soundMeterchart.setSubtitle({ text: this.thing.label });
    this.soundMeterchart.series[0].setData(this.thing.dataLaeq, false);
    this.soundMeterchart.series[1].setData(this.thing.dataLceq, false);
    this.soundMeterchart.redraw();
  }

  soundMeterInfo(soundObj) {
    for (let i = 0; i < soundObj.observations.length; i++) {
      let obs = soundObj.observations[i];
      let obsRes = JSON.parse(obs.observationResult);
      if (obsRes.result.valueType == 'LCeq') {
        let LCeqValue = obsRes.result.data.value[0];
        let LCeqData = LCeqValue.values;
        this.thing.dataLceq = LCeqData;
        this.thing.label = "Start: " + new Date(LCeqValue.startTime).toLocaleString() + ", end: " + new Date(LCeqValue.endTime).toLocaleString() + ", duration: 10 s";
      } else if (obsRes.result.valueType == 'LAeq') {
        let LAeqValue = obsRes.result.data.value[0];
        let LAeqData = LAeqValue.values;
        this.thing.dataLaeq = LAeqData;
      }
    }
    // LCeq chart
    this.soundMeterOptions = {
      title: { text: '' },
      subtitle: {
        text: ''
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
        title: {
          text: 'dB'
        }
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
        data: []
      }]
    };
  }

  cameraInfo(cameraObj) {
    // Get historic visitors count
    let visitors = []; 
    // let visitors = [
    //   [1246406400000, 21],
    //   [1246492800000, 22],
    //   [1246579200000, 23],
    //   [1246665600000, 23],
    //   [1246752000000, 21],
    //   [1246838400000, 21],
    //   [1246924800000, 18],
    //   [1247011200000, 15],
    //   [1247097600000, 16],
    //   [1247184000000, 17],
    //   [1247270400000, 17],
    //   [1247356800000, 17],
    //   [1247443200000, 17],
    //   [1247529600000, 16],
    //   [1247616000000, 17],
    //   [1247702400000, 16],
    //   [1247788800000, 17],
    //   [1247875200000, 18],
    //   [1247961600000, 17],
    //   [1248048000000, 14],
    //   [1248134400000, 13],
    //   [1248220800000, 15],
    //   [1248307200000, 14],
    //   [1248393600000, 15],
    //   [1248480000000, 15],
    //   [1248566400000, 15],
    //   [1248652800000, 15],
    //   [1248739200000, 14],
    //   [1248825600000, 14],
    //   [1248912000000, 15],
    //   [1248998400000, 13]
    // ];

    if(visitors.length > 0)
      this.setupHistoricChart(visitors, '', 'Visitors today');

    console.log('cameraInfo', cameraObj); 
    if (cameraObj.observations) {
      for (let i = 0; i < cameraObj.observations.length; i++) {
        let obs = cameraObj.observations[i];
        let obsRes = JSON.parse(obs.observationResult);
        console.log('CAMERA obs', obsRes);
        if (obsRes.result) {
          if (obsRes.result.density_count) {
            this.thing.count = obsRes.result.density_count;
            this.thing.timestamp = obsRes.result.timestamp_2;
          }
        }
      }
    }
  }

  sendMessage(){
    let message = {
      "message": this.person.message
    };
    let sub = this.personService.sendMessage(this.person.id, message).subscribe(response =>{
      let resp: any = response; 
      if(resp.success){
        console.log('MESSAGE WAS SENT', message);
        this.person.message = "";
        this.person.sentSuccess = "The message was successfully sent to " + this.person.fullName + "";
      }
    }, error => {
      console.log('MESSAGE WAS Error', error, message); 
      this.person.message = "";
      this.person.sentSuccess = "The message was successfully sent to " + this.person.fullName + "";
    });
    this.subscriptions.push(sub);

  }

  clearMessage(){
    this.person.sentSuccess = null;
  }

  /**********************************
   * ZONES / POLYGONS
  ************************************/
  setupCircles(circleList){
    console.log('CIRCLES', circleList);
    for (let i = 0; i < circleList.length; i++) {
      let c = circleList[i];
      let circleObj = {
        id: c.id,
        paths: new google.maps.LatLng(c.boundingPolygon[0][0], c.boundingPolygon[0][1]),
        visible: this.isFilterSelected(Filter.Zone),
        type: Filter.Zone, 
        fill: c.metadata,
        capacity: null,
        color: this.getZoneColor(0, c.type)
      }; 

      this.circles.push(circleObj);
    }
    console.log('CIRCLES AFTER', this.circles);
  }

  setupPolygons(zoneList) {
    for (let i = 0; i < zoneList.length; i++) {
      // console.log('ONE ZONE', zoneList[i]);
      let z = zoneList[i];
      let fill = this.getFill(z.peoplecount, z.capacity);
      let polyObj = {
        id: z.id,
        paths: this.convertPaths(z.boundingPolygon),
        visible: this.isFilterSelected(Filter.Zone),
        type: Filter.Zone, 
        fill: fill,
        capacity: z.capacity,
        color: this.getZoneColor(fill, z.type)
      }; 

      this.addOrReplaceZone(polyObj); 

      // Temp solution to show polygon label, marker with label is added
      if(z.metadata){
        console.log('ADD MARKER WITH LABEL', z); 
        this.addMarkerWithLabel(z);
      }

      // this.zones.push({
      //   id: z.id,
      //   paths: this.convertPaths(z.boundingPolygon),
      //   visible: this.isFilterSelected(Filter.Zone),
      //   type: Filter.Zone, 
      //   fill: fill,
      //   color: this.getZoneColor(fill) // TODO TEST
      // });
    }
  }

  addMarkerWithLabel(z){
    let m = {
      pos: new google.maps.LatLng(z.boundingPolygon[0][0], z.boundingPolygon[0][1]),
      label: '' + z.metadata + '',
      type: Filter.ZoneLabels, 
      visible: this.isFilterSelected(Filter.ZoneLabels)
    }
    this.labelMarkers.push(m);
  }

  getZoneColor(fill, type){
    let c = '#337ab7'; 
    if(type == 'EventMapPoly' || type == 'EventMapCircle'){
      c = '#302782';
    } else {
      
      if(fill){
        if(fill >= 0 && fill <63){
          c = 'green';
        } else if(fill >= 63 && fill <100){
          c = 'orange'
        } else if (fill >= 100){
          c = 'red'
        }
      }
    }
    return c; 
  }

  getFill(count, capacity){
    // console.log('Calc fill', count, capacity); 
    let fill = 0; 
    if(capacity && count){
      fill = capacity > 0 ? Math.round((count / capacity) * 100) : 0; 
    }
    return fill;
    
  }

  getProgressBarColor(fill){
    let c = ''; 
    if(fill){
      if(fill >= 0 && fill <50){
        c = 'progress-bar-success';
      } else if(fill >= 50 && fill <80){
        c = 'progress-bar-warning'
      } else if (fill >= 80){
        c = 'progress-bar-danger'
      }
    }
    return c;
  }

  convertPaths(points) {
    let coords = [];
    let pos = [];
    for (let p = 0; p < points.length; p++) {
      let latitude = points[p][0];
      let longitude = points[p][1];
      pos.push(new google.maps.LatLng(latitude, longitude));
    }
    coords.push(pos);
    return coords;
  }

  onPolygonClick({ target: polygon }, zone) {
    this.clearSelected();
    // console.log(polygon);
    // this.selectedMarker = polygon;
    this.hasSelected = true;
    this.marker.id = null;
    this.marker.type = null;
    this.polygon.id = zone.id;
    this.polygon.type = zone.type;
    if (this.selectedMarker)
      this.selectedMarker.nguiMapComponent.closeInfoWindow('iw');

    let subZ = this.zoneService.getZoneById(zone.id).subscribe(data => {
      this.zone = data;
      this.zone.fill = this.getFill(this.zone.peoplecount, this.zone.capacity);
    }, error => {
      console.log("error onPolygonClick ", error);
    });
    this.subscriptions.push(subZ);
  }

  showHidePolygons(type: string, show) {
    // polygons
    for (let i = 0; i < this.zones.length; i++) {
      let p = this.zones[i];
      if (p.type === type) {
        p.visible = show;
      }
    }

    // circles
    for (let i = 0; i < this.circles.length; i++) {
      let p = this.circles[i];
      if (p.type === type) {
        p.visible = show;
      }
    }
  }

  showHideZoneLabels(type: string, show){
    // markers with labels
    for (let i = 0; i < this.labelMarkers.length; i++) {
      let p = this.labelMarkers[i];
      // if (p.type === type) {
        p.visible = show;
      // }
    }
  }

  getZonePositions() {
    try {
      let subB = this.zoneService.getAllZones().subscribe(data => {
        this.setupPositions(data);
        console.log('All zones', data);
      }, error => {
        console.log("error", error);
      });
      this.subscriptions.push(subB);

      // // Beer stands
      // let subB = this.zoneService.getBeerStands().subscribe(data => {
      //   this.setupPositions(data);
      // }, error => {
      //   console.log("error", error);
      // });
      // this.subscriptions.push(subB);
      // // Toilets
      // let subZ = this.zoneService.getToilets().subscribe(data => {
      //   this.setupPositions(data);
      // }, error => {
      //   console.log("error", error);
      // });
      // this.subscriptions.push(subZ);
      // // Handicapped toilets
      // let subH = this.zoneService.getHandicapToilets().subscribe(data => {
      //   this.setupPositions(data);
      // }, error => {
      //   console.log("error", error);
      // });
      // this.subscriptions.push(subH);
      // // Stages
      // let subZo = this.zoneService.getStages().subscribe(data => {
      //   this.setupPositions(data);
      // }, error => {
      //   console.log("error", error);
      // });
      // this.subscriptions.push(subZo);
      // // Command center
      // let subCc = this.zoneService.getCommandCenter().subscribe(data => {
      //   this.setupPositions(data);
      // }, error => {
      //   console.log("error", error);
      // });
      // this.subscriptions.push(subCc);
      // // Emergency exits
      // let subE = this.zoneService.getEmergencyExit().subscribe(data => {
      //   this.setupPositions(data);
      // }, error => {
      //   console.log("error", error);
      // });
      // // Entrance
      // let subEn = this.zoneService.getEntrance().subscribe(data => {
      //   this.setupPositions(data);
      // }, error => {
      //   console.log("error", error);
      // });
      // this.subscriptions.push(subEn);
      // // First Aid
      // let subF = this.zoneService.getFirstAidPoint().subscribe(data => {
      //   this.setupPositions(data);
      // }, error => {
      //   console.log("error", error);
      // });
      // this.subscriptions.push(subF);
      // // Cocktail stands
      // let subC = this.zoneService.getCocktailStand().subscribe(data => {
      //   this.setupPositions(data);
      // }, error => {
      //   console.log("error", error);
      // });
      // this.subscriptions.push(subC);
      // // Rides
      // let subR = this.zoneService.getRides().subscribe(data => {
      //   console.log('Rides', data);
      //   this.setupPositions(data);
      // }, error => {
      //   console.log("error", error);
      // });
      // this.subscriptions.push(subR);
      // // Fast food
      // let subFf = this.zoneService.getFastFood().subscribe(data => {
      //   console.log('Fast food', data);
      //   this.setupPositions(data);
      // }, error => {
      //   console.log("error", error);
      // });
      // this.subscriptions.push(subFf);
      // // Restaurants
      // let subRe = this.zoneService.getRestaurants().subscribe(data => {
      //   console.log('Restaurants', data);
      //   this.setupPositions(data);
      // }, error => {
      //   console.log("error", error);
      // });
      // this.subscriptions.push(subRe);
      // // Attraction
      // let subA = this.zoneService.getAttractions().subscribe(data => {
      //   console.log('Attractions', data);
      //   this.setupPositions(data);
      // }, error => {
      //   console.log("error", error);
      // });
      // this.subscriptions.push(subA);
      // // Shop
      // let subS = this.zoneService.getShops().subscribe(data => {
      //   console.log('Shops', data);
      //   this.setupPositions(data);
      // }, error => {
      //   console.log("error", error);
      // });
      // this.subscriptions.push(subS);
      // // ATM
      // let subAt = this.zoneService.getATM().subscribe(data => {
      //   console.log('ATM', data);
      //   this.setupPositions(data);
      // }, error => {
      //   console.log("error", error);
      // });
      // this.subscriptions.push(subAt);
      // // Quiet zones
      // let subQ = this.zoneService.getQuietZones().subscribe(data => {
      //   this.setupPositions(data);
      // }, error => {
      //   console.log("error", error);
      // });
      // this.subscriptions.push(subQ);

      // Zones (with people count)
      let subZon = this.zoneService.getZones().subscribe(data => {
        this.setupPolygons(data);
      }, error => {
        console.log("error", error);
      });
      this.subscriptions.push(subZon);
      
      // // Event zones
      // let subZonE = this.zoneService.getEventMapPolyZone().subscribe(data => {
      //   this.setupPolygons(data);
      // }, error => {
      //   console.log("error", error);
      // });
      // this.subscriptions.push(subZonE);
      // // Event zone circles
      // let subZonC = this.zoneService.getEventMapCircleZone().subscribe(data => {
      //   this.setupCircles(data);
      // }, error => {
      //   console.log("error", error);
      // });
      // this.subscriptions.push(subZonC);
    } catch (e) {
      console.log('zone error', e);
    }
  }

  testUpdateZone(){
    let t = {
      "type": "peoplecountupdate",
      "zoneid": 112,
      "peoplecount": 14,
      "timestamp": "2018-08-31T12:04:28.1959558+00:00"
    }; 

    for(let i = 0; i<this.zones.length; i++){
      if(t.zoneid == this.zones[i].id){
        console.log('Updating zone!');
        let z = this.zones[i];
        let newCount = t.peoplecount + 100;
        let fill = this.getFill(newCount, z.capacity);
        let polyObj = {
          id: z.id,
          paths: z.paths,
          visible: z.visble,
          type: Filter.Zone, 
          fill: fill,
          capacity: z.capacity,
          color: this.getZoneColor(fill, z.type)
        }
        this.addOrReplaceZone(polyObj);
        break;
      }
    }
  }

  updatesZones() {
    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(environment.signalRUrl)
        .configureLogging(signalR.LogLevel.Information)
        .build();

      this.connection.start().catch(err => {
        console.log("Reconnect to update zone", err.toString());
      });
      
      this.connection.on("ZoneUpdate", (message) => {
        // console.log('ZoneUpdate map SIGNR', message);
        let msgJson = JSON.parse(message);
        for(let i = 0; i<this.zones.length; i++){
          if(msgJson.zoneid == this.zones[i].id){
            let z = this.zones[i];
            let fill = this.getFill(msgJson.peoplecount, z.capacity);
            let polyObj = {
              id: z.id,
              paths: z.paths,
              visible: z.visible,
              type: Filter.Zone, 
              fill: fill,
              capacity: z.capacity,
              color: this.getZoneColor(fill, z.type)
            }
            this.addOrReplaceZone(polyObj);
            break;
          }
        }
      });
    } catch (e) {
      console.log("sound chart error", e);
    }
  }

  /**********************************
   * MARKERS
  ************************************/
  getIncidentIcon(prio: Number) {
    switch (prio) {
      case 3:
        return this.baseUrl + '/assets/img/pin_alert_red.svg';
      case 2:
        return this.baseUrl + '/assets/img/pin_alert_orange.svg';
      case 1:
        return this.baseUrl + '/assets/img/pin_alert_yellow.svg';
      default:
        return this.baseUrl + '/assets/img/pin_alert.svg';
    }
  }

  getMarkerIcon(type) {
    switch (type) {
      // EVENT
      case Filter.BeerStands:
        return this.baseUrl + '/assets/img/beer_2.svg';
      case Filter.Toilets:
        return this.baseUrl + '/assets/img/toilet_2.svg';
      case Filter.HandicappedToilet:
        return this.baseUrl + '/assets/img/toilet_handicap_2.svg';
      case Filter.Stages:
        return this.baseUrl + '/assets/img/stage_2.svg';
      case Filter.CommandCenter:
        return this.baseUrl + '/assets/img/control_center3.svg';
      case Filter.EmergencyExits:
        return this.baseUrl + '/assets/img/emergency_exit_2.svg';
      case Filter.FirstAidPoints:
        return this.baseUrl + '/assets/img/first_aid_2.svg';
      case Filter.CocktailStands:
        return this.baseUrl + '/assets/img/cocktail_2.svg';
      case Filter.Entrance:
        return this.baseUrl + '/assets/img/entrance.svg';
      case Filter.QuietZones:
        return this.baseUrl + '/assets/img/quiet.svg';
      case Filter.Rides:
        return this.baseUrl + '/assets/img/ride.svg';
      case Filter.FastFood:
        return this.baseUrl + '/assets/img/fast_food.svg';
      case Filter.Restaurant:
        return this.baseUrl + '/assets/img/restaurant.svg';
      case Filter.Attractions:
        return this.baseUrl + '/assets/img/attraction.svg';
      case Filter.Shops:
        return this.baseUrl + '/assets/img/shopping.svg';
      case Filter.ATM:
        return this.baseUrl + '/assets/img/atm.svg';
      // PEOPLE
      case Filter.Police:
        return this.baseUrl + '/assets/img/pin_police.svg';
      case Filter.Paramedics:
        return this.baseUrl + '/assets/img/pin_first_aid.svg';
      case Filter.Guards:
        return this.baseUrl + '/assets/img/pin_guard.svg';
      // case Filter.Security:
      //   return this.baseUrl + '/assets/img/pin_guard.svg';
      case Filter.Crew:
        return this.baseUrl + '/assets/img/pin_crew.svg';
      case Filter.PublicOrderOffice:
        return this.baseUrl + '/assets/img/pin_crew.svg';
      case Filter.Fireman:
        return this.baseUrl + '/assets/img/pin_fireman.svg';
      case Filter.Monica:
        return this.baseUrl + '/assets/img/pin_crew.svg';
    }
  }

  getSensorIcon(thingTemp) {
    switch (thingTemp) {
      case "Camera":
        return this.baseUrl + '/assets/img/camera_3.svg';
      case "SOUND":
        return this.baseUrl + '/assets/img/sound_4.svg';
      case "Soundmeter":
        return this.baseUrl + '/assets/img/microphone.svg';
      case "Windspeed":
        return this.baseUrl + '/assets/img/wind.svg';
      case "Temperature":
        return this.baseUrl + '/assets/img/temperature.svg';
    }
  }

  getMarkerType(type) {
    switch (type) {
      case "Beer Stand":
        return Filter.BeerStands;
      case "Toilets":
        return Filter.Toilets;
      case "Handicapp Toilet":
        return Filter.HandicappedToilet;
      case "Stage":
        return Filter.Stages;
      case "Command Center":
        return Filter.CommandCenter;
      case "Emergency Exit":
        return Filter.EmergencyExits;
      case "First Aid Point":
        return Filter.FirstAidPoints;
      case "Cocktail Stand":
        return Filter.CocktailStands;
      case "Ride":
        return Filter.Rides;
      case "Fast Food":
        return Filter.FastFood;
      case "Restaurant":
        return Filter.Restaurant;
      case "Attraction":
        return Filter.Attractions;
      case "Shop":
        return Filter.Shops;
      case "ATM":
        return Filter.ATM;
      case "Entrance":
        return Filter.Entrance;
      case "Quiet Zone":
        return Filter.QuietZones;
      default:
        return Filter.CommandCenter
    }
  }

  setupPositions(zoneList) {
    for (let i = 0; i < zoneList.length; i++) {
      let z = zoneList[i];
      if (z.boundingPolygon.length > 1) {
        // Polygon
        // console.log('Polygon',z.boundingPolygon.length);
      } else {
       
        let markerFilter = this.getMarkerType(z.type);
        let p = {
          id: z.id,
          name: z.name,
          position: new google.maps.LatLng(z.boundingPolygon[0][0], z.boundingPolygon[0][1]),
          icon: {
            url: this.getMarkerIcon(markerFilter), //'/assets/img/pin_alert.svg',
            anchor: [16, 16],
            size: this.markerSize,
            scaledSize: this.markerSize
          },
          visible: this.isFilterSelected(markerFilter), //false,
          type: markerFilter,
          orgType: z.type
          
        };
        // console.log('create position', p, z);
        this.positions.push(p);
      }

      // // Temp solution to show polygon label, marker with label is added
      // if(z.metadata){
      //   console.log('ADD MARKER WITH LABEL', z); 
      //   this.addMarkerWithLabel(z)
      // }
    }
  }

  setupPersonPositions(personList) {
    for (let i = 0; i < personList.length; i++) {
      let p = personList[i];
      let type = this.getPersonType(p.role); 
      let timeDiff = this.checkPersonTimestamp(p.timestamp);
      // console.log('TIME DIFF', timeDiff);
      // if (timeDiff <= 15) {
        let m = {
          id: p.personId,
          name: p.name,
          position: new google.maps.LatLng(p.lat, p.lon),
          icon: {
            url: this.getMarkerIcon(type), //'/assets/img/pin_alert.svg',
            anchor: [16, 16],
            size: this.markerPinSize,
            scaledSize: this.markerPinSize
          },
          visible: this.isFilterSelected(type), //false,
          type: type,
          orgType: "PERSON",
          timestamp: p.timestamp
        };
        this.addOrReplacesPosition(m);
    }
  }

  getPersonType(role){
    switch(role){
      case "Crew":
        return Filter.Crew;
      case "Guard":
        return Filter.Guards;
      case "MONICA":
        return Filter.Monica;
      case "Paramedic":
        return Filter.Paramedics;
      case "Police":
        return Filter.Police;
      case "Security":
        return Filter.Security;
      case "Staff":
        return Filter.Staff;
      default:
        return Filter.Monica; 
    }
  }

  // setupPersonPositions(personList, type) {
  //   for (let i = 0; i < personList.length; i++) {
  //     let p = personList[i];
  //     // console.log('PERSON', p);
  //     let timeDiff = this.checkPersonTimestamp(p.timestamp);
  //     // console.log('TIME DIFF', timeDiff);
  //     // if (timeDiff <= 15) {
  //       let m = {
  //         id: p.personId,
  //         name: p.name,
  //         position: new google.maps.LatLng(p.lat, p.lon),
  //         icon: {
  //           url: this.getMarkerIcon(type), //'/assets/img/pin_alert.svg',
  //           anchor: [16, 16],
  //           size: this.markerPinSize,
  //           scaledSize: this.markerPinSize
  //         },
  //         visible: this.isFilterSelected(type), //false,
  //         type: type,
  //         orgType: "PERSON",
  //         timestamp: p.timestamp
  //       };
  //       // console.log("PERSON", m);
  //       // this.positions.push(m);
  //       this.addOrReplacesPosition(m); // OBS TEST!!
  //     // }
  //   }
  // }

  checkPersonTimestamp(timestamp){
    //Get 1 minute in milliseconds
    let one_minute=1000*60;
  
    // Convert both dates to milliseconds
    let t = new Date(timestamp.toString());
    // console.log('BEFORE', t.toString(), t.getTimezoneOffset());
    t.setMinutes(t.getMinutes() + t.getTimezoneOffset()); 
    // console.log('AFTER', t.toString());

    let t2 = new Date();
    // console.log('BEFORE 2', t2.toString(), t2.getTimezoneOffset());
    t2.setMinutes(t2.getMinutes() + t2.getTimezoneOffset()); 
    // console.log('AFTER 2', t2.toString());

    // console.log('TIME OFFSET', t.getTimezoneOffset());
    let date1_ms = t.getTime(); // new Date(timestamp.toString()).getTime(); //date1.getTime();
    
    let date2_ms = t2.getTime(); //new Date().getTime(); //date2.getTime();
    // console.log("DATES:", date1_ms, date2_ms);
    // Calculate the difference in milliseconds
    let difference_ms = date2_ms - date1_ms;
    // Convert back to days and return
    return Math.round(difference_ms/one_minute); 
  }
  
  addOrReplaceZone(polyObj){
    for(let i = 0; i<this.zones.length; i++){
      if(polyObj.id == this.zones[i].id){
        this.zones.splice(i, 1); 
        break;
      }
    }
    this.zones.push(polyObj);
  }

  addOrReplacesPosition(markerObj) {
    let found: boolean = false;
    for (let i = 0; i < this.positions.length; i++) {
      if (markerObj.id === this.positions[i].id && markerObj.type === this.positions[i].type) {
        this.positions[i] = markerObj;
        found = true;
        break;
      }
    }
    if (!found) {
      this.positions.push(markerObj);
      // console.log('NOT Found position, added', this.positions); 
    }
  }

  addOrReplacesSoundPath(markerObj) {
    let found: boolean = false;
    for (let i = 0; i < this.soundPaths.length; i++) {
      if (markerObj.id === this.soundPaths[i].id && markerObj.type === this.soundPaths[i].type) {
        // console.log('Found position, replaced', this.soundPaths); 
        this.soundPaths[i] = markerObj;
        found = true;
        break;
      }
    }
    if (!found) {
      this.soundPaths.push(markerObj);
      // console.log('NOT Found position, added', this.soundPaths); 
    }
  }

  removePosition(id, orgType) {
    console.log("Remove id:" + id + ", type:" + orgType);
    for (let i = 0; i < this.positions.length; i++) {
      let pos = this.positions[i];
      if (pos.id == id && pos.orgType == orgType) {
        console.log("POSITION TO REMOVE", pos);
        let removed = this.positions.splice(i, 1);
        console.log("Removed", removed);
      }
    }
  }

  // setupSoundHeatMap(soundHmObject) {
  //   let to = {
  //     id: soundHmObject.id,
  //     name: "Sound Heat Map 1",
  //     position: new google.maps.LatLng(soundHmObject.latStart, soundHmObject.lonStart),
  //     icon: {
  //       url: this.getSensorIcon("SOUND"),
  //       anchor: [16, 16],
  //       size: this.markerSize,
  //       scaledSize: this.markerSize
  //     },
  //     visible: this.isFilterSelected(Filter.SoundHeatMap),
  //     type: Filter.SoundHeatMap,
  //     orgType: Filter.SoundHeatMap
  //   };
  //   // console.log('Is sound heat map selected', this.isFilterSelected(Filter.SoundHeatMap))
  //   this.positions.push(to);
  // }

  setupThingPositions(thingList) {
    for (let i = 0; i < thingList.length; i++) {
      let t = thingList[i];
      let to = {
        id: t.id,
        name: t.name,
        position: new google.maps.LatLng(t.lat, t.lon),
        icon: {
          url: this.getSensorIcon(t.thingTemplate),
          anchor: [16, 16],
          size: this.markerSize,
          scaledSize: this.markerSize
        },
        visible: this.isFilterSelected(Filter.Sensors),
        type: Filter.Sensors,
        orgType: t.thingTemplate,
        timestamp: t.timestamp ? t.timestamp : ''
      };
      this.positions.push(to);
    }
  }

  clusterTest(){
    var locations = [
      {lat: -31.563910, lng: 147.154312},
      {lat: -33.718234, lng: 150.363181},
      {lat: -33.727111, lng: 150.371124},
      {lat: -33.848588, lng: 151.209834},
      {lat: -33.851702, lng: 151.216968},
      {lat: -34.671264, lng: 150.863657},
      {lat: -35.304724, lng: 148.662905},
      {lat: -36.817685, lng: 175.699196},
      {lat: -36.828611, lng: 175.790222},
      {lat: -37.750000, lng: 145.116667},
      {lat: -37.759859, lng: 145.128708},
      {lat: -37.765015, lng: 145.133858},
      {lat: -37.770104, lng: 145.143299},
      {lat: -37.773700, lng: 145.145187},
      {lat: -37.774785, lng: 145.137978},
      {lat: -37.819616, lng: 144.968119},
      {lat: -38.330766, lng: 144.695692},
      {lat: -39.927193, lng: 175.053218},
      {lat: -41.330162, lng: 174.865694},
      {lat: -42.734358, lng: 147.439506},
      {lat: -42.734358, lng: 147.501315},
      {lat: -42.735258, lng: 147.438000},
      {lat: -43.999792, lng: 170.463352}
    ];
    var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var markers = locations.map(function(location, i) {
      return new google.maps.Marker({
        position: location,
        label: labels[i % labels.length],
        icon: '/assets/img/pin_sound.svg'
      });
    });
    let markerCluster = new MarkerClusterer(this.map, markers, {imagePath: '/assets/img/m'}); 
  }

  setupIncidentPositions(incidentList) {
    for (let i = 0; i < incidentList.length; i++) {
      let t = incidentList[i];
      if(t.position){
        let pos = JSON.parse(t.position);
        let to = {
          id: t.incidentid,
          name: t.description,
          position: new google.maps.LatLng(parseFloat(pos[0][0]), parseFloat(pos[0][1])), // error handling if no pos
          icon: {
            url: this.getIncidentIcon(t.prio),
            anchor: [16, 16],
            size: this.markerPinSize,
            scaledSize: this.markerPinSize
          },
          visible: this.isFilterSelected(Filter.Security),
          type: Filter.Security,
          orgType: t.type,
          timestamp: t.incidenttime ? t.incidenttime : ''
        };
        this.addOrReplacesPosition(to);
      }
    }
  }

  setupSoundIncidentPositions(soundIncidentList){
    for (let i = 0; i < soundIncidentList.length; i++) {
      let t = soundIncidentList[i];
      // let pos = JSON.parse(t.position);
      let to = {
        id:  t.feedbackType + t.feedback_value +  t.feedback_message, //Math.round(i * Math.random() * 1000),
        name: t.feedbackType + ' - Value: ' + t.feedback_value + ', Comment: ' + t.feedback_message,
        position: new google.maps.LatLng(t.feedback_lat, t.feedback_lon), // error handling if no pos
        icon: {
          url: this.baseUrl + '/assets/img/pin_sound.svg',
          anchor: [16, 16],
          size: this.markerPinSize,
          scaledSize: this.markerPinSize
        },
        visible: this.isFilterSelected(Filter.Sound),
        type: Filter.Sound,
        orgType: t.feedbackType,
        timestamp: t.timestamp ? t.timestamp : ''
      };
      // console.log("SOUND FEEDBACK INCIDENT", to);
      //this.positions.push(to);
      this.addOrReplacesPosition(to);
    }
  }

  soundPaths = []; 
  setupSoundPathPositions(soundPathtList){
    for (let i = 0; i < soundPathtList.length; i++) {
      let t = soundPathtList[i];
      let to = {
        id:  "SoundPath" + t.properties.leq_id,
        name: 'Sound path leq mean: '+t.properties['leq_mean'] + ' dB',
        obj: t.properties,
        position: new google.maps.LatLng(t.geometry.coordinates[1], t.geometry.coordinates[0]),
        icon: {
          url: this.getSoundPathIcon(t.properties["marker-color"]),
          anchor: [16, 16],
          size: this.markerPinSize,
          scaledSize: this.markerPinSize
        },
        visible: this.isFilterSelected(Filter.SoundPath),
        type: Filter.SoundPath,
        orgType: "Sound path",
        timestamp: t.properties.leq_utc ? t.properties.leq_utc : ''
      };
      // this.soundPaths.push(to);
      this.addOrReplacesSoundPath(to);
    }
  }

  getSoundPathIcon(color) {
    switch (color) {
      case "#A11A4D":
        return this.baseUrl + '/assets/img/circle_A11A4D.svg';
      case "#75085C":
        return this.baseUrl + '/assets/img/circle_75085C.svg';
      case "#430A4A":
        return this.baseUrl + '/assets/img/circle_430A4A.svg';
      case "#CD463E":
        return this.baseUrl + '/assets/img/circle_CD463E.svg';
      default:
      return this.baseUrl + '/assets/img/circle.svg';
    }
  }

  showHideMarkers(type: string, show) {
    for (let i = 0; i < this.positions.length; i++) {
      let p = this.positions[i];
      if (p.type === type) {
        p.visible = show;
      }
    }
  }

  showHideSoundPaths(type: string, show) {
    for (let i = 0; i < this.soundPaths.length; i++) {
      let p = this.soundPaths[i];
      if (p.type === type) {
        p.visible = show;
      }
    }
  }

  // showHideheatMap(type: string, show) {
  //   if (this.heatmap) {
  //     if (!show) {
  //       // console.log('Hide heatMap'); 
  //       // Hide heat map
  //       this.heatmap.setMap(null);
  //     } else {
  //       // show heat map
  //       // console.log('Show heatMap'); 
  //       this.heatmap.setMap(this.map);
  //     }
  //   }
  // }

  onMarkerInit(marker) {
    // console.log('marker', marker);
  }

  onMarkerClick({ target: marker }, mark) {
    console.log('MARKER CLICKED', mark); 

    this.clearSelected();
    // console.log(marker);
    this.selectedMarker = marker;
    // this.marker.lat = marker.getPosition().lat();
    // this.marker.lng = marker.getPosition().lng();
    this.marker.id = mark.id;
    this.marker.name = mark.name;
    this.marker.type = mark.type;
    this.marker.orgType = mark.orgType;
    this.polygon.id = null;
    this.polygon.type = null;
    marker.nguiMapComponent.openInfoWindow('iw', marker);
    // this.selectedMarker = mark;
    this.hasSelected = true;

    if (mark.type == Filter.Police || 
      mark.type == Filter.Guards || 
      mark.type == Filter.Paramedics || 
      mark.type == Filter.Crew || 
      mark.type == Filter.PublicOrderOffice || 
      mark.type == Filter.Fireman || 
      mark.type == Filter.Monica) {
      let subP = this.personService.getPersonById(mark.id).subscribe(data => {
        this.person = data;
        this.person.message = "";
      }, error => {
        console.log("error", error);
      });
      this.subscriptions.push(subP);
    }
    else if (mark.type == Filter.Sensors) {
      let subT = this.thingService.getThingsWithObservations(mark.id).subscribe(data => {
        let d: any = data;
        this.thing = d;
        if (d.thingTemplate == "Soundmeter") {
          // this.soundMeterInfo(d); // creates LCeq, LAeq chart
        } else if (d.thingTemplate == "Camera") {
          this.cameraInfo(d);
        } else if(d.thingTemplate == "Temperature"){
          this.temperatureInfo(d);
        } else if(d.thingTemplate == "Windspeed"){
          this.windInfo(d);
        }else {
          console.log("SENSOR DETAIL", d);
          let t = JSON.parse(d.observations[0].observationResult);
          if (t.result.value instanceof Array) {
            this.thing.value = t.result.value[0].values[0];
          } else {
            this.thing.value = t.result.value;
          }
        }
      }, error => {
        console.log("error", error);
      });
      this.subscriptions.push(subT);
    } else if (mark.type === Filter.BeerStands ||
      mark.type === Filter.CocktailStands ||
      mark.type === Filter.CommandCenter ||
      mark.type === Filter.EmergencyExits ||
      mark.type === Filter.Entrance ||
      mark.type === Filter.FirstAidPoints ||
      mark.type === Filter.HandicappedToilet ||
      mark.type === Filter.Zone ||
      mark.type === Filter.Toilets ||
      mark.type === Filter.Stages ||
      mark.type === Filter.Rides ||
      mark.type === Filter.FastFood ||
      mark.type === Filter.Restaurant ||
      mark.type === Filter.Attractions ||
      mark.type === Filter.Shops ||
      mark.type === Filter.ATM ||
      mark.type === Filter.QuietZones
    ) {
      let subZ = this.zoneService.getZoneById(mark.id).subscribe(data => {
        this.zone = data;
        console.log('Event thingy', data);
      }, error => {
        console.log("error", error);
      });
      this.subscriptions.push(subZ);
    } else if (mark.type === Filter.SoundHeatMap) {
      this.reloadSoundHeatMap();
    } else if (mark.type === Filter.Security) {
      let subI = this.incidentService.getIncidentById(mark.id).subscribe(data => {
        let d: any = data;
        this.incident = d;
        console.log('INCIDENT CLICKED', d);
        // let interPlan = d.interventionplan ? JSON.parse(d.interventionplan) : '';
        // this.incident.circles = [];
        // this.incident.center = "";
        // let a = [];
        // if (interPlan.recommendations) {
        //   for (let i = 0; i < interPlan.recommendations.length; i++) {
        //     let r = interPlan.recommendations[i];
        //     let lanLongSplit = r.latLon.split(',');
        //     let p = new google.maps.LatLng(lanLongSplit[0], lanLongSplit[1]);
        //     this.incident.center = p;
        //     let c = {
        //       title: r.recommendation,
        //       pos: p,
        //       radius: r.cellSize
        //     }
        //     this.incident.circles.push(c);
        //   }
        // }
      }, error => {
        console.log("error", error);
      });
      this.subscriptions.push(subI);
    } else if(mark.type === Filter.Sound) {
      this.hasSelected = false;
    } else if(mark.type === Filter.SoundPath){
      // this.hasSelected = false;
      this.soundPath = mark; 
      console.log('Sound path', mark);
    }
  }

  resolveIncident(incident) {
    let updateIncident = {
      "incidentid": incident.incidentid,
      "description": incident.description,
      "type": incident.type,
      "position": incident.position,
      "prio": incident.prio,
      "status": "RESOLVED",
      "probability": incident.probability,
      "interventionplan": incident.interventionplan,
      "incidenttime": incident.incidenttime
    };
    console.log("Resolve incident", updateIncident);
    let sub = this.incidentService.updateIncident(updateIncident).subscribe(resp => {
      incident.message = "This incident was resolved";
      this.removePosition(incident.incidentid, incident.type);
      console.log("INCIDENT WAS RESOLVED", resp);
    }, error => {
      console.log("error", error);
    });
    this.subscriptions.push(sub);
  }

  dismissIncident(incident) {
    let updateIncident = {
      "incidentid": incident.incidentid,
      "description": incident.description,
      "type": incident.type,
      "position": incident.position,
      "prio": incident.prio,
      "status": "DISMISSED",
      "probability": incident.probability,
      "interventionplan": incident.interventionplan,
      "incidenttime": incident.incidenttime
    };
    console.log("Resolve incident", updateIncident);
    let sub = this.incidentService.updateIncident(updateIncident).subscribe(resp => {
      incident.message = "This incident was dismissed";
      this.removePosition(incident.incidentid, incident.type);
      console.log("INCIDENT WAS DISMISSED", resp);
    }, error => {
      console.log("error", error);
    });
    this.subscriptions.push(sub);
  }

  getSelectedMarkedId() {
    return this.marker.id;
  }

  onMarkerMouseOver({ target: marker }, mark) {
    this.selectedMarker = marker;
    this.marker.id = mark.id;
    this.marker.type = mark.type;
    this.polygon.id = null;
    this.polygon.type = null;
    marker.nguiMapComponent.openInfoWindow('iw', marker);
  }

  closeInfoWindow({ target: marker }) {
    // console.log('CLOSE INFO WINDOW');
    // this.hasSelected = false; 
  }

  /**********************************
   * FILTERS
  ************************************/
  selectFilter(filter) {
    // console.log(filter);
    if (filter.name == Filter.Zone) {
      this.showHidePolygons(filter.name, !filter.selected);
      // if(filter.name === Filter.SoundHeatMap && filter.selected){
      //   // Hide heat map
      //   this.heatmap.setMap(null);
      // } else{
      //   // show heat map
      //   this.heatmap.setMap(this.map);
      // }
      // if(filter.name === Filter.Police && filter.selected){
      //   console.log('Hide it and stop auto updating!');
      //   this.startStopPoliceAutoUpdate(true);
      // } else{
      //   console.log('Show it and start auto updating');
      //   this.startStopPoliceAutoUpdate(false);
      // }
    } else if(filter.name == Filter.ZoneLabels){
      this.showHideZoneLabels(filter.name, !filter.selected);
    } else if (filter.name == Filter.SoundHeatMap){
      this.showHideSoundHeatMaps(!filter.selected);
    } else if(filter.name == Filter.SoundPath){
      this.showHideSoundPaths(filter.name, !filter.selected);
    }
    // else if (filter.name === Filter.CrowdHeatMap) {
    //   this.showHideheatMap(filter.name, !filter.selected);
    //   this.showHideMarkers(filter.name, !filter.selected);
    //   if (filter.selected) {
    //     // hide overlay
    //     // console.log('Hide overlay');
    //     this.heatMapOverlay.setOpacity(0);
    //     /**this.heatmap.setMap(null);
    //   } else{
    //     // show heat map
    //     console.log('Show heatMap'); 
    //     this.heatmap.setMap(this.map); */
    //   } else {
    //     // console.log('Show overlay');
    //     // show overlay
    //     // this.heatMapOverlay.setMap(this.map);
    //     this.heatMapOverlay.setOpacity(0.7);
    //     // this.createOverlay(); 
    //   }
    // } 
    else {
      this.showHideMarkers(filter.name, !filter.selected);
    }
    filter.selected = !filter.selected;
    localStorage.setItem(this.id + '_filters', JSON.stringify(this.filters));
  }

  setupFilters() {
    if (!localStorage.getItem(this.id + '_filters')) {
      let filters_start = {
        // Alerts
        incidents: [{
          name: Filter.Security,
          selected: false
        }, {
          name: Filter.Sound,
          selected: false
        }],
        // Staff
        staff: [{
          name: Filter.Crew,
          selected: false
        }, {
          name: Filter.Fireman,
          selected: false
        }, {
          name: Filter.Guards,
          selected: false
        }, {
          name: Filter.Monica,
          selected: false
        }, {
          name: Filter.Paramedics,
          selected: false
        }, {
          name: Filter.Police,
          selected: false
        }, {
          name: Filter.PublicOrderOffice,
          selected: false
        }
        // ,{
        //   name: Filter.Security,
        //   selected: false
        // }
      ],
        // Sound
        sound: [{
          name: Filter.SoundHeatMap,
          selected: false
        },{
          name: Filter.SoundPath,
          selected: false
        }
        // , {
        //   name: Filter.QuietZones,
        //   selected: false
        // }
      ],
        // Crowd
        crowd: [{
          name: Filter.CrowdHeatMap,
          selected: false
        }
        // , {
        //   name: Filter.Queues,
        //   selected: false
        // }
      ],
        // Event
        event: [
          {
          name: Filter.ATM,
          selected: false
        }, {
          name: Filter.Attractions,
          selected: false
        }, {
          name: Filter.BeerStands,
          selected: false
        }, {
          name: Filter.CocktailStands,
          selected: false
        }, {
          name: Filter.CommandCenter,
          selected: false
        }, {
          name: Filter.Entrance,
          selected: false
        }, {
          name: Filter.EmergencyExits,
          selected: false
        }, {
          name: Filter.FastFood,
          selected: false
        }, {
          name: Filter.FirstAidPoints,
          selected: false
        }, {
          name: Filter.HandicappedToilet,
          selected: false
        }, {
          name: Filter.Restaurant,
          selected: false
        }, {
          name: Filter.Rides,
          selected: false
        }, 
        {
          name: Filter.Sensors,
          selected: false
        }, 
        {
          name: Filter.Shops,
          selected: false
        }, 
        {
          name: Filter.Stages,
          selected: false
        }, 
        {
          name: Filter.Toilets,
          selected: false
        }, 
        {
          name: Filter.Zone,
          selected: false
        }
        // , {
        //   name: Filter.ZoneLabels,
        //   selected: false
        // }
      ],
        // Feedback
        feedback: [{
          name: Filter.Event,
          selected: false
        }, {
          name: Filter.Experience,
          selected: false
        }, {
          name: Filter.SoundQuality,
          selected: false
        }]
      };
      this.filters = filters_start;
      localStorage.setItem(this.id + '_filters', JSON.stringify(filters_start));
      if (this.preSelectedFilters)
        this.preSelectFilters();
    } else {
      let savedFilters = localStorage.getItem(this.id + '_filters');
      this.filters = JSON.parse(savedFilters);
    }
  }

  preSelectFilters() {
    // console.log('Pre select filters');
    // This should only run if no filter settings has been saved in local storage
    let incidentFilters = this.filters.incidents;
    this.loopFilters(incidentFilters);
    let staffFilters = this.filters.staff;
    this.loopFilters(staffFilters);
    let eventFilters = this.filters.event;
    this.loopFilters(eventFilters);
    let soundFilters = this.filters.sound;
    this.loopFilters(soundFilters);
    let feedbackFilters = this.filters.feedback;
    this.loopFilters(feedbackFilters);
    let crowdFilters = this.filters.crowd;
    this.loopFilters(crowdFilters);
  }

  loopFilters(filters) {
    for (let f = 0; f < filters.length; f++) {
      let filter = filters[f];
      if (this.preSelectedFilters.indexOf(filter.name) > -1) {
        // console.log('Pre sel ', filter.name);
        this.selectFilter(filter);
      }
    }
  }

  isFilterSelected(filter) {
    let filterList = this.getFilterListByType(filter);
    if (filterList) {
      for (let i = 0; i < filterList.length; i++) {
        if (filterList[i].name === filter) {
          let f = filterList[i].selected;
          // console.log('Look up if '+filter+' is selected', f); 
          return f;
        }
      }
    }
  }

  getFilterListByType(type) {
    // EVENT
    if (type === Filter.BeerStands ||
      type === Filter.CocktailStands ||
      type === Filter.CommandCenter ||
      type === Filter.EmergencyExits ||
      type === Filter.Entrance ||
      type === Filter.FirstAidPoints ||
      type === Filter.HandicappedToilet ||
      type === Filter.Zone ||
      type === Filter.ZoneLabels ||
      type === Filter.Toilets ||
      type === Filter.Stages ||
      type === Filter.Sensors ||
      type == Filter.Rides ||
      type == Filter.FastFood ||
      type == Filter.Restaurant ||
      type == Filter.Attractions ||
      type == Filter.Shops ||
      type == Filter.ATM
    ) {
      return this.filters.event;
    }

    // STAFF
    if (
      type === Filter.Paramedics ||
      type == Filter.Guards ||
      type == Filter.Crew ||
      type == Filter.Fireman ||
      // type == Filter.Security ||
      type == Filter.PublicOrderOffice ||
      type == Filter.Police ||
      type == Filter.Monica
    ) {
      return this.filters.staff;
    }

    // SOUND
    if (type === Filter.SoundHeatMap || type === Filter.QuietZones || type == Filter.SoundPath) {
      return this.filters.sound;
    }

    // FEEDBACK
    if (type === Filter.Experience || type === Filter.Event || type === Filter.SoundQuality) {
      return this.filters.sound;
    }

    // SECURITY
    if (type === Filter.Security || type === Filter.Sound) {
      return this.filters.incidents;
    }
  }

  syncFiltersAndMarkers() {
    let incidentFilters = this.filters.incidents;
    this.loopFiltersMarkers(incidentFilters);
    let staffFilters = this.filters.staff;
    this.loopFiltersMarkers(staffFilters);
    let eventFilters = this.filters.event;
    this.loopFiltersMarkers(eventFilters);
    let soundFilers = this.filters.sound;
    this.loopFiltersMarkers(soundFilers);
    // Todo add other filters to sync
  }

  loopFiltersMarkers(filters) {
    for (let f = 0; f < filters.length; f++) {
      // if (filters[f].name !== Filter.Zone){
      //   this.showHideheatMap(filters[f].name, filters[f].selected);
      // } else 
      if (filters[f].name === Filter.Zone){
        this.showHidePolygons(filters[f].name, filters[f].selected);
      } else{
        this.showHideMarkers(filters[f].name, filters[f].selected);
      }
    }
  }

  /**********************************
   * SOUND HEAT MAP
  ************************************/
  soundLevels = [
    { symbol: 0, lower: -150, upper: 0, label: 'No level', rgba: 'rgba(216,216,216, 255)', rgb: 'rgb(216,216,216)', hex: '#d8d8d8', text_color: 'black' },
    { symbol: 1, lower: 0.1, upper: 34.4, label: '35 dB(A)', rgba: 'rgba(255,255,255,255)', rgb: 'rgb(255,255,255)', hex: '#ffffff', text_color: 'black' },
    { symbol: 2, lower: 34.5, upper: 39.4, label: '35 - 39 dB(A)', rgba: 'rgba(35,132,67,255)', rgb: 'rgb(35,132,67)', hex: '#238443', text_color: 'black' },
    { symbol: 3, lower: 39.5, upper: 44.4, label: '40 - 44 dB(A)', rgba: 'rgba(120,198,121,255)', rgb: 'rgb(120,198,121)', hex: '#78c679', text_color: 'black' },
    { symbol: 4, lower: 44.5, upper: 49.4, label: '45 - 49 dB(A)', rgba: 'rgba(194,230,153,255)', rgb: 'rgb(194,230,153)', hex: '#c2e699', text_color: 'black' },
    { symbol: 5, lower: 49.5, upper: 54.4, label: '50 - 54 dB(A)', rgba: 'rgba(255,255,178,255)', rgb: 'rgb(255,255,178)', hex: '#ffffb2', text_color: 'black' },
    { symbol: 6, lower: 54.5, upper: 59.4, label: '55 - 59 dB(A)', rgba: 'rgba(254,204,92,255)', rgb: 'rgb(254,204,92)', hex: '#fecc5c', text_color: 'black' },
    { symbol: 7, lower: 59.5, upper: 64.4, label: '60 - 64 dB(A)', rgba: 'rgba(253,141,60,255)', rgb: 'rgb(253,141,60)', hex: '#fd8d3c', text_color: 'white' },
    { symbol: 8, lower: -64.5, upper: 69.4, label: '65 - 69 dB(A)', rgba: 'rgba(255,9,9,255)', rgb: 'rgb(255,9,9)', hex: '#ff0909', text_color: 'white' },
    { symbol: 9, lower: 69.5, upper: 74.4, label: '70 - 74 dB(A)', rgba: 'rgba(179,6,34,255', rgb: 'rgb(179,6,34)', hex: '#b30622', text_color: 'white' },
    { symbol: 10, lower: 74.5, upper: 79.4, label: '75 - 79 dB(A)', rgba: 'rgba(103,3,59,255)', rgb: 'rgb(103,3,59)', hex: '#67033b', text_color: 'white' },
    { symbol: 11, lower: 79.5, upper: 150, label: '>= 80 dB(A)', rgba: 'rgba(28,0,84,255)', rgb: 'rgb(28,0,84)', hex: '#1c0054', text_color: 'white' },
  ]

  selectedFrequencyWeight = 'A';
  frequencyWeights = [
    {value: 'a', viewValue: 'A'},
    {value: 'c', viewValue: 'C'},
    {value: 'z', viewValue: 'Z'}
  ]
  selectedFrequency;
  selectedFrequencyIndex = 0; 
  bandFrequenciesObjects = [];
  soundHeatMaps = []; 
  loadingSoundHeatMap = false;

  onChangeWeightSoundHeatMap(newValue){
    this.selectedFrequencyWeight = newValue;
    this.soundHeatMapChange();
  }
  
  onChangeSoundHeatMap(newValue) {
    console.log('selected freq', newValue); 
    this.selectedFrequency = newValue;
    this.selectedFrequencyIndex = this.getIndexByFreq(newValue);
    this.soundHeatMapChange();
  }

  showHideSoundHeatMaps(show){
    for(let i = 0; i<this.soundHeatMaps.length; i++){
      this.soundHeatMaps[i].visible = show;
    }

    // for (let i = 0; i < this.positions.length; i++) {
    //   let p = this.positions[i];
    //   if (p.type === type) {
    //     p.visible = show;
    //   }
    // }
  }

  soundHeatMapChange(){
    for(let i = 0; i<this.soundHeatMaps.length; i++){
      let shm:any = this.soundHeatMaps[i];
      shm.points = this.createHeatmapPolygons(shm.data_a, shm.data_c, shm.data_z);
    }
  }

  updateSoundHeatMap(){
    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(environment.signalRUrl)
        .configureLogging(signalR.LogLevel.Information)
        .build();
      this.connection.start().catch(err => {
        console.log("error", err.toString());
      });

      this.connection.on("SoundheatmapUpdate", (message) => {
        let msgJson = JSON.parse(message);
        console.log("SIGNALR SOUND HEAT MAP", msgJson);
        if(!this.loadingSoundHeatMap){
          this.setupSoundHeatMaps();
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

  setupSoundHeatMaps(){
    this.getSoundHeatData(); 
  }

  heatmapTimestamp; 
  getSoundHeatData(){
    this.soundHeatMaps = [];
    this.loadingSoundHeatMap = true;
    let sub = this.thingService.getHeatMap().subscribe(data => {
      console.log('HEATMAP DATA', data);
      let s:any = data;
      
      for(let i = 0; i<s.length; i++){
        let d:any = s[i];
        let obs:any = d.observations;
        let shm = { id: d.id, data_z:'', data_a: '', data_c: '', dataTime:'', points: [], visible: this.isFilterSelected(Filter.SoundHeatMap) }; 
        if(obs){
          for(let i =0; i< obs.length; i++){
            let dId:string = obs[i].datastreamId;
            console.log('HEATMAP DATA Heatmap time', obs[i].phenomenTime);
            if(obs[i] && obs[i].phenomenTime){
              var date = moment(obs[i].phenomenTime); //new Date(gObj.DateString);
              var dateUtc = date.add(date.utcOffset(), 'minutes').utc().valueOf(); 
              this.heatmapTimestamp = dateUtc; 
            }
            
            console.log('dId', dId, obs.length);
            shm.dataTime = obs[i].phenomenTime;
            if(dId.includes('dbCheatmap')){
              let cObs = JSON.parse(obs[i].observationResult);
              if(cObs){
                shm.data_c = cObs.result;
              }
              // console.log('HEAT MAP C', obs[i].observationResult);
            } else if(dId.includes('dbAheatmap')){
              // // shm.data_a = JSON.parse(obs[i].observationResult);
              let aObs = JSON.parse(obs[i].observationResult);
              if(aObs){
                shm.data_a = aObs.result;
              }
              // console.log('HEAT MAP A', obs[i].observationResult);
            } else if(dId.includes('dbZheatmap')){
              // shm.data_z = JSON.parse(obs[i].observationResult);
              let zObs = JSON.parse(obs[i].observationResult);
              if(zObs){
                shm.data_z = zObs.result;
                // shm.data_a = zObs.result; // TEMP
              }
              // console.log('HEAT MAP Z', shm.data_z);
            }
            // this.loading = false; 
          }
          console.log('shm.data_c', shm.data_c);
          shm.points = this.createHeatmapPolygons(shm.data_a, shm.data_c, shm.data_z);
          this.soundHeatMaps.push(shm); 
          this.loadingSoundHeatMap = false;
          // console.log('HEAT MAP A', data[0].observations[1]);
          // console.log('HEAT MAP Z', data[0].observations[2]);
        }
      }

      if(s.length == 0){
        this.loadingSoundHeatMap = false;
      }
    }, error =>{
      this.loadingSoundHeatMap = false;
      console.log('error getting sound heat data', error); 
    });
    
    this.subscriptions.push(sub);
  }

  createHeatmapPolygons(data_a, data_c, data_z) {
    // console.log('Freq. index', freqIndex);
    let points = [];
    let rowNo = 0;
    // let data = this.getData2();
    
    // let startLat = this.data_a.lat_0;
    // let startLon = this.data_a.lon_0;
    // let cellsize = this.data_a.cellsize;
    let freqWeightInfo = this.getFrequecyWeightInfo(data_a, data_c, data_z); 
    if(this.bandFrequenciesObjects.length == 0){
      this.setBandFreqObjs(data_c.bandFrequencies); 
    }
    
    // let dataDb = this.data_a.data;
    // let dataDbA =[];
    // let dataDbC =[];
    // console.log('Total db', freqWeightInfo.dataDb, freqWeightInfo.dataDb.length);
    for (let i = 0; i < freqWeightInfo.dataDb.length; i++) {
      let freq = freqWeightInfo.dataDb[i];

      for (let r = 0; r < freq.length; r++) {
        let row = freq[r];
        for (let c = 0; c < row.length; c++) {
          let polyObj = {
            paths: [],
            weight: 0,
            color: 'rgba(0, 0, 0, 0)', //'#505050',
          }; 

          let val = row[c];
          if(i==this.selectedFrequencyIndex){
            // console.log('row:' + r + ' col:' + c, 'val:' + val);
            let p0 = new google.maps.LatLng(
              (freqWeightInfo.startLat + (freqWeightInfo.cellsize * (r - 1))), 
              (freqWeightInfo.startLon + (freqWeightInfo.cellsize * (c - 1))));
            let p1 = new google.maps.LatLng(
              (freqWeightInfo.startLat + (freqWeightInfo.cellsize * (c - 1)) + (freqWeightInfo.cellsize / 2)), 
              (freqWeightInfo.startLon + (freqWeightInfo.cellsize * (r - 1)) + (freqWeightInfo.cellsize / 2)));
            let p2 = new google.maps.LatLng(
              (freqWeightInfo.startLat + (freqWeightInfo.cellsize * (c - 1)) - (freqWeightInfo.cellsize / 2)), 
              (freqWeightInfo.startLon + (freqWeightInfo.cellsize * (r - 1)) + (freqWeightInfo.cellsize / 2)));
            let p3 = new google.maps.LatLng(
              (freqWeightInfo.startLat + (freqWeightInfo.cellsize * (c - 1)) - (freqWeightInfo.cellsize / 2)), 
              (freqWeightInfo.startLon + (freqWeightInfo.cellsize * (r - 1)) - (freqWeightInfo.cellsize / 2)));
            let p4 = new google.maps.LatLng(
              (freqWeightInfo.startLat + (freqWeightInfo.cellsize * (c - 1)) + (freqWeightInfo.cellsize / 2)), 
              (freqWeightInfo.startLon + (freqWeightInfo.cellsize * (r - 1)) - (freqWeightInfo.cellsize / 2)));

            polyObj.paths.push(p1);
            polyObj.paths.push(p2);
            polyObj.paths.push(p3);
            polyObj.paths.push(p4);
            //polyObj.paths.push(p0);
            polyObj.weight = val;
            let color = this.getSoundColor(val);
            polyObj.color = color;
            points.push(polyObj);
          }
        }
      }
    }
    return points;
  }

  getSoundColor(val:number){
    val = Math.round(val);
    if(val > 1000)
      console.log('OVER 1000');
    if (val <= this.soundLevels[0].upper)
      return this.soundLevels[0].rgba;
    else if (val > this.soundLevels[1].lower && val <= this.soundLevels[1].upper)
      return this.soundLevels[1].rgba;
    else if (val > this.soundLevels[2].lower && val <= this.soundLevels[2].upper)
      return this.soundLevels[2].rgba;
    else if (val > this.soundLevels[3].lower && val <= this.soundLevels[3].upper)
      return this.soundLevels[3].rgba;
    else if (val > this.soundLevels[4].lower && val <= this.soundLevels[4].upper)
      return this.soundLevels[4].rgba;
    else if (val > this.soundLevels[5].lower && val <= this.soundLevels[5].upper)
      return this.soundLevels[5].rgba;
    else if (val > this.soundLevels[6].lower && val <= this.soundLevels[6].upper)
      return this.soundLevels[6].rgba;
    else if (val > this.soundLevels[7].lower && val <= this.soundLevels[7].upper)
      return this.soundLevels[7].rgba;
    else if (val > this.soundLevels[8].lower && val <= this.soundLevels[8].upper)
      return this.soundLevels[8].rgba;
    else if (val > this.soundLevels[9].lower && val <= this.soundLevels[9].upper){
      // console.log('color', this.soundLevels[9].rgb, 'value', val);
      return this.soundLevels[9].rgba;
    }
    else if (val > this.soundLevels[10].lower && val < this.soundLevels[10].upper){
      // console.log('color', this.soundLevels[10].rgb, 'value', val);
      return this.soundLevels[10].rgba;
    }
    else if (val >= this.soundLevels[11].lower){
      // console.log('color', this.soundLevels[11].rgb, 'value', val);
      return this.soundLevels[11].rgba;
    }
      
  }

  getSoundheatmapUpdates() {
    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(environment.signalRUrl)
        .configureLogging(signalR.LogLevel.Information)
        .build();

      this.connection.start().catch(err => {
        console.log("Reconnect to update gate count", err.toString());
      });

      this.connection.on("SoundheatmapUpdate", (message) => {
        let msgJson = JSON.parse(message);
        console.log('SIGNALR SOUND HEATMAP', msgJson);
      });
    } catch (e) {
      console.log("sound heatmap update error", e);
    }
  }

  setBandFreqObjs(bandFrequencies){
    for(let b = 0; b<bandFrequencies.length; b++){
      let obj = {value: b, viewValue: bandFrequencies[b] + ' Hz'};
      this.bandFrequenciesObjects.push(obj);
    }
  }

  getIndexByFreq(value){
    for(let b=0; b<this.bandFrequenciesObjects.length; b++){
      if(this.bandFrequenciesObjects[b].viewValue == value){
        return this.bandFrequenciesObjects[b].value; 
      }
    }
  }

  getFrequecyWeightInfo(data_a, data_c, data_z){
    console.log('BOOO', this.selectedFrequencyWeight);
    if (this.selectedFrequencyWeight == 'A'){
      return {
        startLat: data_a.lat_0,
        startLon: data_a.lon_0,
        cellsize: data_a.cellsize,
        dataDb: data_a.data
      }
    } else if (this.selectedFrequencyWeight == 'C'){
      return {
        startLat: data_c.lat_0,
        startLon: data_c.lon_0,
        cellsize: data_c.cellsize,
        dataDb: data_c.data
      }
    } else {
      return {
        startLat: data_z.lat_0,
        startLon: data_z.lon_0,
        cellsize: data_z.cellsize,
        dataDb: data_z.data
      }
    }
  }

  /**********************************
   * MAP
  ************************************/
  onMapReady(map) {
    this.map = map;
    this.setupEvent(); 
    this.getZonePositions();
    this.getThingPositions();
    this.getSoundPositions();
    this.getSoundIncidentPositions(); 

    this.getPeoplePositions();
    this.syncFiltersAndMarkers();
    this.getIncidentPositions();

    // Updates
    this.updatesSoundIncident();
    this.updatesIncident();
    this.updatesPeople();
    this.updatesZones(); 

    // Sound heat map
    // this.setupSoundHeatMaps(); 
    // this.updateSoundHeatMap(); 

    this.setupSoundPath(); 
  }

  soundPathLevels = [
    { symbol: 0, lower: 30, upper: 35, label: '30 - 35 dB', rgba: '', rgb: '', hex: '#82A6AD', text_color: 'black' },
    { symbol: 1, lower: 35, upper: 40, label: '35 - 40 dB', rgba: '', rgb: '', hex: '#A0BABF', text_color: 'black' },
    { symbol: 2, lower: 40, upper: 45, label: '40 - 45 dB', rgba: '', rgb: '', hex: '#B8D6D1', text_color: 'black' },
    { symbol: 3, lower: 45, upper: 50, label: '45 - 50 dB', rgba: '', rgb: '', hex: '#CEE4CC', text_color: 'black' },
    { symbol: 4, lower: 50, upper: 55, label: '50 - 55 dB', rgba: '', rgb: '', hex: '#E2F2BF', text_color: 'black' },
    { symbol: 5, lower: 55, upper: 60, label: '55 - 60 dB', rgba: '', rgb: '', hex: '#F3C683', text_color: 'black' },
    { symbol: 6, lower: 60, upper: 65, label: '60 - 65 dB', rgba: '', rgb: '', hex: '#E87E4D', text_color: 'black' },
    { symbol: 7, lower: 65, upper: 70, label: '65 - 70 dB', rgba: '', rgb: '', hex: '#CD463E', text_color: 'white' },
    { symbol: 8, lower: 70, upper: 75, label: '70 - 75 dB', rgba: '', rgb: '', hex: '#A11A4D', text_color: 'white' },
    { symbol: 9, lower: 75, upper: 80, label: '75 - 80 dB', rgba: '', rgb: '', hex: '#75085C', text_color: 'white' },
    { symbol: 10, lower: 80, upper: 200, label: '> 80 dB', rgba: '', rgb: '', hex: '#430A4A', text_color: 'white' },
  ]

  setupSoundPath(){
    let sub = this.zoneService.getSoundPaths().subscribe(data => {
      console.log('Success getting sound path', data); 
      let d: any = data; 
      if(d && d.features)
        this.setupSoundPathPositions(d.features); 
    }, error => {
      console.log('Failed getting sound path', error); 
    });
    this.subscriptions.push(sub);
  }

  onIdle(event) {
    // console.log('map', event.target);
  }

  onMapClick(event) {
    // this.positions.push(event.latLng);
    event.target.panTo(event.latLng);
    // console.log('Positions: ', this.positions);
  }

  /**********************************
   * CLASSES
  ************************************/

  // Set container class
  getMapClass = function () {
    return this.hasSelected ? 'col-md-8' : 'col-md-12';
  }

  getInfoClass = function () {
    return this.hasSelected ? 'col-md-4' : 'col-md-12';
  }
}


export enum Filter {
  Security = "Security",
  Sound = "Sound",
  SoundPath = "Sound Path",
  Paramedics = "Paramedics",
  Police = "Police",
  Guards = "Guards",
  Crew = "Crew",
  Monica = "Monica Crew",
  Staff = "Staff",
  SoundHeatMap = "Sound heat map",
  QuietZones = "Quiet zones",
  CrowdHeatMap = "Crowd heat map",
  Queues = "Queues",
  Stages = "Stages",
  BeerStands = "Beer Stands",
  Entrance = "Entrance",
  CommandCenter = "Command Center",
  EmergencyExits = "Emergency Exits",
  FirstAidPoints = "First Aid Points",
  CocktailStands = "Cocktail Stands",
  Toilets = "Toilets",
  HandicappedToilet = "Accessible Toilet",
  Experience = "Experience",
  Event = "Event",
  SoundQuality = "Sound quality",
  Zone = "Zones",
  ZoneLabels = "Zone labels",
  Sensors = "Sensors",
  Rides = "Rides",
  FastFood = "Fast Food",
  Restaurant = "Restaurant",
  Attractions = "Attractions",
  Shops = "Shops",
  ATM = "ATM",
  Fireman = "Firemen",
  PublicOrderOffice = "Public Order Office"
}
