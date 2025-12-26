import { Component } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { FirestoreService } from '../FirestoreService/firestore-service';
import { FavoriteRoute, SearchResult } from '../FirestoreService/interfaces';
import { Observable, of, switchMap, tap } from 'rxjs';
import { AuthService } from '../authService/auth-service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'favourite.page.html',
  styleUrls: ['favourite.page.scss'],
  standalone: false,
})
export class FavouritePage {
  listeFavs!: Observable<FavoriteRoute[]>;
  searchHistory!: Observable<SearchResult[]>;
  userId: string = '';
  selectedTab: 'favorites' | 'recent' = 'favorites';
  isLoggedIn: boolean = false;
  isLoading = true;
  constructor(
    private navCtrl: NavController,
    private firestore: FirestoreService,
    private authService: AuthService,
    private alertCtrl: AlertController
  ) {}
  async ngOnInit() {
    console.log(this.isLoggedIn);
    this.authService.getCurrentUserId$().subscribe((userId) => {
      this.userId = userId!;
      this.isLoggedIn = true;
    });
    this.listeFavs = this.authService.getCurrentUserId$().pipe(
      switchMap((userId) => {
        if (!userId) {
          this.isLoading = false;
          this.isLoggedIn = false;
          return of([]);
        }
        this.isLoggedIn = true;
        return this.firestore.getFavs(userId);
      }),
      tap(() => (this.isLoading = false))
    );

    this.searchHistory = this.authService.getCurrentUserId$().pipe(
      switchMap((userId) => {
        if (!userId) {
          this.isLoading = false;
          return of([]);
        }
        return this.firestore.getRecentSearches(userId);
      }),
      tap(() => (this.isLoading = false))
    );
  }

  selectTab(tab: 'favorites' | 'recent'): void {
    this.selectedTab = tab;
  }

  async deleteFav(id: string) {
    const alert = await this.alertCtrl.create({
      header: 'Are you sure?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          handler: async () => {
            await this.firestore.removeFavorite(this.userId, id);
          },
        },
      ],
    });
    await alert.present();
  }

  goBack(): void {
    this.navCtrl.navigateForward('/tabs/home');
  }
  formattedDate(date: Date): string {
    return this.firestore.formatDate(date);
  }

  async deleteSearch(id: string) {
    const alert = await this.alertCtrl.create({
      header: 'Are you sure?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          handler: async () => {
            await this.firestore.removeSearch(this.userId, id);
          },
        },
      ],
    });
    await alert.present();
  }
}
