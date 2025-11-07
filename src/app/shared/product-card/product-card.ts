import { Component, inject, input } from '@angular/core';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Product } from '../../core/product';
import { CartService } from '../../core/cart.service';

@Component({
  selector: 'app-product-card',
  imports: [FaIconComponent, RouterLink,CommonModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss'
})
export class ProductCard {
  product = input<Product>();

  starIcon = faStar;

  root = document.getElementsByTagName('html')[0];

  cartService = inject(CartService);

  addToCart(productId:string,productPrice:number){
    this.cartService.addProductToCart(productId,productPrice,this.product()!.name);
  }
}
