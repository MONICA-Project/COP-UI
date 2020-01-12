import { SendMessageComponent } from './send-message/send-message.component';
import { PagerService } from './pager.service';
import { ErrorInterceptor } from './error.interceptor';
import { AuthInterceptor } from './auth.interceptor';
import { WeatherService } from './weather.service';
import { ZoneService } from './zone.service';
import { PersonService } from './person.service';
import { AuthGuard } from './auth-guard.service';
// cnetprojects@gmail.com, CnetProject!"#
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { AppRoutes } from './app.routing';
import { SidebarModule } from './sidebar/sidebar.module';
import { FooterModule } from './shared/footer/footer.module';
import { NavbarModule} from './shared/navbar/navbar.module';
import { FixedPluginModule} from './shared/fixedplugin/fixedplugin.module';
import { NguiMapModule} from '@ngui/map';

import { DashboardComponent }   from './dashboard/dashboard.component';
import { UserComponent }   from './user/user.component';
import { TableComponent }   from './table/table.component';
import { TypographyComponent }   from './typography/typography.component';
import { IconsComponent }   from './icons/icons.component';
import { MapsComponent }   from './maps/maps.component';
import { NotificationsComponent }   from './notifications/notifications.component';
import { UpgradeComponent }   from './upgrade/upgrade.component';
import { MatTableModule, MatFormFieldModule, MatPaginatorModule, MatInputModule, MatSortModule, MatSelectModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialTableComponent } from './material-table/material-table.component';
import { CrowdComponent } from './crowd/crowd.component';
import { SoundComponent } from './sound/sound.component';
import { OverviewCardComponent } from './overview-card/overview-card.component';
import { MapComponent } from './map/map.component';
import { LoginComponent } from './login/login.component';
import { AppLayoutComponent } from './_layout/app-layout/app-layout.component';
import { SiteLayoutComponent } from './_layout/site-layout/site-layout.component';
import { FormsModule } from '@angular/forms';
import { LogoutComponent } from './logout/logout.component';
import { TimelineComponent } from './timeline/timeline.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ThingService } from 'app/thing.service';
import { DetailPersonComponent } from './detail-person/detail-person.component';
import { IncidentService } from 'app/incident.service';
import { IncidentDetailsComponent } from './incident-details/incident-details.component';
import { ChartModule } from 'angular2-highcharts';
import { HighchartsStatic } from 'angular2-highcharts/dist/HighchartsService';
import { CpblzeqChartComponent } from './cpblzeq-chart/cpblzeq-chart.component';
import { ZoneCapacityComponent } from './zone-capacity/zone-capacity.component';
import { CrowdIncidentsComponent } from './crowd-incidents/crowd-incidents.component';
import { SortablejsModule } from 'angular-sortablejs';
import { IonRangeSliderModule } from "ng2-ion-range-slider";
import { WindSpeedComponent } from './wind-speed/wind-speed.component';

import { GaugeModule } from 'angular-gauge';
import { SoundDetailsComponent } from './sound-details/sound-details.component';
import { LxeqChartComponent } from './lxeq-chart/lxeq-chart.component';
import { OctaveSpectraComponent } from './octave-spectra/octave-spectra.component';
import { AnnoyanceIndexChartComponent } from './annoyance-index-chart/annoyance-index-chart.component';
import { AudienceComponent } from './audience/audience.component';
import { NeighbourComponent } from './neighbour/neighbour.component';
import { RestingAreaComponent } from './resting-area/resting-area.component';
import { DownloadDataComponent } from './download-data/download-data.component';
import { AudienceChartsComponent } from './audience-charts/audience-charts.component';
import { NeighbourChartsComponent } from './neighbour-charts/neighbour-charts.component';
import { MapHeatmapLayerComponent } from './map-heatmap-layer/map-heatmap-layer.component';
import { SafeHtmlPipe } from './safe-html.pipe';
import { NoiseCaptureComponent } from './noise-capture/noise-capture.component';
import { AlertsComponent } from 'app/alerts/alerts.component';

export function highchartsFactory() {
  return require('highcharts');
}

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    UserComponent,
    TableComponent,
    TypographyComponent,
    IconsComponent,
    MapsComponent,
    NotificationsComponent,
    UpgradeComponent,
    MaterialTableComponent,
    CrowdComponent,
    SoundComponent,
    OverviewCardComponent,
    MapComponent,
    LoginComponent,
    AppLayoutComponent,
    SiteLayoutComponent,
    LogoutComponent,
    TimelineComponent,
    DetailPersonComponent,
    IncidentDetailsComponent,
    CpblzeqChartComponent,
    ZoneCapacityComponent,
    CrowdIncidentsComponent,
    WindSpeedComponent,
    SoundDetailsComponent,
    LxeqChartComponent,
    OctaveSpectraComponent,
    AnnoyanceIndexChartComponent,
    AudienceComponent,
    NeighbourComponent,
    RestingAreaComponent,
    DownloadDataComponent,
    AudienceChartsComponent,
    NeighbourChartsComponent,
    MapHeatmapLayerComponent,
    AlertsComponent,
    SendMessageComponent,
    SafeHtmlPipe,
    NoiseCaptureComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(AppRoutes),
    SidebarModule,
    NavbarModule,
    FooterModule,
    FixedPluginModule,
    MatTableModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatInputModule,
    MatSelectModule,
    BrowserAnimationsModule,
    BrowserModule,
    MatTableModule,
    MatSortModule,
    HttpClientModule,
    ChartModule,
    SortablejsModule.forRoot({ animation: 150 }),
    IonRangeSliderModule,
    NguiMapModule.forRoot({apiUrl: 'https://maps.google.com/maps/api/js?key=AIzaSyBvCAXVjX5C559kdIlU8mVLgnoB6ZtGys8&libraries=visualization,drawing,places,geometry'}),
    GaugeModule.forRoot()
  ],
  providers: [
    AuthGuard,
    PersonService,
    ZoneService,
    ThingService,
    IncidentService,
    WeatherService,
    PagerService,
    {
      provide: HighchartsStatic,
      useFactory: highchartsFactory
    },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
