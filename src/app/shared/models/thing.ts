import { Deserializable } from "app/shared/models/deserializable.model";

export class Thing implements Deserializable<Thing>{
    id: number;
    name: string;
    description: string;
    thingtype: string;
    thingTemplate: string;
    password: string;
    role: string;
    status: string;
    lat: number;
    lon: number;

    // fullName(){
    //     return this.lastName + ' ' + this.firstName;
    // }
    // constructor(firstName, role, username){
    //     this.firstName = firstName; 
    //     this.role = role; 
    //     this.username = username;
    // }

    deserialize(input: any): Thing {
        Object.assign(this, input);
        return this;
    }

    // New static method.
  static fromJSONArray(array): Thing[] {
    return array.map(obj => new Thing().deserialize(obj));
  }
}