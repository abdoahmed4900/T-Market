import { Component, inject, OnInit, signal } from '@angular/core';
import { Observable, Subject, takeUntil, tap } from 'rxjs';
import { AsyncPipe, NgClass } from '@angular/common';
import { CartCard } from "./components/cart-product-card/cart-card";
import { CartService } from '../../shared/services/cart.service';
import { CartSummaryCard } from "./components/cart-summary-card/cart-summary-card";
import { RouterLink } from '@angular/router';
import { Product } from '../../core/interfaces/product';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { PaymentProgressBar } from "../../shared/components/payment-progress-bar/payment-progress-bar";
import { ProgressService } from '../../shared/components/payment-progress-bar/progress.service';
import { CartSkeleton } from "./components/cart-skeleton/cart-skeleton";
import { AnimateOnScroll } from "../../shared/animate-on-scroll";

@Component({
  selector: 'app-cart',
  imports: [AsyncPipe, CartCard, NgClass, CartSummaryCard, RouterLink, TranslatePipe, PaymentProgressBar, CartSkeleton, AnimateOnScroll],
  templateUrl: './cart.html',
  styleUrl: './cart.scss'
})
export class CartComponent implements OnInit{
  cartService = inject(CartService);
  progressService = inject(ProgressService);
  translateService = inject(TranslateService);
  destroy$ = new Subject<void>();
  
  products: Observable<(Product & { quantity: number })[]> = this.cartService.getAllCartProducts();

  isLoaded  = signal<boolean>(false);
  isEnglish = signal(localStorage.getItem('language') == 'en');

  totalPrice!: Observable<number>;
  ngOnInit(): void {
    this.products = this.cartService.getAllCartProducts().pipe(
      tap(() => {
        setTimeout(() => {
          this.isLoaded.set(true);
        },1500)
      })
    );
    this.totalPrice = this.cartService.totalCartPrice$;
    this.progressService.reset();
    this.translateService.onLangChange.pipe(takeUntil(this.destroy$)).subscribe(
      {
        next : (value) =>{
          this.isEnglish.set(value.lang == 'en');
        },
      }
    )
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
