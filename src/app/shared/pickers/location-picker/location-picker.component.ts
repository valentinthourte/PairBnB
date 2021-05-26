import { HttpClient } from '@angular/common/http';
import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { ActionSheetController, AlertController, ModalController } from '@ionic/angular';
import { MapModalComponent } from '../../map-modal/map-modal.component';
import { environment } from '../../../../environments/environment';
import { map, switchMap } from 'rxjs/operators';
import { Coordinates, PlaceLocation } from 'src/app/places/location.model';
import { of } from 'rxjs';
import { Plugins, Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.scss'],
})
export class LocationPickerComponent implements OnInit {
  @Output() locationPick = new EventEmitter<PlaceLocation>();
  constructor(private alertController: AlertController, private actionSheetCtrl: ActionSheetController, private modalCtrl: ModalController, private http: HttpClient) { }
  isLoading: boolean = false;
  selectedLocationImage: string;
  @Input() showPreview = false;

  ngOnInit() {}

  onPickLocation() {
    this.actionSheetCtrl.create({header: 'Please choose', buttons: [
      {text: 'Auto-Locate', handler: () => {
        this.locateUser();
      }},
      {text: 'Pick on map', handler: () => {this.openMap()}},
      {text: 'Cancel', role: 'cancel'}
    ]}).then(actionSheetEl => {
      actionSheetEl.present();
    });
  }

  private locateUser() {
    if (!Capacitor.isPluginAvailable('Geolocation')) {
      this.showErrorAlert();
      return;
    }
    this.isLoading = true;
    Plugins.Geolocation.getCurrentPosition().then(geoPosition => {
      const coordinates: Coordinates = {lat: geoPosition.coords.latitude, lng: geoPosition.coords.longitude};
      this.createPlace(coordinates.lat, coordinates.lng);
      this.isLoading = true;
    }).catch(err => {
      this.isLoading = true;
      this.showErrorAlert();
    });

  }

  private showErrorAlert() {
    this.alertController.create({header: 'Could not fetch location', message: "Please use the map to pick your location"}).then(alertEl => {
      alertEl.present();
    });
  }

  private createPlace(lat: number, lng: number) {
    const pickedLocation: PlaceLocation = {
      lat: lat,
      lng: lng,
      address: null,
      staticMapImageUrl: null
    }
    this.isLoading = true;
        this.getAddress(lat, lng).pipe(switchMap(address => {
          pickedLocation.address = address;
          return of(this.getMapImage(pickedLocation.lat, pickedLocation.lng, 16));
        })).subscribe(staticMapImageUrl => {
          pickedLocation.staticMapImageUrl = staticMapImageUrl;
          this.selectedLocationImage = staticMapImageUrl;
          this.isLoading = false;
          this.locationPick.emit(pickedLocation);
        });
  }


  private openMap() {
    this.modalCtrl.create({component: MapModalComponent}).then(modalEl => {
      modalEl.onDidDismiss().then(modalData => {
        if(!modalData.data) {
          return;
        }
        const coordinates: Coordinates = {lat: modalData.data.lat, lng: modalData.data.lng}
      this.createPlace(coordinates.lat, coordinates.lng);
      });
      modalEl.present();
    });
  }

  private getAddress(lat: number, lng: number) {
    return this.http.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${environment.googleMapsApiKey}`)
    .pipe(map((geoData: any) => {
      if (!geoData || !geoData.results || geoData.results.length === 0) {
        return null;
      }
      console.log(geoData.results[0].formatted_address);
      return geoData.results[0].formatted_address;
    }));
  }

  private getMapImage(lat: number, lng: number, zoom: number) {
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=500x300&maptype=roadmap
    &markers=color:red%7Clabel:PlaceS%7C${lat},${lng}
    &key=${environment.googleMapsApiKey}`;
  }
}
