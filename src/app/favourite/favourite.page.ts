import { Component,OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

interface Route {
  id: string;
  duration: number;
  origin: string;
  destination: string;
  buses?: number[];
  busRoute?: string;
  isFavorite: boolean;
}



@Component({
  selector: 'app-tab3',
  templateUrl: 'favourite.page.html',
  styleUrls: ['favourite.page.scss'],
  standalone: false,
})

export class FavouritePage {

  selectedTab: 'favorites' | 'recent' = 'favorites';
  
  routes: Route[] = [
    {
      id: '1',
      duration: 45,
      origin: 'Downtown Station',
      destination: 'Airport Terminal',
      buses: [42],
      busRoute: 'Express A',
      isFavorite: true
    },
    {
      id: '2',
      duration: 20,
      origin: 'Central Park',
      destination: 'University Campus',
      buses: [15],
      isFavorite: true
    },
    {
      id: '3',
      duration: 35,
      origin: 'Mall District',
      destination: 'Beach Boulevard',
      buses: [78, 23],
      isFavorite: true
    }
  ];

  constructor(private navCtrl:NavController) {}

  get filteredRoutes(): Route[] {
    if (this.selectedTab === 'favorites') {
      return this.routes.filter(route => route.isFavorite);
    }
    return this.routes;
  }

  selectTab(tab: 'favorites' | 'recent'): void {
    this.selectedTab = tab;
  }

  deleteRoute(routeId: string): void {
    this.routes = this.routes.filter(route => route.id !== routeId);
  }

  goToRoute(route: Route): void {
    console.log('Navigate to route:', route);
   
  }

  goBack(): void {
    this.navCtrl.navigateForward('/tabs/home');

  }
}
