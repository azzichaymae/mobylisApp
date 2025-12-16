import { Injectable } from '@angular/core';
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
  orderBy,
  limit,
  Timestamp,
  CollectionReference,
  DocumentData,
  collectionData,
} from '@angular/fire/firestore';

import { Observable, from, map, of, tap } from 'rxjs';
import {
  User,
  FavoriteRoute,
  RecentSearch,
  Bus,
  BusStop,
  Route,
  CreateFavoriteRouteDTO,
  CreateRecentSearchDTO,
  UpdateUserDTO,
  BusRouteInfo,
} from './interfaces';
import { AngularFirestore } from '@angular/fire/compat/firestore';


@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  constructor(private firestore: Firestore,private Nativefirestore: AngularFirestore,) {}

  // ==========================================
  // USER OPERATIONS
  // ==========================================

  // Create user profile
  async createUserProfile(
    userId: string,
    userData: Partial<User>
  ): Promise<void> {
    const userRef = doc(this.firestore, `users/${userId}`);
    await setDoc(userRef, {
      ...userData,
      uid: userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  }

  // Get user profile
  async getUserProfile(userId: string): Promise<User | null> {
    const userRef = doc(this.firestore, `users/${userId}`);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data() as User;
    }
    return null;
  }

  // Update user profile
  async updateUserProfile(
    userId: string,
    userData: UpdateUserDTO
  ): Promise<void> {
    const userRef = doc(this.firestore, `users/${userId}`);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: Timestamp.now(),
    });
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

      // Query only active buses
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
      console.log(
        `Finding routes from ${originStopId} to ${destinationStopId}`
      );

      // Step 1: Get all active buses
      const buses = await this.getAllBuses();

      // Step 2: Filter buses that contain both stops in correct order
      const validBuses = buses.filter((bus) => {
        // Find indices of origin and destination in the bus stops array
        const originIndex = bus.stops.indexOf(originStopId);
        const destinationIndex = bus.stops.indexOf(destinationStopId);

        // Valid if:
        // 1. Both stops exist in the route (index !== -1)
        // 2. Destination comes AFTER origin (destinationIndex > originIndex)
        const isValid =
          originIndex !== -1 &&
          destinationIndex !== -1 &&
          destinationIndex > originIndex;

        if (isValid) {
          console.log(`✅ Bus ${bus.busNumber} serves this route`);
        }

        return isValid;
      });

      console.log(`Found ${validBuses.length} valid routes`);
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
      console.log('Adding recent search for user:', userId);

      // Step 1: Reference to user's recentSearches subcollection
      // Path: users/{userId}/recentSearches
      const recentSearchesRef = collection(
        this.firestore,
        `users/${userId}/recentSearches`
      );

      // Step 2: Check if this exact search already exists
      const q = query(
        recentSearchesRef,
        where('originStopId', '==', searchData.originStopId),
        where('destinationStopId', '==', searchData.destinationStopId)
      );
      const existingSearches = await getDocs(q);

      // Step 3: Delete existing duplicate searches
      if (!existingSearches.empty) {
        console.log('Removing duplicate search');
        const deletePromises = existingSearches.docs.map((doc) =>
          deleteDoc(doc.ref)
        );
        await Promise.all(deletePromises);
      }

      // Step 4: Add new search with timestamp
      const docRef = await addDoc(recentSearchesRef, {
        userId: userId,
        originStopId: searchData.originStopId,
        originStopName: searchData.originStopName,
        destinationStopId: searchData.destinationStopId,
        destinationStopName: searchData.destinationStopName,
        searchedAt: Timestamp.now(),
      });

      console.log('Recent search added with ID:', docRef.id);

      // Step 5: Limit to last 10 searches
      // await this.limitRecentSearches(userId, 10);

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
  ): Promise<string> {
    try {
      console.log('Adding favorite route for user:', userId);

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
      const busRoute = routeData.routeName

      const q = query(
        favoritesRef,
        where('originStopId', '==', originStopId),
        where('destinationStopId', '==', destinationStopId)
      );
      const existing = await getDocs(q);

      if (!existing.empty) {
        return "Route already favorited";
      }

      // Add new favorite
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

      console.log('Favorite route added with ID:', docRef.id);
      return "Favorite route added successfully";
    } catch (error) {
      console.error('Error adding favorite route:', error);
      throw error;
    }
  }

  async getFavoriteRoutes(userId: string) {
    try {
      const favoritesRef = collection(
        this.firestore,
        `users/${userId}/favoriteRoutes`
      );

      // Get all favorites ordered by creation date (newest first)
      const q = query(favoritesRef, orderBy('createdAt', 'desc'));

      const querySnapshot = await getDocs(q);

      const favorites: FavoriteRoute[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        userId: doc.data()['userId'],
        originStopId: doc.data()['originStopId'],
        originStopName: doc.data()['originStopName'],
        destinationStopId: doc.data()['destinationStopId'],
        destinationStopName: doc.data()['destinationStopName'],
        buses: doc.data()['buses'],
        busRoute: doc.data()['busRoute'],
        isFavorite: doc.data()['isFavorite'],
        createdAt: doc.data()['createdAt']?.toDate() || new Date(),
      }));

      console.log(`Loaded ${favorites.length} favorite routes`);
      return favorites;
    } catch (error) {
      console.error('Error getting favorite routes:', error);
      throw error;
    }
  }

 getFavs(userID: string){
  // const favRoutesRef = collection(this.firestore, `users/${userID}/favoriteRoutes`);
  // return (
  //   collectionData(favRoutesRef, { idField: 'id' }) as Observable<FavoriteRoute[]>).pipe(
  //   tap(data => console.log('Favorites:', data))
  // );
  return this.Nativefirestore.collection(`users/${userID}/favoriteRoutes`).valueChanges({ idField: 'id' });
}
 deleteRoute(userID: string, routeID: string): Promise<void> {
    const routeDocRef = doc(this.firestore, `users/${userID}/favoriteRoutes/${routeID}`);
    return deleteDoc(routeDocRef);
  }
  async removeFavoriteRoute(userId: string, routeId: string): Promise<void> {
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

  async isRouteFavorite(
    userId: string,
    originStopId: string,
    destinationStopId: string
  ): Promise<boolean> {
    try {
      const favoritesRef = collection(
        this.firestore,
        `users/${userId}/favoriteRoutes`
      );

      const q = query(
        favoritesRef,
        where('originStopId', '==', originStopId),
        where('destinationStopId', '==', destinationStopId)
      );

      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking if route is favorite:', error);
      return false;
    }
  }
}
