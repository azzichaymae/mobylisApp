import { map, Observable, of, switchMap, take } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../authService/auth-service';
import { Auth, sendPasswordResetEmail } from '@angular/fire/auth';
import { ToastController, NavController } from '@ionic/angular';
import { FavoriteRoute, User } from '../FirestoreService/interfaces';
import { FirestoreService } from '../FirestoreService/firestore-service';
import { ModalController } from '@ionic/angular';
import { EditProfileModalComponent } from '../modals/edit-profile/edit-profile.component';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
  standalone: false,
})
export class AccountPage {
  selectedMode: 'login' | 'register' = 'login';
  user$!: Observable<User>;
  listeFavsLength$!: Observable<number>;
  userId: string | null = '';
  listeFavs!: Observable<FavoriteRoute[]>;
  loginSubmitted = false;
  registerSubmitted = false;
  isAuthLoading = true;
  isLoggedIn = false;
  constructor(
    private modalCtrl: ModalController,
    private auth: Auth,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private authService: AuthService,
    private firestoreService: FirestoreService,
    private navCtrl: NavController
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentUserId$().subscribe((userId) => {
      this.userId = userId ?? null;
      this.isLoggedIn = !!userId;
      this.isAuthLoading = false;

      if (this.userId) {
        this.user$ = this.firestoreService.getUserProfile(this.userId);
      }
    });

    this.listeFavsLength$ = this.authService.getCurrentUserId$().pipe(
      switchMap((userId) => {
        if (!userId) return of([]);
        return this.firestoreService.getFavs(userId);
      }),
      map((favs) => favs.length)
    );
  }

  getInitials(fullName: string): string {
    if (!fullName) return '';

    const words = fullName.trim().split(' ');

    // Take first letter of first two words
    const initials = words
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join('');

    return initials;
  }

  async submitLogout() {
    await this.authService.logout();
  }

  async openEditProfile(user: any) {
    const modal = await this.modalCtrl.create({
      component: EditProfileModalComponent,
      componentProps: {
        profileData: user,
      },
    });

    await modal.present();
    const { data, role } = await modal.onWillDismiss();

    if (role === 'save' && data) {
      await this.firestoreService.updateUserProfile(this.userId!, data);
    }
  }
  //Login Register section

  loginEmail = '';
  loginPassword = '';
  showLoginPassword = false;

  fullName = '';
  registerEmail = '';
  registerPassword = '';
  confirmPassword = '';
  showRegisterPassword = false;
  showConfirmPassword = false;

  selectMode(mode: 'login' | 'register'): void {
    this.selectedMode = mode;
    this.loginSubmitted = false;
    this.registerSubmitted = false;
    this.fullName = '';
    this.registerEmail = '';
    this.registerPassword = '';
    this.confirmPassword = '';
    this.loginEmail = '';
    this.loginPassword = '';
  }

  toggleLoginPasswordVisibility(): void {
    this.showLoginPassword = !this.showLoginPassword;
  }

  toggleRegisterPasswordVisibility(): void {
    this.showRegisterPassword = !this.showRegisterPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  async submitLogin(): Promise<void> {
    if (!this.validateLoginForm()) return;

    const loading = await this.loadingController.create({
      message: 'Logging in...',
      spinner: 'crescent',
    });

    await loading.present();

    try {
      await this.authService.login(this.loginEmail, this.loginPassword);
    } catch (error) {
      console.error(error);
    } finally {
      await loading.dismiss();
    }
  }

  async submitRegister(): Promise<void> {
    this.registerSubmitted = true;

    if (!this.validateRegisterForm()) return;
    const loading = await this.loadingController.create({
      message: 'Creating your account...',
      spinner: 'crescent',
    });

    await loading.present();

    try {
      const success = await this.authService.register(
        this.registerEmail,
        this.registerPassword,
        this.fullName
      );

      if (success) {
        const toast = await this.toastController.create({
          message: 'Registration successful! You can now log in.',
          icon: 'checkmark-circle-outline',

          duration: 2500,
          position: 'top',
        });
        await toast.present();

        // Reset form
        this.loginEmail = this.registerEmail;
        this.registerEmail = '';
        this.registerPassword = '';
        this.confirmPassword = '';
        this.fullName = '';

        this.selectMode('login');
      } 
    } catch (error) {
      console.error(error);

      const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.';
      const toast = await this.toastController.create({
        message: errorMessage,
        icon: 'close-circle-outline',
        color: 'danger',
        duration: 2500,
        position: 'top',
      });
      await toast.present();
    } finally {
      await loading.dismiss();
    }
  }
 goBack(): void {
    this.navCtrl.navigateForward('/tabs/home');
  }
  validateLoginForm(): boolean {
    if (!this.loginEmail || !this.loginPassword) {
      console.error('Email and password are required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.loginEmail)) {
      console.error('Invalid email format');
      return false;
    }
    return true;
  }

  validateRegisterForm(): boolean {
    if (
      !this.fullName ||
      !this.registerEmail ||
      !this.registerPassword ||
      !this.confirmPassword
    ) {
      return false;
    }

    if (this.registerPassword !== this.confirmPassword) {
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.registerEmail)) {
      return false;
    }

    return true;
  }

  forgotPassword(email: string) {
    sendPasswordResetEmail(this.auth, email)
      .then(async () => {
        await this.showToast('Password reset email sent successfully.');
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(
          `Error sending reset email: ${errorCode} - ${errorMessage}`
        );
      });
  }

  async loginWithGoogle() {
    try {
      const userCredential = await this.authService.signInWithGoogle();
      console.log('Google sign-in successful:', userCredential!.user);

      await this.showToast('Welcome! Signed in successfully');
      this.isLoggedIn = true;
    } catch (error: any) {
      console.error('Google login error:', error);
      await this.showToast(error.message);
    }
  }
  async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,

      position: 'top',
    });
    await toast.present();
  }
  

  formattedDate(date: Date): string {
    return this.firestoreService.formatDate(date);
  }
}
