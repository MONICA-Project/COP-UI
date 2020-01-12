import { AlertsComponent } from './alerts/alerts.component';
import { AudienceComponent } from './audience/audience.component';
import { LogoutComponent } from './logout/logout.component';
import { AppLayoutComponent } from './_layout/app-layout/app-layout.component';
import { SoundComponent } from './sound/sound.component';
import { CrowdComponent } from './crowd/crowd.component';
import { Routes } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { UserComponent } from './user/user.component';
import { TableComponent } from './table/table.component';
import { TypographyComponent } from './typography/typography.component';
import { IconsComponent } from './icons/icons.component';
import { MapsComponent } from './maps/maps.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { UpgradeComponent } from './upgrade/upgrade.component';
import { MaterialTableComponent } from 'app/material-table/material-table.component';
import { LoginComponent } from 'app/login/login.component';
import { AuthGuard } from 'app/auth-guard.service';
import { SiteLayoutComponent } from 'app/_layout/site-layout/site-layout.component';
import { SoundDetailsComponent } from 'app/sound-details/sound-details.component';
import { NeighbourComponent } from 'app/neighbour/neighbour.component';
import { RestingAreaComponent } from 'app/resting-area/resting-area.component';
import { DownloadDataComponent } from 'app/download-data/download-data.component';

export const AppRoutes: Routes = [

    // {
    //     path: '',
    //     redirectTo: 'maps',
    //     pathMatch: 'full',
    // },

    // App routes goes here here
    {
        path: '',
        // component: MapsComponent
        component: AppLayoutComponent,
        children: [
            { 
                path: '', 
                component: SoundComponent,//MapsComponent, //  DashboardComponent, //
                pathMatch: 'full',
                canActivate: [AuthGuard]
            },
            {
                path: 'maps', component: MapsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'dashboard',
                component: DashboardComponent
            },
            {
                path: 'user',
                component: UserComponent
            },
            {
                path: 'table',
                component: TableComponent
            },
            {
                path: 'typography',
                component: TypographyComponent
            },
            {
                path: 'icons',
                component: IconsComponent
            },
            {
                path: 'notifications',
                component: NotificationsComponent
            },
            {
                path: 'upgrade',
                component: UpgradeComponent
            },
            {
                path: 'test',
                component: MaterialTableComponent
            },
            {
                path: 'crowd',
                component: CrowdComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'sound',
                component: SoundComponent,
                canActivate: [AuthGuard]
            },
            { 
                path: 'sound-details/:id', 
                component: SoundDetailsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'staff',
                component: MaterialTableComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'audience',
                component: AudienceComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'neighbour',
                component: NeighbourComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'restingarea',
                component: RestingAreaComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'download',
                component: DownloadDataComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'alerts',
                component: AlertsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'logout',
                component: LogoutComponent,
                canActivate: [AuthGuard]
            }
        ]
    },
    //no layout routes
    {
        path: 'login',
        component: LoginComponent
    },
    // otherwise redirect to home
    { path: '**', redirectTo: '' }
]
