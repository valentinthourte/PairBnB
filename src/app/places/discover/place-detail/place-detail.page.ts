import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, AlertController, LoadingController, ModalController, NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../auth/auth.service';
import { BookingService } from 'src/app/bookings/booking.service';
import { CreateBookingComponent } from 'src/app/bookings/create-booking/create-booking.component';
import { Place } from '../../places.model';
import { PlacesService } from '../../places.service';
import { MapModalComponent } from '../../../shared/map-modal/map-modal.component';
import { switchMap, take } from 'rxjs/operators';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {
  place: Place;
  isBookable = false;
  isLoading = false;
  private placeSub: Subscription;
  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private placesService: PlacesService,
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private bookingService: BookingService,
    private loadingCtrl: LoadingController,
    private navigationRouter: Router,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private router: Router
    ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has("placeId")) {
        this.navCtrl.navigateBack("/places/tabs/discover");
        return;
      }
      this.isLoading = true;
      let fetchedUserId: string;
      this.authService.getUserId().pipe(take(1), switchMap(userId => {
        if (!userId) {
          throw new Error("Found no user!");
        }
        if (typeof(userId) === 'string') {
          fetchedUserId = userId;
        }
        return this.placesService.getPlace(paramMap.get("placeId"));
      })).subscribe(place => {
        this.place = place;
        this.isBookable = place.userId !== fetchedUserId;
        this.isLoading = false;
      }, error => {
        this.alertCtrl.create({
          header: "Place not found",
          message: "Place not found, please try again later",
          buttons: [{text: "OK", handler: () => {
            this.router.navigate(["/places/tabs/discover"]);
          }}]
        }).then(alertEl => {alertEl.present();})
      });
    });
  }

  ngOnDestroy() {
    if(this.placeSub) {
      this.placeSub.unsubscribe();
    }
  }
  onBookPlace() {
    this.actionSheetCtrl.create({
      header: "Choose an action",
      buttons: [
        {
          text: "Select date",
          handler: () => {
            this.openBookingModal("select");
          }
        },
        {
          text: "Random date",
          handler: () => {
            this.openBookingModal("random");
          }
        },
        {
          text: "Cancel",
          role: "destructive"
        }

      ]
    }).then(actionSheetEl => {
      actionSheetEl.present();
    });

  }

  openBookingModal(mode: "select" | "random") {
    this.modalCtrl.create({component: CreateBookingComponent, componentProps: {selectedPlace: this.place, selectedMode: mode}}).then(modalEl => {
      modalEl.present();
      return modalEl.onDidDismiss();
    })
    .then(resultData =>  {
      if(resultData.role === "confirm") {
        this.loadingCtrl.create({message: "Creating booking..."}).then(loadingEl => {
          loadingEl.present();
          const data = resultData.data.bookingData;
          this.bookingService.addBooking(this.place.id,
            data.firstName,
            data.lastName,
            data.guestNumber,
            data.startDate,
            data.endDate).subscribe(() => {
              loadingEl.dismiss();
              this.navigationRouter.navigate(['/bookings']);
            })
        });
      }
    });
  }
  onShowFullMap() {
    this.modalCtrl.create({component: MapModalComponent, componentProps: {
      center: {lat: this.place.location.lat, lng: this.place.location.lng},
      selectable: false,
      closeButtonText: "Close",
      title: this.place.location.address
    }})
    .then(modalEl => {
      modalEl.present();
    });
  }
}
