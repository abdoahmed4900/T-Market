import { inject, Injectable } from "@angular/core";
import { collection, Firestore } from "@angular/fire/firestore";
import { fireStoreCollections } from "../../../../environments/environment";
import { doc } from "@angular/fire/firestore";
import { catchError, from, map, switchMap, throwError } from "rxjs";
import { Product } from "../../../core/interfaces/product";
import { HomeService } from "../../../core/services/home.service";
import { DocumentReference, getDoc, updateDoc } from "firebase/firestore";
import { Review } from "../../../core/interfaces/review";

@Injectable(
    {
        providedIn: 'root'
    }
)
export class ReviewService{

    firestore = inject(Firestore);
    homeService = inject(HomeService);
    productCollectionRef = collection(this.firestore,fireStoreCollections.products);
    addReview(review:string,rating:number,productId:string){
        console.log(productId);
        let docRef = doc(this.firestore, fireStoreCollections.products,productId);
        return this.getUserName().pipe(
            switchMap((name) => {
              return from(getDoc(docRef)).pipe(
                switchMap((p) => {
                    let product = p.data() as Product;
                    return this.updateReviewsAndRating(product, name, rating, review, docRef);
                }),
              )
            })
        )
    }

    private updateReviewsAndRating(product: Product, name: string, rating: number, review: string, docRef:DocumentReference) {
        let reviews = product.reviews ?? [];
        let newReviews = [...reviews, { userName: name, userId: localStorage.getItem('token')!, rating: rating, comment: review, date: new Date().toDateString() }] as Review[];
        let newRating = (rating + product.rating) / newReviews.length;
        return from(updateDoc(docRef, { reviews: newReviews,rating: newRating })).pipe(
            map(() => {
                return newReviews;
            }),
        );
    }

    getUserName(){
        return this.homeService.getUser().pipe(
            map((user) => user.name!),
            catchError(error => {
              console.error('Error getting username:', error);
              return throwError(() => new Error('Failed to get username'));
            })
        )
    }

    isProductReviewedByUser(productId:string){
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
        )
    }
}