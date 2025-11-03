import { Component, inject, input, model } from '@angular/core';
import { Product } from '../../../core/product';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { ProductsService } from '../../../core/products.service';
import { CartService } from '../../../core/cart.service';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-cart-card',
  imports: [CurrencyPipe, AsyncPipe, RouterLink],
  templateUrl: './cart-card.html',
  styleUrl: './cart-card.scss'
})
export class CartCard {
  product!: Observable<Product>;

  quantity = model.required<number>();

  productId = input.required<string>();

  cartProduct = model<(Product & { quantity: number })>();

  productService = inject(ProductsService);
  cartService = inject(CartService);
  
  ngOnInit(): void {
    this.product = this.productService.getProductById(this.productId()!);  
  }

  increaseQuantity(){
    this.quantity.update((val) => {
      this.cartService.updateProductNumberInCart(this.productId(),val + 1,this.cartProduct()!.price)
      console.log(this.productId());
      
      return ++val;
    });
  }
  decreaseQuantity(){
    this.quantity.update((val) => {
      this.cartService.updateProductNumberInCart(this.productId(),val - 1,this.cartProduct()!.price)
      return --val;
    });
  }

  removeFromCart(){
    this.cartService.removeProductFromCart(this.productId(),this.cartProduct()!.price);
  }
}
