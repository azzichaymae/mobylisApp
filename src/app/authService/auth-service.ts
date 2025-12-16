import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
  UserCredential,
  updateProfile,
  onAuthStateChanged,
} from '@angular/fire/auth';
import { Observable, BehaviorSubject } from 'rxjs';
import { FirestoreService } from '../FirestoreService/firestore-service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUser$ = new BehaviorSubject<FirebaseUser | null>(null);

  constructor(
    private auth: Auth,  // ✅ Inject Auth here
    private firestoreService: FirestoreService
  ) {
    this.initAuthListener();
  }

  async login(email: string, password: string): Promise<boolean> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      console.log('User logged in:', userCredential.user.email);
      return true;
    } catch (error) {
      console.error('Login error:', error);
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

        console.log('User registered successfully in Auth and Firestore');
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
    return this.currentUser$.pipe(
      map(user => user?.uid || null)
    );
  }

  isAuthenticated$(): Observable<boolean> {
    return this.currentUser$.pipe(
      map(user => user !== null)
    );
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }
}