import { inject, Injectable } from "@angular/core";
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  from,
  map,
  Observable,
  of,
  switchMap,
  throwError,
} from "rxjs";
import { collection, collectionData, doc, Firestore, getDocs, query, where } from "@angular/fire/firestore";
import { fireStoreCollections } from '../../../environments/environment';
import { Product } from "../../core/interfaces/product";
import { runTransaction, updateDoc } from "firebase/firestore";
import { OrderService } from "./order.service";
import { Brand } from "../../features/brands/interfaces/brand";
import { FirebaseErrorService } from "../../core/services/firebase.error.service";
import { Seller } from "../../features/auth/user";

@Injectable(
  {
    providedIn: 'root'
  }
)
export class ProductsService {

  products = new Observable<Product[]>();
  firestore = inject(Firestore);
  usersCollectionRef = collection(this.firestore, fireStoreCollections.users);
  productsCollectionRef = collection(this.firestore, fireStoreCollections.products);
  categoriesCollectionRef = collection(this.firestore, fireStoreCollections.categories);
  brandsCollectionRef = collection(this.firestore, fireStoreCollections.brands);
  productsData = collectionData(this.productsCollectionRef);
  orderService = inject(OrderService);
  categoriesSubject = new BehaviorSubject<string[]>([]);
  categories$ = this.categoriesSubject.asObservable();
  brandsSubject = new BehaviorSubject<Brand[]>([]);
  brands$ = this.brandsSubject.asObservable();
  firebaseErrorService = inject(FirebaseErrorService);

  getAllProducts(): Observable<Product[]> {
    return collectionData(query(collection(this.firestore, fireStoreCollections.products))).pipe(
      map((products) => {
        return products as Product[];
      }),
      catchError((err) => {
        this.firebaseErrorService.handleError(err);
        return of([])
      }),
    );
  }
  getSellerProducts(id: string = ''): Observable<Product[]> {
    const q = query(this.productsCollectionRef, where('sellerId', '==', id == '' ? localStorage.getItem('token') : id));
    return collectionData(q, { idField: 'id' }).pipe(
      map((products) => {
        return products as Product[];
      }),
      catchError((err) => {
        this.firebaseErrorService.handleError(err);
        return of([])
      }),
    );
  }

  getProductById(id: string): Observable<Product> {
    const q = query(this.productsCollectionRef, where('id', '==', id));
    return from(getDocs(q)).pipe(
      map(snapshot => {
        if (snapshot.empty) {
          throwError(() => new Error(`Product ${id} not found`));
        }
        return snapshot.docs[0].data() as Product;
      }),
      catchError((err) => {
        this.firebaseErrorService.handleError(err);
        return throwError(() => err);
      }),
    );
  }
  getProductsByBrand(brand: string) {
    return collectionData(query(collection(this.firestore, fireStoreCollections.products), where('brand', '==', brand))).pipe(
      map(products => products as Product[]),
      catchError((err) => {
        this.firebaseErrorService.handleError(err);
        return of([])
      })
    );
  }
  getProductsNumberByBrand(brand: string) {
    return collectionData(query(collection(this.firestore, fireStoreCollections.products), where('brand', '==', brand))).pipe(
      map(products => {
        return products.length;
      }),
      catchError((err) => {
        this.firebaseErrorService.handleError(err);
        return of([])
      })
    );
  }

  readAllCategories() {
    return collectionData(query(this.categoriesCollectionRef)).pipe(map(e => {
      let cats: string[] = [];
      if (Array.isArray(e)) {
        cats = e.flatMap(item => item['Categories'] || []) as string[];
        this.categoriesSubject.next(cats);
        return cats;
      }
      return [];
    }), catchError((error) => {
      this.firebaseErrorService.handleError(error);
      return of([])
    }));
  }
  readAllBrands() {
    return collectionData(query(this.brandsCollectionRef)).pipe(map(e => {
      let brands = e as Brand[];
      this.brandsSubject.next(brands);
      return brands;
    }), catchError((err) => {
      this.firebaseErrorService.handleError(err);
      return of([])
    }),)
  }

  getProductsNumberByCategory(category: string) {
    return collectionData(query(this.productsCollectionRef, where('category', '==', category))).pipe(
      map((p) => {
        let products = p as Product[];
        return products.length;
      }),
      catchError((err) => {
        this.firebaseErrorService.handleError(err);
        return of([])
      }),
    )
  }

  isProductDeleted(id: string) {
    return this.getProductById(id).pipe(
      map((product) => {
        return product.isDeleted ?? false;
      }),
      catchError((err) => {
        this.firebaseErrorService.handleError(err);
        return of(false);
      }),
    )
  }

  filterAllProducts(searchTerm: string, minPrice: number, maxPrice: number, category?: string, rating?: any): Observable<Product[]> {
    return collectionData(query(this.productsCollectionRef)).pipe(
      debounceTime(300),
      map((p) => {
        let products = p as Product[];
        let filteredProducts = products;
        if (category != 'All') {
          filteredProducts = filteredProducts.filter((product) => product.category == category)
        }
        if (rating != 0) {
          filteredProducts = filteredProducts.filter((product) => product.rating <= rating)
        }
        if (minPrice) {
          filteredProducts = filteredProducts.filter((product) => product.price >= minPrice)
        }
        if (maxPrice) {
          filteredProducts = filteredProducts.filter((product) => product.price <= maxPrice)
        }
        if (searchTerm != '') {
          filteredProducts = filteredProducts.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))
        }
        return filteredProducts;
      }),
      catchError((err) => {
        this.firebaseErrorService.handleError(err);
        return of([]);
      }),
    );
  }

  updateProduct(id: string, newProduct: {
    name: string,
    price: number,
    stock: number,
    description: string,
    imageUrls: string[]
  }) {
    return from(getDocs(query(this.productsCollectionRef, where('id', '==', id)))).pipe(
      switchMap((docs) => {
        if (docs.empty) {
          throw new Error('Product not found');
        }
        let docRef = docs.docs[0].ref;
        return from(updateDoc(docRef,
          {
            name: newProduct.name,
            description: newProduct.description,
            price: newProduct.price,
            stock: newProduct.stock,
            imageUrls: newProduct.imageUrls
          }
        )
        ).pipe(
          catchError((err) => {
            this.firebaseErrorService.handleError(err);
            return throwError(() => err);
          })
        );
      })
    )
  }
  addNewProduct(p: Product) {
    const productsRef = collection(this.firestore, fireStoreCollections.products);
    const newDocRef = doc(productsRef);

    const newProduct = {
      ...p,
      id: newDocRef.id,
    };

    return from(runTransaction(this.firestore, async (transaction) => {
      transaction.set(newDocRef, newProduct);

      const brandQuery = query(
        this.brandsCollectionRef,
        where('brandName', '==', p.brand)
      );
      const brandSnapshot = await getDocs(brandQuery);

      if (brandSnapshot.empty) {
        throw new Error(`Brand "${p.brand}" not found`);
      }

      const brandDoc = brandSnapshot.docs[0];
      const brand = brandDoc.data() as Brand;

      const sellerQuery = query(
        this.usersCollectionRef,
        where('uid', '==', p.sellerId)
      );
      const sellerSnapshot = await getDocs(sellerQuery);

      if (sellerSnapshot.empty) {
        throw new Error(`Seller with ID "${p.sellerId}" not found`);
      }

      const sellerDoc = sellerSnapshot.docs[0];
      const seller = sellerDoc.data() as Seller;

      transaction.update(brandDoc.ref, {
        numberOfProducts: (brand.numberOfProducts || 0) + 1,
      });
      transaction.update(sellerDoc.ref, {
        productsIds: [...(seller.productsIds || []), newProduct.id!],
      });

      return newProduct;
    })).pipe(
      catchError((err) => {
        this.firebaseErrorService.handleError(err);
        return throwError(() => err);
      }),
    );
  }

  deleteOrUnDeleteProduct(productId: string): Observable<boolean> {
    return this.orderService.isProductInPendingOrder(productId).pipe(
      switchMap((isInOrders) => {
        if (isInOrders) {
          return of(false);
        }

        return from(runTransaction(this.firestore, async (transaction) => {
          const productRef = doc(this.firestore, fireStoreCollections.products, productId);
          const productDoc = await transaction.get(productRef);

          if (!productDoc.exists()) {
            throw new Error('Product not found');
          }

          let product = productDoc.data() as Product;

          transaction.update(productRef, {
            isDeleted: !product.isDeleted,
          });
          return true;
        }));
      }),
      catchError((err) => {
        this.firebaseErrorService.handleError(err);
        return of(false);
      })
    );
  }
}
