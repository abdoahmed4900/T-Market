import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { MatDialog } from '@angular/material/dialog';
import { Loader } from '../../../../shared/components/loader/loader';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss'
})
export class ResetPassword {

  auth = inject(AuthService);
  fb = inject(FormBuilder);
  translateService = inject(TranslateService);
  toastService = inject(ToastService);
  matDialog = inject(MatDialog);

  resetPasswordFirstForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  resetPassword() {
    let loader = this.matDialog.open(
      Loader,
      {
        disableClose: true
      }
    )
    if (this.resetPasswordFirstForm.valid) {
      this.auth.resetPassword(this.resetPasswordFirstForm.get('email')?.value!).subscribe({
        next: (res) => {
          this.toastService.success(this.translateService.instant('SUCCESS_MESSAGES.PASSWORD_RESET'));
          loader.close();
        },
        error: (err) => {
          loader.close()
        }
      });
    }
  }
}