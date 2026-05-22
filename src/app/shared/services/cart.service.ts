import { CartProduct } from './../../features/cart/cart.product';
import { FirebaseErrorService } from '../../core/services/firebase.error.service';
import { inject, Injectable } from "@angular/core";
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
  throwError,
} from "rxjs";
import { collection, collectionData, doc, Firestore, query, where } from "@angular/fire/firestore";
import { ProductsService } from "./products.service";
import { fireStoreCollections } from "../../../environments/environment";
import { Buyer } from "../../features/auth/user";
import { runTransaction } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  fireStore = inject(Firestore);
  firebaseErrorService = inject(FirebaseErrorService);
  productService = inject(ProductsService);
  userCollectionRef = collection(this.fireStore, fireStoreCollections.users);
  productsCollectionRef = collection(this.fireStore, fireStoreCollections.products);
  totalCartPrice$ = new BehaviorSubject<number>(0);
  totalCartProductsNumber$ = new BehaviorSubject<number>(0);
  private productsSubject = new BehaviorSubject<CartProduct[]>([]);
  products$ = this.productsSubject.asObservable();

  getAllCartProducts() {
    return collectionData(query(this.userCollectionRef, where('uid', '==', localStorage.getItem('token')!))).pipe(
      map(users => {
        const user = users[0] as Buyer;
        this.productsSubject.next(user.cartProducts ?? []);
        return user.cartProducts ?? [] as CartProduct[];
      }),
      tap((products) => {
        this.totalCartProductsNumber$.next(this.calculateCartQuantity(products!));
        this.totalCartPrice$.next(this.calculateCartPrice(products!))
      }),
      catchError((error) => {
        this.firebaseErrorService.handleError(error);
        return of([]);
      })
    );
  }

  // cart.service.ts
  verifyProductsSnapshot(): Observable<CartProduct[]> {
    return this.getAllCartProducts().pipe(
      switchMap(products => {
        if (products.length === 0) return of([]);

        const verificationStreams = products.map(product =>
          this.productService.getProductById(product.id).pipe(
            map(currentProduct => {
              if (!currentProduct) return product;


              return {
                ...product,
                name: currentProduct.name || product.name,
                price: currentProduct.price ?? product.price,
                isDeleted: currentProduct.isDeleted ?? false
              };
            }),
            catchError((err) => {
              this.firebaseErrorService.handleError(err)
              return of(product);
            })
          )
        );

        return forkJoin(verificationStreams);
      }),
      tap(verifiedProducts => {
        this.productsSubject.next(verifiedProducts ?? []);
        this.totalCartProductsNumber$.next(this.calculateCartQuantity(verifiedProducts));
        this.totalCartPrice$.next(this.calculateCartPrice(verifiedProducts));
      }),
      catchError((err) => {
        this.firebaseErrorService.handleError(err);
        return throwError(() => err);
      })
    );
  }
  calculateCartPrice(products: CartProduct[]): number {
    return products.reduce((total, product) => {
      return product.isDeleted ? total : total + (product.price * product.quantity);
    }, 0);
  }

  calculateCartQuantity(products: CartProduct[]): number {
    return products.reduce((total, product) => {
      return product.isDeleted ? total : total + product.quantity;
    }, 0);
  }

  removeProductFromCart(id: string, price: number) {
    // Store old values for rollback
    const oldPrice = this.totalCartPrice$.value;
    const oldCount = this.totalCartProductsNumber$.value;

    return from(runTransaction(this.fireStore, async (transaction) => {
      const userRef = doc(this.fireStore, fireStoreCollections.users, localStorage.getItem('token')!);
      const snap = await transaction.get(userRef);
      let quantityToRemove = 0;
      const cartProducts = (snap.data()!['cartProducts'] as { quantity: number, id: string }[]).filter((item: { id: string, quantity: number }) => {
        if (item.id == id) {
          quantityToRemove = item.quantity;
        }
        return item.id != id;
      });
      await transaction.update(userRef, { cartProducts: cartProducts });
      this.totalCartPrice$.next(oldPrice - (price * quantityToRemove));
      this.totalCartProductsNumber$.next(oldCount - quantityToRemove);
      this.products$ = this.products$.pipe(
        map((cartProducts) => {
          return cartProducts.filter((product) => product.id != id);
        })
      )
    })).pipe(
      catchError((error) => {
        this.totalCartPrice$.next(oldPrice);
        this.totalCartProductsNumber$.next(oldCount);
        this.firebaseErrorService.handleError(error);
        return throwError(() => error);
      })
    );
  }


  addProductToCart(productId: string, price: number, name: string, numberOfItems?: number) {
    return from(runTransaction(this.fireStore, async (transaction) => {
      const userRef = doc(this.fireStore, fireStoreCollections.users, localStorage.getItem('token')!);
      const snap = await transaction.get(userRef);
      const user = snap.data() as Buyer;
      const cartProducts: CartProduct[] = user.cartProducts ?? [];
      let item = cartProducts.find(item => item.id == productId);
      if (item) {
        item.quantity += (numberOfItems ?? 1);
        this.totalCartPrice$.next(this.totalCartPrice$.value + (price * (numberOfItems ?? 1)));
        this.totalCartProductsNumber$.next(this.totalCartProductsNumber$.value + (numberOfItems ?? 1));
      } else {
        cartProducts.push({ id: productId, quantity: numberOfItems ?? 1, price: price, name: name, isDeleted: false });
        this.totalCartPrice$.next(this.totalCartPrice$.value + (price * (numberOfItems ?? 1)));
        this.totalCartProductsNumber$.next(this.totalCartProductsNumber$.value + (numberOfItems ?? 1));
      }
      transaction.update(userRef, { cartProducts: cartProducts });
    })).pipe(catchError((error) => {
      this.firebaseErrorService.handleError(error);
      return throwError(() => error);
    }));
  }
  updateProductNumberInCart(id: string, newQuantity: number, itemPrice: number) {
    return from(runTransaction(this.fireStore, async (transaction) => {
      const userRef = doc(this.fireStore, fireStoreCollections.users, localStorage.getItem('token')!);
      const snap = await transaction.get(userRef);

      let oldItemQuantity = 0;

      let products = snap.data()!['cartProducts'] as { quantity: number, id: string }[] ?? []

      let cartProducts = products.map((item: { quantity: number, id: string }) => {
        if (item.id == id) {
          oldItemQuantity = item.quantity;
        }
        return item.id == id
          ? { ...item, quantity: newQuantity }
          : item;

      });

      cartProducts = this.filterProductsByQuantity(newQuantity, oldItemQuantity, itemPrice, cartProducts, id);

      await transaction.update(userRef, { cartProducts: cartProducts });
    }
    )).pipe(
      catchError((error) => {
        this.firebaseErrorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  private filterProductsByQuantity(newQuantity: number, oldItemQuantity: number, itemPrice: number, cartProducts: { quantity: number; id: string; }[], id: string) {
    if (newQuantity != 0) {
      if (oldItemQuantity > newQuantity) {
        this.totalCartPrice$.next(this.totalCartPrice$.value - itemPrice);
        this.totalCartProductsNumber$.next(this.totalCartProductsNumber$.value - 1);
      } else if (oldItemQuantity < newQuantity) {
        this.totalCartPrice$.next(this.totalCartPrice$.value + itemPrice);
        this.totalCartProductsNumber$.next(this.totalCartProductsNumber$.value + 1);
      }
    } else {
      this.totalCartPrice$.next(
        this.totalCartPrice$.value - (itemPrice * oldItemQuantity)
      );
      this.totalCartProductsNumber$.next(
        this.totalCartProductsNumber$.value - oldItemQuantity
      );
      cartProducts = cartProducts.filter((item: { id: string; quantity: number; }) => item.id != id);
    }
    return cartProducts;
  }

  clearCart() {
    this.totalCartPrice$.next(0);
    this.totalCartProductsNumber$.next(0);
  }
}