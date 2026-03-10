import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { numericLengthValidator, passwordMatchValidator } from '../../../../core/utils';
import { GoBackButton } from "../../../../shared/components/go-back-button/go-back-button";
import { PasswordVisibilityIcon } from "../../../../shared/components/password-visibility-icon/password-visibility-icon";
import { MatOption, MatSelect } from "@angular/material/select";

@Component({
  selector: 'app-add-new-user',
  imports: [TranslatePipe, ReactiveFormsModule, FormsModule, GoBackButton, PasswordVisibilityIcon, MatOption, MatSelect],
  templateUrl: './add-new-user.html',
  styleUrl: './add-new-user.scss',
})
export class AddNewUser {

  formBuilder = inject(FormBuilder);
  

  newUserForm = this.formBuilder.group({
    userName: ['',[Validators.required,Validators.minLength(3)]],
    email: ['',[Validators.required,Validators.minLength(3)]],
    password: ['',[Validators.required,numericLengthValidator(6)]],
    confirmPassword: ['',[Validators.required,numericLengthValidator(6)]],
  },{validators: passwordMatchValidator('password', 'confirmPassword')})

  selectedRole = signal('Buyer');

  isPasswordVisible = signal(false);

  setPasswordVisiblity(visible:boolean){
    this.isPasswordVisible.set(visible);
  }
}
