import { Subscription } from 'rxjs/Subscription';
import { PersonService } from 'app/person.service';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'send-message',
  templateUrl: './send-message.component.html',
  styleUrls: ['./send-message.component.css']
})
export class SendMessageComponent implements OnInit {
  @Input('wbid') wbid;
  @Input('personId') personId;
  person;
  message = '';
  sentSuccess; 
  sentError; 
  subscriptions: Array<Subscription> = new Array<Subscription>();
  constructor(private personService: PersonService) { }

  ngOnInit() {
    if(this.wbid){
      // Get personId first
      this.getPersonByWearableFirst(); 
    } else if(this.personId){
      // Get person directly
      this.getPerson(); 
    }
  }

  getPersonByWearableFirst(){
    let sub = this.personService.getPersonByWbId(this.wbid).subscribe(data => {
      this.personId = data;
      if (data) {
        this.getPerson(); 
      }
    }, error => {
      console.log('Error getting person id', error);
    })
  }
  getPerson(){
    this.personService.getPersonById(this.personId).subscribe(personData => {
      this.person = personData;
    }, errorPerson => {
      console.log('Error getting person', errorPerson);
    })
  }
  sendMessage() {
    if (this.person) {
      let message = {
        "message": this.message
      };
      let sub = this.personService.sendMessage(this.person.id, message).subscribe(response => {
        let resp: any = response;
        if (resp.success) {
          console.log('MESSAGE WAS SENT', message);
          this.message = "";
          this.sentSuccess = "The message was successfully sent to " + this.person.fullName + "";
        }
      }, error => {
        console.log('MESSAGE WAS Error', error, message);
        this.message = "";
        this.sentError = "The message could NOT be sent to " + this.person.fullName + "";
      });
      this.subscriptions.push(sub);
    }
  }

  clearMessage() {
    this.sentSuccess = null;
  }
  clearErrorMessage() {
    this.sentError = null;
  }
}
