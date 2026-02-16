import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, debounceTime, forkJoin, from, map, of, shareReplay, switchMap, tap } from "rxjs";
import { collection, collectionData, doc, Firestore, getDoc, query, updateDoc, where } from "@angular/fire/firestore";
import { ProductsService } from "./products.service";
import { CartProduct } from "../../features/cart/cart.product";
import { fireStoreCollections } from "../../../environments/environment";
import { Product } from "../../core/interfaces/product";
import { Buyer } from "../../features/auth/user";

@Injectable({
    providedIn: 'root'
})
export class CartService{

    fireStore = inject(Firestore);
    productService = inject(ProductsService);
    userCollectionRef = collection(this.fireStore,fireStoreCollections.users);
    productsCollectionRef = collection(this.fireStore,fireStoreCollections.products);
    totalCartPrice$ = new BehaviorSubject<number>(0);
    totalCartProductsNumber$ = new BehaviorSubject<number>(0);

    getAllCartProducts(){
        let user = collectionData(query(this.userCollectionRef,where('uid','==',localStorage.getItem('token')!)));
        return user.pipe(
            switchMap(users => {
              const user = users[0] as Buyer;
              
              if (!user || !user.cartProducts || user.cartProducts.length === 0) {
                return of([]); 
              }
              
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
                  let cartProductsNumber = 0;
                  products.forEach((product) => {
                    totalPrice += product.price * product.quantity;
                    cartProductsNumber += (product.quantity || 0);
                  });
                  this.totalCartProductsNumber$.next(cartProductsNumber);
                  this.totalCartPrice$.next(totalPrice);
                })
              );
            }),
            shareReplay({ bufferSize: 1, refCount: true }),
        );
    }

    async removeProductFromCart(id:string,price:number){
       const userRef = doc(this.fireStore,fireStoreCollections.users, localStorage.getItem('token')!);
       const snap = await getDoc(userRef);
       let quantiyToRemove = 0;
       const cartProducts = (snap.data()!['cartProducts'] as {quantity:number,id:string}[]).filter((item : {id:string,quantity:number}) => {
          if(item.id == id){
            quantiyToRemove = item.quantity;
          }
         return item.id != id;
       });
       await updateDoc(userRef, {cartProducts : cartProducts});
       this.totalCartProductsNumber$.next(
          this.totalCartProductsNumber$.value - quantiyToRemove
       );
       this.totalCartPrice$.next(
          this.totalCartPrice$.value - (price * quantiyToRemove)
       );
    }
    

    async addProductToCart(productId:string,price:number,name:string,numberOfItems?:number){   
      const userRef = doc(this.fireStore, fireStoreCollections.users, localStorage.getItem('token')!);
      const snap = await getDoc(userRef);
      const cartProducts : CartProduct[] = snap.data()!['cartProducts'] ?? [];
      console.log('cartProducts');
      
      let item = cartProducts.find(item => item.id == productId);
      if(item){
        this.updateProductNumberInCart(productId,item.quantity + (numberOfItems ?? 1),price);
      }else{
        cartProducts.push({id:productId,quantity: numberOfItems ?? 1,price:price,name : name});
        this.totalCartPrice$.next(this.totalCartPrice$.value + (price * (numberOfItems ?? 1)));
        this.totalCartProductsNumber$.next(this.totalCartProductsNumber$.value + (numberOfItems ?? 1));
      }
      let update = from(
        updateDoc(userRef, { cartProducts: cartProducts })
      ).pipe(
        debounceTime(300)
      ).subscribe(
        {
          next : (value) =>{
              update.unsubscribe();
          },
        }
      );
    }
    async updateProductNumberInCart(id:string,newQuantity:number,itemPrice:number){
      const userRef = doc(this.fireStore, fireStoreCollections.users, localStorage.getItem('token')!);
      const snap = await getDoc(userRef);
      let oldItemQuantity = 0;
      
      let cartProducts = snap.data()!['cartProducts'].map((item : {quantity:number,id:string}) =>
        {
          if(item.id == id){
            oldItemQuantity = item.quantity;
          }
          return item.id == id
            ? { ...item, quantity: newQuantity }
            : item;
        }
      );

      if(newQuantity != 0){
         if(oldItemQuantity > newQuantity){
            this.totalCartPrice$.next(this.totalCartPrice$.value - itemPrice);
            this.totalCartProductsNumber$.next(this.totalCartProductsNumber$.value - 1);
         }else if(oldItemQuantity < newQuantity){
            this.totalCartPrice$.next(this.totalCartPrice$.value + itemPrice);
            this.totalCartProductsNumber$.next(this.totalCartProductsNumber$.value + 1);
         }
      }else{
          this.totalCartPrice$.next(
            this.totalCartPrice$.value - (itemPrice * oldItemQuantity)
          );
          this.totalCartProductsNumber$.next(
            this.totalCartProductsNumber$.value - oldItemQuantity
          );
          cartProducts = cartProducts.filter((item : {id:string,quantity:number}) => item.id != id);
      }

      await updateDoc(userRef, { cartProducts: cartProducts });
    }


    getCartProduct(productId:string){
      return collectionData(query(this.productsCollectionRef,where('id','==',productId))).pipe(
         map((products) => {
          
          return products[0] as Product;
         })
      )
    }

    async clearCart(){
      const userRef = doc(this.fireStore, fireStoreCollections.users, localStorage.getItem('token')!);
      await updateDoc(userRef, { cartProducts: [] });
      this.totalCartPrice$.next(0);
      this.totalCartProductsNumber$.next(0);
    }
}