import { faEye } from '@fortawesome/free-solid-svg-icons';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { getFirebaseErrorMessage } from '../../../core/methods';
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { Loader } from '../../../shared/components/loader/loader';
import { Firestore } from '@angular/fire/firestore';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { PasswordVisibilityIcon } from "../../../shared/components/password-visibility-icon/password-visibility-icon";
import { AnimateOnScroll } from "../../../shared/animate-on-scroll";

@Component({
  selector: 'app-login',
  imports: [FontAwesomeModule, ReactiveFormsModule, CommonModule, TranslatePipe, PasswordVisibilityIcon, RouterLink, AnimateOnScroll],
  standalone: true,
  templateUrl: './login.html',
  styleUrl: './login.scss',
  providers: [],
})
export class LoginComponent {
  
  isPasswordVisible: boolean = false;

  fb = inject(FormBuilder);

  constructor(private matDialog : MatDialog) { }

  passwordIcon = faEye;

  fireStore = inject(Firestore);

  translateService = inject(TranslateService);

  // toastService = inject(ToastService);

  
  loginForm = this.fb.group({
      email : ['', [Validators.required, Validators.email]],
      password : ['', [Validators.required, Validators.minLength(6)]]
  });

  auth = inject(AuthService);

  router = inject(Router);

  destroy$ = new Subject<void>()

  toggleVisibility(isVisible: boolean) {
     this.isPasswordVisible = isVisible;
  }

  loginWithEmailAndPassword() {
    if(this.loginForm.valid){
      const dialogRef = this.matDialog.open(Loader, {
      disableClose: true,
    });
      this.auth.loginWithEmailAndPassword(this.loginForm.get('email')?.value!, this.loginForm.get('password')?.value!).pipe(takeUntil(this.destroy$)).subscribe({
      next: async () => {
        dialogRef.close();
        await this.auth.changeUserCredentials(this.loginForm.get('email')!.value!);
        await this.router.navigate(['/'], { replaceUrl: true });
      },
      error: (err) => {
          dialogRef.close();
          let message = getFirebaseErrorMessage(err.code);
          // this.toastService.showErrorToast(message);
          }
      });
    }
  }

  loginWithGoogle() {
    this.auth.loginWithGoogle().pipe(takeUntil(this.destroy$)).subscribe(
      {
        next: (value) => {
          this.auth.addGoogleAccount(value);
          this.router.navigate(['/'], { replaceUrl: true });
        },
        error: (err) => {
          let message = getFirebaseErrorMessage(err.code);
        }
      }
    );
  }
  logout() {
    this.auth.logout().pipe(takeUntil(this.destroy$)).subscribe({
      next: async () => {
        this.auth.isLoggedIn.set(false);
        this.auth.userRole.set('');
        localStorage.clear();
        await this.router.navigateByUrl('/login', { replaceUrl: true });
      },
      error : (err) => {
        let message = getFirebaseErrorMessage(err.code);
      },
     }
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
