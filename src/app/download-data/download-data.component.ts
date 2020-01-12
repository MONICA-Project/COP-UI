import { Router, ActivatedRoute } from '@angular/router';
import { environment } from './../../environments/environment';
import { Subscription } from 'rxjs/Subscription';
import { ThingService } from 'app/thing.service';
import { Component, OnInit } from '@angular/core';
import { window } from 'rxjs/operators/window';
import * as moment from 'moment';

@Component({
  selector: 'app-download-data',
  templateUrl: './download-data.component.html',
  styleUrls: ['./download-data.component.css']
})
export class DownloadDataComponent implements OnInit {
  subscriptions: Array<Subscription> = new Array<Subscription>();
  constructor(private thingService:ThingService, private router: Router, private route: ActivatedRoute) { }

  selectedMeasurementTypes = 'LAeq';
  measurementTypes = [
    // {value: 'ALeq', viewValue: 'ALeq'},
    // {value: 'Avg5minLAeq', viewValue: 'Avg5minLAeq'},
    {value: 'LAeq', viewValue: 'LAeq'},
    {value: 'LCeq', viewValue: 'LCeq'},
    // {value: 'Annoyance', viewValue: 'Annoyance'},
    {value: 'CPBLZeq', viewValue: 'CPBLZeq'},
  ]

  selectedSoundMeterId = 377;
  selectedSoundMeter;
  soundMeters = [];

  fromDate = "2019-05-27";
  toDate = "2019-05-28";
  showLoader;
  showErrorMessage;

  ngOnInit() {
    let subQ = this.route.queryParams
    //.filter(params => params.soundMeterId)
    .subscribe(params => {
      console.log(params);
      // this.selectedSoundMeterId = params.metername;
      this.selectedSoundMeter = params.metername;
      console.log('metername', params.metername);
      this.onChangeMeter(params.metername);
    });
    this.subscriptions.push(subQ);
    let sub = this.thingService.getSoundLevels2().subscribe(data =>{
      this.soundMeters = data;
      console.log('SOUND L2', data);
    }, error => {
      console.log('getSoundLevels2', error);
    });
    this.subscriptions.push(sub);
  }

  onChangeMeter(newVal){
    for(let i=0;i<this.soundMeters.length; i++){
      let m = this.soundMeters[i];
      if(m.name == newVal){
        this.selectedSoundMeter = newVal;
        this.selectedSoundMeterId = m.id;
      }
    }
  }

  onChangeType(newValue){
    this.selectedMeasurementTypes = newValue;
    
    // this.soundHeatMapChange();
  }

  doDownload() {
    this.showLoader = true;
    let settings = {
      "thingId": this.selectedSoundMeterId+"",
      "observationType": this.selectedMeasurementTypes,
      "startTime": moment(this.fromDate).utc().format(),
      "endTime": moment(this.toDate).utc().format(),
    }
    console.log(settings);
    let sub = this.thingService.getCsvFile(settings).subscribe(data => {
      let d:any = data;
      console.log('Success getCsvFile', d);
      console.log('URL', environment.apiUrl + d.path);
      this.showLoader = false;
      location.href = environment.apiUrl + d.path;
    }, error => {
      this.showLoader = false;
      this.showErrorMessage = error; 
      console.log('Error getCsvFile', error);
    });
    this.subscriptions.push(sub);
  }
  ngOnDestroy(): void {
    // Unsubscribe to all
    for (let i = 0; i < this.subscriptions.length; i++) {
      this.subscriptions[i].unsubscribe();
    }
  }
}
