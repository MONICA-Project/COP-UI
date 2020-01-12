import { Deserializable } from "app/shared/models/deserializable.model";

export class Person implements Deserializable<Person>{
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    username: string;
    password: string;
    role: string;
    status: string;
    lat: number;
    lon: number;
    wearables: string;

    fullName(){
        return this.lastName + ' ' + this.firstName;
    }
    // constructor(firstName, role, username){
    //     this.firstName = firstName; 
    //     this.role = role; 
    //     this.username = username;
    // }

    deserialize(input: any): Person {
        Object.assign(this, input);
        return this;
    }

    // New static method.
  static fromJSONArray(array): Person[] {
    return array.map(obj => new Person().deserialize(obj));
  }
}