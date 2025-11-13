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
import { CacheService } from '../../../core/services/cache.service';
import { addDoc, collection, collectionData, deleteDoc, doc, Firestore, query, setDoc, where } from '@angular/fire/firestore';
import { fireStoreCollections } from '../../../../environments/environment';
import { CartProduct } from '../../cart/cart.product';
import { Order } from '../../../core/interfaces/order';

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
        this.auth.isLoginSubject.next(true);
        localStorage.setItem('isLogin', this.auth.isLoginSubject.value ? 'true' : 'false');
        localStorage.setItem('isRemembered', this.rememberMe ? 'true' : 'false');
        let user = JSON.parse(JSON.stringify(value.user));
        console.log(user.uid);
        let userRef = collection(this.fireStore,fireStoreCollections.users)
        let x = collectionData(query(userRef,where('email','==',value.user.email))).subscribe(
          {
            next : (value : any) => {
                console.log(value);
                
                console.log('value ' + value[0].uid);
                console.log('value ' + value[0].role);
                
                localStorage.setItem('token', value[0].uid);
                localStorage.setItem('role', value[0].role);
                this.auth.userRole.set(value[0].role)
                this.router.navigate(['/'], { replaceUrl: true });
                x.unsubscribe();
                
            },
          }
        );
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
    let login = this.auth.loginWithGoogle().subscribe(
      {
        next: (value) => {
          this.auth.isLoginSubject.next(true);
          localStorage.setItem('isLogin',this.auth.isLoginSubject.value ? 'true' : 'false');
          localStorage.setItem('isRemembered',this.rememberMe ? 'true' : 'false');
          this.router.navigate(['/'], { replaceUrl: true });
          let users = collection(this.fireStore, fireStoreCollections.users);
          let q = collectionData(users);
          q.subscribe(res => {
            let user = res.find((u) => u['email'] == value.user.email);
            console.log(user);
            if(!user){
              console.log('not found');
              let newDoc = {
                uid: value.user.uid,
                email: value.user.email,
                displayName: value.user.displayName,
                createdAt: new Date(),
                cartProducts : [] as CartProduct[],
                orders: [] as Order[],
                role: 'buyer',
              };
              addDoc(users,newDoc).then(async (val) => {
                login.unsubscribe();
                await setDoc(
                  doc(this.fireStore,fireStoreCollections.users,value.user.uid),
                  newDoc,
                )
                await deleteDoc(val);
              });
            }else{
              console.log('found');
              console.log(user);
              
              localStorage.setItem('token', user['uid']);
              localStorage.setItem('role', user['role']);
              login.unsubscribe();
            }
            this.auth.userRole.set(user!['role'])            
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
          this.auth.isLoginSubject.next(false);
          this.cacheService.remove('isLogin');
          this.cacheService.remove('isRemembered');
          this.cacheService.remove('token');
          this.cacheService.remove('role');
          this.auth.userRole.set('');
          this.router.navigate(['/login'], { replaceUrl: true });
      },

      error: (err) => {
        let message = getFirebaseErrorMessage(err.code);
        // console.log(message);
      }
    });
  }
}
