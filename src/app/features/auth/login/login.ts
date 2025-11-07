import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { getFirebaseErrorMessage } from '../../../core/methods';
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { Loader } from '../../../shared/loader/loader';
import { CacheService } from '../../../core/cache.service';
import { addDoc, collection, collectionData, Firestore } from '@angular/fire/firestore';
import { fireStoreCollections } from '../../../../environments/environment';

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

  fireStore = inject(Firestore);

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email : ['', [Validators.required, Validators.email]],
      password : ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  auth = inject(AuthService);

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
      next: async (value) => {
        dialogRef.close();
        this.auth.isLoginSubject.next('true');
        if(this.rememberMe){
          localStorage.setItem('isLogin', 'true');
        }
        let user = JSON.parse(JSON.stringify(value.user));
        console.log(user.uid);
        this.cacheService.set('token', user.uid);
        this.cacheService.set('role', 'buyer');

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
  async loginWithGoogle() {
    this.auth.loginWithGoogle().subscribe(
      {
        next: (value) => {
          this.auth.isLoginSubject.next('true');
          this.cacheService.set('user', JSON.stringify(value.user));
          localStorage.setItem('isLogin', 'true');
          this.router.navigate(['/'], { replaceUrl: true });
          let users = collection(this.fireStore, fireStoreCollections.users);
          let q = collectionData(users);
          q.subscribe(res => {
            let user = res.find((u) => u['uid'] == value.user.uid);
            if(!user){
              addDoc(users,{
                uid: value.user.uid,
                email: value.user.email,
                displayName: value.user.displayName,
                createdAt: new Date(),
                role: 'user',
              });
            }
          });

        },

        error: (err) => {
          let message = getFirebaseErrorMessage(err.code);
          console.log(message);
        }
      }
    );
  }
  logout() {
    this.auth.logout().subscribe({
      next: () => {
          this.auth.isLoginSubject.next('false');
          this.cacheService.remove('isLogin');
          this.cacheService.remove('token');
          this.router.navigate(['/login'], { replaceUrl: true });
      },

      error: (err) => {
        let message = getFirebaseErrorMessage(err.code);
        // console.log(message);
      }
    });
  }
}
