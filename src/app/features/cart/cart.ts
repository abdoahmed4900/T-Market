import { Component, inject, OnInit, signal } from '@angular/core';
import { Observable, Subject, takeUntil, tap } from 'rxjs';
import { AsyncPipe, CurrencyPipe, NgClass } from '@angular/common';
import { CartCard } from "./components/cart-product-card/cart-card";
import { CartService } from '../../shared/services/cart.service';
import { CartSummaryCard } from "./components/cart-summary-card/cart-summary-card";
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PaymentProgressBar } from "../../shared/components/payment-progress-bar/payment-progress-bar";
import { ProgressService } from '../../shared/components/payment-progress-bar/progress.service';
import { CartSkeleton } from "./components/cart-skeleton/cart-skeleton";
import { AnimateOnScroll } from "../../shared/animate-on-scroll";
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faBox,
  faCartShopping,
  faCreditCard,
  faShoppingBag,
  faShoppingCart,
  faStore,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-cart',
  imports: [AsyncPipe, CartCard, NgClass, CartSummaryCard, RouterLink, TranslateModule, PaymentProgressBar, CartSkeleton, AnimateOnScroll, FaIconComponent, CurrencyPipe],
  templateUrl: './cart.html',
  styleUrl: './cart.scss'
})
export class CartComponent implements OnInit {
  progressService = inject(ProgressService);
  translateService = inject(TranslateService);
  destroy$ = new Subject<void>();
  private cartService = inject(CartService);
  products$ = this.cartService.products$;

  isLoaded = signal<boolean>(false);

  totalPrice!: Observable<number>;
  totalItems = this.cartService.totalCartProductsNumber$;

  checkoutIcon = faCreditCard;
  emptyCartIcon = faCartShopping;
  shopIcon = faShoppingBag;
  private translate = inject(TranslateService);

  // Icons
  cartIcon = faShoppingCart;
  brandIcon = faStore;
  trashIcon = faTrashCan;
  itemsIcon = faBox;
  arrowIcon = faArrowRight;
  // Data streams

  getArrowIcon() {
    return this.translate.currentLang === 'ar' ? faArrowLeft : faArrowRight;
  }

  clearCart() {
    this.cartService.clearCart();
  }

  // Check if current language is English (for RTL adjustments)
  isEnglish = signal((localStorage.getItem('language') || 'en') == 'en')
  ngOnInit(): void {
    this.isLoaded.set(false);
    this.cartService.getAllCartProducts().pipe(takeUntil(this.destroy$), tap(() => {
      setTimeout(() => { this.isLoaded.set(true); }, 1500)
    })).subscribe()
    this.cartService.verifyProductsSnapshot().pipe(takeUntil(this.destroy$)).subscribe()
    this.totalPrice = this.cartService.totalCartPrice$;
    this.progressService.reset();
    this.translateService.onLangChange.pipe(takeUntil(this.destroy$)).subscribe((val) => {
      this.isEnglish.set(val.lang == 'en')
    })
    this.progressService.goToFirstStep();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
