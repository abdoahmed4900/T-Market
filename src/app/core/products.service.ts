import { inject, Injectable } from "@angular/core";
import { Product } from "../features/home/product";
import { BehaviorSubject, map, Observable } from "rxjs";
import {
    collection,
    collectionData,
    Firestore,
    query,
    QueryFieldFilterConstraint,
    where,
} from "@angular/fire/firestore";
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