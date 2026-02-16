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
import { BehaviorSubject, forkJoin, from, map, Observable, of, switchMap, tap } from "rxjs";
import { Buyer, Seller } from "../../features/auth/user";
import { Order } from "../../core/interfaces/order";
import { Product } from "../../core/interfaces/product";

@Injectable({providedIn: 'root'})
export class OrderService {
   fireStore = inject(Firestore);
   userCollectionRef = collection(this.fireStore,fireStoreCollections.users);
   productCollectionRef = collection(this.fireStore,fireStoreCollections.products);
   ordersCollectionRef = collection(this.fireStore,fireStoreCollections.orders);
   numberOfOrders = new BehaviorSubject<number>(0);

   getAllOrders(){
      let ordersCollection  = collectionData(query(this.ordersCollectionRef));
      return ordersCollection.pipe(
         map((orders) => {
            let o = orders as Order[];
            return o ?? [];
         })
      );
   }

   getMyOrders() {
     console.log('your irders methods');
     
     this.numberOfOrders.next(0)
     let user = collectionData(query(this.userCollectionRef,where('uid','==',localStorage.getItem('token')!)));
     return user.pipe(
        switchMap((users) => {
            let ordersObs! : Observable<Order[]>;
            let user = users[0] as Buyer; 
            this.numberOfOrders.next(user.ordersIds.length);
            if (!user.ordersIds?.length) {
              return of([]);
            }
            let orderReqs : Observable<Order>[] = user.ordersIds.map((id) => this.getOrderById(id));
            ordersObs = forkJoin(
              orderReqs
            ) 
            return ordersObs.pipe(
               map((orders) => {
                  console.log(`orders are : ${orders}`);
                  orders.map((o) => {
                     console.log(`o is ${JSON.stringify(o)}`);
                     
                  })
                 return orders; 
               })
            )
        }),
     )
   }

   getOrdersByStatus(status:string){
      let ordersCollection = collectionData(query(this.ordersCollectionRef));
      return ordersCollection.pipe(
         map((orders) => {
            let x = orders as Order[]
            return x?.filter((order) => order.status == status) ?? [];
         })
      )
   }

   changeStatusOrder(orderId:string,newStatus:"PENDING" | "SHIPPED" | "CANCELLED" | "DELIVERED"){
      let ordersCollection = collectionData(query(this.ordersCollectionRef,where('id','==',orderId)));
      let order :Order;
      return ordersCollection.pipe(
         switchMap(async (orders) => {
            order = orders[0] as Order;
            order.status = newStatus;
            return from(getDocs(query(this.ordersCollectionRef,where('id','==',order.id),))).pipe(
               switchMap(orders => {
                  let orderRef = orders.docs[0].ref;
                  return Promise.all(
                     [
                        updateDoc(orderRef,{status: newStatus}),
                     ]
                  )
               })
            )
         }),
         tap(() => {
            if (newStatus === 'SHIPPED' || newStatus === 'CANCELLED') {
            this.updateProducts(order, newStatus);
            }
         })
      )
   }

   private updateProducts(order: Order, newStatus: string) {
        return from(
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
      totalRevenue = newStatus == 'Shipped' ? (totalRevenue + ((product.quantity * product.price) * 0.9)) : (totalRevenue - ((product.quantity * product.price) * 0.9));
      seller.totalRevenue = totalRevenue;
      seller.totalProductsSold = totalProductsSold;
      await updateDoc(sellerRef, { totalProductsSold: totalProductsSold, totalRevenue: totalRevenue });
      return totalProductsSold;
   }

   getOrderById(id:string){
      return from(
         getDocs(
            query(this.ordersCollectionRef,where('id','==',id))
         )
      ).pipe(
         map((orders) => {
            let order = orders.docs[0].data() as Order;
            console.log(order);
            
            return order;
         })
      )
   }
}