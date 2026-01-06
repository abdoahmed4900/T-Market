import { inject, Injectable } from "@angular/core";
import {
   collection,
   collectionData,
   doc,
   DocumentReference,
   Firestore,
   getDocs,
   query,
   updateDoc,
   where,
} from "@angular/fire/firestore";
import { fireStoreCollections } from "../../../environments/environment";
import { BehaviorSubject, from, map, switchMap, tap } from "rxjs";
import { Seller, User } from "../../features/auth/user";
import { ProductsService } from "./products.service";
import { Order } from "../interfaces/order";
import { Product } from "../interfaces/product";

@Injectable({providedIn: 'root'})
export class OrderService {
   fireStore = inject(Firestore);
   userCollectionRef = collection(this.fireStore,fireStoreCollections.users);
   productCollectionRef = collection(this.fireStore,fireStoreCollections.products);
   ordersCollectionRef = collection(this.fireStore,fireStoreCollections.orders);
   numberOfOrders = new BehaviorSubject<number>(0);
   productService = inject(ProductsService);

   getAllOrders() {
     this.numberOfOrders.next(0)
     let user = collectionData(query(this.userCollectionRef,where('uid','==',localStorage.getItem('token')!)));
     return user.pipe(
        map((users) => {
            let user = users[0] as User;
            this.numberOfOrders.next(user.orders!.length);
            return user.orders ?? [];
        })
     )
   }

   getOrdersByStatus(status:string){
      let user = collectionData(query(this.userCollectionRef,where('uid','==',localStorage.getItem('token')!)));
      return user.pipe(
         map((users) => {
            let user = users[0] as User;
            return user.orders?.filter((order) => order.status == status) ?? [];
         })
      )
   }

   changeStatusOrder(orderId:string,newStatus:"Pending" | "Shipped" | "Cancelled" | "Delivered"){
      let user = collectionData(query(this.userCollectionRef,where('uid','==',localStorage.getItem('token')!)));
      let order :Order;
      return user.pipe(
         switchMap((users) => {
            const user = users[0] as User;
            user.orders!.filter((o) => {
               if(o.id == orderId){
                  order = o;
                  o.status = newStatus;
               }
            }) 
            let userRef = doc(this.fireStore,fireStoreCollections.users,user.uid)
            console.log(userRef.id);
            
            return from(getDocs(query(this.ordersCollectionRef,where('id','==',order.id),))).pipe(
               switchMap(orders => {
                  let orderRef = orders.docs[0].ref;
                  return Promise.all(
                     [
                        updateDoc(orderRef,{status: newStatus}),
                        updateDoc(userRef,{orders:user.orders})
                     ]
                  )
               })
            )
         }),
         tap(() => {
            if (newStatus === 'Shipped' || newStatus === 'Cancelled') {
            this.updateProducts(order, newStatus);
            }
         })
      )
   }

   private async updateProducts(order: Order, newStatus: string) {
       await Promise.all(
    order.items.map(async (product) => {
      const productSnap = await getDocs(
        query(this.productCollectionRef, where('id', '==', product.id))
      );

      const productDocId = productSnap.docs[0].id;
      const productData = productSnap.docs[0].data() as Product;

      const updatedStock =
        newStatus === "Shipped"
          ? productData.stock - product.quantity
          : productData.stock + product.quantity;

      await updateDoc(
        doc(this.fireStore, fireStoreCollections.products, productDocId),
        { stock: updatedStock }
      );

      const sellersSnap = await getDocs(this.userCollectionRef);
      const sellerDoc = sellersSnap.docs.find(
        (d) => d.get("uid").toLowerCase() === productData.sellerId!.toLowerCase()
      );

      if (!sellerDoc) return;

      const seller = sellerDoc.data() as Seller;

      // avoid duplicate orders
      if (!seller.orders?.some((o) => o.id === order.id)) {
        seller.orders?.push(order);
      }

      const sellerRef = doc(
        this.fireStore,
        fireStoreCollections.users,
        sellerDoc.id
      );

      await this.updateSeller(
        seller,
        seller.totalProductsSold ?? 0,
        newStatus,
        product,
        sellerRef
      );
    })
  );
   }

   private async updateSeller(seller: Seller, totalProductsSold: number, newStatus: string, product: { price: number; name: string; quantity: number; id?: string; }, sellerRef:DocumentReference) {
      let totalRevenue = seller.totalRevenue ?? 0;
      seller.totalRevenue = totalRevenue;
      seller.totalProductsSold = totalProductsSold;
      totalProductsSold = newStatus == 'Shipped' ? totalProductsSold + product.quantity : totalProductsSold - product.quantity;
      totalRevenue = newStatus == 'Shipped' ? (totalRevenue + ((product.quantity * product.price) / 10)) : (totalRevenue - ((product.quantity * product.price) / 10));
      seller.totalRevenue = totalRevenue;
      seller.totalProductsSold = totalProductsSold;
      await updateDoc(sellerRef, { orders: seller.orders, totalProductsSold: totalProductsSold, totalRevenue: totalRevenue });
      return totalProductsSold;
   }

   getOrderById(id:string){
      let user = collectionData(query(this.userCollectionRef,where('uid','==',localStorage.getItem('token')!)));
      return user.pipe(
         map((users) => {
            let user = users[0] as User;
            return user.orders?.filter((order) => order.id == id).at(0)!;
         })
      )
   }
}