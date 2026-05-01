import { FirebaseErrorService } from '../../core/services/firebase.error.service';
import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { cloudinary } from "../../../environments/environment";
import { catchError, throwError } from 'rxjs';

@Injectable(
  {
    providedIn: 'root'
  }
)
export class ImageService {
  private cloudName = cloudinary.cloudName;
  private uploadPreset = cloudinary.uploadPreset;
  http = inject(HttpClient);
  firebaseErrorService = inject(FirebaseErrorService);

  upload(file: File) {
    const form = new FormData();
    form.append('file', file);
    form.append('upload_preset', this.uploadPreset);

    return this.http.post(
      `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
      form
    ).pipe(
      catchError((error) => {
        this.firebaseErrorService.showError('Image upload failed. Please try again later.');
        return throwError(() => error);
      }),
    );
  }
}