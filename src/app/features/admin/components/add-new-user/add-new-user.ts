import { MatDialog } from '@angular/material/dialog';
import { Component, inject, linkedSignal, signal } from '@angular/core';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { GoBackButton } from "../../../../shared/components/go-back-button/go-back-button";
import { PasswordVisibilityIcon } from "../../../../shared/components/password-visibility-icon/password-visibility-icon";
import { MatOption, MatSelect } from "@angular/material/select";
import { AuthService } from '../../../../core/services/auth.service';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { numericLengthValidator, passwordMatchValidator } from '../../../../shared/methods';
import { Loader } from '../../../../shared/components/loader/loader';
import { ToastService } from '../../../../shared/services/toast.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faEnvelope, faUser, faLock, faExclamationTriangle, faCheck, faPaperPlane, faStore, faUserShield, faBriefcase } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { AnimateOnScroll } from "../../../../shared/animate-on-scroll";

@Component({
  selector: 'app-add-new-user',
  imports: [TranslateModule, ReactiveFormsModule, FormsModule, GoBackButton, PasswordVisibilityIcon, MatOption, MatSelect, CommonModule, FaIconComponent, AnimateOnScroll],
  templateUrl: './add-new-user.html',
  styleUrl: './add-new-user.scss',
})
export class AddNewUser {

  formBuilder = inject(FormBuilder);
  authService = inject(AuthService);
  translateService = inject(TranslateService);
  toastService = inject(ToastService);
  matDialog = inject(MatDialog);
  envelopeIcon = faEnvelope;
  userIcon = faUser;
  lockIcon = faLock;
  warningIcon = faExclamationTriangle;
  checkIcon = faCheck;
  submitIcon = faPaperPlane;
  storeIcon = faStore;
  adminIcon = faUserShield;
  router = inject(Router)

  passwordChecks = linkedSignal(() => {
    const password = this.getFormControl('password')!.value;
    return {
      minLength: password.length >= 6,
      hasUpperCase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[^A-Za-z0-9]/.test(password)
    };
  });

  newUserForm = this.formBuilder.group({
    userName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email, Validators.minLength(3)]],
    password: ['', [Validators.required, numericLengthValidator(6)]],
    confirmPassword: ['', [Validators.required, numericLengthValidator(6)]],
  }, { validators: passwordMatchValidator('password', 'confirmPassword') })

  selectedRole = signal('Buyer');

  isPasswordVisible = signal(false);

  destroy$ = new Subject<void>();

  roleIcon = faBriefcase;

  ngOnInit(): void {
    this.checkPassword();
  }



  private checkPassword() {
    this.getFormControl('password').valueChanges.pipe(takeUntil(this.destroy$)).subscribe(
      {
        next: (value) => {
          let password = value as string;
          this.passwordChecks.set({
            minLength: password.length >= 6,
            hasUpperCase: /[A-Z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSpecialChar: /[^A-Za-z0-9]/.test(password)
          });
        },
      }
    );
  }

  setPasswordVisiblity(visible: boolean) {
    this.isPasswordVisible.set(visible);
  }

  addNewUser() {
    if (this.isPasswordValid()) {
      let loaderRef = this.matDialog.open(
        Loader,
        {
          disableClose: true,
        }
      )
      this.authService.register(this.getFormControl('email').value, this.getFormControl('password').value, this.getFormControl('userName').value, this.selectedRole()).pipe(takeUntil(this.destroy$)).subscribe(
        {
          next: (value) => {
            loaderRef.close();
            this.toastService.success(this.translateService.instant('SUCCESS_MESSAGES.USER_CREATED'));
            this.newUserForm.reset();
            this.router.navigateByUrl('/')
          },
          error: (err) => {
            loaderRef.close();
          },
        }
      )
    }
  }

  isPasswordValid() {
    return this.passwordChecks().minLength && this.passwordChecks().hasNumber && this.passwordChecks().hasUpperCase && this.passwordChecks().hasSpecialChar
  }

  getFormControl(controlName: string) {
    return this.newUserForm.get(controlName) || new FormControl();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
