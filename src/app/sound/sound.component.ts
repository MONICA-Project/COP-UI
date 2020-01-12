import { Router } from '@angular/router';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { ThingService } from 'app/thing.service';
import { Component, OnInit } from '@angular/core';
import { Filter } from 'app/map/map.component';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-sound',
  templateUrl: './sound.component.html',
  styleUrls: ['./sound.component.css']
})
export class SoundComponent implements OnInit, OnDestroy {

  selFilters = [Filter.SoundHeatMap, Filter.Stages, Filter.Sensors];
  showDiv;
  loading; 
  overview_1 = {
    icon: "ti-volume",
    icon_color: "icon-warning",
    title: "An. Index 1",
    value_str: '-',
    time: "-",
    small_icon: "ti-time",
    enabled: true
  }

  overview_2 = {
    icon: "ti-volume",
    icon_color: "icon-info",
    title: "An. Index 2",
    value_str: "-",
    time: "-",
    small_icon: "ti-time",
    enabled: true
  }

  overview_3 = {
    icon: "ti-volume",
    icon_color: "icon-success",
    title: "An. Index 3",
    value_str: "-",
    time: "-",
    small_icon: "ti-time",
    enabled: true
  }

  overview_4 = {
    icon: "ti-alert",
    icon_color: "icon-danger",
    title: "Sound Alerts",
    value_str: "-",
    time: "-",
    small_icon: "ti-time",
    enabled: true
  }

  soundMeters = [];
  subscriptions: Array<Subscription> = new Array<Subscription>();

  constructor(private thingService: ThingService, private router: Router) { }

  ngOnInit() {
    this.router.navigate(['/sound']);
    this.getSoundMeters();
    // // this.getSoundLevels();
    // let sub = this.thingService.getFeedback().subscribe(data => {
    //   let d:any = data; 
    //   // console.log(d); 
    //   for(let i = 0; i<d.length; i++){
    //     let f = d[i];
    //     // console.log(f);
    //     if(f.feedbackType == 'sound_level'){
    //       this.overview_staff.value_str = Math.round(f.feedback_meanvalue * 100)/100 + "";
    //       this.overview_staff.time = f.count + ' ratings';
    //     } 
    //   }
    // }, error => {
    //   console.log('error', error); 
    // });
    // this.subscriptions.push(sub);
  }

  updateAnnoyanceIndex(){
    let s1 = Math.round(Math.random() * 10);
    let s2 = Math.round(Math.random() * 10);
    let s3 = Math.round(Math.random() * 10);

    this.overview_1.value_str = s1 + ""; 
    this.overview_1.time = new Date().toLocaleString(); 
    this.overview_1.icon_color = this.getAnnoyanceColor(s1); 

    this.overview_2.time = new Date().toLocaleString(); 
    this.overview_2.value_str = s2 + ""; 
    this.overview_2.icon_color = this.getAnnoyanceColor(s2); 

    this.overview_3.value_str = s3 + ""; 
    this.overview_3.time = new Date().toLocaleString(); 
    this.overview_3.icon_color = this.getAnnoyanceColor(s3); 
  }

  getAnnoyanceColor(val){
    if(val <= 6){
      return 'icon-success';
    } else if(val == 7 || val == 8){
      return 'icon-warning'
    } else if (val > 8){
      return 'icon-danger';
    }
  }

  ngOnDestroy(): void {
    console.log('Unsubscribe to all');
    for (let i = 0; i < this.subscriptions.length; i++) {
      this.subscriptions[i].unsubscribe();
    }
  }

  getSoundMeters(){
    this.loading = true; 
    let sub = this.thingService.getSoundLevels().subscribe(data => {
      let d: any = data;
      for (var i = d.length - 1; i >= 0; i--)
      {
        this.soundMeters.push(d[i]);
      }
      // this.soundMeters = d; 
      // this.overview_sound.value_str = this.soundMeters.length + ""; 
      // this.overview_sound.time = new Date().toLocaleString();
      console.log('FONUD sound meters', d); 
      this.loading = false; 
    }, error => {
      console.log('SOUND COMP error', error); 
    });
    this.subscriptions.push(sub);
  }
  
  // getSoundLevels() {
  //   let subC = this.thingService.getThingsWithObservations(19).subscribe(data => {
  //     console.log('Sound', data);
  //     let d: any = data;
  //     // let val = this.thingService.getThingById(19); 
  //     let t = JSON.parse(d.observations[0].observationResult);
  //     let val = t.result.value[0].values[0];
  //     this.overview_sound.value_str = val + 'dB';
  //     this.overview_sound.time = new Date().toTimeString();
  //   });
  //   let subCa = this.thingService.getAutoupdateSound().subscribe(data => {
  //     console.log('Auto Sound', data);
  //     let d: any = data;
  //     // let val = this.thingService.getThingById(19); 
  //     let t = JSON.parse(d.observations[0].observationResult);
  //     let val = t.result.value[0].values[0];
  //     this.overview_sound.value_str = val + 'dB';
  //     this.overview_sound.time = new Date().toTimeString();

  //   });
  //   this.subscriptions.push(subC);
  //   this.subscriptions.push(subCa);
  // }
}
