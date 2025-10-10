import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth';
import { User } from '../user';
import { getFirebaseErrorMessage } from '../../../core/methods';
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { Loader } from '../../../shared/loader/loader';

@Component({
  selector: 'app-login',
  imports: [RouterLink,FontAwesomeModule,ReactiveFormsModule,CommonModule],
  standalone: true,
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent implements OnInit {
  isPasswordVisible: boolean = false;

  constructor(private fb : FormBuilder,private matDialog : MatDialog) { }

  passwordIcon = faEye;

  loginForm !: FormGroup;
  ngOnInit(): void {
    // this.loginWithEmailAndPassword('abc@email.com','12345');
    this.loginForm = this.fb.group({
      email : ['', [Validators.required, Validators.email]],
      password : ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  auth = inject(AuthService);

  user = signal<User | null>(null);

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
    this.passwordIcon = !this.isPasswordVisible ? faEye : faEyeSlash;
  }

  loginWithEmailAndPassword() {
    if(this.loginForm.valid){
      const dialogRef = this.matDialog.open(Loader, {
      disableClose: true,
      
    });
      this.auth.loginWithEmailAndPassword(this.loginForm.get('email')?.value, this.loginForm.get('password')?.value).subscribe({
      next: (value) => {
        dialogRef.close();
        this.user.set(value.user);
      },

      error: (err) => {
        let message = getFirebaseErrorMessage(err.code);
        console.log(message);
      }
    });
    }
  }
  logout() {
    this.auth.logout().subscribe({
      next: () => {
          this.user.set(null);
      },

      error: (err) => {
        let message = getFirebaseErrorMessage(err.code);
        console.log(message);
      }
    });
  }
}
