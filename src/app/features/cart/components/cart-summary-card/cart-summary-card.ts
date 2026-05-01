import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CartService } from '../../../../shared/services/cart.service';
import { TranslateModule } from '@ngx-translate/core';
import { AnimateOnScroll } from '../../../../shared/animate-on-scroll';
import { CartProduct } from '../../cart.product';

@Component({
  selector: 'app-cart-summary-card',
  imports: [CurrencyPipe, AsyncPipe, TranslateModule, AnimateOnScroll],
  templateUrl: './cart-summary-card.html',
  styleUrl: './cart-summary-card.scss'
})
export class CartSummaryCard {
  cartProducts!: Observable<CartProduct[]>;

  totalPrice!: Observable<number>;

  cartService = inject(CartService);

  ngOnInit(): void {
    this.totalPrice = this.cartService.totalCartPrice$;
    this.cartProducts = this.cartService.products$
  }
}
