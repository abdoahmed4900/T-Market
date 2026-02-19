import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { getFirebaseErrorMessage } from '../../../core/methods';
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { Loader } from '../../../shared/components/loader/loader';
import { Firestore } from '@angular/fire/firestore';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [FontAwesomeModule, ReactiveFormsModule, CommonModule, RouterLink, TranslatePipe],
  standalone: true,
  templateUrl: './login.html',
  styleUrl: './login.scss',
  providers: [],
})
export class LoginComponent implements OnInit {
  isPasswordVisible: boolean = false;

  constructor(private fb : FormBuilder,private matDialog : MatDialog) { }

  passwordIcon = faEye;

  loginForm !: FormGroup;

  fireStore = inject(Firestore);

  translateService = inject(TranslateService);

  // toastService = inject(ToastService);

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email : ['', [Validators.required, Validators.email]],
      password : ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  auth = inject(AuthService);

  router = inject(Router);

  destroy$ = new Subject<void>()

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
    this.passwordIcon = !this.isPasswordVisible ? faEye : faEyeSlash;
  }

  loginWithEmailAndPassword() {
    if(this.loginForm.valid){
      const dialogRef = this.matDialog.open(Loader, {
      disableClose: true,
    });
      this.auth.loginWithEmailAndPassword(this.loginForm.get('email')?.value, this.loginForm.get('password')?.value).pipe(takeUntil(this.destroy$)).subscribe({
      next: async () => {
        dialogRef.close();
        await this.auth.changeUserCredentials(this.loginForm.get('email')!.value);
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

  async loginWithGoogle() {
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
