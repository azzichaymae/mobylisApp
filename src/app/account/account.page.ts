import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
  standalone: false,
})
export class AccountPage  {

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

  constructor(private navCtrl: NavController) {}

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

  login(): void {
    if (this.validateLoginForm()) {
      console.log('Logging in:', {
        email: this.loginEmail,
        password: this.loginPassword
      });
      // Implement login logic
    }
  }

  register(): void {
    if (this.validateRegisterForm()) {
      console.log('Creating account:', {
        fullName: this.fullName,
        email: this.registerEmail,
        password: this.registerPassword
      });
      // Implement registration logic
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
    if (!this.fullName || !this.registerEmail || !this.registerPassword || !this.confirmPassword) {
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
