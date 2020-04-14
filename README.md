# Monica COP.UI
<!-- Short description of the project. -->

COP.UI
The COP UI is the main user interface to interact with COP. An overview of the COP architecture can be seen [here](https://github.com/MONICA-Project/COP.API).

The COP.API is connected to the following components in MONICA:
* [COP.API](https://github.com/MONICA-Project/COP.API) - Which provides the API for the COP.
* EventHub provides push functionality to apps and COP-UI. This component is in fact integrated in the COP.API module but as a separate component.



The COP API is based on the following technologies:
*	[SignalR](https://docs.microsoft.com/en-us/aspnet/core/signalr/introduction?view=aspnetcore-3.1) for receiving messages for updating COP status
*	[Angular](https://angular.io/)



<!-- A teaser figure may be added here. It is best to keep the figure small (<500KB) and in the same repo -->

## Getting Started
Clone the GitHub repository:
```bash
git clone https://github.com/MONICA-Project/COP-UI.git
```
Install all dependencies
```bash
npm install
```
Sometimes the install failes due to an error with "node-sass". If this occurs this should correct it:
```bash
npm install node-sass
```
Now you can try to launch the COP.UI
```bash
ng serve
```
In order for for the COP.UI to work properly the rest of the MONICA environment should be running.There are a number of ready made Docker Compose Packages demonstration environments that include the COP.UI and all dependencies and provides an easy way of testing the COP.UI. In addition there are a number of tutorials for the COP.UI. Select the one matching your needs best.
### Docker Compose with complete demonstration environments including the COP.UI
* [Demonstration of staff management with LoRa based locators]( https://github.com/MONICA-Project/staff-management-demo)
* [Demonstration of crowd management using smart wristbands](https://github.com/MONICA-Project/DockerGlobalWristbandSimulation)
* [Demonstration of Sound Monitoring an event using Sound Level Meters](https://github.com/MONICA-Project/DockerSoundDemo)
* [Environment Sensors for managing weather related incidents Demo](https://github.com/MONICA-Project/DockerEnvironmentSensorDemo)
### Tutorials
* [COP UI Tutorial for Security Monitoring](https://monica-project.github.io/sections/cop-api-tutorial%20for%20security.html)
* [COP UI Tutorial for sound monitoring](https://monica-project.github.io/sections/cop-api-tutorial%20for%20sound.html)
* [COP UI Tutorial for staff management](https://monica-project.github.io/sections/cop-ui-tutorial.html)

### Important settings that need to checked
In src\environments\environment.prod.ts and src\environments\environment.ts you need to check and change the setting for where the COP.API resides:
```javascript
export const environment = {
  production: false,
  apiUrl: 'http://'+ window.location.hostname + ':8800/',
  signalRUrl: 'http://'+ window.location.hostname+':8800/signalR/COPUpdate', 
  baseUrl:  '',
};
```
* apiUrl: must point at the COP.API adress and port
* signalRUrl: must point at the signalR adress and port (which is the same as COP.API)

### Files that control the look of menus in the COP
**src\app\sidebar\sidebar.component.ts** contains the left menu in the COP. Comment or uncomment to show items:
```javascript
export const ROUTES: RouteInfo[] = [
    //  { path: '/sound', title: 'Sound',  icon: 'ti-volume', class: '' },
    //{ path: '/maps', title: 'Map',  icon: 'ti-map', class: '' },
    
    // { path: '/audience', title: 'Audience Area',  icon: 'ti-user', class: '' },
    // { path: '/neighbour', title: 'Neighbour Area',  icon: 'ti-direction-alt', class: '' },
    // { path: '/restingarea', title: 'Resting Area',  icon: 'ti-control-pause', class: '' },
    { path: '/crowd', title: 'Crowd',  icon: 'ti-user', class: '' },
    // { path: '/download', title: 'Download Data',  icon: 'ti-download', class: '' },
    
    // { path: '/staff', title: 'Staff',  icon: 'ti-id-badge', class: '' },
    { path: '/logout', title: 'Logout',  icon: 'ti-shift-right', class: 'test' }
];
```     
### Docker

To create your own customized docker image from the one that you are running.

First build the angular app
```bash
ng build --prod
```
Create the docker image
```bash
 docker build -t myrepository/mycop:test .
```
Push the docker image
```bash
 ddocker push  myrepository/mycop:test
```
To just run the latest version of COP.UI from the MONICA DockerHub repository:
```bash
docker run -p 8900:8080  monicaproject/monica-cop
```


### Prerequisite
* [Angular](https://angular.io/)
* [COP.API](https://github.com/MONICA-Project/COP.API)(https://github.com/MONICA-Project/COP.DB)




### Build

```bash
ng build --prod
```

### Endpoints exposed
The default port that is exposed is port 8080

## 
## Contributing
Contributions are welcome. 

Please fork, make your changes, and submit a pull request. For major changes, please open an issue first and discuss it with the other authors.

## Affiliation
![MONICA](https://github.com/MONICA-Project/template/raw/master/monica.png)  
This work is supported by the European Commission through the [MONICA H2020 PROJECT](https://www.monica-project.eu) under grant agreement No 732350.
