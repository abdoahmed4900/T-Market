import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { numericLengthValidator, passwordMatchValidator } from '../../../../core/utils';
import { GoBackButton } from "../../../../shared/components/go-back-button/go-back-button";
import { PasswordVisibilityIcon } from "../../../../shared/components/password-visibility-icon/password-visibility-icon";
import { MatOption, MatSelect } from "@angular/material/select";
import { AuthService } from '../../../../core/services/auth.service';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-new-user',
  imports: [TranslatePipe, ReactiveFormsModule, FormsModule, GoBackButton, PasswordVisibilityIcon, MatOption, MatSelect,CommonModule],
  templateUrl: './add-new-user.html',
  styleUrl: './add-new-user.scss',
})
export class AddNewUser {

  formBuilder = inject(FormBuilder);
  authService = inject(AuthService);

  newUserForm = this.formBuilder.group({
    userName: ['',[Validators.required,Validators.minLength(3)]],
    email: ['',[Validators.required,Validators.email,Validators.minLength(3)]],
    password: ['',[Validators.required,numericLengthValidator(6)]],
    confirmPassword: ['',[Validators.required,numericLengthValidator(6)]],
  },{validators: passwordMatchValidator('password', 'confirmPassword')})

  selectedRole = signal('Buyer');

  isPasswordVisible = signal(false);

  destroy$ = new Subject<void>();

  setPasswordVisiblity(visible:boolean){
    this.isPasswordVisible.set(visible);
  }

  addNewUser(){
    this.authService.register(this.getFormControl('email').value,this.getFormControl('password').value,this.getFormControl('userName').value,this.selectedRole()).pipe(takeUntil(this.destroy$)).subscribe(
      {
        next : (value) => {
          console.log(this.getFormControl('userName').value);
          console.log(this.getFormControl('email').value);
          console.log(this.getFormControl('password').value);
          
          alert('New User Created successfully!');
          this.newUserForm.reset();
        },
      }
    )
  }

  getFormControl(controlName:string){
    return this.newUserForm.get(controlName) || new FormControl();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
