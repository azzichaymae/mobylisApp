import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  onSnapshot,
} from '@angular/fire/firestore';

import { Observable } from 'rxjs';
import {
  User,
  FavoriteRoute,
  Bus,
  BusStop,
  CreateRecentSearchDTO,
  UpdateUserDTO,
  BusRouteInfo,
  SearchResult,
} from './interfaces';
import { LoadingController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  private firestore = inject(Firestore);
  private loadingController = inject(LoadingController);
  private toastController = inject(ToastController);


 async createUserProfile(uid: string, userData: User): Promise<void> {
    try {
      const userRef = doc(this.firestore, `users/${uid}`);
      await setDoc(userRef, userData);
    } catch (error) {
      console.error( error);
      throw error;
    }
  }

  getUserProfile(userId: string): Observable<User> {
    return new Observable<User>((observer) => {
      const userRef = doc(this.firestore, `users/${userId}`);
      const unsubscribe = onSnapshot(
        userRef,
        (docSnap) => {
          if (docSnap.exists()) {
            observer.next(docSnap.data() as User);
          }
        },
        (error) => observer.error(error)
      );

      return () => unsubscribe();
    });
  }

async getUserProfileOnce(uid: string): Promise<User | null> {
    try {
      const userRef = doc(this.firestore, `users/${uid}`);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return userSnap.data() as User;
      } else {
        return null;
      }
    } catch (error) {
      console.error( error);
      throw error;
    }
  }

  async updateUserProfile(
    userId: string,
    userData: UpdateUserDTO
  ): Promise<void> {
    const loading = await this.loadingController.create({
      message: 'Updating profile...',
      spinner: 'crescent',
    });
    await loading.present();
    try {
      const userRef = doc(this.firestore, `users/${userId}`);
      await updateDoc(userRef, {
        ...userData,
        updatedAt: Timestamp.now(),
      });
      await loading.dismiss();
    } catch (error) {
      await loading.dismiss();
      await this.showToast('Error while updating profile', 'danger');
    }
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'top',
    });
    await toast.present();
  }

  async getAllStops(): Promise<BusStop[]> {
    const stopsCollection = collection(this.firestore, 'stops');
    const querySnapshot = await getDocs(stopsCollection);

    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          name: doc.data()['name'],
        } as BusStop)
    );
  }

  async getAllBuses(): Promise<Bus[]> {
    try {
      const busesCollection = collection(this.firestore, 'buses');

      const q = query(busesCollection, where('isActive', '==', true));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log('No buses found in database');
        return [];
      }

      const buses: Bus[] = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            busNumber: doc.data()['busNumber'],
            routeName: doc.data()['routeName'],
            stops: doc.data()['stops'],
            departureSchedule: doc.data()['departureSchedule'],
            averageDuration: doc.data()['averageDuration'],
            isActive: doc.data()['isActive'],
            createdAt: doc.data()['createdAt']?.toDate() || new Date(),
            updatedAt: doc.data()['updatedAt']?.toDate() || new Date(),
          } as Bus)
      );

      console.log(`Loaded ${buses.length} buses from Firestore`);
      return buses;
    } catch (error) {
      console.error('Error fetching buses:', error);
      throw error;
    }
  }

  async findRoutes(
    originStopId: string,
    destinationStopId: string
  ): Promise<Bus[]> {
    try {
      const buses = await this.getAllBuses();

      const validBuses = buses.filter((bus) => {
        const originIndex = bus.stops.indexOf(originStopId);
        const destinationIndex = bus.stops.indexOf(destinationStopId);

        const bothStopsExist = originIndex !== -1 && destinationIndex !== -1;
        const differentStops = originIndex !== destinationIndex;

        const isValid = bothStopsExist && differentStops;

        if (isValid) {
          const direction =
            destinationIndex > originIndex ? 'forward' : 'backward';
        }

        return isValid;
      });

      console.log(`Found ${validBuses.length} valid route(s)`);
      return validBuses;
    } catch (error) {
      console.error('Error finding routes:', error);
      throw error;
    }
  }

  async addRecentSearch(
    userId: string,
    searchData: CreateRecentSearchDTO
  ): Promise<string> {
    try {

      const recentSearchesRef = collection(
        this.firestore,
        `users/${userId}/recentSearches`
      );

      const q = query(
        recentSearchesRef,
        where('originStopId', '==', searchData.originStopId),
        where('destinationStopId', '==', searchData.destinationStopId)
      );
      const existingSearches = await getDocs(q);

      if (!existingSearches.empty) {
        const deletePromises = existingSearches.docs.map((doc) =>
          deleteDoc(doc.ref)
        );
        await Promise.all(deletePromises);
      }

      const docRef = await addDoc(recentSearchesRef, {
        userId: userId,
        originStopId: searchData.originStopId,
        originStopName: searchData.originStopName,
        destinationStopId: searchData.destinationStopId,
        destinationStopName: searchData.destinationStopName,
        searchedAt: Timestamp.now(),
      });



      return docRef.id;
    } catch (error) {
      console.error('Error adding recent search:', error);
      throw error;
    }
  }

  async getStopById(id: string): Promise<BusStop | null> {
    const stopRef = doc(this.firestore, 'stops', id);
    const res = await getDoc(stopRef);

    if (res.exists()) {
      return {
        id: res.id,
        ...(res.data() as Omit<BusStop, 'id'>),
      };
    }

    return null;
  }

  async addFavoriteRoute(
    userId: string,
    routeData: BusRouteInfo
  ): Promise<boolean> {
    try {
      const favoritesRef = collection(
        this.firestore,
        `users/${userId}/favoriteRoutes`
      );

      const busNumber = routeData.busNumber;

      const destinationStop = routeData.stops[routeData.stops.length - 1];
      const originStop = routeData.stops[0];
      const destinationStopId = destinationStop.stopId;
      const destinationStopName = destinationStop.name;
      const originStopId = originStop.stopId;
      const originStopName = originStop.name;
      const busRoute = routeData.routeName;

      const q = query(
        favoritesRef,
        where('originStopId', '==', originStopId),
        where('destinationStopId', '==', destinationStopId)
      );
      const existing = await getDocs(q);

      if (!existing.empty) {
        return false;
      }

      const docRef = await addDoc(favoritesRef, {
        userId: userId,
        originStopId: originStopId,
        originStopName: originStopName,
        destinationStopId: destinationStopId,
        destinationStopName: destinationStopName,
        buses: busNumber,
        busRoute: busRoute || '',
        isFavorite: true,
        createdAt: Timestamp.now(),
      });

      return true;
    } catch (error) {
      console.error('Error adding favorite route:', error);
      throw error;
    }
  }

  getFavs(userID: string): Observable<FavoriteRoute[]> {
    return new Observable<FavoriteRoute[]>((observer) => {
      const favsRef = collection(
        this.firestore,
        'users',
        userID,
        'favoriteRoutes'
      );

      const q = query(favsRef);

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const favs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<FavoriteRoute, 'id'>),
          }));
          observer.next(favs);
        },
        (error) => observer.error(error)
      );

      return () => unsubscribe();
    });
  }

  getRecentSearches(userId: string): Observable<SearchResult[]> {
    return new Observable<SearchResult[]>((observer) => {
      const recentSearchesRef = collection(
        this.firestore,
        'users',
        userId,
        'recentSearches'
      );
      const q = query(recentSearchesRef);

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const searches = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<SearchResult, 'id'>),
          }));
          observer.next(searches);
        },
        (error) => observer.error(error)
      );
      return () => unsubscribe();
    });
  }
  removeSearch(userId: string, searchId: string): Promise<void> {
    const searchRef = doc(
      this.firestore,
      `users/${userId}/recentSearches/${searchId}`
    );
    return deleteDoc(searchRef);
  }

  async removeFavorite(userId: string, routeId: string): Promise<void> {
    try {
      const routeRef = doc(
        this.firestore,
        `users/${userId}/favoriteRoutes/${routeId}`
      );

      await deleteDoc(routeRef);
      console.log('Favorite route deleted:', routeId);
    } catch (error) {
      console.error('Error removing favorite route:', error);
      throw error;
    }
  }

  formatDate(value: Date | Timestamp | null | undefined): string {
    if (!value) return '';

    let date: Date;

    if (value instanceof Timestamp) {
      date = value.toDate();
    } else {
      date = value;
    }

    return date.toLocaleDateString();
  }
}
