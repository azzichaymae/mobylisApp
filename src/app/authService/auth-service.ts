import { Injectable, inject } from '@angular/core';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import {
  Auth,
  GoogleAuthProvider,
  getRedirectResult,
  signInWithPopup,
} from '@angular/fire/auth';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
  UserCredential,
  updateProfile,
  onAuthStateChanged,
  getAuth,
} from '@angular/fire/auth';
import { Observable, BehaviorSubject} from 'rxjs';
import { FirestoreService } from '../FirestoreService/firestore-service';
import { map } from 'rxjs/operators';
import { LoadingController } from '@ionic/angular';
import { User as AppUser } from '../FirestoreService/interfaces';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUser$ = new BehaviorSubject<FirebaseUser | null>(null);

  private auth = inject(Auth);
  private googleProvider: GoogleAuthProvider;
  loadingController: LoadingController = inject(LoadingController);

  constructor(private firestoreService: FirestoreService) {
    this.initAuthListener();
    this.googleProvider = new GoogleAuthProvider();
  }

  async login(email: string, password: string): Promise<boolean> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  async logout(): Promise<boolean> {
    const auth = getAuth();
    try {
      const res = await signOut(auth);
      console.log('User logged out');
      return true;
    } catch (error: any) {
      console.error('logout error:', error);
      return false;
    }
  }
  async register(
    email: string,
    password: string,
    fullName: string
  ): Promise<UserCredential> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: fullName,
        });

        await this.firestoreService.createUserProfile(userCredential.user.uid, {
          uid: userCredential.user.uid,
          email: email,
          fullName: fullName,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

      }

      return userCredential;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw this.handleAuthError(error);
    }
  }

  private handleAuthError(error: any): Error {
    let message = 'An error occurred';

    switch (error.code) {
      case 'auth/email-already-in-use':
        message = 'This email is already registered';
        break;
      case 'auth/invalid-email':
        message = 'Invalid email address';
        break;
      case 'auth/weak-password':
        message = 'Password should be at least 6 characters';
        break;
      case 'auth/user-not-found':
        message = 'No user found with this email';
        break;
      case 'auth/wrong-password':
        message = 'Incorrect password';
        break;
      case 'auth/too-many-requests':
        message = 'Too many attempts. Please try again later';
        break;
      case 'auth/network-request-failed':
        message = 'Network error. Please check your connection';
        break;
      default:
        message = error.message || 'Authentication failed';
    }

    return new Error(message);
  }

  private initAuthListener(): void {
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser$.next(user);
      if (user) {
        console.log('User logged in:', user.uid);
      } else {
        console.log('User logged out');
      }
    });
  }

  getCurrentUserId$(): Observable<string | null> {
    return this.currentUser$.pipe(map((user) => user?.uid || null));
  }
  getCurrentUser(): FirebaseUser | null {
    return this.auth.currentUser;
  }



 
private initializeAuthListener() {
  App.addListener('appUrlOpen', async (data) => {
    
    try {
      await Browser.close();
    } catch (e) {
      console.log('Browser already closed or not open');
    }
    
    setTimeout(async () => {
      await this.handleRedirectResult();
    }, 500);
  });

  App.addListener('resume', async () => {
    
    try {
      await Browser.close();
    } catch (e) {
      console.log('Browser already closed');
    }
    
    setTimeout(async () => {
      await this.handleRedirectResult();
    }, 500);
  });

  setTimeout(() => {
    this.handleRedirectResult();
  }, 1000);
}

async handleRedirectResult(): Promise<void> {
  try {
    const result = await getRedirectResult(this.auth);
    
    if (result) {
            try {
        await Browser.close();
      } catch (e) {
      }
      
      const isNewUser = await this.isNewUser(result.user.uid);
      
      if (isNewUser) {
        await this.createUserProfileInFirestore(
          result.user,
          result.user.displayName || 'Google User'
        );
      }
      
      window.dispatchEvent(new CustomEvent('google-auth-success', { 
        detail: result 
      }));
      
      return;
    }
    
    console.log('No redirect result found');
  } catch (error: any) {
    console.error(' Redirect result error:', error);
    
    try {
      await Browser.close();
    } catch (e) {
    }
    
    window.dispatchEvent(new CustomEvent('google-auth-error', { 
      detail: error 
    }));
  }}  
  
  async signInWithGoogle(): Promise<UserCredential> {
    try {
      const userCredential = await signInWithPopup(this.auth, this.googleProvider);
      console.log('User UID:', userCredential.user.uid);
      console.log('User Email:', userCredential.user.email);
      
      const isNewUser = await this.isNewUser(userCredential.user.uid);
      console.log('Is new user?', isNewUser);
      
      if (isNewUser) {
        await this.createUserProfileInFirestore(
          userCredential.user,
          userCredential.user.displayName || 'Google User'
        );
      } else {
        console.log('👤 Existing user logged in with Google');
      }

      return userCredential;
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      throw this.handleAuthError(error);
    }
  }

  private async createUserProfileInFirestore(
    firebaseUser: FirebaseUser,
    fullName: string
  ): Promise<void> {
    try {
      const userProfile: AppUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        fullName: fullName,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      
      await this.firestoreService.createUserProfile(firebaseUser.uid, userProfile);
      
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  private async isNewUser(uid: string): Promise<boolean> {
    try {
      const userProfile = await this.firestoreService.getUserProfileOnce(uid);
      return !userProfile; 
    } catch (error) {
      console.error( error);
      return true; 
    }
  }

}
