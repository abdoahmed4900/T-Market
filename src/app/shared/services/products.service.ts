import { inject, Injectable } from "@angular/core";
import { catchError, debounceTime, from, map, Observable, of, switchMap } from "rxjs";
import { collection, collectionData, doc, Firestore, getDocs, query, where } from "@angular/fire/firestore";
import { fireStoreCollections } from '../../../environments/environment';
import { Product } from "../../core/interfaces/product";
import { runTransaction, updateDoc } from "firebase/firestore";
import { OrderService } from "./order.service";
import { Brand } from "../../features/brands/interfaces/brand";

@Injectable(
    {
        providedIn: 'root'
    }
)
export class ProductsService {

    products= new Observable<Product[]>();
    firestore = inject(Firestore);
    productsCollectionRef = collection(this.firestore,fireStoreCollections.products);
    categoriesCollectionRef = collection(this.firestore,fireStoreCollections.categories);
    brandsCollectionRef = collection(this.firestore,fireStoreCollections.brands);
    productsData = collectionData(this.productsCollectionRef);
    orderService = inject(OrderService);
    categories!: string[];

    getAllProducts(): Observable<Product[]> {
    const q = query(this.productsCollectionRef);
    return collectionData(q, { idField: 'id' }) as Observable<Product[]>;
    }
    getSellerProducts(): Observable<Product[]> {
      const q = query(this.productsCollectionRef,where('sellerId','==',localStorage.getItem('token')));
      return collectionData(q, { idField: 'id' }) as Observable<Product[]>;
    }

    getProductById(id:string){
        const q = query(this.productsCollectionRef, where('id', '==', id));
        return from(getDocs(q)).pipe<Product>(
          map(snapshot => {
          if (snapshot.empty) return null as any;
            return snapshot.docs[0].data() as Product;
          })
        );
    }
    getProductsByBrand(brand:string){
        const q = query(this.productsCollectionRef, where('brand', '==', brand));
        return collectionData(q).pipe(
            map((p) => {
                let products = p as Product[];
                return products;
            })
        )
    }

    readAllCategories(){
        return collectionData(query(this.categoriesCollectionRef)).pipe(map(e => {
          let cats :string[] = Object.values(e[0]['Categories']);
          return cats;
        }));
    }
    readAllBrands(){
        return collectionData(query(this.brandsCollectionRef)).pipe(map(e => {
          let brands = e as Brand[];
          return brands;
        }))
    }

    filterAllProducts(searchTerm:string,minPrice:number,maxPrice:number,category?:string,rating?:any) : Observable<Product[]>{    
       return this.getAllProducts().pipe(
          debounceTime(400),
          map((products) => {
              let filteredProducts = products;
              if(category != 'All'){
                filteredProducts = filteredProducts.filter((product) => product.category == category)
              }
              if(rating != 0){
                filteredProducts = filteredProducts.filter((product) => product.rating <= rating)
              }
              if(minPrice){
                filteredProducts = filteredProducts.filter((product) => product.price >= minPrice)
              }
              if(maxPrice){
                filteredProducts = filteredProducts.filter((product) => product.price <= maxPrice)
              }
              if(searchTerm != ''){
                filteredProducts = filteredProducts.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))  
              }
              return filteredProducts;
          })
       );
    }

    async updateProduct(id:string,newProduct: {
        name: string,
        price: number,
        stock: number,
        description: string,
        imageUrls: string[]
      }){
        let q = query(this.productsCollectionRef,where('id','==',id));
        let docs = await getDocs(q);
        let docRef = docs.docs[0].ref;
        console.log(newProduct);  
        console.log(id);  
        console.log(docRef);  
        await updateDoc(docRef,
            {
                name: newProduct.name, 
                description: newProduct.description, 
                price: newProduct.price, 
                stock: newProduct.stock,
                imageUrls: newProduct.imageUrls
            }
        );
    }
    addNewProduct(p: Product){
       const productsRef = collection(this.firestore, fireStoreCollections.products);
       const newDocRef = doc(productsRef);
  
       const newProduct = {
         id: newDocRef.id,
         ...p,
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
           
           transaction.update(brandDoc.ref, {
             numberOfProducts: (brand.numberOfProducts || 0) + 1,
           });
         
           return newProduct;
      }));
    }

    deleteProduct(productId: string): Observable<boolean> {
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
        
            const product = productDoc.data() as Product;
        
            const brandQuery = query(
              collection(this.firestore, fireStoreCollections.brands),
              where('brandName', '==', product.brand)
            );
            const brandSnapshot = await getDocs(brandQuery);
        
            if (!brandSnapshot.empty) {
              const brandDoc = brandSnapshot.docs[0];
              const brand = brandDoc.data() as Brand;
              const newCount = Math.max(0, (brand.numberOfProducts || 0) - 1);
          
              transaction.update(brandDoc.ref, {
                numberOfProducts: newCount,
              });
            }
            transaction.delete(productRef);
            return true;
         }));
      }),
      catchError((error) => {
        console.error('Error deleting product:', error);
        return of(false);
      })
    );
  }
}
