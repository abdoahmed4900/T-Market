import { inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { FirebaseError } from "../interfaces/firebase.error";
import { firebaseErrorMessages } from "../../shared/utils";
import { ToastService } from "../../shared/services/toast.service";


@Injectable({ providedIn: 'root' })
export class FirebaseErrorService {
  private toastService = inject(ToastService);
  private router = inject(Router);

  handleError(error: any): FirebaseError {
    // Extract Firebase error code
    const errorCode = error?.code || error?.originalError?.code || 'unknown';
    const defaultMessage = error?.message || 'An unexpected error occurred';
    const userMessage = firebaseErrorMessages[errorCode] || defaultMessage;

    // Handle specific auth errors with navigation
    if (errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password') {
      this.showError(userMessage);
    }
    else if (errorCode === 'auth/requires-recent-login') {
      this.showError('Please log in again to continue', 5000);
      setTimeout(() => this.router.navigate(['/login']), 2000);
    }
    else if (errorCode === 'permission-denied') {
      this.showError(userMessage);
      setTimeout(() => this.router.navigate(['/unauthorized']), 2000);
    }
    else if (errorCode === 'unauthenticated') {
      this.showError('Session expired. Please log in again.');
      setTimeout(() => this.router.navigate(['/login']), 2000);
    }
    else {
      this.showError(userMessage);
    }

    return { code: errorCode, message: defaultMessage, customMessage: userMessage };
  }

  showError(message: string, duration: number = 4000) {
    this.toastService.error(message, duration);
  }
}