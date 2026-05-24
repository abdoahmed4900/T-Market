import { inject, Injectable, signal } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, GoogleAuthProvider, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, UserCredential } from '@angular/fire/auth';
import { collectionData, Firestore } from '@angular/fire/firestore';
import { collection, doc, query, setDoc, where } from 'firebase/firestore';
import { catchError, from, switchMap, take, tap, throwError } from 'rxjs';
import { fireStoreCollections } from '../../../environments/environment';
import { CartProduct } from '../../features/cart/cart.product';
import { Order } from '../interfaces/order';
import { Admin, Buyer, Seller, User } from '../../features/auth/user';
import { FirebaseErrorService } from './firebase.error.service';
import { CartService } from '../../shared/services/cart.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private firebaseAuth = inject(Auth);
  private firestore = inject(Firestore);
  cartService = inject(CartService);
  userRole = signal(localStorage.getItem('role') ?? '');
  isLoggedIn = signal(localStorage.getItem('isLogin') == 'true');
  userCollection = collection(this.firestore, fireStoreCollections.users);
  firebaseErrorService = inject(FirebaseErrorService);

  loginWithEmailAndPassword(email: string, password: string) {
    return from(signInWithEmailAndPassword(this.firebaseAuth, email, password)).pipe(
      switchMap(() => {
        return this.changeUserCredentials(email);
      }),
      catchError((err) => {
        this.firebaseErrorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  changeUserCredentials(email: string) {
    return collectionData(query(this.userCollection, where('email', '==', email))).pipe(
      take(1),
      tap((value) => {
        const role = value[0]['role'];
        const uid = value[0]['uid'];

        // Update localStorage
        localStorage.setItem('role', role);
        localStorage.setItem('token', uid);
        localStorage.setItem('isLogin', 'true');
        localStorage.setItem('name', value[0]['name']);

        this.userRole.set(role);
        this.isLoggedIn.set(true);
        this.cartService.getAllCartProducts();
      }),
      catchError((err) => {
        this.firebaseErrorService.handleError(err);
        return throwError(() => err);
      })
    )
  }

  addGoogleAccount(value: UserCredential) {
    return collectionData(this.userCollection).pipe(
      switchMap((u) => {
        let users = u as User[];
        let user = users.find((u) => u['email'] == value.user.email);
        if (!user) {
          let newDoc = this.setNewGoogleAccountData(value);
          let userDoc = doc(this.firestore, fireStoreCollections.users, value.user.uid);
          this.userRole.set('buyer');
          localStorage.setItem('role', 'buyer');
          localStorage.setItem('token', value.user.uid);
          return from(setDoc(userDoc, newDoc));
        }
        const role = user['role'];
        this.userRole.set(role);
        localStorage.setItem('token', user['uid']);
        localStorage.setItem('role', user['role']);
        this.isLoggedIn.set(true);
        localStorage.setItem('isLogin', 'true');
        return from(Promise.resolve());
      }),
      catchError((err) => {
        this.firebaseErrorService.handleError(err);
        return throwError(() => err);
      })
    )
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
      }),
      catchError((err) => {
        this.firebaseErrorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  resetPassword(email: string) {
    return from(sendPasswordResetEmail(this.firebaseAuth, email)).pipe(
      catchError((err) => {
        this.firebaseErrorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return from(signInWithPopup(this.firebaseAuth, provider)).pipe(
      switchMap((res) => {
        return this.addGoogleAccount(res);
      }),
      catchError((err) => {
        this.firebaseErrorService.handleError(err);
        return throwError(() => err);
      })
    );
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
      seller: { ...userData, ordersIds: [], productsIds: [], soldItemsNumber: 0, totalRevenue: 0 } as Seller,
      admin: { ...userData, ordersIds: [], productsIds: [], totalRevenue: 0, totalOrders: 0, totalProductsSold: 0 } as Admin
    };

    userData = roleHandlers[userData.role as 'admin' | 'seller' | 'buyer'];
    console.log(JSON.stringify(userData));

    await setDoc(doc(this.firestore, fireStoreCollections.users, value.user.uid), userData);
  }

  logout() {
    return from(this.firebaseAuth.signOut()).pipe(
      tap(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('isLogin');
        localStorage.removeItem('name');
        this.cartService.clearCart();
        this.userRole.set('')
        this.isLoggedIn.set(false)
      }),
      catchError((err) => {
        this.firebaseErrorService.handleError(err);
        return throwError(() => err);
      })
    );
  }
}