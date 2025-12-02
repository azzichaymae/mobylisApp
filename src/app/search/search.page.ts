// search.page.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, ModalController } from '@ionic/angular';
import { StopSelectorPage } from '../stop-selector/stop-selector.page';

interface BusStop {
  name: string;
  isHighlighted: boolean;
}

interface BusRoute {
  id: string;
  busNumber: string;
  duration: number;
  stops: BusStop[];
  departures: string[];
  isExpanded: boolean;
}



@Component({
  selector: 'app-search',
  standalone: false,
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage  {
 fromLocation = 'test';
  toLocation = 'test';

  availableRoutes: BusRoute[] = [
    {
      id: '1',
      busNumber: '24',
      duration: 25,
      stops: [
        { name: 'Central Station', isHighlighted: true },
        { name: 'Avenue Principale', isHighlighted: false },
        { name: 'Place du Marché', isHighlighted: false },
        { name: 'Quartier Sud', isHighlighted: true }
      ],
      departures: ['08:30', '09:00', '09:30', '10:00'],
      isExpanded: true
    },
    {
      id: '2',
      busNumber: '12',
      duration: 32,
      stops: [
        { name: 'North Terminal', isHighlighted: true },
        { name: 'City Center', isHighlighted: false },
        { name: 'Shopping Mall', isHighlighted: false },
        { name: 'Beach Side', isHighlighted: true }
      ],
      departures: ['08:15', '08:45', '09:15', '09:45'],
      isExpanded: false
    },
    {
      id: '3',
      busNumber: '7',
      duration: 28,
      stops: [
        { name: 'Downtown Hub', isHighlighted: true },
        { name: 'University Ave', isHighlighted: false },
        { name: 'Park Square', isHighlighted: false },
        { name: 'East End', isHighlighted: true }
      ],
      departures: ['08:00', '08:30', '09:00', '09:30'],
      isExpanded: false
    }
  ];

  constructor(private navCtrl:NavController) {}

  searchRoutes(): void {
    console.log('Searching routes from:', this.fromLocation, 'to:', this.toLocation);
    // Implement search logic here
  }

  toggleRoute(route: BusRoute): void {
    route.isExpanded = !route.isExpanded;
  }

  goBack(): void {
    this.navCtrl.navigateForward('/tabs/home');
  }}