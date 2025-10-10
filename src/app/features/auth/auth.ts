import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, UserCredential } from '@angular/fire/auth';
import { defer, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
   http = inject(HttpClient);

   constructor(private auth: Auth) {}

   loginWithEmailAndPassword(email: string, password: string) : Observable<UserCredential> {
      let res = () => signInWithEmailAndPassword(this.auth,email,password);
      return defer(res);
   }

   register(email:string, password:string) {
      let res = () => createUserWithEmailAndPassword(this.auth,email,password);
      return defer(res);
   }

   logout() {
      let res = () => this.auth.signOut();
      return defer(res);
   }
}
