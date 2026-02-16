import { inject, Injectable } from '@angular/core';
import { ProductsService } from '../../shared/services/products.service';
import {
  arrayRemove,
  arrayUnion,
  collection,
  collectionData,
  doc,
  Firestore,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { fireStoreCollections } from '../../../environments/environment';
import { forkJoin, from, of, switchMap } from 'rxjs';
import { Buyer } from '../auth/user';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {

  productService = inject(ProductsService);
  firestore = inject(Firestore);
  usersCollection = collection(this.firestore,fireStoreCollections.users);
  user = collectionData(query(this.usersCollection,where('uid','==',localStorage.getItem('token'))));
  userRef = doc(this.firestore,fireStoreCollections.users,localStorage.getItem('token')!);

  getWishList(){
    return this.user.pipe(
      switchMap(u => {        
      
        let user = u[0] as Buyer;
        
        const ids = user.wishListIds ?? [];

        if (!ids.length) return of([]);
        let reqs = ids.map((id) => this.productService.getProductById(id).pipe((product) => product))
        return forkJoin(reqs);
      }) 
    )
  }

  async addToWishList(id:string){
    await updateDoc(this.userRef,{wishListIds: arrayUnion(id)})
  }


  async removeFromWishList(id:string){
    await updateDoc(this.userRef,{wishListIds: arrayRemove(id)})
  }

  clearAllWishList(){
    return this.user.pipe(
      switchMap(
        () => {
          return from(updateDoc(this.userRef,{wishListIds : []}))
        }
      )
    )
  }
}
