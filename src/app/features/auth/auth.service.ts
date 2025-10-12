import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword, UserCredential } from '@angular/fire/auth';
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

   logout() {
      let res = () => this.auth.signOut();
      return defer(res);
   }
}
