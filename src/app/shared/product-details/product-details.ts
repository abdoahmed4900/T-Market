import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductsService } from '../../core/products.service';
import { Product } from '../../features/home/product';
import { CommonModule } from '@angular/common';
import { Loader } from "../loader/loader";
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-details',
  imports: [CommonModule, Loader, FaIconComponent,ReactiveFormsModule],
  templateUrl: './product-details.html',
  styleUrl: './product-details.scss'
})
export class ProductDetails {

  route = inject(ActivatedRoute);

  productsService = inject(ProductsService);

  product!: Product;

  cartNumber = 0;

  root = document.getElementsByTagName('html')[0];

  id = '';
  
  starIcon = faStar;

  currentImageIndex = 0;
  ngOnInit(){
    this.route.paramMap.subscribe({
      next : (value) =>{
          this.product = this.productsService.getProductById(value.get('id')!);
      },
    });
  }

  addToCart(){
    this.cartNumber++;
  }
  removeFromCart(){
    if(this.cartNumber > 0){
      this.cartNumber--;
    }
  }

  nextImage(){
    if(this.currentImageIndex != this.product.imageUrls.length - 1){
      this.currentImageIndex++;
    }
  }

  prevImage(){
    if(this.currentImageIndex != 0){
      this.currentImageIndex--;
    }
  }
}
