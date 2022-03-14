import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

import { AppComponent } from './app.component';
import { MainPageComponent } from './components/main-page/main-page.component';
import { LocationSearchComponent } from './components/location-search/location-search.component';

@NgModule({
  declarations: [
    AppComponent,
    MainPageComponent,
    LocationSearchComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
  ],
  providers: [CookieService],
  bootstrap: [AppComponent]
})
export class AppModule { }
