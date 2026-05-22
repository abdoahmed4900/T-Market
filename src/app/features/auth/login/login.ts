import { faCheckCircle, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { Loader } from '../../../shared/components/loader/loader';
import { Firestore } from '@angular/fire/firestore';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { AnimateOnScroll } from "../../../shared/animate-on-scroll";
import { ToastService } from '../../../shared/services/toast.service';
import { faEnvelope, faLock, faExclamationTriangle, faSignInAlt, faStore } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-login',
  imports: [FontAwesomeModule, ReactiveFormsModule, CommonModule, TranslateModule, RouterLink, AnimateOnScroll,],
  standalone: true,
  templateUrl: './login.html',
  styleUrl: './login.scss',
  providers: [],
})
export class LoginComponent {

  isPasswordVisible: boolean = false;

  fb = inject(FormBuilder);

  constructor(private matDialog: MatDialog) { }

  passwordIcon = faEye;

  fireStore = inject(Firestore);

  translateService = inject(TranslateService);

  toastService = inject(ToastService);


  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  auth = inject(AuthService);

  router = inject(Router);

  destroy$ = new Subject<void>()

  logoIcon = faStore;
  envelopeIcon = faEnvelope;
  lockIcon = faLock;
  warningIcon = faExclamationTriangle;
  signInIcon = faSignInAlt;
  eyeIcon = faEye;
  eyeSlashIcon = faEyeSlash;
  checkIcon = faCheckCircle;


  toggleVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible
  }

  loginWithEmailAndPassword() {
    if (this.loginForm.valid) {
      const dialogRef = this.matDialog.open(Loader, {
        disableClose: true,
      });
      this.auth.loginWithEmailAndPassword(this.loginForm.get('email')?.value!, this.loginForm.get('password')?.value!).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          dialogRef.close();
          this.toastService.success(this.translateService.instant('SUCCESS_MESSAGES.LOGIN'));
          this.router.navigate(['/'], { replaceUrl: true });
        },
        error: (err) => {
          dialogRef.close();
        }
      });
    }
  }

  loginWithGoogle() {
    let loader = this.matDialog.open(Loader, {
      disableClose: true,
    });
    this.auth.loginWithGoogle().pipe(takeUntil(this.destroy$)).subscribe(
      {
        next: () => {
          loader.close();
          this.toastService.success(this.translateService.instant('SUCCESS_MESSAGES.LOGIN'));
          this.router.navigate(['/'], { replaceUrl: true });
        },
        error: (err) => {
          loader.close();
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
