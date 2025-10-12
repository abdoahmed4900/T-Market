import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { User } from '../user';
import { getFirebaseErrorMessage } from '../../../core/methods';
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { Loader } from '../../../shared/loader/loader';
import { CacheService } from '../../../core/cache.service';

@Component({
  selector: 'app-login',
  imports: [FontAwesomeModule,ReactiveFormsModule,CommonModule,RouterLink],
  standalone: true,
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent implements OnInit {
  isPasswordVisible: boolean = false;

  constructor(private fb : FormBuilder,private matDialog : MatDialog) { }

  passwordIcon = faEye;

  rememberMe: boolean = false;

  loginForm !: FormGroup;

  cacheService = inject(CacheService);
  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email : ['', [Validators.required, Validators.email]],
      password : ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  auth = inject(AuthService);

  user = signal<User | null>(null);

  router = inject(Router);

  toggleRememberMe(){
    this.rememberMe = !this.rememberMe;
  }

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
        this.auth.isLoginSubject.next('true');
        if(this.rememberMe){
          localStorage.setItem('isLogin', 'true');
        }
        
        this.cacheService.set('user', JSON.stringify(value.user));
        
        this.router.navigate(['/'], { replaceUrl: true });
      },


      error: (err) => {
        dialogRef.close();
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
          this.auth.isLoginSubject.next('false');
          this.cacheService.remove('isLogin');
          this.cacheService.remove('user');
          this.router.navigate(['/login'], { replaceUrl: true });
      },

      error: (err) => {
        let message = getFirebaseErrorMessage(err.code);
        // console.log(message);
      }
    });
  }
}
