import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
openAuth() {
this.navCtrl.navigateForward('/tabs/account');
}


  constructor(private navCtrl: NavController) {}
openRoutePlanner() {
this.navCtrl.navigateForward('/tabs/search');
}
openRecentJourneys() {
this.navCtrl.navigateForward('/tabs/search');
}
openFavorites() {
this.navCtrl.navigateForward('/tabs/favourite');
}
}