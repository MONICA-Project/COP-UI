import { Component, OnInit, Input, Output } from '@angular/core';
import { PersonService } from 'app/person.service';
declare interface TableData {
  headerRow: string[];
  dataRows: string[][];
}
@Component({
  selector: 'detail-person',
  templateUrl: './detail-person.component.html',
  styleUrls: ['./detail-person.component.css']
})
export class DetailPersonComponent implements OnInit {
  @Input('id') id: any;
  person: any; 
  public tableData2: TableData;
  constructor(private personService: PersonService) {
  }

  ngOnInit() {
    console.log(this.id);
    this.personService.getPersonById(this.id).subscribe(data => {
      this.person = data;
      console.log(this.person);
      this.tableData2 = {
        headerRow: ['ID', 'Name'],
        dataRows: [
          ['Id', this.person.id],
          ['Name', this.person.fullName],
          ['Phone', this.person.phone],
          ['Email', this.person.email],
          ['Active', this.person.active ? 'Yes' : 'No']
        ]
      };
    });

    this.tableData2 = {
      headerRow: ['ID', 'Name'],
      dataRows: [
        ['1', 'Dakota Rice'],
        ['2', 'Minerva Hooper'],
        ['3', 'Sage Rodriguez'],
        ['4', 'Philip Chaney'],
        ['5', 'Doris Greene'],
        ['6', 'Mason Porter']
      ]
    };
  }
}
