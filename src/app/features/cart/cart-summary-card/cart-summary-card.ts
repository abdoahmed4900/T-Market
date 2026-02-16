import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CartService } from '../../../shared/services/cart.service';
import { Product } from '../../../core/interfaces/product';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-cart-summary-card',
  imports: [CurrencyPipe, AsyncPipe,TranslatePipe],
  templateUrl: './cart-summary-card.html',
  styleUrl: './cart-summary-card.scss'
})
export class CartSummaryCard {
  cartProducts! : Observable<(Product & { quantity: number })[]>;

  totalPrice! : Observable<number>;

  cartService =inject(CartService);

  ngOnInit(): void {
    this.totalPrice = this.cartService.totalCartPrice$;
    this.cartProducts = this.cartService.getAllCartProducts();
  }
}
