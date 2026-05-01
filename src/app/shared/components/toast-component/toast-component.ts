// toast.component.ts
import { Component, inject } from '@angular/core';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCheckCircle, faExclamationCircle, faInfoCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-toast',
  standalone: true,
  templateUrl: './toast-component.html',
  styleUrl: './toast-component.scss',
  imports: [CommonModule, FaIconComponent],
})
export class ToastComponent {
  snackBarRef = inject(MatSnackBarRef);
  data = inject(MAT_SNACK_BAR_DATA);

  faCheckCircle = faCheckCircle;
  faExclamationCircle = faExclamationCircle;
  faInfoCircle = faInfoCircle;
  faExclamationTriangle = faExclamationTriangle;

  getIcon() {
    switch (this.data.type) {
      case 'success': return this.faCheckCircle;
      case 'error': return this.faExclamationCircle;
      case 'warning': return this.faExclamationTriangle;
      default: return this.faInfoCircle;
    }
  }
}