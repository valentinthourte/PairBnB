import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Booking } from 'src/app/bookings/booking.model';
import { Place } from '../../places.model';
import { PlacesService } from '../../places.service';

@Component({
  selector: 'app-offer-bookings',
  templateUrl: './offer-bookings.page.html',
  styleUrls: ['./offer-bookings.page.scss'],
})
export class OfferBookingsPage implements OnInit, OnDestroy {
  place: Place;
  private placeSub: Subscription;
  isLoading = false;
  bookings: Booking[];
  constructor(private placesService: PlacesService, private route: ActivatedRoute, private navCtrl: NavController) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if(!paramMap.has("offerId")) {
        this.navCtrl.navigateBack("/places/tabs/offers");
        return;
      }
      this.isLoading = true;
      this.placeSub = this.placesService.getPlace(paramMap.get("offerId")).subscribe(place => {
        this.place = place;
        this.isLoading = false;
      });
    });
  }

  ngOnDestroy() {
    if(this.placeSub) {
      this.placeSub.unsubscribe();
    }
  }
}
