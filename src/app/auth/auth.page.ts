import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { AuthService, AuthResponseData } from './auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  isLoading: boolean = false;
  isLogin = true;

  constructor(private alertCtrl: AlertController, private authService: AuthService, private router: Router, private loadingCtrl: LoadingController) { }

  ngOnInit() {
  }

  authenticate(email: string, password: string) {
    this.isLoading = true;
    let authObs: Observable<AuthResponseData>;
    this.loadingCtrl.create({keyboardClose: true, message: "Logging in"}).then(loadingEl => {
      loadingEl.present();
      if (this.isLogin) {
        authObs = this.authService.login(email, password);
      }
      else {
        authObs = this.authService.signUp(email, password);
      }
      authObs.subscribe(resData => {
        console.log(resData);
        this.isLoading = false;
        loadingEl.dismiss();
        this.router.navigateByUrl("/places/tabs/discover");
      }, errRes => {
        loadingEl.dismiss();
        console.log(errRes);
        const code = errRes.error.error.message;
        let message = 'Could not sign you up, please try again.';
        if (code === 'EMAIL_EXISTS') {
          message = 'This email already exists!';
        }
        else if (code === "EMAIL_NOT_FOUND") {
          message = "The email could not be found";
        }
        else if (code === "INVALID_PASSWORD") {
          message = "Password is invalid";
        }
          this.showAlert(message);
      });
    });
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const email = form.value.email;
    const password = form.value.password;

    this.authenticate(email, password);
    form.reset();
  }

  onToggleSwitch() {
    this.isLogin = !this.isLogin;
  }

  private showAlert(message: string) {
    this.alertCtrl.create({header: "Authentication failed", message: message, buttons: ["Okay"]}).then(alertEl => {
      alertEl.present();
    })
  }
}
