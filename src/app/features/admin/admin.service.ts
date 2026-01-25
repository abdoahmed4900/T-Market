import { ProductsService } from './../../core/services/products.service';
import { inject, Injectable } from "@angular/core";
import { OrderService } from "../../core/services/order.service";
import { map } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { collection, collectionData, Firestore, query, where } from '@angular/fire/firestore';
import { fireStoreCollections } from '../../../environments/environment';
import { Admin } from '../auth/user';
import { HomeService } from '../home-component/home.service';

@Injectable(
    {
        providedIn: 'root'
    }
)
export class AdminService{
    ordersService = inject(OrderService);
    productsService = inject(ProductsService);
    authService = inject(AuthService);
    homeService = inject(HomeService);
    fireStore = inject(Firestore);
    userCollectionRef = collection(this.fireStore,fireStoreCollections.users);

    getAllOrders(){
        return this.ordersService.getAllOrders();
    }

    getAdmin(){
        return this.homeService.getUser().pipe(
            map((u) => {
                return u as Admin;
            })
        );
    }

    getAllProducts(){
        return this.productsService.getAllProducts()
    }

    getNumberOfSoldProducts(){
        let usersCollection = collectionData(query(this.userCollectionRef,where('uid','==',localStorage.getItem('token'))))
        return usersCollection.pipe(
            map((u) => {
                let user = u[0] as Admin;
                return user.totalProductsSold;
            })
        )
    }
    getTotalRevenue(){
        let usersCollection = collectionData(query(this.userCollectionRef,where('uid','==',localStorage.getItem('token'))))
        return usersCollection.pipe(
            map((u) => {
                let user = u[0] as Admin;
                return user.totalRevenue;
            })
        )
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