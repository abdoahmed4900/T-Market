import { ProductsService } from '../../../shared/services/products.service';
import { inject, Injectable } from "@angular/core";
import { OrderService } from "../../../shared/services/order.service";
import { from, map } from 'rxjs';
import { collection, collectionData, doc, Firestore, query, where } from '@angular/fire/firestore';
import { fireStoreCollections } from '../../../../environments/environment';
import { Admin, User } from '../../auth/user';
import { getDocs, limit, updateDoc } from 'firebase/firestore';

@Injectable(
    {
        providedIn: 'root'
    }
)
export class AdminService{
    ordersService = inject(OrderService);
    productsService = inject(ProductsService);
    fireStore = inject(Firestore);
    adminFirestore = inject(AdminFirestoreService);
    userCollectionRef = collection(this.fireStore,fireStoreCollections.users);
    categoriesCollectionRef = collection(this.fireStore,fireStoreCollections.categories);
    brandsCollectionRef = collection(this.fireStore,fireStoreCollections.brands);

    getAllOrders(){
        return this.ordersService.getAllOrders();
    }

    getAdmin(){
        const ref = collection(this.fireStore, fireStoreCollections.users);
        const q = query(ref, where('uid', '==', localStorage.getItem('token')));
        return collectionData(q).pipe(
            map((q) => {
                return q[0] as Admin;
            })
        );
    }

    getAllProducts(){
        return this.productsService.getAllProducts()
    }

    getNumberOfSoldProducts() {
    return this.adminFirestore
      .getAdminByUid(localStorage.getItem('token')!)
      .pipe(
        map((u) => (u[0] as Admin).totalProductsSold)
      );
  }

  getTotalRevenue() {
    return this.adminFirestore
      .getAdminByUid(localStorage.getItem('token')!)
      .pipe(
        map((u) => (u[0] as Admin).totalRevenue)
      );
  }

    getOrdersNumber() {
        return this.ordersService.getAllOrders().pipe(
            map((orders) => {
                return orders.length ?? 0;
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
            })
        )
    }

    async addNewCategory(category: string): Promise<string[]> {
        try {
              const q = query(
                this.categoriesCollectionRef,
                limit(1)
              );

              const snap = await getDocs(q);
    
              if (snap.empty) {
                throw new Error('No categories document found');
              }

              const docSnap = snap.docs[0];
              const data = docSnap.data();

              const cats: string[] = data['Categories'] ?? [];

              if(!Object.values(cats).includes(category)){
                  await updateDoc(docSnap.ref,{ Categories: [...Object.values(cats),category]})
              }
        
              return cats;
           } catch (error) {
              throw error;
           }
    }
    async addNewBrand(brand: string): Promise<string[]> {
        try {
              const q = query(
                this.categoriesCollectionRef,
                limit(1)
              );

              const snap = await getDocs(q);
    
              if (snap.empty) {
                throw new Error('No brand document found');
              }

              const docSnap = snap.docs[0];
              const data = docSnap.data();

              const brands: string[] = data['Brands'] ?? [];

              if(!Object.values(brands).includes(brand)){
                  await updateDoc(docSnap.ref,{ Brands: [...Object.values(brands),brand]})
              }
        
              return brands;
           } catch (error) {
              throw error;
           }
    }

    getUsers(){
        return collectionData(
            this.userCollectionRef
        ).pipe(
            map((u) => {
                let users = u as User[];
                return users.filter((u) => u.uid != localStorage.getItem('token')!);
            })
        )
    }

    makeUserAdmin(userId:string){
        return from(updateDoc(doc(this.fireStore,fireStoreCollections.users,userId),{ role: 'admin'}));
    }
}

@Injectable({ providedIn: 'root' })
export class AdminFirestoreService {
  constructor(private firestore: Firestore) {}

  getAdminByUid(uid: string) {
    const ref = collection(this.firestore, fireStoreCollections.users);
    const q = query(ref, where('uid', '==', uid));
    return collectionData(q);
  }
}