import { inject, Injectable } from "@angular/core";
import { collection, Firestore } from "@angular/fire/firestore";
import { fireStoreCollections } from "../../../../environments/environment";
import { doc } from "@angular/fire/firestore";
import { catchError, from, map, of, switchMap, throwError } from "rxjs";
import { Product } from "../../../core/interfaces/product";
import { HomeService } from "../../../core/services/home.service";
import { DocumentReference, getDoc, updateDoc } from "firebase/firestore";
import { Review } from "../../../core/interfaces/review";
import { FirebaseErrorService } from "../../../core/services/firebase.error.service";

@Injectable(
  {
    providedIn: 'root'
  }
)
export class ReviewService {

  firestore = inject(Firestore);
  homeService = inject(HomeService);
  firebaseErrorService = inject(FirebaseErrorService);
  productCollectionRef = collection(this.firestore, fireStoreCollections.products);
  addReview(review: string, rating: number, productId: string) {
    let docRef = doc(this.firestore, fireStoreCollections.products, productId);
    return this.getUserName().pipe(
      switchMap((name) => {
        return from(getDoc(docRef)).pipe(
          switchMap((p) => {
            let product = p.data() as Product;
            return this.updateReviewsAndRating(product, name, rating, review, docRef);
          }),
        )
      }),
      catchError((err) => {
        this.firebaseErrorService.handleError(err);
        return throwError(() => new Error(err))
      })
    )
  }

  private updateReviewsAndRating(product: Product, name: string, rating: number, review: string, docRef: DocumentReference) {
    let reviews = product.reviews ?? [];
    let newReviews = [...reviews, { userName: name, userId: localStorage.getItem('token')!, rating: rating, comment: review, date: new Date().toDateString() }] as Review[];
    const totalRating = newReviews.reduce((sum, r) => sum + r.rating, 0);
    const newRating = totalRating / newReviews.length;
    return from(updateDoc(docRef, { reviews: newReviews, rating: newRating })).pipe(
      map(() => {
        return newReviews;
      }),
      catchError((err) => {
        this.firebaseErrorService.handleError(err);
        return of(reviews)
      })
    );
  }

  getUserName() {
    return this.homeService.getUser().pipe(
      map((user) => user.name!),
      catchError(error => {
        this.firebaseErrorService.handleError(error)
        return throwError(() => new Error(error));
      })
    )
  }

  isProductReviewedByUser(productId: string) {
    const docRef = doc(this.firestore, fireStoreCollections.products, productId);
    return from(getDoc(docRef)).pipe(
      map((p) => {
        if (p.exists()) {
          const product = p.data() as Product;
          return product.reviews?.some(
            (review) => review.userId === localStorage.getItem('token')
          ) ?? false;
        }
        return false;
      }),
      catchError(error => {
        this.firebaseErrorService.handleError(error)
        return of(false);
      })
    )
  }
}