import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from '../authService/auth-service';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
  standalone: false,
})
export class AccountPage {
  selectedMode: 'login' | 'register' = 'login';

  // Login fields
  loginEmail = '';
  loginPassword = '';
  showLoginPassword = false;

  // Register fields
  fullName = '';
  registerEmail = '';
  registerPassword = '';
  confirmPassword = '';
  showRegisterPassword = false;
  showConfirmPassword = false;

  constructor(
    private navCtrl: NavController,
    private auth: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {}

  selectMode(mode: 'login' | 'register'): void {
    this.selectedMode = mode;
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
    if (this.validateLoginForm()) {
      const success = await this.auth.login(
        this.loginEmail,
        this.loginPassword
      );
      if (success) {
        this.router.navigate(['/tabs/home']);
      } else {
        alert('Login Failed. Please check your username and password.');
      }
    }
  }

  async submitRegister() {
    if (this.validateRegisterForm()) {
      const success = await this.auth.register(
        this.registerEmail,
        this.registerPassword,
        this.fullName
      );

      if (success) {
        const toast = await this.toastController.create({
          message: 'Registration Successful! You can now log in.',
          duration: 2500,
          position: 'top',
        });
        await toast.present();
        this.loginEmail = this.registerEmail;
        this.registerEmail = '';
        this.registerPassword = '';
        this.confirmPassword = '';
        this.fullName = '';
        this.selectMode('login')
      } else {
        alert(
          'Registration Failed. E-mail may already exist or passwords do not match.'
        );
      }
    }
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
      console.error('All fields are required');
      return false;
    }

    if (this.registerPassword !== this.confirmPassword) {
      console.error('Passwords do not match');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.registerEmail)) {
      console.error('Invalid email format');
      return false;
    }

    return true;
  }

  forgotPassword(): void {
    console.log('Navigate to forgot password');
    // Navigate to forgot password page
  }

  loginWithGoogle(): void {
    console.log('Login with Google');
    // Implement Google authentication
  }

  loginWithApple(): void {
    console.log('Login with Apple');
    // Implement Apple authentication
  }

  goBack(): void {
    this.navCtrl.navigateForward('/tabs/home');
  }
}
