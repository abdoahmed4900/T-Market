import { Component } from '@angular/core';
import { StarSkeleton } from "../../../product-details/components/star-skeleton/star-skeleton";

@Component({
  selector: 'app-product-card-skeleton',
  imports: [StarSkeleton],
  templateUrl: './product-card-skeleton.html',
  styleUrl: './product-card-skeleton.scss',
})
export class ProductCardSkeleton {

}
