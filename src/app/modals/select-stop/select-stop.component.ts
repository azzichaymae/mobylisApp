// select-stop.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { FirestoreService } from '../../FirestoreService/firestore-service';
import { BusStop } from 'src/app/FirestoreService/interfaces';

@Component({
  selector: 'app-select-stop',
  templateUrl: './select-stop.component.html',
  styleUrls: ['./select-stop.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class SelectStopComponent implements OnInit {
  @Input() title: string = 'Select Stop';
  @Input() selectedStop: string = '';
  
  searchQuery: string = '';
  filteredStops: BusStop[] = [];
  allStops: BusStop[] = [];
  isLoading: boolean = true;

  private firestoreService = inject(FirestoreService);
  
  constructor(private modalController: ModalController) {}

  async ngOnInit() {
    await this.loadAllStops();
  }

  async loadAllStops(): Promise<void> {
    try {
      this.isLoading = true;
      this.allStops = await this.firestoreService.getAllStops();
      this.filteredStops = [...this.allStops]; // Set filteredStops AFTER data is loaded
    } catch (error) {
      console.error('Error loading stops:', error);
    } finally {
      this.isLoading = false;
    }
  }

  closeModal() {
    this.modalController.dismiss(null, 'cancel');
  }

  selectStop(stop: BusStop) {
    this.modalController.dismiss(stop, 'select');
  }

  onSearchChange(event: any) {
    const query = event.target.value.toLowerCase();
    
    if (!query.trim()) {
      this.filteredStops = [...this.allStops];
      return;
    }

    this.filteredStops = this.allStops.filter(stop => 
      stop.name.toLowerCase().includes(query)
    );
  }

  clearSearch() {
    this.searchQuery = '';
    this.filteredStops = [...this.allStops];
  }
}