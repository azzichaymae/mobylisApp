import { Component, OnInit } from '@angular/core';
import { FirestoreService } from '../FirestoreService/firestore-service';
import { AuthService } from '../authService/auth-service';
import { SelectStopComponent } from '../modals/select-stop/select-stop.component';
import { ModalController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import {
  Bus,
  BusStop,
  BusRouteInfo,
  BusStopInfo,
} from '../FirestoreService/interfaces';
import { Router } from '@angular/router';

@Component({
  selector: 'app-plan-route',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: false,
})
export class SearchPage implements OnInit {
  favoritedRoutes: Set<string> = new Set();
  isLoadingFavorites = false;
  fromLocation = '';
  toLocation = '';
  private userId: string | null = null;

  availableRoutes: BusRouteInfo[] = [];
  isSearching = false;
  searchPerformed = false;
  noRoutesFound = false;

  allStops: BusStop[] = [];
  filteredFromStops: BusStop[] = [];
  filteredToStops: BusStop[] = [];

  constructor(
    private firestoreService: FirestoreService,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController,
    private modalController: ModalController
  ) {}
  async ngOnInit() {
    await this.loadAllStops();
    this.authService.getCurrentUserId$().subscribe((userId) => {
      this.userId = userId;
    });
  }
  async loadAllStops(): Promise<void> {
    try {
      this.allStops = await this.firestoreService.getAllStops();
    } catch (error) {
      console.error('Error loading stops:', error);
    }
  }
  async addFav(route: BusRouteInfo) {
    if (!this.userId) {
      const toast = await this.toastController.create({
        message: 'You must be logged in to add favorites',
        icon: 'alert-circle',
        duration: 2500,
        position: 'top',
      });
      await toast.present();
      return;
    }
    const res = await this.firestoreService.addFavoriteRoute(
      this.userId!,
      route
    );
    
      const toast = await this.toastController.create({
          message: res ? 'Route added to favorites' : 'Route is already in favorites',
          icon:  res ? 'heart' : 'alert-circle',
          duration: 2500,
          position: 'bottom',
          
        });
        await toast.present();
    
  }

  async openStopSelector(type: 'from' | 'to') {
    const modal = await this.modalController.create({
      component: SelectStopComponent,
      componentProps: {
        title: type === 'from' ? 'Select Starting Point' : 'Select Destination',
        selectedStop: type === 'from' ? this.fromLocation : this.toLocation,
      },
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'select' && data) {
      if (type === 'from') {
        this.fromLocation = data.name;
      } else {
        this.toLocation = data.name;
      }
    }
  }

  async searchRoutes(): Promise<void> {
    if (!this.fromLocation || !this.toLocation) {
      this.firestoreService.showToast('Please enter both origin and destination', 'medium');
      return;
    }
    if (this.fromLocation === this.toLocation) {
      this.firestoreService.showToast('Origin and destination cannot be the same', 'medium');
      return;
    }

    try {
      this.isSearching = true;
      this.searchPerformed = false;
      this.noRoutesFound = false;
      this.availableRoutes = [];

      const originStop = this.allStops.find(
        (stop) => stop.name.toLowerCase() === this.fromLocation.toLowerCase()
      );
      const destinationStop = this.allStops.find(
        (stop) => stop.name.toLowerCase() === this.toLocation.toLowerCase()
      );

      if (!originStop || !destinationStop) {
        this.firestoreService.showToast('One or both stops not found', 'medium');
        this.noRoutesFound = true;
        this.isSearching = false;
        return;
      }

      const buses = await this.firestoreService.findRoutes(
        originStop.id,
        destinationStop.id
      );

      if (buses.length === 0) {
        this.firestoreService.showToast('No routes found', 'medium');
        this.noRoutesFound = true;
        this.isSearching = false;
        this.searchPerformed = true;
        return;
      }
      this.availableRoutes = await this.buildRouteInfo(
        buses,
        originStop.id,
        destinationStop.id
      );

      const userId = this.authService.getCurrentUserId$();
      if (this.userId) {
        await this.firestoreService.addRecentSearch(this.userId, {
          originStopId: originStop.id,
          originStopName: originStop.name,
          destinationStopId: destinationStop.id,
          destinationStopName: destinationStop.name,
        });
      }

      this.searchPerformed = true;
    } catch (error) {
      console.error('Error searching routes:', error);
      this.noRoutesFound = true;
    } finally {
      this.isSearching = false;
    }
  }

  private async buildRouteInfo(
    buses: Bus[],
    originStopId: string,
    destinationStopId: string
  ): Promise<BusRouteInfo[]> {
    const routeInfoPromises = buses.map(async (bus) => {
      const originIndex = bus.stops.indexOf(originStopId);
      const destinationIndex = bus.stops.indexOf(destinationStopId);

      const routeStopIds = bus.stops.slice(originIndex, destinationIndex + 1);

      const stopDetailsPromises = routeStopIds.map((stopId) =>
        this.firestoreService.getStopById(stopId)
      );
      const stopDetails = await Promise.all(stopDetailsPromises);

      const stopsInfo: BusStopInfo[] = stopDetails
        .filter((stop) => stop !== null)
        .map((stop, index) => ({
          stopId: stop!.id,
          name: stop!.name,
          isHighlighted: index === 0 || index === stopDetails.length - 1,
        }));

      return {
        busId: bus.id,
        busNumber: bus.busNumber,
        routeName: bus.routeName,
        stops: stopsInfo,
      };
    });

    return await Promise.all(routeInfoPromises);
  }

  toggleRoute(route: BusRouteInfo): void {
    route.isExpanded = !route.isExpanded;
  }

  clearSearch(): void {
    this.fromLocation = '';
    this.toLocation = '';
    this.availableRoutes = [];
    this.searchPerformed = false;
    this.noRoutesFound = false;
    this.filteredFromStops = [];
    this.filteredToStops = [];
  }

  goBack(): void {
    this.router.navigateByUrl('/tabs/home');
  }
}
