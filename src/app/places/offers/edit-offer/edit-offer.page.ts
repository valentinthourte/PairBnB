import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Place } from '../../places.model';
import { PlacesService } from '../../places.service';

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.page.html',
  styleUrls: ['./edit-offer.page.scss'],
})
export class EditOfferPage implements OnInit, OnDestroy {
  place: Place;
  form: FormGroup;
  placeId: string;
  private placeSub: Subscription;
  isLoading = false;
  constructor(private alertCtrl: AlertController, private loadingCtrl: LoadingController,private placesService: PlacesService, private route: ActivatedRoute, private navCtrl: NavController, private router: Router) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap =>  {
      if (!paramMap.has("offerId")) {
        this.navCtrl.navigateBack("/places/tabs/offers");
        return;
      }
      this.placeId = paramMap.get("offerId");
      this.isLoading = true;
      this.placeSub = this.placesService.getPlace(paramMap.get("offerId")).subscribe(place => {
        this.place = place;
        this.form = new FormGroup({
          title: new FormControl(this.place.title, {
            updateOn:"blur"
          }),
          description: new FormControl(this.place.description, {
            updateOn:"blur",
            validators: [Validators.maxLength(180)]
          }),
          price: new FormControl(this.place.price, {
            updateOn:"blur",
            validators: [Validators.min(1)]
          }),
          dateFrom: new FormControl(null, {
            updateOn: "blur"
          }),
          dateTo: new FormControl(null, {
            updateOn:"blur"
          })
        });
        this.isLoading = false;
      }, error => {
        this.alertCtrl.create({
          header: "An error ocurred",
          message: "Place could not be fetched, please try again later",
          buttons: [{text: "Okay", handler: () => {
            this.router.navigate(["/places/tabs/offers"]);
          }}]
        }).then(alertEl => {
          alertEl.present();
        });
      });
    });
  }
  ngOnDestroy() {
    if (this.placeSub) {
      this.placeSub.unsubscribe();
    }
  }
  onConfirmEdit() {
    if (!this.form.valid) {
      return;
    }
    this.loadingCtrl.create({
      message: "Editing offer",
      keyboardClose: true
    }).then(loadingEl => {
      loadingEl.present();
      this.placesService.editPlace(this.place.id, this.form.value.title, this.form.value.description).subscribe(() => {
        loadingEl.dismiss();
        this.form.reset();
        this.router.navigate(['/places/tabs/offers']);
      });
    })
  }
}
