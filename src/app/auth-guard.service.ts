import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { environment } from './../environments/environment';
import * as moment from 'moment';
import { PersonService } from 'app/person.service';

@Injectable()
export class AuthGuard implements CanActivate {
  loggedIn; 
  userEmail;
  logger = new Subject<boolean>();
  
  constructor(private router: Router, private personService:PersonService) { }

  canActivate(route, state:RouterStateSnapshot) {
    this.userEmail = localStorage.getItem('logged_in');
    if(this.userEmail) return true;
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
    return false; 
  }

  isLoggedIn(): Observable<boolean> {
    return this.logger.asObservable();
  }
  
  logIn(email: string, pwd: string) {
    return new Promise<boolean>((resolve, reject) => {
      this.personService.apiLogin(email, pwd).then(success => {
        let s: any = success; 
        // console.log('Success login from API, guid', success);
        let obj = {logged_in: true, timestamp:moment().format(), token:s.token};
        // console.log('OBJ to save', obj); 
        localStorage.setItem('logged_in', JSON.stringify(obj));
        this.loggedIn = true;
        this.logger.next(this.loggedIn);
        resolve(true);
        // JSON.stringify(obj);
      }, error => {
        console.log('Error logging in from api', error); 
        reject(error);
      })
    });
    // localStorage.setItem('logged_in', email);
    // this.loggedIn = true;
    // this.logger.next(this.loggedIn);
  }

  checkLogin(){
    let stored = JSON.parse(localStorage.getItem("logged_in"));
    if(stored){
      // if login older than 1 day -> doLogout
      let now = moment();
      let loggedInTime = moment(stored.timestamp);
      let diff = now.diff(loggedInTime, 'days'); // > 1 do login
      console.log('checkLogin diff', diff);
      if(diff > 1){
        this.logOut(); 
      }
    } else{
      this.logOut(); 
    }
  }

  logOut() {
    localStorage.removeItem('logged_in');
    localStorage.clear(); 
    this.loggedIn = false;
    this.logger.next(this.loggedIn);
  }

  

}
