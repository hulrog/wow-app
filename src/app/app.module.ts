import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HomeComponent } from './home/home.component';
import { DungeonsComponent } from './dungeons/dungeons.component';
import { GuildsComponent } from './guilds/guilds.component';
import { MythicPlusComponent } from './mythic-plus/mythic-plus.component';
import { RaidsComponent } from './raids/raids.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    DungeonsComponent,
    GuildsComponent,
    MythicPlusComponent,
    RaidsComponent,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    FormsModule,
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
