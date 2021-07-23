import { Component, OnDestroy, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { Place } from '../places.model';
import { PlacesService } from '../places.service';
import { SegmentChangeEventDetail } from '@ionic/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit, OnDestroy {
  loadedPlaces: Place[];
  slicedPlaces: Place[];
  placesSub: Subscription;
  relevantPlaces: Place[];
  isLoading = false;
  constructor(private placesService: PlacesService, private menuCtrl: MenuController, private authService: AuthService) { }

  ngOnInit() {
    this.placesSub = this.placesService.getPlaces().subscribe(places => {
      this.loadedPlaces = places;
      this.relevantPlaces = this.loadedPlaces;
      this.slicedPlaces = this.relevantPlaces.slice(1);
    });
  }
  ionViewWillEnter() {
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

  /* onOpenMenu() {
    this.menuCtrl.toggle();
  } */

  narrowCustomEvent(e: Event) {
    if (!this.isCustomEvent(e)) {
      throw new Error('Is not custom event')
    }
    this.onFilterUpdate(e);
  }

  isCustomEvent(event: Event): event is CustomEvent {
    return 'detail' in event;
  }

  onFilterUpdate(event: CustomEvent<SegmentChangeEventDetail>) {
    this.authService.getUserId().pipe(take(1)).subscribe(userId => {
      if (event.detail.value === "all") {
        this.relevantPlaces = this.loadedPlaces;
        this.slicedPlaces = this.relevantPlaces.slice(1);
        console.log(this.relevantPlaces, this.slicedPlaces, "------------ALL----------");
      }
      else {
        this.relevantPlaces = this.loadedPlaces.filter(placeEl => {
          console.log(placeEl.userId, placeEl.userId !== userId);
          return placeEl.userId !== userId;
        });
        this.slicedPlaces = this.relevantPlaces.slice(1);
        console.log(this.relevantPlaces, this.slicedPlaces, "---------------BOOK--------------");
      }
    });

  }
}
