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
import { addDoc, collection, collectionData, deleteDoc, doc, Firestore, query, setDoc, where } from '@angular/fire/firestore';
import { fireStoreCollections } from '../../../../environments/environment';
import { CartProduct } from '../../cart/cart.product';
import { Order } from '../../../core/interfaces/order';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { LangDirective } from "../../../core/lang";
import { map } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [FontAwesomeModule, ReactiveFormsModule, CommonModule, RouterLink, TranslatePipe, LangDirective],
  standalone: true,
  templateUrl: './login.html',
  styleUrl: './login.scss',
  providers: [],
})
export class LoginComponent implements OnInit {
  isPasswordVisible: boolean = false;

  constructor(private fb : FormBuilder,private matDialog : MatDialog) { }

  passwordIcon = faEye;

  rememberMe: boolean = false;

  loginForm !: FormGroup;

  fireStore = inject(Firestore);

  translateService = inject(TranslateService);

  // toastService = inject(ToastService);

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
        let user = JSON.parse(JSON.stringify(value.user));
        console.log(user.uid);
        let userRef = collection(this.fireStore,fireStoreCollections.users)
        let x = collectionData(query(userRef,where('email','==',value.user.email))).subscribe(
          {
            next : async (value : any) => {
                localStorage.setItem('role', value[0].role);
                localStorage.setItem('isRemembered', this.rememberMe ? 'true' : 'false');
                localStorage.setItem('token', value[0].uid);
                localStorage.setItem('language',this.translateService.getCurrentLang())
                this.auth.isLoginSubject.next(true);
                this.auth.userRole.next(value[0].role);
                this.auth.isLoggedIn$ = this.auth.isLoggedIn$.pipe(map((val) => {
                  val = true;
                  return val;
                }))
                this.router.navigate(['/'], { replaceUrl: true });
                x.unsubscribe();
            },
          }
        );
      },



      error: (err) => {
        dialogRef.close();
        let message = getFirebaseErrorMessage(err.code);
        // this.toastService.showErrorToast(message);
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
          q.subscribe(async res => {
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
                wishListIds: [] as string[],
                role: 'buyer',
              };
              addDoc(users,newDoc).then(async (val) => {
                await setDoc(
                  doc(this.fireStore,fireStoreCollections.users,value.user.uid),
                  newDoc,
                )
                await deleteDoc(val);
              });
            }else{
              this.auth.userRole.next(user['role']);
              localStorage.setItem('token', user['uid']);
              localStorage.setItem('role', user['role']);
            } 
            this.auth.isLoggedIn$ = this.auth.isLoggedIn$.pipe(map((val) => {
                  val = true;
                  return val;
            }))
            login.unsubscribe();        
          });

        },

        error: (err) => {
          let message = getFirebaseErrorMessage(err.code);
          // this.toastService.showErrorToast(message);
        }
      }
    );
  }
  logout() {
    this.auth.logout().subscribe({
      next: async () => {
        this.auth.isLoginSubject.next(false);
        this.auth.userRole.next(null);
        localStorage.clear();

        await this.router.navigateByUrl('/login', { replaceUrl: true });
      },
      error : (err) => {
        let message = getFirebaseErrorMessage(err.code);
        // this.toastService.showErrorToast(message);
      },
     }
    );
  }
}
