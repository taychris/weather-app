import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { WeatherService } from 'src/app/shared/weather-service.service';
import { WeatherModel } from '../../shared/models/weather';
import { ForecastModel } from '../../shared/models/forecast';
import * as moment from 'moment';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MainPageComponent implements OnInit, OnDestroy {
  //used to set and reset the interval which is used for the clock
  clockInterval!: any;
  //used to getting and setting the cookie
  cookieValue: string;
  //information about the current weather
  weatherInformation!: WeatherModel;
  //information about 3 day forecast
  forecastData: ForecastModel[] = [];

  searchOpened: boolean = false;
  isNightTime: boolean = false;

  constructor(private weatherSvc: WeatherService, private cookieService: CookieService) {
    //get the cookie value (the city name)
    this.cookieValue = this.cookieService.get('city');
  }

  ngOnInit(): void {
  }

  //if the location changes, update the weather
  onLocationChange(event: string){
    this.cookieValue = event;
    this.updateWeather(event);
    this.toggleSearchScreen();
  }

  //if the child component needs to be hidden
  onVisibleChange(event: boolean) {
    this.searchOpened = event;
  }

  updateWeather(cityDisplayName: string) {
    this.weatherSvc.getWeatherInformation(cityDisplayName).subscribe((data:any) => {

      //set the current weather information
      this.weatherInformation = {
        date: this.formatDate(data.dt),
        weather: data.weather[0].main,
        icon: data.weather[0].icon,
        temperature: data.main.temp.toFixed(0),
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        wind: this.formatWindSpeed(data.wind.speed),
        sunrise: this.formatTimeForWeatherInfo(data.sys.sunrise),
        sunset: this.formatTimeForWeatherInfo(data.sys.sunset),
        dayTime: this.calculateDayTime(data.sys.sunrise, data.sys.sunset),
        lat: data.coord.lat,
        lon: data.coord.lon,
      };

      //formatting the sunset time
      var sunsetTimeInMinutes = moment(this.weatherInformation.sunset, ["h:mm A"]).format("HH:mm");
      
      //used for clock and to differentiate between daytime and night time
      this.clockInterval = setInterval(() => {
        this.formatTimeForCurrentTime();
        var currentTimeInMinutes = moment(this.formatTimeForCurrentTime(), ["h:mm A"]).format("HH:mm");
        if(sunsetTimeInMinutes < currentTimeInMinutes) {
          this.isNightTime = true;
        } else {
          this.isNightTime = false;
        }
      }, 1000);


      this.weatherSvc.getForecast(this.weatherInformation.lat, this.weatherInformation.lon).subscribe((data :any ) => {
        this.forecastData = [];
        //get the forecast for the next three days
        for(let i = 1; i < 4; i++) {
          var forecastItem: ForecastModel = {
            date: moment(data.daily[i].dt * 1000).format('ddd, DD'),
            icon: data.daily[i].weather[0].icon,
            tempMin: data.daily[i].temp.min.toFixed(0),
            tempMax: data.daily[i].temp.max.toFixed(0),
          }
          this.forecastData.push(forecastItem);
        }

        //set current days lowest and highest temperature of the day
        this.weatherInformation.tempMin = data.daily[0].temp.min.toFixed(0);
        this.weatherInformation.tempMax = data.daily[0].temp.max.toFixed(0);
      });
    }, error => {
      console.log(error);
    });
  }

  //this date is displayed on the main screen
  formatDate(unixDate: number) {
    var date = new Date(unixDate * 1000);

    return moment(date).format('dddd, DD MMM YYYY');
  }

  formatTimeForCurrentTime() { //used to display current time
    var date = new Date();
    var formattedTime = moment(date).format('hh:mm A') //formatting the time

    this.weatherInformation.time = formattedTime;

    return formattedTime;
  }

  formatTimeForWeatherInfo(unixDate: number) { //formatting time - used for sunset & sunrise details
    var date = new Date(unixDate * 1000);
    var formattedTime = moment(date).format('hh:mm A');

    return formattedTime;
  }

  formatWindSpeed(mps: number) {
    return (3.6 * mps).toFixed(0); //convert meter per second to kmh
  }

  calculateDayTime(sunrise: number, sunset: number) {
    var sunriseHour = moment(sunrise * 1000); //formatting the date from unix to human readable format
    var sunsetHour = moment(sunset * 1000); //formatting the date from unix to human readable format

    var differenceInMinutes = sunsetHour.diff(sunriseHour, 'minutes') / 60; //getting the difference in precise hours and minutes
    var differenceInMinutesString = differenceInMinutes.toFixed(2).toString(); //converting to string so that the time can be formatted to the desired return value

    if(differenceInMinutesString.indexOf('.') > -1) { //if time is not round, return hour and minutes
      var splitDifference = differenceInMinutesString.split('.');

      return `${splitDifference[0]}h ${splitDifference[1]}m`;
    } else { //if time is round and no minutes, just return the hours
      return `${differenceInMinutesString}h`;
    }
  }

  //used to display/hide location tab
  toggleSearchScreen() {
    this.searchOpened = !this.searchOpened;
  }

  ngOnDestroy(): void {
    clearInterval(this.clockInterval);
  }
}
