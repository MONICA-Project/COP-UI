import { Subscription } from 'rxjs/Subscription';
import { Thing } from './../shared/models/thing';
import { ThingService } from 'app/thing.service';
import { environment } from './../../environments/environment';
import { Component, OnInit, ViewChild, Input, isDevMode } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { PersonService } from 'app/person.service';
import { Person } from 'app/shared/models/person';
import { PlatformLocation } from '@angular/common';

@Component({
  selector: 'material-table',
  templateUrl: './material-table.component.html',
  styleUrls: ['./material-table.component.css']
})
export class MaterialTableComponent implements OnInit {
  objects = [
    { value: 'Police', viewValue: 'Police' },
    { value: 'Paramedic', viewValue: 'Paramedic' },
    { value: 'Guard', viewValue: 'Guard' },
    { value: 'Crew', viewValue: 'Crew' },
    { value: 'publicorderoffice', viewValue: 'PUBLIC ORDER OFFICE' },
    { value: 'Staff', viewValue: 'Staff' },
    { value: 'MONICA', viewValue: 'MONICA' },
    { value: 'Security', viewValue: 'Security' },
    { value: 'Fireman', viewValue: 'Fireman' }
  ];

  displayedColumns = ['role', 'fullName', 'active']; //'phone', 'email',
  // dataSource: MatTableDataSource<Thing>;
  dataSource: MatTableDataSource<Person>;
  baseUrl = '';
  saveSuccess;
  saveError;
  count = 0; 
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  subscriptions: Array<Subscription> = new Array<Subscription>();

  constructor(private personService: PersonService, private platformLocation: PlatformLocation, private thingService: ThingService) {
    if (!isDevMode())
      this.baseUrl = environment.baseUrl;

    let sub = this.personService.getPersons().subscribe(data => {
      console.log('PEOPLE', data);
      if(data){
        this.count = data.length; 
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }
      
    }, error => {
      console.log('Something went wrong', error);
    });
    this.subscriptions.push(sub);
  }

  onChange(newValue, obj) {
    console.log('Role changed', newValue, obj);
  }

  doUpdate(updatedObj) {
    let sub = this.personService.updatePerson(updatedObj.id, updatedObj).subscribe(data => {
      console.log('Updated role responce', data);
      this.saveSuccess = true;
    }, error => {
      console.log('Error updating role', error);
      this.saveError = true;
    });
    this.subscriptions.push(sub);
  }

  updateRole(newRole, obj) {
    obj.role = newRole;
    this.doUpdate(obj)
  }
  updateName(obj) {
    this.doUpdate(obj)
  }

  toggleActive(newStatus, obj) {
    console.log('Set active', newStatus, obj);
    obj.active = newStatus;
    this.doUpdate(obj);
  }

  clearSuccess() {
    this.saveSuccess = null;
  }
  clearError() {
    this.saveError = null;
  }

  /**
   * Set the paginator and sort after the view init since this component will
   * be able to query its view for the initialized paginator and sort.
   */
  ngAfterViewInit() {
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  ngOnInit() {

  }
  nameRowChanged;
  nameChanged(row) {
    console.log('Name changed ', row.id);
  }

  // saveName(row){
  //   console.log('Save new name for ', row.id);
  // }

  getIconByType(type: String) {
    switch (type.toUpperCase()) {
      case 'POLICE':
        return this.baseUrl + '/assets/img/pin_police.svg';
      case 'GUARD':
        return this.baseUrl + '/assets/img/pin_guard.svg';
      case 'PARAMEDIC':
        return this.baseUrl + '/assets/img/pin_first_aid.svg';
      case 'CREW':
        return this.baseUrl + '/assets/img/pin_crew.svg';
      case 'MONICA':
        return this.baseUrl + '/assets/img/pin_crew.svg';
      case 'PUBLIC ORDER OFFICE':
        return this.baseUrl + '/assets/img/pin_crew.svg';
      case 'SECURITY':
        return this.baseUrl + '/assets/img/pin_guard.svg';
      case 'FIREMEN':
        return this.baseUrl + '/assets/img/pin_fireman.svg';
      default:
        return this.baseUrl + '/assets/img/pin_crew.svg';
    }
  }

  ngOnDestroy(): void {
    for (let i = 0; i < this.subscriptions.length; i++) {
      this.subscriptions[i].unsubscribe();
    }
  }
}
