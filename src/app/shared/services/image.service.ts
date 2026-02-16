import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { cloudinary } from "../../../environments/environment";

@Injectable(
    {
        providedIn: 'root'
    }
)
export class ImageService{
    private cloudName = cloudinary.cloudName;
    private uploadPreset = cloudinary.uploadPreset;

    http = inject(HttpClient);

    upload(file: File) {
      const form = new FormData();
      form.append('file', file);
      form.append('upload_preset', this.uploadPreset);

      return this.http.post(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
        form
      );
    }
}