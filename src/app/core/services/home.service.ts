import { inject, Injectable } from "@angular/core";
import { collection, collectionData, Firestore, query, where } from "@angular/fire/firestore";
import { fireStoreCollections } from "../../../environments/environment";
import { catchError, map, shareReplay, throwError } from "rxjs";
import { User } from "../../features/auth/user";
import { FirebaseErrorService } from "./firebase.error.service";

@Injectable(
    {
        providedIn: 'root'
    }
)
export class HomeService{
    fireStore = inject(Firestore);
    firebaseErrorService = inject(FirebaseErrorService);

    getUser(){
        let usersRef = collection(this.fireStore,fireStoreCollections.users)
        let usersData = collectionData(query(usersRef,where('uid','==',localStorage.getItem('token'))));
        return usersData.pipe(
            map((users) => {
                return users[0] as User;
            }),
            shareReplay(1),
            catchError((err) => {
                this.firebaseErrorService.handleError(err);
                return throwError(() => err);
            })
        )
    }
}