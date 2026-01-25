import { inject, Injectable } from "@angular/core";
import { collection, collectionData, Firestore, query, where } from "@angular/fire/firestore";
import { fireStoreCollections } from "../../../environments/environment";
import { map, shareReplay } from "rxjs";
import { User } from "../auth/user";

@Injectable(
    {
        providedIn: 'root'
    }
)
export class HomeService{
    fireStore = inject(Firestore);

    getUser(){
        let usersRef = collection(this.fireStore,fireStoreCollections.users)
        let usersData = collectionData(query(usersRef,where('uid','==',localStorage.getItem('token'))));
        return usersData.pipe(
            map((users) => {
                return users[0] as User;
            }),
            shareReplay(1)
        )
    }
}