import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonItemSliding, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Place } from '../places/places.model';
import { PlacesService } from '../places/places.service';
import { Booking } from './booking.model';
import { BookingService } from './booking.service';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage implements OnInit, OnDestroy {
  bookings: Booking[];
  private bookingsSub: Subscription;
  private placesSub: Subscription;
  isLoading = false;
  constructor(private bookingService: BookingService,
    private placesService: PlacesService,
    private router: Router,
    private loadingCtrl: LoadingController
    ) { }

  ngOnInit() {
    this.bookingsSub = this.bookingService.getBookings().subscribe(bookingList => {
      this.bookings = bookingList;
    });
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.bookingService.fetchBookings().subscribe(() => {
      this.isLoading = false;
    })
  }
  ngOnDestroy() {
    if (this.placesSub) {
      this.placesSub.unsubscribe();
    }
    if (this.bookingsSub) {
      this.bookingsSub.unsubscribe();
    }
  }


  onDeleteBooking(bookingId: string, slidingEl: IonItemSliding) {
    slidingEl.close();
    this.loadingCtrl.create({
      message: "Deleting booking..."
    }).then(loadingEl => {
      loadingEl.present();
      this.bookingService.cancelBooking(bookingId).subscribe(() => {
        loadingEl.dismiss();
      });
    })
  }
  onConfirmBooking(bookingId: string, slidingEl: IonItemSliding) {
    console.log("Confirmed!");
  }

  getPlace(id: string) {
    return this.placesService.getPlace(id);
  }

}
