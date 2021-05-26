import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { IonicModule } from "@ionic/angular";
import { MapModalComponent } from "./shared/map-modal/map-modal.component";
import { ImagePickerComponent } from "./shared/pickers/image-picker/image-picker.component";
import { LocationPickerComponent } from "./shared/pickers/location-picker/location-picker.component";

@NgModule({
  declarations: [LocationPickerComponent, MapModalComponent, ImagePickerComponent],
  imports: [CommonModule, IonicModule],
  exports: [ImagePickerComponent, LocationPickerComponent, MapModalComponent],
  entryComponents: [MapModalComponent]
})
export class SharedModule {

}
