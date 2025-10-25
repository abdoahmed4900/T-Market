import { Categories } from './../features/categories/categories';
import { inject, Injectable } from "@angular/core";
import { Product } from "../features/home/product";
import { BehaviorSubject, map, Observable, take } from "rxjs";
import {
    collection,
    collectionData,
    Firestore,
    query,
    QueryFieldFilterConstraint,
    where,
} from "@angular/fire/firestore";
import { fireStoreCollections } from "../environments/environment.prod";

@Injectable(
    {
        providedIn: 'root'
    }
)
export class ProductsService {

    products= new Observable<Product[]>();
    productsCollectionRef = collection(inject(Firestore),fireStoreCollections.products);
    categoriesCollectionRef = collection(inject(Firestore),fireStoreCollections.categories);
    productsData = collectionData(this.productsCollectionRef);
    categories!: string[];

    getAllProducts(): Observable<Product[]> {
    const q = query(this.productsCollectionRef);
    return collectionData(q, { idField: 'id' }) as Observable<Product[]>;
    }

    getProductById(id:string){
        let product! : Product;

        return product;
    }

    readAllCategories(){
        return collectionData(query(this.categoriesCollectionRef)).pipe(map(e => {
          let cats :string[] = Object.values(e[0]['Categories']);
          return cats;
        })) as Observable<string[]>;

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
