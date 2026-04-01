import { inject, Injectable } from "@angular/core";
import { collectionData, Firestore } from "@angular/fire/firestore";
import { addDoc, collection } from "firebase/firestore";
import { fireStoreCollections } from "../../../../environments/environment";
import { from, map } from "rxjs";
import { Support } from "../interfaces/support";

@Injectable(
    {
        providedIn: 'root'
    }
)
export class SupportService{
    firestore = inject(Firestore);

    supportCollectionRef = collection(this.firestore,fireStoreCollections.support);

    addSupport(support:Support){
        return from(
            addDoc(this.supportCollectionRef,{...support})
        )
    }
    
    readAllSupports(){
        return collectionData(this.supportCollectionRef).pipe(
            map((s) => {
                let supports = s as Support[];
                return supports;
            })
        )
    }
}