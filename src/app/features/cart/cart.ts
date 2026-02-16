import { Component, inject, OnInit, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AsyncPipe, NgClass } from '@angular/common';
import { Loader } from "../../shared/components/loader/loader";
import { CartCard } from "./cart-product-card/cart-card";
import { CartService } from '../../shared/services/cart.service';
import { CartSummaryCard } from "./cart-summary-card/cart-summary-card";
import { RouterLink } from '@angular/router';
import { Product } from '../../core/interfaces/product';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-cart',
  imports: [AsyncPipe, Loader, CartCard, NgClass, CartSummaryCard,RouterLink,TranslatePipe],
  templateUrl: './cart.html',
  styleUrl: './cart.scss'
})
export class CartComponent implements OnInit{
  cartService = inject(CartService);
  
  products: Observable<(Product & { quantity: number })[]> = this.cartService.getAllCartProducts();

  isLoaded  = signal<boolean>(false);

  totalPrice!: Observable<number>;
  ngOnInit(): void {
    this.products = this.cartService.getAllCartProducts().pipe(
      tap(() => {
        this.isLoaded.set(true);
      })
    );
    this.totalPrice = this.cartService.totalCartPrice$;
  }
}
