import { FirebaseErrorService } from './../../core/services/firebase.error.service';
// wishlist.service.ts
import { inject, Injectable } from '@angular/core';
import { ProductsService } from '../../shared/services/products.service';
import {
  arrayRemove,
  arrayUnion,
  collection,
  collectionData,
  doc,
  Firestore,
  getDocs,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { fireStoreCollections } from '../../../environments/environment';
import { forkJoin, from, map, of, switchMap, take, Observable, catchError, throwError } from 'rxjs';
import { Buyer } from '../auth/user';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private productService = inject(ProductsService);
  private firestore = inject(Firestore);
  firebaseErrorService = inject(FirebaseErrorService);

  // ✅ Lazy getters - not initialized at class level
  private get usersCollection() {
    return collection(this.firestore, fireStoreCollections.users);
  }

  private getUserId(): string | null {
    return localStorage.getItem('token');
  }

  private getUserQuery() {
    const userId = this.getUserId();
    if (!userId) return null;
    return query(this.usersCollection, where('uid', '==', userId));
  }

  getWishList(): Observable<any[]> {
    const userQuery = this.getUserQuery();
    if (!userQuery) return of([]);

    return collectionData(userQuery).pipe(
      take(1),
      switchMap(users => {
        const user = users[0] as Buyer;
        const ids = user?.wishListIds ?? [];

        if (!ids.length) return of([]);

        const requests = ids.map(id =>
          this.productService.getProductById(id)
        );

        return forkJoin(requests);
      }),
      catchError((err) => {
        this.firebaseErrorService.handleError(err);
        return of([]);
      })
    );
  }

  isProductInWishList(id: string): Observable<boolean> {
    const userId = this.getUserId();
    if (!userId) return of(false);

    const q = query(this.usersCollection, where('uid', '==', userId));

    return from(getDocs(q)).pipe(
      take(1),
      map(snapshot => {
        if (snapshot.empty) return false;
        const user = snapshot.docs[0].data() as Buyer;
        const ids = user.wishListIds ?? [];
        return ids.includes(id);
      }),
      catchError((err) => {
        this.firebaseErrorService.handleError(err);
        return of(false);
      })
    );
  }

  addToWishList(id: string): Observable<any> {
    const userId = this.getUserId();
    if (!userId) throw new Error('User not logged in');

    const userRef = doc(this.firestore, fireStoreCollections.users, userId);
    return from(updateDoc(userRef, { wishListIds: arrayUnion(id) })).pipe(
      catchError((err) => {
        this.firebaseErrorService.handleError(err);
        return throwError(() => err)
      })
    );
  }

  removeFromWishList(id: string): Observable<any> {
    const userId = this.getUserId();
    if (!userId) throw new Error('User not logged in');

    const userRef = doc(this.firestore, fireStoreCollections.users, userId);
    return from(updateDoc(userRef, { wishListIds: arrayRemove(id) })).pipe(catchError((err) => {
      this.firebaseErrorService.handleError(err);
      return throwError(() => err)
    }));
  }

  clearAllWishList(): Observable<any> {
    const userId = this.getUserId();
    if (!userId) throw new Error('User not logged in');

    const userRef = doc(this.firestore, fireStoreCollections.users, userId);
    return from(updateDoc(userRef, { wishListIds: [] })).pipe(
      catchError((err) => {
        this.firebaseErrorService.handleError(err);
        return throwError(() => err)
      })
    );
  }
}