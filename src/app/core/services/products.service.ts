import { inject, Injectable } from "@angular/core";
import { from, map, Observable } from "rxjs";
import {
    collection,
    collectionData,
    Firestore,
    getDocs,
    query,
    QueryFieldFilterConstraint,
    where,
} from "@angular/fire/firestore";
import { fireStoreCollections } from '../../../environments/environment';
import { Product } from "../interfaces/product";

@Injectable(
    {
        providedIn: 'root'
    }
)
export class ProductsService {

    products= new Observable<Product[]>();
    productsCollectionRef = collection(inject(Firestore),fireStoreCollections.products);
    categoriesCollectionRef = collection(inject(Firestore),fireStoreCollections.categories);
    brandsCollectionRef = collection(inject(Firestore),fireStoreCollections.brands);
    productsData = collectionData(this.productsCollectionRef);
    categories!: string[];

    getAllProducts(): Observable<Product[]> {
    const q = query(this.productsCollectionRef);
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

    readAllCategories(){
        return collectionData(query(this.categoriesCollectionRef)).pipe(map(e => {
          let cats :string[] = Object.values(e[0]['Categories']);
          return cats;
        })) as Observable<string[]>;

    }
    readAllBrands(){
        return collectionData(query(this.brandsCollectionRef)).pipe(map(e => {
          let brands :string[] = Object.values(e[0]['Brands']);
          return brands;
        })) as Observable<string[]>;

    }

    filterAllProducts(searchTerm:string,minPrice:number,maxPrice:number,category?:string,rating?:any) : Observable<Product[]>{

        let constraints : QueryFieldFilterConstraint[] = [
        where('price','>=',minPrice),
        where('price','<=',maxPrice),
        where('rating','>=',rating == 0 || rating == 5 || rating == 'All' ? 0 : Math.floor(rating!))
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
