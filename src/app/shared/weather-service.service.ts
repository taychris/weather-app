import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
const apiKey: string = environment.apiKey;

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  constructor(private http: HttpClient) { }

  getWeatherInformation(cityName: string) {
    return this.http.get(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`);
  }

  getForecast(lat?: number, lon?: number) {
    return this.http.get(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&cnt=3&exclude=current,minutely,hourly,alerts`);
  }
}
