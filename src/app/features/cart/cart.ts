import { Component, inject, OnInit, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { Loader } from "../../shared/loader/loader";
import { CartCard } from "./cart-card/cart-card";
import { CartService } from '../../core/cart.service';
import { Product } from '../../core/product';

@Component({
  selector: 'app-cart',
  imports: [AsyncPipe, Loader, CartCard,CurrencyPipe],
  templateUrl: './cart.html',
  styleUrl: './cart.scss'
})
export class CartComponent implements OnInit{
  products!: Observable<(Product & { quantity: number })[]>;

  cartService = inject(CartService);

  isLoaded  = signal<boolean>(false);

  totalPrice!: Observable<number>;
  ngOnInit(): void {
    this.products = this.cartService.getAllCartProducts();
    this.totalPrice = this.cartService.totalCartPrice$;
  }
}
