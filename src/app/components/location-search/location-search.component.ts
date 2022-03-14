import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { WeatherService } from 'src/app/shared/weather-service.service';
import { LocationModel } from '../../shared/models/locations';

@Component({
  selector: 'location-search',
  templateUrl: './location-search.component.html',
  styleUrls: ['./location-search.component.scss']
})
export class LocationSearchComponent implements OnInit {
  @Output() location : EventEmitter<string>= new EventEmitter<string>();
  @Output() visible : EventEmitter<boolean>= new EventEmitter<boolean>();

  cookieValue: string;

  //used for filtering the list of locations
  locations: LocationModel[] = [
    { cityDisplayName: 'bratislava',
      cityNormalizedName: 'bratislava' },
    { cityDisplayName: 'humenné',
      cityNormalizedName: 'humenne' },
    { cityDisplayName: 'koromľa',
      cityNormalizedName: 'koromla' },
    { cityDisplayName: 'košice',
      cityNormalizedName: 'kosice' },
    { cityDisplayName: 'michalovce',
      cityNormalizedName: 'michalovce' },
    { cityDisplayName: 'sobrance',
      cityNormalizedName: 'sobrance' },
  ];

  //used for filtering the locations based on search value
  filteredList!: LocationModel[];

  constructor(private weatherSvc: WeatherService, private cookieService: CookieService) {
    //get the cookie value (the city name)
    this.cookieValue = this.cookieService.get('city');
  }

  ngOnInit(): void {
    //getting the temperature for each city in the locations array - this is the displayed in the locations screen
    for(let i = 0; i < this.locations.length; i++) {
      this.weatherSvc.getWeatherInformation(this.locations[i].cityDisplayName).subscribe((data:any) => {
        this.locations[i].temperature = data.main.temp.toFixed();
      }, error => {
        console.log(error);
      });
    }

    //assign the locations to the filteredLocations, so the the original array doesn't get overwritten in case of searching/filtering
    this.filteredList = this.locations;

    //if cookie is not set, pick the first city name in the locations list by default and get the weather information
    //if cookie is set, get the weather information
    if(!this.cookieValue) {
      this.cookieService.set('city', this.locations[0].cityDisplayName);
      this.loadLocation(this.locations[0].cityDisplayName);
    } else {
      this.loadLocation(this.cookieValue);
    }
  }

  //filter based on the input value on every keystroke
  onKeyStroke(event: any) {
    //remove diacritics from the search value
    let searchValue = event.target.value.normalize("NFD").replace(/\p{Diacritic}/gu, "");
    if(searchValue) {
      this.filteredList = this.locations.filter(i => i.cityNormalizedName.includes(searchValue));
    } else {
      this.filteredList = this.locations;
    }
  }

  //used for initial loading
  loadLocation(cityDisplayName: string) {
    //emit event to parent component so that the weather gets updated
    this.location.emit(cityDisplayName);
    //emit event to parent component so that the child component gets hidden
    this.closeTab();
  }

  //upon clicking a different city, update the weather information
  changeLocation(cityDisplayName: string) {
    //on location clicked, update the cookie value
    this.cookieService.set('city', cityDisplayName);
    //emit event to parent component so that the weather gets updated
    this.location.emit(cityDisplayName);
    //emit event to parent component so that the child component gets hidden
    this.closeTab();
  }

  closeTab() {
    this.visible.emit(false);
  }
}
