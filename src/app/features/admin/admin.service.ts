import { ProductsService } from './../../core/services/products.service';
import { inject, Injectable } from "@angular/core";
import { OrderService } from "../../core/services/order.service";
import { map } from 'rxjs';
import { collection, collectionData, Firestore, query, where } from '@angular/fire/firestore';
import { fireStoreCollections } from '../../../environments/environment';
import { Admin } from '../auth/user';

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
    getOrdersNumberByStatus(status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled') {
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