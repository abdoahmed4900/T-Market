import { computed, inject, Injectable, signal } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, GoogleAuthProvider, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, UserCredential } from '@angular/fire/auth';
import { collectionData, Firestore } from '@angular/fire/firestore';
import { collection, doc, query, setDoc, where } from 'firebase/firestore';
import { defer, from, Observable, switchMap, tap } from 'rxjs';
import { fireStoreCollections } from '../../../environments/environment';
import { CartProduct } from '../../features/cart/cart.product';
import { Order } from '../interfaces/order';
import { Admin, Buyer, Seller, User } from '../../features/auth/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
   isLoggedIn = signal<boolean>(false);
   isBuyer = computed(() => this.userRole()  == 'buyer');
   firebaseAuth = inject(Auth);
   userRole = signal('');
   firestore = inject(Firestore);
   userCollection = collection(this.firestore, fireStoreCollections.users);

   constructor(){
       console.log('🔵 AuthService: Constructor called');
       this.loadUserFromStorage();
   }

    private loadUserFromStorage() {
      this.userRole.set(localStorage.getItem('role')!);
      this.isLoggedIn.set(localStorage.getItem('isLogin')! == 'true' ? true : false);
    }

   loginWithEmailAndPassword(email: string, password: string) : Observable<UserCredential> {
      let res = () => signInWithEmailAndPassword(this.firebaseAuth,email,password);
      return defer(res);
   }

   async changeUserCredentials(email:string){
       collectionData(query(this.userCollection,where('email','==',email))).subscribe(
          {
            next : (value : any) => {
                this.userRole.set(value[0]['role']);
                this.isLoggedIn.set(true);
                localStorage.setItem('role',this.userRole())
                localStorage.setItem('token',value[0]['uid']);
                localStorage.setItem('isLogin','true')
            },
          }
        );
   }
   async addGoogleAccount(value: UserCredential){
      collectionData(this.userCollection).subscribe(async res => {
         let user = res.find((u) => u['email'] == value.user.email);
         if(!user){
           let newDoc = this.setNewGoogleAccountData(value);
           let userDoc = doc(this.firestore,fireStoreCollections.users,value.user.uid);
           await setDoc(userDoc,newDoc);
           localStorage.setItem('role','buyer')
           localStorage.setItem('token',value.user.uid)
           this.userRole.set('buyer');
         }else{
           this.userRole.set(user['role']);
           localStorage.setItem('token', user['uid']);
           localStorage.setItem('role', user['role']);
         }  
         this.isLoggedIn.set(true);
         localStorage.setItem('isLogin','true')
      });
   }

   private setNewGoogleAccountData(value: UserCredential) {
      return {
         uid: value.user.uid,
         email: value.user.email,
         name: value.user.displayName,
         createdAt: new Date(),
         cartProducts: [] as CartProduct[],
         orders: [] as Order[],
         wishListIds: [] as string[],
         role: 'buyer',
      };
   }


   register(email:string,password:string,name:string,role:string) {
      let res = () => createUserWithEmailAndPassword(this.firebaseAuth,email,password);
      return defer(res).pipe(
         switchMap((res) => {
            return from(this.setUserData(email,name,res,role))
         })
      );
   }

   resetPassword(email: string) {
    let res = () => sendPasswordResetEmail(this.firebaseAuth, email);
    return defer(res);
   }

   loginWithGoogle() {
      const provider = new GoogleAuthProvider();
      let res = () =>  signInWithPopup(this.firebaseAuth, provider);
      return defer(res);
   }

   setUserData(email:string,name:string,value:UserCredential,role:string) {
       let userData : User = {
           uid: value.user.uid,
           name: name,
           email: email,
           role: role.toLowerCase(),
           createdAt: new Date().toDateString(),
       };
   
       const roleHandlers = {
        buyer: { ...userData, cartProducts: [], ordersIds: [], wishListIds: [] } as Buyer,
        seller: { ...userData, ordersIds: [], productsIds: [], totalProductsSold: 0, totalRevenue: 0 } as Seller,
        admin: {...userData, ordersIds: [], productsIds: [], totalRevenue:0, totalOrders:0, totalProductsSold:0 } as Admin
       };
       userData = roleHandlers[userData.role as 'admin' | 'seller' | 'buyer'];
       return from(setDoc(doc(this.firestore, fireStoreCollections.users, value.user.uid), userData));
   }
   logout() {
      let res = () => this.firebaseAuth.signOut();
      return defer(res).pipe(
         tap(() => {
            this.isLoggedIn.set(false);
            this.userRole.set('');
            localStorage.clear();
         })
      );
   }
}
