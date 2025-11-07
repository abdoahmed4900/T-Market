import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductsService } from '../../core/products.service';
import { CommonModule } from '@angular/common';
import { Loader } from "../loader/loader";
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { ReactiveFormsModule } from '@angular/forms';
import { Product } from '../../core/product';
import { map, Observable, tap } from 'rxjs';
import { CartService } from '../../core/cart.service';

@Component({
  selector: 'app-product-details',
  imports: [CommonModule, Loader, FaIconComponent,ReactiveFormsModule],
  templateUrl: './product-details.html',
  styleUrl: './product-details.scss'
})
export class ProductDetails {

  route = inject(ActivatedRoute);

  productsService = inject(ProductsService);
  cartService = inject(CartService);

  product!: Observable<Product>;

  cartNumber = 1;

  root = document.getElementsByTagName('html')[0];

  id = '';
  
  starIcon = faStar;

  currentImageIndex = 0;

  imagesNumber = 0;

  price!:number;

  isProductLoaded = signal<boolean>(false);

  name!:string;

  ngOnInit(){
    this.route.paramMap.subscribe({
      next : (value) =>{
          this.isProductLoaded.set(false)
          this.product = this.productsService.getProductById(value.get('id')!).pipe(
            map((p) => { 
              this.isProductLoaded.set(true); 
              console.log(this.isProductLoaded());
              return p;
            }),
            tap((p) => {this.imagesNumber = p.imageUrls.length;this.price = p.price; this.id = p.id!;this.name= p.name;})
          );
      },
    });
  }

  addToCart(){
    this.cartService.addProductToCart(this.id,this.price,this.name,this.cartNumber); 
  }

  increaseCartNumber(){
    this.cartNumber++;
  }
  decreaseCartNumber(){
    this.cartNumber--;
  }

  nextImage(){
    if(this.currentImageIndex != this.imagesNumber - 1){
      this.currentImageIndex++;
    }
  }

  prevImage(){
    if(this.currentImageIndex != 0){
      this.currentImageIndex--;
    }
  }
}
