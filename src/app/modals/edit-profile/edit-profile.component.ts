import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalController, IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class EditProfileModalComponent implements OnInit {
  focusedField = '';
  formSubmitted = false;
  @Input() profileData: any;

  constructor(private modalController: ModalController) {}
  ngOnInit() {
    this.splitFullName(this.profileData.fullName);
  }
  closeModal() {
    this.modalController.dismiss(null, 'cancel');
  }

  saveProfile() {
    if (
      !this.profileData.firstName ||
      !this.profileData.lastName ||
      !this.profileData.email
    ) {
      console.log('Please fill all required fields');
      return;
    }

   const fullName = `${this.profileData.firstName.trim()} ${this.profileData.lastName.trim()}`;
  
  const updatedData = {
    fullName: fullName,
    email: this.profileData.email,
    phone: this.profileData.phone,
    address: this.profileData.address
  };
    this.modalController.dismiss(updatedData, 'save');
  }
  splitFullName(fullName: string) {
    if (!fullName) return;

    const nameParts = fullName.trim().split(' ');

    if (nameParts.length === 1) {
      this.profileData.firstName = nameParts[0];
      this.profileData.lastName = '';
    } else if (nameParts.length === 2) {
      this.profileData.firstName = nameParts[0];
      this.profileData.lastName = nameParts[1];
    } else {
      this.profileData.firstName = nameParts[0];
      this.profileData.lastName = nameParts.slice(1).join(' ');
    }
  }
  onFieldFocus(fieldName: string) {
    this.focusedField = fieldName;
  }

  onFieldBlur() {
    this.focusedField = '';
  }

  hasError(
    fieldName: string,
    fieldValue: string,
    required: boolean = false
  ): boolean {
    if (!this.formSubmitted) return false;

    if (required && !fieldValue) return true;

    if (fieldName === 'email' && fieldValue) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return !emailRegex.test(fieldValue);
    }

    return false;
  }

  getErrorMessage(fieldName: string, fieldValue: string): string {
    if (!fieldValue) {
      switch (fieldName) {
        case 'firstName':
          return 'Le prénom est requis';
        case 'lastName':
          return 'Le nom est requis';
        case 'email':
          return "L'email est requis";
        default:
          return 'Ce champ est requis';
      }
    }

    if (fieldName === 'email') {
      return 'Veuillez entrer une adresse email valide';
    }

    return '';
  }
}
