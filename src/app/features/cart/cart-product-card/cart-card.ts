import { Component, inject, input, model, signal } from '@angular/core';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ProductsService } from '../../../shared/services/products.service';
import { CartService } from '../../../shared/services/cart.service';
import { RouterLink } from "@angular/router";
import { Product } from '../../../core/interfaces/product';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-cart-card',
  imports: [CurrencyPipe, AsyncPipe, RouterLink,TranslatePipe],
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
  translateService = inject(TranslateService);
  isLangEnglish = signal(this.translateService.getCurrentLang() == 'en')
  destroy$ = new Subject<void>();
  
  ngOnInit(): void {
    this.product = this.productService.getProductById(this.productId()!);  
    this.translateService.onLangChange.pipe(takeUntil(this.destroy$)).subscribe((val) => {
      this.isLangEnglish.set(val.lang == 'en' ? true : false);
      console.log(`islang : ${this.isLangEnglish()}`);
      
    })
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
