import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, GoogleAuthProvider, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, UserCredential } from '@angular/fire/auth';
import { BehaviorSubject, defer, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
   http = inject(HttpClient);

   isLoginSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this.getInitialAuthState());
   isLoggedIn$ = this.isLoginSubject.asObservable();
   firebaseAuth = inject(Auth);
   userRole = new BehaviorSubject<string | null>(localStorage.getItem('role'));
   role$ = this.userRole.asObservable();

   constructor(private auth: Auth) {}

   loginWithEmailAndPassword(email: string, password: string) : Observable<UserCredential> {
      let res = () => signInWithEmailAndPassword(this.auth,email,password);
      return defer(res);
   }

   getInitialAuthState() {
      return localStorage.getItem('isLogin') == 'true' ? true : false;
   }

   register(email:string, password:string) {
      let res = () => createUserWithEmailAndPassword(this.auth,email,password);
      return defer(res);
   }

   resetPassword(email: string) {
    let res = () => sendPasswordResetEmail(this.auth, email);
    return defer(res);
   }

   loginWithGoogle() {
      const provider = new GoogleAuthProvider();
      let res = () =>  signInWithPopup(this.firebaseAuth, provider);
      return defer(res);
    }

   logout() {
      let res = () => this.auth.signOut();
      return defer(res);
   }
}
