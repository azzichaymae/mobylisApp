import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

interface BusStop {
  id: string;
  name: string;
  area: string;
  lines: string[];
}

@Component({
  selector: 'app-stop-selector',
  templateUrl: './stop-selector.page.html',
  styleUrls: ['./stop-selector.page.scss'],
  standalone: false
})
export class StopSelectorPage {
  searchQuery = '';
  allStops: BusStop[] = [
    { id: '1', name: 'Central Station', area: 'Downtown', lines: ['42', '8', '15'] },
    { id: '2', name: 'University Campus', area: 'Westside', lines: ['22', '35'] },
    { id: '3', name: 'City Hospital', area: 'North', lines: ['8', '17'] },
    { id: '4', name: 'Shopping Mall', area: 'East', lines: ['42', '60'] },
    { id: '5', name: 'Airport Terminal', area: 'South', lines: ['100', '200'] },
    { id: '6', name: 'Main Square', area: 'Downtown', lines: ['1', '2', '8', '42'] },
    // Add 50+ more real stops here...
  ];

  filteredStops: BusStop[] = [...this.allStops];

  constructor(private modalCtrl: ModalController) {}

  filterStops() {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredStops = [...this.allStops];
      return;
    }

    this.filteredStops = this.allStops.filter(stop =>
      stop.name.toLowerCase().includes(query) ||
      stop.area.toLowerCase().includes(query) ||
      stop.lines.some(line => line.includes(query))
    );
  }

  selectStop(stop: BusStop) {
    this.modalCtrl.dismiss({
      stopName: stop.name,
      stopId: stop.id
    });
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}