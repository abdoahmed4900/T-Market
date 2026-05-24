import { Component, inject, linkedSignal, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../user';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Firestore } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { Loader } from '../../../shared/components/loader/loader';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { AnimateOnScroll } from "../../../shared/animate-on-scroll";
import { passwordMatchValidator } from '../../../shared/methods';
import { ToastService } from '../../../shared/services/toast.service';
import {
  faUser,
  faEnvelope,
  faLock,
  faExclamationTriangle,
  faUserPlus,
  faEye,
  faEyeSlash,
  faCheckCircle,
  faUsers
} from '@fortawesome/free-solid-svg-icons';
import { PasswordVisibilityIcon } from "../../../shared/components/password-visibility-icon/password-visibility-icon";

@Component({
  selector: 'app-register',
  imports: [RouterLink, FontAwesomeModule, ReactiveFormsModule, CommonModule, TranslateModule, AnimateOnScroll, PasswordVisibilityIcon],
  standalone: true,
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class RegisterComponent {

  constructor(private fb: FormBuilder) { }

  selectedRole: string = 'Buyer';

  auth = inject(AuthService);

  fireStore = inject(Firestore);

  user = signal<User | null>(null);

  registerForm !: FormGroup;

  matDialog = inject(MatDialog);

  router = inject(Router);

  destroy$ = new Subject<void>();

  translateService = inject(TranslateService);

  roles = [
    'Buyer',
    'Seller'
  ];

  passwordStrength = linkedSignal(() => {
    const password = this.getFormControl('password')!.value;
    return {
      minLength: password.length >= 6,
      hasUpperCase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[^A-Za-z0-9]/.test(password)
    };
  });

  registerIcon = faUserPlus;
  userIcon = faUser;
  roleIcon = faUsers;
  envelopeIcon = faEnvelope;
  lockIcon = faLock;
  warningIcon = faExclamationTriangle;
  eyeIcon = faEye;
  eyeSlashIcon = faEyeSlash;
  checkIcon = faCheckCircle;
  private checkPassword() {
    this.getFormControl('password').valueChanges.pipe(takeUntil(this.destroy$)).subscribe(
      {
        next: (value) => {
          let password = value as string;
          this.passwordStrength.set({
            minLength: password.length >= 6,
            hasUpperCase: /[A-Z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSpecialChar: /[^A-Za-z0-9]/.test(password)
          });
        },
      }
    );
  }

  isPasswordValid() {
    return this.passwordStrength().minLength && this.passwordStrength().hasNumber && this.passwordStrength().hasUpperCase && this.passwordStrength().hasSpecialChar
  }

  isPasswordVisible = false;
  toastService = inject(ToastService);

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    }, { validators: passwordMatchValidator('password', 'confirmPassword') });
    this.checkPassword();
  }
  setPasswordVisiblity(isVisible: boolean) {
    this.isPasswordVisible = isVisible;
  }

  selectRole(event: Event) {
    const element = event.target as HTMLSelectElement;
    this.selectedRole = element.value;
  }

  getFormControl(controlName: string) {
    return this.registerForm.get(controlName) || new FormControl();
  }
  register() {
    if (this.registerForm.valid && this.isPasswordValid()) {
      const dialogRef = this.matDialog.open(Loader, {
        disableClose: true,
      })
      console.log(this.getFormControl('email'));
      console.log(this.getFormControl('name'));
      console.log(this.getFormControl('password'));
      console.log(this.selectedRole);

      this.auth.register(this.registerForm.get('email')?.value, this.registerForm.get('password')?.value, this.registerForm.get('name')?.value, this.selectedRole).pipe(takeUntil(this.destroy$)).subscribe({
        next: (value) => {
          dialogRef.close();
          this.toastService.success(this.translateService.instant('SUCCESS_MESSAGES.REGISTER'));
          this.registerForm.reset();
          this.router.navigate(['/login'], { replaceUrl: true });
        },

        error: (err) => {
          dialogRef.close();
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

