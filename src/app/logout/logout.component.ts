import { Component, OnInit } from '@angular/core';
import { AuthGuard } from 'app/auth-guard.service';
import { Router } from '@angular/router';

@Component({
  selector: 'logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css']
})
export class LogoutComponent implements OnInit {

  constructor(private authGuard: AuthGuard, private router: Router) { }

  ngOnInit() {
    console.log('Do logout!'); 
    this.authGuard.logOut(); 
    this.router.navigate(['/']); 
  }

}
