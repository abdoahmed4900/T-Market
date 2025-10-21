import { inject, Injectable } from "@angular/core";
import { Product } from "../features/home/product";
import { BehaviorSubject, map, Observable } from "rxjs";
import { collection, collectionData, Firestore, Query, query, QueryFieldFilterConstraint, where } from "@angular/fire/firestore";
import { fireStoreCollections } from "../../environments/environment";

@Injectable(
    {
        providedIn: 'root'
    }
)
export class ProductsService {

    productsSubject = new BehaviorSubject<Product[]>([]);
    products = this.productsSubject.asObservable();
    productsCollectionRef = collection(inject(Firestore),fireStoreCollections.products);
    categoriesCollectionRef = collection(inject(Firestore),fireStoreCollections.categories);
    productsData = collectionData(this.productsCollectionRef);
    categories!: string[];
    constructor(){
        this.getAllProducts().subscribe(
            {
                next : (value) => {
                    this.productsSubject.next(value);
                },
                error: (err) => {
                    this.productsSubject.next([]);
                    console.log(err);
                }
            }
        );
        this.readAllCategories().subscribe(
            {
                next : (value) => {
                    let l = value[0]['Categories'];
                    this.categories = Object.values(l);
                },
                error : (err) => {
                    console.log(err);
                    this.categories = [];
                },
            }
        );
    }

    getAllProducts(): Observable<Product[]> {
    const q = query(this.productsCollectionRef);
    return collectionData(q, { idField: 'id' }) as Observable<Product[]>;
    }

    getProductsByCategory(category: string) {
        return collectionData(
            query(this.productsCollectionRef, 
               where('category','==',category || category.toLowerCase())
            )
        ) as Observable<Product[]>;
    }

    getProductsByBrand(brand: string) {
        return collectionData(
           query(this.productsCollectionRef,where('brand','==',brand))
        ) as Observable<Product[]>;
    }

    getProductByRating(rating: number){
        return collectionData(query(this.productsCollectionRef,where('rating','<=',Math.floor(rating)))) as Observable<Product[]>
    }

    getProductsBySearchTerm(searchTerm: string) {
        return new Observable<Product[]>(
            (observer) => {
                this.products.subscribe({
                    next: (products) => {
                        const filteredProducts = products.filter(product => 
                            product.name.toLowerCase().includes(searchTerm.toLowerCase())
                        );
                        observer.next(filteredProducts);    
                    },
                    error: (error) => observer.error(error)
                })
            }
        );
    }

    getProductById(id:string){
        let product! : Product;
        this.productsSubject.value.forEach(element => {
             if(element.id == id){
                product = element;
             }
        });
        return product;
    }

    readAllCategories(){
        return collectionData(query(this.categoriesCollectionRef));
    }

    filterByPrice(minPrice?:number,maxPrice?:number){
       let q : Query;

       if(!minPrice && !maxPrice){
          return this.getAllProducts();
       }

       if(minPrice){
          q = query(
          this.productsCollectionRef,
          where('price', '>=', minPrice),
          );
       }
       if(maxPrice){
          q = query(
          this.productsCollectionRef,
          where('price', '<=', maxPrice),
          );
       }
       return collectionData(q!,{idField: 'id'}) as Observable<Product[]>
    }


    filterAllProducts(searchTerm:string,minPrice:number,maxPrice:number,category?:string,rating?:any) : Observable<Product[]>{

        let constraints : QueryFieldFilterConstraint[] = [
        where('price','>=',minPrice),
        where('price','<=',maxPrice),
        where('rating','<=',rating == 0 || rating == 5 ? 5 : Math.floor(rating!))
       ];
       
       if(category != 'All'){
        constraints.push(where('category','==',category))
       }
    
       console.log(searchTerm);
       
       let q = query(this.productsCollectionRef,...constraints);
          
       let x = collectionData(q) as Observable<Product[]>;

       if(searchTerm != ''){
        x = x.pipe(map((e) => e.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))))
       }

       return x;
    }
    
}