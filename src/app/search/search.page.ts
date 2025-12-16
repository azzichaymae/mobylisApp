import { Component, OnInit } from '@angular/core';
import { FirestoreService } from '../FirestoreService/firestore-service';
import { AuthService } from '../authService/auth-service';
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
  standalone:false
})
export class SearchPage implements OnInit {
  favoritedRoutes: Set<string> = new Set();
  isLoadingFavorites = false;
  fromLocation = '';
  toLocation = '';
  private userId: string | null = null;

  // Search results
  availableRoutes: BusRouteInfo[] = [];
  isSearching = false;
  searchPerformed = false;
  noRoutesFound = false;

  // All stops for autocomplete/dropdown
  allStops: BusStop[] = [];
  filteredFromStops: BusStop[] = [];
  filteredToStops: BusStop[] = [];

  constructor(
    private firestoreService: FirestoreService,
    private authService: AuthService,
     private router: Router,
  ) {}
  async ngOnInit() {
    await this.loadAllStops();
    

    // Subscribe once and store the userId
    this.authService.getCurrentUserId$().subscribe((userId) => {
      this.userId = userId;
    });
  }

  // ==========================================
  // LOAD ALL STOPS
  // ==========================================
  async loadAllStops(): Promise<void> {
    try {
      this.allStops = await this.firestoreService.getAllStops();
      console.log('Loaded stops:', this.allStops.length);

    } catch (error) {
      console.error('Error loading stops:', error);
    }
  }
  async addFav(route: BusRouteInfo) {
   const res =await this.firestoreService.addFavoriteRoute(this.userId!,route)
   if( res ){
    alert(res)
   }

}

  // ==========================================
  // FILTER STOPS FOR AUTOCOMPLETE
  // ==========================================
  filterFromStops(searchTerm: string): void {
    if (!searchTerm || searchTerm.trim() === '') {
      this.filteredFromStops = [];
      return;
    }

    this.filteredFromStops = this.allStops.filter((stop) =>
      stop.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  filterToStops(searchTerm: string): void {
    if (!searchTerm || searchTerm.trim() === '') {
      this.filteredToStops = [];
      return;
    }

    this.filteredToStops = this.allStops.filter((stop) =>
      stop.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // ==========================================
  // SELECT STOP FROM AUTOCOMPLETE
  // ==========================================
  selectFromStop(stop: BusStop): void {
    this.fromLocation = stop.name;
    this.filteredFromStops = [];
  }

  selectToStop(stop: BusStop): void {
    this.toLocation = stop.name;
    this.filteredToStops = [];
  }

  // ==========================================
  // MAIN SEARCH FUNCTION - UPDATED VERSION
  // ==========================================
  async searchRoutes(): Promise<void> {
    // Validation
    if (!this.fromLocation || !this.toLocation) {
      console.error('Please enter both origin and destination');
      // Show error message to user (use Ionic Toast or Alert)
      return;
    }

    if (this.fromLocation === this.toLocation) {
      console.error('Origin and destination cannot be the same');
      return;
    }

    try {
      this.isSearching = true;
      this.searchPerformed = false;
      this.noRoutesFound = false;
      this.availableRoutes = [];

      console.log(
        'Searching routes from:',
        this.fromLocation,
        'to:',
        this.toLocation
      );

      // Step 1: Find stops by name
      const originStop = this.allStops.find(
        (stop) => stop.name.toLowerCase() === this.fromLocation.toLowerCase()
      );
      const destinationStop = this.allStops.find(
        (stop) => stop.name.toLowerCase() === this.toLocation.toLowerCase()
      );

      if (!originStop || !destinationStop) {
        console.error('One or both stops not found');
        this.noRoutesFound = true;
        this.isSearching = false;
        return;
      }

      // Step 2: Find routes between these stops
      const buses = await this.firestoreService.findRoutes(
        originStop.id,
        destinationStop.id
      );

      if (buses.length === 0) {
        console.log('No routes found');
        this.noRoutesFound = true;
        this.isSearching = false;
        this.searchPerformed = true;
        return;
      }

      // Step 3: Build route information with stops
      this.availableRoutes = await this.buildRouteInfo(
        buses,
        originStop.id,
        destinationStop.id
      );

      // Step 4: Save to recent searches (if user is logged in)
      const userId = this.authService.getCurrentUserId$();
      if (this.userId) {
        await this.firestoreService.addRecentSearch(this.userId, {
          originStopId: originStop.id,
          originStopName: originStop.name,
          destinationStopId: destinationStop.id,
          destinationStopName: destinationStop.name,
        });
        console.log('Search saved to history');
      }

      console.log('Found routes:', this.availableRoutes);
      this.searchPerformed = true;
    } catch (error) {
      console.error('Error searching routes:', error);
      this.noRoutesFound = true;
    } finally {
      this.isSearching = false;
    }
  }

  // ==========================================
  // BUILD ROUTE INFORMATION
  // ==========================================
  private async buildRouteInfo(
    buses: Bus[],
    originStopId: string,
    destinationStopId: string
  ): Promise<BusRouteInfo[]> {
    const routeInfoPromises = buses.map(async (bus) => {
      // Get the segment of stops between origin and destination
      const originIndex = bus.stops.indexOf(originStopId);
      const destinationIndex = bus.stops.indexOf(destinationStopId);

      // Extract stops in this route segment
      const routeStopIds = bus.stops.slice(originIndex, destinationIndex + 1);

      // Fetch stop details
      const stopDetailsPromises = routeStopIds.map((stopId) =>
        this.firestoreService.getStopById(stopId),

      );
      const stopDetails = await Promise.all(stopDetailsPromises);

      // Build stop info with highlight
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

  // ==========================================
  // TOGGLE ROUTE EXPANSION
  // ==========================================
  toggleRoute(route: BusRouteInfo): void {
    route.isExpanded = !route.isExpanded;
  }

  // ==========================================
  // CLEAR SEARCH
  // ==========================================
  clearSearch(): void {
    this.fromLocation = '';
    this.toLocation = '';
    this.availableRoutes = [];
    this.searchPerformed = false;
    this.noRoutesFound = false;
    this.filteredFromStops = [];
    this.filteredToStops = [];
  }


  async saveFavorite(route: any) {
  const userId = this.authService.getCurrentUserId$();
  
  if (!userId) {
    // Show login prompt
    alert('Please login to save favorites');
    this.router.navigate(['/login']);
    return;
  }
  
  // User is logged in, proceed
  // await this.firestoreService.addFavoriteRoute(userId, route);
}
  // ==========================================
  // SWAP ORIGIN AND DESTINATION
  // ==========================================
  swapLocations(): void {
    const temp = this.fromLocation;
    this.fromLocation = this.toLocation;
    this.toLocation = temp;
  }

  // ==========================================
  // GO BACK
  // ==========================================
  goBack(): void {
    // Implement navigation back
   this.router.navigateByUrl("/tabs/home")
  }
}
