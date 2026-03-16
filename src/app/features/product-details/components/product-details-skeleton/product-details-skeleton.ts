import { Component } from '@angular/core';
import { StarSkeleton } from "../star-skeleton/star-skeleton";

@Component({
  selector: 'app-product-details-skeleton',
  imports: [StarSkeleton],
  templateUrl: './product-details-skeleton.html',
  styleUrl: './product-details-skeleton.scss',
})
export class ProductDetailsSkeleton {

}
