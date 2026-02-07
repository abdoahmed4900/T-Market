import { Component, inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule,FormsModule,ReactiveFormsModule,TranslatePipe],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss'
})
export class ResetPassword {

  auth = inject(AuthService);
  fb = inject(FormBuilder);

  resetPasswordFirstForm = this.fb.group({
    email: ['',[Validators.required,Validators.email]]
  });

  resetPassword() {
    if(this.resetPasswordFirstForm.valid){
      this.auth.resetPassword(this.resetPasswordFirstForm.get('email')?.value!).subscribe({
      next: (res) => {
        alert('Reset password email sent successfully. Please check your inbox.');
        console.log(res);
      },
      error: (err) => {
        console.log(err);
      }
    });
    }
  }
}