import { inject, Injectable, signal } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, GoogleAuthProvider, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, UserCredential } from '@angular/fire/auth';
import { collectionData, Firestore } from '@angular/fire/firestore';
import { collection, doc, query, setDoc, where } from 'firebase/firestore';
import { from, switchMap, tap } from 'rxjs';
import { fireStoreCollections } from '../../../environments/environment';
import { CartProduct } from '../../features/cart/cart.product';
import { Order } from '../interfaces/order';
import { Admin, Buyer, Seller, User } from '../../features/auth/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private firebaseAuth = inject(Auth);
  private firestore = inject(Firestore);
  userRole = signal(localStorage.getItem('role'));
  isLoggedIn = signal(localStorage.getItem('isLogin') == 'true');
  
  userCollection = collection(this.firestore, fireStoreCollections.users);

  loginWithEmailAndPassword(email: string, password: string){
    return from(signInWithEmailAndPassword(this.firebaseAuth, email, password)).pipe(
      switchMap(() => this.changeUserCredentials(email))
    );
  }

  changeUserCredentials(email: string) {
    return collectionData(query(this.userCollection, where('email', '==', email))).pipe(
      tap((value) => {
        const role = value[0]['role'];
        const uid = value[0]['uid'];
          
        // Update localStorage
        localStorage.setItem('role', role);
        localStorage.setItem('token', uid);
        localStorage.setItem('isLogin', 'true');
        localStorage.setItem('name', value[0]['name']);

        console.log(`userRole updated from : ${this.userRole()}`);
        this.userRole.set(role);
        this.isLoggedIn.set(true);
        console.log(`userRole updated to : ${this.userRole()}`);
            
      })
    )
  }
  
  async addGoogleAccount(value: UserCredential) {
    return new Promise<void>((resolve, reject) => {
      collectionData(this.userCollection).subscribe(async res => {
        try {
          let user = res.find((u) => u['email'] == value.user.email);
          
          if (!user) {
            let newDoc = this.setNewGoogleAccountData(value);
            let userDoc = doc(this.firestore, fireStoreCollections.users, value.user.uid);
            await setDoc(userDoc, newDoc);
            
            this.userRole.set('buyer');
            
            localStorage.setItem('role', 'buyer');
            localStorage.setItem('token', value.user.uid);
          } else {
            const role = user['role'];
            this.userRole.set(role);
            localStorage.setItem('token', user['uid']);
            localStorage.setItem('role', role);
          }
          this.isLoggedIn.set(true);
          localStorage.setItem('isLogin', 'true');
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  private setNewGoogleAccountData(value: UserCredential) {
    return {
      uid: value.user.uid,
      email: value.user.email,
      name: value.user.displayName,
      createdAt: new Date(),
      cartProducts: [] as CartProduct[],
      orders: [] as Order[],
      wishListIds: [] as string[],
      role: 'buyer',
    };
  }

  register(email: string, password: string, name: string, role: string) {
    return from(createUserWithEmailAndPassword(this.firebaseAuth, email, password)).pipe(
      switchMap((res) => {
        return from(this.setUserData(email, name, res, role));
      })
    );
  }

  resetPassword(email: string) {
    return from(sendPasswordResetEmail(this.firebaseAuth, email));
  }

  loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return from(signInWithPopup(this.firebaseAuth, provider));
  }

  async setUserData(email: string, name: string, value: UserCredential, role: string) {
    let userData: User = {
      uid: value.user.uid,
      name: name,
      email: email,
      role: role.toLowerCase(),
      createdAt: new Date().toDateString(),
    };

    const roleHandlers = {
      buyer: { ...userData, cartProducts: [], ordersIds: [], wishListIds: [] } as Buyer,
      seller: { ...userData, ordersIds: [], productsIds: [], totalProductsSold: 0, totalRevenue: 0 } as Seller,
      admin: { ...userData, ordersIds: [], productsIds: [], totalRevenue: 0, totalOrders: 0, totalProductsSold: 0 } as Admin
    };
    
    userData = roleHandlers[userData.role as 'admin' | 'seller' | 'buyer'];
    await setDoc(doc(this.firestore, fireStoreCollections.users, value.user.uid), userData);
  }
  
  logout() {
    return from(this.firebaseAuth.signOut()).pipe(
      tap(() => {
        localStorage.removeItem('isLogin');
        localStorage.removeItem('role');
        localStorage.removeItem('token');
        localStorage.removeItem('theme');
        localStorage.removeItem('language');
        this.userRole.set('')
        this.isLoggedIn.set(false)
        console.log('Logout complete - all state cleared');
      })
    );
  }
}