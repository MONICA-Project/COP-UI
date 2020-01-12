import { ZoneService } from './../zone.service';
import { Component, OnInit } from '@angular/core';

declare var $:any;

export interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
}

export const ROUTES: RouteInfo[] = [
    { path: '/sound', title: 'Sound',  icon: 'ti-volume', class: '' },
    { path: '/maps', title: 'Map',  icon: 'ti-map', class: '' },
    { path: '/alerts', title: 'Alerts',  icon: 'ti-alert', class: '' },
    { path: '/crowd', title: 'Crowd',  icon: 'ti-user', class: '' },
    // { path: '/audience', title: 'Audience Area',  icon: 'ti-user', class: '' },
    // { path: '/neighbour', title: 'Neighbour Area',  icon: 'ti-direction-alt', class: '' },
    // { path: '/restingarea', title: 'Resting Area',  icon: 'ti-control-pause', class: '' },
   // { path: '/staff', title: 'Staff',  icon: 'ti-id-badge', class: '' },
    // { path: '/download', title: 'Download Data',  icon: 'ti-download', class: '' },
    
    // { path: 'user', title: 'User Profile',  icon:'ti-user', class: '' },
    // { path: 'table', title: 'Table List',  icon:'ti-view-list-alt', class: '' },
    // { path: 'test', title: 'Table Material',  icon:'ti-view-list-alt', class: '' },
    // { path: 'typography', title: 'Typography',  icon:'ti-text', class: '' },
    // { path: 'icons', title: 'Icons',  icon:'ti-pencil-alt2', class: '' },
    // { path: 'maps', title: 'Maps',  icon:'ti-map', class: '' },
    // { path: 'notifications', title: 'Notifications',  icon:'ti-bell', class: '' },

    { path: '/logout', title: 'Logout',  icon: 'ti-shift-right', class: 'test' }
    // { path: 'upgrade', title: 'Upgrade to PRO',  icon:'ti-export', class: 'active-pro' }
];

@Component({
    moduleId: module.id,
    selector: 'sidebar-cmp',
    templateUrl: 'sidebar.component.html',
})

export class SidebarComponent implements OnInit {
    public menuItems: any[];
    event;
    constructor(private zoneService: ZoneService) {
        this.zoneService.getEvent().subscribe(data => {
            this.event = data;
        });
    }

    ngOnInit() {
        this.menuItems = ROUTES.filter(menuItem => menuItem);
    }

    isNotMobileMenu(){
        if($(window).width() > 991){
            return false;
        }
        return true;
    }

}
