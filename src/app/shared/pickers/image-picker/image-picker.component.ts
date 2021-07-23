import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef, Input } from '@angular/core';
import { Plugins, Capacitor, Camera, CameraSource, CameraResultType } from '@capacitor/core';
import { ActionSheetController, AlertController, Platform } from '@ionic/angular';
@Component({
  selector: 'app-image-picker',
  templateUrl: './image-picker.component.html',
  styleUrls: ['./image-picker.component.scss'],
})
export class ImagePickerComponent implements OnInit {
  selectedImage: string;
  @Output() imagePick = new EventEmitter<string | File>();
  usePicker = false;
  @ViewChild('filePicker') filePicker: ElementRef<HTMLInputElement>;
  @Input() showPreview = false;

  constructor(private alertCtrl: AlertController, private platform: Platform, private actionSheetCtrl: ActionSheetController) { }

  ngOnInit() {
    console.log("Mobile: ", this.platform.is('mobile'));
    console.log("Hybrid: ", this.platform.is('hybrid'));
    console.log("iOS: ", this.platform.is('ios'));
    console.log("Android: ", this.platform.is('android'));
    console.log("Desktop: ", this.platform.is('desktop'));
    if ((this.platform.is("mobile") && !this.platform.is("hybrid")) || this.platform.is("desktop")) {
      this.usePicker = true;
    }
  }

  onPickImage() {
    this.actionSheetCtrl.create({
      header: "Choose an option",
      buttons: [{
        text: "Take picture",
        handler: () => {
          this.onSelectOption("camera");
        }
      },
      {
        text: "Choose file",
        handler: () => {
          this.onSelectOption("file");
        }
      }]
    }).then(actionSheetEl => {
      actionSheetEl.present();
    });
    if(!Capacitor.isPluginAvailable('Camera')) {
      this.filePicker.nativeElement.click();
      return;
    }

  }


  onSelectOption(mode: "camera" | "file") {
    if (mode === "camera") {
      if (Capacitor.isPluginAvailable('Camera')) {
        Plugins.Camera.getPhoto({
          quality: 50,
          source: CameraSource.Prompt,
          correctOrientation: true,
          width: 600,
          resultType: CameraResultType.Base64
        }).then(image => {
          this.selectedImage = image.base64String;
          this.imagePick.emit(image.base64String);
        }).catch(err => {
          console.log(err);
          if (this.usePicker) {
            this.filePicker.nativeElement.click();
          }
          return false;
        });
      } else {
        this.alertCtrl.create({header: "An error ocurred", message: "Could not access camera", buttons: ["OK"]}).then(alertEl => {
          alertEl.present();
        });
        this.filePicker.nativeElement.click();
      }
    }
    else {
      this.filePicker.nativeElement.click();
    }

  }

  onFileChosen(event: Event) {
    const pickedFile = (event.target as HTMLInputElement).files[0];
    if (!pickedFile) {
      return;
    }
    const fr = new FileReader();
    fr.onload = () => {
      const dataUrl = fr.result.toString();
      this.selectedImage = dataUrl;
      this.imagePick.emit(pickedFile);
    }
    fr.readAsDataURL(pickedFile);


  }
}
