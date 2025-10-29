import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, forkJoin, map, Observable, of, shareReplay, switchMap, tap } from "rxjs";
import { Product } from "./product";
import { collection, collectionData, doc, Firestore, getDoc, query, updateDoc, where } from "@angular/fire/firestore";
import { fireStoreCollections } from "../../environments/environment.prod";
import { User } from "../features/auth/user";
import { ProductsService } from "./products.service";

@Injectable({
    providedIn: 'root'
})
export class CartService{

    cartProducts! : Observable<Product[]>
    fireStore = inject(Firestore);
    productService = inject(ProductsService);
    userCollectionRef = collection(this.fireStore,fireStoreCollections.users);
    productsCollectionRef = collection(this.fireStore,fireStoreCollections.products);
    totalCartPrice$ = new BehaviorSubject<number>(0);
    getAllCartProducts(){
        let user = collectionData(query(this.userCollectionRef,where('uid','==',localStorage.getItem('token')!)));
         this.totalCartPrice$.next(0);
        return user.pipe(
            switchMap(users => {
              const user = users[0] as User;
              
              if (!user || !user.cartProducts || user.cartProducts.length === 0) {
                return of([]); 
              }
              console.log('Cart IDs:', user?.cartProducts);
              const productStreams = user.cartProducts.map(p => {
                return this.productService.getProductById(p.id!).pipe(
                  map((product) => {
                    return ({
                      ...product,
                      quantity : p.quantity,
                    });
                  }),
                )
              });
              return forkJoin(productStreams).pipe(
                tap((products) => {
                  let totalPrice = 0;
                  products.forEach((product) => {
                    totalPrice += product.price * (product.quantity || 0);
                  });
                  this.totalCartPrice$.next(totalPrice);
                })
              );
            }),
            tap((res) => {console.log(res);
            }),
            shareReplay({ bufferSize: 1, refCount: true }),
        );
    }

    async removeProductFromCart(id:string){
       const userRef = doc(this.fireStore, 'users', localStorage.getItem('token')!);
       const snap = await getDoc(userRef);
       const cartProducts = snap.data()!['cartProducts'].filter((item : {id:string,quantity:number}) => item.id != id);
       await updateDoc(userRef, {cartProducts : cartProducts})
    }
    async addProductToCart(productId:string,price:number){
      const userRef = doc(this.fireStore, 'users', localStorage.getItem('token')!);
      const snap = await getDoc(userRef);
      const cartProducts : {quantity:number,id:string}[] = snap.data()!['cartProducts'];
      let item = cartProducts.find(item => item.id == productId);
      if(item){
        this.updateProductNumberInCart(productId,item.quantity + 1,price);
      }else{
        cartProducts.push({id:productId,quantity:1});
        this.totalCartPrice$.next(this.totalCartPrice$.value + price);
      }
      await updateDoc(userRef, { cartProducts: cartProducts });

    }
    async updateProductNumberInCart(id:string,newQuantity:number,itemPrice:number){
      const userRef = doc(this.fireStore, 'users', localStorage.getItem('token')!);
      const snap = await getDoc(userRef);
      let oldItemQuantity = 0;
      
      const cartProducts = snap.data()!['cartProducts'].map((item : {quantity:number,id:string}) =>
        {
          if(item.id == id){
            oldItemQuantity = item.quantity;
          }
          return item.id == id
            ? { ...item, quantity: newQuantity }
            : item;
        }
      );
      console.log(newQuantity);
      console.log(oldItemQuantity);
      
      if(oldItemQuantity > newQuantity){
          this.totalCartPrice$.next(this.totalCartPrice$.value - itemPrice);
      }else{
          this.totalCartPrice$.next(this.totalCartPrice$.value + itemPrice);
      }
      console.log(this.totalCartPrice$.value);
      
      await updateDoc(userRef, { cartProducts: cartProducts });
    }


    getCartProduct(productId:string){
      return collectionData(query(this.productsCollectionRef,where('id','==',productId))).pipe(
         map((products) => {
          
          return products[0] as Product;
         })
      )
    }
}