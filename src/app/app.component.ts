import { Component, OnDestroy, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { Platform } from '@ionic/angular';
import { Plugins, Capacitor } from '@capacitor/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy{
  private previousAuthState = false;
  private authSub: Subscription;
  constructor(private platform: Platform, private authService: AuthService, private router: Router) {
    console.log(this.platform.is('hybrid'));
  }
  initializeApp() {
    this.platform.ready().then(() => {
      if (Capacitor.isPluginAvailable('SplashScreen')) {
        Plugins.SplashScreen.hide();
      }
    });
  }
  ngOnDestroy() {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }

  ngOnInit() {
    this.authSub = this.authService.getUserIsAuthenticated().subscribe(isAuth => {
        if (!isAuth && this.previousAuthState != isAuth) {
          this.router.navigateByUrl("/auth");
        }
        this.previousAuthState = isAuth;
    });
  }
  onLogout() {
    this.authService.logout();

  }
}
