import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonItemSliding } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Place } from '../places.model';
import { PlacesService } from '../places.service';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
})
export class OffersPage implements OnInit, OnDestroy {
  places: Place[];
  isLoading = false;
  private placesSub: Subscription;

  constructor(private placesService: PlacesService, private router: Router) { }

  ngOnInit() {
    this.placesSub = this.placesService.getPlaces().subscribe(places => {
      this.places = places;
    });
  }
  ionViewWillEnter () {
    this.isLoading = true;
    this.placesService.fetchPlaces().subscribe(() => {
      this.isLoading = false;
    });
  }

  ngOnDestroy() {
    if(this.placesSub) {
      this.placesSub.unsubscribe();
    }
  }
  onEdit(placeId: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.router.navigate(['/', 'places', 'tabs', 'offers', 'edit', placeId]);
    console.log("Editing item", placeId);
  }
}
