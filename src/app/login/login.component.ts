import { environment } from './../../environments/environment';
import { Component, OnInit, isDevMode } from '@angular/core';
import { AuthGuard } from 'app/auth-guard.service';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { PlatformLocation } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  user = { email: null, password: null, signedIn: null };
  loading: boolean = false;
  logoUrl = '/assets/img/monica-logo.png';
  
  constructor(private authGuard: AuthGuard, private route: ActivatedRoute, private router: Router, platformLocation: PlatformLocation) { 
    if(!isDevMode())
      this.logoUrl = environment.baseUrl + '/assets/img/monica-logo.png';
  }

  ngOnInit() {
    this.logout();
  }

  login(f) {
    console.log('Do login');
    this.authGuard.logIn(this.user.email, this.user.password).then(success => {
      console.log('Login success', success)
      let returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';//
      this.router.navigate([returnUrl]);
      this.user.signedIn = true;
    }, error => {
      console.log('Login not valid!', error);
      this.user.signedIn = false;
    });
  }

  logout() {
    this.authGuard.logOut(); 
  }

}
