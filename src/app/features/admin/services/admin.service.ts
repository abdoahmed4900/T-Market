import { ProductsService } from '../../../shared/services/products.service';
import { inject, Injectable } from "@angular/core";
import { OrderService } from "../../../shared/services/order.service";
import { catchError, from, map, of, switchMap } from 'rxjs';
import { collection, collectionData, doc, Firestore, query, where } from '@angular/fire/firestore';
import { fireStoreCollections } from '../../../../environments/environment';
import { Admin, User } from '../../auth/user';
import { getDocs, limit, setDoc, updateDoc } from 'firebase/firestore';
import { FirebaseErrorService } from '../../../core/services/firebase.error.service';

@Injectable(
    {
        providedIn: 'root'
    }
)
export class AdminService{
    ordersService = inject(OrderService);
    productsService = inject(ProductsService);
    fireStore = inject(Firestore);
    firebaseErrorService = inject(FirebaseErrorService);
    userCollectionRef = collection(this.fireStore,fireStoreCollections.users);
    categoriesCollectionRef = collection(this.fireStore,fireStoreCollections.categories);
    brandsCollectionRef = collection(this.fireStore,fireStoreCollections.brands);

    getAllOrders(){
        return this.ordersService.getAllOrders();
    }
    getAllProducts(){
        return this.productsService.getAllProducts()
    }

    getNumberOfSoldProducts() {
      return collectionData(query(collection(this.fireStore, fireStoreCollections.users), where('uid', '==', localStorage.getItem('token')!)))
      .pipe(
        map((u) => (u[0] as Admin).totalProductsSold),
        catchError((error) => {          
          this.firebaseErrorService.handleError(error);
          return of(0);
        })
      );
  }

  getTotalRevenue() {
    return collectionData(query(collection(this.fireStore, fireStoreCollections.users), where('uid', '==', localStorage.getItem('token')!)))
      .pipe(
        map((u) => (u[0] as Admin).totalRevenue),
        catchError((error) => {          this.firebaseErrorService.handleError(error);
          return of(0); // Return a default value in case of error
        })
      );
  }

    getOrdersNumber() {
        return this.ordersService.getAllOrders().pipe(
            map((orders) => {
                return orders.length ?? 0;
            }),
            catchError((error) => {          
                this.firebaseErrorService.handleError(error);
                return of(0);
            })
        )
    }
    getOrdersNumberByStatus(status: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED') {
        return this.ordersService.getAllOrders().pipe(
            map((orders) => {
                let numberOfOrders = 0;
                orders.map((order) => {
                    if(order.status == status){
                        numberOfOrders += 1;
                    }
                })
                return numberOfOrders;
            }),
            catchError((error) => {          
              this.firebaseErrorService.handleError(error);
               return of(0);
            })
        )
    }

    addNewCategory(category: string) {
        return from(getDocs(query(
            this.categoriesCollectionRef,
               limit(1)
        ))).pipe(
        switchMap((snap) => {
            if (snap.empty) {
               throw new Error('No categories document found');
            }

            const docSnap = snap.docs[0];
            const data = docSnap.data();

            const cats: string[] = data['Categories'] ?? [];

            let categoryExists = Object.values(cats).includes(category);

            if(!categoryExists){
                return from(updateDoc(docSnap.ref,{ Categories: [...Object.values(cats),category]}))
            }

            return from(Promise.resolve())
          }),catchError((error) => {
            this.firebaseErrorService.handleError(error);
            throw error;
          })
        )
    }
    addNewBrand(brand: string){
       const brandsRef = collection(this.fireStore, fireStoreCollections.brands);
       const newDocRef = doc(brandsRef);
  
       const newBrand = {
         brandId: newDocRef.id,
         brandName: brand,
         productsName: 0,
       };
  
       return from(setDoc(newDocRef, newBrand)).pipe(
         catchError((error) => {
           this.firebaseErrorService.handleError(error);
           throw error;
         })
       );
    }

    getUsers(){
        return collectionData(
            this.userCollectionRef
        ).pipe(
            map((u) => {
                let users = u as User[];
                
                return users.filter((u) => {
                    return u.uid != localStorage.getItem('token')!;
                });
            }),
            catchError((error) => {                
                this.firebaseErrorService.handleError(error);
                return of([]);
            })
        )
    }

    makeUserAdmin(userId:string){
        return from(updateDoc(doc(this.fireStore,fireStoreCollections.users,userId),{ role: 'admin'})).pipe(
            catchError((error) => {
                this.firebaseErrorService.handleError(error);
                throw error;
            })
        );
    }
}