import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-tab1',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  constructor(private router: Router, private navCtrl: NavController) {}
  userName: string = '';
  currentLocation: string = 'Downtown';

  serviceAlerts = [
    {
      type: 'warning',
      icon: 'alert-circle',
      title: 'Route 45 Delayed',
      message: 'Expect 15 min delay due to construction',
    },
    {
      type: 'success',
      icon: 'checkmark-circle',
      title: 'Route 12 Back to Normal',
      message: 'Service resumed after earlier incident',
    },
  ];

  quickActions = [
    {
      id: 'liveMap',
      title: 'Live Map',
      icon: 'map-outline',
      description: 'Track buses in real-time',
      color: 'primary',
    },
    {
      id: 'nearby',
      title: 'Nearby Stops',
      icon: 'locate-outline',
      description: 'Find stops close to you',
      color: 'success',
    },
    {
      id: 'tickets',
      title: 'Buy Tickets',
      icon: 'card-outline',
      description: 'Purchase digital passes',
      color: 'warning',
    },
    {
      id: 'alerts',
      title: 'Service Alerts',
      icon: 'notifications-outline',
      description: 'Stay updated',
      color: 'danger',
    },
  ];

  recentRoutes = [
    {
      id: '1',
      from: 'Home',
      to: 'Office',
      duration: 35,
      transfers: 1,
      busNumber: '45',
    },
    {
      id: '2',
      from: 'Current Location',
      to: 'Central Mall',
      duration: 20,
      transfers: 0,
      busNumber: '12',
    },
  ];

  favoriteRoutes = [
    {
      id: 'fav1',
      busNumber: '45',
      from: 'Downtown Terminal',
      to: 'University Campus',
      nextBus: 7,
    },
    {
      id: 'fav2',
      busNumber: '12',
      from: 'Central Station',
      to: 'Airport',
      nextBus: 15,
    },
  ];

  nearbyStops = [
    {
      id: 'stop1',
      name: 'Main St & 5th Ave',
      distance: 250,
      buses: ['45', '12', '7'],
      nextBus: 5,
    },
    {
      id: 'stop2',
      name: 'Union Square',
      distance: 400,
      buses: ['23', '45'],
      nextBus: 12,
    },
  ];

  ngOnInit() {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    if (user) {
      this.userName = JSON.parse(user).name;
    }

    // Try to get current location
    this.getCurrentLocation();
  }

  getCurrentLocation() {
    // Simulated location
    // In real app, use Geolocation API
    setTimeout(() => {
      this.currentLocation = 'Main Street';
    }, 1000);
  }

  goToSearch() {
    this.navCtrl.navigateForward('/tabs/search');
  }

  handleAction(actionId: string) {
    switch (actionId) {
      case 'liveMap':
        this.navCtrl.navigateForward('/tabs/map'); // Assuming you added map tab
        break;
      case 'nearby':
        // Show nearby stops modal
        break;
      case 'tickets':
        // Navigate to tickets page
        break;
      case 'alerts':
        // Show alerts modal
        break;
    }
  }

  viewRoute(route: any) {
    // Navigate to route details
    this.router.navigate(['/bus-details', route.id]);
  }

  repeatSearch(route: any) {
    // Pre-fill search with this route
    this.router.navigate(['/tabs/search'], {
      state: { prefill: route },
    });
  }

  viewStop(stop: any) {
    // Navigate to stop details
    console.log('View stop:', stop);
  }

  viewAllRoutes() {
    // Navigate to saved routes page
    this.navCtrl.navigateForward('/saved-routes');
  }

  refresh() {
    // Refresh data
    console.log('Refreshing data...');
    // Simulate refresh
    setTimeout(() => {
      console.log('Data refreshed');
    }, 1000);
  }
}
