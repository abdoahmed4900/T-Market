import { FirebaseErrorService } from '../../../../core/services/firebase.error.service';
import { Component, inject, input, model, signal } from '@angular/core';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ProductsService } from '../../../../shared/services/products.service';
import { CartService } from '../../../../shared/services/cart.service';
import { RouterLink } from "@angular/router";
import { Product } from '../../../../core/interfaces/product';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AnimateOnScroll } from '../../../../shared/animate-on-scroll';
import { DeletedProductOverlay } from "../../../../shared/components/deleted-product-overlay/deleted-product-overlay";
import { ToastService } from '../../../../shared/services/toast.service';
import { MatDialog } from '@angular/material/dialog';
import { CartProduct } from '../../cart.product';

@Component({
  selector: 'app-cart-card',
  imports: [CurrencyPipe, AsyncPipe, RouterLink, TranslateModule, AnimateOnScroll, DeletedProductOverlay],
  templateUrl: './cart-card.html',
  styleUrl: './cart-card.scss'
})
export class CartCard {
  product!: Observable<Product>;

  quantity = model.required<number>();

  productId = input.required<string>();

  cartProduct = model<CartProduct>();

  productService = inject(ProductsService);
  cartService = inject(CartService);
  translateService = inject(TranslateService);
  firebaseErrorService = inject(FirebaseErrorService);
  isLangEnglish = signal(this.translateService.currentLang == 'en')
  destroy$ = new Subject<void>();

  matDialog = inject(MatDialog);
  toastService = inject(ToastService);



  ngOnInit(): void {
    this.product = this.productService.getProductById(this.productId()!);
    this.translateService.onLangChange.pipe(takeUntil(this.destroy$)).subscribe((val) => {
      this.isLangEnglish.set(val.lang == 'en' ? true : false);
      console.log(`islang : ${this.isLangEnglish()}`);

    })
  }

  increaseQuantity() {
    this.quantity.update((val) => {
      this.cartService.updateProductNumberInCart(this.productId(), val + 1, this.cartProduct()!.price).pipe(takeUntil(this.destroy$)).subscribe(
        {
          next: (value) => {
            this.toastService.success(this.translateService.instant('SUCCESS_MESSAGES.CART_ITEM_INCREASED'));
          },
        }
      )

      return ++val;
    });
  }
  decreaseQuantity() {
    this.quantity.update((val) => {
      this.cartService.updateProductNumberInCart(this.productId(), val - 1, this.cartProduct()!.price).pipe(takeUntil(this.destroy$)).subscribe(
        {
          next: (value) => {
            this.toastService.success(this.translateService.instant('SUCCESS_MESSAGES.CART_ITEM_DECREASED'));
          },
        }
      )
      return --val;
    });
  }

  removeFromCart() {
    this.cartService.removeProductFromCart(this.productId(), this.cartProduct()!.price).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.toastService.success(this.translateService.instant('SUCCESS_MESSAGES.ITEM_REMOVED_FROM_CART'));
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
