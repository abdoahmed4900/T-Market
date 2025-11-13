import { inject, Injectable } from "@angular/core";
import { collection, collectionData, doc, Firestore, query, updateDoc, where } from "@angular/fire/firestore";
import { fireStoreCollections } from "../../../environments/environment";
import { BehaviorSubject, map } from "rxjs";
import { User } from "../../features/auth/user";

@Injectable({providedIn: 'root'})
export class OrderService {
   fireStore = inject(Firestore);
   userCollectionRef = collection(this.fireStore,fireStoreCollections.users);
   numberOfOrders = new BehaviorSubject<number>(0);

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
      return user.pipe(
         map(async (users) => {
            const user = users[0] as User;
            user.orders!.filter((o) => {
               if(o.id == orderId){
                  o.status = newStatus;
               }
            })
            let userRef = doc(this.fireStore,fireStoreCollections.users,localStorage.getItem('token')!)
            await updateDoc(userRef,{orders: user.orders})
            
         })
      )
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