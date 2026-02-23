import { inject, Injectable, signal } from "@angular/core";
import {
   collection,
   collectionData,
   doc,
   docData,
   DocumentReference,
   Firestore,
   getDocs,
   query,
   updateDoc,
   where,
} from "@angular/fire/firestore";
import { fireStoreCollections } from "../../../environments/environment";
import {
   BehaviorSubject,
   catchError,
   forkJoin,
   from,
   map,
   Observable,
   of,
   switchMap,
   tap,
} from "rxjs";
import { Buyer, Seller } from "../../features/auth/user";
import { Order } from "../../core/interfaces/order";
import { Product } from "../../core/interfaces/product";
import { normalizeDate } from "../../core/utils";

@Injectable({providedIn: 'root'})
export class OrderService {
   fireStore = inject(Firestore);
   userCollectionRef = collection(this.fireStore,fireStoreCollections.users);
   productCollectionRef = collection(this.fireStore,fireStoreCollections.products);
   ordersCollectionRef = collection(this.fireStore,fireStoreCollections.orders);
   numberOfOrders = new BehaviorSubject<number>(0);
   selectedStatus = signal<string>('All');
   startDate= signal<string>('');
   endDate= signal<string>('');

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
            return ordersObs;
        }),
     )
   }

   private convertDate(o: Order) {
      let timestamp = JSON.parse(JSON.stringify(o.orderDate));
      const date = new Date(timestamp.seconds * 1000);

      const formatted = date.toLocaleDateString('en-US', {
         day: '2-digit',
         month: 'long',
         year: 'numeric'
      });

      return formatted;
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
      const docRef = doc(this.fireStore, fireStoreCollections.orders, orderId);
  
      return docData(docRef).pipe(
        switchMap((o) => {   
          let order = o as Order;
          if (newStatus === 'SHIPPED' || newStatus === 'CANCELLED') {
            this.updateProducts(order, newStatus);
          }
          return from(updateDoc(docRef, { status: newStatus }));
        }),
        tap(() => {
          console.log('✅ Status updated to:', newStatus);
        }),
        catchError(error => {
          console.error('❌ Error updating status:', error);
          throw error;
        })
      );
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
            return order;
         })
      )
   }

   isProductInPendingOrder(productId:string){
      return collectionData(query(this.ordersCollectionRef,where('status','==','PENDING'),where('sellerId','==',localStorage.getItem('token')))).pipe(
          map((o) => {
            let orders = o as Order[];            
            return orders.some(order => 
              order.items?.some(item => item.id == productId)
            );
          }),
          catchError(error => {
            console.error('Error checking product in orders:', error);
            return of(true); 
          })
      )
   }

   setStartDate(start:string){
      this.startDate.set(start ?? '');
   }
   setEndDate(end:string){
      this.endDate.set(end ?? '');
   }
   setStatus(status:string){
      this.selectedStatus.set(status ?? 'All');
   }

   filterProducts(){
      let orders = localStorage.getItem('role') == 'admin' ? this.getAllOrders() : this.getMyOrders();
      
      return orders.pipe(
         map((orders) => {
           if(this.selectedStatus() != 'All'){
             orders = orders.filter((order) => order.status == this.selectedStatus())
           }
           if(this.startDate() != ''){
             orders = orders.filter((order) => normalizeDate(new Date(this.startDate())) >= new Date(order.orderDate!))
           }
           if(this.endDate() != ''){
             orders = orders.filter((order) => normalizeDate(new Date(this.endDate())) <= new Date(order.orderDate!))
           }
           
           return orders;
         }),
         tap((orders) => {
            orders.map((o) => {
               console.log(this.convertDate(o));
               
            })
            
         })
        )
   }

   sortProducts(sortOption:string){
      return this.filterProducts().pipe(
         map((orders) => {
            if(sortOption == 'newest'){
               orders = orders.sort((a,b) => {
                  return Date.parse(b.orderDate!) - Date.parse(a.orderDate!) ;
               });
            }else if(sortOption == 'oldest'){
               orders = orders.sort((a,b) => {
                  return Date.parse(a.orderDate!) - Date.parse(b.orderDate!) ;
               });
            }else if(sortOption == 'price-high'){
               orders = orders.sort((a,b) => {
                  return b.totalPrice - a.totalPrice! ;
               });
            }else if(sortOption == 'price-low'){
               orders = orders.sort((a,b) => {
                  return a.totalPrice - b.totalPrice! ;
               });
            }
            return orders;
         })
      )
   }
}