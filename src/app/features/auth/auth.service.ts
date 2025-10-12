import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, GoogleAuthProvider, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, UserCredential } from '@angular/fire/auth';
import { BehaviorSubject, defer, Observable } from 'rxjs';
import { CacheService } from '../../core/cache.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
   http = inject(HttpClient);

   isLoginSubject: BehaviorSubject<string> = new BehaviorSubject<string>(this.getInitialAuthState());
   isLoggedIn$ = this.isLoginSubject.asObservable();
   cacheService = inject(CacheService);
   firebaseAuth = inject(Auth);

   constructor(private auth: Auth) {}

   loginWithEmailAndPassword(email: string, password: string) : Observable<UserCredential> {
      let res = () => signInWithEmailAndPassword(this.auth,email,password);
      return defer(res);
   }

   getInitialAuthState() {
      return localStorage.getItem('isLogin') ?? 'false';
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
